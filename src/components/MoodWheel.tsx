import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

interface MoodWheelItem {
  mood: string;
  count: number;
  percentage: number;
  label: string;
  bg: string;
  text: string;
}

interface MoodWheelProps {
  climate: MoodWheelItem[];
  selectedMoodFilter: string | null;
  onSelectMoodFilter: (moodKey: string | null) => void;
}

export default function MoodWheel({ climate, selectedMoodFilter, onSelectMoodFilter }: MoodWheelProps) {
  const [hoveredMood, setHoveredMood] = useState<MoodWheelItem | null>(null);

  if (!climate || climate.length === 0) return null;

  // SVG Polar Donut calculations
  const size = 180;
  const center = size / 2;
  const radius = 64;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  let currentAngleOffset = 0;

  const getMoodColorHex = (moodKey: string) => {
    const k = (moodKey || "").toUpperCase();
    switch (k) {
      case "ATARAXIA":
        return "#708238"; // Rich Olive Green
      case "MELANCHOLIA":
        return "#A0522D"; // Rich Terracotta / Sienna
      case "CATHARSIS":
        return "#D97706"; // Amber Gold
      case "ENTHOUSIASMOS":
        return "#D4AF37"; // Gilded Gold
      case "NOSTALGIA":
        return "#B91C1C"; // Crimson Rose
      default:
        return "#8B5CF6";
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="relative flex items-center justify-center my-1">
        <svg width={size} height={size} className="transform -rotate-90">
          {climate.map((item) => {
            const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -currentAngleOffset;
            currentAngleOffset += (item.percentage / 100) * circumference;
            const isSelected = selectedMoodFilter === item.mood;
            const isHovered = hoveredMood?.mood === item.mood;

            return (
              <circle
                key={item.mood}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={getMoodColorHex(item.mood)}
                strokeWidth={isSelected || isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 cursor-pointer hover:opacity-100 opacity-85"
                onMouseEnter={() => setHoveredMood(item)}
                onMouseLeave={() => setHoveredMood(null)}
                onClick={() => {
                  if (selectedMoodFilter === item.mood) {
                    onSelectMoodFilter(null);
                  } else {
                    onSelectMoodFilter(item.mood);
                  }
                }}
              />
            );
          })}
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
          {hoveredMood ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span className="font-display text-[9px] tracking-wider uppercase block text-neutral-700 dark:text-neutral-200">
                {hoveredMood.mood}
              </span>
              <span className="font-sans text-[11px] font-semibold text-bronze-light">
                {hoveredMood.percentage}%
              </span>
            </motion.div>
          ) : selectedMoodFilter ? (
            <div>
              <span className="font-display text-[9px] tracking-wider uppercase block text-bronze-light">
                {selectedMoodFilter}
              </span>
              <span className="font-serif text-[10px] italic text-neutral-400">Filter Active</span>
            </div>
          ) : (
            <div>
              <span className="font-display text-[8px] tracking-[0.2em] uppercase text-neutral-400 block">
                Climate
              </span>
              <span className="font-serif text-[11px] italic text-neutral-600 dark:text-neutral-300">
                {climate.length} Moods
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Mood Badges List */}
      <div className="flex flex-col gap-1.5 w-full">
        {climate.map((item) => {
          const isSelected = selectedMoodFilter === item.mood;
          return (
            <button
              key={item.mood}
              onClick={() => {
                if (selectedMoodFilter === item.mood) {
                  onSelectMoodFilter(null);
                } else {
                  onSelectMoodFilter(item.mood);
                }
              }}
              onMouseEnter={() => setHoveredMood(item)}
              onMouseLeave={() => setHoveredMood(null)}
              className={`px-3 py-1.5 border rounded-lg text-left transition-all flex items-center justify-between ${
                isSelected
                  ? "border-bronze-light bg-bronze-light/15 shadow-sm"
                  : "border-bronze-light/15 hover:border-bronze-light/35 bg-stone-50/40 dark:bg-neutral-900/40"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: getMoodColorHex(item.mood) }}
                />
                <span className="font-display text-[10px] uppercase tracking-wider theme-text-primary font-bold">
                  {item.mood}
                </span>
              </div>
              <span className="font-mono text-xs text-bronze-light font-bold ml-2">
                {item.percentage}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
