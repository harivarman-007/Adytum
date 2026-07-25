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
    const k = (moodKey || "").trim().toUpperCase();
    if (k.includes("ATARAXIA") || k.includes("TRANQUILITY") || k.includes("PEACE")) return "#10B981"; // Emerald Green
    if (k.includes("MELANCHOLIA") || k.includes("SORROW")) return "#A855F7"; // Royal Amethyst Purple
    if (k.includes("CATHARSIS") || k.includes("RELEASE")) return "#F97316"; // Terracotta Orange
    if (k.includes("ENTHOUSIASMOS") || k.includes("PASSION")) return "#F59E0B"; // Gilded Gold
    if (k.includes("EUDAIMONIA") || k.includes("JOY")) return "#EAB308"; // Sunflower Yellow
    if (k.includes("APATEIA") || k.includes("EQUANIMITY")) return "#06B6D4"; // Cyan Sky
    if (k.includes("NOSTALGIA") || k.includes("MEMORY")) return "#0EA5E9"; // Sapphire Azure
    if (k.includes("SOLITUDE") || k.includes("QUIET")) return "#6366F1"; // Indigo Slate
    if (k.includes("GRATITUDE") || k.includes("THANKFUL")) return "#EC4899"; // Dawn Rose
    if (k.includes("AWE") || k.includes("WONDER")) return "#FF6B6B"; // Electric Coral
    if (k.includes("CLARITY") || k.includes("WISDOM")) return "#3B82F6"; // Electric Blue

    // Deterministic hash fallback ensuring every single unique emotion gets a distinct color
    let hash = 0;
    for (let i = 0; i < k.length; i++) {
      hash = k.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ["#10B981", "#A855F7", "#F97316", "#F59E0B", "#EAB308", "#06B6D4", "#0EA5E9", "#6366F1", "#EC4899", "#FF6B6B", "#3B82F6"];
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="relative flex items-center justify-center my-1">
        <svg width={size} height={size} className="transform -rotate-90 filter drop-shadow-md">
          {climate.map((item) => {
            const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -currentAngleOffset;
            currentAngleOffset += (item.percentage / 100) * circumference;
            const isSelected = selectedMoodFilter === item.mood;
            const isHovered = hoveredMood?.mood === item.mood;
            const moodColor = getMoodColorHex(item.mood);

            return (
              <circle
                key={item.mood}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={moodColor}
                strokeWidth={isSelected || isHovered ? strokeWidth + 5 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 cursor-pointer hover:opacity-100 opacity-90"
                style={{
                  filter: isHovered || isSelected ? `drop-shadow(0 0 8px ${moodColor}aa)` : "none"
                }}
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
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <span
                className="font-display text-[10px] tracking-wider uppercase block font-bold"
                style={{ color: getMoodColorHex(hoveredMood.mood) }}
              >
                {hoveredMood.mood}
              </span>
              <span className="font-mono text-xs font-bold text-bronze-light">
                {hoveredMood.percentage}%
              </span>
            </motion.div>
          ) : selectedMoodFilter ? (
            <div>
              <span
                className="font-display text-[10px] tracking-wider uppercase block font-bold"
                style={{ color: getMoodColorHex(selectedMoodFilter) }}
              >
                {selectedMoodFilter}
              </span>
              <span className="font-serif text-[10px] italic text-neutral-400">Filter Active</span>
            </div>
          ) : (
            <div>
              <span className="font-display text-[8px] tracking-[0.2em] uppercase text-neutral-400 block font-bold">
                Climate
              </span>
              <span className="font-serif text-[11px] italic theme-text-primary font-semibold">
                {climate.length} {climate.length === 1 ? "Climate" : "Climates"}
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
