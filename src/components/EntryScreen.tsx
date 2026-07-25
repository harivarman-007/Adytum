import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, BookOpen, PenTool, Sparkles, Volume2, VolumeX, Maximize2, Minimize2,
  Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Quote, Minus,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify, Type,
  ZoomIn, ZoomOut, Eraser, HelpCircle
} from "lucide-react";
import { GreekTemple, GreekPillar } from "./GreekTempleSVG";
import { playPageTurnSound, playStoneClickSound, playQuillStrokeSound } from "../lib/audioSynth";

interface EntryScreenProps {
  onBack: () => void;
  onSubmit: (text: string, chapterSubtitle?: string) => void;
  isLoading: boolean;
  initialText?: string;
  initialSubtitle?: string;
  date?: string;
}

const CLASSICAL_PROMPTS = [
  "What troubled your inner tranquility today, and how can you reframe it?",
  "What virtue or strength did you demonstrate during today's challenges?",
  "Which external events lay completely outside your control today?",
  "What simple joy, breath, or quiet moment are you grateful for right now?"
];

export default function EntryScreen({ onBack, onSubmit, isLoading, initialText = "", initialSubtitle = "", date }: EntryScreenProps) {
  const [text, setText] = useState(initialText);
  const [chapterSubtitle, setChapterSubtitle] = useState(initialSubtitle);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isQuillAudioEnabled, setIsQuillAudioEnabled] = useState(true);
  const [fontStyle, setFontStyle] = useState<"serif" | "script" | "mono">("serif");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right" | "justify">("left");
  const [showPrompts, setShowPrompts] = useState(false);

  const [activeStates, setActiveStates] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    bulletList: false,
    numberedList: false
  });

  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize editor content on mount or initialText change
  useEffect(() => {
    if (editorRef.current) {
      if (!editorRef.current.innerHTML || initialText) {
        editorRef.current.innerText = initialText;
      }
    }
  }, [initialText]);

  // Real-time active formatting command state listener
  const updateActiveStates = () => {
    try {
      setActiveStates({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikethrough: document.queryCommandState("strikethrough"),
        bulletList: document.queryCommandState("insertUnorderedList"),
        numberedList: document.queryCommandState("insertOrderedList")
      });
    } catch (err) {
      // Graceful fallback
    }
  };

  useEffect(() => {
    const handleSelection = () => updateActiveStates();
    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, []);

  const handleEditorInput = () => {
    if (!editorRef.current) return;
    const plainText = editorRef.current.innerText || "";
    const prevLen = text.length;
    setText(plainText);
    updateActiveStates();

    // Play tactile quill audio sound on keypress if enabled
    if (isQuillAudioEnabled && plainText.length > prevLen) {
      playQuillStrokeSound();
    }
  };

  // Execute clean visual formatting command without losing focus or selection
  const handleFormat = (e: React.MouseEvent, command: string, value: string = "") => {
    e.preventDefault(); // Prevents button from stealing focus and clearing text selection
    playStoneClickSound();

    if (editorRef.current) {
      editorRef.current.focus();
    }

    document.execCommand(command, false, value);
    updateActiveStates();

    if (editorRef.current) {
      setText(editorRef.current.innerText || "");
    }
  };

  // Insert Socratic reflection prompt cleanly into manuscript
  const insertPrompt = (e: React.MouseEvent, promptText: string) => {
    e.preventDefault();
    playStoneClickSound();
    if (!editorRef.current) return;

    editorRef.current.focus();
    const promptHtml = `<p style="margin-top:1em; margin-bottom:0.5em; font-style:italic; color:#b8860b; border-left:3px solid #b8860b; padding-left:12px;">📜 <strong>Reflection Question:</strong> ${promptText}</p><p><br></p>`;
    document.execCommand("insertHTML", false, promptHtml);
    setShowPrompts(false);

    setText(editorRef.current.innerText || "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const plainText = editorRef.current ? editorRef.current.innerText.trim() : text.trim();
    if (plainText) {
      playStoneClickSound();
      playPageTurnSound();
      onSubmit(plainText);
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

  const getFontFamilyClass = () => {
    switch (fontStyle) {
      case "script":
        return "font-serif italic tracking-wide text-xl";
      case "mono":
        return "font-mono text-base font-medium tracking-normal";
      case "sans":
        return "font-sans text-lg font-normal tracking-normal";
      case "display":
        return "font-display text-lg tracking-widest uppercase font-bold gilded-text";
      default:
        return "font-serif text-xl italic font-medium";
    }
  };

  const getTextAlignClass = () => {
    switch (textAlign) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      case "justify":
        return "text-justify";
      default:
        return "text-left";
    }
  };

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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Title Header (Fades in Zen Mode) */}
          <AnimatePresence>
            {!isZenMode && (
              <motion.div
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center gap-2 mb-1"
              >
                <GreekTemple className="w-10 h-10 text-bronze-light/60" />
                <span className="font-display text-[11px] tracking-[0.3em] uppercase text-bronze-light font-bold">
                  {initialText ? "Revising Leaf" : "Inscribing the Day"}
                </span>
                <h2 className="font-serif text-2xl italic theme-text-primary font-medium tracking-wide">
                  {getFormattedDate()}
                </h2>

                {/* Custom Chapter Subtitle Field */}
                <div className="relative w-full max-w-sm mx-auto mt-1">
                  <input
                    type="text"
                    placeholder="Chapter Subtitle (e.g. Morning Solitude)..."
                    value={chapterSubtitle}
                    onChange={(e) => setChapterSubtitle(e.target.value)}
                    className="w-full text-center px-4 py-1.5 text-xs font-serif italic bg-stone-50/70 dark:bg-neutral-900/70 border border-bronze-light/25 focus:border-bronze-light rounded-xl theme-text-primary focus:outline-none transition-all shadow-inner placeholder:text-neutral-400 placeholder:not-italic font-medium"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Slate Toolbar: Masterwork Visual Formatting Tools */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl marble-card border border-bronze-light/30 shadow-lg w-full">
            
            {/* Left Formatting Tools Container */}
            <div className="flex flex-wrap items-center gap-1.5">
              
              {/* GROUP 1: TEXT STYLES */}
              <div className="flex items-center gap-0.5 bg-stone-900/10 dark:bg-stone-100/5 p-1 rounded-lg">
                <button
                  type="button"
                  onMouseDown={(e) => handleFormat(e, "bold")}
                  className={`p-1.5 rounded-md transition-all ${
                    activeStates.bold
                      ? "bg-bronze-light/25 text-bronze-dark dark:text-bronze-light border border-bronze-light/40 font-bold shadow-sm"
                      : "text-neutral-600 dark:text-neutral-300 hover:text-bronze-light hover:bg-bronze-light/10"
                  }`}
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => handleFormat(e, "italic")}
                  className={`p-1.5 rounded-md transition-all ${
                    activeStates.italic
                      ? "bg-bronze-light/25 text-bronze-dark dark:text-bronze-light border border-bronze-light/40 font-bold shadow-sm"
                      : "text-neutral-600 dark:text-neutral-300 hover:text-bronze-light hover:bg-bronze-light/10"
                  }`}
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => handleFormat(e, "underline")}
                  className={`p-1.5 rounded-md transition-all ${
                    activeStates.underline
                      ? "bg-bronze-light/25 text-bronze-dark dark:text-bronze-light border border-bronze-light/40 font-bold shadow-sm"
                      : "text-neutral-600 dark:text-neutral-300 hover:text-bronze-light hover:bg-bronze-light/10"
                  }`}
                  title="Underline (Ctrl+U)"
                >
                  <Underline className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => handleFormat(e, "strikethrough")}
                  className={`p-1.5 rounded-md transition-all ${
                    activeStates.strikethrough
                      ? "bg-bronze-light/25 text-bronze-dark dark:text-bronze-light border border-bronze-light/40 font-bold shadow-sm"
                      : "text-neutral-600 dark:text-neutral-300 hover:text-bronze-light hover:bg-bronze-light/10"
                  }`}
                  title="Strikethrough"
                >
                  <Strikethrough className="w-4 h-4" />
                </button>
              </div>

              <div className="h-4 w-[1px] bg-bronze-light/30 mx-0.5" />

              {/* GROUP 2: HEADINGS & STRUCTURE */}
              <div className="flex items-center gap-0.5 bg-stone-900/10 dark:bg-stone-100/5 p-1 rounded-lg">
                <button
                  type="button"
                  onMouseDown={(e) => handleFormat(e, "formatBlock", "<h1>")}
                  className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-bronze-light hover:bg-bronze-light/10 rounded-md transition-colors"
                  title="Header 1 (Large Title)"
                >
                  <Heading1 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => handleFormat(e, "formatBlock", "<h2>")}
                  className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-bronze-light hover:bg-bronze-light/10 rounded-md transition-colors"
                  title="Header 2 (Section Subtitle)"
                >
                  <Heading2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => handleFormat(e, "formatBlock", "blockquote")}
                  className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-bronze-light hover:bg-bronze-light/10 rounded-md transition-colors"
                  title="Classical Blockquote"
                >
                  <Quote className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => handleFormat(e, "insertHorizontalRule")}
                  className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-bronze-light hover:bg-bronze-light/10 rounded-md transition-colors"
                  title="Divider Rule Line"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>

              <div className="h-4 w-[1px] bg-bronze-light/30 mx-0.5" />

              {/* GROUP 3: LISTS */}
              <div className="flex items-center gap-0.5 bg-stone-900/10 dark:bg-stone-100/5 p-1 rounded-lg">
                <button
                  type="button"
                  onMouseDown={(e) => handleFormat(e, "insertUnorderedList")}
                  className={`p-1.5 rounded-md transition-all ${
                    activeStates.bulletList
                      ? "bg-bronze-light/25 text-bronze-dark dark:text-bronze-light border border-bronze-light/40 font-bold shadow-sm"
                      : "text-neutral-600 dark:text-neutral-300 hover:text-bronze-light hover:bg-bronze-light/10"
                  }`}
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => handleFormat(e, "insertOrderedList")}
                  className={`p-1.5 rounded-md transition-all ${
                    activeStates.numberedList
                      ? "bg-bronze-light/25 text-bronze-dark dark:text-bronze-light border border-bronze-light/40 font-bold shadow-sm"
                      : "text-neutral-600 dark:text-neutral-300 hover:text-bronze-light hover:bg-bronze-light/10"
                  }`}
                  title="Numbered List"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
              </div>

              <div className="h-4 w-[1px] bg-bronze-light/30 mx-0.5" />

              {/* GROUP 4: ALIGNMENT */}
              <div className="flex items-center gap-0.5 bg-stone-900/10 dark:bg-stone-100/5 p-1 rounded-lg">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    setTextAlign("left");
                    handleFormat(e, "justifyLeft");
                  }}
                  className={`p-1.5 rounded-md transition-all ${
                    textAlign === "left" ? "text-bronze-light bg-bronze-light/20 font-bold" : "text-neutral-500 hover:text-neutral-300"
                  }`}
                  title="Align Left"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    setTextAlign("center");
                    handleFormat(e, "justifyCenter");
                  }}
                  className={`p-1.5 rounded-md transition-all ${
                    textAlign === "center" ? "text-bronze-light bg-bronze-light/20 font-bold" : "text-neutral-500 hover:text-neutral-300"
                  }`}
                  title="Align Center"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    setTextAlign("right");
                    handleFormat(e, "justifyRight");
                  }}
                  className={`p-1.5 rounded-md transition-all ${
                    textAlign === "right" ? "text-bronze-light bg-bronze-light/20 font-bold" : "text-neutral-500 hover:text-neutral-300"
                  }`}
                  title="Align Right"
                >
                  <AlignRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => {
                    setTextAlign("justify");
                    handleFormat(e, "justifyFull");
                  }}
                  className={`p-1.5 rounded-md transition-all ${
                    textAlign === "justify" ? "text-bronze-light bg-bronze-light/20 font-bold" : "text-neutral-500 hover:text-neutral-300"
                  }`}
                  title="Align Justify"
                >
                  <AlignJustify className="w-4 h-4" />
                </button>
              </div>

              <div className="h-4 w-[1px] bg-bronze-light/30 mx-0.5" />

              {/* GROUP 5: FONT FAMILY & SCALE */}
              <div className="flex items-center gap-1 bg-stone-900/10 dark:bg-stone-100/5 p-1 rounded-lg">
                {/* Font Selection Dropdown Menu */}
                <div className="relative flex items-center">
                  <Type className="w-3.5 h-3.5 text-bronze-light absolute left-2 pointer-events-none" />
                  <select
                    value={fontStyle}
                    onChange={(e) => {
                      playStoneClickSound();
                      setFontStyle(e.target.value as any);
                    }}
                    className="pl-7 pr-3 py-1 text-[11px] font-display uppercase tracking-wider rounded-md border border-bronze-light/30 bg-stone-50/80 dark:bg-neutral-900/80 text-bronze-light hover:border-bronze-light transition-colors cursor-pointer font-bold focus:outline-none shadow-sm"
                    title="Select Manuscript Font Style"
                  >
                    <option value="serif" className="bg-stone-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 font-serif">
                      Classical Serif
                    </option>
                    <option value="script" className="bg-stone-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 font-serif italic">
                      Cursive Script
                    </option>
                    <option value="mono" className="bg-stone-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 font-mono">
                      Codex Mono
                    </option>
                    <option value="sans" className="bg-stone-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 font-sans">
                      Athenian Sans
                    </option>
                    <option value="display" className="bg-stone-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 font-display font-bold">
                      Gilded Display
                    </option>
                  </select>
                </div>

                <button
                  type="button"
                  onMouseDown={(e) => handleFormat(e, "fontSize", "4")}
                  className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-bronze-light hover:bg-bronze-light/10 rounded-md transition-colors"
                  title="Increase Font Size (A+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => handleFormat(e, "fontSize", "2")}
                  className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-bronze-light hover:bg-bronze-light/10 rounded-md transition-colors"
                  title="Decrease Font Size (A-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onMouseDown={(e) => handleFormat(e, "removeFormat")}
                  className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-terracotta-muted hover:bg-terracotta-muted/10 rounded-md transition-colors"
                  title="Clear Formatting"
                >
                  <Eraser className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Right Group: Socratic Prompts, Quill Audio & Zen Toggle */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPrompts(!showPrompts)}
                  className="px-3 py-1.5 rounded-lg border border-bronze-light/30 text-xs flex items-center gap-1.5 theme-text-primary hover:border-bronze-light transition-colors font-display uppercase tracking-wider font-semibold shadow-sm"
                  title="Socratic Prompt Generator"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-bronze-light" />
                  <span>Prompts</span>
                </button>

                {/* Socratic Prompts Dropdown */}
                {showPrompts && (
                  <div className="absolute right-0 top-10 w-72 p-3 rounded-2xl marble-card border border-bronze-light/40 shadow-2xl z-40 flex flex-col gap-2">
                    <span className="font-display text-[9px] uppercase tracking-widest text-bronze-light font-bold border-b border-bronze-light/20 pb-1.5">
                      Socratic Prompts
                    </span>
                    {CLASSICAL_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onMouseDown={(e) => insertPrompt(e, prompt)}
                        className="text-left text-xs font-serif italic theme-text-primary hover:text-bronze-light p-2 rounded-xl hover:bg-bronze-light/10 transition-colors leading-snug"
                      >
                        "{prompt}"
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quill Audio Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  playStoneClickSound();
                  setIsQuillAudioEnabled(!isQuillAudioEnabled);
                }}
                className={`p-2 rounded-lg border text-xs transition-all ${
                  isQuillAudioEnabled
                    ? "border-bronze-light/40 bg-bronze-light/15 text-bronze-light"
                    : "border-bronze-light/20 text-neutral-500"
                }`}
                title="Tactile Quill Audio Feedback"
              >
                {isQuillAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Zen Focus Mode Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  playStoneClickSound();
                  setIsZenMode(!isZenMode);
                }}
                className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all font-display uppercase tracking-wider font-bold shadow-sm ${
                  isZenMode
                    ? "border-bronze-light bg-bronze-light/25 text-bronze-dark dark:text-bronze-light"
                    : "border-bronze-light/30 hover:border-bronze-light bg-stone-50/60 dark:bg-neutral-900/60 theme-text-primary"
                }`}
                title="Toggle Distraction-Free Zen Focus Mode"
              >
                {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-bronze-light" />}
                <span>{isZenMode ? "Exit Zen" : "Zen"}</span>
              </button>
            </div>
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

              {/* Clean Visual WYSIWYG ContentEditable Manuscript Editor */}
              <div
                ref={editorRef}
                contentEditable={!isLoading}
                onInput={handleEditorInput}
                data-placeholder="What occupies your mind? Write without hesitation or form... let your quietest thoughts flow onto this marble page."
                className={`w-full bg-transparent border-none outline-none resize-none leading-relaxed theme-text-primary p-2 mt-2 cursor-text overflow-y-auto ${getFontFamilyClass()} ${getTextAlignClass()}`}
                style={{ minHeight: isZenMode ? "420px" : "280px" }}
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
              className="btn-sanctuary px-12 py-4 text-xs disabled:opacity-30 shadow-xl font-bold uppercase tracking-widest flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-bronze-light animate-ping" />
                  <span>consulting the oracles...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-bronze-light" />
                  <span>{initialText ? "re-analyze & save" : "reflect & analyze"}</span>
                </>
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
