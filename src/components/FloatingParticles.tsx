import { motion } from "framer-motion";
import { useMemo } from "react";

const EDU_ITEMS = [
  "📚", "✏️", "📐", "🎓", "📖", "🔬", "🎨", "📏",
  "🧮", "🖊️", "📝", "🏫", "🎒", "✂️", "📎", "🖍️",
  "🧲", "⭐", "💡", "🌍", "📓", "🔔", "✨", "🎵",
];

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const FloatingParticles = ({ count = 18 }: { count?: number }) => {
  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: EDU_ITEMS[i % EDU_ITEMS.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 14 + Math.random() * 14,
      duration: 18 + Math.random() * 20,
      delay: Math.random() * -20,
    })), [count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Educational floating items */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute select-none will-change-transform"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            fontSize: p.size,
            transform: "translateZ(0)",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
          }}
          animate={{
            y: [0, -40, 10, -25, 0],
            x: [0, 20, -10, 8, 0],
            rotate: [0, 10, -6, 4, 0],
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

      {/* Chalkboard dust/glow effects */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.06), transparent 65%)",
          top: "-8%", right: "-8%",
        }}
        animate={{ scale: [1, 1.25, 1], x: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(var(--accent) / 0.05), transparent 65%)",
          bottom: "-5%", left: "-6%",
        }}
        animate={{ scale: [1, 1.15, 1], y: [0, 30, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: -10 }}
      />
    </div>
  );
};

export default FloatingParticles;
