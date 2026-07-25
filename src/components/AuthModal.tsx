import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "../types";
import { LaurelWreath, GreekTemple } from "./GreekTempleSVG";
import { UserCheck, Lock, Mail, User as UserIcon, Eye, EyeOff, Sparkles, X, ArrowRight, ShieldCheck, Scroll } from "lucide-react";
import { playStoneClickSound } from "../lib/audioSynth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
  initialMode?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  
  // Login Form State
  const [loginCredential, setLoginCredential] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup Form State
  const [signupName, setSignupName] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupPhilosophy, setSignupPhilosophy] = useState("stoicism");

  // UI Helpers
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginCredential.trim() || !loginPassword.trim()) {
      setErrorMsg("Please enter your email or handle and password.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    playStoneClickSound();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: loginCredential, password: loginPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to authenticate.");
      }

      onSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid sanctuary handle or password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupUsername.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setErrorMsg("Please complete all required sanctuary fields.");
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    playStoneClickSound();

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName,
          username: signupUsername,
          email: signupEmail,
          password: signupPassword,
          philosophy: signupPhilosophy
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account.");
      }

      onSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to complete sanctuary inscription.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/65 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto selection:bg-bronze-light selection:text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="bas-relief-card greek-frame shadow-2xl rounded-3xl max-w-lg w-full p-6 sm:p-10 relative overflow-hidden my-8"
        >
          {/* Top Meander Trim */}
          <div className="absolute left-0 right-0 top-0 h-[6px] greek-border opacity-30" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-bronze-light transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Emblem */}
          <div className="flex flex-col items-center text-center gap-2 mb-6 pt-2">
            <div className="w-12 h-12 rounded-2xl marble-card border border-bronze-light/30 flex items-center justify-center shadow-inner text-bronze-light">
              <LaurelWreath className="w-7 h-7" />
            </div>
            <h2 className="font-serif text-2xl font-bold tracking-wide theme-text-primary gilded-text uppercase">
              Sanctuary Ledger
            </h2>
            <p className="text-xs font-serif italic theme-text-muted">
              {mode === "login"
                ? "Enter your private halls of reflection"
                : "Inscribe your name in the classical archives"}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 p-1.5 rounded-xl bg-stone-200/50 dark:bg-stone-900/50 border border-bronze-light/20 mb-6">
            <button
              onClick={() => {
                setMode("login");
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all ${
                mode === "login"
                  ? "bg-sand-light dark:bg-stone-800 text-bronze-dark dark:text-bronze-light shadow-md border border-bronze-light/30"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode("signup");
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-sand-light dark:bg-stone-800 text-bronze-dark dark:text-bronze-light shadow-md border border-bronze-light/30"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="p-3 mb-5 rounded-xl bg-terracotta-muted/15 border border-terracotta-muted/30 text-terracotta-muted text-xs font-serif text-center flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest theme-text-muted mb-1.5">
                  Sanctuary Handle / Email
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-bronze-light/70" />
                  <input
                    type="text"
                    required
                    value={loginCredential}
                    onChange={(e) => setLoginCredential(e.target.value)}
                    placeholder="e.g. traveler@sanctuary.org or @marcus"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50/50 dark:bg-stone-900/40 border border-bronze-light/25 focus:border-bronze-light outline-none text-xs theme-text-primary placeholder:text-neutral-400 font-serif transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest theme-text-muted mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-bronze-light/70" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-stone-50/50 dark:bg-stone-900/40 border border-bronze-light/25 focus:border-bronze-light outline-none text-xs theme-text-primary placeholder:text-neutral-400 font-serif transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-bronze-light transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl btn-sanctuary text-xs uppercase font-semibold tracking-widest flex items-center justify-center gap-2 mt-6 shadow-lg disabled:opacity-40"
              >
                {isLoading ? (
                  <>
                    <LaurelWreath className="w-4 h-4 animate-spin text-bronze-light" />
                    <span>Unlocking Sanctuary...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Sanctuary</span>
                    <ArrowRight className="w-4 h-4 text-bronze-light" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* SIGNUP FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest theme-text-muted mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Aurelia Vance"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/50 dark:bg-stone-900/40 border border-bronze-light/25 focus:border-bronze-light outline-none text-xs theme-text-primary placeholder:text-neutral-400 font-serif transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest theme-text-muted mb-1.5">
                    Sanctuary Handle
                  </label>
                  <input
                    type="text"
                    required
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    placeholder="e.g. aurelia"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/50 dark:bg-stone-900/40 border border-bronze-light/25 focus:border-bronze-light outline-none text-xs theme-text-primary placeholder:text-neutral-400 font-serif transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest theme-text-muted mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-bronze-light/70" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="aurelia@sanctuary.org"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50/50 dark:bg-stone-900/40 border border-bronze-light/25 focus:border-bronze-light outline-none text-xs theme-text-primary placeholder:text-neutral-400 font-serif transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest theme-text-muted mb-1.5">
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/50 dark:bg-stone-900/40 border border-bronze-light/25 focus:border-bronze-light outline-none text-xs theme-text-primary placeholder:text-neutral-400 font-serif transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest theme-text-muted mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/50 dark:bg-stone-900/40 border border-bronze-light/25 focus:border-bronze-light outline-none text-xs theme-text-primary placeholder:text-neutral-400 font-serif transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest theme-text-muted mb-1.5">
                  Philosophical School Alignment
                </label>
                <select
                  value={signupPhilosophy}
                  onChange={(e) => setSignupPhilosophy(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/50 dark:bg-stone-900/40 border border-bronze-light/25 focus:border-bronze-light outline-none text-xs theme-text-primary font-serif transition-colors"
                >
                  <option value="stoicism">Stoicism — Virtue, Endurance & Reason</option>
                  <option value="epicureanism">Epicureanism — Tranquility & Simple Joy</option>
                  <option value="platonism">Platonism — Truth, Ideal Forms & Wonder</option>
                  <option value="aristotelianism">Aristotelianism — Eudaimonia & Balanced Mind</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl btn-sanctuary text-xs uppercase font-semibold tracking-widest flex items-center justify-center gap-2 mt-6 shadow-lg disabled:opacity-40"
              >
                {isLoading ? (
                  <>
                    <LaurelWreath className="w-4 h-4 animate-spin text-bronze-light" />
                    <span>Inscribing Ledger...</span>
                  </>
                ) : (
                  <>
                    <span>Inscribe Name & Join</span>
                    <Sparkles className="w-4 h-4 text-bronze-light" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Bottom meander trim */}
          <div className="absolute left-0 right-0 bottom-0 h-[6px] greek-border opacity-20" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
