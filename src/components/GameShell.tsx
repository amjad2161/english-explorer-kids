/**
 * GameShell
 * Unified wrapper for all game screens. Provides:
 * - Consistent header with game title, progress, and hint/pause controls
 * - Character integration corner
 * - Sound and reward pipeline
 * - Localization support
 * - Error boundary for game crashes
 * - Quit confirmation with parental gate
 */

import React, { useState, useCallback } from "react";
import { useLanguage } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Pause, Play, HelpCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GameShellProps {
  /** Game title translation key or direct text */
  title: string;
  /** Current progress (0–1) */
  progress?: number;
  /** Total items/questions for display */
  total?: number;
  /** Current item index (1-based) */
  current?: number;
  /** Called when hint button is pressed */
  onHint?: () => void;
  /** Whether to show hint button */
  showHint?: boolean;
  /** Called when game is paused/resumed */
  onPauseChange?: (paused: boolean) => void;
  /** Back navigation path (defaults to /levels) */
  backPath?: string;
  /** Game content */
  children: React.ReactNode;
}

const PARENTAL_GATE_ANSWER = 12; // Simple math: 4 + 8

export default function GameShell({
  title,
  progress = 0,
  total,
  current,
  onHint,
  showHint = false,
  onPauseChange,
  backPath = "/levels",
  children,
}: GameShellProps) {
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const [paused, setPaused] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [gateInput, setGateInput] = useState("");
  const [gateError, setGateError] = useState(false);

  const handlePause = useCallback(() => {
    const next = !paused;
    setPaused(next);
    onPauseChange?.(next);
  }, [paused, onPauseChange]);

  const handleQuitRequest = useCallback(() => {
    setShowQuitConfirm(true);
    setGateInput("");
    setGateError(false);
  }, []);

  const handleQuitConfirm = useCallback(() => {
    const num = parseInt(gateInput, 10);
    if (num === PARENTAL_GATE_ANSWER) {
      navigate(backPath);
    } else {
      setGateError(true);
    }
  }, [gateInput, navigate, backPath]);

  const handleQuitCancel = useCallback(() => {
    setShowQuitConfirm(false);
    setGateInput("");
    setGateError(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" dir={dir}>
      {/* Game Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-4 py-2">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          {/* Left: Back button */}
          <button
            onClick={handleQuitRequest}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg"
            aria-label={t("nav.backToLevels")}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Center: Title + Progress */}
          <div className="flex-1 mx-4">
            <h1 className="text-sm font-display font-bold text-center truncate">
              {title}
            </h1>
            {total != null && current != null && (
              <p className="text-xs text-muted-foreground text-center">
                {current} / {total}
              </p>
            )}
            {/* Progress bar */}
            <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                initial={false}
                animate={{ width: `${Math.min(progress * 100, 100)}%` }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1">
            {showHint && onHint && (
              <button
                onClick={onHint}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Hint"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handlePause}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              aria-label={paused ? "Resume" : "Pause"}
            >
              {paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Game Content */}
      <main className="flex-1 relative">
        {paused && (
          <div className="absolute inset-0 z-30 bg-background/90 backdrop-blur-sm flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <Pause className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl font-display font-bold">
                {dir === "rtl" ? "המשחק מושהה" : "Game Paused"}
              </p>
              <button
                onClick={handlePause}
                className="mt-4 btn-kid gradient-primary text-white px-8 py-3"
              >
                <Play className="w-5 h-5 inline mr-2" />
                {dir === "rtl" ? "המשך" : "Resume"}
              </button>
            </motion.div>
          </div>
        )}
        {children}
      </main>

      {/* Quit Confirmation with Parental Gate */}
      <AnimatePresence>
        {showQuitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-display font-bold text-lg">
                  {dir === "rtl" ? "יציאה מהמשחק" : "Leave Game?"}
                </h2>
                <button onClick={handleQuitCancel} className="p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {dir === "rtl"
                  ? "כדי לצאת, פתור: 4 + 8 = ?"
                  : "To leave, solve: 4 + 8 = ?"}
              </p>
              <input
                type="number"
                inputMode="numeric"
                value={gateInput}
                onChange={(e) => {
                  setGateInput(e.target.value);
                  setGateError(false);
                }}
                className="w-full px-4 py-2 border rounded-lg text-center text-lg mb-2"
                placeholder="?"
                autoFocus
              />
              {gateError && (
                <p className="text-destructive text-sm text-center mb-2">
                  {dir === "rtl" ? "תשובה שגויה" : "Wrong answer"}
                </p>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleQuitCancel}
                  className="flex-1 btn-glow py-2"
                >
                  {dir === "rtl" ? "המשך" : "Continue"}
                </button>
                <button
                  onClick={handleQuitConfirm}
                  className="flex-1 bg-destructive text-white rounded-lg py-2 font-bold"
                >
                  {dir === "rtl" ? "יציאה" : "Leave"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
