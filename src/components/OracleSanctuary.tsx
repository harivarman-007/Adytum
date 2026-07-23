import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Sparkles, Volume2, BookOpen, UserCheck } from "lucide-react";
import { GreekTemple, LaurelWreath } from "./GreekTempleSVG";
import { playStoneClickSound, playTempleBell } from "../lib/audioSynth";

interface Sage {
  id: string;
  name: string;
  role: string;
  description: string;
  motto: string;
  color: string;
  border: string;
  bg: string;
}

const SAGES: Sage[] = [
  {
    id: "marcus",
    name: "Marcus Aurelius",
    role: "The Stoic Emperor",
    description: "reminds us of the cosmic scale, the inner citadel of the mind, and acceptance of nature.",
    motto: "The soul is dyed with the color of its thoughts.",
    color: "text-amber-muted",
    border: "border-amber-muted/40",
    bg: "bg-amber-muted/10",
  },
  {
    id: "epicurus",
    name: "Epicurus",
    role: "The Garden Philosopher",
    description: "advocates for the absence of pain, tranquility, simple pleasures, and friends.",
    motto: "Do not spoil what you have by desiring what you have not.",
    color: "text-amber-muted",
    border: "border-amber-muted/40",
    bg: "bg-amber-muted/10",
  },
  {
    id: "socrates",
    name: "Socrates",
    role: "The Dialectical Spark",
    description: "gently probes your assumptions, questioning what you think you hold for certain.",
    motto: "An unexamined life is not worth living.",
    color: "text-purple-muted",
    border: "border-purple-muted/40",
    bg: "bg-purple-muted/10",
  },
  {
    id: "diogenes",
    name: "Diogenes of Sinope",
    role: "The Cynic Sage",
    description: "teaches raw freedom, the casting away of superficial weights, and absolute simplicity.",
    motto: "Stand out of my sunlight.",
    color: "text-terracotta-muted",
    border: "border-terracotta-muted/40",
    bg: "bg-terracotta-muted/10",
  },
  {
    id: "aspasia",
    name: "Aspasia of Miletus",
    role: "The Athenian Mind",
    description: "inspires brave dialogue, relationship clarity, and the sharpest heights of eloquence.",
    motto: "Do not fear the friction that carves the marble.",
    color: "text-rose-muted",
    border: "border-rose-muted/40",
    bg: "bg-rose-muted/10",
  },
  {
    id: "seneca",
    name: "Seneca the Younger",
    role: "The Stoic Statesman",
    description: "offers eloquent reflections on time, emotional mastery, and quiet harbors in chaos.",
    motto: "Life is long if you know how to use it.",
    color: "text-sage-muted",
    border: "border-sage-muted/40",
    bg: "bg-sage-muted/10",
  },
  {
    id: "epictetus",
    name: "Epictetus",
    role: "Master of Inner Freedom",
    description: "teaches sharp clarity on distinguishing what is in our control versus what is not.",
    motto: "First say to yourself what you would be; and then do what you have to do.",
    color: "text-amber-muted",
    border: "border-amber-muted/40",
    bg: "bg-amber-muted/10",
  },
  {
    id: "heraclitus",
    name: "Heraclitus of Ephesus",
    role: "Philosopher of Flux",
    description: "shares mystical insights into constant change, the elemental fire, and living in rhythm with flux.",
    motto: "Everything flows, nothing abides.",
    color: "text-terracotta-muted",
    border: "border-terracotta-muted/40",
    bg: "bg-terracotta-muted/10",
  },
  {
    id: "hypatia",
    name: "Hypatia of Alexandria",
    role: "Astronomer of Alexandria",
    description: "bridges mathematical precision, geometry, and serene cosmic truth.",
    motto: "Reserve your right to think; even to think wrongly is better than not to think.",
    color: "text-purple-muted",
    border: "border-purple-muted/40",
    bg: "bg-purple-muted/10",
  }
];

interface OracleSanctuaryProps {
  onBack: () => void;
}

