import { motion } from "framer-motion";
import { useMemo } from "react";

/**
 * ClassroomBackground — Fun animated school/classroom themed background.
 * Chalkboard texture, floating school supplies (pencils, books, stars, ABCs).
 * Pixar/animation movie style — colorful, warm, playful.
 */

const SUPPLIES = [
  { emoji: "✏️", size: 28 },
  { emoji: "📚", size: 30 },
  { emoji: "🔤", size: 26 },
  { emoji: "⭐", size: 24 },
  { emoji: "📐", size: 26 },
  { emoji: "🎨", size: 28 },
  { emoji: "📖", size: 30 },
  { emoji: "✨", size: 22 },
  { emoji: "🖍️", size: 26 },
  { emoji: "🍎", size: 24 },
  { emoji: "💡", size: 24 },
  { emoji: "🌟", size: 22 },
  { emoji: "📝", size: 26 },
  { emoji: "🎓", size: 28 },
];

const ClassroomBackground = () => {
  const floatingItems = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => {
      const supply = SUPPLIES[i % SUPPLIES.length];
      return {
        ...supply,
        x: 3 + (i * 5.5) % 94,
        y: 5 + Math.random() * 85,
        delay: i * 1.2,
        duration: 18 + Math.random() * 12,
        drift: -15 + Math.random() * 30,
        rotation: -20 + Math.random() * 40,
        opacity: 0.12 + Math.random() * 0.1,
      };
    }), []
  );

  const chalkLines = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      y: 18 + i * 18,
      opacity: 0.04 + Math.random() * 0.03,
      width: 60 + Math.random() * 30,
      offset: 5 + Math.random() * 10,
    })), []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Base: Soft chalkboard-green gradient */}
      <div className="absolute inset-0" style={{
        background: `
          linear-gradient(175deg, 
            hsl(160 22% 18%) 0%, 
            hsl(158 20% 22%) 30%, 
            hsl(155 18% 20%) 60%, 
            hsl(160 22% 16%) 100%
          )
        `,
      }} />

      {/* Chalk dust texture overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, hsl(160 15% 30% / 0.15) 0%, transparent 50%),
          radial-gradient(circle at 75% 60%, hsl(160 15% 28% / 0.12) 0%, transparent 45%),
          radial-gradient(circle at 50% 80%, hsl(160 15% 25% / 0.1) 0%, transparent 40%)
        `,
      }} />

      {/* Subtle chalk noise pattern */}
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: `
          radial-gradient(circle, hsl(45 30% 85%) 1px, transparent 1px)
        `,
        backgroundSize: "18px 18px",
      }} />

      {/* Chalk writing lines */}
      {chalkLines.map((line, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: `${line.y}%`,
            left: `${line.offset}%`,
            width: `${line.width}%`,
            height: "1px",
            background: `linear-gradient(90deg, transparent, hsl(45 20% 80% / ${line.opacity}), transparent)`,
          }}
        />
      ))}

      {/* Wooden frame edges */}
      <div className="absolute top-0 left-0 right-0 h-3" style={{
        background: "linear-gradient(180deg, hsl(30 40% 25%) 0%, hsl(30 35% 20% / 0.6) 60%, transparent 100%)",
      }} />
      <div className="absolute bottom-0 left-0 right-0 h-4" style={{
        background: "linear-gradient(0deg, hsl(30 45% 22%) 0%, hsl(30 35% 20% / 0.5) 50%, transparent 100%)",
      }} />
      <div className="absolute left-0 top-0 bottom-0 w-2" style={{
        background: "linear-gradient(90deg, hsl(30 40% 22% / 0.7) 0%, transparent 100%)",
      }} />
      <div className="absolute right-0 top-0 bottom-0 w-2" style={{
        background: "linear-gradient(-90deg, hsl(30 40% 22% / 0.7) 0%, transparent 100%)",
      }} />

      {/* Chalk tray at bottom */}
      <div className="absolute bottom-0 left-[5%] right-[5%] h-8" style={{
        background: "linear-gradient(0deg, hsl(30 35% 28%) 0%, hsl(30 30% 24%) 70%, transparent 100%)",
        borderRadius: "4px 4px 0 0",
      }}>
        {/* Chalk pieces on tray */}
        <div className="absolute bottom-1 left-[10%] w-8 h-2 rounded-full" style={{ background: "hsl(0 0% 92% / 0.5)" }} />
        <div className="absolute bottom-1.5 left-[25%] w-6 h-1.5 rounded-full" style={{ background: "hsl(45 90% 65% / 0.5)" }} />
        <div className="absolute bottom-1 left-[60%] w-7 h-2 rounded-full" style={{ background: "hsl(210 70% 65% / 0.4)" }} />
        <div className="absolute bottom-1.5 left-[80%] w-5 h-1.5 rounded-full" style={{ background: "hsl(330 60% 65% / 0.4)" }} />
      </div>

      {/* Floating school supplies */}
      {floatingItems.map((item, i) => (
        <motion.div
          key={i}
          className="absolute select-none"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: item.size,
            opacity: item.opacity,
            filter: "blur(0.5px)",
          }}
          animate={{
            y: [0, -20, 5, -12, 0],
            x: [0, item.drift * 0.5, 0],
            rotate: [0, item.rotation, -item.rotation * 0.5, 0],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: "easeInOut",
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* Chalk "ABC" scribble hints */}
      <div className="absolute top-[8%] right-[8%] font-display text-4xl font-bold opacity-[0.06]" style={{
        color: "hsl(45 30% 85%)",
        transform: "rotate(-5deg)",
        fontFamily: "'Baloo 2', cursive",
      }}>
        ABC
      </div>
      <div className="absolute top-[15%] left-[6%] font-display text-2xl font-bold opacity-[0.05]" style={{
        color: "hsl(45 30% 85%)",
        transform: "rotate(3deg)",
        fontFamily: "'Baloo 2', cursive",
      }}>
        Hello!
      </div>
      <div className="absolute bottom-[22%] right-[12%] font-display text-3xl font-bold opacity-[0.05]" style={{
        color: "hsl(45 30% 85%)",
        transform: "rotate(7deg)",
        fontFamily: "'Baloo 2', cursive",
      }}>
        A+ ⭐
      </div>

      {/* Soft vignette for depth */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 70% 65% at 50% 50%, transparent 40%, hsl(160 25% 10% / 0.4) 100%)",
      }} />

      {/* Warm spotlight from above */}
      <motion.div
        className="absolute"
        style={{
          top: "-5%",
          left: "35%",
          width: "30%",
          height: "50%",
          background: "radial-gradient(ellipse, hsl(45 60% 70% / 0.06) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
        animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

export default ClassroomBackground;
