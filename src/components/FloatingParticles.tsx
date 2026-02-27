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

const EMOJIS = ["⭐", "🌟", "✨", "💫", "🎈", "🦋", "🌸", "🍀", "🎵", "💎", "🌈", "🎪"];

const FloatingParticles = ({ count = 18 }: { count?: number }) => {
  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: EMOJIS[i % EMOJIS.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 14 + Math.random() * 18,
      duration: 12 + Math.random() * 20,
      delay: Math.random() * -20,
    })), [count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute select-none"
          style={{ left: `${p.x}%`, top: `${p.y}%`, fontSize: p.size }}
          animate={{
            y: [0, -60, 20, -40, 0],
            x: [0, 30, -20, 15, 0],
            rotate: [0, 15, -10, 8, 0],
            opacity: [0.15, 0.35, 0.2, 0.3, 0.15],
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
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.08), transparent 70%)",
          top: "-10%", right: "-10%",
        }}
        animate={{ scale: [1, 1.3, 1], x: [0, 50, 0], y: [0, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(var(--accent) / 0.06), transparent 70%)",
          bottom: "-5%", left: "-8%",
        }}
        animate={{ scale: [1, 1.2, 1], x: [0, -40, 0], y: [0, 40, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: -8 }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(var(--secondary) / 0.05), transparent 70%)",
          top: "40%", left: "50%",
        }}
        animate={{ scale: [0.8, 1.1, 0.8], x: [0, 60, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: -5 }}
      />
    </div>
  );
};

export default FloatingParticles;
