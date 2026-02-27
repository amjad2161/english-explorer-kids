/**
 * DialogueBubble — story/lesson dialogue speech bubble.
 * Supports character name, text, optional translation hint.
 * Auto-types text for cinematic effect.
 */
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Volume2 } from "lucide-react";
import { speakEnglish } from "@/lib/sounds";

interface DialogueBubbleProps {
  text: string;
  speakerName?: string;
  hint?: string;
  autoType?: boolean;
  onComplete?: () => void;
  className?: string;
}

const DialogueBubble = ({ text, speakerName, hint, autoType = true, onComplete, className = "" }: DialogueBubbleProps) => {
  const [displayed, setDisplayed] = useState(autoType ? "" : text);
  const [isDone, setIsDone] = useState(!autoType);

  useEffect(() => {
    if (!autoType) { setDisplayed(text); setIsDone(true); return; }
    setDisplayed("");
    setIsDone(false);
    let i = 0;
    const speed = 35; // ms per character
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setIsDone(true);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, autoType, onComplete]);

  const handleSkip = useCallback(() => {
    setDisplayed(text);
    setIsDone(true);
    onComplete?.();
  }, [text, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      className={`relative rounded-3xl border-2 border-border bg-card/95 backdrop-blur p-5 shadow-xl ${className}`}
      style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.10)" }}
    >
      {/* Speaker name badge */}
      {speakerName && (
        <div className="absolute -top-3 start-5 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow">
          {speakerName}
        </div>
      )}

      {/* Main text */}
      <p className="text-foreground text-lg font-medium leading-relaxed min-h-[2.5rem]">
        {displayed}
        {!isDone && <span className="inline-block w-0.5 h-5 bg-primary animate-pulse ml-0.5 align-middle" />}
      </p>

      {/* Hint translation */}
      <AnimatePresence>
        {isDone && hint && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-muted-foreground italic border-t border-border pt-2"
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center gap-2 mt-3">
        {/* Speak button */}
        <button
          type="button"
          onClick={() => speakEnglish(text)}
          className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Listen"
        >
          <Volume2 className="w-4 h-4" />
        </button>

        {/* Skip / tap to complete */}
        {!isDone && (
          <button
            type="button"
            onClick={handleSkip}
            className="ms-auto text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Skip ⏭
          </button>
        )}
      </div>

      {/* Bubble tail */}
      <div className="absolute -bottom-3 start-8 w-5 h-5 bg-card border-b-2 border-e-2 border-border rotate-45" />
    </motion.div>
  );
};

export default DialogueBubble;
