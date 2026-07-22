import React, { useState, useEffect } from "react";
import { JournalEntry, MonthlyRecap } from "./types";
import { INITIAL_ENTRIES } from "./initialData";
import LandingPage from "./components/LandingPage";
import EntryScreen from "./components/EntryScreen";
import QuoteReveal from "./components/QuoteReveal";
import MonthArchive from "./components/MonthArchive";
import MonthlyRecapView from "./components/MonthlyRecapView";
import OracleSanctuary from "./components/OracleSanctuary";
import BreathingSanctuary from "./components/BreathingSanctuary";
import SanctuaryParticles from "./components/SanctuaryParticles";
import SanctuaryAudioBar, { ThemePreset } from "./components/SanctuaryAudioBar";
import { startSanctuaryDrone, stopSanctuaryDrone } from "./lib/audioSynth";

const formatMonthKey = (key: string) => {
  if (!key) return "This Month";
  const [year, month] = key.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

export default function App() {
  const [view, setView] = useState<"landing" | "write" | "reveal" | "archive" | "oracle" | "breathing">("landing");

  // Load entries from localStorage or default to INITIAL_ENTRIES
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem("adytum_ledger_entries");
    return saved ? JSON.parse(saved) : INITIAL_ENTRIES;
  });

  const [activeDate, setActiveDate] = useState("");
  const [activeEntryText, setActiveEntryText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<{
    mood: string;
    moodLabel: string;
    color: string;
    quote: string;
    author: string;
    themes: string[];
  } | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingRecap, setIsGeneratingRecap] = useState(false);
  const [activeRecap, setActiveRecap] = useState<MonthlyRecap | null>(null);
  const [showRecap, setShowRecap] = useState(false);
  const [recapMonthKey, setRecapMonthKey] = useState<string>("");

  // Continuous procedural ambient soundscape state
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(() => {
    const saved = localStorage.getItem("adytum_ambient_playing");
    return saved === "true";
  });

  const [savedRecaps, setSavedRecaps] = useState<Record<string, MonthlyRecap>>(() => {
    const saved = localStorage.getItem("adytum_saved_recap_stories");
    if (saved) return JSON.parse(saved);

    // Seed an initial gorgeous recap for June 2026 to show off the chronicle feature immediately
    const initialRecaps: Record<string, MonthlyRecap> = {
      "2026-06": {
        title: "The Travertine Echoes of June",
        slides: [
          {
            prose: "The month of June opened in quiet contemplation, like slow footsteps echoing on smooth travertine stone. You sat within the warm evening breeze, feeling the gentle passage of twilight. Your ink captured the slow-drying steam of coffee, a quiet accepting of empty afternoons, and a serene stillness.",
            themes: ["travertine path", "evening breeze", "slow ink"]
          },
          {
            prose: "By mid-month, a sweet ache of memory arose—a longing for the taste of sea salt and distant horizons. You embraced this warm nostalgia not as a painful void, but as a sanctuary of yesteryears that colors your present steps. Solitude became your quiet companion.",
            themes: ["sea salt", "distant horizon", "quiet companion"]
          },
          {
            prose: "As June drew to its steady close, you found a calm, centered peace—ataraxia. The storms of busy days settled into a restorative sigh. You carry these recorded hours as beautifully carved reliefs on the columns of your mind's temple, ready for the seasons ahead.",
            themes: ["still temple", "restorative sigh", "archived hours"]
          }
        ]
      }
    };
    return initialRecaps;
  });

  // Atmosphere theme preset state: 7 masterwork art themes
  const [themePreset, setThemePreset] = useState<ThemePreset>(() => {
    const saved = localStorage.getItem("adytum_theme_preset") as ThemePreset | null;
    if (saved && ["athenian", "starry", "blossom", "venus", "wave", "creation", "klimt"].includes(saved)) {
      return saved;
    }
    return "athenian";
  });

  // Dark/light mode theme toggle
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("adytum_dark_theme");
    return saved ? saved === "true" : false; // Default to light mode for Athenian Academy
  });

  // Initial backend sync for entries & recaps
  useEffect(() => {
    async function syncBackendData() {
      try {
        const entriesRes = await fetch("/api/entries");
        if (entriesRes.ok) {
          const backendEntries = await entriesRes.json();
          if (Array.isArray(backendEntries) && backendEntries.length > 0) {
            setEntries(backendEntries);
          }
        }
      } catch (err) {
        console.log("Offline mode: using local storage entries");
      }

      try {
        const recapsRes = await fetch("/api/recaps");
        if (recapsRes.ok) {
          const backendRecaps = await recapsRes.json();
          if (backendRecaps && typeof backendRecaps === "object") {
            setSavedRecaps((prev) => ({ ...prev, ...backendRecaps }));
          }
        }
      } catch (err) {
        console.log("Offline mode: using local storage recaps");
      }
    }
    syncBackendData();
  }, []);

  // Persist entries to localStorage when updated
  useEffect(() => {
    localStorage.setItem("adytum_ledger_entries", JSON.stringify(entries));
  }, [entries]);

  // Persist saved monthly recaps to localStorage
  useEffect(() => {
    localStorage.setItem("adytum_saved_recap_stories", JSON.stringify(savedRecaps));
  }, [savedRecaps]);

  // Handle theme classes on root document and body
  useEffect(() => {
    const root = window.document.documentElement;
    const body = document.body;

    // Apply dark mode class automatically for dark-background themes or when isDark is true
    const shouldBeDark = isDark || themePreset !== "athenian";
    if (shouldBeDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Apply atmosphere theme preset class across all 7 masterwork art themes to root element and body
    const themeClasses = [
      "theme-athenian",
      "theme-starry",
      "theme-blossom",
      "theme-venus",
      "theme-wave",
      "theme-creation",
      "theme-klimt"
    ];
    root.classList.remove(...themeClasses);
    body.classList.remove(...themeClasses);
    root.classList.add(`theme-${themePreset}`);
    body.classList.add(`theme-${themePreset}`);

    localStorage.setItem("adytum_dark_theme", String(isDark));
    localStorage.setItem("adytum_theme_preset", themePreset);
  }, [isDark, themePreset]);

  // Handle ambient procedural soundscape
  useEffect(() => {
    if (isAmbientPlaying) {
      startSanctuaryDrone();
    } else {
      stopSanctuaryDrone();
    }
    localStorage.setItem("adytum_ambient_playing", String(isAmbientPlaying));
  }, [isAmbientPlaying]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Switch to writing today's entry
  const handleBeginWriting = () => {
    // Default to July 19, 2026 for demonstration to align with July 2026 theme
    const today = "2026-07-19";
    setActiveDate(today);
    setActiveEntryText("");
    setAnalysisResult(null);
    setView("write");
  };

  // Start writing for a custom date chosen from the calendar grid
  const handleSelectDay = (dateString: string, existingText?: string) => {
    setActiveDate(dateString);
    setActiveEntryText(existingText || "");
    setAnalysisResult(null);
    setView("write");
  };

  // Enhanced instant offline quote engine with dynamic keyword parsing
  const getClientFallbackQuote = (text: string) => {
    const low = text.toLowerCase();

    // Helper: Extract top keywords from user text for relevant theme tags
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
    } else if (low.includes("sad") || low.includes("tired") || low.includes("hurt") || low.includes("lonely") || low.includes("cry") || low.includes("grief")) {
      return {
        mood: "melancholia",
        moodLabel: "Melancholia (Solitude)",
        color: "purple",
        quote: "Only those who quiet their minds can hear the wisdom locked inside grief. Do not turn away, for sorrow is the soil of understanding.",
        author: "Fyodor Dostoevsky",
        themes: extractTags(["quiet sorrow", "winter wind", "shadows"])
      };
    } else if (low.includes("happy") || low.includes("wonderful") || low.includes("joy") || low.includes("creative") || low.includes("sun")) {
      return {
        mood: "enthousiasmos",
        moodLabel: "Enthousiasmos (Inspiration)",
        color: "amber",
        quote: "To live, to think, to create, to feel the small warmth of the sun and know that you are part of the vast fabric—this is the highest joy.",
        author: "Rainer Maria Rilke",
        themes: extractTags(["eternal flame", "morning light", "creation"])
      };
    } else if (low.includes("past") || low.includes("old") || low.includes("remember") || low.includes("ago") || low.includes("memory")) {
      return {
        mood: "nostalgia",
        moodLabel: "Nostalgia (Yearning)",
        color: "rose",
        quote: "How is it that the past can feel so warm, while the present remains as cold as basalt? We carry the sanctuaries of yesterday within our steps.",
        author: "Sappho",
        themes: extractTags(["fading twilight", "old memory", "yesterdays"])
      };
    } else {
      return {
        mood: "ataraxia",
        moodLabel: "Ataraxia (Tranquility)",
        color: "sage",
        quote: "Nothing is more serene than a soul that has arrived at its own center, watching the turbulent tides of the world from a high, quiet cliff.",
        author: "Marcus Aurelius",
        themes: extractTags(["calm center", "high cliff", "serenity"])
      };
    }
  };

  const getClientFallbackRecap = (allEntries: JournalEntry[]) => {
    return {
      title: "The Basalt Ledger of the Soul",
      slides: [
        {
          prose: `This month began in quiet, tentative strokes. You sat within the silent halls of your thoughts, recording moments of lingering reflection. The words you chose carried a weight of patience, looking for meaning in the small, routine gestures of life.`,
          themes: ["temple steps", "morning silence", "slow ink"]
        },
        {
          prose: `Through the middle days, a shift occurred. Shadows pressed and receded like waves against a stone pier. There were times when the quiet felt heavy, but you met it with classical endurance, letting the poets speak for the grief.`,
          themes: ["shifting light", "poetic company", "heavy rain"]
        },
        {
          prose: `Now, as the month draws to its peaceful sunset, you arrive at a steady threshold. A serene tranquility—ataraxia—nestles in the corners of your sanctuary.`,
          themes: ["still travertine", "gentle twilight", "archived hours"]
        }
      ]
    };
  };

  // Submit freeform diary text to be analyzed server-side
  const handleSubmitEntry = async (text: string) => {
    setActiveEntryText(text);
    setIsAnalyzing(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch("/api/analyze-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, date: activeDate }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error("Failed to process journal entry");
      }
      const data = await response.json();
      setAnalysisResult(data);
      setView("reveal");
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn("Analysis API delayed/offline, using instant sanctuary quote:", err);
      const mockResult = getClientFallbackQuote(text);
      setAnalysisResult(mockResult);
      setView("reveal");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Retry the quote generation for the active entry
  const handleRetryQuote = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: activeEntryText + " (Please select a completely different literary quote that contrasts or adds alternative depth to the previous one.)",
          date: activeDate
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to retry quote pairing");
      }
      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error("Retry quote error:", err);
      // Alternative fallback quote for offline mode
      setAnalysisResult({
        mood: "aponia",
        moodLabel: "Aponia (Peaceful Sigh)",
        color: "gray",
        quote: "There are moments when one is entirely untangled from the web of outcomes. Enjoy this silence, it is carved in gold.",
        author: "Marcus Aurelius",
        themes: ["untangled", "golden silence", "resting mind"]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save the entry and paired quote to the local ledger list & backend
  const handleSaveEntry = async (finalQuote: string, finalAuthor: string) => {
    if (!analysisResult) return;

    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      date: activeDate,
      text: activeEntryText,
      mood: analysisResult.mood,
      moodLabel: analysisResult.moodLabel,
      color: analysisResult.color,
      quote: finalQuote,
      author: finalAuthor,
      themes: analysisResult.themes,
    };

    // Filter out existing entries for the same date to avoid duplicates
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.date !== activeDate);
      return [...filtered, newEntry];
    });

    // Async post to backend API
    try {
      await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });
    } catch (err) {
      console.warn("Backend save failed, saved locally.");
    }

    setView("archive");
  };

  // Delete an entry from the ledger
  const handleDeleteEntry = async (id: string) => {
    if (window.confirm("Are you sure you want to erase this day's chronicle from the ledger?")) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      try {
        await fetch(`/api/entries/${id}`, { method: "DELETE" });
      } catch (err) {
        console.warn("Backend delete failed.");
      }
    }
  };

  // Generate Poetic monthly recap based on entries of the selected month
  const handleGenerateRecap = async (monthKey: string) => {
    const entriesForMonth = entries.filter((e) => e.date.startsWith(monthKey));
    setRecapMonthKey(monthKey);
    setIsGeneratingRecap(true);
    try {
      const response = await fetch("/api/generate-recap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: entriesForMonth }),
      });
      if (!response.ok) {
        throw new Error("Failed to compile monthly recap");
      }
      const data = await response.json();
      setActiveRecap(data);
      setShowRecap(true);
    } catch (err) {
      console.error("Recap generation error:", err);
      // Failover to client mock recap
      setActiveRecap(getClientFallbackRecap(entriesForMonth));
      setShowRecap(true);
    } finally {
      setIsGeneratingRecap(false);
    }
  };

  // Save the generated monthly recap
  const handleSaveRecap = async (monthKey: string, recap: MonthlyRecap) => {
    setSavedRecaps((prev) => ({
      ...prev,
      [monthKey]: recap,
    }));
    try {
      await fetch("/api/recaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthKey, recap }),
      });
    } catch (err) {
      console.warn("Backend recap save failed, saved locally.");
    }
  };



  return (
    <div className="relative min-h-screen">
      {/* Background Drifting Particles */}
      <SanctuaryParticles themePreset={themePreset} />

      {/* Absolute overlay of physical parchment paper grain */}
      <div className="parchment-grain" />

      {/* 1. Landing View */}
      {view === "landing" && (
        <LandingPage
          onBegin={handleBeginWriting}
          onGoToArchive={() => setView("archive")}
          onGoToOracle={() => setView("oracle")}
          onGoToBreathing={() => setView("breathing")}
          hasEntries={entries.length > 0}
          entriesCount={entries.length}
        />
      )}

      {/* 2. Writing View */}
      {view === "write" && (
        <EntryScreen
          onBack={() => setView(entries.length > 0 ? "archive" : "landing")}
          onSubmit={handleSubmitEntry}
          isLoading={isAnalyzing}
          initialText={activeEntryText}
          date={activeDate}
        />
      )}

      {/* 3. Quote Reveal View */}
      {view === "reveal" && analysisResult && (
        <QuoteReveal
          entryText={activeEntryText}
          mood={analysisResult.mood}
          moodLabel={analysisResult.moodLabel}
          color={analysisResult.color}
          quote={analysisResult.quote}
          author={analysisResult.author}
          themes={analysisResult.themes}
          onSave={handleSaveEntry}
          onRetry={handleRetryQuote}
          isRetrying={isAnalyzing}
        />
      )}

      {/* 4. Ledger Archive View */}
      {view === "archive" && (
        <MonthArchive
          entries={entries}
          onSelectDay={handleSelectDay}
          onDeleteEntry={handleDeleteEntry}
          onGenerateRecap={handleGenerateRecap}
          isGeneratingRecap={isGeneratingRecap}
          onGoToWriting={handleBeginWriting}
          onBackToLanding={() => setView("landing")}
          onGoToOracle={() => setView("oracle")}
          onGoToBreathing={() => setView("breathing")}
          savedRecaps={savedRecaps}
          onImportLedger={(newEntries, newRecaps) => {
            setEntries(newEntries);
            setSavedRecaps((prev) => ({ ...prev, ...newRecaps }));
          }}
        />
      )}

      {/* 5. Delphi Oracle View */}
      {view === "oracle" && (
        <OracleSanctuary
          onBack={() => setView(entries.length > 0 ? "archive" : "landing")}
        />
      )}

      {/* 6. Breathing Sanctuary View */}
      {view === "breathing" && (
        <BreathingSanctuary
          onBack={() => setView(entries.length > 0 ? "archive" : "landing")}
        />
      )}

      {/* 7. Poetic Monthly Recap Slider Overlay */}
      {showRecap && activeRecap && recapMonthKey && (
        <MonthlyRecapView
          recap={activeRecap}
          onClose={() => setShowRecap(false)}
          onSave={() => handleSaveRecap(recapMonthKey, activeRecap)}
          isSaved={!!savedRecaps[recapMonthKey]}
          monthName={formatMonthKey(recapMonthKey)}
        />
      )}

      {/* Global Sanctuary Atmosphere & Audio Settings Bar */}
      <SanctuaryAudioBar
        isPlaying={isAmbientPlaying}
        onTogglePlay={() => setIsAmbientPlaying(!isAmbientPlaying)}
        currentTheme={themePreset}
        onSelectTheme={setThemePreset}
      />

    </div>
  );
}
