import React from "react";
import { Sparkles, Moon, Flame, Sun, Droplets, Heart, Feather } from "lucide-react";
import { LaurelWreath } from "./GreekTempleSVG";

interface CameoBadgeProps {
  mood?: string;
  moodLabel?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
}

export default function CameoBadge({
  mood = "ataraxia",
  moodLabel,
  size = "md",
  className = "",
  showLabel = true,
}: CameoBadgeProps) {
  const norm = (moodLabel || mood || "ataraxia").toLowerCase();

  // Determine cameo motif details based on classical emotional climate
  let title = "ATARAXIA";
  let subtitle = "Tranquility";
  let bgGradient = "from-emerald-900/90 via-stone-900 to-emerald-950";
  let borderColor = "border-[#D4AF37]";
  let iconColor = "text-emerald-300";
  let glowColor = "rgba(16, 185, 129, 0.4)";
  let IconComponent = LaurelWreath;

  if (norm.includes("melancholia") || norm.includes("solitude") || norm.includes("sad")) {
    title = "MELANCHOLIA";
    subtitle = "Solitude";
    bgGradient = "from-indigo-950 via-slate-900 to-blue-950";
    borderColor = "border-[#94A3B8]";
    iconColor = "text-indigo-300";
    glowColor = "rgba(99, 102, 241, 0.4)";
    IconComponent = Moon;
  } else if (norm.includes("enthousiasmos") || norm.includes("inspiration") || norm.includes("joy")) {
    title = "ENTHOUSIASMOS";
    subtitle = "Inspiration";
    bgGradient = "from-amber-900 via-stone-900 to-yellow-950";
    borderColor = "border-[#EAB308]";
    iconColor = "text-amber-300";
    glowColor = "rgba(234, 179, 8, 0.4)";
    IconComponent = Flame;
  } else if (norm.includes("catharsis") || norm.includes("release") || norm.includes("cleansing")) {
    title = "CATHARSIS";
    subtitle = "Release";
    bgGradient = "from-[#4A0E17] via-stone-900 to-[#2A050A]";
    borderColor = "border-[#F43F5E]";
    iconColor = "text-rose-300";
    glowColor = "rgba(244, 63, 94, 0.4)";
    IconComponent = Droplets;
  } else if (norm.includes("aponia") || norm.includes("peace") || norm.includes("sigh")) {
    title = "APONIA";
    subtitle = "Peaceful Sigh";
    bgGradient = "from-purple-950 via-stone-900 to-slate-950";
    borderColor = "border-[#C084FC]";
    iconColor = "text-purple-300";
    glowColor = "rgba(192, 132, 252, 0.4)";
    IconComponent = Sun;
  }

  // Size configurations
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[8px] gap-1.5 min-h-[22px]",
    md: "px-3 py-1 text-[10px] gap-2 min-h-[28px]",
    lg: "px-4 py-1.5 text-xs gap-2.5 min-h-[34px]",
  }[size];

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  }[size];

  return (
    <div
      className={`inline-flex items-center rounded-full bg-gradient-to-r ${bgGradient} ${borderColor} border-2 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:shadow-xl font-display tracking-widest uppercase text-neutral-100 ${sizeClasses} ${className}`}
      style={{
        boxShadow: `0 4px 14px ${glowColor}, inset 0 1px 2px rgba(255, 255, 255, 0.35), inset 0 -2px 4px rgba(0, 0, 0, 0.7)`,
      }}
      title={`Greco-Roman Cameo Medallion: ${title} (${subtitle})`}
    >
      {/* Relief Icon */}
      <div className={`flex items-center justify-center p-0.5 rounded-full bg-black/40 border border-white/20 shadow-inner ${iconColor}`}>
        <IconComponent className={iconSizes} />
      </div>

      {/* Cameo Title */}
      {showLabel && (
        <span className="font-semibold text-neutral-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {title}
        </span>
      )}
    </div>
  );
}
