/**
 * CharacterProxy — animated CSS/SVG owl proxy for when no GLB asset is available.
 *
 * CONSTRAINT: No <img> elements for characters. GLB/FBX 3D assets are preferred;
 * this proxy is used as a fallback. When rendered it logs MISSING_CHARACTER_ASSET.
 */
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import type { CharacterMood } from "@/lib/characterStore";

interface CharacterProxyProps {
  mood?: CharacterMood;
  size?: "sm" | "md" | "lg";
  speech?: string | null;
  onClick?: () => void;
}

const SIZE_MAP = { sm: 100, md: 160, lg: 240 } as const;

// ─── Body animation configs by mood ────────────────────────────────────────
const getBodyAnimate = (mood: CharacterMood) => {
  switch (mood) {
    case "celebrate":
      return { y: [0, -20, 2, -14, 0], rotate: [0, -8, 8, -5, 0], scale: [1, 1.12, 0.93, 1.06, 1] };
    case "wave":
      return { y: [0, -10, 0, -7, 0], rotate: [0, -5, 5, -3, 0], scale: [1, 1.04, 1, 1.02, 1] };
    case "surprised":
      return { y: [0, -14, 0], scale: [1, 1.16, 1.02, 1], rotate: [0, 3, -2, 0] };
    case "sad":
      return { y: [0, 5, 0], rotate: [0, -2, 0], scale: [1, 0.95, 1] };
    case "think":
      return { y: [0, -4, 0], rotate: [0, 4, -2, 0], scale: [1, 1.01, 1] };
    case "point":
      return { y: [0, -6, 0], rotate: [0, -3, 3, 0], scale: [1, 1.03, 1] };
    default:
      return { y: [0, -5, 0], rotate: [0, -1, 1, 0], scale: [1, 1.01, 1] };
  }
};

const getBodyTransition = (mood: CharacterMood) =>
  mood === "idle" || mood === "sad" || mood === "think"
    ? { duration: mood === "sad" ? 4 : 3.5, repeat: Infinity, ease: "easeInOut" as const }
    : mood === "wave"
    ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" as const }
    : mood === "celebrate"
    ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" as const }
    : { duration: 0.7, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] };

// ─── SVG owl body rendered entirely in SVG (no <img>) ──────────────────────
const OwlSVG = ({ dim, mood }: { dim: number; mood: CharacterMood }) => {
  const isHappy = mood === "celebrate" || mood === "wave" || mood === "surprised";
  const isSad = mood === "sad";
  const isThinking = mood === "think";

  const bodyColor = isSad ? "#7B8FB5" : isHappy ? "#F4A535" : "#E8922A";
  const bellyColor = isSad ? "#B8C8E8" : "#FDE68A";
  const eyeColor = isThinking ? "#6B5BFF" : isSad ? "#708090" : "#2D1B69";

  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 100 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Shadow */}
      <ellipse cx="50" cy="105" rx="28" ry="5" fill="rgba(0,0,0,0.12)" />
      {/* Body */}
      <ellipse cx="50" cy="68" rx="32" ry="36" fill={bodyColor} />
      {/* Belly */}
      <ellipse cx="50" cy="76" rx="18" ry="22" fill={bellyColor} />
      {/* Wing left */}
      <ellipse cx="22" cy="70" rx="10" ry="20" fill={bodyColor} transform="rotate(-12 22 70)" />
      {/* Wing right */}
      <ellipse cx="78" cy="70" rx="10" ry="20" fill={bodyColor} transform="rotate(12 78 70)" />
      {/* Head */}
      <circle cx="50" cy="38" r="26" fill={bodyColor} />
      {/* Ear tufts */}
      <polygon points="32,16 26,4 38,12" fill={bodyColor} />
      <polygon points="68,16 74,4 62,12" fill={bodyColor} />
      {/* Face disc */}
      <ellipse cx="50" cy="40" rx="20" ry="18" fill={bellyColor} opacity="0.85" />
      {/* Eyes */}
      <circle cx="40" cy="38" r="9" fill="white" />
      <circle cx="60" cy="38" r="9" fill="white" />
      <circle cx={isThinking ? 42 : 41} cy={isThinking ? 36 : 38} r="5" fill={eyeColor} />
      <circle cx={isThinking ? 62 : 59} cy={isThinking ? 36 : 38} r="5" fill={eyeColor} />
      {/* Eye shine */}
      <circle cx="43" cy="36" r="1.5" fill="white" />
      <circle cx="61" cy="36" r="1.5" fill="white" />
      {/* Beak */}
      <polygon points="46,46 54,46 50,54" fill={isSad ? "#B8860B" : "#F59E0B"} />
      {/* Expression */}
      {isHappy && (
        <path d="M 42 52 Q 50 58 58 52" stroke="#B45309" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}
      {isSad && (
        <path d="M 42 54 Q 50 50 58 54" stroke="#708090" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}
      {/* Pointing wing */}
      {mood === "point" && (
        <line x1="78" y1="62" x2="96" y2="50" stroke={bodyColor} strokeWidth="5" strokeLinecap="round" />
      )}
      {/* Feet */}
      <ellipse cx="42" cy="103" rx="8" ry="4" fill="#F59E0B" transform="rotate(-10 42 103)" />
      <ellipse cx="58" cy="103" rx="8" ry="4" fill="#F59E0B" transform="rotate(10 58 103)" />
    </svg>
  );
};

