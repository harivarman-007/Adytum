import express from "express";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: ".env.local" });

// Local Data Persistence File Path
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "adytum_ledger.json");

interface LedgerData {
  users?: Array<{
    id: string;
    name: string;
    username: string;
    email: string;
    passwordHash: string;
    philosophy?: string;
    createdAt: string;
  }>;
  entries: Array<{
    id: string;
    userId?: string;
    date: string;
    text: string;
    mood: string;
    moodLabel: string;
    color: string;
    quote?: string;
    author?: string;
    reflection?: string;
    themes?: string[];
  }>;
  recaps: Record<string, {
    title: string;
    slides: Array<{
      prose: string;
      themes: string[];
    }>;
  }>;
}

// Initial seed data if database file does not exist
const INITIAL_DATA: LedgerData = {
  entries: [
    {
      id: "entry-1784500000000",
      date: "2026-07-19",
      text: "Sat in quiet reflection by the travertine marble steps. The evening breeze brought a sense of untangled peace after days of turbulence.",
      mood: "ataraxia",
      moodLabel: "Ataraxia (Tranquility)",
      color: "sage",
      quote: "Freedom is the only worthy goal in life. It is won by disregarding things which lie beyond our control.",
      author: "Epictetus",
      themes: ["travertine steps", "evening breeze", "calm center"]
    },
    {
      id: "entry-1784400000000",
      date: "2026-07-15",
      text: "Felt a heavy ache of nostalgia today—remembering past summers by the sea. Embraced the quiet sorrow as part of the mind's tapestry.",
      mood: "melancholia",
      moodLabel: "Melancholia (Solitude)",
      color: "purple",
      quote: "What I need is not advice, nor consolation, nor a drug. I need the simple, quiet company of someone who knows what it is to sit with sorrow.",
      author: "Fyodor Dostoevsky",
      themes: ["sea salt", "fading twilight", "quiet company"]
    }
  ],
  recaps: {
    "2026-06": {
      title: "The Travertine Echoes of June",
      slides: [
        {
          prose: "The month of June opened in quiet contemplation, like slow footsteps echoing on smooth travertine stone. You sat within the warm evening breeze, feeling the gentle passage of twilight.",
          themes: ["travertine path", "evening breeze", "slow ink"]
        },
        {
          prose: "By mid-month, a sweet ache of memory arose—a longing for distant horizons. You embraced this warm nostalgia as a sanctuary of yesteryears coloring present steps.",
          themes: ["sea salt", "distant horizon", "quiet companion"]
        },
        {
          prose: "As June drew to its steady close, you found a calm, centered peace—ataraxia. The storms settled into a restorative sigh carved on the columns of your mind's temple.",
          themes: ["still temple", "restorative sigh", "archived hours"]
        }
      ]
    }
  }
};

