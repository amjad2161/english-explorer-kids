import { motion } from "framer-motion";
import { useMemo } from "react";
import { useTheme } from "@/lib/theme";

/**
 * ClassroomBackground — Disney/Pixar quality magical world background.
 * Light mode: Vibrant magical sky with aurora wisps, glowing orbs, sparkles, floating magic elements.
 * Dark mode: Deep enchanted night sky with aurora borealis, stars, shooting stars, magic portals.
 */

/* ─── Seeded pseudo-random to avoid hydration mismatch ─── */
const seeded = (seed: number) => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

const MAGIC_ELEMENTS_LIGHT = [
  { emoji: "✨", size: 28 }, { emoji: "⭐", size: 26 }, { emoji: "🌟", size: 24 },
  { emoji: "💫", size: 22 }, { emoji: "🎀", size: 28 }, { emoji: "🦋", size: 26 },
  { emoji: "🌸", size: 24 }, { emoji: "🎈", size: 28 }, { emoji: "🍀", size: 22 },
  { emoji: "🌈", size: 24 }, { emoji: "💎", size: 22 }, { emoji: "🪄", size: 26 },
  { emoji: "🎪", size: 24 }, { emoji: "🎠", size: 28 }, { emoji: "🌺", size: 24 },
  { emoji: "🦄", size: 26 },
];

const MAGIC_ELEMENTS_DARK = [
  { emoji: "⭐", size: 20 }, { emoji: "🌟", size: 22 }, { emoji: "💫", size: 24 },
  { emoji: "✨", size: 20 }, { emoji: "🌙", size: 26 }, { emoji: "🪐", size: 24 },
  { emoji: "🔮", size: 26 }, { emoji: "🌌", size: 28 }, { emoji: "💎", size: 22 },
  { emoji: "🪄", size: 24 }, { emoji: "🦋", size: 22 }, { emoji: "🌠", size: 20 },
  { emoji: "⚡", size: 20 }, { emoji: "🌙", size: 22 }, { emoji: "🌟", size: 18 },
  { emoji: "💠", size: 22 },
];

/* ─── Static star positions for dark mode ─── */
const STARS = Array.from({ length: 80 }, (_, i) => ({
  x: seeded(i * 3.1) * 100,
  y: seeded(i * 7.3) * 60,
  size: 0.8 + seeded(i * 5.7) * 2,
  delay: seeded(i * 11.3) * 5,
  duration: 2 + seeded(i * 13.7) * 4,
}));

/* ─── Aurora band data ─── */
const AURORA_BANDS = [
  { hsl: "262 80% 70%", lightOpacity: 0.12, darkOpacity: 0.22, offsetX: -10, offsetY: 15, skew: -5, delay: 0 },
  { hsl: "180 70% 60%", lightOpacity: 0.09, darkOpacity: 0.16, offsetX: 5, offsetY: 22, skew: 8, delay: 1.5 },
  { hsl: "295 75% 70%", lightOpacity: 0.08, darkOpacity: 0.14, offsetX: 20, offsetY: 12, skew: -3, delay: 3 },
  { hsl: "152 65% 55%", lightOpacity: 0.07, darkOpacity: 0.12, offsetX: -5, offsetY: 28, skew: 6, delay: 4.5 },
];

