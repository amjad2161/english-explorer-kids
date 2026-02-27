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
  idle: ["🤔 Thinking...", "✨ Learn!", "📚 Study!", "👋 Hi!"],
  celebrate: ["🎉 Amazing!", "⭐ Super!", "🏆 Yes!", "💪 Great!"],
  surprised: ["😮 Wow!", "❗ Whoa!", "👏 Bravo!", "✅ Done!"],
  sad: ["💙 Try again", "🔄 Retry", "📖 Keep going", "😊 You got this"],
  wave: ["👋 Hello!", "🌟 Hi there!", "😄 Welcome!", "🎈 Let's go!"],
};

/* ─── Disney-quality sparkle particle ─── */
const Sparkle = ({ delay, dim }: { delay: number; dim: number }) => {
  const angle = Math.random() * 360;
  const distance = dim * 0.4 + Math.random() * dim * 0.25;
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  const emojis = ["✨", "⭐", "🌟", "💫", "⚡"];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];

  return (
    <motion.span
      className="absolute pointer-events-none z-30"
      style={{ left: "50%", top: "50%", fontSize: Math.max(12, dim / 10) }}
      initial={{ opacity: 0, x: 0, y: 0, scale: 0, rotate: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        x, y: y - 12,
        scale: [0, 1.4, 1, 0.4],
        rotate: [0, 180, 360],
      }}
      transition={{ duration: 1.1, delay, ease: "easeOut" }}
    >
      {emoji}
    </motion.span>
  );
};

