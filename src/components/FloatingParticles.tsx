import { motion } from "framer-motion";
import { useMemo } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

const COLORS = [
  "hsl(var(--primary) / 0.08)",
  "hsl(var(--secondary) / 0.06)",
  "hsl(var(--accent) / 0.06)",
  "hsl(var(--lavender) / 0.05)",
  "hsl(var(--sunshine) / 0.05)",
];

const FloatingParticles = ({ count = 12 }: { count?: number }) => {
  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 80 + Math.random() * 160,
      duration: 20 + Math.random() * 15,
      delay: Math.random() * -15,
      color: COLORS[i % COLORS.length],
    })), [count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full will-change-transform"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, ${p.color}, transparent 70%)`,
          }}
          animate={{
            y: [0, -30, 10, -20, 0],
            x: [0, 15, -8, 5, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
