import { motion } from "framer-motion";
import { useMemo } from "react";

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const EMOJIS_LIGHT = ["⭐", "🌟", "✨", "💫", "🎈", "🦋", "🌸", "🍀", "🎵", "💎", "🌈", "🎪"];
const EMOJIS_DARK = ["✨", "💫", "⭐", "🌟", "🔮", "💎", "🌙", "⚡", "🪐", "🌠", "💜", "🦉"];

const FloatingParticles = ({ count = 18 }: { count?: number }) => {
  const isDark = document.documentElement.classList.contains("dark");
  const emojis = isDark ? EMOJIS_DARK : EMOJIS_LIGHT;

  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: emojis[i % emojis.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 12 + Math.random() * 16,
      duration: 14 + Math.random() * 22,
      delay: Math.random() * -20,
    })), [count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute select-none"
          style={{ left: `${p.x}%`, top: `${p.y}%`, fontSize: p.size }}
          animate={{
            y: [0, -50, 15, -35, 0],
            x: [0, 25, -15, 12, 0],
            rotate: [0, 12, -8, 6, 0],
            opacity: [0.12, 0.3, 0.18, 0.25, 0.12],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        >
          {p.emoji}
        </motion.div>
      ))}

      {/* Ambient gradient orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.06] dark:opacity-[0.08]"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary)), transparent 65%)",
          top: "-10%", right: "-10%",
        }}
        animate={{ scale: [1, 1.3, 1], x: [0, 50, 0], y: [0, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.04] dark:opacity-[0.06]"
        style={{
          background: "radial-gradient(circle, hsl(var(--accent)), transparent 65%)",
          bottom: "-5%", left: "-8%",
        }}
        animate={{ scale: [1, 1.2, 1], x: [0, -40, 0], y: [0, 40, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: -8 }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-[0.03] dark:opacity-[0.05]"
        style={{
          background: "radial-gradient(circle, hsl(var(--candy)), transparent 65%)",
          top: "40%", left: "50%",
        }}
        animate={{ scale: [0.8, 1.1, 0.8], x: [0, 60, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: -5 }}
      />
    </div>
  );
};

export default FloatingParticles;
