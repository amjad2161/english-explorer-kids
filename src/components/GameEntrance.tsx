import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import Interactive3DMascot from "./Interactive3DMascot";

/**
 * GameEntrance — Bright, fun entrance animation for game pages
 * Matches the Duolingo-style classroom aesthetic
 */

const GAME_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface Props {
  title: string;
  emoji: string;
  onComplete?: () => void;
  duration?: number;
}

const FlyingLetter = ({ letter, index, total }: { letter: string; index: number; total: number }) => {
  const angle = (index / total) * Math.PI * 2;
  const dist = 140 + Math.random() * 100;
  const tx = Math.cos(angle) * dist;
  const ty = Math.sin(angle) * dist;
  const colors = [
    "hsl(var(--primary))",
    "hsl(var(--accent))",
    "hsl(var(--secondary))",
    "hsl(var(--sunshine))",
    "hsl(var(--candy))",
    "hsl(var(--lavender))",
  ];

  return (
    <motion.span
      className="absolute font-display font-bold pointer-events-none select-none"
      style={{
        fontSize: 14 + Math.random() * 12,
        left: "50%",
        top: "50%",
        color: colors[index % colors.length],
      }}
      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
      animate={{
        x: [0, tx * 0.5, tx],
        y: [0, ty * 0.5, ty],
        opacity: [0, 1, 0],
        scale: [0, 1.3, 0.4],
        rotate: [0, (Math.random() - 0.5) * 180],
      }}
      transition={{
        duration: 1.2,
        delay: 0.3 + index * 0.03,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {letter}
    </motion.span>
  );
};

const GameEntrance = ({ title, emoji, onComplete, duration = 1800 }: Props) => {
  const [phase, setPhase] = useState(0);
  const [visible, setVisible] = useState(true);

  const letters = useMemo(
    () => GAME_LETTERS.sort(() => Math.random() - 0.5).slice(0, 14),
    []
  );

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), duration - 400);
    const t3 = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, duration);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [duration, onComplete]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        style={{ background: "hsl(var(--background))" }}
        animate={phase >= 2 ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {/* Colorful background circles */}
        {[
          { color: "hsl(var(--primary) / 0.08)", size: 300, x: "-20%", y: "-10%" },
          { color: "hsl(var(--accent) / 0.06)", size: 250, x: "70%", y: "60%" },
          { color: "hsl(var(--secondary) / 0.06)", size: 200, x: "80%", y: "-20%" },
        ].map((circle, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              width: circle.size,
              height: circle.size,
              left: circle.x,
              top: circle.y,
              background: circle.color,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
          />
        ))}

        {/* Main content */}
        <div className="relative flex flex-col items-center justify-center gap-3">
          {/* Emoji with bounce */}
          <motion.span
            className="text-6xl sm:text-7xl"
            initial={{ scale: 0, rotate: -20 }}
            animate={phase >= 1 ? { scale: [0, 1.3, 1], rotate: [-20, 10, 0] } : {}}
            transition={{ type: "spring", stiffness: 250, damping: 12 }}
          >
            {emoji}
          </motion.span>

          {/* Title */}
          <motion.h1
            className="font-display font-extrabold text-2xl sm:text-3xl text-gradient text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            {title}
          </motion.h1>

          {/* Sparkle dots */}
          <motion.div
            className="flex gap-1.5"
            initial={{ opacity: 0 }}
            animate={phase >= 1 ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
          >
            {["✨", "⭐", "✨"].map((s, i) => (
              <motion.span
                key={i}
                className="text-sm"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6, delay: 0.4 + i * 0.1, repeat: 1 }}
              >
                {s}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Flying letters */}
        {phase >= 1 && letters.map((l, i) => (
          <FlyingLetter key={i} letter={l} index={i} total={letters.length} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default GameEntrance;
