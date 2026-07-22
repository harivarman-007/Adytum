import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, BookOpen, PenTool, Sparkles, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-react";
import { GreekTemple, GreekPillar } from "./GreekTempleSVG";
import { playPageTurnSound, playStoneClickSound, playQuillStrokeSound } from "../lib/audioSynth";

interface EntryScreenProps {
  onBack: () => void;
  onSubmit: (text: string) => void;
  isLoading: boolean;
  initialText?: string;
  date?: string;
}

export default function EntryScreen({ onBack, onSubmit, isLoading, initialText = "", date }: EntryScreenProps) {
  const [text, setText] = useState(initialText);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isQuillAudioEnabled, setIsQuillAudioEnabled] = useState(true);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    // Play tactile quill audio sound on keypress if enabled
    if (isQuillAudioEnabled && newText.length > text.length) {
      playQuillStrokeSound();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      playStoneClickSound();
      playPageTurnSound();
      onSubmit(text);
    }
  };

  // Format selected date beautifully (e.g., "Thursday, 16 July 2026")
  const getFormattedDate = () => {
    if (!date) {
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return new Date().toLocaleDateString("en-US", options);
    }

    const parts = date.split("-");
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return d.toLocaleDateString("en-US", options);
  };

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const estReadTime = Math.ceil(wordCount / 200);

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-all duration-700 selection:bg-bronze-light selection:text-white relative ${
      isZenMode ? "py-6 px-4 max-w-5xl mx-auto" : "py-10 px-6 max-w-4xl mx-auto"
    }`}>
      
      {/* Classical flanking columns (Hidden in Zen Mode) */}
      {!isZenMode && (
        <>
          <div className="absolute left-[-90px] top-1/2 -translate-y-1/2 opacity-20 hidden lg:block text-bronze-light">
            <GreekPillar className="w-16 h-80" />
          </div>
          <div className="absolute right-[-90px] top-1/2 -translate-y-1/2 opacity-20 hidden lg:block text-bronze-light">
            <GreekPillar className="w-16 h-80" />
          </div>
        </>
      )}

      {/* Mini header (Fades in Zen Mode) */}
      <AnimatePresence>
        {!isZenMode && (
          <motion.header
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center pb-4 border-b border-bronze-light/10"
          >
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-xs tracking-wider uppercase theme-text-muted hover:text-bronze-light transition-colors group font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Exit Ledger</span>
            </button>
            <div className="flex items-center gap-2">
              <PenTool className="w-3.5 h-3.5 text-bronze-light" />
              <span className="font-display tracking-[0.2em] text-[10px] uppercase text-bronze-dark dark:text-bronze-light font-bold">
                {initialText ? "Edit Inscription" : "Sacred Ledger"}
              </span>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Writing form */}
      <main className="my-auto py-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Title Header (Fades in Zen Mode) */}
          <AnimatePresence>
            {!isZenMode && (
              <motion.div
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center gap-2 mb-2"
              >
                <GreekTemple className="w-10 h-10 text-bronze-light/60" />
                <span className="font-display text-[11px] tracking-[0.3em] uppercase text-bronze-light font-bold">
                  {initialText ? "Revising Leaf" : "Inscribing the Day"}
                </span>
                <h2 className="font-serif text-2xl italic theme-text-primary font-medium tracking-wide">
                  {getFormattedDate()}
                </h2>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Slate Toolbar: Zen Mode Toggle & Quill Audio Toggle */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              {/* Quill Audio Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  playStoneClickSound();
                  setIsQuillAudioEnabled(!isQuillAudioEnabled);
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
                  isQuillAudioEnabled
                    ? "border-bronze-light/40 bg-bronze-light/15 text-bronze-dark dark:text-bronze-light font-semibold shadow-sm"
                    : "border-bronze-light/20 text-neutral-500 hover:border-bronze-light/40"
                }`}
                title="Tactile Quill Audio Feedback"
              >
                {isQuillAudioEnabled ? <Volume2 className="w-3.5 h-3.5 text-bronze-light" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="font-display text-[10px] uppercase tracking-wider">
                  Quill Audio: {isQuillAudioEnabled ? "ON" : "OFF"}
                </span>
              </button>
            </div>

            {/* Zen Focus Mode Toggle Button */}
            <button
              type="button"
              onClick={() => {
                playStoneClickSound();
                setIsZenMode(!isZenMode);
              }}
              className={`px-3.5 py-1.5 rounded-lg border text-xs flex items-center gap-2 transition-all font-display uppercase tracking-wider font-bold shadow-sm ${
                isZenMode
                  ? "border-bronze-light bg-bronze-light/25 text-bronze-dark dark:text-bronze-light animate-pulse"
                  : "border-bronze-light/30 hover:border-bronze-light bg-stone-50/60 dark:bg-neutral-900/60 theme-text-primary"
              }`}
              title="Toggle Distraction-Free Zen Focus Mode"
            >
              {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-bronze-light" />}
              <span>{isZenMode ? "Exit Zen Focus" : "Zen Focus"}</span>
            </button>
          </div>

          {/* Papyrus Scroll & Bas-Relief Sculpted Tablet */}
          <motion.div
            initial={{ scaleY: 0.1, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ transformOrigin: "top center" }}
            className="flex flex-col shadow-2xl rounded-2xl"
          >
            {/* Top Wooden Scroll Roller Bar */}
            <div className="scroll-roller-top flex items-center justify-center">
              <div className="w-12 h-1 bg-[#D4AF37]/50 rounded-full shadow-inner" />
            </div>

            <div className="relative p-8 sm:p-12 md:p-14 bas-relief-card greek-frame overflow-hidden transition-all duration-500 rounded-none border-y-0">
              
              {/* Symmetrical top and bottom meander trims */}
              <div className="absolute left-0 right-0 top-0 h-[6px] greek-border opacity-30" />
              <div className="absolute left-0 right-0 bottom-0 h-[6px] greek-border opacity-30" />

              {/* Clean Native Textarea */}
              <textarea
                value={text}
                onChange={handleTextChange}
                disabled={isLoading}
                rows={isZenMode ? 14 : 10}
                placeholder="What occupies your mind? Write without hesitation or form... let your quietest thoughts flow onto this marble page."
                className="w-full bg-transparent border-none outline-none resize-none font-serif text-xl italic leading-relaxed theme-text-primary placeholder:text-neutral-400/80 p-2 mt-2 font-medium"
                style={{ minHeight: isZenMode ? "420px" : "280px" }}
                autoFocus
              />
              
              {/* Word Count Footer Accent */}
              <div className="flex justify-between items-center pt-4 border-t border-bronze-light/10 text-xs theme-text-muted">
                <span className="font-mono text-[10px] tracking-wider uppercase opacity-80">
                  {wordCount} {wordCount === 1 ? "word" : "words"} • ~{estReadTime} min read
                </span>
                <span className="font-serif italic text-xs opacity-75">
                  Stoic Ledger Manuscript
                </span>
              </div>
            </div>

            {/* Bottom Wooden Scroll Roller Bar */}
            <div className="scroll-roller-bottom flex items-center justify-center">
              <div className="w-12 h-1 bg-[#D4AF37]/50 rounded-full shadow-inner" />
            </div>
          </motion.div>

          {/* Action button */}
          <div className="flex justify-center mt-3">
            <button
              type="submit"
              disabled={isLoading || !text.trim()}
              className="btn-sanctuary px-12 py-4 text-xs disabled:opacity-30 shadow-xl font-bold uppercase tracking-widest"
            >
              {isLoading ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-bronze-light animate-ping" />
                  <span>consulting the oracles...</span>
                </>
              ) : (
                initialText ? "re-analyze & save" : "reflect"
              )}
            </button>
          </div>
        </form>
      </main>

      {/* Mini Footer (Fades in Zen Mode) */}
      {!isZenMode && (
        <footer className="text-center text-[10px] theme-text-muted font-sans tracking-wider uppercase mt-4 font-medium">
          “He who is brave is free.” — Seneca
        </footer>
      )}
    </div>
  );
}
