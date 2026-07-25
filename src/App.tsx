import React, { useState, useEffect } from "react";
import { JournalEntry, MonthlyRecap, User } from "./types";
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
import AuthScreen from "./components/AuthScreen";
import { startSanctuaryDrone, stopSanctuaryDrone } from "./lib/audioSynth";

const formatMonthKey = (key: string) => {
  if (!key) return "This Month";
  const [year, month] = key.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

export default function App() {
  // User Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("adytum_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [userToken, setUserToken] = useState<string | null>(() => localStorage.getItem("adytum_token"));

  // Primary Sanctuary View Router — Opens to full login page by default if unauthenticated
  const [view, setView] = useState<"login" | "landing" | "write" | "reveal" | "archive" | "oracle" | "breathing">(() => {
    const savedUser = localStorage.getItem("adytum_user");
    return savedUser ? "landing" : "login";
  });

  // Load entries from localStorage scoped to user or start with fresh clean ledger
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    const savedUser = localStorage.getItem("adytum_user");
    const user = savedUser ? JSON.parse(savedUser) : null;
    const key = user ? `adytum_ledger_entries_${user.id}` : "adytum_ledger_entries";
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  });

  const [activeDate, setActiveDate] = useState("");
  const [activeEntryText, setActiveEntryText] = useState("");
  const [activeChapterSubtitle, setActiveChapterSubtitle] = useState("");
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

  const handleAuthSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    setUserToken(token);
    localStorage.setItem("adytum_user", JSON.stringify(user));
    localStorage.setItem("adytum_token", token);
    setView("landing");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserToken(null);
    localStorage.removeItem("adytum_user");
    localStorage.removeItem("adytum_token");
    setView("login");
  };

  // Continuous procedural ambient soundscape state
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(() => {
    const saved = localStorage.getItem("adytum_ambient_playing");
    return saved === "true";
  });

  const [savedRecaps, setSavedRecaps] = useState<Record<string, MonthlyRecap>>(() => {
    const savedUser = localStorage.getItem("adytum_user");
    const user = savedUser ? JSON.parse(savedUser) : null;
    const key = user ? `adytum_saved_recap_stories_${user.id}` : "adytum_saved_recap_stories";
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    return {};
  });

  // Persist saved monthly recaps to localStorage scoped to current user
  useEffect(() => {
    const key = currentUser ? `adytum_saved_recap_stories_${currentUser.id}` : "adytum_saved_recap_stories";
    localStorage.setItem(key, JSON.stringify(savedRecaps));
  }, [savedRecaps, currentUser]);

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
        const url = currentUser ? `/api/entries?userId=${currentUser.id}` : "/api/entries";
        const entriesRes = await fetch(url, {
          headers: currentUser ? { Authorization: `Bearer ${currentUser.id}` } : {}
        });
        if (entriesRes.ok) {
          const backendEntries = await entriesRes.json();
          if (Array.isArray(backendEntries)) {
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
  }, [currentUser]);

  // Persist entries to localStorage when updated
  useEffect(() => {
    const key = currentUser ? `adytum_ledger_entries_${currentUser.id}` : "adytum_ledger_entries";
    localStorage.setItem(key, JSON.stringify(entries));
  }, [entries, currentUser]);

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

  // Switch to writing a fresh new entry for today or a custom date
  const handleBeginWriting = (customDate?: string) => {
    const dateStr = typeof customDate === "string" && customDate.includes("-")
      ? customDate
      : new Date().toISOString().split("T")[0];
    setActiveDate(dateStr);
    setActiveEntryText("");
    setActiveChapterSubtitle("");
    setAnalysisResult(null);
    setView("write");
  };

  // Start writing for a custom date or editing an existing entry
  const handleSelectDay = (dateString: string, existingText?: string, existingSubtitle?: string) => {
    setActiveDate(dateString);
    setActiveEntryText(existingText || "");
    setActiveChapterSubtitle(existingSubtitle || "");
    setAnalysisResult(null);
    setView("write");
  };

  const [analysisError, setAnalysisError] = useState<string | null>(null);

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
  const handleSubmitEntry = async (text: string, chapterSubtitle?: string) => {
    setActiveEntryText(text);
    setActiveChapterSubtitle(chapterSubtitle || "");
    setIsAnalyzing(true);
    setAnalysisError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch("/api/analyze-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, date: activeDate }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${response.status})`);
      }
      const data = await response.json();
      setAnalysisResult(data);
      setView("reveal");
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("AI Analysis Error:", err);
      setAnalysisError(err.message || "Unable to reach the Oracular AI service.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Retry the quote generation for the active entry
  const handleRetryQuote = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch("/api/analyze-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: activeEntryText,
          date: activeDate,
          previousQuote: analysisResult?.quote,
          previousAuthor: analysisResult?.author
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${response.status})`);
      }
      const data = await response.json();
      setAnalysisResult(data);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Retry quote error:", err);
      setAnalysisError(err.message || "Failed to generate an alternative AI quote.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save the entry and paired quote to the local ledger list & backend
  const handleSaveEntry = async (finalQuote: string, finalAuthor: string) => {
    if (!analysisResult) return;

    // Calculate existing chapter count for activeDate to assign Roman Numeral markers
    const existingDayEntries = entries.filter((e) => e.date === activeDate);
    const chapterNum = existingDayEntries.length + 1;
    const chapterRoman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][chapterNum - 1] || `${chapterNum}`;
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const baseChapterTitle = `Chapter ${chapterRoman}`;
    const fullChapterTitle = activeChapterSubtitle.trim()
      ? `${baseChapterTitle}: ${activeChapterSubtitle.trim()}`
      : baseChapterTitle;

    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      userId: currentUser?.id,
      date: activeDate,
      time: timeStr,
      chapterTitle: fullChapterTitle,
      text: activeEntryText,
      mood: analysisResult.mood,
      moodLabel: analysisResult.moodLabel,
      color: analysisResult.color,
      quote: finalQuote,
      author: finalAuthor,
      reflection: analysisResult.reflection,
      themes: analysisResult.themes,
    };

    // Append new chapter entry cleanly without overwriting previous entries for the date
    setEntries((prev) => [...prev, newEntry]);

    // Async post to backend API
    try {
      await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(currentUser ? { Authorization: `Bearer ${currentUser.id}` } : {})
        },
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

      {/* 0. Full Dedicated Login & Signup Page View */}
      {view === "login" && (
        <AuthScreen
          onSuccess={handleAuthSuccess}
          onContinueGuest={() => setView("landing")}
        />
      )}

      {/* 1. Landing View */}
      {view === "landing" && (
        <LandingPage
          onBegin={handleBeginWriting}
          onGoToArchive={() => setView("archive")}
          onGoToOracle={() => setView("oracle")}
          onGoToBreathing={() => setView("breathing")}
          hasEntries={entries.length > 0}
          entriesCount={new Set(entries.map((e) => e.date)).size}
          currentUser={currentUser}
          onLogout={handleLogout}
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
          reflection={analysisResult.reflection}
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

      {/* Sanctuary AI Error Display Modal */}
      {analysisError && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-sand-light dark:bg-stone-900 border border-bronze-light/30 rounded-2xl max-w-md w-full p-8 text-center shadow-2xl space-y-6">
            <div className="w-12 h-12 rounded-full bg-terracotta-muted/20 text-terracotta-muted flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-serif text-lg text-bronze-dark dark:text-bronze-light tracking-wide uppercase">
                Sanctuary AI Error
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 font-serif leading-relaxed">
                {analysisError}
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => {
                  setAnalysisError(null);
                  if (activeEntryText) handleSubmitEntry(activeEntryText);
                }}
                className="px-5 py-2.5 rounded-lg bg-bronze-dark dark:bg-bronze-light text-white dark:text-neutral-900 text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
              <button
                onClick={() => setAnalysisError(null)}
                className="px-5 py-2.5 rounded-lg border border-bronze-light/30 text-neutral-600 dark:text-neutral-300 text-xs font-semibold uppercase tracking-wider hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
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
