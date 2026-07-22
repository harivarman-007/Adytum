import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ChevronRight, X, Sparkles, BookOpen, Printer } from "lucide-react";
import { MonthlyRecap } from "../types";
import { GreekPillar, LaurelWreath } from "./GreekTempleSVG";
import { printParchmentRecap } from "../lib/exportParchment";
import { playStoneClickSound } from "../lib/audioSynth";

interface MonthlyRecapViewProps {
  recap: MonthlyRecap;
  onClose: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  monthName?: string;
}

export default function MonthlyRecapView({ 
  recap, 
  onClose,
  onSave,
  isSaved = false,
  monthName = "This Month"
}: MonthlyRecapViewProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const handleNext = () => {
    if (currentSlideIndex < recap.slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const currentSlide = recap.slides[currentSlideIndex];

  return (
    <div id="monthly-recap-flow" className="min-h-screen bg-stone-100/90 dark:bg-neutral-950/95 fixed inset-0 z-50 flex flex-col justify-between py-12 px-6 max-w-2xl mx-auto backdrop-blur-md selection:bg-bronze-light selection:text-white">
      {/* Header */}
      <header className="flex justify-between items-center pb-4 border-b border-bronze-light/10">
        <div className="flex items-center gap-2 text-xs tracking-wider uppercase text-neutral-500">
          <BookOpen className="w-4 h-4 text-bronze-light" />
          <span>The Monthly Scroll — {monthName}</span>
        </div>
        
        {/* Progress Dot Indicators (at top, not a numbered counter) */}
        <div className="flex items-center gap-2">
          {recap.slides.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentSlideIndex 
                  ? "w-6 bg-bronze-light" 
                  : "w-1.5 bg-neutral-300 dark:bg-neutral-800"
              }`}
            />
          ))}
        </div>

        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-bronze-dark dark:hover:text-bronze-light p-1 transition-colors"
          title="Close recap"
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      {/* Main Slide Content Area */}
      <main className="my-auto py-10 relative flex flex-col items-center w-full">
        {/* Classical Left and Right Pillar Accents on wider screens to frame the scroll */}
        <div className="absolute left-[-80px] top-1/2 -translate-y-1/2 opacity-20 hidden md:block text-bronze-light">
          <GreekPillar className="w-16 h-64" />
        </div>
        <div className="absolute right-[-80px] top-1/2 -translate-y-1/2 opacity-20 hidden md:block text-bronze-light">
          <GreekPillar className="w-16 h-64" />
        </div>

        {/* Recap Title (Only shown or styled beautifully on first slide or top) */}
        <div className="text-center mb-4">
          <span className="font-display text-[9px] tracking-[0.3em] uppercase text-bronze-light block mb-1.5">
            Poetic Synthesis
          </span>
          <h2 className="font-serif text-2xl italic text-neutral-800 dark:text-neutral-100 font-normal tracking-wide">
            {recap.title}
          </h2>
        </div>

        {/* Beautiful meander container board for the narrative scrolls */}
        <div className="w-full marble-card greek-frame p-8 sm:p-10 shadow-xl relative overflow-hidden my-4 min-h-[260px] flex flex-col justify-center items-center">
          {/* Subtle fluting column trims */}
          <div className="absolute left-0 top-0 bottom-0 w-[4px] column-fluting border-r border-bronze-light/10" />
          <div className="absolute right-0 top-0 bottom-0 w-[4px] column-fluting border-l border-bronze-light/10" />
          
          {/* Symmetrical meander trims on top and bottom borders */}
          <div className="absolute left-0 right-0 top-0 h-[6px] greek-border opacity-20" />
          <div className="absolute left-0 right-0 bottom-0 h-[6px] greek-border opacity-20" />

          <div className="w-full flex flex-col justify-center items-center text-center px-4 py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlideIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="flex flex-col gap-6 items-center"
              >
                {/* Poetic prose paragraph in gorgeous serif typography */}
                <p className="font-serif text-lg md:text-xl text-neutral-800 dark:text-neutral-200 leading-relaxed font-light italic max-w-xl">
                  {currentSlide.prose}
                </p>

                {/* Muted desaturated tag chips under the prose */}
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {currentSlide.themes.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 text-[10px] font-mono italic text-neutral-500 dark:text-neutral-400 bg-neutral-200/40 dark:bg-neutral-800/40 border border-neutral-300/30 dark:border-neutral-700/30 rounded-none uppercase tracking-wider"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer controls: Single continue button to advance slowly */}
      <footer className="flex flex-col items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              playStoneClickSound();
              printParchmentRecap({
                title: recap.title,
                slides: recap.slides,
                monthKey: monthName
              });
            }}
            className="px-5 py-3 border border-bronze-light/35 hover:border-bronze-light text-neutral-700 dark:text-neutral-200 uppercase tracking-widest text-xs rounded-none bg-transparent hover:bg-bronze-light/10 transition-all duration-300 flex items-center gap-2"
            title="Export as Parchment / Print PDF"
          >
            <Printer className="w-3.5 h-3.5 text-bronze-light" />
            <span>Parchment PDF</span>
          </button>
          {currentSlideIndex === recap.slides.length - 1 && onSave && (
            <button
              onClick={onSave}
              disabled={isSaved}
              className={`px-6 py-3 border text-xs uppercase tracking-widest rounded-none transition-all duration-300 flex items-center gap-2 ${
                isSaved
                  ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 cursor-default"
                  : "border-bronze-light text-bronze-dark dark:text-bronze-light hover:bg-bronze-light/10 bg-bronze-light/5"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSaved ? "Inscribed in Chronicles" : "Inscribe to Chronicles"}</span>
            </button>
          )}

          <button
            onClick={handleNext}
            className="px-10 py-3 border border-bronze-light hover:border-bronze-dark text-neutral-800 dark:text-neutral-100 uppercase tracking-widest text-xs rounded-none bg-transparent hover:bg-bronze-light/5 transition-all duration-300 flex items-center gap-3.5 shadow-sm"
          >
            <span>
              {currentSlideIndex < recap.slides.length - 1 ? "continue" : "close ledger scroll"}
            </span>
            <ChevronRight className="w-4 h-4 text-bronze-light" />
          </button>
        </div>

        <span className="text-[9px] font-sans tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
          Slide {currentSlideIndex + 1} of {recap.slides.length} — Read at your own pace
        </span>
      </footer>
    </div>
  );
}