/* ─── Magic ring burst ─── */
const MagicRingBurst = ({ dim }: { dim: number }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none z-5"
    style={{
      width: dim * 1.5, height: dim * 1.5,
      left: "50%", top: "50%",
      marginLeft: -(dim * 0.75), marginTop: -(dim * 0.75),
      border: "2px solid hsl(262 80% 72% / 0.5)",
      boxShadow: "0 0 20px hsl(262 80% 72% / 0.2), inset 0 0 12px hsl(262 80% 72% / 0.1)",
    }}
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.4, 1.8] }}
    transition={{ duration: 0.9, ease: "easeOut" }}
  />
);

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
  const [showRing, setShowRing] = useState(false);
  const prevMoodRef = useRef(mood);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Parallax tilt from mouse — more responsive for Disney feel
  const rotateY = useTransform(mouseX, [-200, 200], [-10, 10]);
  const rotateX = useTransform(mouseY, [-200, 200], [6, -6]);

  // Blinking at random intervals
  useEffect(() => {
    if (mood === "sad") return;
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
    };
    const interval = setInterval(blink, 2200 + Math.random() * 2800);
    return () => clearInterval(interval);
  }, [mood]);

  // Sparkles + ring on mood change to celebrate/surprised
  useEffect(() => {
    if ((mood === "celebrate" || mood === "surprised") && prevMoodRef.current !== mood) {
      setShowSparkles(true);
      setShowRing(true);
      setTimeout(() => setShowSparkles(false), 1400);
      setTimeout(() => setShowRing(false), 900);
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
    setShowSparkles(true);
    setShowRing(true);
    setTimeout(() => setAutoSpeech(null), 2000);
    setTimeout(() => setShowSparkles(false), 1200);
    setTimeout(() => setShowRing(false), 800);
    onClick?.();
  }, [mood, onClick]);

  // ─── Disney-quality animation configs by mood ───
  const bodyAnimate =
    mood === "wave"
      ? {
          y: [0, -12, 2, -9, 0],
          rotate: [0, -6, 6, -4, 0],
          scale: [1, 1.04, 0.97, 1.02, 1],
          scaleX: [1, 1.03, 0.97, 1.01, 1],
          scaleY: [1, 0.97, 1.04, 0.99, 1],
        }
      : mood === "celebrate"
      ? {
          y: [0, -22, 3, -16, 0],
          rotate: [0, -10, 10, -6, 0],
          scale: [1, 1.12, 0.93, 1.08, 1],
          scaleX: [1, 0.90, 1.10, 0.96, 1],
          scaleY: [1, 1.10, 0.90, 1.05, 1],
        }
      : mood === "surprised"
      ? {
          y: [0, -14, 2, 0],
          scale: [1, 1.18, 1.03, 1],
          scaleX: [1, 0.88, 1.06, 1],
          scaleY: [1, 1.12, 0.95, 1],
          rotate: [0, 4, -3, 0],
        }
      : mood === "sad"
      ? {
          y: [0, 5, 0],
          rotate: [0, -3, 0],
          scale: [1, 0.95, 1],
          scaleY: [1, 0.96, 1],
        }
      : {
          y: [0, -6, 1, -4, 0],
          rotate: [0, -1.5, 1.5, 0],
          scale: [1, 1.014, 0.998, 1],
          scaleY: [1, 1.007, 0.997, 1],
        };

  const bodyTransition =
    mood === "idle"
      ? { duration: 4, repeat: Infinity, ease: "easeInOut" as const }
      : mood === "wave"
      ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" as const }
      : mood === "celebrate"
      ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" as const }
      : mood === "sad"
      ? { duration: 4.5, repeat: Infinity, ease: "easeInOut" as const }
      : { duration: 0.65, repeat: 0, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] };

  // ─── Disney-quality mood shadows ───
  const shadowByMood =
    mood === "celebrate"
      ? "drop-shadow(0 12px 28px hsl(44 100% 60% / 0.45)) drop-shadow(0 4px 10px hsl(262 80% 68% / 0.2))"
      : mood === "surprised"
      ? "drop-shadow(0 10px 22px hsl(262 80% 65% / 0.35)) drop-shadow(0 3px 8px rgba(0,0,0,0.12))"
      : mood === "wave"
      ? "drop-shadow(0 8px 18px hsl(262 70% 65% / 0.28)) drop-shadow(0 2px 6px rgba(0,0,0,0.1))"
      : mood === "sad"
      ? "drop-shadow(0 4px 12px rgba(0,0,0,0.25)) brightness(0.9)"
      : "drop-shadow(0 6px 16px rgba(0,0,0,0.18)) drop-shadow(0 2px 5px rgba(0,0,0,0.08))";

  const glowColor =
    mood === "celebrate"
      ? "hsl(44 100% 62% / 0.28)"
      : mood === "surprised"
      ? "hsl(262 80% 68% / 0.22)"
      : mood === "sad"
      ? "hsl(200 40% 50% / 0.1)"
      : "hsl(262 70% 65% / 0.12)";

  const bubbleText = showSpeechBubble || autoSpeech;

  return (
    <motion.button
      type="button"
      onClick={handleTap}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => { mouseX.set(0); mouseY.set(0); }}
      className="relative inline-flex items-center justify-center p-0 border-0 bg-transparent"
      style={{ width: dim, height: dim, perspective: 700 }}
      whileTap={{
        scale: [1, 0.84, 1.1, 0.96, 1],
        scaleY: [1, 0.86, 1.1, 0.97, 1],
        transition: { duration: 0.55, ease: "easeOut" },
      }}
      aria-label="Interactive Owl Mascot"
    >
      {/* ── Ambient magic glow ring ── */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: dim * 0.75,
          height: dim * 0.45,
          left: "50%",
          bottom: "2%",
          transform: "translateX(-50%)",
          background: `radial-gradient(ellipse, ${glowColor}, transparent 70%)`,
          filter: "blur(14px)",
        }}
        animate={{
          opacity: mood === "celebrate" ? [0.6, 1.0, 0.6] : [0.25, 0.55, 0.25],
          scale: mood === "celebrate" ? [1, 1.2, 1] : [1, 1.06, 1],
          scaleX: mood === "celebrate" ? [1, 1.3, 1] : [1, 1.1, 1],
        }}
        transition={{ duration: mood === "celebrate" ? 1.1 : 3.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── 3D perspective wrapper ── */}
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

        {/* Blink overlay */}
        <AnimatePresence>
          {isBlinking && (
            <motion.div
              className="absolute inset-0 z-20 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.07 }}
              style={{
                background: "linear-gradient(180deg, transparent 28%, hsl(var(--foreground) / 0.05) 40%, transparent 54%)",
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Celebration sparkles ── */}
      <AnimatePresence>
        {showSparkles && (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <Sparkle key={`sparkle-${tapCount}-${i}`} delay={i * 0.08} dim={dim} />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* ── Magic ring burst ── */}
      <AnimatePresence>
        {showRing && <MagicRingBurst key={`ring-${tapCount}`} dim={dim} />}
      </AnimatePresence>

      {/* ── Mood indicator ring ── */}
      {mood !== "idle" && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none z-5"
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: [0, 0.4, 0], scale: [0.75, 1.4, 1.7] }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          style={{
            border: `2px solid ${
              mood === "celebrate"
                ? "hsl(44 100% 65% / 0.5)"
                : mood === "surprised"
                ? "hsl(262 80% 70% / 0.5)"
                : mood === "sad"
                ? "hsl(200 40% 55% / 0.3)"
                : "hsl(262 70% 68% / 0.4)"
            }`,
          }}
          key={`ring-mood-${mood}-${Date.now()}`}
        />
      )}

      {/* ── Speech bubble ── */}
      <AnimatePresence>
        {bubbleText && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.65 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.82 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
            className="absolute left-1/2 -translate-x-1/2 bg-card rounded-2xl px-3 py-1.5 shadow-lg z-30 whitespace-nowrap"
            style={{
              top: "-6px",
              fontSize: Math.max(11, dim / 15),
              border: "1.5px solid hsl(262 60% 70% / 0.2)",
              boxShadow: "0 4px 16px hsl(262 60% 55% / 0.12), 0 2px 6px rgba(0,0,0,0.08)",
            }}
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
