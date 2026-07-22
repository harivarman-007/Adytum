import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Play, Pause, RefreshCw, Volume2, VolumeX, Sparkles } from "lucide-react";
import { GreekTemple, LaurelWreath } from "./GreekTempleSVG";
import { playTempleBell, playSingingBowlSound } from "../lib/audioSynth";

interface BreathingSanctuaryProps {
  onBack: () => void;
}

type BreathPhase = "inhale" | "holdIn" | "exhale" | "holdOut";

const PHASES_INFO = {
  inhale: {
    title: "Draw in the breath",
    instruction: "Inhale slowly and fill your lungs with silent peace.",
    color: "text-sage-muted border-sage-muted/30",
    scale: 1.6,
  },
  holdIn: {
    title: "Still the breath",
    instruction: "Hold this stillness. Recognize your inner sanctuary.",
    color: "text-amber-muted border-amber-muted/30",
    scale: 1.6,
  },
  exhale: {
    title: "Release the breath",
    instruction: "Exhale quietly. Release all heavy weights and outcomes.",
    color: "text-rose-muted border-rose-muted/30",
    scale: 1.0,
  },
  holdOut: {
    title: "Rest in silence",
    instruction: "Rest empty. You are simply here, untangled and safe.",
    color: "text-purple-muted border-purple-muted/30",
    scale: 1.0,
  }
};

const MEDITATION_QUOTES = [
  "You have power over your mind - not outside events. Realize this, and you will find strength. — MARCUS AURELIUS",
  "The soul is dyed with the color of its thoughts. — MARCUS AURELIUS",
  "Do not spoil what you have by desiring what you have not. — EPICURUS",
  "With a little water and a piece of bread, a mind can rival the gods. — EPICURUS",
  "Freedom is the only worthy goal in life. It is won by disregarding things that lie beyond our control. — EPICTETUS",
  "No man is free who is not master of himself. — EPICTETUS",
  "The greatest wealth is to live content with little. — PLATO"
];

