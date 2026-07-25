import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Feather, Compass, Lock, Sparkles, BookOpen, Quote, Flame, Calendar, Bell, Volume2, RefreshCw } from "lucide-react";
import { GreekTemple, LaurelWreath, GreekPillar } from "./GreekTempleSVG";
import { playTempleBell, playSingingBowlSound } from "../lib/audioSynth";

import { User } from "../types";
import { UserCheck, LogIn, LogOut, UserPlus } from "lucide-react";

interface LandingPageProps {
  onBegin: () => void;
  onGoToArchive: () => void;
  onGoToOracle: () => void;
  onGoToBreathing: () => void;
  hasEntries: boolean;
  entriesCount?: number;
  currentUser?: User | null;
  onOpenLogin?: () => void;
  onOpenSignup?: () => void;
  onLogout?: () => void;
}

export default function LandingPage({
  onBegin,
  onGoToArchive,
  onGoToOracle,
  onGoToBreathing,
  hasEntries,
  entriesCount = 0,
  currentUser,
  onOpenLogin,
  onOpenSignup,
  onLogout
}: LandingPageProps) {
  const [dailyQuote, setDailyQuote] = useState<{ text: string; author: string; reflection?: string }>({
    text: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius"
  });
  const [isLoadingDailyQuote, setIsLoadingDailyQuote] = useState(false);

  const fetchDailyQuote = async () => {
    setIsLoadingDailyQuote(true);
    try {
      const res = await fetch("/api/daily-quote");
      if (res.ok) {
        const data = await res.json();
        if (data.text && data.author) {
          setDailyQuote(data);
        }
      }
    } catch (err) {
      console.warn("Could not fetch daily AI quote:", err);
    } finally {
      setIsLoadingDailyQuote(false);
    }
  };

  React.useEffect(() => {
    fetchDailyQuote();
  }, []);

  return (
    <div id="landing-page" className="min-h-screen flex flex-col justify-between py-8 px-4 sm:px-6 max-w-7xl mx-auto selection:bg-bronze-light selection:text-white">
      {/* 1. Anchored Top Header */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3 p-2.5 rounded-xl marble-card border border-bronze-light/30 shadow-md">
          <LaurelWreath className="w-7 h-7 text-bronze-light" />
          <span className="font-display tracking-[0.25em] text-xs uppercase font-bold gilded-text">
            Adytum
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onGoToBreathing}
            className="flex items-center gap-1.5 text-xs tracking-wider uppercase theme-text-muted hover:text-bronze-light transition-colors font-semibold p-2.5 rounded-xl marble-card border border-bronze-light/30 shadow-md"
            title="Box Breathing Sanctuary"
          >
            <Compass className="w-4 h-4 text-bronze-light" />
            <span className="hidden sm:inline">Stillness</span>
          </button>

          <button
            onClick={onGoToOracle}
            className="flex items-center gap-1.5 text-xs tracking-wider uppercase theme-text-muted hover:text-bronze-light transition-colors font-semibold p-2.5 rounded-xl marble-card border border-bronze-light/30 shadow-md"
            title="Socratic Philosopher Dialogue"
          >
            <Sparkles className="w-4 h-4 text-bronze-light" />
            <span className="hidden sm:inline">Oracle</span>
          </button>

          <button
            onClick={onGoToArchive}
            className="flex items-center gap-2 text-xs tracking-wider uppercase theme-text-muted hover:text-bronze-light transition-colors font-semibold p-2.5 rounded-xl marble-card border border-bronze-light/30 shadow-md"
          >
            <BookOpen className="w-4 h-4 text-bronze-light" />
            <span>The Ledger ({entriesCount})</span>
          </button>
        </div>
      </header>

      {/* 2. Main Tri-Column Sanctuary Layout */}
      <main className="my-auto py-2 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

          {/* LEFT FLANK: CLASSICAL STOIC WISDOM COLUMN */}
          <div className="lg:col-span-3 hidden lg:flex flex-col gap-4">
            <div className="marble-card greek-frame p-6 rounded-2xl shadow-xl flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] column-fluting border-r border-bronze-light/10" />
              <div className="absolute left-0 right-0 top-0 h-[4px] greek-border opacity-30" />

              <div className="flex items-center justify-between border-b border-bronze-light/15 pb-3">
                <div className="flex items-center gap-2">
                  <Quote className="w-4 h-4 text-bronze-light" />
                  <span className="font-display text-[10px] tracking-[0.2em] uppercase text-bronze-light font-bold">
                    Daily Stoic Wisdom
                  </span>
                </div>
                <button
                  onClick={fetchDailyQuote}
                  disabled={isLoadingDailyQuote}
                  className="p-1 text-neutral-400 hover:text-bronze-light transition-colors disabled:opacity-30"
                  title="Generate New AI Daily Quote"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDailyQuote ? "animate-spin text-bronze-light" : ""}`} />
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={dailyQuote.text}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col gap-3 my-1"
                >
                  <blockquote className="font-serif text-sm italic theme-text-primary leading-relaxed font-light">
                    “{dailyQuote.text}”
                  </blockquote>
                  <span className="font-display text-[10px] tracking-widest uppercase theme-text-muted text-right font-semibold">
                    — {dailyQuote.author}
                  </span>
                  {dailyQuote.reflection && (
                    <p className="text-[11px] font-serif italic text-bronze-light/90 border-t border-bronze-light/15 pt-2 leading-relaxed">
                      "{dailyQuote.reflection}"
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="pt-2 border-t border-bronze-light/15 flex items-center justify-between text-[9px] theme-text-muted font-mono uppercase tracking-widest">
                <span>Volume I</span>
                <span>Oracle Library</span>
              </div>
            </div>

            {/* Pillar Accent Card */}
            <div className="marble-card p-4 rounded-xl border border-bronze-light/20 flex items-center gap-3 shadow-md">
              <GreekPillar className="w-6 h-12 text-bronze-light/60 flex-shrink-0" />
              <div>
                <span className="font-display text-[9px] tracking-widest uppercase text-bronze-light font-bold block">
                  Ataraxia (Quiet Mind)
                </span>
                <p className="font-serif text-xs italic theme-text-muted">
                  Untouched by external turbulence.
                </p>
              </div>
            </div>
          </div>

          {/* CENTER: MASTER TEMPLE PORTAL CARD */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="bas-relief-card greek-frame shadow-2xl p-6 sm:p-8 md:p-12 relative overflow-hidden w-full flex flex-col items-center text-center gap-8">

              {/* Top Meander Trim */}
              <div className="absolute left-0 right-0 top-0 h-[6px] greek-border opacity-30" />

              {/* Architectural Emblem */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="flex flex-col items-center gap-2 mt-1"
              >
                <GreekTemple className="w-16 h-16 text-bronze-light" />
                <span className="font-display text-[10px] tracking-[0.3em] uppercase text-bronze-light font-bold">
                  Ancient Sanctuary of Reflection
                </span>
              </motion.div>

              {/* Emotionally Resonant Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                className="font-serif text-3xl md:text-4xl lg:text-4xl font-light theme-text-primary leading-relaxed italic max-w-xl mx-auto"
              >
                write what's on your mind. find words that already understood it.
              </motion.h1>

              {/* Greek meander divider */}
              <motion.div
                initial={{ opacity: 0, width: "10%" }}
                animate={{ opacity: 1, width: "75%" }}
                transition={{ duration: 1.5, delay: 0.4 }}
                className="my-1 greek-border mx-auto w-full opacity-30"
              />

              {/* Action Gateway Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-3.5 justify-center items-center w-full max-w-md"
              >
                <button
                  onClick={() => onBegin()}
                  className="btn-sanctuary w-full sm:w-auto px-7 py-3.5 text-xs"
                >
                  <Feather className="w-4 h-4 text-bronze-light" />
                  <span>Inscribe Leaf</span>
                </button>

                <button
                  onClick={onGoToOracle}
                  className="btn-sanctuary-outline w-full sm:w-auto px-5 py-3.5 text-xs"
                >
                  <Sparkles className="w-4 h-4 text-bronze-light" />
                  <span>Oracle</span>
                </button>

                <button
                  onClick={onGoToBreathing}
                  className="btn-sanctuary-outline w-full sm:w-auto px-5 py-3.5 text-xs"
                >
                  <LaurelWreath className="w-4 h-4 text-bronze-light" />
                  <span>Breathing</span>
                </button>
              </motion.div>

              {/* Integrated Tripartite Sanctuary Pillars */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 text-center w-full border-t border-bronze-light/20 pt-6 divide-y md:divide-y-0 md:divide-x divide-bronze-light/20"
              >
                {/* Feature 1 */}
                <div className="flex flex-col items-center gap-2 px-3 pb-3 md:pb-0">
                  <div className="p-1.5 border border-bronze-light/30 bg-bronze-light/10 text-bronze-light rounded-lg">
                    <Feather className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-display tracking-widest text-[10px] uppercase theme-text-primary font-bold">
                    write freely
                  </h3>
                  <p className="font-serif text-xs italic theme-text-muted leading-relaxed font-medium">
                    pour out raw unedited thoughts without form.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="flex flex-col items-center gap-2 px-3 py-3 md:py-0">
                  <div className="p-1.5 border border-bronze-light/30 bg-bronze-light/10 text-bronze-light rounded-lg">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-display tracking-widest text-[10px] uppercase theme-text-primary font-bold">
                    be met, not fixed
                  </h3>
                  <p className="font-serif text-xs italic theme-text-muted leading-relaxed font-medium">
                    paired with classical literary voices.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="flex flex-col items-center gap-2 px-3 pt-3 md:pt-0">
                  <div className="p-1.5 border border-bronze-light/30 bg-bronze-light/10 text-bronze-light rounded-lg">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-display tracking-widest text-[10px] uppercase theme-text-primary font-bold">
                    private by default
                  </h3>
                  <p className="font-serif text-xs italic theme-text-muted leading-relaxed font-medium">
                    saved strictly within your own browser.
                  </p>
                </div>
              </motion.div>

              {/* Bottom Meander Trim */}
              <div className="absolute left-0 right-0 bottom-0 h-[6px] greek-border opacity-30" />
            </div>
          </div>

          {/* RIGHT FLANK: SANCTUARY STATS & AUDIO CHIME COLUMN */}
          <div className="lg:col-span-3 hidden lg:flex flex-col gap-4">
            <div className="marble-card greek-frame p-6 rounded-2xl shadow-xl flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-[3px] column-fluting border-l border-bronze-light/10" />
              <div className="absolute left-0 right-0 top-0 h-[4px] greek-border opacity-30" />

              <div className="flex items-center justify-between border-b border-bronze-light/15 pb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-bronze-light" />
                  <span className="font-display text-[10px] tracking-[0.2em] uppercase text-bronze-light font-bold">
                    Sanctuary Ledger
                  </span>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-widest theme-text-muted">
                  Vault
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 border border-bronze-light/15 rounded-xl bg-stone-50/40 dark:bg-neutral-900/30">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-bronze-light" />
                    <span className="font-serif text-xs italic theme-text-primary font-medium">Inscriptions</span>
                  </div>
                  <span className="font-display text-xs font-bold text-bronze-light">
                    {entriesCount} Leaves
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 border border-bronze-light/15 rounded-xl bg-stone-50/40 dark:bg-neutral-900/30">
                  <div className="flex items-center gap-2.5">
                    <Flame className="w-4 h-4 text-bronze-light" />
                    <span className="font-serif text-xs italic theme-text-primary font-medium">Sanctuary Stillness</span>
                  </div>
                  <span className="font-display text-xs font-bold text-bronze-light">
                    Active
                  </span>
                </div>
              </div>

              {/* Temple Chime Audio Trigger Box */}
              <div className="pt-2 border-t border-bronze-light/15 flex flex-col gap-2">
                <span className="font-display text-[9px] tracking-widest uppercase text-bronze-light font-bold">
                  Acoustic Hearth
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => playTempleBell()}
                    className="p-2 border border-bronze-light/30 hover:border-bronze-light rounded-xl flex items-center justify-center gap-1.5 theme-text-primary text-[10px] font-display uppercase tracking-wider bg-bronze-light/10 hover:bg-bronze-light/20 transition-all"
                  >
                    <Bell className="w-3.5 h-3.5 text-bronze-light" />
                    <span>Bell</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => playSingingBowlSound(216, 2.5)}
                    className="p-2 border border-bronze-light/30 hover:border-bronze-light rounded-xl flex items-center justify-center gap-1.5 theme-text-primary text-[10px] font-display uppercase tracking-wider bg-bronze-light/10 hover:bg-bronze-light/20 transition-all"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-bronze-light" />
                    <span>Bowl</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Pillar Accent Card Right */}
            <div className="marble-card p-4 rounded-xl border border-bronze-light/20 flex items-center justify-between shadow-md">
              <div>
                <span className="font-display text-[9px] tracking-widest uppercase text-bronze-light font-bold block">
                  Classical Heritage
                </span>
                <p className="font-serif text-xs italic theme-text-muted">
                  Stoic & Dialectical Philosophy
                </p>
              </div>
              <GreekPillar className="w-6 h-12 text-bronze-light/60 flex-shrink-0" />
            </div>
          </div>

        </div>
      </main>

      {/* 3. Footer */}
      <footer className="border-t border-bronze-light/15 pt-4 flex flex-wrap justify-between items-center gap-4 text-[10px] theme-text-muted font-sans tracking-wider uppercase font-medium mt-4">
        <span>© {new Date().getFullYear()} Adytum • A silent sanctuary for the pensive mind</span>

        {currentUser && (
          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold theme-text-primary capitalize">
                {currentUser.name}
              </span>
              <span className="text-[9px] font-mono text-bronze-light tracking-wider uppercase">
                @{currentUser.username} • {currentUser.philosophy || "Stoicism"}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-terracotta-muted hover:text-white border border-terracotta-muted/40 bg-terracotta-muted/10 hover:bg-terracotta-muted transition-all shadow-sm group"
              title="Exit Sanctuary & Return to Login Gate"
            >
              <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Logout Gate</span>
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
