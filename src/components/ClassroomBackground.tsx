import { motion } from "framer-motion";
import { useMemo } from "react";
import { useTheme } from "@/lib/theme";

/**
 * ClassroomBackground — Animated school/classroom themed background.
 * Light mode: Bright notebook paper with pastel blobs and floating supplies.
 * Dark mode: Chalkboard green with chalk dust and wooden frame.
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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const floatingItems = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => {
      const supply = SUPPLIES[i % SUPPLIES.length];
      return {
        ...supply,
        x: 3 + (i * 6) % 94,
        y: 5 + Math.random() * 85,
        delay: i * 1.2,
        duration: 18 + Math.random() * 12,
        drift: -15 + Math.random() * 30,
        rotation: -20 + Math.random() * 40,
      };
    }), []
  );

  const chalkLines = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      y: 18 + i * 18,
      width: 60 + Math.random() * 30,
      offset: 5 + Math.random() * 10,
    })), []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">

      {/* ═══ LIGHT MODE: Notebook paper ═══ */}
      {!isDark && (
        <>
          {/* Clean warm white base */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(175deg, hsl(45 40% 97%) 0%, hsl(40 30% 95%) 50%, hsl(35 25% 93%) 100%)",
          }} />

          {/* Notebook ruled lines */}
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 31px, hsl(210 60% 70%) 31px, hsl(210 60% 70%) 32px)",
            backgroundSize: "100% 32px",
          }} />

          {/* Red margin line */}
          <div className="absolute top-0 bottom-0 opacity-[0.08]" style={{
            left: "8%",
            width: "2px",
            background: "hsl(0 65% 55%)",
          }} />

          {/* Soft pastel blobs */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 15% 20%, hsl(142 55% 60% / 0.08) 0%, transparent 40%),
              radial-gradient(circle at 80% 30%, hsl(210 70% 60% / 0.07) 0%, transparent 35%),
              radial-gradient(circle at 50% 70%, hsl(45 90% 60% / 0.06) 0%, transparent 40%),
              radial-gradient(circle at 25% 85%, hsl(330 60% 60% / 0.05) 0%, transparent 35%),
              radial-gradient(circle at 75% 75%, hsl(265 50% 60% / 0.05) 0%, transparent 35%)
            `,
          }} />

          {/* Paper texture dots */}
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: "radial-gradient(circle, hsl(30 20% 40%) 0.5px, transparent 0.5px)",
            backgroundSize: "12px 12px",
          }} />
        </>
      )}

      {/* ═══ DARK MODE: Chalkboard ═══ */}
      {isDark && (
        <>
          {/* Green chalkboard base */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(175deg, hsl(160 22% 16%) 0%, hsl(158 20% 19%) 30%, hsl(155 18% 17%) 60%, hsl(160 22% 14%) 100%)",
          }} />

          {/* Chalk dust */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, hsl(160 15% 28% / 0.12) 0%, transparent 50%),
              radial-gradient(circle at 75% 60%, hsl(160 15% 25% / 0.1) 0%, transparent 45%),
              radial-gradient(circle at 50% 80%, hsl(160 15% 22% / 0.08) 0%, transparent 40%)
            `,
          }} />

          {/* Chalk noise */}
          <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: "radial-gradient(circle, hsl(45 30% 85%) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }} />

          {/* Chalk writing lines */}
          {chalkLines.map((line, i) => (
            <div key={i} className="absolute" style={{
              top: `${line.y}%`, left: `${line.offset}%`, width: `${line.width}%`, height: "1px",
              background: `linear-gradient(90deg, transparent, hsl(45 20% 80% / 0.04), transparent)`,
            }} />
          ))}

          {/* Wooden frame */}
          <div className="absolute top-0 left-0 right-0 h-3" style={{ background: "linear-gradient(180deg, hsl(30 40% 22%) 0%, transparent 100%)" }} />
          <div className="absolute bottom-0 left-0 right-0 h-4" style={{ background: "linear-gradient(0deg, hsl(30 45% 20%) 0%, transparent 100%)" }} />
          <div className="absolute left-0 top-0 bottom-0 w-2" style={{ background: "linear-gradient(90deg, hsl(30 40% 20% / 0.6) 0%, transparent 100%)" }} />
          <div className="absolute right-0 top-0 bottom-0 w-2" style={{ background: "linear-gradient(-90deg, hsl(30 40% 20% / 0.6) 0%, transparent 100%)" }} />

          {/* Chalk tray */}
          <div className="absolute bottom-0 left-[5%] right-[5%] h-7" style={{
            background: "linear-gradient(0deg, hsl(30 35% 25%) 0%, hsl(30 30% 22%) 70%, transparent 100%)",
            borderRadius: "4px 4px 0 0",
          }}>
            <div className="absolute bottom-1 left-[10%] w-8 h-2 rounded-full" style={{ background: "hsl(0 0% 90% / 0.4)" }} />
            <div className="absolute bottom-1.5 left-[25%] w-6 h-1.5 rounded-full" style={{ background: "hsl(45 90% 65% / 0.4)" }} />
            <div className="absolute bottom-1 left-[60%] w-7 h-2 rounded-full" style={{ background: "hsl(210 70% 65% / 0.35)" }} />
            <div className="absolute bottom-1.5 left-[80%] w-5 h-1.5 rounded-full" style={{ background: "hsl(330 60% 65% / 0.35)" }} />
          </div>

          {/* Vignette */}
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse 70% 65% at 50% 50%, transparent 40%, hsl(160 25% 8% / 0.4) 100%)",
          }} />
        </>
      )}

      {/* ═══ SHARED: Floating school supplies ═══ */}
      {floatingItems.map((item, i) => (
        <motion.div
          key={i}
          className="absolute select-none"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: item.size,
            opacity: isDark ? 0.12 : 0.18,
            filter: isDark ? "blur(0.5px)" : "none",
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

      {/* ═══ SHARED: Chalk/pencil text scribbles ═══ */}
      <div className="absolute top-[8%] right-[8%] font-display text-4xl font-bold" style={{
        color: isDark ? "hsl(45 30% 85%)" : "hsl(210 40% 70%)",
        opacity: isDark ? 0.06 : 0.08,
        transform: "rotate(-5deg)",
        fontFamily: "'Baloo 2', cursive",
      }}>
        ABC
      </div>
      <div className="absolute top-[15%] left-[6%] font-display text-2xl font-bold" style={{
        color: isDark ? "hsl(45 30% 85%)" : "hsl(142 40% 55%)",
        opacity: isDark ? 0.05 : 0.07,
        transform: "rotate(3deg)",
        fontFamily: "'Baloo 2', cursive",
      }}>
        Hello!
      </div>
      <div className="absolute bottom-[22%] right-[12%] font-display text-3xl font-bold" style={{
        color: isDark ? "hsl(45 30% 85%)" : "hsl(330 50% 60%)",
        opacity: isDark ? 0.05 : 0.07,
        transform: "rotate(7deg)",
        fontFamily: "'Baloo 2', cursive",
      }}>
        A+ ⭐
      </div>

      {/* Warm spotlight */}
      <motion.div
        className="absolute"
        style={{
          top: "-5%", left: "35%", width: "30%", height: "50%",
          background: isDark
            ? "radial-gradient(ellipse, hsl(45 60% 70% / 0.05) 0%, transparent 70%)"
            : "radial-gradient(ellipse, hsl(45 80% 70% / 0.08) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
        animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

export default ClassroomBackground;
