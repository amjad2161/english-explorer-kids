import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";

/**
 * GameEntrance — Cinematic scroll-opening entrance for game pages
 * 
 * A magical scroll unrolls with flying letters and golden light,
 * revealing the game title before fading away. Plays once per mount.
 */

const GAME_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface Props {
  /** Game title to display during entrance */
  title: string;
  /** Game emoji */
  emoji: string;
  /** Callback when entrance animation completes */
  onComplete?: () => void;
  /** Duration before auto-complete (ms) */
  duration?: number;
}

const FlyingGameLetter = ({ letter, index, total }: { letter: string; index: number; total: number }) => {
  const angle = (index / total) * Math.PI * 2;
  const dist = 180 + Math.random() * 120;
  const tx = Math.cos(angle) * dist;
  const ty = Math.sin(angle) * dist;

  return (
    <motion.span
      className="absolute font-display font-bold pointer-events-none select-none"
      style={{
        fontSize: 12 + Math.random() * 14,
        left: "50%",
        top: "50%",
        color: `hsl(var(--library-gold) / ${0.4 + Math.random() * 0.5})`,
        textShadow: `0 0 10px hsl(var(--library-glow) / 0.5)`,
      }}
      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
      animate={{
        x: [0, tx * 0.4, tx],
        y: [0, ty * 0.4, ty],
        opacity: [0, 0.9, 0],
        scale: [0, 1.2, 0.5],
        rotate: [0, (Math.random() - 0.5) * 200],
      }}
      transition={{
        duration: 1.4,
        delay: 0.5 + index * 0.025,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {letter}
    </motion.span>
  );
};

const GameEntrance = ({ title, emoji, onComplete, duration = 2400 }: Props) => {
  const [phase, setPhase] = useState(0);
  const [visible, setVisible] = useState(true);

  const letters = useMemo(
    () => GAME_LETTERS.sort(() => Math.random() - 0.5).slice(0, 18),
    []
  );

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), duration - 600);
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
        style={{ background: "hsl(20 30% 5%)" }}
        animate={phase >= 2 ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {/* Ambient dust */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`d-${i}`}
            className="absolute rounded-full"
            style={{
              width: 2 + Math.random() * 2,
              height: 2 + Math.random() * 2,
              left: `${15 + Math.random() * 70}%`,
              top: `${20 + Math.random() * 60}%`,
              background: `hsl(var(--library-gold) / ${0.1 + Math.random() * 0.15})`,
            }}
            animate={{ y: [0, -25 - Math.random() * 30], opacity: [0, 0.5, 0] }}
            transition={{ duration: 1.8 + Math.random() * 1.5, delay: 0.3 + i * 0.08, ease: "easeOut" }}
          />
        ))}

        {/* ── Scroll body ── */}
        <div className="relative flex items-center justify-center" style={{ perspective: "600px" }}>
          {/* Top scroll roller */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 240,
              height: 16,
              top: -80,
              background: `linear-gradient(90deg, hsl(25 40% 25%), hsl(30 45% 35%), hsl(25 40% 25%))`,
              boxShadow: "0 2px 8px hsl(20 30% 8% / 0.6), inset 0 -2px 3px hsl(35 40% 45% / 0.2)",
              borderRadius: 8,
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />

          {/* Bottom scroll roller */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 240,
              height: 16,
              bottom: -80,
              background: `linear-gradient(90deg, hsl(25 40% 25%), hsl(30 45% 35%), hsl(25 40% 25%))`,
              boxShadow: "0 -2px 8px hsl(20 30% 8% / 0.6), inset 0 2px 3px hsl(35 40% 45% / 0.2)",
              borderRadius: 8,
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />

          {/* Scroll parchment unrolling */}
          <motion.div
            className="relative overflow-hidden"
            style={{
              width: 220,
              background: `linear-gradient(180deg, hsl(35 30% 78%), hsl(33 25% 72%), hsl(35 30% 78%))`,
              boxShadow: `
                inset 0 0 20px hsl(25 30% 50% / 0.15),
                4px 0 12px hsl(20 30% 8% / 0.3),
                -4px 0 12px hsl(20 30% 8% / 0.3)
              `,
              borderRadius: 2,
            }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 140, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.33, 1, 0.68, 1] }}
          >
            {/* Parchment texture */}
            <div className="absolute inset-0 opacity-10" style={{
              background: `repeating-linear-gradient(0deg, transparent, transparent 6px, hsl(25 30% 40% / 0.15) 6px, hsl(25 30% 40% / 0.15) 7px)`,
            }} />

            {/* Game content on scroll */}
            <motion.div
              className="flex flex-col items-center justify-center h-full gap-2 relative"
              initial={{ opacity: 0, y: 20 }}
              animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <motion.span
                className="text-4xl"
                animate={phase >= 1 ? { scale: [0.5, 1.2, 1], rotate: [0, -10, 5, 0] } : {}}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                {emoji}
              </motion.span>
              <span
                className="font-display font-extrabold text-lg sm:text-xl text-center px-4"
                style={{ color: "hsl(25 40% 20%)" }}
              >
                {title}
              </span>
            </motion.div>
          </motion.div>

          {/* Roller knobs — left pair */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 10, height: 10,
              left: -130, top: -84,
              background: "radial-gradient(circle, hsl(35 50% 45%), hsl(25 40% 30%))",
              boxShadow: "0 0 4px hsl(35 40% 40% / 0.4)",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 10, height: 10,
              left: -130, bottom: -84,
              background: "radial-gradient(circle, hsl(35 50% 45%), hsl(25 40% 30%))",
              boxShadow: "0 0 4px hsl(35 40% 40% / 0.4)",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          />

          {/* Roller knobs — right pair */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 10, height: 10,
              right: -130, top: -84,
              background: "radial-gradient(circle, hsl(35 50% 45%), hsl(25 40% 30%))",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 10, height: 10,
              right: -130, bottom: -84,
              background: "radial-gradient(circle, hsl(35 50% 45%), hsl(25 40% 30%))",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          />
        </div>

        {/* ── Central light burst ── */}
        <motion.div
          className="absolute rounded-full"
          style={{
            background: `radial-gradient(circle, hsl(var(--library-gold) / 0.6), hsl(var(--library-gold-dim) / 0.3), transparent 70%)`,
          }}
          initial={{ width: 0, height: 0, opacity: 0 }}
          animate={{
            width: [0, 40, 900],
            height: [0, 40, 900],
            opacity: [0, 0.7, 0],
          }}
          transition={{ duration: 1.6, delay: 0.5, ease: "easeOut" }}
        />

        {/* ── Light ring ── */}
        <motion.div
          className="absolute rounded-full border"
          style={{ borderColor: `hsl(var(--library-gold) / 0.2)` }}
          initial={{ width: 0, height: 0, opacity: 0 }}
          animate={{
            width: [0, 500],
            height: [0, 500],
            opacity: [0, 0.4, 0],
          }}
          transition={{ duration: 1.2, delay: 0.7, ease: "easeOut" }}
        />

        {/* ── Flying letters ── */}
        {phase >= 1 && letters.map((l, i) => (
          <FlyingGameLetter key={i} letter={l} index={i} total={letters.length} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default GameEntrance;
