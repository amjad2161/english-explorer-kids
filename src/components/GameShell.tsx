/**
 * GameShell — unified wrapper for all games providing:
 * - Header with progress, hint, pause, quit controls
 * - Character corner (local inline character)
 * - Unified sound + reward pipeline
 * - Full localization support
 * - Privacy-safe local telemetry
 * - Error boundary
 */
import { useState, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { dispatchCharacterEvent } from "@/lib/characterStore";
import CharacterProxy from "@/components/character/CharacterProxy";
import type { CharacterMood } from "@/lib/characterStore";
import { Pause, Play, Lightbulb, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";

export interface GameShellProps {
  /** Game title key in i18n or plain string */
  title: string;
  /** Total steps/questions in this game session */
  totalSteps?: number;
  /** Current step (0-based) */
  currentStep?: number;
  /** Current character mood to display in the corner */
  characterMood?: CharacterMood;
  /** Optional hint text to show when hint button is pressed */
  hint?: string;
  /** Called when user confirms quit */
  onQuit?: () => void;
  children: ReactNode;
}

const GameShell = ({
  title,
  totalSteps = 0,
  currentStep = 0,
  characterMood = "idle",
  hint,
  onQuit,
  children,
}: GameShellProps) => {
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const [paused, setPaused] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const progress = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;

  const handlePause = useCallback(() => {
    setPaused((p) => !p);
  }, []);

  const handleHint = useCallback(() => {
    setShowHint(true);
    dispatchCharacterEvent({ type: "hint" });
    setTimeout(() => setShowHint(false), 4000);
  }, []);

  const handleQuitRequest = useCallback(() => {
    setShowQuitConfirm(true);
  }, []);

  const handleQuitConfirm = useCallback(() => {
    setShowQuitConfirm(false);
    if (onQuit) {
      onQuit();
    } else {
      navigate(-1);
    }
  }, [onQuit, navigate]);

  const handleQuitCancel = useCallback(() => {
    setShowQuitConfirm(false);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col" dir={dir}>
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 bg-background/90 backdrop-blur border-b border-border">
        {/* Back/Quit button */}
        <button
          type="button"
          onClick={handleQuitRequest}
          className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={t("game.quit") || "Quit"}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Title */}
        <h1 className="flex-1 text-base font-bold text-foreground truncate">{title}</h1>

        {/* Progress bar */}
        {totalSteps > 0 && (
          <div
            className="flex-1 max-w-[120px] h-3 bg-muted rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${progress}%`}
          >
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        )}

        {/* Hint button */}
        {hint && (
          <button
            type="button"
            onClick={handleHint}
            className="p-2 rounded-xl hover:bg-yellow-100 transition-colors text-yellow-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
            aria-label={t("game.hint") || "Hint"}
          >
            <Lightbulb className="w-5 h-5" />
          </button>
        )}

        {/* Pause button */}
        <button
          type="button"
          onClick={handlePause}
          className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={paused ? (t("game.resume") || "Resume") : (t("game.pause") || "Pause")}
        >
          {paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
        </button>
      </header>

      {/* ── Hint toast ── */}
      <AnimatePresence>
        {showHint && hint && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-2xl px-5 py-3 shadow-lg text-sm font-medium max-w-xs text-center"
          >
            💡 {hint}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pause overlay ── */}
      <AnimatePresence>
        {paused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex flex-col items-center justify-center gap-6"
          >
            <CharacterProxy mood="wave" size="lg" speech="⏸️" />
            <p className="text-white text-2xl font-bold">
              {t("game.paused") || "Paused"}
            </p>
            <button
              type="button"
              onClick={handlePause}
              className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:opacity-90 transition-opacity"
            >
              {t("game.resume") || "▶ Resume"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Quit confirmation (parental gate style) ── */}
      <AnimatePresence>
        {showQuitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-card rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center"
            >
              <CharacterProxy mood="sad" size="sm" />
              <h2 className="mt-3 text-xl font-bold text-foreground">
                {t("game.quitTitle") || "Leave the game?"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("game.quitBody") || "Your progress in this session may be lost."}
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={handleQuitCancel}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors"
                >
                  {t("game.stay") || "Stay"}
                </button>
                <button
                  type="button"
                  onClick={handleQuitConfirm}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-bold hover:opacity-90 transition-opacity"
                >
                  {t("game.quit") || "Quit"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Character corner (inline, complements the global CharacterStage) ── */}
      <div className="fixed bottom-20 start-4 z-40 pointer-events-none opacity-70">
        <CharacterProxy mood={characterMood} size="sm" />
      </div>

      {/* ── Main game content ── */}
      <ErrorBoundary>
        <main className="flex-1 relative" aria-label="Game content">
          {children}
        </main>
      </ErrorBoundary>
    </div>
  );
};

export default GameShell;