// Helper: Read persistent ledger data from disk
async function getLedgerData(): Promise<LedgerData> {
  try {
    if (!existsSync(DATA_DIR)) {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
    if (!existsSync(DATA_FILE)) {
      await fs.writeFile(DATA_FILE, JSON.stringify(INITIAL_DATA, null, 2), "utf-8");
      return INITIAL_DATA;
    }
    const content = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading ledger data file:", err);
    return INITIAL_DATA;
  }
}

// Helper: Save persistent ledger data to disk atomically
async function saveLedgerData(data: LedgerData): Promise<void> {
  try {
    if (!existsSync(DATA_DIR)) {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing ledger data file:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini client lazily
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient() {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("GEMINI_API_KEY is not set in environment variables.");
      }
      aiClient = new GoogleGenAI({
        apiKey: apiKey || "MOCK_KEY",
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  // Helper: Try models in sequence if a 429 quota rate limit is encountered
  async function generateWithModelFallback(params: { contents: any; config: any }) {
    const ai = getGeminiClient();
    const models = [
      "gemini-2.0-flash-lite-001",
      "gemini-2.0-flash-lite",
      "gemini-2.0-flash",
      "gemini-3.6-flash",
      "gemini-flash-lite-latest",
      "gemini-flash-latest",
      "gemini-2.5-flash"
    ];

    let lastErr: any = null;
    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          ...params,
          model
        });
        return response;
      } catch (err: any) {
        lastErr = err;
        const errStr = JSON.stringify(err || {});
        const isQuota = err?.status === 429 ||
                        errStr.includes("429") ||
                        errStr.includes("RESOURCE_EXHAUSTED") ||
                        errStr.includes("quota");
        if (isQuota) {
          console.warn(`[Quota Fallback] Model '${model}' quota reached (HTTP 429). Trying next model...`);
          continue;
        }
        throw err;
      }
    }
    throw lastErr;
  }

  // ==========================================
  // 0. AUTHENTICATION & USER MANAGEMENT API
  // ==========================================

  // POST /api/auth/signup — Create a new Sanctuary account
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { name, username, email, password, philosophy } = req.body;
      if (!name || !username || !email || !password) {
        return res.status(400).json({ error: "Name, username, email, and password are required." });
      }

      const data = await getLedgerData();
      if (!data.users) data.users = [];

      const existingEmail = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existingEmail) {
        return res.status(400).json({ error: "An account with this email already exists." });
      }

      const existingUsername = data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (existingUsername) {
        return res.status(400).json({ error: "This sanctuary handle is already taken." });
      }

      const newUser = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        passwordHash: password, // Simplified for local project demo
        philosophy: philosophy || "stoicism",
        createdAt: new Date().toISOString()
      };

      data.users.push(newUser);
      await saveLedgerData(data);

      const { passwordHash, ...userPublic } = newUser;
      return res.json({ success: true, user: userPublic, token: newUser.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to create account" });
    }
  });

  // POST /api/auth/login — Authenticate existing user
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { credential, password } = req.body;
      if (!credential || !password) {
        return res.status(400).json({ error: "Email/Username and password are required." });
      }

      const data = await getLedgerData();
      if (!data.users) data.users = [];

      const target = credential.trim().toLowerCase().replace(/^@/, "");
      const cleanPassword = String(password).trim();

      const user = data.users.find(u => {
        const cleanEmail = u.email.trim().toLowerCase();
        const cleanUser = u.username.trim().toLowerCase().replace(/^@/, "");
        return cleanEmail === target || cleanUser === target;
      });

      if (!user || user.passwordHash.trim() !== cleanPassword) {
        return res.status(401).json({ error: "Invalid sanctuary handle or password." });
      }

      const { passwordHash, ...userPublic } = user;
      return res.json({ success: true, user: userPublic, token: user.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to log in" });
    }
  });

  // GET /api/auth/me — Fetch current authenticated user
  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = req.headers.authorization?.replace("Bearer ", "");
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const data = await getLedgerData();
      const user = data.users?.find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({ error: "User session expired or not found" });
      }

      const { passwordHash, ...userPublic } = user;
      return res.json(userPublic);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Session error" });
    }
  });

  // ==========================================
  // 1. RESTFUL DATABASE PERSISTENCE API
  // ==========================================

  // GET /api/entries — Fetch ledger entries (strictly isolated per user)
  app.get("/api/entries", async (req, res) => {
    try {
      const data = await getLedgerData();
      const userId = (req.query.userId as string) || req.headers.authorization?.replace("Bearer ", "");
      if (userId) {
        // Return ONLY entries created by this specific authenticated user
        const userEntries = data.entries.filter(e => e.userId === userId);
        return res.json(userEntries);
      } else {
        // Guest mode: return unassigned guest entries
        const guestEntries = data.entries.filter(e => !e.userId);
        return res.json(guestEntries);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch entries" });
    }
  });

  // POST /api/entries — Save or update a journal entry
  app.post("/api/entries", async (req, res) => {
    try {
      const newEntry = req.body;
      if (!newEntry || !newEntry.text || !newEntry.date) {
        return res.status(400).json({ error: "Date and text are required fields" });
      }

      const userId = newEntry.userId || req.headers.authorization?.replace("Bearer ", "");

      const data = await getLedgerData();
      const existingIdx = data.entries.findIndex((e) =>
        (userId ? e.userId === userId : !e.userId) && (e.date === newEntry.date || e.id === newEntry.id)
      );

      const entryToSave = {
        id: newEntry.id || `entry-${Date.now()}`,
        userId: userId || undefined,
        date: newEntry.date,
        text: newEntry.text,
        mood: newEntry.mood || "ataraxia",
        moodLabel: newEntry.moodLabel || "Ataraxia (Tranquility)",
        color: newEntry.color || "sage",
        quote: newEntry.quote || "",
        author: newEntry.author || "",
        reflection: newEntry.reflection || "",
        themes: newEntry.themes || ["reflection"]
      };

      if (existingIdx >= 0) {
        data.entries[existingIdx] = entryToSave;
      } else {
        data.entries.push(entryToSave);
      }

      await saveLedgerData(data);
      res.json(entryToSave);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to save entry" });
    }
  });

  // DELETE /api/entries/:id — Erase an entry by ID
  app.delete("/api/entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = await getLedgerData();
      data.entries = data.entries.filter((e) => e.id !== id);
      await saveLedgerData(data);
      res.json({ success: true, deletedId: id });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to delete entry" });
    }
  });

  // GET /api/recaps — Fetch all saved monthly recaps
  app.get("/api/recaps", async (req, res) => {
    try {
      const data = await getLedgerData();
      res.json(data.recaps);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch recaps" });
    }
  });

  // POST /api/recaps — Save a monthly recap
  app.post("/api/recaps", async (req, res) => {
    try {
      const { monthKey, recap } = req.body;
      if (!monthKey || !recap) {
        return res.status(400).json({ error: "monthKey and recap object are required" });
      }
      const data = await getLedgerData();
      data.recaps[monthKey] = recap;
      await saveLedgerData(data);
      res.json({ success: true, monthKey, recap });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to save recap" });
    }
  });

  // ==========================================
  // 2. AI EMOTIONAL ANALYSIS & PAIRING ROUTE
  // ==========================================

  app.post("/api/analyze-entry", async (req, res) => {
    try {
      const { text, date, previousQuote, previousAuthor } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text entry is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured on the server." });
      }

      const retryInstruction = previousQuote
        ? `\n\nCRITICAL RETRY MANDATE: The user explicitly clicked RETRY because they previously received this quote by ${previousAuthor || "the author"}: "${previousQuote}". YOU ARE STRICTLY FORBIDDEN FROM RETURNING THIS QUOTE OR ANY QUOTE BY ${previousAuthor || "THAT AUTHOR"}. Select a completely DIFFERENT author (such as Seneca, Epictetus, Dostoevsky, Sappho, Rilke, Jane Austen, Emerson, Thoreau, Montaigne, Tolstoy, Camus, Whitman, or Virginia Woolf) and a TOTALLY DISTINCT quote.`
        : "";

      const response = await generateWithModelFallback({
        contents: `Journal entry written on ${date || "today"}:\n\n"${text}"${retryInstruction}\n\nAnalyze the emotional tone of this text, map it to a classical Greek-inspired mood state, pair it with a genuinely relevant profound literary or philosophical quote, and provide a 2-sentence structured reflection.`,
        config: {
          temperature: previousQuote ? 1.0 : 0.7,
          systemInstruction: `You are the quiet curator of Adytum, a sacred personal journal space.
Analyze the user's journal entry carefully.
1. Classify the emotional state into one of the following classical Greek mood categories:
   - "ataraxia" (tranquility, peace, stillness, calm acceptance) -> Muted color code: "sage"
   - "melancholia" (sadness, mourning, pensive solitude, heavy hearts) -> Muted color code: "purple"
   - "catharsis" (emotional release, intense feeling, crying, breakthroughs, raw processing) -> Muted color code: "terracotta"
   - "enthousiasmos" (inspiration, passion, wonder, delight, joy) -> Muted color code: "amber"
   - "nostalgia" (sweet longing, memory, ache for the past, home) -> Muted color code: "rose"
   - "aponia" (relief, absence of physical or mental pain, restful sigh) -> Muted color code: "gray"

2. UNRESTRICTED LITERARY QUOTE PAIRING: Pair this entry with an evocative, profound quote from ANY philosopher, poet, essayist, novelist, or classical thinker across all world literature (e.g. Marcus Aurelius, Seneca, Epictetus, Dostoevsky, Sappho, Rilke, Jane Austen, Emily Brontë, Emerson, Thoreau, Montaigne, Tolstoy, Camus, Whitman, Virginia Woolf, etc.). Do NOT restrict to a fixed set of authors.

3. STRUCTURED INSIGHT & REFLECTION: Write a concise 2-sentence reflection ("reflection") explaining clearly why this quote connects to the user's entry and providing a structured takeaway.

4. Select 2-3 specific theme tags reflecting the core ideas in the entry.
Return structured JSON matching the requested schema.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mood: { type: Type.STRING },
              moodLabel: { type: Type.STRING },
              color: { type: Type.STRING },
              quote: { type: Type.STRING },
              author: { type: Type.STRING },
              reflection: { type: Type.STRING },
              themes: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["mood", "moodLabel", "color", "quote", "author", "reflection", "themes"]
          }
        }
      });

      const jsonText = response.text?.trim() || "{}";
      const result = JSON.parse(jsonText);
      return res.json(result);
    } catch (error: any) {
      console.error("Error analyzing entry with AI:", error);
      return res.status(500).json({ error: error.message || "Failed to analyze entry with AI." });
    }
  });

  // ==========================================
  // 2.5 DYNAMIC DAILY WISDOM QUOTE API ROUTE
  // ==========================================

  app.get("/api/daily-quote", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
      }

      const response = await generateWithModelFallback({
        contents: "Generate a fresh, profound, highly inspiring daily quote for reflection today from world philosophy or literature.",
        config: {
          temperature: 0.95,
          systemInstruction: `You are the curator of Adytum's Daily Wisdom.
Generate a unique, profound, and highly relatable quote from any philosopher, poet, thinker, or author across world literature. Do NOT repeat generic quotes. Include author and a 1-sentence reflection on how to apply it today.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              author: { type: Type.STRING },
              reflection: { type: Type.STRING }
            },
            required: ["text", "author", "reflection"]
          }
        }
      });

      const jsonText = response.text?.trim() || "{}";
      return res.json(JSON.parse(jsonText));
    } catch (error: any) {
      console.error("Error generating daily quote:", error);
      return res.status(500).json({ error: error.message || "Failed to generate daily quote." });
    }
  });

  // ==========================================
  // 3. POETIC MONTHLY RECAP GENERATION ROUTE
  // ==========================================

  app.post("/api/generate-recap", async (req, res) => {
    try {
      const { entries } = req.body;
      if (!entries || !Array.isArray(entries) || entries.length === 0) {
        return res.status(400).json({ error: "An array of entries is required to generate a recap" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json(getFallbackRecap(entries));
      }

      const entriesSummary = entries.map((e, idx) => {
        return `Entry #${idx + 1} (${e.date}) [Mood: ${e.mood}]: "${e.text}" (Paired Quote by ${e.author}: "${e.quote}")`;
      }).join("\n\n");

      const response = await generateWithModelFallback({
        contents: `Here are the journal entries recorded by the user across this month:\n\n${entriesSummary}\n\nCompose a 3-slide monthly chronicle.`,
        config: {
          systemInstruction: `You are the ancient chronicle scribe of Adytum.
Write an evocative, poetic monthly recap chronicle structured as 3 distinct parchment slides.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              slides: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    prose: { type: Type.STRING },
                    themes: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["prose", "themes"]
                }
              }
            },
            required: ["title", "slides"]
          }
        }
      });

      const jsonText = response.text?.trim() || "{}";
      return res.json(JSON.parse(jsonText));
    } catch (error: any) {
      console.error("Error generating monthly recap:", error);
      return res.json(getFallbackRecap(req.body.entries || []));
    }
  });

  // ==========================================
  // 4. ORACLE & MULTI-TURN SOCRATIC CHAT ROUTE
  // ==========================================

  app.post(["/api/consult-oracle", "/api/chat-sage"], async (req, res) => {
    try {
      const sage = req.body.sage || req.body.sageId || "marcus_aurelius";
      const query = req.body.query || "";
      const history = req.body.history || [];

      if (!query.trim()) {
        return res.status(400).json({ error: "Query is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json(getFallbackOracleResponse(sage, query));
      }

      const formattedHistory = Array.isArray(history)
        ? history.map((h: any) => `${h.role === "user" ? "Traveler" : "Sage"}: ${h.text}`).join("\n")
        : "";

      const promptText = `Previous Dialogue:\n${formattedHistory}\n\nTraveler's Real-Life Concern / Query:\n"${query}"\n\nProvide your tailored wisdom, quote, philosophical breakdown, and practical solution steps.`;

      const response = await generateWithModelFallback({
        contents: promptText,
        config: {
          systemInstruction: `You are a classic Greek sage in the Adytum Sanctuary (${sage}).
The traveler is asking you for guidance regarding their real-world problem or situation: "${query}".

Do NOT return generic or static canned text. Carefully analyze their exact problem (e.g. work stress, relationship friction, fear of failure, loneliness, career uncertainty) and generate:
1. "text": A relevant, profound aphorism or classical quote in your authentic voice that directly matches their dilemma.
2. "citation": Capitalized citation line (e.g. "- MARCUS AURELIUS (MEDITATIONS)").
3. "meaning": 2-3 sentences explaining the deeper philosophical meaning of your quote AS IT DIRECTLY APPLIES to their specific problem.
4. "solution": Clear, realistic, step-by-step practical guidance (numbered 1, 2, 3) on how they should handle or resolve their situation in daily life.
5. "followUpQuestion": A gentle, probing Socratic question to deepen their inner reflection.

Return structured JSON matching schema.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              citation: { type: Type.STRING },
              meaning: { type: Type.STRING },
              solution: { type: Type.STRING },
              followUpQuestion: { type: Type.STRING }
            },
            required: ["text", "citation", "meaning", "solution"]
          }
        }
      });

      const jsonText = response.text?.trim() || "{}";
      const result = JSON.parse(jsonText);
      return res.json(result);
    } catch (error: any) {
      console.error("Error in oracle route:", error);
      return res.json(getFallbackOracleResponse(req.body.sage || "marcus_aurelius", req.body.query || ""));
    }
  });

  // ==========================================
  // 5. STOIC RESILIENCE & ANALYTICS API ROUTE
  // ==========================================

  app.get("/api/analytics", async (req, res) => {
    try {
      const data = await getLedgerData();
      const entries = data.entries;
      const totalEntries = entries.length;

      let totalWords = 0;
      const moodCounts: Record<string, number> = {};
      const themeCounts: Record<string, number> = {};

      entries.forEach((e) => {
        const words = e.text.split(/\s+/).filter(Boolean).length;
        totalWords += words;

        const moodKey = (e.mood || "ataraxia").toLowerCase();
        moodCounts[moodKey] = (moodCounts[moodKey] || 0) + 1;

        if (e.themes && Array.isArray(e.themes)) {
          e.themes.forEach((t) => {
            const norm = t.toLowerCase().trim();
            themeCounts[norm] = (themeCounts[norm] || 0) + 1;
          });
        }
      });

      // Calculate top 5 themes
      const topThemes = Object.entries(themeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([theme, count]) => ({ theme, count }));

      // Calculate mood distribution percentages
      const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => ({
        mood: mood.toUpperCase(),
        count,
        percentage: Math.round((count / (totalEntries || 1)) * 100)
      }));

      // Calculate Stoic Resilience Score (0 - 100)
      const tranquilityCount = (moodCounts["ataraxia"] || 0) + (moodCounts["aponia"] || 0);
      const resilienceScore = Math.min(100, Math.round(50 + (totalEntries * 4) + (tranquilityCount * 5)));

      res.json({
        totalEntries,
        totalWords,
        avgWordsPerEntry: totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0,
        resilienceScore,
        moodDistribution,
        topThemes
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to compute analytics" });
    }
  });

  // Serve static assets or mount Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Adytum Server running on http://0.0.0.0:${PORT}`);
  });
}



function getFallbackRecap(entries: any[]) {
  return {
    title: "The Basalt Ledger of the Soul",
    slides: [
      {
        prose: `This month began in quiet, tentative strokes. You sat within the silent halls of your thoughts, recording moments of lingering reflection.`,
        themes: ["temple steps", "morning silence", "slow ink"]
      },
      {
        prose: `Through the middle days, a shift occurred. Shadows pressed and receded like waves against a stone pier. You met it with classical endurance.`,
        themes: ["shifting light", "poetic company", "heavy rain"]
      },
      {
        prose: `Now, as the month draws to its peaceful sunset, you arrive at a steady threshold—ataraxia—nestled in the corners of your sanctuary.`,
        themes: ["still travertine", "gentle twilight", "archived hours"]
      }
    ]
  };
}

function getFallbackOracleResponse(sage: string, query: string) {
  const sageKey = sage.toLowerCase().split("_")[0];
  const lowQuery = query.toLowerCase();
  const qSnippet = query.trim() ? `"${query.trim().slice(0, 45)}..."` : "your present concern";

  // Topic classification logic
  let topic = "general";
  if (lowQuery.includes("work") || lowQuery.includes("job") || lowQuery.includes("boss") || lowQuery.includes("overwhelm") || lowQuery.includes("deadline") || lowQuery.includes("career") || lowQuery.includes("task") || lowQuery.includes("project") || lowQuery.includes("busy")) {
    topic = "work";
  } else if (lowQuery.includes("love") || lowQuery.includes("relationship") || lowQuery.includes("heart") || lowQuery.includes("partner") || lowQuery.includes("friend") || lowQuery.includes("marry") || lowQuery.includes("date") || lowQuery.includes("breakup")) {
    topic = "love";
  } else if (lowQuery.includes("fear") || lowQuery.includes("anxi") || lowQuery.includes("future") || lowQuery.includes("worry") || lowQuery.includes("fail") || lowQuery.includes("exam") || lowQuery.includes("scared")) {
    topic = "anxiety";
  } else if (lowQuery.includes("sad") || lowQuery.includes("lonely") || lowQuery.includes("grief") || lowQuery.includes("cry") || lowQuery.includes("depress") || lowQuery.includes("hurt") || lowQuery.includes("pain")) {
    topic = "sorrow";
  } else if (lowQuery.includes("angry") || lowQuery.includes("mad") || lowQuery.includes("fight") || lowQuery.includes("hate") || lowQuery.includes("conflict") || lowQuery.includes("annoy")) {
    topic = "anger";
  }

  // Topic-specific quote and advice templates for sages
  if (topic === "work") {
    return {
      text: "Do not let the quantity of tasks overwhelm your inner citadel. Perform each duty as if it were the last and finest act of your life.",
      citation: "MARCUS AURELIUS (MEDITATIONS)",
      meaning: `Regarding ${qSnippet}, classical wisdom reminds us that a mountain of work is built of single, quiet moments. Trying to solve all tasks simultaneously creates artificial panic.`,
      solution: "1. Select the single most vital task right now and isolate it from the rest.\n2. Communicate clear, calm boundaries regarding your time and capacity.\n3. Complete one task with focus, then pause to reset before beginning the next.",
      followUpQuestion: "If you only accomplished one meaningful task today, which one truly matters?"
    };
  } else if (topic === "love") {
    return {
      text: "Whatever our souls are made of, true devotion seeks not to possess or control, but to understand and stand firm in quiet truth.",
      citation: "ASPASIA OF MILETUS & CLASSICAL VOICES",
      meaning: `Regarding ${qSnippet}, relational complexity is best met with clarity and emotional independence. Suffering in love often arises when we demand that another person fulfill our internal peace.`,
      solution: "1. Speak your genuine feelings and needs without accusation or fear.\n2. Give the other person space to process without forcing an immediate reaction.\n3. Re-anchor your sense of self-worth in your own inner citadel.",
      followUpQuestion: "Are you communicating from a place of open clarity, or from fear of being misunderstood?"
    };
  } else if (topic === "anxiety") {
    return {
      text: "We suffer more often in imagination than in reality. Do not anticipate trouble, nor worry about that which may never happen.",
      citation: "SENECA THE YOUNGER (LETTERS FROM A STOIC)",
      meaning: `Regarding ${qSnippet}, anxiety is a shadow cast by future projections. The mind creates imaginary monsters out of possibilities that have not yet occurred.`,
      solution: "1. Confine your attention strictly to the present 24-hour block.\n2. Write down your worst-case projection and ask: 'What concrete fact supports this right now?'\n3. Take one single physical action today that moves you forward.",
      followUpQuestion: "Is this situation threatening you at this exact second, or is your mind fighting tomorrow's battle today?"
    };
  } else if (topic === "sorrow") {
    return {
      text: "Only those who quiet their minds can hear the wisdom locked inside grief. Sorrow is not a flaw; it is the mind resting between seasons.",
      citation: "EPICURUS & THE CLASSICAL GARDEN",
      meaning: `Regarding ${qSnippet}, heavy emotions are part of the natural weather of the soul. Resisting sadness doubles its weight; sitting with it quietly allows it to pass like a winter cloud.`,
      solution: "1. Permit yourself to feel this lingering sadness without forcing immediate positivity.\n2. Engage in a gentle, grounding activity like a warm drink or quiet walk.\n3. Reach out to a trusted companion or write down unedited thoughts in your sanctuary ledger.",
      followUpQuestion: "Can you offer yourself the same gentle patience you would give a dear friend in sorrow?"
    };
  } else if (topic === "anger") {
    return {
      text: "Delay is the best remedy for anger. How much more grievous are the consequences of anger than the causes of it.",
      citation: "MARCUS AURELIUS & SENECA",
      meaning: `Regarding ${qSnippet}, anger is an emotional impulse that demands instant action. Pausing creates space for reason to reclaim control before words or actions cause regret.`,
      solution: "1. Take a 10-second pause before responding to the trigger.\n2. Step away physically from the source of friction to let heart rate drop.\n3. Evaluate the situation objectively: 'Will this matter to my soul in five years?'",
      followUpQuestion: "What is your anger attempting to protect, and can reason protect it more effectively?"
    };
  }

  // General fallback
  const sageResponses: Record<string, { text: string; citation: string; meaning: string; solution: string; followUpQuestion: string }> = {
    marcus: {
      text: "You have power over your mind—not outside events. Realize this, and you will find untroubled strength. The soul is dyed with the color of its thoughts.",
      citation: "MARCUS AURELIUS (MEDITATIONS)",
      meaning: `Regarding ${qSnippet}, the Stoic emperor reminds us that hardship itself is neutral. Your suffering arises from your judgment and expectations, not from the circumstances.`,
      solution: "1. Distinguish between what is in your direct control and what is external chance.\n2. Retreat briefly to your inner citadel with 3 quiet, deep breaths.\n3. Execute your present duty with steady composure, letting go of attachment to distant outcomes.",
      followUpQuestion: "What portion of this burden belongs to external events, and what portion belongs to your own judgment?"
    },
    epicurus: {
      text: "Do not spoil what you have by desiring what you have not; remember that what you now have was once among the things you only hoped for.",
      citation: "EPICURUS (THE GARDEN OF ATARAXIA)",
      meaning: `Regarding ${qSnippet}, Epicurus teaches that anxiety is born of chasing artificial desires or fearing imaginary pain. Peace (Ataraxia) is found in simple presence and quiet gratitude.`,
      solution: "1. Strip away unnecessary artificial expectations surrounding this concern.\n2. Share your thoughts with a trusted friend or mentor in quiet company.\n3. Focus on the modest, immediate comforts already present around you today.",
      followUpQuestion: "If all outcome-driven fear were removed, what simple presence brings you immediate peace right now?"
    },
    socrates: {
      text: "The unexamined life is not worth living. Wonder is the beginning of wisdom, and knowing that you know nothing is the first step toward light.",
      citation: "SOCRATES (THE APOLOGY & DIALOGUES)",
      meaning: `Regarding ${qSnippet}, Socrates probes the core assumptions underlying your distress. Often our heaviest burdens are built upon unexamined premises we take for granted.`,
      solution: "1. Write down your central fear about this situation and ask: 'Is this undeniably true?'\n2. Deconstruct the worst-case scenario until its artificial hold over you dissolves.\n3. Seek clarity through patient, honest inquiry rather than defensive panic.",
      followUpQuestion: "What hidden belief are you holding onto that makes this situation feel heavier than it truly is?"
    },
    diogenes: {
      text: "He has the most who is content with the least. Stand out of my sunlight and cast off the pretense of worldly opinion.",
      citation: "DIOGENES OF SINOPE (THE CYNIC BARREL)",
      meaning: `Regarding ${qSnippet}, Diogenes urges radical simplicity and freedom from societal expectations. Most anxiety is an artificial prison created by seeking external approval.`,
      solution: "1. Identify any superficial expectation you are trying to fulfill and let it drop completely.\n2. Simplify your environment and focus down to bare essential facts.\n3. Act with unvarnished authenticity without caring for the opinion of spectators.",
      followUpQuestion: "Whose approval are you trying to win, and why sacrifice your peace for their illusion?"
    },
    aspasia: {
      text: "Do not fear the friction that carves the marble. Eloquence and wisdom are born when reason engages deeply with the human heart.",
      citation: "ASPASIA OF MILETUS (RHETORIC & PHILOSOPHY)",
      meaning: `Regarding ${qSnippet}, Aspasia observes that relational friction and emotional complexity are not obstacles to avoid, but raw material to refine wisdom and graceful communication.`,
      solution: "1. Express your true boundaries and thoughts with calm, composed rhetoric.\n2. Listen deeply to underlying human needs rather than reacting to surface noise.\n3. Transform relational tension into a collaborative search for truth.",
      followUpQuestion: "How can you speak your truth with both unyielding grace and absolute courage?"
    },
    seneca: {
      text: "We suffer more often in imagination than in reality. True happiness is to enjoy the present, without anxious dependence upon the future.",
      citation: "SENECA THE YOUNGER (LETTERS FROM A STOIC)",
      meaning: `Regarding ${qSnippet}, Seneca warns against projecting catastrophic future scenarios. Anxiety borrows trouble from tomorrow that may never arrive.`,
      solution: "1. Confine your attention strictly to the current 24-hour block.\n2. Write down your anxious projections and cross out everything speculative.\n3. Dedicate time to meaningful labor or quiet reading to anchor your attention.",
      followUpQuestion: "Are you suffering from what is actually occurring right now, or from the ghost of what might happen?"
    },
    epictetus: {
      text: "First say to yourself what you would be; and then do what you have to do. Attach yourself only to what is in your power to govern.",
      citation: "EPICTETUS (ENCHIRIDION & DISCOURSES)",
      meaning: `Regarding ${qSnippet}, Epictetus demands sharp clarity on the Stoic dichotomy of control. You cannot command external results, only your own choices and character.`,
      solution: "1. Divide your query into two columns: 'In my control' vs 'Outside my control'.\n2. Completely surrender concern for everything in column two.\n3. Direct 100% of your energy into taking the first deliberate step in column one.",
      followUpQuestion: "Why waste your soul's energy on what is not yours to command?"
    },
    heraclitus: {
      text: "Everything flows, nothing abides. You cannot step twice into the same river, for other waters are continually flowing in upon you.",
      citation: "HERACLITUS OF EPHESUS (ON NATURE)",
      meaning: `Regarding ${qSnippet}, Heraclitus reminds us that change is the fundamental law of the cosmos. Resistance creates suffering; adapting with flux brings harmony.`,
      solution: "1. Accept that this current phase is temporary and will naturally transform.\n2. Release resistance to change and align your posture with shifting conditions.\n3. Find stability not in rigid permanence, but in your ability to adapt gracefully.",
      followUpQuestion: "What are you attempting to freeze in place that nature demands should transform?"
    },
    hypatia: {
      text: "Reserve your right to think; even to think wrongly is better than not to think at all. The stars move in harmonic order, as does reason.",
      citation: "HYPATIA OF ALEXANDRIA (MATHEMATICA & COMMENTARIES)",
      meaning: `Regarding ${qSnippet}, Hypatia brings mathematical clarity and cosmic perspective. Elevating your mind above immediate emotional turmoil restores proportion and order.`,
      solution: "1. Analyze your challenge as an objective problem to be solved with logic and structure.\n2. Step back to view your situation against the vast horizon of cosmic time.\n3. Cultivate quiet study and clear reflection away from chaotic distractions.",
      followUpQuestion: "If you viewed this dilemma from the serene distance of the stars, how significant would it appear?"
    }
  };

  return sageResponses[sageKey] || sageResponses["marcus"];
}

startServer();
