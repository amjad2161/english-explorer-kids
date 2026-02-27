import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useState, useEffect, useCallback, useRef, forwardRef } from "react";
import CharacterCanvas from "@/components/character/CharacterCanvas";
import type { CharacterMood } from "@/lib/characterStore";

interface Interactive3DMascotProps {
  mood?: CharacterMood;
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
  talk: ["💬", "📖", "🗣️", "✨"],
  think: ["🤔", "💭", "🧠", "📚"],
  point: ["👉", "📌", "💡", "✅"],
  react: ["⚡", "✨", "💫", "🌟"],
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

const Interactive3DMascot = forwardRef<HTMLButtonElement, Interactive3DMascotProps>(({
  mood = "idle",
  size = "md",
  onClick,
  showSpeechBubble,
  autoSpeak = false,
}, _ref) => {
  const dim = sizeMap[size];
  const [tapCount, setTapCount] = useState(0);
  const [autoSpeech, setAutoSpeech] = useState<string | null>(null);
  const [showSparkles, setShowSparkles] = useState(false);
  const prevMoodRef = useRef(mood);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [animKey, setAnimKey] = useState(0);

  // Parallax tilt from mouse
  const rotateY = useTransform(mouseX, [-200, 200], [-8, 8]);
  const rotateX = useTransform(mouseY, [-200, 200], [5, -5]);

  // Sparkles on mood change to celebrate/surprised
  useEffect(() => {
    if ((mood === "celebrate" || mood === "surprised") && prevMoodRef.current !== mood) {
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 1500);
    }
    prevMoodRef.current = mood;
    setAnimKey((k) => k + 1);
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
        {/* Real-time 3D character — no <img> */}
        <CharacterCanvas
          mood={mood}
          animationKey={animKey}
          width={dim}
          height={dim}
          className="w-full h-full"
        />
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
});

Interactive3DMascot.displayName = "Interactive3DMascot";

export default Interactive3DMascot;
