import { motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { playTickSound, playTimerWarning } from "@/lib/sounds";

interface Props {
  seconds: number;
  running: boolean;
  onTimeUp: () => void;
  showWarningAt?: number;
}

const GameTimer = ({ seconds, running, onTimeUp, showWarningAt = 5 }: Props) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const isWarning = timeLeft <= showWarningAt;
  const isCritical = timeLeft <= 3;
  const pct = (timeLeft / seconds) * 100;

  useEffect(() => { setTimeLeft(seconds); }, [seconds]);

  useEffect(() => {
    if (!running || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        if (next <= showWarningAt && next > 0) playTickSound();
        if (next === 0) {
          playTimerWarning();
          onTimeUp();
        }
        return Math.max(0, next);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, timeLeft, onTimeUp, showWarningAt]);

  return (
    <div className="flex items-center gap-3">
      <motion.div
        animate={isCritical ? { scale: [1, 1.25, 1], color: ["hsl(0,84%,60%)", "hsl(0,84%,45%)", "hsl(0,84%,60%)"] } :
                 isWarning ? { scale: [1, 1.12, 1] } : {}}
        transition={{ duration: 0.5, repeat: Infinity }}
        className={`text-2xl font-display font-bold tabular-nums ${
          isCritical ? "text-destructive" : isWarning ? "text-primary" : "text-foreground"
        }`}
      >
        ⏱️ {timeLeft}s
      </motion.div>
      <div className="flex-1 h-3 rounded-full overflow-hidden bg-muted relative">
        <motion.div
          className={`h-full rounded-full transition-colors duration-500 ${
            isCritical ? "bg-destructive" : isWarning ? "bg-primary" : pct > 50 ? "bg-accent" : "bg-primary"
          }`}
          style={{ width: `${pct}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        {isWarning && (
          <motion.div
            className="absolute inset-0 bg-destructive/10 rounded-full"
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </div>
    </div>
  );
};

export default GameTimer;
