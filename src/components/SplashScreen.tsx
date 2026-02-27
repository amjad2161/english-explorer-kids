import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import owlImage from "@/assets/owl-mascot.png";

interface SplashScreenProps {
  onComplete: () => void;
}

/* ───── Cinematic particles ───── */
const CinematicParticle = ({ delay, index }: { delay: number; index: number }) => {
  const angle = (index * 137.5) % 360; // golden angle distribution
  const distance = 100 + Math.random() * 250;
  const size = 2 + Math.random() * 4;
  const colors = [
    "hsl(var(--primary))",
    "hsl(var(--sunshine))",
    "hsl(var(--sky))",
    "hsl(var(--candy))",
    "hsl(var(--accent))",
    "hsl(var(--lavender))",
  ];
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: colors[index % colors.length],
        left: "50%",
        top: "50%",
        boxShadow: `0 0 ${size * 3}px ${colors[index % colors.length]}`,
      }}
      initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 1.5, 1, 0.5],
        x: Math.cos((angle * Math.PI) / 180) * distance,
        y: Math.sin((angle * Math.PI) / 180) * distance,
      }}
      transition={{
        duration: 2,
        delay: 1.2 + delay,
        ease: "easeOut",
      }}
    />
  );
};

/* ───── Orbiting ring ───── */
const OrbitRing = ({ radius, delay, duration }: { radius: number; delay: number; duration: number }) => (
  <motion.div
    className="absolute rounded-full border"
    style={{
      width: radius * 2,
      height: radius * 2,
      left: `calc(50% - ${radius}px)`,
      top: `calc(50% - ${radius}px)`,
      borderColor: "hsl(var(--primary) / 0.15)",
    }}
    initial={{ opacity: 0, scale: 0, rotate: 0 }}
    animate={{ opacity: [0, 0.6, 0.3], scale: 1, rotate: 360 }}
    transition={{ duration, delay, ease: "easeOut" }}
  />
);

/* ───── Floating letters ───── */
const FloatingLetter = ({ letter, delay, x, y }: { letter: string; delay: number; x: number; y: number }) => (
  <motion.span
    className="absolute font-display font-extrabold text-primary/10 select-none pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%`, fontSize: `${20 + Math.random() * 40}px` }}
    initial={{ opacity: 0, scale: 0, rotate: -20 }}
    animate={{ opacity: [0, 0.15, 0.08], scale: 1, rotate: 0, y: [0, -20, 0] }}
    transition={{ duration: 3, delay, ease: "easeInOut", repeat: Infinity, repeatDelay: 2 }}
  >
    {letter}
  </motion.span>
);

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const floatingLetters = letters.slice(0, 12).map((l, i) => ({
  letter: l,
  x: 5 + (i % 6) * 16,
  y: 10 + Math.floor(i / 6) * 40 + Math.random() * 20,
  delay: 0.8 + i * 0.12,
}));

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState<"logo" | "title" | "tagline" | "exit">("logo");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("title"), 1400),
      setTimeout(() => setPhase("tagline"), 2600),
      setTimeout(() => setPhase("exit"), 4200),
      setTimeout(() => onComplete(), 4800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{ background: "hsl(var(--background))" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Gradient background wash */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            style={{
              background: `
                radial-gradient(ellipse 80% 60% at 50% 40%, hsl(var(--primary) / 0.08) 0%, transparent 60%),
                radial-gradient(ellipse 60% 80% at 30% 70%, hsl(var(--sky) / 0.06) 0%, transparent 50%),
                radial-gradient(ellipse 50% 50% at 80% 30%, hsl(var(--candy) / 0.05) 0%, transparent 50%)
              `,
            }}
          />

          {/* Floating letters in background */}
          {floatingLetters.map((fl, i) => (
            <FloatingLetter key={i} {...fl} />
          ))}

          {/* Orbit rings */}
          <OrbitRing radius={120} delay={0.3} duration={2} />
          <OrbitRing radius={180} delay={0.5} duration={2.5} />
          <OrbitRing radius={250} delay={0.7} duration={3} />

          {/* Cinematic particles */}
          {Array.from({ length: 24 }, (_, i) => (
            <CinematicParticle key={i} index={i} delay={i * 0.06} />
          ))}

          {/* Center content */}
          <div className="relative z-10 text-center">
            {/* Owl mascot entrance */}
            <motion.div
              className="relative mx-auto mb-6"
              style={{ width: 200, height: 200 }}
              initial={{ scale: 0, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
            >
              {/* Ambient glow behind owl */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle, hsl(var(--primary) / 0.2), hsl(var(--sunshine) / 0.1), transparent 65%)",
                  filter: "blur(30px)",
                  width: "300%",
                  height: "300%",
                  left: "-100%",
                  top: "-100%",
                }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.img
                src={owlImage}
                alt="English Fun Owl"
                className="w-full h-full object-contain relative z-10 select-none"
                style={{
                  WebkitMaskImage: "radial-gradient(ellipse 48% 50% at 50% 48%, black 55%, transparent 80%)",
                  maskImage: "radial-gradient(ellipse 48% 50% at 50% 48%, black 55%, transparent 80%)",
                  filter: "drop-shadow(0 8px 25px hsl(var(--primary) / 0.3))",
                }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            {/* Title */}
            <AnimatePresence>
              {(phase === "title" || phase === "tagline") && (
                <motion.h1
                  initial={{ opacity: 0, y: 30, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 150, damping: 15 }}
                  className="text-5xl sm:text-7xl md:text-8xl font-display font-extrabold mb-4"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--candy)), hsl(var(--lavender)), hsl(var(--sky)))",
                    backgroundSize: "300% 300%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    animation: "aurora 4s ease-in-out infinite",
                  }}
                >
                  English Fun
                </motion.h1>
              )}
            </AnimatePresence>

            {/* Tagline */}
            <AnimatePresence>
              {phase === "tagline" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <p className="text-lg sm:text-xl text-muted-foreground font-body mb-2">
                    ✨ Where Learning Meets Adventure ✨
                  </p>
                  <motion.div
                    className="flex justify-center gap-3 mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {["🔤", "🎯", "🧩", "🐝", "🎭"].map((emoji, i) => (
                      <motion.span
                        key={emoji}
                        className="text-2xl sm:text-3xl"
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 12,
                          delay: 0.4 + i * 0.1,
                        }}
                      >
                        {emoji}
                      </motion.span>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom loading bar */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48">
            <div className="h-1 rounded-full bg-muted/30 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "var(--gradient-hero)" }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default SplashScreen;