const ClassroomBackground = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const floatingItems = useMemo(() => {
    const elements = isDark ? MAGIC_ELEMENTS_DARK : MAGIC_ELEMENTS_LIGHT;
    return Array.from({ length: 16 }, (_, i) => {
      const el = elements[i % elements.length];
      return {
        ...el,
        x: 2 + (i * 6.25) % 96,
        y: 4 + seeded(i * 17) * 82,
        delay: seeded(i * 9) * 8,
        duration: 16 + seeded(i * 23) * 14,
        drift: (seeded(i * 31) - 0.5) * 30,
        rotation: (seeded(i * 37) - 0.5) * 40,
      };
    });
  }, [isDark]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">

      {/* ═══ LIGHT MODE: Vibrant Disney Magic World ═══ */}
      {!isDark && (
        <>
          {/* Soft gradient base — magical pastel sky */}
          <div className="absolute inset-0" style={{
            background: `
              linear-gradient(160deg,
                hsl(240 50% 97%) 0%,
                hsl(255 40% 96%) 25%,
                hsl(280 35% 97%) 50%,
                hsl(200 45% 96%) 75%,
                hsl(170 40% 95%) 100%
              )
            `,
          }} />

          {/* Disney Aurora wisps — top area */}
          {AURORA_BANDS.map((band, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: `${band.offsetY}%`,
                left: `-5%`,
                right: `-5%`,
                height: "18%",
                background: `linear-gradient(90deg, transparent 0%, hsl(${band.hsl} / ${band.lightOpacity}) 20%, hsl(${band.hsl} / ${band.lightOpacity * 0.3}) 50%, hsl(${band.hsl} / ${band.lightOpacity}) 80%, transparent 100%)`,
                filter: "blur(18px)",
                transform: `skewY(${band.skew}deg)`,
              }}
              animate={{
                opacity: [0.4, 0.8, 0.5, 0.9, 0.4],
                scaleX: [0.9, 1.05, 0.95, 1.08, 0.9],
              }}
              transition={{
                duration: 10 + i * 2,
                delay: band.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Magic orbs — large glowing spheres */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 300, height: 300,
              top: "-8%", right: "-5%",
              background: "radial-gradient(circle at 35% 35%, hsl(295 80% 85% / 0.18) 0%, hsl(262 80% 75% / 0.12) 40%, transparent 70%)",
              filter: "blur(20px)",
            }}
            animate={{ scale: [1, 1.08, 0.96, 1.04, 1], opacity: [0.6, 0.9, 0.7, 0.95, 0.6] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 250, height: 250,
              bottom: "5%", left: "-3%",
              background: "radial-gradient(circle at 60% 40%, hsl(199 80% 80% / 0.16) 0%, hsl(152 65% 70% / 0.1) 40%, transparent 70%)",
              filter: "blur(18px)",
            }}
            animate={{ scale: [1, 1.06, 0.98, 1.04, 1], opacity: [0.5, 0.8, 0.6, 0.85, 0.5] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 180, height: 180,
              top: "30%", left: "48%",
              background: "radial-gradient(circle at 40% 45%, hsl(44 100% 75% / 0.14) 0%, hsl(32 95% 70% / 0.08) 40%, transparent 70%)",
              filter: "blur(14px)",
            }}
            animate={{ scale: [1, 1.1, 0.94, 1.06, 1], opacity: [0.4, 0.7, 0.5, 0.75, 0.4] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          />

          {/* Rainbow arc decorations */}
          <div className="absolute" style={{
            top: "0%", left: "20%", right: "20%", height: "40%",
            background: `
              radial-gradient(ellipse 80% 50% at 50% -10%,
                hsl(0 80% 80% / 0.03) 0%,
                hsl(30 90% 75% / 0.04) 20%,
                hsl(55 100% 72% / 0.04) 35%,
                hsl(120 65% 70% / 0.03) 50%,
                hsl(210 75% 72% / 0.03) 65%,
                hsl(260 70% 72% / 0.03) 80%,
                transparent 100%
              )
            `,
          }} />

          {/* Sparkle dot grid */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: `
              radial-gradient(circle, hsl(262 70% 60%) 1px, transparent 1px),
              radial-gradient(circle, hsl(199 70% 60%) 0.8px, transparent 0.8px)
            `,
            backgroundSize: "48px 48px, 72px 72px",
            backgroundPosition: "0 0, 24px 24px",
          }} />
        </>
      )}

      {/* ═══ DARK MODE: Disney Enchanted Night ═══ */}
      {isDark && (
        <>
          {/* Deep space background */}
          <div className="absolute inset-0" style={{
            background: `
              radial-gradient(ellipse 120% 80% at 50% 0%,
                hsl(260 55% 14%) 0%,
                hsl(250 50% 10%) 35%,
                hsl(240 45% 8%) 65%,
                hsl(248 42% 7%) 100%
              )
            `,
          }} />

          {/* Aurora borealis bands */}
          {AURORA_BANDS.map((band, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: `${10 + band.offsetY}%`,
                left: "-8%",
                right: "-8%",
                height: "22%",
                background: `linear-gradient(90deg, transparent 5%, hsl(${band.hsl} / ${band.darkOpacity}) 25%, transparent 55%, hsl(${band.hsl} / ${band.darkOpacity * 0.8}) 75%, transparent 95%)`,
                filter: "blur(22px)",
                transform: `skewY(${band.skew * 0.6}deg)`,
              }}
              animate={{
                opacity: [0.4, 0.9, 0.5, 0.8, 0.4],
                scaleX: [0.85, 1.08, 0.9, 1.05, 0.85],
                y: [0, -10, 5, -8, 0],
              }}
              transition={{
                duration: 12 + i * 2.5,
                delay: band.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Glowing nebula clouds */}
          <motion.div className="absolute" style={{
            top: "-10%", right: "-8%", width: "55%", height: "60%",
            background: `radial-gradient(ellipse at 55% 35%,
              hsl(262 70% 55% / 0.12) 0%,
              hsl(295 65% 50% / 0.08) 30%,
              hsl(240 60% 45% / 0.05) 60%,
              transparent 80%)`,
            filter: "blur(28px)",
          }}
            animate={{ opacity: [0.5, 0.85, 0.6, 0.9, 0.5], scale: [1, 1.04, 0.97, 1.03, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div className="absolute" style={{
            bottom: "0%", left: "-8%", width: "50%", height: "55%",
            background: `radial-gradient(ellipse at 40% 60%,
              hsl(180 70% 45% / 0.1) 0%,
              hsl(152 65% 40% / 0.07) 35%,
              hsl(199 70% 42% / 0.05) 60%,
              transparent 80%)`,
            filter: "blur(25px)",
          }}
            animate={{ opacity: [0.45, 0.75, 0.55, 0.8, 0.45], scale: [1, 1.05, 0.96, 1.04, 1] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          />

          {/* Star field */}
          {STARS.map((star, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: star.size,
                height: star.size,
                background: i % 5 === 0
                  ? "hsl(52 100% 82%)"
                  : i % 7 === 0
                  ? "hsl(199 80% 85%)"
                  : "hsl(225 30% 92%)",
                boxShadow: star.size > 2 ? `0 0 ${star.size * 3}px hsl(52 100% 80% / 0.6)` : "none",
              }}
              animate={{
                opacity: [0.2, 1, 0.4, 0.9, 0.2],
                scale: [0.8, 1.3, 0.9, 1.2, 0.8],
              }}
              transition={{
                duration: star.duration,
                delay: star.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Shooting stars */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`shoot-${i}`}
              className="absolute"
              style={{
                top: `${8 + i * 12}%`,
                left: "-10%",
                width: "120px",
                height: "1.5px",
                background: "linear-gradient(90deg, transparent, hsl(52 100% 80%), hsl(0 0% 100%), transparent)",
                filter: "blur(0.5px)",
                borderRadius: "2px",
              }}
              animate={{
                x: ["0%", "130vw"],
                y: [0, 40],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 2.5,
                delay: 4 + i * 8,
                repeat: Infinity,
                repeatDelay: 15 + i * 6,
                ease: "easeIn",
              }}
            />
          ))}

          {/* Magic portal glow */}
          <motion.div className="absolute" style={{
            top: "20%", right: "5%",
            width: 80, height: 80,
            background: "radial-gradient(circle, hsl(262 80% 72% / 0.25) 0%, hsl(295 70% 65% / 0.1) 40%, transparent 70%)",
            filter: "blur(8px)",
            borderRadius: "50%",
          }}
            animate={{ scale: [1, 1.4, 0.9, 1.3, 1], opacity: [0.4, 0.9, 0.5, 0.85, 0.4] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Bottom fog */}
          <div className="absolute bottom-0 left-0 right-0 h-32" style={{
            background: "linear-gradient(0deg, hsl(248 42% 7%) 0%, transparent 100%)",
          }} />

          {/* Vignette */}
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 45%, hsl(240 45% 5% / 0.6) 100%)",
          }} />
        </>
      )}

      {/* ═══ SHARED: Floating magic elements ═══ */}
      {floatingItems.map((item, i) => (
        <motion.div
          key={i}
          className="absolute select-none"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: item.size,
            opacity: isDark ? 0.15 : 0.22,
            filter: isDark
              ? `blur(0.3px) drop-shadow(0 0 ${item.size / 6}px hsl(262 80% 72% / 0.4))`
              : `drop-shadow(0 2px 4px rgba(0,0,0,0.08))`,
          }}
          animate={{
            y: [0, -18, 4, -12, 0],
            x: [0, item.drift * 0.4, item.drift * 0.2, 0],
            rotate: [0, item.rotation, -item.rotation * 0.4, item.rotation * 0.2, 0],
            scale: [1, 1.05, 0.97, 1.03, 1],
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

      {/* ═══ SHARED: Decorative text labels ═══ */}
      <div className="absolute top-[7%] right-[7%] font-display font-extrabold" style={{
        fontSize: "clamp(28px, 3vw, 48px)",
        color: isDark ? "hsl(262 70% 75%)" : "hsl(262 70% 65%)",
        opacity: isDark ? 0.07 : 0.1,
        transform: "rotate(-6deg)",
        fontFamily: "'Baloo 2', cursive",
        textShadow: isDark ? "0 0 20px hsl(262 80% 70% / 0.3)" : "none",
      }}>
        ABC
      </div>
      <div className="absolute top-[14%] left-[5%] font-display font-extrabold" style={{
        fontSize: "clamp(18px, 2vw, 30px)",
        color: isDark ? "hsl(152 65% 60%)" : "hsl(152 65% 50%)",
        opacity: isDark ? 0.07 : 0.1,
        transform: "rotate(4deg)",
        fontFamily: "'Baloo 2', cursive",
        textShadow: isDark ? "0 0 14px hsl(152 65% 60% / 0.3)" : "none",
      }}>
        Hello! 👋
      </div>
      <div className="absolute bottom-[25%] right-[10%] font-display font-extrabold" style={{
        fontSize: "clamp(20px, 2.5vw, 36px)",
        color: isDark ? "hsl(44 100% 68%)" : "hsl(44 100% 55%)",
        opacity: isDark ? 0.07 : 0.1,
        transform: "rotate(8deg)",
        fontFamily: "'Baloo 2', cursive",
        textShadow: isDark ? "0 0 14px hsl(44 100% 65% / 0.3)" : "none",
      }}>
        A+ ⭐
      </div>

      {/* ═══ SHARED: Ambient glow spotlight ═══ */}
      <motion.div
        className="absolute"
        style={{
          top: "-10%", left: "30%", width: "40%", height: "55%",
          background: isDark
            ? "radial-gradient(ellipse, hsl(262 65% 65% / 0.06) 0%, transparent 65%)"
            : "radial-gradient(ellipse, hsl(280 60% 75% / 0.10) 0%, transparent 65%)",
          filter: "blur(35px)",
        }}
        animate={{ opacity: [0.5, 0.85, 0.55, 0.8, 0.5], scale: [1, 1.06, 0.97, 1.04, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

export default ClassroomBackground;