// ─── Main exported proxy character ─────────────────────────────────────────
const CharacterProxy = ({ mood = "idle", size = "md", speech, onClick }: CharacterProxyProps) => {
  const dim = SIZE_MAP[size];
  const [blinking, setBlinking] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateY = useTransform(mouseX, [-200, 200], [-8, 8]);
  const rotateX = useTransform(mouseY, [-200, 200], [5, -5]);
  const loggedRef = useRef(false);

  // Log missing 3D asset once per mount
  useEffect(() => {
    if (!loggedRef.current) {
      console.error(
        "MISSING_CHARACTER_ASSET: No GLB/FBX 3D model found. " +
          "Using CSS/SVG proxy character. " +
          "Provide a GLB asset at /assets/characters/owl.glb to enable full 3D rendering."
      );
      loggedRef.current = true;
    }
  }, []);

  // Random blinking
  useEffect(() => {
    if (mood === "sad") return;
    const id = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 140);
    }, 2500 + Math.random() * 3000);
    return () => clearInterval(id);
  }, [mood]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top - rect.height / 2);
    },
    [mouseX, mouseY]
  );

  const glowColor =
    mood === "celebrate"
      ? "rgba(244,165,53,0.25)"
      : mood === "sad"
      ? "rgba(123,143,181,0.12)"
      : "rgba(99,102,241,0.12)";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
      }}
      className="relative inline-flex items-center justify-center p-0 border-0 bg-transparent cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
      style={{ width: dim, height: dim, perspective: 600 }}
      whileTap={{ scale: 0.9, transition: { duration: 0.15 } }}
      aria-label="Character owl mascot"
    >
      {/* Ambient glow */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: dim * 0.7,
          height: dim * 0.35,
          left: "50%",
          bottom: "2%",
          transform: "translateX(-50%)",
          background: `radial-gradient(ellipse, ${glowColor}, transparent 70%)`,
          filter: "blur(10px)",
        }}
        animate={{ opacity: mood === "celebrate" ? [0.5, 0.9, 0.5] : [0.2, 0.45, 0.2] }}
        transition={{ duration: mood === "celebrate" ? 1.2 : 3, repeat: Infinity }}
      />

      {/* 3-D perspective wrapper */}
      <motion.div
        className="relative w-full h-full"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        <motion.div
          animate={getBodyAnimate(mood)}
          transition={getBodyTransition(mood)}
          className="w-full h-full"
        >
          <OwlSVG dim={dim} mood={mood} />
        </motion.div>

        {/* Blink overlay */}
        <AnimatePresence>
          {blinking && (
            <motion.div
              key="blink"
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background:
                  "linear-gradient(180deg, transparent 32%, rgba(0,0,0,0.05) 44%, transparent 56%)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.07 }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Speech bubble */}
      <AnimatePresence>
        {speech && (
          <motion.div
            key="speech"
            initial={{ opacity: 0, y: 10, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 340, damping: 18 }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 bg-card border border-border rounded-2xl px-3 py-1.5 shadow-lg z-30 whitespace-nowrap pointer-events-none"
            style={{ fontSize: Math.max(11, dim / 14) }}
          >
            <span className="font-bold text-foreground">{speech}</span>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-r border-b border-border rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sparkles on celebrate */}
      {mood === "celebrate" &&
        [0, 1, 2, 3].map((i) => {
          const angle = (i / 4) * 360;
          const r = dim * 0.55;
          const sx = Math.cos((angle * Math.PI) / 180) * r;
          const sy = Math.sin((angle * Math.PI) / 180) * r;
          return (
            <motion.span
              key={`sp-${i}`}
              className="absolute pointer-events-none z-20 text-base select-none"
              style={{ left: "50%", top: "50%" }}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], x: sx, y: sy, scale: [0, 1.2, 0] }}
              transition={{ duration: 1.1, delay: i * 0.12, repeat: Infinity, repeatDelay: 1 }}
            >
              ✨
            </motion.span>
          );
        })}
    </motion.button>
  );
};

export default CharacterProxy;
