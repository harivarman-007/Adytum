import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RefreshCw, Edit3, Save, Check, Printer } from "lucide-react";
import { LaurelWreath } from "./GreekTempleSVG";
import { printParchmentEntry } from "../lib/exportParchment";
import { playStoneClickSound } from "../lib/audioSynth";
import CameoBadge from "./CameoBadge";

interface QuoteRevealProps {
  entryText: string;
  mood: string;
  moodLabel: string;
  color: string;
  quote: string;
  author: string;
  themes: string[];
  onSave: (finalQuote: string, finalAuthor: string) => void;
  onRetry: () => void;
  isRetrying: boolean;
}

export default function QuoteReveal({
  entryText,
  mood,
  moodLabel,
  color,
  quote,
  author,
  themes,
  onSave,
  onRetry,
  isRetrying
}: QuoteRevealProps) {
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [customQuote, setCustomQuote] = useState(quote);
  const [customAuthor, setCustomAuthor] = useState(author);

  // Map desaturated classical colors based on mood color identifiers
  const getColorClasses = (colorName: string) => {
    switch (colorName) {
      case "sage":
        return {
          bg: "bg-sage-muted/10 dark:bg-sage-muted/20",
          text: "text-sage-muted",
          border: "border-sage-muted/35"
        };
      case "purple":
        return {
          bg: "bg-purple-muted/10 dark:bg-purple-muted/20",
          text: "text-purple-muted",
          border: "border-purple-muted/35"
        };
      case "terracotta":
        return {
          bg: "bg-terracotta-muted/10 dark:bg-terracotta-muted/20",
          text: "text-terracotta-muted",
          border: "border-terracotta-muted/35"
        };
      case "amber":
        return {
          bg: "bg-amber-muted/10 dark:bg-amber-muted/20",
          text: "text-amber-muted",
          border: "border-amber-muted/35"
        };
      case "rose":
        return {
          bg: "bg-rose-muted/10 dark:bg-rose-muted/20",
          text: "text-rose-muted",
          border: "border-rose-muted/35"
        };
      case "gray":
      default:
        return {
          bg: "bg-gray-muted/10 dark:bg-gray-muted/20",
          text: "text-gray-muted",
          border: "border-gray-muted/35"
        };
    }
  };

  const colors = getColorClasses(color);

  const handleSaveClick = () => {
    onSave(customQuote, customAuthor);
  };

  return (
    <div id="quote-reveal" className="min-h-screen flex flex-col justify-between py-12 px-6 max-w-4xl mx-auto selection:bg-bronze-light selection:text-white">
      {/* Mini header */}
      <header className="flex justify-between items-center pb-4 border-b border-bronze-light/10">
        <div className="flex items-center gap-2 text-xs tracking-wider uppercase text-neutral-500">
          <LaurelWreath className="w-5 h-5 text-bronze-light" />
          <span>The Oracular Pair</span>
        </div>
        <span className="font-display tracking-[0.2em] text-[10px] uppercase text-bronze-dark dark:text-bronze-light">
          Response
        </span>
      </header>

      {/* Quote Display Area */}
      <main className="my-auto py-8">
        <div className="bas-relief-card greek-frame shadow-2xl p-8 sm:p-12 relative min-h-[420px] flex flex-col justify-center overflow-hidden">
          
          {/* Beautiful symmetric top and bottom meander trims */}
          <div className="absolute left-0 right-0 top-0 h-[6px] greek-border opacity-20" />
          <div className="absolute left-0 right-0 bottom-0 h-[6px] greek-border opacity-20" />

          <AnimatePresence mode="wait">
            {isRetrying ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center gap-4"
              >
                <RefreshCw className="w-8 h-8 text-bronze-light animate-spin" />
                <p className="font-serif italic text-sm text-neutral-500">
                  Searching the libraries of ancient stone...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="reveal-content"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="flex flex-col gap-6 mt-2 mb-2"
              >
                {/* Cameo Glass Mood Badge - Centered and Symmetrical */}
                <div className="flex flex-col items-center gap-3">
                  <CameoBadge mood={mood} moodLabel={moodLabel} size="lg" />

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {themes.map((t, idx) => (
                      <span key={idx} className="text-[10px] font-mono italic text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Greek border line decoration */}
                <div className="greek-border my-2" />

                {/* Custom Line / Generated Quote Area */}
                {isEditingCustom ? (
                  <div className="flex flex-col gap-4 border border-bronze-light/20 p-6 bg-stone-50/50 dark:bg-neutral-900/20 text-center">
                    <span className="font-display text-[9px] tracking-[0.2em] uppercase text-bronze-light block mx-auto">
                      Your custom line
                    </span>
                    <textarea
                      value={customQuote}
                      onChange={(e) => setCustomQuote(e.target.value)}
                      rows={4}
                      className="w-full bg-transparent border-b border-bronze-light/10 outline-none resize-none font-serif text-xl italic leading-relaxed text-neutral-700 dark:text-neutral-200 p-1 text-center"
                      placeholder="Write your own quote or alternative line..."
                    />
                    <input
                      type="text"
                      value={customAuthor}
                      onChange={(e) => setCustomAuthor(e.target.value)}
                      className="w-full bg-transparent border-none outline-none font-sans text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 p-1 text-center"
                      placeholder="Author name (or 'Self')"
                    />
                    <button
                      onClick={() => setIsEditingCustom(false)}
                      className="self-center inline-flex items-center gap-2 text-[10px] tracking-wider uppercase text-neutral-500 hover:text-bronze-dark dark:hover:text-bronze-light transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm custom line</span>
                    </button>
                  </div>
                ) : (
                  <div className="relative py-4 px-4">
                    {/* Absolute subtle quotes markings */}
                    <span className="absolute -top-6 left-4 text-7xl font-serif text-bronze-light/20 select-none">“</span>
                    
                    <blockquote className="font-serif text-2xl md:text-3xl font-light theme-text-primary italic leading-relaxed text-center px-4">
                      {customQuote}
                    </blockquote>
                    
                    <div className="flex justify-center items-center gap-2 mt-6 text-center">
                      <span className="w-5 h-[1px] bg-bronze-light/40" />
                      <cite className="not-italic font-sans text-xs tracking-widest theme-text-muted uppercase font-medium">
                        {customAuthor || "Unknown"}
                      </cite>
                      <span className="w-5 h-[1px] bg-bronze-light/40" />
                    </div>
                  </div>
                )}

                {/* Greek border line decoration */}
                <div className="greek-border my-2" />

                {/* Action Buttons: retry & write my own side by side */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={onRetry}
                    disabled={isEditingCustom}
                    className="btn-sanctuary-outline py-3 text-[10px] disabled:opacity-20"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>retry</span>
                  </button>
                  <button
                    onClick={() => setIsEditingCustom(true)}
                    disabled={isEditingCustom}
                    className="btn-sanctuary-outline py-3 text-[10px] disabled:opacity-20"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>write my own</span>
                  </button>
                </div>

                {/* Primary save button below */}
                <div className="flex justify-center gap-3 mt-2">
                  <button
                    onClick={() => {
                      playStoneClickSound();
                      printParchmentEntry({
                        date: new Date().toISOString().slice(0, 10),
                        text: entryText,
                        moodLabel,
                        quote: customQuote,
                        author: customAuthor,
                        themes
                      });
                    }}
                    className="btn-sanctuary-outline px-6 py-3.5 text-xs"
                    title="Export as Parchment / Print PDF"
                  >
                    <Printer className="w-3.5 h-3.5 text-bronze-light" />
                    <span>Print PDF</span>
                  </button>
                  <button
                    onClick={() => {
                      playStoneClickSound();
                      handleSaveClick();
                    }}
                    disabled={isEditingCustom || !customQuote.trim()}
                    className="btn-sanctuary px-10 py-3.5 text-xs disabled:opacity-20"
                  >
                    <Save className="w-3.5 h-3.5 text-bronze-light" />
                    <span>save today</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Mini Footer */}
      <footer className="text-center text-[10px] text-neutral-400 dark:text-neutral-500 font-sans tracking-wider uppercase">
        “There is a voice that doesn’t use words. Listen.” — Rumi
      </footer>
    </div>
  );
}
