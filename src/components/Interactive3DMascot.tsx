import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import owlPixar from "@/assets/owl-pixar.png";

interface Interactive3DMascotProps {
  mood?: "idle" | "wave" | "celebrate" | "surprised" | "sad";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  showSpeechBubble?: string;
  autoSpeak?: boolean;
}

const sizeMap = { sm: 120, md: 180, lg: 260 };

/* ─── Contextual speech lines by mood ─── */
const speechByMood: Record<string, string[]> = {
  idle: ["🤔", "✨", "📚", "👋"],
  celebrate: ["🎉", "⭐", "🏆", "💪"],
  surprised: ["😮", "❗", "👏", "✅"],
  sad: ["💙", "🔄", "📖", "😊"],
  wave: ["👋", "🌟", "😄", "🎈"],
};

/* ─── Sparkle particle for celebrations ─── */
const Sparkle = ({ delay, dim }: { delay: number; dim: number }) => {
  const angle = Math.random() * 360;
  const distance = dim * 0.35 + Math.random() * dim * 0.2;
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  const sparkleEmojis = ["✨", "⭐", "🌟", "💫"];
  const emoji = sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)];

  return (
    <motion.span
      className="absolute pointer-events-none z-30"
      style={{ left: "50%", top: "50%", fontSize: Math.max(10, dim / 12) }}
      initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 1, 0], x, y: y - 10, scale: [0, 1.2, 1, 0.5], rotate: [0, 180] }}
      transition={{ duration: 1.2, delay, ease: "easeOut" }}
    >
      {emoji}
    </motion.span>
  );
};

