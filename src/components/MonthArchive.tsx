import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Calendar, Sparkles, Trash2, Edit, X, ArrowLeft, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Award, Search, Printer, Download, Upload, Compass } from "lucide-react";
import { JournalEntry, MonthlyRecap } from "../types";
import { GreekPillar, LaurelWreath } from "./GreekTempleSVG";
import { printParchmentEntry, printParchmentRecap } from "../lib/exportParchment";
import { playStoneClickSound } from "../lib/audioSynth";
import MoodWheel from "./MoodWheel";
import CameoBadge from "./CameoBadge";

interface MonthArchiveProps {
  entries: JournalEntry[];
  onSelectDay: (dateString: string, existingText?: string) => void;
  onDeleteEntry: (id: string) => void;
  onGenerateRecap: (monthKey: string) => void;
  isGeneratingRecap: boolean;
  onGoToWriting: () => void;
  onBackToLanding: () => void;
  onGoToOracle?: () => void;
  onGoToBreathing?: () => void;
  savedRecaps: Record<string, MonthlyRecap>;
  onImportLedger?: (entries: JournalEntry[], recaps: Record<string, MonthlyRecap>) => void;
}

// Translate month key "YYYY-MM" to readable "Month Year"
const formatMonthKeyFull = (key: string) => {
  if (!key) return "";
  const [year, month] = key.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const getMoodColors = (colorName: string) => {
  switch (colorName) {
    case "gold":
      return "bg-gold-muted/15 border-gold-muted text-gold-muted hover:border-gold-muted/60 dark:bg-gold-muted/25";
    case "olive":
      return "bg-olive-muted/15 border-olive-muted text-olive-muted hover:border-olive-muted/60 dark:bg-olive-muted/25";
    case "terracotta":
      return "bg-terracotta-muted/15 border-terracotta-muted text-terracotta-muted hover:border-terracotta-muted/60 dark:bg-terracotta-muted/25";
    case "amber":
      return "bg-amber-muted/15 border-amber-muted text-amber-muted hover:border-amber-muted/60 dark:bg-amber-muted/25";
    case "rose":
      return "bg-rose-muted/15 border-rose-muted text-rose-muted hover:border-rose-muted/60 dark:bg-rose-muted/25";
    case "gray":
    default:
      return "bg-gray-muted/15 border-gray-muted text-gray-muted hover:border-gray-muted/60 dark:bg-gray-muted/25";
  }
};

export default function MonthArchive({
  entries,
  onSelectDay,
  onDeleteEntry,
  onGenerateRecap,
  isGeneratingRecap,
  onGoToWriting,
  onBackToLanding,
  onGoToOracle,
  onGoToBreathing,
  savedRecaps,
  onImportLedger,
}: MonthArchiveProps) {
  // Derive unique months from all entries
  const months = Array.from(
    new Set(entries.map((e) => e.date.substring(0, 7)))
  ).sort((a, b) => b.localeCompare(a)); // sort descending (newest first)

  // Default selected month to newest month or current month (e.g. 2026-07)
  const currentMonthKey = new Date().toISOString().substring(0, 7);

  const [selectedMonthStr, setSelectedMonthStr] = useState<string | null>(() => {
    return months[0] || currentMonthKey;
  });
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [selectedDayEntries, setSelectedDayEntries] = useState<JournalEntry[]>([]);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [readingStoryIndex, setReadingStoryIndex] = useState(0);
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isStoryDoorOpen, setIsStoryDoorOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeMonthStr = selectedMonthStr || months[0] || currentMonthKey;

  // Generate selectable months list dynamically (includes current, active, entry months, and surrounding months)
  const allSelectableMonths = Array.from(
    new Set([
      currentMonthKey,
      activeMonthStr,
      ...months,
      ...Array.from({ length: 12 }).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return d.toISOString().substring(0, 7);
      }),
    ])
  ).sort((a, b) => b.localeCompare(a));

  const handleSelectMonth = (monthKey: string | null) => {
    playStoneClickSound();
    setSelectedMonthStr(monthKey);
    setReadingStoryIndex(0);
    setSelectedMoodFilter(null);
    setSearchTerm("");
    setIsStoryDoorOpen(false);
  };

  const handleNavigateMonth = (direction: -1 | 1) => {
    if (!activeMonthStr) return;
    const [y, m] = activeMonthStr.split("-").map(Number);
    // direction -1: Navigate to previous month (e.g., July -> June)
    // direction 1:  Navigate to next month (e.g., July -> August)
    const d = new Date(y, m - 1 + direction, 1);
    const yearStr = d.getFullYear();
    const monthStr = String(d.getMonth() + 1).padStart(2, "0");
    const newMonthKey = `${yearStr}-${monthStr}`;

    handleSelectMonth(newMonthKey);
  };

  const getEntriesForDay = (day: number) => {
    const dayPadded = String(day).padStart(2, "0");
    const dateStr = `${activeMonthStr}-${dayPadded}`;
    return entries.filter((e) => e.date === dateStr);
  };

  const getEntryForDay = (day: number) => {
    const dayEntries = getEntriesForDay(day);
    return dayEntries[0] || null;
  };

  const handleDayClick = (day: number) => {
    playStoneClickSound();
    if (!activeMonthStr) return;
    const dayPadded = String(day).padStart(2, "0");
    const dateString = `${activeMonthStr}-${dayPadded}`;
    const dayEntries = entries.filter((e) => e.date === dateString);

    if (dayEntries.length > 0) {
      setSelectedDayEntries(dayEntries);
      setSelectedChapterIndex(0);
      setSelectedEntry(dayEntries[0]);
    } else {
      onSelectDay(dateString, "");
    }
  };

  // Export Ledger Backup
  const handleExportLedger = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ entries, savedRecaps }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `adytum_ledger_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Ledger Backup
  const handleImportLedgerFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.entries && Array.isArray(parsed.entries) && onImportLedger) {
          onImportLedger(parsed.entries, parsed.savedRecaps || {});
          alert("Sanctuary Ledger imported successfully!");
        }
      } catch (err) {
        alert("Invalid ledger file format.");
      }
    };
    reader.readAsText(file);
  };

  // Build calendar days for selected month
  const [year, month] = activeMonthStr ? activeMonthStr.split("-").map(Number) : [2026, 7];
  const daysInMonth = activeMonthStr ? new Date(year, month, 0).getDate() : 31;
  const firstDayIndex = activeMonthStr ? new Date(year, month - 1, 1).getDay() : 3;

  // Filter helper for days matching selected mood or search query
  const dayMatchesFilter = (day: number) => {
    const entry = getEntryForDay(day);
    if (!entry) return false;

    if (selectedMoodFilter && entry.moodLabel !== selectedMoodFilter) {
      return false;
    }

    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      const textMatch = entry.text.toLowerCase().includes(q);
      const moodMatch = entry.moodLabel.toLowerCase().includes(q);
      const quoteMatch = entry.quote ? entry.quote.toLowerCase().includes(q) : false;
      const themeMatch = entry.themes ? entry.themes.some((t) => t.toLowerCase().includes(q)) : false;

      if (!textMatch && !moodMatch && !quoteMatch && !themeMatch) {
        return false;
      }
    }

    return true;
  };

  // Compute Mood Distribution & Climate
  const monthEntries = entries.filter((e) => e.date.startsWith(activeMonthStr));
  const totalMonthEntries = monthEntries.length;

  const moodCounts: Record<string, number> = {};
  monthEntries.forEach((e) => {
    moodCounts[e.moodLabel] = (moodCounts[e.moodLabel] || 0) + 1;
  });

  const climate = Object.entries(moodCounts).map(([mood, count]) => {
    const percentage = Math.round((count / (totalMonthEntries || 1)) * 100);
    const color = mood === "ATARAXIA" ? "olive" :
      mood === "MELANCHOLIA" ? "terracotta" :
        mood === "CATHARSIS" ? "amber" :
          mood === "ENTHOUSIASMOS" ? "gold" : "rose";
    return {
      mood,
      label: mood,
      count,
      percentage,
      bg: getMoodColors(color),
      text: "theme-text-primary"
    };
  });

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div id="month-archive" className="min-h-screen py-10 px-4 sm:px-6 max-w-5xl mx-auto flex flex-col justify-between selection:bg-bronze-light selection:text-white">

      {/* 1. Anchored Top Action Header */}
      <header className="flex justify-between items-center mb-6">
        {selectedMonthStr ? (
          <button
            onClick={() => handleSelectMonth(null)}
            className="flex items-center gap-2 text-xs tracking-wider uppercase theme-text-muted hover:text-bronze-light transition-colors group font-semibold p-2.5 rounded-xl marble-card border border-bronze-light/30 shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-bronze-light group-hover:-translate-x-1 transition-transform" />
            <span>Hall of Records</span>
          </button>
        ) : (
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-xs tracking-wider uppercase theme-text-muted hover:text-bronze-light transition-colors group font-semibold p-2.5 rounded-xl marble-card border border-bronze-light/30 shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-bronze-light group-hover:-translate-x-1 transition-transform" />
            <span>Sanctuary</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportLedgerFile}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-neutral-400 hover:text-bronze-light transition-colors marble-card border border-bronze-light/20 rounded-xl shadow-md"
            title="Import Ledger Backup (JSON)"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportLedger}
            className="p-2.5 text-neutral-400 hover:text-bronze-light transition-colors marble-card border border-bronze-light/20 rounded-xl shadow-md"
            title="Export Ledger Backup (JSON)"
          >
            <Download className="w-4 h-4" />
          </button>
          {onGoToBreathing && (
            <button
              onClick={onGoToBreathing}
              className="hidden sm:block text-xs uppercase theme-text-muted hover:text-bronze-light tracking-widest transition-colors p-2.5 rounded-xl marble-card border border-bronze-light/20 shadow-md font-display font-semibold"
            >
              Stillness
            </button>
          )}
          {onGoToOracle && (
            <button
              onClick={onGoToOracle}
              className="hidden sm:block text-xs uppercase theme-text-muted hover:text-bronze-light tracking-widest transition-colors p-2.5 rounded-xl marble-card border border-bronze-light/20 shadow-md font-display font-semibold"
            >
              Oracle
            </button>
          )}
          <button
            onClick={onGoToWriting}
            className="btn-sanctuary px-5 py-2.5 text-xs shadow-md"
          >
            Add Entry
          </button>
        </div>
      </header>

      {/* 2. Main Content inside Unified Master Slate */}
      <main className="my-auto py-2 flex flex-col items-center w-full">
        <div className="marble-card greek-frame shadow-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden w-full flex flex-col gap-8">

          {/* Column Fluting visual accent */}
          <div className="absolute left-0 top-0 bottom-0 w-[4px] column-fluting border-r border-bronze-light/10" />
          <div className="absolute right-0 top-0 bottom-0 w-[4px] column-fluting border-l border-bronze-light/10" />

          {/* Top Meander Trim */}
          <div className="absolute left-0 right-0 top-0 h-[6px] greek-border opacity-30" />

          {/* SLATE ARCHITECTURAL TITLE HEADER WITH INTEGRATED MONTH SWITCHER */}
          <div className="flex flex-col items-center text-center border-b border-bronze-light/20 pt-3 sm:pt-4 pb-5">
            <span className="font-display text-[10px] tracking-[0.3em] uppercase text-bronze-light font-bold">
              {selectedMonthStr ? `${year} — Sacred Ledger` : "Sacred Vault of Your Recorded Months"}
            </span>

            {selectedMonthStr ? (
              <div className="flex items-center justify-center gap-3 mt-1.5">
                <button
                  onClick={() => handleNavigateMonth(-1)}
                  className="p-1.5 rounded-full hover:bg-bronze-light/15 text-bronze-light transition-colors cursor-pointer border border-bronze-light/20 shadow-sm"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <select
                  value={activeMonthStr}
                  onChange={(e) => handleSelectMonth(e.target.value)}
                  className="font-display text-base sm:text-lg font-bold uppercase tracking-widest gilded-text bg-transparent border-0 focus:outline-none cursor-pointer text-center px-2 py-0.5"
                >
                  {allSelectableMonths.map((m) => (
                    <option key={m} value={m} className="bg-stone-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">
                      THE CHRONICLES OF {formatMonthKeyFull(m).toUpperCase()}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleNavigateMonth(1)}
                  className="p-1.5 rounded-full hover:bg-bronze-light/15 text-bronze-light transition-colors cursor-pointer border border-bronze-light/20 shadow-sm"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <h1 className="font-display text-base font-bold mt-1 uppercase tracking-widest gilded-text">
                THE HALL OF CHRONICLES
              </h1>
            )}
          </div>

          {/* LEVEL 1: THE HALL OF RECORDS (List of months) */}
          {!selectedMonthStr && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-fadeIn">
              {months.map((monthKey) => {
                const monthEntries = entries.filter((e) => e.date.startsWith(monthKey));
                const hasRecap = !!savedRecaps[monthKey];
                const recap = savedRecaps[monthKey];

                return (
                  <div
                    key={monthKey}
                    onClick={() => handleSelectMonth(monthKey)}
                    className="marble-card greek-frame shadow-md p-5 relative cursor-pointer hover:border-bronze-light transition-all flex flex-col justify-between rounded-xl group hover:shadow-lg"
                  >
                    <div>
                      {/* Month Name & Seal */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="font-display text-[9px] tracking-[0.2em] text-neutral-400 dark:text-neutral-500 uppercase block mb-1">
                            Ledger Volume
                          </span>
                          <h3 className="font-serif text-lg text-neutral-800 dark:text-neutral-100 font-medium group-hover:text-bronze-dark dark:group-hover:text-bronze-light transition-colors">
                            {formatMonthKeyFull(monthKey)}
                          </h3>
                        </div>

                        {hasRecap ? (
                          <div className="text-bronze-light bg-bronze-light/5 p-1.5 rounded-full border border-bronze-light/20 shadow-inner" title="Poetic Story Inscribed">
                            <LaurelWreath className="w-6 h-6 animate-pulse" />
                          </div>
                        ) : (
                          <div className="text-neutral-300 dark:text-neutral-800 p-1">
                            <Calendar className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      {/* Excerpt of saved recap story OR a brief invitation */}
                      {hasRecap ? (
                        <div className="mb-4">
                          <span className="font-display text-[8px] tracking-[0.2em] uppercase text-bronze-light block mb-1">
                            Month Quote / Title
                          </span>
                          <blockquote className="font-serif text-sm italic text-neutral-700 dark:text-neutral-300 line-clamp-1 border-l border-bronze-light/40 pl-2 mb-2 font-light">
                            “{recap.title}”
                          </blockquote>
                          <p className="font-serif text-[11px] text-neutral-500 dark:text-neutral-400 italic line-clamp-2 leading-relaxed">
                            {recap.slides[0]?.prose}
                          </p>
                        </div>
                      ) : (
                        <p className="font-serif text-[11px] text-neutral-400 dark:text-neutral-500 italic mb-4">
                          A peaceful month in progress. {monthEntries.length} daily entries recorded. Consult the oracle to synthesize this volume.
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-neutral-100 dark:border-neutral-900">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500">
                        {monthEntries.length} {monthEntries.length === 1 ? "Inscription" : "Inscriptions"}
                      </span>
                      <span className="text-[10px] font-display uppercase tracking-widest text-bronze-dark dark:text-bronze-light flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Open Ledger</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LEVEL 2: 2-COLUMN SIDE-BY-SIDE + TEMPLE DOORS UNVEILING ANIMATION */}
          {selectedMonthStr && (
            <div className="flex flex-col gap-5 w-full animate-fadeIn relative">

              {/* 1. TOP TOOLBAR: Search Input + Dropdown Select Filter */}
              <div className="marble-card greek-frame shadow-sm p-3.5 sm:p-4 relative flex flex-col md:flex-row gap-3 justify-between items-center rounded-xl z-10">
                {/* Search Input */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search log texts, quotes, tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-xs bg-stone-50/50 dark:bg-neutral-900/50 border border-bronze-light/20 focus:border-bronze-light rounded-lg theme-text-primary focus:outline-none transition-colors"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-bronze-light"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Dropdown Select Filter Option */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <span className="font-display text-[10px] tracking-widest uppercase text-bronze-light font-bold flex-shrink-0">
                    Filter Climate:
                  </span>
                  <select
                    value={selectedMoodFilter || ""}
                    onChange={(e) => setSelectedMoodFilter(e.target.value || null)}
                    className="w-full md:w-auto px-4 py-2 text-xs bg-stone-50/80 dark:bg-neutral-900/80 border border-bronze-light/30 focus:border-bronze-light rounded-lg theme-text-primary focus:outline-none cursor-pointer font-display uppercase tracking-wider shadow-sm"
                  >
                    <option value="">All Emotional Climates</option>
                    {climate.map((item) => (
                      <option key={item.mood} value={item.mood} className="bg-stone-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">
                        {item.mood} ({item.count} {item.count === 1 ? 'day' : 'days'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. TEMPLE DOORS & UNVEILED STORY CONTAINER */}
              <div className="relative w-full min-h-[440px]">

                {/* DOORS CONTAINER (Calendar Left Panel + Analytics Right Panel) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full transition-all duration-700">

                  {/* LEFT DOOR PANEL: Travertine Calendar Matrix */}
                  <motion.div
                    animate={{
                      x: isStoryDoorOpen ? -140 : 0,
                      opacity: isStoryDoorOpen ? 0.2 : 1,
                      scale: isStoryDoorOpen ? 0.93 : 1,
                    }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="lg:col-span-6 flex flex-col"
                  >
                    <div className="marble-card greek-frame shadow-xl p-6 sm:p-8 relative flex flex-col justify-between rounded-xl">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-bronze-light/15 pb-3">
                          <span className="font-display text-[10px] tracking-[0.25em] uppercase text-bronze-light flex items-center gap-2 font-bold">
                            <Calendar className="w-4 h-4 text-bronze-light" />
                            <span>Travertine Calendar Matrix</span>
                          </span>
                          <span className="text-[10px] font-display uppercase tracking-widest text-neutral-400 font-semibold">
                            {formatMonthKeyFull(selectedMonthStr)}
                          </span>
                        </div>

                        {/* Day of Week Headers */}
                        <div className="grid grid-cols-7 gap-2 text-center font-display text-[10px] uppercase tracking-wider theme-text-muted border-b border-bronze-light/10 pb-2.5 font-bold my-1">
                          {weekdays.map((wd) => (
                            <div key={wd}>{wd}</div>
                          ))}
                        </div>

                        {/* Calendar Grid Days */}
                        <div className="grid grid-cols-7 gap-2 sm:gap-2.5 my-1">
                          {/* Blank padding days for start of month */}
                          {Array.from({ length: firstDayIndex }).map((_, idx) => (
                            <div key={`blank-${idx}`} className="aspect-square opacity-0 min-h-[42px] sm:min-h-[48px]" />
                          ))}

                          {/* Month Days */}
                          {Array.from({ length: daysInMonth }).map((_, idx) => {
                            const day = idx + 1;
                            const dayEntries = getEntriesForDay(day);
                            const entry = dayEntries[0] || null;
                            const isSelected = selectedEntry && dayEntries.some((e) => e.id === selectedEntry.id);

                            const hasActiveFilter = !!(selectedMoodFilter || searchTerm);
                            const matches = dayMatchesFilter(day);
                            const dimClass = hasActiveFilter && !matches ? "opacity-15" : "";

                            return (
                              <button
                                key={`day-${day}`}
                                disabled={isStoryDoorOpen}
                                onClick={() => {
                                  if (hasActiveFilter && !matches) return;
                                  handleDayClick(day);
                                }}
                                className={`aspect-square min-h-[42px] sm:min-h-[48px] relative border flex items-center justify-center p-2 transition-all duration-300 rounded-xl group ${dimClass} ${entry
                                    ? `${getMoodColors(entry.color)} cursor-pointer ${isSelected ? "ring-2 ring-bronze-light scale-105 shadow-md font-bold" : "hover:scale-105 hover:shadow-md font-semibold"
                                    }`
                                    : "border-neutral-200/50 dark:border-neutral-800/50 hover:border-bronze-light/40 hover:bg-bronze-light/5 text-neutral-400"
                                  }`}
                              >
                                <span className="text-xs sm:text-sm font-sans font-semibold">
                                  {day}
                                </span>
                                {dayEntries.length > 1 && (
                                  <span
                                    className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] font-mono font-bold bg-amber-500 text-stone-950 rounded-full shadow-md border border-stone-100/40"
                                    title={`${dayEntries.length} Chapters Inscribed`}
                                  >
                                    {dayEntries.length}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Bottom Action under Calendar Matrix */}
                      <div className="pt-4 border-t border-bronze-light/15 flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                        <p className="font-serif text-xs italic theme-text-muted text-center sm:text-left">
                          Selected squares open the sacred parchment.
                        </p>

                        {savedRecaps[selectedMonthStr] ? (
                          <button
                            onClick={() => {
                              playStoneClickSound();
                              setIsStoryDoorOpen(true);
                            }}
                            className="btn-sanctuary px-6 py-2.5 text-xs shadow-md whitespace-nowrap flex-shrink-0 font-bold"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-bronze-light" />
                            <span>Unveil Month Story</span>
                          </button>
                        ) : entries.filter((e) => e.date.startsWith(selectedMonthStr)).length > 0 ? (
                          <button
                            onClick={() => onGenerateRecap(selectedMonthStr)}
                            disabled={isGeneratingRecap}
                            className="btn-sanctuary px-6 py-2.5 text-xs shadow-md whitespace-nowrap flex-shrink-0 font-bold"
                          >
                            {isGeneratingRecap ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-bronze-light animate-ping" />
                                <span>Consulting Oracle...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-bronze-light" />
                                <span>Synthesize Month Story</span>
                              </>
                            )}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>

                  {/* RIGHT DOOR PANEL: Sanctuary Analytics */}
                  <motion.div
                    animate={{
                      x: isStoryDoorOpen ? 140 : 0,
                      opacity: isStoryDoorOpen ? 0.2 : 1,
                      scale: isStoryDoorOpen ? 0.93 : 1,
                    }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="lg:col-span-6 flex flex-col"
                  >
                    {climate.length > 0 && (
                      <div className="marble-card greek-frame shadow-xl p-6 sm:p-8 relative flex flex-col justify-between rounded-xl h-full">
                        <div>
                          <div className="flex items-center justify-between border-b border-bronze-light/15 pb-3">
                            <span className="font-display text-[10px] tracking-[0.25em] uppercase text-bronze-light flex items-center gap-2 font-bold">
                              <Sparkles className="w-4 h-4 text-bronze-light" />
                              <span>Climate of the Soul</span>
                            </span>
                            <span className="text-[10px] font-display uppercase tracking-widest text-neutral-400 font-semibold">
                              Emotional Analytics
                            </span>
                          </div>

                          {/* Horizontal Stacked Bar */}
                          <div className="h-3.5 w-full flex overflow-hidden rounded-lg bg-neutral-200/20 dark:bg-neutral-800/20 border border-bronze-light/20 my-3 shadow-inner">
                            {climate.map((item) => (
                              <div
                                key={item.mood}
                                style={{
                                  width: `${item.percentage}%`,
                                  backgroundColor: (()=>{
                                    const k = (item.mood || "").trim().toUpperCase();
                                    if (k.includes("ATARAXIA") || k.includes("TRANQUILITY") || k.includes("PEACE")) return "#10B981";
                                    if (k.includes("MELANCHOLIA") || k.includes("SORROW")) return "#A855F7";
                                    if (k.includes("CATHARSIS") || k.includes("RELEASE")) return "#F97316";
                                    if (k.includes("ENTHOUSIASMOS") || k.includes("PASSION")) return "#F59E0B";
                                    if (k.includes("EUDAIMONIA") || k.includes("JOY")) return "#EAB308";
                                    if (k.includes("APATEIA") || k.includes("EQUANIMITY")) return "#06B6D4";
                                    if (k.includes("NOSTALGIA") || k.includes("MEMORY")) return "#0EA5E9";
                                    if (k.includes("SOLITUDE") || k.includes("QUIET")) return "#6366F1";
                                    if (k.includes("GRATITUDE") || k.includes("THANKFUL")) return "#EC4899";
                                    if (k.includes("AWE") || k.includes("WONDER")) return "#FF6B6B";
                                    if (k.includes("CLARITY") || k.includes("WISDOM")) return "#3B82F6";
                                    let hash = 0;
                                    for (let i = 0; i < k.length; i++) hash = k.charCodeAt(i) + ((hash << 5) - hash);
                                    const colors = ["#10B981", "#A855F7", "#F97316", "#F59E0B", "#EAB308", "#06B6D4", "#0EA5E9", "#6366F1", "#EC4899", "#FF6B6B", "#3B82F6"];
                                    return colors[Math.abs(hash) % colors.length];
                                  })()
                                }}
                                className="h-full border-r border-stone-900/20 transition-all duration-500 shadow-sm"
                                title={`${item.mood}: ${item.percentage}%`}
                              />
                            ))}
                          </div>

                          {/* Mood Wheel Analytics */}
                          <div className="flex justify-center my-2">
                            <MoodWheel
                              climate={climate}
                              selectedMoodFilter={selectedMoodFilter}
                              onSelectMoodFilter={setSelectedMoodFilter}
                            />
                          </div>
                        </div>

                        <div className="pt-4 border-t border-bronze-light/15 text-center mt-auto">
                          <span className="font-serif text-xs italic theme-text-muted">
                            Emotional distribution across recorded days
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>

                </div>

                {/* REVEALED CENTER MONTH STORY PARCHMENT (Opens in the center when Doors Open) */}
                <AnimatePresence>
                  {isStoryDoorOpen && savedRecaps[selectedMonthStr] && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.85, y: 30 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 z-30 flex items-center justify-center p-2 sm:p-4 pointer-events-auto"
                    >
                      <div className="marble-card greek-frame shadow-2xl p-6 sm:p-8 relative flex flex-col justify-between gap-5 rounded-2xl max-w-2xl w-full border-2 border-bronze-light/50 bg-stone-50/95 dark:bg-neutral-900/95 backdrop-blur-md">

                        {/* Top Close Button & Emblem */}
                        <div className="flex items-start justify-between border-b border-bronze-light/20 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-bronze-light/10 text-bronze-light">
                              <LaurelWreath className="w-7 h-7" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-display text-[9px] tracking-[0.25em] uppercase text-bronze-light font-bold">
                                Inscribed Month Story
                              </span>
                              <h3 className="font-serif text-xl italic text-neutral-800 dark:text-neutral-100 font-medium">
                                {savedRecaps[selectedMonthStr].title}
                              </h3>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              playStoneClickSound();
                              setIsStoryDoorOpen(false);
                            }}
                            className="p-1.5 rounded-full border border-bronze-light/20 text-neutral-400 hover:text-bronze-light hover:border-bronze-light transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Prose Body & Themes */}
                        <div className="flex flex-col gap-4 my-2 min-h-[140px] justify-between">
                          <p className="font-serif text-sm sm:text-base text-neutral-800 dark:text-neutral-200 leading-relaxed font-light italic">
                            "{savedRecaps[selectedMonthStr].slides[readingStoryIndex]?.prose}"
                          </p>

                          <div className="flex flex-wrap gap-2 mt-2">
                            {savedRecaps[selectedMonthStr].slides[readingStoryIndex]?.themes.map((t, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 text-[9px] font-mono italic text-bronze-light bg-bronze-light/10 border border-bronze-light/20 uppercase tracking-wider rounded-md"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Slide Pagination & Actions Footer */}
                        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-bronze-light/20 pt-4 gap-4">

                          {/* Slide Pagination */}
                          {savedRecaps[selectedMonthStr].slides.length > 1 ? (
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-mono uppercase text-neutral-400">
                                Passage {readingStoryIndex + 1} of {savedRecaps[selectedMonthStr].slides.length}
                              </span>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => setReadingStoryIndex((prev) => Math.max(0, prev - 1))}
                                  disabled={readingStoryIndex === 0}
                                  className="p-1.5 border border-bronze-light/30 disabled:opacity-20 hover:border-bronze-light rounded transition-colors text-xs"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setReadingStoryIndex((prev) => Math.min(savedRecaps[selectedMonthStr].slides.length - 1, prev + 1))}
                                  disabled={readingStoryIndex === savedRecaps[selectedMonthStr].slides.length - 1}
                                  className="p-1.5 border border-bronze-light/30 disabled:opacity-20 hover:border-bronze-light rounded transition-colors text-xs"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : <div />}

                          {/* Action Buttons: Re-Synthesize & Close */}
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                              onClick={() => {
                                onGenerateRecap(selectedMonthStr);
                              }}
                              disabled={isGeneratingRecap}
                              className="px-4 py-2 border border-bronze-light/30 hover:border-bronze-light text-xs font-display uppercase tracking-wider rounded-lg theme-text-primary transition-colors flex items-center gap-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-bronze-light" />
                              <span>Re-Synthesize</span>
                            </button>

                            <button
                              onClick={() => {
                                playStoneClickSound();
                                setIsStoryDoorOpen(false);
                              }}
                              className="btn-sanctuary px-5 py-2 text-xs shadow-md"
                            >
                              <span>Close Chronicle</span>
                            </button>
                          </div>

                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

            </div>
          )}

        </div>
      </main>

      {/* Immersive Reading Overlay */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 bg-stone-100/90 dark:bg-neutral-950/96 backdrop-blur-md overflow-y-auto py-12 px-6 flex flex-col justify-between selection:bg-bronze-light selection:text-white"
          >
            {/* Header of the full-page reading scroll */}
            <header className="max-w-4xl w-full mx-auto flex justify-between items-center pb-4 border-b border-bronze-light/10">
              <button
                onClick={() => setSelectedEntry(null)}
                className="flex items-center gap-1.5 text-xs tracking-wider uppercase text-neutral-500 hover:text-bronze-dark dark:hover:text-bronze-light transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-bronze-light" />
                <span>Return to Ledger</span>
              </button>

              <span className="font-display tracking-[0.25em] text-xs uppercase text-bronze-dark dark:text-bronze-light">
                Leaf Inscription
              </span>

              <button
                onClick={() => setSelectedEntry(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Main Full Parchment Document */}
            <main className="my-auto py-8 max-w-2xl w-full mx-auto">
              
              {/* Multi-Chapter Selector Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-b border-bronze-light/20 pb-3 mb-4 gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-[10px] tracking-widest uppercase text-bronze-light font-bold">
                    Chapters ({selectedDayEntries.length > 0 ? selectedDayEntries.length : 1}):
                  </span>

                  {/* Up / Down Chapter Navigation Arrows */}
                  {selectedDayEntries.length > 1 && (
                    <div className="flex items-center gap-1 bg-stone-900/10 dark:bg-stone-100/5 p-0.5 rounded-lg border border-bronze-light/20">
                      <button
                        onClick={() => {
                          playStoneClickSound();
                          const prevIdx = Math.max(0, selectedChapterIndex - 1);
                          setSelectedChapterIndex(prevIdx);
                          setSelectedEntry(selectedDayEntries[prevIdx]);
                        }}
                        disabled={selectedChapterIndex === 0}
                        className="p-1 rounded text-neutral-400 hover:text-bronze-light disabled:opacity-20 transition-colors"
                        title="Previous Chapter (Up ▲)"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          playStoneClickSound();
                          const nextIdx = Math.min(selectedDayEntries.length - 1, selectedChapterIndex + 1);
                          setSelectedChapterIndex(nextIdx);
                          setSelectedEntry(selectedDayEntries[nextIdx]);
                        }}
                        disabled={selectedChapterIndex === selectedDayEntries.length - 1}
                        className="p-1 rounded text-neutral-400 hover:text-bronze-light disabled:opacity-20 transition-colors"
                        title="Next Chapter (Down ▼)"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {(selectedDayEntries.length > 0 ? selectedDayEntries : [selectedEntry]).map((ch, idx) => (
                    <button
                      key={ch.id}
                      onClick={() => {
                        playStoneClickSound();
                        setSelectedChapterIndex(idx);
                        setSelectedEntry(ch);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-display uppercase tracking-wider transition-all border ${
                        selectedEntry.id === ch.id
                          ? "border-bronze-light bg-bronze-light/25 text-bronze-dark dark:text-bronze-light font-bold shadow-sm"
                          : "border-bronze-light/20 text-neutral-400 hover:text-bronze-light hover:border-bronze-light/40"
                      }`}
                    >
                      <span>{ch.chapterTitle || `Chapter ${idx + 1}`}</span>
                      {ch.time && <span className="text-[9px] opacity-75 font-mono ml-1">({ch.time})</span>}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    onSelectDay(selectedEntry.date, "");
                    setSelectedEntry(null);
                  }}
                  className="btn-sanctuary px-3 py-1.5 text-[10px] shadow-sm font-bold uppercase tracking-wider flex items-center gap-1.5"
                  title="Inscribe a fresh additional chapter for today"
                >
                  <Sparkles className="w-3.5 h-3.5 text-bronze-light" />
                  <span>+ Inscribe Next Chapter</span>
                </button>
              </div>

              <section className="bas-relief-card greek-frame shadow-2xl p-8 sm:p-12 relative flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-bronze-light/10 pb-4">
                  <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                    {selectedEntry.date}
                  </span>
                  <CameoBadge mood={selectedEntry.mood} moodLabel={selectedEntry.moodLabel} size="md" />
                </div>

                {/* Entry Prose */}
                <div className="font-serif text-base sm:text-lg theme-text-primary leading-relaxed whitespace-pre-wrap font-normal">
                  {selectedEntry.text}
                </div>

                {/* Paired Classical Quote */}
                {selectedEntry.quote && (
                  <div className="mt-4 pt-6 border-t border-bronze-light/10 flex flex-col gap-2">
                    <span className="font-display text-[9px] tracking-[0.2em] text-bronze-dark dark:text-bronze-light uppercase">
                      Echo from Antiquity
                    </span>
                    <blockquote className="font-serif text-sm italic text-neutral-600 dark:text-neutral-300 border-l-2 border-bronze-light/40 pl-3">
                      “{selectedEntry.quote}”
                    </blockquote>
                    {selectedEntry.author && (
                      <span className="font-sans text-[10px] text-neutral-400 uppercase tracking-widest self-end">
                        — {selectedEntry.author}
                      </span>
                    )}
                  </div>
                )}

                {/* Philosophical Themes */}
                {selectedEntry.themes && selectedEntry.themes.length > 0 && (
                  <div className="pt-4 border-t border-bronze-light/10">
                    <span className="font-display text-[9px] tracking-[0.2em] text-neutral-400 uppercase block mb-2">
                      Inscribed Themes
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.themes.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 text-[9px] font-mono italic text-neutral-500 dark:text-neutral-400 bg-neutral-200/40 dark:bg-neutral-800/40 border border-neutral-300/20 dark:border-neutral-700/20 rounded-none uppercase tracking-wider"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Controls */}
                <div className="flex gap-3 justify-end mt-4">
                  <button
                    onClick={() => {
                      printParchmentEntry({
                        date: selectedEntry.date,
                        text: selectedEntry.text,
                        moodLabel: selectedEntry.moodLabel,
                        quote: selectedEntry.quote,
                        author: selectedEntry.author,
                        themes: selectedEntry.themes
                      });
                    }}
                    className="px-4 py-3.5 border border-bronze-light/40 hover:border-bronze-light text-neutral-700 dark:text-neutral-200 uppercase tracking-widest text-xs rounded-none bg-bronze-light/5 hover:bg-bronze-light/15 transition-all flex items-center gap-2"
                    title="Export as Parchment / Print PDF"
                  >
                    <Printer className="w-3.5 h-3.5 text-bronze-light" />
                    <span className="hidden sm:inline">Parchment PDF</span>
                  </button>
                  <button
                    onClick={() => {
                      onSelectDay(selectedEntry.date, selectedEntry.text);
                      setSelectedEntry(null);
                    }}
                    className="flex-1 sm:flex-initial px-6 py-3.5 border border-bronze-light hover:border-bronze-dark text-neutral-800 dark:text-neutral-100 uppercase tracking-widest text-xs rounded-none bg-bronze-light/5 hover:bg-bronze-light/10 transition-all flex items-center justify-center gap-2.5 shadow-sm"
                  >
                    <Edit className="w-3.5 h-3.5 text-bronze-light" />
                    <span>edit leaf</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to erase this chronicle?")) {
                        onDeleteEntry(selectedEntry.id);
                        setSelectedEntry(null);
                      }
                    }}
                    className="px-4 py-3.5 border border-red-200 dark:border-red-900/50 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-500/5 text-red-500 hover:text-red-400 transition-all text-xs uppercase tracking-widest"
                    title="Erase Inscription"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </section>
            </main>

            {/* Footer */}
            <footer className="max-w-4xl w-full mx-auto border-t border-bronze-light/10 pt-4 text-center text-[9px] text-neutral-400 dark:text-neutral-500 font-sans tracking-widest uppercase mt-8">
              “The written word remains, long after the voice is silent.”
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Footer */}
      <footer className="border-t border-bronze-light/10 pt-4 text-center text-[10px] text-neutral-400 dark:text-neutral-500 font-sans tracking-wider uppercase mt-12">
        “We live in the memory of our recorded hours.” — Classical Proverb
      </footer>
    </div>
  );
}
