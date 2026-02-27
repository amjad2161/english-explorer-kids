import { useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { dispatchCharacterEvent } from "@/lib/characterStore";
import { playClickSound } from "@/lib/sounds";
import { X, Pause, Play, Lightbulb, ArrowLeft } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GameShellProps {
  /** Title shown in the game header */
  title: string;
  /** Emoji for the game */
  emoji: string;
  /** Current score / progress 0-100 */
  progress?: number;
  /** Called when player requests a hint */
  onHint?: () => string | null;
  /** Custom back path; defaults to /levels */
  backPath?: string;
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// Parental gate — simple 4-digit PIN dialog
// ---------------------------------------------------------------------------

const PARENTAL_PIN = "1234"; // In production this should be user-configurable

interface ParentalGateProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ParentalGate = ({ onConfirm, onCancel }: ParentalGateProps) => {
  const { t, dir } = useLanguage();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      if (next === PARENTAL_PIN) {
        onConfirm();
      } else {
        setError(true);
        setTimeout(() => {
          setPin("");
          setError(false);
        }, 600);
      }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "hsl(var(--background) / 0.95)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      dir={dir}
    >
      <motion.div
        className="bg-card border border-border rounded-3xl p-8 w-80 shadow-xl text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <span className="text-5xl mb-4 block">🔒</span>
        <h2 className="font-display font-bold text-xl mb-1 text-foreground">
          {t("parentalGate.title") || "Parental Gate"}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {t("parentalGate.subtitle") || "Enter PIN to continue"}
        </p>

        {/* PIN dots */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-4 h-4 rounded-full border-2"
              style={{
                borderColor: error ? "hsl(var(--destructive))" : "hsl(var(--primary))",
                background: pin.length > i ? (error ? "hsl(var(--destructive))" : "hsl(var(--primary))") : "transparent",
              }}
              animate={error ? { x: [-4, 4, -4, 4, 0] } : {}}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Digit pad */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((d, i) => (
            <motion.button
              key={i}
              onClick={() => {
                if (d === "⌫") { setPin((p) => p.slice(0, -1)); setError(false); }
                else if (d) handleDigit(d);
              }}
              className="h-12 rounded-2xl font-display font-bold text-xl text-foreground"
              style={{
                background: d ? "hsl(var(--muted))" : "transparent",
                border: d ? "1px solid hsl(var(--border))" : "none",
                visibility: d || d === "0" ? "visible" : "hidden",
              } as React.CSSProperties}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              disabled={!d && d !== "0"}
            >
              {d}
            </motion.button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("cancel") || "Cancel"}
        </button>
      </motion.div>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Pause / Quit dialog
// ---------------------------------------------------------------------------

interface PauseDialogProps {
  onResume: () => void;
  onQuit: () => void;
}

const PauseDialog = ({ onResume, onQuit }: PauseDialogProps) => {
  const { t, dir } = useLanguage();
  const [showGate, setShowGate] = useState(false);

  const handleQuitRequest = () => setShowGate(true);

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: "hsl(var(--background) / 0.85)", backdropFilter: "blur(12px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        dir={dir}
      >
        <motion.div
          className="bg-card border border-border rounded-3xl p-8 w-72 shadow-xl text-center"
          initial={{ scale: 0.7, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.7, y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          <span className="text-5xl mb-4 block">⏸️</span>
          <h2 className="font-display font-bold text-2xl mb-6 text-foreground">
            {t("game.paused") || "Paused"}
          </h2>
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={onResume}
              className="btn-kid w-full gradient-primary text-primary-foreground flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              {t("game.resume") || "Resume"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleQuitRequest}
              className="btn-glow w-full text-foreground flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              {t("game.quit") || "Quit Game"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showGate && (
          <ParentalGate
            onConfirm={onQuit}
            onCancel={() => setShowGate(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// ---------------------------------------------------------------------------
// GameShell
// ---------------------------------------------------------------------------

/**
 * GameShell — wraps any game page with:
 * - Branded header (title, back button, language indicator)
 * - Progress bar
 * - Hint button (fires dispatchCharacterEvent)
 * - Pause / Quit flow with parental gate
 *
 * Usage:
 * ```tsx
 * <GameShell title="Spelling Bee" emoji="🐝" progress={score}>
 *   <SpellingBeeContent />
 * </GameShell>
 * ```
 */
const GameShell = ({
  title,
  emoji,
  progress = 0,
  onHint,
  backPath = "/levels",
  children,
}: GameShellProps) => {
  const navigate = useNavigate();
  const { dir } = useLanguage();
  const [paused, setPaused] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);

  const handlePause = useCallback(() => {
    playClickSound();
    setPaused(true);
    dispatchCharacterEvent({ type: "think" });
  }, []);

  const handleResume = useCallback(() => {
    setPaused(false);
    dispatchCharacterEvent({ type: "wave", payload: { duration: 1500 } });
  }, []);

  const handleQuit = useCallback(() => {
    dispatchCharacterEvent({ type: "wave" });
    navigate(backPath);
  }, [navigate, backPath]);

  const handleHint = useCallback(() => {
    if (!onHint) return;
    const hint = onHint();
    if (!hint) return;
    setHintText(hint);
    dispatchCharacterEvent({ type: "hint", payload: { message: hint, duration: 3000 } });
    setTimeout(() => setHintText(null), 3000);
  }, [onHint]);

  const handleBack = useCallback(() => {
    playClickSound();
    navigate(backPath);
  }, [navigate, backPath]);

  return (
    <div className="min-h-screen flex flex-col" dir={dir}>
      {/* ─── Game Header ─── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3"
        style={{
          background: "hsl(var(--background) / 0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid hsl(var(--border))",
        }}
      >
        {/* Back */}
        <motion.button
          onClick={handleBack}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}
          aria-label="Back"
        >
          <ArrowLeft className={`w-4 h-4 text-foreground ${dir === "rtl" ? "rotate-180" : ""}`} />
        </motion.button>

        {/* Title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl">{emoji}</span>
          <h1 className="font-display font-bold text-base text-foreground truncate">{title}</h1>
        </div>

        {/* Hint button */}
        {onHint && (
          <motion.button
            onClick={handleHint}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sunshine"
            style={{ background: "hsl(var(--sunshine) / 0.1)", border: "1px solid hsl(var(--sunshine) / 0.2)" }}
            aria-label="Hint"
          >
            <Lightbulb className="w-4 h-4" />
          </motion.button>
        )}

        {/* Pause button */}
        <motion.button
          onClick={handlePause}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}
          aria-label="Pause"
        >
          <Pause className="w-4 h-4 text-foreground" />
        </motion.button>
      </motion.header>

      {/* ─── Progress Bar ─── */}
      <div className="h-1.5 bg-muted/30 relative overflow-hidden">
        <motion.div
          className="h-full gradient-primary"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
        </motion.div>
      </div>

      {/* ─── Game Content ─── */}
      <main className="flex-1 relative">
        {children}
      </main>

      {/* ─── Hint popup ─── */}
      <AnimatePresence>
        {hintText && (
          <motion.div
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl shadow-lg max-w-xs text-center"
            style={{
              background: "hsl(var(--card))",
              border: "2px solid hsl(var(--sunshine) / 0.4)",
            }}
            initial={{ opacity: 0, y: 20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
          >
            <span className="font-display text-sm font-bold text-foreground">
              💡 {hintText}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Pause / Quit dialog ─── */}
      <AnimatePresence>
        {paused && (
          <PauseDialog onResume={handleResume} onQuit={handleQuit} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameShell;