export default function BreathingSanctuary({ onBack }: BreathingSanctuaryProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>("holdOut");
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [isMuted, setIsMuted] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Audio nodes for breathing swell synth
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthOscRef = useRef<OscillatorNode | null>(null);
  const synthGainRef = useRef<GainNode | null>(null);

  // Cycle quote every 32 seconds
  useEffect(() => {
    const qInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MEDITATION_QUOTES.length);
    }, 24000);
    return () => clearInterval(qInterval);
  }, []);

  // Handle box breathing cycle (4 seconds per phase)
  useEffect(() => {
    let timer: number;
    if (isActive) {
      timer = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Move to next phase
            setPhase((currentPhase) => {
              let next: BreathPhase = "inhale";
              if (currentPhase === "inhale") next = "holdIn";
              else if (currentPhase === "holdIn") next = "exhale";
              else if (currentPhase === "exhale") next = "holdOut";
              else if (currentPhase === "holdOut") next = "inhale";
              
              // Trigger a delicate, subtle sound chime on state change
              if (!isMuted) {
                if (next === "inhale" || next === "exhale") {
                  triggerSwell(next, 4);
                  playSingingBowlSound(next === "inhale" ? 210 : 180, 3.5);
                } else {
                  playHoldTone();
                  playSingingBowlSound(330, 2.5);
                }
              }
              return next;
            });
            return 4; // 4 seconds
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      stopSwell();
    }

    return () => {
      clearInterval(timer);
      stopSwell();
    };
  }, [isActive, isMuted]);

  // Web Audio Procedural Swell Synthesizer for Breathing Cycle
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playHoldTone = () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      // Ring a tiny quiet high frequency drop like a water ripple
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 1.2);
      
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 1.3);
    } catch (e) {
      // Ignore audio contexts suspended
    }
  };

  const triggerSwell = (direction: "inhale" | "exhale", duration: number) => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      stopSwell();

      // Create a warm low sine oscillator and filter combination to synthesize a deep calm swell
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      // Swell frequency rising slightly on inhale, falling on exhale
      const startFreq = direction === "inhale" ? 120 : 160;
      const endFreq = direction === "inhale" ? 160 : 120;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.linearRampToValueAtTime(endFreq, now + duration);

      gain.gain.setValueAtTime(0, now);
      
      if (direction === "inhale") {
        // Slow rise to peak amplitude
        gain.gain.linearRampToValueAtTime(0.06, now + duration * 0.8);
        gain.gain.linearRampToValueAtTime(0.03, now + duration);
      } else {
        // High volume at start, slowly falling away
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      synthOscRef.current = osc;
      synthGainRef.current = gain;

    } catch (e) {
      // Ignore context issues
    }
  };

  const stopSwell = () => {
    try {
      if (synthOscRef.current) {
        synthOscRef.current.stop();
        synthOscRef.current.disconnect();
        synthOscRef.current = null;
      }
      if (synthGainRef.current) {
        synthGainRef.current.disconnect();
        synthGainRef.current = null;
      }
    } catch (e) {
      // Ignore
    }
  };

  const handleToggleActive = () => {
    if (!isActive) {
      // Initializing swell
      if (!isMuted) {
        playTempleBell();
        triggerSwell("inhale", 4);
      }
      setPhase("inhale");
      setSecondsLeft(4);
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase("holdOut");
    setSecondsLeft(4);
    stopSwell();
  };

  return (
    <div id="breathing-sanctuary" className="min-h-screen py-12 px-6 max-w-5xl mx-auto flex flex-col justify-between selection:bg-bronze-light selection:text-white animate-fadeIn">
      
      {/* Editorial Header */}
      <header className="flex justify-between items-center pb-4 border-b border-bronze-light/10 mb-8">
        <button
          onClick={onBack}
          className="group text-xs tracking-wider uppercase text-neutral-600 hover:text-bronze-dark dark:text-neutral-300 dark:hover:text-bronze-light transition-colors flex items-center gap-2 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Leave Sanctuary</span>
        </button>

        <div className="flex flex-col items-center text-center">
          <span className="font-display text-[9px] tracking-[0.3em] uppercase text-bronze-light font-semibold">
            Ataraxia Sanctuary
          </span>
          <h1 className="font-display text-xs font-semibold mt-1 uppercase tracking-widest gilded-text">
            The Breathing Temple
          </h1>
        </div>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-1 text-neutral-600 hover:text-bronze-light dark:text-neutral-400 dark:hover:text-bronze-light transition-colors"
          title={isMuted ? "Unmute sounds" : "Mute sounds"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Breathing Circle Stage */}
      <main className="my-auto py-8 flex flex-col items-center justify-center text-center">
        <div className="marble-card greek-frame shadow-2xl w-full max-w-2xl p-8 sm:p-12 md:p-16 relative overflow-hidden flex flex-col items-center justify-center min-h-[480px]">
          {/* Subtle fluting column trims */}
          <div className="absolute left-0 top-0 bottom-0 w-[4px] column-fluting border-r border-bronze-light/10" />
          <div className="absolute right-0 top-0 bottom-0 w-[4px] column-fluting border-l border-bronze-light/10" />
          
          {/* Symmetrical meander trims */}
          <div className="absolute left-0 right-0 top-0 h-[6px] greek-border opacity-20" />
          <div className="absolute left-0 right-0 bottom-0 h-[6px] greek-border opacity-20" />

          {/* BACKGROUND AMBIENT RIPPLES */}
          <AnimatePresence>
            {isActive && (phase === "inhale" || phase === "holdIn") && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 2.2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
                className="absolute w-44 h-44 border border-bronze-light/20 rounded-full pointer-events-none"
              />
            )}
          </AnimatePresence>

          <div className="flex flex-col items-center gap-8 z-10 w-full mt-2 mb-2">
            
            {/* INSTRUCTION FADE SLATE */}
            <div className="h-16 flex flex-col items-center justify-center text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.8 }}
                >
                  <span className="font-display text-[11px] tracking-[0.25em] uppercase text-bronze-light block mb-1 font-bold">
                    {PHASES_INFO[phase].title}
                  </span>
                  <p className="font-serif text-lg md:text-xl italic theme-text-primary font-medium max-w-md">
                    {PHASES_INFO[phase].instruction}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* THE SACRED CIRCLE EXPANDER */}
            <div className="relative flex justify-center items-center w-64 h-64 my-4">
              {/* Central Circle */}
              <motion.div
                animate={{
                  scale: isActive ? PHASES_INFO[phase].scale : 1.0,
                }}
                transition={{
                  duration: 4,
                  ease: "easeInOut"
                }}
                className={`w-36 h-36 rounded-full border-2 border-dashed flex flex-col justify-center items-center transition-colors duration-1000 ${
                  isActive ? PHASES_INFO[phase].color : "border-bronze-light/30 theme-text-primary font-medium"
                }`}
              >
                <motion.div
                  className="absolute inset-2 rounded-full border border-bronze-light/10 select-none pointer-events-none"
                />
                
                {/* Countdown display */}
                <span className="font-display text-4xl font-light tracking-widest leading-none">
                  {secondsLeft}
                </span>
                <span className="font-sans text-[8px] tracking-[0.2em] uppercase mt-1 text-neutral-500 dark:text-neutral-300 font-semibold">
                  Seconds
                </span>
              </motion.div>

              {/* Decorative Laurel Surround */}
              <div className="absolute -inset-6 opacity-10 select-none pointer-events-none">
                <LaurelWreath className="w-full h-full" />
              </div>
            </div>

            {/* INTERACTIVE ACTIONS */}
            <div className="flex justify-center items-center gap-6">
              <button
                onClick={handleReset}
                className="p-3 border border-bronze-light/15 hover:border-bronze-light/40 text-neutral-600 hover:text-bronze-dark dark:text-neutral-400 dark:hover:text-bronze-light transition-all rounded-none font-medium"
                title="Reset Meditation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={handleToggleActive}
                className="px-8 py-3.5 border border-bronze-light/30 hover:border-bronze-light bg-bronze-light/5 hover:bg-bronze-light/10 text-neutral-700 dark:text-neutral-200 font-display text-[10px] tracking-[0.25em] uppercase hover:shadow-md transition-all flex items-center gap-2.5 rounded-none"
              >
                {isActive ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-bronze-light" />
                    <span>Pause Sanctuary</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-bronze-light" />
                    <span>Begin Stillness</span>
                  </>
                )}
              </button>
            </div>

            {/* CLASSICAL MEDITATIVE QUOTE CAROUSEL */}
            <div className="border-t border-bronze-light/10 pt-6 mt-4 w-full max-w-md h-12 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={quoteIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                  className="font-serif text-[11px] italic text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium px-4 text-center select-none"
                >
                  {MEDITATION_QUOTES[quoteIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </main>

      {/* Symmetrical Footer */}
      <footer className="text-center mt-8 border-t border-bronze-light/10 pt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <span className="font-serif text-[10px] italic text-neutral-500 dark:text-neutral-400 font-medium">
          The mind is a citadel of tranquility, ready to receive you.
        </span>
        <span className="font-display text-[8px] tracking-[0.2em] uppercase text-bronze-light/50 flex items-center gap-1">
          <Sparkles className="w-2 h-2 text-bronze-light" /> Ataraxia Cycle
        </span>
      </footer>

    </div>
  );
}
