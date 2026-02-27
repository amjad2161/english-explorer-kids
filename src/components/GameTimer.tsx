import { motion } from "framer-motion";
import { useEffect, useState } from "react";
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
    <div className="relative">
      {/* Timer bar with glow effect */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={
            isCritical ? { scale: [1, 1.3, 1], rotate: [0, -3, 3, 0] } :
            isWarning ? { scale: [1, 1.15, 1] } : {}
          }
          transition={{ duration: 0.5, repeat: Infinity }}
          className={`text-2xl font-display font-bold tabular-nums min-w-[70px] text-center ${
            isCritical ? "text-destructive" : isWarning ? "text-primary" : "text-foreground"
          }`}
        >
          ⏱️ {timeLeft}s
        </motion.div>
        
        <div className="flex-1 h-3.5 rounded-full overflow-hidden bg-muted relative">
          <motion.div
            className={`h-full rounded-full transition-colors duration-500 relative ${
              isCritical ? "bg-destructive" : isWarning ? "bg-primary" : pct > 50 ? "bg-accent" : "bg-primary"
            }`}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Shimmer on bar */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
            />
          </motion.div>
          
          {/* Warning pulse ring */}
          {isWarning && (
            <motion.div
              className={`absolute inset-0 rounded-full border-2 ${
                isCritical ? "border-destructive/40" : "border-primary/30"
              }`}
              animate={{ opacity: [0, 0.6, 0], scale: [1, 1.03, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </div>
      </div>
      
      {/* Critical time pulsing overlay */}
      {isCritical && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-destructive/5 pointer-events-none"
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}
    </div>
  );
};

export default GameTimer;
