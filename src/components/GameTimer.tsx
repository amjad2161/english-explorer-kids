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
    <div className="flex items-center gap-2">
      <motion.div
        animate={isWarning ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.5, repeat: Infinity }}
        className={`text-2xl font-display font-bold ${isWarning ? "text-destructive" : "text-foreground"}`}
      >
        ⏱️ {timeLeft}s
      </motion.div>
      <div className="flex-1 h-3 rounded-full overflow-hidden bg-muted">
        <motion.div
          className={`h-full rounded-full transition-all duration-1000 ${
            isWarning ? "bg-destructive" : pct > 50 ? "bg-accent" : "bg-primary"
          }`}
          style={{ width: `${pct}%` }}
          layout
        />
      </div>
    </div>
  );
};

export default GameTimer;
