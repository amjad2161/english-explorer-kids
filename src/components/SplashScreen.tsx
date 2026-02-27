import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Interactive3DMascot from "@/components/Interactive3DMascot";
import owlPixar from "@/assets/owl-pixar.png";
import foxGuardian from "@/assets/fox-guardian.png";
import bookworm from "@/assets/bookworm.png";
import mouseLibrarian from "@/assets/mouse-librarian.png";

interface SplashScreenProps {
  onComplete: () => void;
}

/* ───── Seeded random to avoid re-renders ───── */
const seed = (n: number) => { const x = Math.sin(n + 1) * 10000; return x - Math.floor(x); };

/* ───── Twinkling star ───── */
const TwinkleStar = ({ delay, x, y, size, color }: { delay: number; x: number; y: number; size: number; color: string }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      left: `${x}%`, top: `${y}%`,
      width: size, height: size,
      background: color,
      boxShadow: `0 0 ${size * 3}px ${color}`,
    }}
    animate={{ opacity: [0.1, 1, 0.3, 0.9, 0.1], scale: [0.6, 1.4, 0.8, 1.2, 0.6] }}
    transition={{ duration: 2 + seed(delay) * 3, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

/* ───── Magic sparkle burst ───── */
const SparkleParticle = ({ delay, index }: { delay: number; index: number }) => {
  const angle = (index * 137.5) % 360;
  const distance = 80 + seed(index * 3.7) * 200;
  const size = 2 + seed(index * 5.1) * 5;
  const colors = [
    "hsl(262 80% 72%)", "hsl(44 100% 68%)", "hsl(199 80% 70%)",
    "hsl(338 80% 72%)", "hsl(32 95% 66%)", "hsl(152 65% 62%)",
  ];
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size, height: size,
        background: colors[index % colors.length],
        left: "50%", top: "50%",
        boxShadow: `0 0 ${size * 4}px ${colors[index % colors.length]}`,
      }}
      initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0.8, 0],
        scale: [0, 1.8, 1.2, 0],
        x: Math.cos((angle * Math.PI) / 180) * distance,
        y: Math.sin((angle * Math.PI) / 180) * distance,
      }}
      transition={{ duration: 1.8, delay: 1.5 + delay, ease: "easeOut" }}
    />
  );
};

/* ───── Orbiting magic ring ───── */
const MagicRing = ({ radius, delay, duration, color }: { radius: number; delay: number; duration: number; color: string }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: radius * 2, height: radius * 2,
      left: `calc(50% - ${radius}px)`, top: `calc(50% - ${radius}px)`,
      border: `1.5px solid ${color}`,
      boxShadow: `0 0 12px ${color}, inset 0 0 8px ${color}`,
    }}
    initial={{ opacity: 0, scale: 0, rotate: 0 }}
    animate={{ opacity: [0, 0.7, 0.4, 0.6, 0], scale: 1, rotate: 360 }}
    transition={{ duration, delay, ease: "easeOut" }}
  />
);

/* ───── Floating character (used in finale) ───── */
const CharacterFloat = ({ src, x, y, delay, size }: { src: string; x: string; y: string; delay: number; size: number }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: x, top: y }}
    initial={{ opacity: 0, scale: 0, y: 30 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 200, damping: 18, delay }}
  >
    <motion.img
      src={src}
      alt=""
      style={{ width: size, height: size, objectFit: "contain" }}
      animate={{ y: [0, -10, 0], rotate: [0, -3, 3, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: delay + 0.2 }}
      className="drop-shadow-lg"
    />
  </motion.div>
);

/* ───── Disney-quality letter animation ───── */
const AnimatedLetter = ({ char, delay, index }: { char: string; delay: number; index: number }) => {
  const colors = [
    "hsl(262 80% 68%)", "hsl(338 80% 68%)", "hsl(199 80% 65%)",
    "hsl(44 100% 62%)", "hsl(152 65% 55%)", "hsl(295 75% 68%)",
    "hsl(262 80% 68%)",
  ];
  return (
    <motion.span
      style={{ color: colors[index % colors.length], display: "inline-block" }}
      initial={{ opacity: 0, y: 30, scale: 0.5, rotate: -10 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 20, delay }}
    >
      {char}
    </motion.span>
  );
};

