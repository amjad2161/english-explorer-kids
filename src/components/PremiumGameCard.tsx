import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";

interface PremiumGameCardProps {
  emoji: string;
  title: string;
  color: string;
  index: number;
  description?: string;
  onClick: () => void;
}

/**
 * Disney/Pixar-quality game card with gem-like depth, holographic shimmer,
 * spring-physics 3D tilt, and magic sparkle effects on hover.
 */

/* ─── Magic sparkle pop ─── */
const MagicSparkle = ({ x, y, delay }: { x: number; y: number; delay: number }) => (
  <motion.span
    className="absolute pointer-events-none z-20 select-none"
    style={{ left: `${x}%`, top: `${y}%`, fontSize: "10px" }}
    initial={{ opacity: 0, scale: 0, rotate: 0 }}
    animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.5, 1, 0], rotate: [0, 90, 180] }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.7, delay, ease: "easeOut" }}
  >
    ✨
  </motion.span>
);

const CARD_GRADIENTS: Record<string, { bg: string; glow: string; shine: string }> = {
  sky: {
    bg: "linear-gradient(135deg, hsl(199 80% 92%) 0%, hsl(230 75% 94%) 100%)",
    glow: "hsl(199 80% 55%)",
    shine: "hsl(199 100% 75%)",
  },
  grass: {
    bg: "linear-gradient(135deg, hsl(152 65% 92%) 0%, hsl(170 60% 94%) 100%)",
    glow: "hsl(152 65% 48%)",
    shine: "hsl(152 80% 72%)",
  },
  lavender: {
    bg: "linear-gradient(135deg, hsl(262 72% 94%) 0%, hsl(295 65% 96%) 100%)",
    glow: "hsl(262 72% 60%)",
    shine: "hsl(262 90% 78%)",
  },
  accent: {
    bg: "linear-gradient(135deg, hsl(32 100% 92%) 0%, hsl(44 100% 94%) 100%)",
    glow: "hsl(32 100% 55%)",
    shine: "hsl(44 100% 75%)",
  },
  sunshine: {
    bg: "linear-gradient(135deg, hsl(44 100% 92%) 0%, hsl(55 100% 94%) 100%)",
    glow: "hsl(44 100% 58%)",
    shine: "hsl(52 100% 78%)",
  },
  candy: {
    bg: "linear-gradient(135deg, hsl(338 85% 93%) 0%, hsl(295 65% 96%) 100%)",
    glow: "hsl(338 85% 60%)",
    shine: "hsl(338 100% 78%)",
  },
};

const getCardStyle = (color: string) => {
  const key = Object.keys(CARD_GRADIENTS).find(k => color.includes(k));
  return key ? CARD_GRADIENTS[key] : CARD_GRADIENTS.lavender;
};

const PremiumGameCard = ({ emoji, title, color, index, description, onClick }: PremiumGameCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springCfg = { stiffness: 380, damping: 26 };
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [12, -12]), springCfg);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-12, 12]), springCfg);

  const shineX = useTransform(mouseX, [0, 1], ["-60%", "160%"]);
  const shineY = useTransform(mouseY, [0, 1], ["-60%", "160%"]);

  const cardStyle = getCardStyle(color);

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
    setHovered(false);
  };

  const handleHoverStart = () => {
    setHovered(true);
    // Spawn sparkles
    const newSparkles = Array.from({ length: 5 }, (_, i) => ({
      x: 15 + Math.random() * 70,
      y: 10 + Math.random() * 70,
      id: Date.now() + i,
    }));
    setSparkles(newSparkles);
    setTimeout(() => setSparkles([]), 800);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      onHoverStart={handleHoverStart}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 900,
      }}
      className="cursor-pointer group"
      initial={{ opacity: 0, y: 48, scale: 0.75 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: 0.08 + index * 0.06,
      }}
      whileTap={{ scale: 0.88, rotateX: 0, rotateY: 0 }}
    >
      <div
        className="rounded-2xl text-center relative overflow-hidden"
        style={{
          transformStyle: "preserve-3d",
          background: cardStyle.bg,
          border: `1.5px solid ${cardStyle.glow}30`,
          boxShadow: hovered
            ? `0 20px 50px ${cardStyle.glow}30, 0 8px 20px ${cardStyle.glow}15, 0 0 0 1.5px ${cardStyle.glow}25`
            : `0 4px 16px ${cardStyle.glow}18, 0 2px 6px rgba(0,0,0,0.06)`,
          transition: "box-shadow 0.35s ease, border-color 0.35s ease",
          padding: "clamp(12px, 2.5vw, 20px)",
        }}
      >
        {/* ── Gem-like inner glow ── */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 60%)`,
          }}
        />

        {/* ── Holographic shimmer ── */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
          style={{
            background: `radial-gradient(circle at var(--shine-x, 50%) var(--shine-y, 50%), ${cardStyle.shine}40 0%, ${cardStyle.shine}15 30%, transparent 65%)`,
            // @ts-ignore
            "--shine-x": shineX,
            "--shine-y": shineY,
            transition: "opacity 0.3s",
          }}
        />

        {/* ── Rainbow prism edge ── */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100"
          style={{
            background: `
              linear-gradient(135deg,
                ${cardStyle.glow}12 0%,
                hsl(338 85% 68% / 0.08) 25%,
                hsl(44 100% 68% / 0.1) 50%,
                ${cardStyle.glow}08 75%,
                hsl(199 80% 70% / 0.08) 100%
              )
            `,
            transition: "opacity 0.4s",
          }}
        />

        {/* ── Sparkles ── */}
        <AnimatePresence>
          {sparkles.map(s => (
            <MagicSparkle key={s.id} x={s.x} y={s.y} delay={0} />
          ))}
        </AnimatePresence>

        {/* ── Emoji with Disney squash-and-stretch ── */}
        <motion.div
          className="relative mb-1.5 sm:mb-2"
          style={{ transform: "translateZ(40px)" }}
        >
          <motion.span
            className="text-3xl sm:text-4xl block"
            animate={hovered
              ? { scale: [1, 1.35, 0.9, 1.2, 1], rotate: [0, -10, 10, -5, 0], y: [0, -4, 0] }
              : { scale: 1, rotate: 0, y: 0 }
            }
            transition={hovered
              ? { duration: 0.7, ease: "easeOut" }
              : { duration: 0.3 }
            }
          >
            {emoji}
          </motion.span>
          {/* Emoji shadow */}
          {hovered && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              exit={{ opacity: 0 }}
              style={{
                filter: `blur(6px)`,
                transform: "translateY(8px) scaleX(0.75) scaleY(0.3)",
              }}
            >
              <span className="text-3xl sm:text-4xl">{emoji}</span>
            </motion.div>
          )}
        </motion.div>

        {/* ── Title ── */}
        <motion.span
          className="font-display text-[11px] sm:text-xs font-bold block leading-tight"
          style={{
            transform: "translateZ(22px)",
            color: `hsl(from ${cardStyle.glow} h s 30%)`,
          }}
          animate={hovered ? { scale: 1.04 } : { scale: 1 }}
          transition={{ duration: 0.25 }}
        >
          {title}
        </motion.span>
      </div>
    </motion.div>
  );
};

export default PremiumGameCard;
