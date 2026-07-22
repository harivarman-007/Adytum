import React, { useState } from "react";
import { Volume2, VolumeX, Bell, Palette, ChevronUp, ChevronDown } from "lucide-react";
import { playTempleBell } from "../lib/audioSynth";

export type ThemePreset = "athenian" | "starry" | "blossom" | "venus" | "wave" | "creation" | "klimt";

interface SanctuaryAudioBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTheme: ThemePreset;
  onSelectTheme: (theme: ThemePreset) => void;
}

export default function SanctuaryAudioBar({
  isPlaying,
  onTogglePlay,
  currentTheme,
  onSelectTheme
}: SanctuaryAudioBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const THEMES: { id: ThemePreset; label: string; colorDot: string }[] = [
    { id: "athenian", label: "Athenian Academy (Raphael)", colorDot: "bg-[#D4AF37]" },
    { id: "starry", label: "Starry Night (van Gogh)", colorDot: "bg-[#3B82F6]" },
    { id: "blossom", label: "Plum Garden Blossom (Hiroshige)", colorDot: "bg-[#F43F5E]" },
    { id: "venus", label: "Birth of Venus (Botticelli)", colorDot: "bg-[#FB7185]" },
    { id: "wave", label: "The Great Wave (Hokusai)", colorDot: "bg-[#1E40AF]" },
    { id: "creation", label: "Creation of Adam (Michelangelo)", colorDot: "bg-[#D97706]" },
    { id: "klimt", label: "The Kiss in Gold (Klimt)", colorDot: "bg-[#EAB308]" },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 selection:bg-bronze-light selection:text-white">
      {/* Expanded Control Panel */}
      {isExpanded && (
        <div className="marble-card greek-frame p-4 shadow-2xl flex flex-col gap-3 min-w-[240px] animate-fadeIn">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-bronze-light/10 pb-2">
            <span className="font-display text-[9px] tracking-[0.2em] uppercase text-bronze-light font-bold">
              Masterpiece Atmosphere
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-neutral-400 hover:text-neutral-200"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sound Control Row */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-serif text-xs italic text-neutral-600 dark:text-neutral-300">
              Ancient Grove Audio
            </span>
            <button
              onClick={onTogglePlay}
              className={`p-1.5 border text-xs flex items-center gap-1 transition-all rounded-lg ${
                isPlaying
                  ? "border-bronze-light bg-bronze-light/15 text-bronze-dark dark:text-bronze-light font-semibold"
                  : "border-bronze-light/20 text-neutral-600 dark:text-neutral-300 hover:border-bronze-light"
              }`}
            >
              {isPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="font-mono text-[9px] uppercase">{isPlaying ? "Mute" : "Play"}</span>
            </button>
          </div>

          {/* Temple Bell Trigger */}
          <button
            onClick={() => playTempleBell()}
            className="w-full py-2 px-3 border border-bronze-light/30 hover:border-bronze-light text-neutral-800 dark:text-neutral-100 text-xs font-serif italic transition-all flex items-center justify-center gap-2 bg-bronze-light/5 hover:bg-bronze-light/15 rounded-lg"
          >
            <Bell className="w-3.5 h-3.5 text-bronze-light" />
            <span>Ring Temple Bell</span>
          </button>

          {/* Theme Preset Selector */}
          <div className="flex flex-col gap-1.5 mt-1 border-t border-bronze-light/10 pt-2">
            <span className="font-display text-[8px] tracking-wider uppercase text-neutral-500 dark:text-neutral-400 font-semibold">
              Masterwork Art Gallery
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {THEMES.map((th) => (
                <button
                  key={th.id}
                  onClick={() => onSelectTheme(th.id)}
                  className={`p-2 border text-[10px] uppercase tracking-wider font-display flex items-center justify-between transition-all rounded-lg ${
                    currentTheme === th.id
                      ? "border-bronze-light bg-bronze-light/20 text-neutral-900 dark:text-neutral-50 font-bold"
                      : "border-bronze-light/15 text-neutral-600 dark:text-neutral-300 hover:border-bronze-light/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${th.colorDot} border border-bronze-light/40`} />
                    <span className="truncate">{th.label}</span>
                  </div>
                  {currentTheme === th.id && (
                    <span className="text-[8px] text-bronze-light font-mono">ACTIVE</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Floating Medallion Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-11 h-11 rounded-full border flex items-center justify-center shadow-xl transition-all cursor-pointer ${
          isPlaying
            ? "border-bronze-light bg-bronze-light/15 text-bronze-dark dark:text-bronze-light scale-105"
            : "border-bronze-light/40 bg-stone-50/90 dark:bg-neutral-900/90 text-neutral-400 hover:border-bronze-light"
        }`}
        title="Sanctuary Atmosphere & Audio Settings"
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          {isPlaying && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bronze-light opacity-35" />
          )}
          {isPlaying ? (
            <Volume2 className="w-4 h-4 text-bronze-light" />
          ) : (
            <Palette className="w-4 h-4 text-bronze-light" />
          )}
        </span>
      </button>
    </div>
  );
}