export default function OracleSanctuary({ onBack }: OracleSanctuaryProps) {
  const [selectedSage, setSelectedSage] = useState<Sage>(SAGES[0]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState<{
    text: string;
    citation: string;
    meaning?: string;
    solution?: string;
    followUpQuestion?: string;
  } | null>(null);

  // Sage Wisdom Synthesis Engine for offline / client fallback
  const getSageWisdom = (sageId: string, userQuery: string) => {
    const lowQuery = userQuery.toLowerCase();
    const qSnippet = userQuery.trim() ? `"${userQuery.trim().slice(0, 45)}..."` : "your present concern";

    let topic = "general";
    if (lowQuery.includes("work") || lowQuery.includes("job") || lowQuery.includes("boss") || lowQuery.includes("overwhelm") || lowQuery.includes("deadline") || lowQuery.includes("career") || lowQuery.includes("task") || lowQuery.includes("project") || lowQuery.includes("busy")) {
      topic = "work";
    } else if (lowQuery.includes("love") || lowQuery.includes("relationship") || lowQuery.includes("heart") || lowQuery.includes("partner") || lowQuery.includes("friend") || lowQuery.includes("marry") || lowQuery.includes("date") || lowQuery.includes("breakup")) {
      topic = "love";
    } else if (lowQuery.includes("fear") || lowQuery.includes("anxi") || lowQuery.includes("future") || lowQuery.includes("worry") || lowQuery.includes("fail") || lowQuery.includes("exam") || lowQuery.includes("scared")) {
      topic = "anxiety";
    } else if (lowQuery.includes("sad") || lowQuery.includes("lonely") || lowQuery.includes("grief") || lowQuery.includes("cry") || lowQuery.includes("depress") || lowQuery.includes("hurt") || lowQuery.includes("pain")) {
      topic = "sorrow";
    } else if (lowQuery.includes("angry") || lowQuery.includes("mad") || lowQuery.includes("fight") || lowQuery.includes("hate") || lowQuery.includes("conflict") || lowQuery.includes("annoy")) {
      topic = "anger";
    }

    if (topic === "work") {
      return {
        text: "Do not let the quantity of tasks overwhelm your inner citadel. Perform each duty as if it were the last and finest act of your life.",
        citation: "MARCUS AURELIUS (MEDITATIONS)",
        meaning: `Regarding ${qSnippet}, classical wisdom reminds us that a mountain of work is built of single, quiet moments. Trying to solve all tasks simultaneously creates artificial panic.`,
        solution: "1. Select the single most vital task right now and isolate it from the rest.\n2. Communicate clear, calm boundaries regarding your time and capacity.\n3. Complete one task with focus, then pause to reset before beginning the next.",
        followUpQuestion: "If you only accomplished one meaningful task today, which one truly matters?"
      };
    } else if (topic === "love") {
      return {
        text: "Whatever our souls are made of, true devotion seeks not to possess or control, but to understand and stand firm in quiet truth.",
        citation: "ASPASIA OF MILETUS & CLASSICAL VOICES",
        meaning: `Regarding ${qSnippet}, relational complexity is best met with clarity and emotional independence. Suffering in love often arises when we demand that another person fulfill our internal peace.`,
        solution: "1. Speak your genuine feelings and needs without accusation or fear.\n2. Give the other person space to process without forcing an immediate reaction.\n3. Re-anchor your sense of self-worth in your own inner citadel.",
        followUpQuestion: "Are you communicating from a place of open clarity, or from fear of being misunderstood?"
      };
    } else if (topic === "anxiety") {
      return {
        text: "We suffer more often in imagination than in reality. Do not anticipate trouble, nor worry about that which may never happen.",
        citation: "SENECA THE YOUNGER (LETTERS FROM A STOIC)",
        meaning: `Regarding ${qSnippet}, anxiety is a shadow cast by future projections. The mind creates imaginary monsters out of possibilities that have not yet occurred.`,
        solution: "1. Confine your attention strictly to the present 24-hour block.\n2. Write down your worst-case projection and ask: 'What concrete fact supports this right now?'\n3. Take one single physical action today that moves you forward.",
        followUpQuestion: "Is this situation threatening you at this exact second, or is your mind fighting tomorrow's battle today?"
      };
    } else if (topic === "sorrow") {
      return {
        text: "Only those who quiet their minds can hear the wisdom locked inside grief. Sorrow is not a flaw; it is the mind resting between seasons.",
        citation: "EPICURUS & THE CLASSICAL GARDEN",
        meaning: `Regarding ${qSnippet}, heavy emotions are part of the natural weather of the soul. Resisting sadness doubles its weight; sitting with it quietly allows it to pass like a winter cloud.`,
        solution: "1. Permit yourself to feel this lingering sadness without forcing immediate positivity.\n2. Engage in a gentle, grounding activity like a warm drink or quiet walk.\n3. Reach out to a trusted companion or write down unedited thoughts in your sanctuary ledger.",
        followUpQuestion: "Can you offer yourself the same gentle patience you would give a dear friend in sorrow?"
      };
    } else if (topic === "anger") {
      return {
        text: "Delay is the best remedy for anger. How much more grievous are the consequences of anger than the causes of it.",
        citation: "MARCUS AURELIUS & SENECA",
        meaning: `Regarding ${qSnippet}, anger is an emotional impulse that demands instant action. Pausing creates space for reason to reclaim control before words or actions cause regret.`,
        solution: "1. Take a 10-second pause before responding to the trigger.\n2. Step away physically from the source of friction to let heart rate drop.\n3. Evaluate the situation objectively: 'Will this matter to my soul in five years?'",
        followUpQuestion: "What is your anger attempting to protect, and can reason protect it more effectively?"
      };
    }

    const responses: Record<string, { text: string; citation: string; meaning: string; solution: string; followUpQuestion: string }> = {
      marcus: {
        text: "You have power over your mind—not outside events. Realize this, and you will find untroubled strength. The soul is dyed with the color of its thoughts.",
        citation: "MARCUS AURELIUS (MEDITATIONS)",
        meaning: `Regarding ${qSnippet}, the Stoic emperor reminds us that hardship itself is neutral. Your suffering arises from your judgment and expectations, not from the circumstances.`,
        solution: "1. Distinguish between what is in your direct control and what is external chance.\n2. Retreat briefly to your inner citadel with 3 quiet, deep breaths.\n3. Execute your present duty with steady composure, letting go of attachment to distant outcomes.",
        followUpQuestion: "What portion of this burden belongs to external events, and what portion belongs to your own judgment?"
      },
      epicurus: {
        text: "Do not spoil what you have by desiring what you have not; remember that what you now have was once among the things you only hoped for.",
        citation: "EPICURUS (THE GARDEN OF ATARAXIA)",
        meaning: `Regarding ${qSnippet}, Epicurus teaches that anxiety is born of chasing artificial desires or fearing imaginary pain. Peace (Ataraxia) is found in simple presence and quiet gratitude.`,
        solution: "1. Strip away unnecessary artificial expectations surrounding this concern.\n2. Share your thoughts with a trusted friend or mentor in quiet company.\n3. Focus on the modest, immediate comforts already present around you today.",
        followUpQuestion: "If all outcome-driven fear were removed, what simple presence brings you immediate peace right now?"
      },
      socrates: {
        text: "The unexamined life is not worth living. Wonder is the beginning of wisdom, and knowing that you know nothing is the first step toward light.",
        citation: "SOCRATES (THE APOLOGY & DIALOGUES)",
        meaning: `Regarding ${qSnippet}, Socrates probes the core assumptions underlying your distress. Often our heaviest burdens are built upon unexamined premises we take for granted.`,
        solution: "1. Write down your central fear about this situation and ask: 'Is this undeniably true?'\n2. Deconstruct the worst-case scenario until its artificial hold over you dissolves.\n3. Seek clarity through patient, honest inquiry rather than defensive panic.",
        followUpQuestion: "What hidden belief are you holding onto that makes this situation feel heavier than it truly is?"
      },
      diogenes: {
        text: "He has the most who is content with the least. Stand out of my sunlight and cast off the pretense of worldly opinion.",
        citation: "DIOGENES OF SINOPE (THE CYNIC BARREL)",
        meaning: `Regarding ${qSnippet}, Diogenes urges radical simplicity and freedom from societal expectations. Most anxiety is an artificial prison created by seeking external approval.`,
        solution: "1. Identify any superficial expectation you are trying to fulfill and let it drop completely.\n2. Simplify your environment and focus down to bare essential facts.\n3. Act with unvarnished authenticity without caring for the opinion of spectators.",
        followUpQuestion: "Whose approval are you trying to win, and why sacrifice your peace for their illusion?"
      },
      aspasia: {
        text: "Do not fear the friction that carves the marble. Eloquence and wisdom are born when reason engages deeply with the human heart.",
        citation: "ASPASIA OF MILETUS (RHETORIC & PHILOSOPHY)",
        meaning: `Regarding ${qSnippet}, Aspasia observes that relational friction and emotional complexity are not obstacles to avoid, but raw material to refine wisdom and graceful communication.`,
        solution: "1. Express your true boundaries and thoughts with calm, composed rhetoric.\n2. Listen deeply to underlying human needs rather than reacting to surface noise.\n3. Transform relational tension into a collaborative search for truth.",
        followUpQuestion: "How can you speak your truth with both unyielding grace and absolute courage?"
      },
      seneca: {
        text: "We suffer more often in imagination than in reality. True happiness is to enjoy the present, without anxious dependence upon the future.",
        citation: "SENECA THE YOUNGER (LETTERS FROM A STOIC)",
        meaning: `Regarding ${qSnippet}, Seneca warns against projecting catastrophic future scenarios. Anxiety borrows trouble from tomorrow that may never arrive.`,
        solution: "1. Confine your attention strictly to the current 24-hour block.\n2. Write down your anxious projections and cross out everything speculative.\n3. Dedicate time to meaningful labor or quiet reading to anchor your attention.",
        followUpQuestion: "Are you suffering from what is actually occurring right now, or from the ghost of what might happen?"
      },
      epictetus: {
        text: "First say to yourself what you would be; and then do what you have to do. Attach yourself only to what is in your power to govern.",
        citation: "EPICTETUS (ENCHIRIDION & DISCOURSES)",
        meaning: `Regarding ${qSnippet}, Epictetus demands sharp clarity on the Stoic dichotomy of control. You cannot command external results, only your own choices and character.`,
        solution: "1. Divide your query into two columns: 'In my control' vs 'Outside my control'.\n2. Completely surrender concern for everything in column two.\n3. Direct 100% of your energy into taking the first deliberate step in column one.",
        followUpQuestion: "Why waste your soul's energy on what is not yours to command?"
      },
      heraclitus: {
        text: "Everything flows, nothing abides. You cannot step twice into the same river, for other waters are continually flowing in upon you.",
        citation: "HERACLITUS OF EPHESUS (ON NATURE)",
        meaning: `Regarding ${qSnippet}, Heraclitus reminds us that change is the fundamental law of the cosmos. Resistance creates suffering; adapting with flux brings harmony.`,
        solution: "1. Accept that this current phase is temporary and will naturally transform.\n2. Release resistance to change and align your posture with shifting conditions.\n3. Find stability not in rigid permanence, but in your ability to adapt gracefully.",
        followUpQuestion: "What are you attempting to freeze in place that nature demands should transform?"
      },
      hypatia: {
        text: "Reserve your right to think; even to think wrongly is better than not to think at all. The stars move in harmonic order, as does reason.",
        citation: "HYPATIA OF ALEXANDRIA (MATHEMATICA & COMMENTARIES)",
        meaning: `Regarding ${qSnippet}, Hypatia brings mathematical clarity and cosmic perspective. Elevating your mind above immediate emotional turmoil restores proportion and order.`,
        solution: "1. Analyze your challenge as an objective problem to be solved with logic and structure.\n2. Step back to view your situation against the vast horizon of cosmic time.\n3. Cultivate quiet study and clear reflection away from chaotic distractions.",
        followUpQuestion: "If you viewed this dilemma from the serene distance of the stars, how significant would it appear?"
      }
    };

    const key = sageId.toLowerCase().split("_")[0];
    return responses[key] || responses[sageId] || responses["marcus"];
  };

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    playTempleBell();

    try {
      const response = await fetch("/api/consult-oracle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sage: selectedSage.id, query }),
      });

      if (!response.ok) throw new Error("Oracle communication failed");
      const data = await response.json();
      if (data && data.text) {
        const fallback = getSageWisdom(selectedSage.id, query);
        setAnswer({
          text: data.text,
          citation: data.citation || selectedSage.name,
          meaning: data.meaning || fallback.meaning,
          solution: data.solution || fallback.solution,
          followUpQuestion: data.followUpQuestion || fallback.followUpQuestion
        });
      } else {
        setAnswer(getSageWisdom(selectedSage.id, query));
      }
    } catch (err) {
      console.warn("Using offline classical oracle synthesis:", err);
      setAnswer(getSageWisdom(selectedSage.id, query));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnswer(null);
    setQuery("");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between py-10 px-4 sm:px-6 max-w-4xl mx-auto selection:bg-bronze-light selection:text-white">
      {/* Anchored Top Action Header */}
      <header className="flex justify-between items-center mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs tracking-wider uppercase theme-text-muted hover:text-bronze-light transition-colors group font-semibold p-2.5 rounded-xl marble-card border border-bronze-light/30 shadow-md"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Exit Temple</span>
        </button>

        <button
          onClick={() => playTempleBell()}
          className="p-2.5 border border-bronze-light/30 rounded-xl theme-text-primary hover:text-bronze-light transition-colors marble-card shadow-md flex items-center gap-2 text-xs font-display uppercase tracking-wider"
          title="Ring Temple Chime"
        >
          <Volume2 className="w-4 h-4 text-bronze-light" />
          <span>Chime</span>
        </button>
      </header>

      {/* Main Single Unified Center Slate */}
      <main className="my-auto py-2 flex flex-col items-center w-full">
        <AnimatePresence mode="wait">
          {!answer && !isLoading ? (
            /* SECTION 1: CONSULTATION SETUP */
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.6 }}
              className="w-full"
            >
              <div className="marble-card greek-frame shadow-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden flex flex-col gap-6">
                {/* Column Fluting visual accent */}
                <div className="absolute left-0 top-0 bottom-0 w-[4px] column-fluting border-r border-bronze-light/10" />
                <div className="absolute right-0 top-0 bottom-0 w-[4px] column-fluting border-l border-bronze-light/10" />
                
                {/* Top Meander Trim */}
                <div className="absolute left-0 right-0 top-0 h-[6px] greek-border opacity-30" />

                {/* ARCHITECTURAL HEADER INSIDE THE MARBLE SLATE */}
                <div className="flex flex-col items-center text-center border-b border-bronze-light/20 pb-4">
                  <span className="font-display text-[10px] tracking-[0.3em] uppercase text-bronze-light font-bold">
                    Sanctuary Inner Chamber
                  </span>
                  <h1 className="font-display text-base font-bold mt-1 uppercase tracking-widest gilded-text">
                    The Oracle of Wisdom
                  </h1>
                </div>

                {/* 1. SAGE GALLERY SELECTOR BAR (Horizontal Pill Grid) */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center px-1 border-b border-bronze-light/15 pb-2">
                    <div className="flex items-center gap-2">
                      <LaurelWreath className="w-4 h-4 text-bronze-light" />
                      <span className="font-display text-[10px] tracking-[0.25em] uppercase text-bronze-light font-bold">
                        Select Classical Sage Spirit
                      </span>
                    </div>
                    <span className="font-serif text-xs italic theme-text-muted">
                      {selectedSage.name} ({selectedSage.role})
                    </span>
                  </div>

                  {/* Horizontal Scrollable Pill Grid */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 custom-scrollbar">
                    {SAGES.map((sage) => {
                      const isSelected = selectedSage.id === sage.id;
                      return (
                        <button
                          key={sage.id}
                          type="button"
                          onClick={() => {
                            setSelectedSage(sage);
                            playStoneClickSound();
                          }}
                          className={`px-3.5 py-2.5 rounded-xl border flex items-center gap-2.5 whitespace-nowrap transition-all duration-300 ${
                            isSelected
                              ? "border-2 border-bronze-light bg-bronze-light/20 text-neutral-900 dark:text-neutral-50 font-bold shadow-md scale-105"
                              : "border-bronze-light/20 hover:border-bronze-light/60 bg-stone-50/40 dark:bg-neutral-900/30 theme-text-muted font-medium"
                          }`}
                        >
                          <UserCheck className={`w-3.5 h-3.5 ${isSelected ? "text-bronze-light" : "opacity-40"}`} />
                          <span className="font-display text-[11px] uppercase tracking-wider">{sage.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. ACTIVE SAGE BANNER & MOTTO */}
                <div className="p-4 border border-bronze-light/25 bg-bronze-light/5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 border border-bronze-light/30 bg-bronze-light/10 text-bronze-light rounded-lg">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-xs tracking-wider uppercase font-bold theme-text-primary">
                          {selectedSage.name}
                        </span>
                        <span className={`font-serif text-[11px] italic lowercase ${selectedSage.color} font-semibold`}>
                          — {selectedSage.role}
                        </span>
                      </div>
                      <p className="font-serif text-xs italic theme-text-muted mt-0.5 leading-normal">
                        {selectedSage.description}
                      </p>
                    </div>
                  </div>
                  <blockquote className="font-serif text-xs italic text-bronze-light border-l-2 border-bronze-light/40 pl-3 py-1 sm:max-w-xs font-medium">
                    “{selectedSage.motto}”
                  </blockquote>
                </div>

                {/* 3. INQUIRY FORM */}
                <form onSubmit={handleConsult} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-display text-[9px] tracking-[0.15em] uppercase theme-text-primary font-bold">
                      What shadows or questions weigh on your spirit?
                    </label>
                    <textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={`Ask ${selectedSage.name} for guidance... Write your grief, your longing, or your uncertainty. Let the wisdom of the centuries meet your heart.`}
                      rows={5}
                      className="w-full bg-stone-50/50 dark:bg-neutral-900/50 border border-bronze-light/30 hover:border-bronze-light/60 focus:border-bronze-light outline-none resize-none font-serif text-lg italic leading-relaxed theme-text-primary placeholder:text-neutral-400/80 p-4 transition-colors rounded-xl shadow-inner"
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!query.trim()}
                    className="btn-sanctuary w-full py-4 disabled:opacity-40 disabled:pointer-events-none mt-1"
                  >
                    <Sparkles className="w-4 h-4 text-bronze-light animate-pulse" />
                    <span>Cast Scroll to the Hearth</span>
                  </button>
                </form>

                {/* Bottom Meander Trim */}
                <div className="absolute left-0 right-0 bottom-0 h-[6px] greek-border opacity-30" />
              </div>
            </motion.div>
          ) : isLoading ? (
            /* SECTION 2: SMOKY INCENSE BURNING LOADING STATE */
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[360px] flex flex-col justify-center items-center text-center gap-6"
            >
              {/* Incense Ripple */}
              <div className="relative flex justify-center items-center h-28 w-28">
                <GreekTemple className="absolute w-16 h-16 text-bronze-light/60 animate-pulse" />
                <motion.div
                  animate={{
                    scale: [1, 1.4, 1.8],
                    opacity: [0.6, 0.3, 0],
                    y: [0, -20, -50]
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                  className="absolute w-8 h-8 rounded-full bg-gradient-to-t from-bronze-light/30 to-transparent blur-md"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="font-display text-[11px] tracking-[0.3em] uppercase text-bronze-light animate-pulse font-bold">
                  Burning the Incense
                </span>
                <p className="font-serif text-base italic theme-text-muted font-medium max-w-xs">
                  The oracle listens... your inquiry rises as sweet smoke to the vault of {selectedSage.name}'s spirit.
                </p>
              </div>
            </motion.div>
          ) : (
            /* SECTION 3: DELPHIC ANSWERS SLATE */
            <motion.div
              key="answer"
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="w-full"
            >
              <div className="marble-card greek-frame shadow-2xl p-8 sm:p-12 relative overflow-hidden flex flex-col items-center text-center gap-6">
                <div className="absolute left-0 top-0 bottom-0 w-[4px] column-fluting border-r border-bronze-light/10" />
                <div className="absolute right-0 top-0 bottom-0 w-[4px] column-fluting border-l border-bronze-light/10" />
                <div className="absolute left-0 right-0 top-0 h-[6px] greek-border opacity-30" />

                <LaurelWreath className="w-12 h-12 text-bronze-light" />
                
                <span className="font-display text-[10px] tracking-[0.25em] uppercase text-bronze-light block font-bold">
                  Delphic Dialogue with {selectedSage.name}
                </span>

                <div className="greek-border w-2/3 opacity-30 my-1" />

                {/* 1. Core Classical Aphorism & Citation */}
                <div className="relative px-4 max-w-2xl">
                  <p className="font-serif text-xl md:text-2xl theme-text-primary italic leading-relaxed font-light dropcap text-justify">
                    {answer?.text}
                  </p>
                </div>

                <span className="font-display text-[11px] tracking-[0.3em] uppercase text-bronze-light font-bold">
                  — {answer?.citation}
                </span>

                {/* 2. Philosophical Meaning Card */}
                {answer?.meaning && (
                  <div className="w-full max-w-2xl p-5 border border-bronze-light/30 bg-bronze-light/10 rounded-2xl text-left flex flex-col gap-2 shadow-inner">
                    <div className="flex items-center gap-2 border-b border-bronze-light/20 pb-2">
                      <BookOpen className="w-4 h-4 text-bronze-light" />
                      <span className="font-display text-[10px] tracking-[0.25em] uppercase text-bronze-light font-bold">
                        Philosophical Meaning & Analysis
                      </span>
                    </div>
                    <p className="font-serif text-sm leading-relaxed theme-text-primary italic">
                      {answer.meaning}
                    </p>
                  </div>
                )}

                {/* 3. Actionable Stoic Solution & Steps */}
                {answer?.solution && (
                  <div className="w-full max-w-2xl p-5 border border-emerald-800/40 dark:border-emerald-600/30 bg-emerald-950/20 dark:bg-emerald-900/10 rounded-2xl text-left flex flex-col gap-2.5 shadow-inner">
                    <div className="flex items-center gap-2 border-b border-emerald-700/30 pb-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span className="font-display text-[10px] tracking-[0.25em] uppercase text-emerald-400 font-bold">
                        Practical Stoic Solution & Actionable Guidance
                      </span>
                    </div>
                    <div className="font-serif text-sm leading-relaxed theme-text-primary space-y-1.5 font-medium whitespace-pre-line">
                      {answer.solution}
                    </div>
                  </div>
                )}

                {/* 4. Socratic Follow-up Question */}
                {answer?.followUpQuestion && (
                  <div className="p-4 border border-bronze-light/30 bg-stone-900/20 rounded-xl max-w-2xl w-full text-center">
                    <span className="font-display text-[9px] tracking-[0.2em] uppercase text-bronze-light block mb-1">
                      Socratic Inquiry
                    </span>
                    <p className="font-serif text-sm italic theme-text-primary">
                      "{answer.followUpQuestion}"
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 w-full mt-4 max-w-md">
                  <button
                    onClick={handleReset}
                    className="btn-sanctuary-outline py-3 text.xs"
                  >
                    Ask another query
                  </button>
                  <button
                    onClick={() => {
                      playTempleBell();
                    }}
                    className="btn-sanctuary py-3 text-xs"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-bronze-light" />
                    <span>Ring Temple Chime</span>
                  </button>
                </div>

                <div className="absolute left-0 right-0 bottom-0 h-[6px] greek-border opacity-30" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Symmetric Footer */}
      <footer className="text-center text-[10px] theme-text-muted font-sans tracking-wider uppercase mt-4 font-medium">
        “The impediment to action advances action. What stands in the way becomes the way.” — Marcus Aurelius
      </footer>
    </div>
  );
}