/* ───── Background floating letters ───── */
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const floatingLetters = letters.slice(0, 14).map((l, i) => ({
  letter: l,
  x: 4 + (i % 7) * 14,
  y: 8 + Math.floor(i / 7) * 42 + seed(i * 11) * 20,
  delay: 0.6 + i * 0.1,
  size: 24 + seed(i * 17) * 32,
}));

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState<"logo" | "title" | "tagline" | "characters" | "exit">("logo");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("title"), 1200),
      setTimeout(() => setPhase("tagline"), 2400),
      setTimeout(() => setPhase("characters"), 3200),
      setTimeout(() => setPhase("exit"), 4800),
      setTimeout(() => onComplete(), 5400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const titleText = "English Fun";

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{ background: "hsl(var(--background))" }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          {/* ── Deep space / magic gradient background ── */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            style={{
              background: `
                radial-gradient(ellipse 100% 70% at 50% 20%, hsl(262 70% 60% / 0.1) 0%, transparent 55%),
                radial-gradient(ellipse 80% 90% at 20% 80%, hsl(199 80% 60% / 0.08) 0%, transparent 50%),
                radial-gradient(ellipse 70% 60% at 85% 40%, hsl(338 80% 65% / 0.07) 0%, transparent 50%),
                radial-gradient(ellipse 60% 70% at 65% 75%, hsl(44 100% 65% / 0.06) 0%, transparent 50%)
              `,
            }}
          />

          {/* ── Twinkling stars ── */}
          {Array.from({ length: 50 }, (_, i) => (
            <TwinkleStar
              key={i} delay={seed(i * 3.1) * 3}
              x={seed(i * 7.3) * 95} y={seed(i * 11) * 90}
              size={0.8 + seed(i * 5.7) * 2.5}
              color={
                i % 5 === 0 ? "hsl(262 80% 80%)" :
                i % 7 === 0 ? "hsl(44 100% 78%)" :
                "hsl(225 30% 90%)"
              }
            />
          ))}

          {/* ── Magic orbit rings ── */}
          <MagicRing radius={100} delay={0.3} duration={2.5} color="hsl(262 80% 70% / 0.2)" />
          <MagicRing radius={155} delay={0.6} duration={3} color="hsl(199 80% 70% / 0.15)" />
          <MagicRing radius={215} delay={0.9} duration={3.5} color="hsl(338 80% 70% / 0.12)" />
          <MagicRing radius={280} delay={1.2} duration={4} color="hsl(44 100% 68% / 0.1)" />

          {/* ── Spark burst (synced with title) ── */}
          {Array.from({ length: 32 }, (_, i) => (
            <SparkleParticle key={i} index={i} delay={i * 0.04} />
          ))}

          {/* ── Floating background letters ── */}
          {floatingLetters.map((fl, i) => (
            <motion.span
              key={i}
              className="absolute font-display font-extrabold select-none pointer-events-none"
              style={{
                left: `${fl.x}%`, top: `${fl.y}%`,
                fontSize: fl.size,
                opacity: 0,
                color: "hsl(var(--primary))",
              }}
              animate={{
                opacity: [0, 0.08, 0.04, 0.08, 0],
                y: [0, -24, 8, -16, 0],
                scale: [0.8, 1, 0.9, 1.02, 0.8],
              }}
              transition={{ duration: 5, delay: fl.delay, ease: "easeInOut", repeat: Infinity, repeatDelay: 3 }}
            >
              {fl.letter}
            </motion.span>
          ))}

          {/* ── Center content ── */}
          <div className="relative z-10 text-center px-4">

            {/* Owl mascot — spring entrance */}
            <motion.div
              className="relative mx-auto mb-5 flex justify-center"
              initial={{ scale: 0, opacity: 0, y: 40, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.15 }}
            >
              {/* Glow ring behind owl */}
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, hsl(262 80% 72% / 0.25) 0%, transparent 65%)",
                  filter: "blur(20px)",
                  width: "200%", height: "200%",
                  left: "-50%", top: "-50%",
                }}
                animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.9, 1.2, 0.9] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <Interactive3DMascot mood="celebrate" size="lg" />
            </motion.div>

            {/* Title — letter by letter with Disney magic colors */}
            <AnimatePresence>
              {(phase === "title" || phase === "tagline" || phase === "characters") && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4"
                >
                  <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-extrabold leading-none tracking-tight">
                    {titleText.split("").map((char, i) => (
                      <AnimatedLetter
                        key={i}
                        char={char === " " ? "\u00A0" : char}
                        index={i}
                        delay={0.05 + i * 0.07}
                      />
                    ))}
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tagline */}
            <AnimatePresence>
              {(phase === "tagline" || phase === "characters") && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="mb-6"
                >
                  <motion.p
                    className="text-lg sm:text-2xl font-display font-bold mb-3"
                    style={{
                      background: "linear-gradient(135deg, hsl(262 80% 65%), hsl(338 80% 68%), hsl(44 100% 60%))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    ✨ Where Learning Meets Magic ✨
                  </motion.p>
                  <motion.div
                    className="flex justify-center gap-3 mt-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                  >
                    {["🔤", "🎯", "🧩", "🐝", "🎭", "🎪"].map((emoji, i) => (
                      <motion.span
                        key={emoji}
                        className="text-2xl sm:text-3xl"
                        initial={{ scale: 0, rotate: -25 }}
                        animate={{ scale: 1, rotate: 0, y: [0, -6, 0] }}
                        transition={{
                          scale: { type: "spring", stiffness: 360, damping: 14, delay: 0.3 + i * 0.1 },
                          rotate: { duration: 0.4, delay: 0.3 + i * 0.1 },
                          y: { duration: 2 + i * 0.3, repeat: Infinity, delay: 0.3 + i * 0.2 },
                        }}
                        style={{ display: "inline-block" }}
                      >
                        {emoji}
                      </motion.span>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Characters parade */}
            <AnimatePresence>
              {phase === "characters" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-end justify-center gap-3 sm:gap-5 mt-2"
                >
                  {[
                    { src: foxGuardian, delay: 0 },
                    { src: bookworm, delay: 0.15 },
                    { src: mouseLibrarian, delay: 0.3 },
                  ].map((char, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 30, scale: 0.5 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 18, delay: char.delay }}
                    >
                      <motion.img
                        src={char.src}
                        alt=""
                        className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                        style={{
                          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
                        }}
                        animate={{ y: [0, -8, 0], rotate: [0, i % 2 === 0 ? -4 : 4, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: char.delay + 0.3 }}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Cinematic progress bar ── */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-52 sm:w-64">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(262 50% 65% / 0.15)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, hsl(262 80% 65%), hsl(338 80% 68%), hsl(44 100% 62%))",
                }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4.8, ease: "easeInOut" }}
              />
            </div>
            <motion.p
              className="text-center text-xs font-display font-semibold mt-2"
              style={{ color: "hsl(262 60% 65% / 0.5)" }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Loading magic...
            </motion.p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default SplashScreen;