const Interactive3DMascot = ({
  mood = "idle",
  size = "md",
  onClick,
  showSpeechBubble,
  autoSpeak = false,
}: Interactive3DMascotProps) => {
  const dim = sizeMap[size];
  const [isBlinking, setIsBlinking] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [autoSpeech, setAutoSpeech] = useState<string | null>(null);
  const [showSparkles, setShowSparkles] = useState(false);
  const prevMoodRef = useRef(mood);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Parallax tilt from mouse
  const rotateY = useTransform(mouseX, [-200, 200], [-8, 8]);
  const rotateX = useTransform(mouseY, [-200, 200], [5, -5]);

  // Blinking at random intervals
  useEffect(() => {
    if (mood === "sad") return;
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    };
    const interval = setInterval(blink, 2500 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [mood]);

  // Sparkles on mood change to celebrate/surprised
  useEffect(() => {
    if ((mood === "celebrate" || mood === "surprised") && prevMoodRef.current !== mood) {
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 1500);
    }
    prevMoodRef.current = mood;
  }, [mood]);

  // Auto speech bubble
  useEffect(() => {
    if (!autoSpeak || showSpeechBubble) return;
    const lines = speechByMood[mood] || speechByMood.idle;
    const show = () => {
      setAutoSpeech(lines[Math.floor(Math.random() * lines.length)]);
      setTimeout(() => setAutoSpeech(null), 2000);
    };
    const interval = setInterval(show, 8000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, [mood, autoSpeak, showSpeechBubble]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top - rect.height / 2);
    },
    [mouseX, mouseY]
  );

  const handleTap = useCallback(() => {
    setTapCount((c) => c + 1);
    const lines = speechByMood[mood] || speechByMood.idle;
    setAutoSpeech(lines[Math.floor(Math.random() * lines.length)]);
    setTimeout(() => setAutoSpeech(null), 1800);
    onClick?.();
  }, [mood, onClick]);

  // ─── Animation configs by mood ───
  const bodyAnimate =
    mood === "wave"
      ? { y: [0, -10, 0, -7, 0], rotate: [0, -5, 5, -3, 0], scale: [1, 1.03, 1, 1.02, 1], scaleX: [1, 1.02, 0.98, 1.01, 1], scaleY: [1, 0.98, 1.03, 0.99, 1] }
      : mood === "celebrate"
      ? { y: [0, -18, 2, -14, 0], rotate: [0, -8, 8, -5, 0], scale: [1, 1.1, 0.94, 1.06, 1], scaleX: [1, 0.92, 1.08, 0.97, 1], scaleY: [1, 1.08, 0.92, 1.03, 1] }
      : mood === "surprised"
      ? { y: [0, -12, 0], scale: [1, 1.14, 1.02, 1], scaleX: [1, 0.9, 1.05, 1], scaleY: [1, 1.1, 0.96, 1], rotate: [0, 3, -2, 0] }
      : mood === "sad"
      ? { y: [0, 4, 0], rotate: [0, -2, 0], scale: [1, 0.96, 1], scaleY: [1, 0.97, 1] }
      : { y: [0, -5, 0], rotate: [0, -1, 1, 0], scale: [1, 1.012, 1], scaleY: [1, 1.006, 0.997, 1] };

  const bodyTransition =
    mood === "idle"
      ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" as const }
      : mood === "wave"
      ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" as const }
      : mood === "celebrate"
      ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" as const }
      : mood === "sad"
      ? { duration: 4, repeat: Infinity, ease: "easeInOut" as const }
      : { duration: 0.7, repeat: 0, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] };

  const shadowByMood =
    mood === "celebrate"
      ? "drop-shadow(0 10px 24px hsl(var(--sunshine) / 0.35)) drop-shadow(0 3px 8px hsl(var(--foreground) / 0.12))"
      : mood === "surprised"
      ? "drop-shadow(0 8px 18px hsl(var(--primary) / 0.25)) drop-shadow(0 2px 6px hsl(var(--foreground) / 0.1))"
      : mood === "wave"
      ? "drop-shadow(0 6px 16px hsl(var(--primary) / 0.2)) drop-shadow(0 2px 5px hsl(var(--foreground) / 0.08))"
      : mood === "sad"
      ? "drop-shadow(0 3px 10px hsl(var(--foreground) / 0.18)) brightness(0.92)"
      : "drop-shadow(0 5px 14px hsl(var(--foreground) / 0.14)) drop-shadow(0 1px 4px hsl(var(--foreground) / 0.06))";

  const glowColor =
    mood === "celebrate"
      ? "hsl(var(--sunshine) / 0.2)"
      : mood === "surprised"
      ? "hsl(var(--primary) / 0.15)"
      : mood === "sad"
      ? "hsl(var(--muted-foreground) / 0.08)"
      : "hsl(var(--primary) / 0.08)";

  const bubbleText = showSpeechBubble || autoSpeech;

  return (
    <motion.button
      type="button"
      onClick={handleTap}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => { mouseX.set(0); mouseY.set(0); }}
      className="relative inline-flex items-center justify-center p-0 border-0 bg-transparent"
      style={{ width: dim, height: dim, perspective: 600 }}
      whileTap={{
        scale: [1, 0.86, 1.08, 0.97, 1],
        scaleY: [1, 0.88, 1.08, 0.98, 1],
        transition: { duration: 0.5, ease: "easeOut" },
      }}
      aria-label="Interactive Owl Mascot"
    >
      {/* Ambient glow ring */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: dim * 0.7,
          height: dim * 0.4,
          left: "50%",
          bottom: "0%",
          transform: "translateX(-50%)",
          background: `radial-gradient(ellipse, ${glowColor}, transparent 70%)`,
          filter: "blur(12px)",
        }}
        animate={{
          opacity: mood === "celebrate" ? [0.5, 0.9, 0.5] : [0.2, 0.45, 0.2],
          scale: mood === "celebrate" ? [1, 1.15, 1] : [1, 1.04, 1],
        }}
        transition={{ duration: mood === "celebrate" ? 1.2 : 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 3D perspective wrapper */}
      <motion.div
        className="relative w-full h-full"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {/* Main owl image */}
        <motion.img
          src={owlPixar}
          alt="Professor Owl mascot"
          draggable={false}
          className="w-full h-full object-contain select-none pointer-events-none relative z-10"
          style={{ filter: shadowByMood }}
          animate={bodyAnimate}
          transition={bodyTransition}
        />

        {/* Blink overlay — subtle squint effect */}
        <AnimatePresence>
          {isBlinking && (
            <motion.div
              className="absolute inset-0 z-20 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.08 }}
              style={{
                background: "linear-gradient(180deg, transparent 30%, hsl(var(--foreground) / 0.04) 42%, transparent 55%)",
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Celebration sparkles */}
      <AnimatePresence>
        {showSparkles && (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <Sparkle key={`sparkle-${tapCount}-${i}`} delay={i * 0.1} dim={dim} />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Mood indicator ring */}
      {mood !== "idle" && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none z-5"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.3, 0], scale: [0.8, 1.3, 1.5] }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            border: `2px solid ${
              mood === "celebrate"
                ? "hsl(var(--sunshine) / 0.4)"
                : mood === "surprised"
                ? "hsl(var(--primary) / 0.4)"
                : mood === "sad"
                ? "hsl(var(--muted-foreground) / 0.3)"
                : "hsl(var(--primary) / 0.3)"
            }`,
          }}
          key={`ring-${mood}-${Date.now()}`}
        />
      )}

      {/* Speech bubble */}
      <AnimatePresence>
        {bubbleText && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 350, damping: 18 }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 bg-card border border-border rounded-2xl px-3 py-1.5 shadow-lg z-30 whitespace-nowrap"
            style={{ fontSize: Math.max(12, dim / 14) }}
          >
            <span className="font-display font-bold text-foreground">{bubbleText}</span>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-r border-b border-border rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default Interactive3DMascot;
