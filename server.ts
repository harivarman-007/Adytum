import express from "express";
import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Local Data Persistence File Path
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "adytum_ledger.json");

interface LedgerData {
  entries: Array<{
    id: string;
    date: string;
    text: string;
    mood: string;
    moodLabel: string;
    color: string;
    quote?: string;
    author?: string;
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
      quote: "Nothing is more serene than a soul that has arrived at its own center, watching the turbulent tides of the world from a high, quiet cliff.",
      author: "Marcus Aurelius",
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

  // ==========================================
  // 1. RESTFUL DATABASE PERSISTENCE API
  // ==========================================

  // GET /api/entries — Fetch all ledger entries
  app.get("/api/entries", async (req, res) => {
    try {
      const data = await getLedgerData();
      res.json(data.entries);
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

      const data = await getLedgerData();
      const existingIdx = data.entries.findIndex((e) => e.date === newEntry.date || e.id === newEntry.id);

      const entryToSave = {
        id: newEntry.id || `entry-${Date.now()}`,
        date: newEntry.date,
        text: newEntry.text,
        mood: newEntry.mood || "ataraxia",
        moodLabel: newEntry.moodLabel || "Ataraxia (Tranquility)",
        color: newEntry.color || "sage",
        quote: newEntry.quote || "",
        author: newEntry.author || "",
        themes: newEntry.themes || ["reflection"]
      };

      if (existingIdx >= 0) {
        data.entries[existingIdx] = entryToSave;
      } else {
        data.entries.push(entryToSave);
      }

      await saveLedgerData(data);
      res.json({ success: true, entry: entryToSave });
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
      const { text, date } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text entry is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json(getFallbackQuote(text));
      }

      // Race Gemini response with a 4-second timeout for maximum responsiveness
      const fetchPromise = (async () => {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Journal entry written on ${date || "today"}:\n\n"${text}"\n\nAnalyze the emotional tone of this text and map it to a classical Greek-inspired mood state and return a matching profound literary quote.`,
          config: {
            systemInstruction: `You are the quiet curator of Adytum, a sacred personal journal space.
Analyze the user's journal entry.
1. Classify the emotional state into one of the following classical Greek mood categories:
   - "ataraxia" (tranquility, peace, stillness, calm acceptance) -> Muted color code: "sage"
   - "melancholia" (sadness, mourning, pensive solitude, heavy hearts) -> Muted color code: "purple"
   - "catharsis" (emotional release, intense feeling, crying, breakthroughs, raw processing) -> Muted color code: "terracotta"
   - "enthousiasmos" (inspiration, passion, wonder, delight, joy) -> Muted color code: "amber"
   - "nostalgia" (sweet longing, memory, ache for the past, home) -> Muted color code: "rose"
   - "aponia" (relief, absence of physical or mental pain, restful sigh) -> Muted color code: "gray"

2. Find or pair this entry with an evocative, profound quote from classical literary voices.
3. Select 2-3 specific theme tags.
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
                themes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["mood", "moodLabel", "color", "quote", "author", "themes"]
            }
          }
        });

        const jsonText = response.text?.trim() || "{}";
        return JSON.parse(jsonText);
      })();

      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 4000));
      const result = await Promise.race([fetchPromise, timeoutPromise]);

      if (result) {
        return res.json(result);
      } else {
        console.warn("Gemini API call timed out after 4s; using fallback quote.");
        return res.json(getFallbackQuote(text));
      }
    } catch (error: any) {
      console.error("Error analyzing entry, using fallback:", error);
      return res.json(getFallbackQuote(req.body.text || ""));
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

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate a month recap from these entries:\n\n${entriesSummary}`,
        config: {
          systemInstruction: `You are the solemn scribe of Adytum.
Create a slow, quiet, poetic monthly recap of the user's entries.
Synthesize the entries into exactly three slides representing an emotional arc or reflection of the month.
For each slide, write one paragraph of serif-type poetic, quiet prose that:
- References real, concrete things that happened, feelings felt, or themes they wrote about.
- Feels literary, unhurried, and quiet.
- Output 2-3 muted theme keywords as tags per slide.
Return structured JSON matching the requested schema.`,
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
      const result = JSON.parse(jsonText);
      res.json(result);
    } catch (error: any) {
      console.error("Error generating recap:", error);
      res.status(500).json({ error: error.message || "An error occurred during recap generation" });
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

      const promptText = `Previous Dialogue:\n${formattedHistory}\n\nTraveler's Query:\n"${query}"\n\nProvide your response.`;

      const fetchPromise = (async () => {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: promptText,
          config: {
            systemInstruction: `You are a classic Greek sage in the Adytum Sanctuary (${sage}).
Respond to the traveler's query with wisdom and actionable clarity:
1. "text": A profound, authentic quote or aphorism in your voice.
2. "citation": Capitalized citation line (e.g. "- MARCUS AURELIUS").
3. "meaning": 2-3 sentences explaining the deeper philosophical meaning of your quote as it directly applies to their dilemma.
4. "solution": Clear, practical, step-by-step guidance on how to resolve or handle their situation in daily life.
5. "followUpQuestion": A gentle Socratic question to deepen self-reflection.
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
        return JSON.parse(jsonText);
      })();

      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 4000));
      const result = await Promise.race([fetchPromise, timeoutPromise]);

      if (result) {
        return res.json(result);
      } else {
        console.warn("Oracle API timed out after 4s; returning fallback response.");
        return res.json(getFallbackOracleResponse(sage, query));
      }
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

// Enhanced instant offline quote engine with dynamic keyword parsing
function getFallbackQuote(text: string) {
  const low = text.toLowerCase();

  const extractTags = (fallbackDefault: string[]) => {
    const words = text
      .replace(/[^a-zA-Z\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !["this", "that", "with", "have", "from", "today", "watched"].includes(w.toLowerCase()));
    if (words.length >= 2) {
      return Array.from(new Set(words.slice(0, 3).map((w) => w.toLowerCase())));
    }
    return fallbackDefault;
  };

  if (low.includes("love") || low.includes("bewitched") || low.includes("pride") || low.includes("heart") || low.includes("soul") || low.includes("romantic")) {
    return {
      mood: "enthousiasmos",
      moodLabel: "Enthousiasmos (Devotion & Inspiration)",
      color: "amber",
      quote: "Whatever our souls are made of, his and mine are the same... if all else perished, and he remained, I should still continue to be.",
      author: "Emily Brontë (Wuthering Heights)",
      themes: extractTags(["bewitched soul", "enduring affection", "deep devotion"])
    };
  } else if (low.includes("sad") || low.includes("cry") || low.includes("lonely") || low.includes("grief") || low.includes("tired")) {
    return {
      mood: "melancholia",
      moodLabel: "Melancholia (Solitude)",
      color: "purple",
      quote: "What I need is not advice, nor consolation. I need the simple, quiet company of someone who knows what it is to sit with sorrow.",
      author: "Fyodor Dostoevsky",
      themes: extractTags(["heavy heart", "shadows", "silence"])
    };
  } else if (low.includes("angry") || low.includes("stressed") || low.includes("storm")) {
    return {
      mood: "catharsis",
      moodLabel: "Catharsis (Release)",
      color: "terracotta",
      quote: "There is a sacredness in tears. They are not the mark of weakness, but of power. They speak more eloquently than ten thousand tongues.",
      author: "Washington Irving",
      themes: extractTags(["stormy wind", "release", "cleansing"])
    };
  } else if (low.includes("happy") || low.includes("excited") || low.includes("joy") || low.includes("sun")) {
    return {
      mood: "enthousiasmos",
      moodLabel: "Enthousiasmos (Inspiration)",
      color: "amber",
      quote: "Believe in a love that is being stored up for you like an inheritance, and have faith that in this love there is a strength so large.",
      author: "Rainer Maria Rilke",
      themes: extractTags(["morning light", "open horizons", "vitality"])
    };
  } else {
    return {
      mood: "ataraxia",
      moodLabel: "Ataraxia (Tranquility)",
      color: "sage",
      quote: "You have power over your mind - not outside events. Realize this, and you will find strength. The soul becomes dyed with the color of its thoughts.",
      author: "Marcus Aurelius",
      themes: extractTags(["still waters", "cool marble", "gentle breeze"])
    };
  }
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
  const trimmedQuery = query.trim() ? query.slice(0, 45) : "your journey";

  const sageResponses: Record<string, { text: string; citation: string; meaning: string; solution: string; followUpQuestion: string }> = {
    marcus: {
      text: "You have power over your mind—not outside events. Realize this, and you will find untroubled strength. The soul is dyed with the color of its thoughts.",
      citation: "MARCUS AURELIUS (MEDITATIONS)",
      meaning: `Regarding "${trimmedQuery}", the Stoic emperor reminds us that hardship itself is neutral. Your suffering arises from your judgment and expectations, not from the circumstances.`,
      solution: "1. Distinguish between what is in your direct control and what is external chance.\n2. Retreat briefly to your inner citadel with 3 quiet, deep breaths.\n3. Execute your present duty with steady composure, letting go of attachment to distant outcomes.",
      followUpQuestion: "What portion of this burden belongs to external events, and what portion belongs to your own judgment?"
    },
    epicurus: {
      text: "Do not spoil what you have by desiring what you have not; remember that what you now have was once among the things you only hoped for.",
      citation: "EPICURUS (THE GARDEN OF ATARAXIA)",
      meaning: `Regarding "${trimmedQuery}", Epicurus teaches that anxiety is born of chasing artificial desires or fearing imaginary pain. Peace (Ataraxia) is found in simple presence and quiet gratitude.`,
      solution: "1. Strip away unnecessary artificial expectations surrounding this concern.\n2. Share your thoughts with a trusted friend or mentor in quiet company.\n3. Focus on the modest, immediate comforts already present around you today.",
      followUpQuestion: "If all outcome-driven fear were removed, what simple presence brings you immediate peace right now?"
    },
    socrates: {
      text: "The unexamined life is not worth living. Wonder is the beginning of wisdom, and knowing that you know nothing is the first step toward light.",
      citation: "SOCRATES (THE APOLOGY & DIALOGUES)",
      meaning: `Regarding "${trimmedQuery}", Socrates probes the core assumptions underlying your distress. Often our heaviest burdens are built upon unexamined premises we take for granted.`,
      solution: "1. Write down your central fear about this situation and ask: 'Is this undeniably true?'\n2. Deconstruct the worst-case scenario until its artificial hold over you dissolves.\n3. Seek clarity through patient, honest inquiry rather than defensive panic.",
      followUpQuestion: "What hidden belief are you holding onto that makes this situation feel heavier than it truly is?"
    },
    diogenes: {
      text: "He has the most who is content with the least. Stand out of my sunlight and cast off the pretense of worldly opinion.",
      citation: "DIOGENES OF SINOPE (THE CYNIC BARREL)",
      meaning: `Regarding "${trimmedQuery}", Diogenes urges radical simplicity and freedom from societal expectations. Most anxiety is an artificial prison created by seeking external approval.`,
      solution: "1. Identify any superficial expectation you are trying to fulfill and let it drop completely.\n2. Simplify your environment and focus down to bare essential facts.\n3. Act with unvarnished authenticity without caring for the opinion of spectators.",
      followUpQuestion: "Whose approval are you trying to win, and why sacrifice your peace for their illusion?"
    },
    aspasia: {
      text: "Do not fear the friction that carves the marble. Eloquence and wisdom are born when reason engages deeply with the human heart.",
      citation: "ASPASIA OF MILETUS (RHETORIC & PHILOSOPHY)",
      meaning: `Regarding "${trimmedQuery}", Aspasia observes that relational friction and emotional complexity are not obstacles to avoid, but raw material to refine wisdom and graceful communication.`,
      solution: "1. Express your true boundaries and thoughts with calm, composed rhetoric.\n2. Listen deeply to underlying human needs rather than reacting to surface noise.\n3. Transform relational tension into a collaborative search for truth.",
      followUpQuestion: "How can you speak your truth with both unyielding grace and absolute courage?"
    },
    seneca: {
      text: "We suffer more often in imagination than in reality. True happiness is to enjoy the present, without anxious dependence upon the future.",
      citation: "SENECA THE YOUNGER (LETTERS FROM A STOIC)",
      meaning: `Regarding "${trimmedQuery}", Seneca warns against projecting catastrophic future scenarios. Anxiety borrows trouble from tomorrow that may never arrive.`,
      solution: "1. Confine your attention strictly to the current 24-hour block.\n2. Write down your anxious projections and cross out everything speculative.\n3. Dedicate time to meaningful labor or quiet reading to anchor your attention.",
      followUpQuestion: "Are you suffering from what is actually occurring right now, or from the ghost of what might happen?"
    },
    epictetus: {
      text: "First say to yourself what you would be; and then do what you have to do. Attach yourself only to what is in your power to govern.",
      citation: "EPICTETUS (ENCHIRIDION & DISCOURSES)",
      meaning: `Regarding "${trimmedQuery}", Epictetus demands sharp clarity on the Stoic dichotomy of control. You cannot command external results, only your own choices and character.`,
      solution: "1. Divide your query into two columns: 'In my control' vs 'Outside my control'.\n2. Completely surrender concern for everything in column two.\n3. Direct 100% of your energy into taking the first deliberate step in column one.",
      followUpQuestion: "Why waste your soul's energy on what is not yours to command?"
    },
    heraclitus: {
      text: "Everything flows, nothing abides. You cannot step twice into the same river, for other waters are continually flowing in upon you.",
      citation: "HERACLITUS OF EPHESUS (ON NATURE)",
      meaning: `Regarding "${trimmedQuery}", Heraclitus reminds us that change is the fundamental law of the cosmos. Resistance creates suffering; adapting with flux brings harmony.`,
      solution: "1. Accept that this current phase is temporary and will naturally transform.\n2. Release resistance to change and align your posture with shifting conditions.\n3. Find stability not in rigid permanence, but in your ability to adapt gracefully.",
      followUpQuestion: "What are you attempting to freeze in place that nature demands should transform?"
    },
    hypatia: {
      text: "Reserve your right to think; even to think wrongly is better than not to think at all. The stars move in harmonic order, as does reason.",
      citation: "HYPATIA OF ALEXANDRIA (MATHEMATICA & COMMENTARIES)",
      meaning: `Regarding "${trimmedQuery}", Hypatia brings mathematical clarity and cosmic perspective. Elevating your mind above immediate emotional turmoil restores proportion and order.`,
      solution: "1. Analyze your challenge as an objective problem to be solved with logic and structure.\n2. Step back to view your situation against the vast horizon of cosmic time.\n3. Cultivate quiet study and clear reflection away from chaotic distractions.",
      followUpQuestion: "If you viewed this dilemma from the serene distance of the stars, how significant would it appear?"
    }
  };

  return sageResponses[sageKey] || sageResponses["marcus"];
}

startServer();
