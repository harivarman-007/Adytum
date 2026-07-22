import React from "react";

export function GreekPillar({ className = "w-24 h-48" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 200" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Capital (Ionic style scroll volutes) */}
      <path d="M15 35h70" />
      <path d="M15 35c-5 0-9-4-9-9s4-9 9-9 9 4 9 9c0 5-6 5-6 9" />
      <path d="M85 35c5 0 9-4 9-9s-4-9-9-9-9 4-9 9c0 5 6 5 6 9" />
      <path d="M22 35c3 4 8 7 13 7h30c5 0 10-3 13-7" />
      <path d="M25 45h50" />
      
      {/* Shaft with fluting lines */}
      <line x1="28" y1="45" x2="28" y2="165" />
      <line x1="37" y1="45" x2="37" y2="165" opacity="0.6" />
      <line x1="45" y1="45" x2="45" y2="165" opacity="0.8" />
      <line x1="55" y1="45" x2="55" y2="165" opacity="0.8" />
      <line x1="63" y1="45" x2="63" y2="165" opacity="0.6" />
      <line x1="72" y1="45" x2="72" y2="165" />
      
      {/* Base */}
      <path d="M24 165h52" />
      <path d="M20 173h60" />
      <rect x="16" y="181" width="68" height="10" rx="2" />
    </svg>
  );
}

export function GreekTemple({ className = "w-32 h-32" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 100" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Pediment (Triangular roof) */}
      <polygon points="60,10 10,35 110,35" />
      <polygon points="60,16 18,32 102,32" opacity="0.5" />
      
      {/* Architrave */}
      <rect x="12" y="35" width="96" height="6" />
      
      {/* Columns */}
      {/* Left Column */}
      <line x1="22" y1="41" x2="22" y2="80" strokeWidth="2.5" />
      <line x1="20" y1="41" x2="20" y2="80" opacity="0.4" />
      <line x1="24" y1="41" x2="24" y2="80" opacity="0.4" />
      {/* Mid Left Column */}
      <line x1="42" y1="41" x2="42" y2="80" strokeWidth="2.5" />
      <line x1="40" y1="41" x2="40" y2="80" opacity="0.4" />
      <line x1="44" y1="41" x2="44" y2="80" opacity="0.4" />
      {/* Mid Right Column */}
      <line x1="78" y1="41" x2="78" y2="80" strokeWidth="2.5" />
      <line x1="76" y1="41" x2="76" y2="80" opacity="0.4" />
      <line x1="80" y1="41" x2="80" y2="80" opacity="0.4" />
      {/* Right Column */}
      <line x1="98" y1="41" x2="98" y2="80" strokeWidth="2.5" />
      <line x1="96" y1="41" x2="96" y2="80" opacity="0.4" />
      <line x1="100" y1="41" x2="100" y2="80" opacity="0.4" />
      
      {/* Stylobate (Base steps) */}
      <rect x="8" y="80" width="104" height="6" />
      <rect x="4" y="86" width="112" height="6" />
    </svg>
  );
}

export function LaurelWreath({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      {/* Left wreath branch */}
      <path d="M50 85C30 85 15 65 15 45C15 30 25 15 40 10" />
      {/* Left leaves */}
      <path d="M16 65c-3-2-6 0-5 3s4 3 5-3z" fill="currentColor" opacity="0.15" />
      <path d="M16 65c-3-2-6 0-5 3s4 3 5-3z" />
      
      <path d="M15 50c-4-1-6 2-4 5s4 1 4-5z" fill="currentColor" opacity="0.15" />
      <path d="M15 50c-4-1-6 2-4 5s4 1 4-5z" />
      
      <path d="M18 36c-3-3-6-1-5 2s4 2 5-2z" fill="currentColor" opacity="0.15" />
      <path d="M18 36c-3-3-6-1-5 2s4 2 5-2z" />
      
      <path d="M25 24c-2-4-5-2-5 1s3 3 5-1z" fill="currentColor" opacity="0.15" />
      <path d="M25 24c-2-4-5-2-5 1s3 3 5-1z" />
      
      <path d="M35 15c-1-4-4-3-4 0s2 4 4-0z" fill="currentColor" opacity="0.15" />
      <path d="M35 15c-1-4-4-3-4 0s2 4 4-0z" />

      {/* Right wreath branch */}
      <path d="M50 85C70 85 85 65 85 45C85 30 75 15 60 10" />
      {/* Right leaves */}
      <path d="M84 65c3-2 6 0 5 3s-4 3-5-3z" fill="currentColor" opacity="0.15" />
      <path d="M84 65c3-2 6 0 5 3s-4 3-5-3z" />
      
      <path d="M85 50c4-1 6 2 4 5s-4 1-4-5z" fill="currentColor" opacity="0.15" />
      <path d="M85 50c4-1 6 2 4 5s-4 1-4-5z" />
      
      <path d="M82 36c3-3 6-1 5 2s-4 2-5-2z" fill="currentColor" opacity="0.15" />
      <path d="M82 36c3-3 6-1 5 2s-4 2-5-2z" />
      
      <path d="M75 24c2-4 5-2 5 1s-3 3-5-1z" fill="currentColor" opacity="0.15" />
      <path d="M75 24c2-4 5-2 5 1s-3 3-5-1z" />
      
      <path d="M65 15c1-4 4-3 4 0s-2 4-4-0z" fill="currentColor" opacity="0.15" />
      <path d="M65 15c1-4 4-3 4 0s-2 4-4-0z" />
    </svg>
  );
}
