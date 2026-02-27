import { useRef, useEffect, useState, useCallback } from "react";
import { motion, useSpring, useMotionValue, useScroll, useTransform, AnimatePresence } from "framer-motion";
import ErrorBoundary from "@/components/ErrorBoundary";
import professorOwl from "@/assets/professor-owl.png";
import type { CharacterMood } from "@/lib/characterStore";

interface CharacterCanvasProps {
  mood: CharacterMood;
  animationKey: number;
  width: number;
  height: number;
  debugOrbit?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Feather particles that float off during celebrations
const Feather = ({ index, mood }: { index: number; mood: CharacterMood }) => {
  const side = index % 2 === 0 ? -1 : 1;
  const delay = index * 0.12;
  const isCelebrate = mood === "celebrate";

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: 6 + Math.random() * 4,
        height: 12 + Math.random() * 8,
        borderRadius: "50% 50% 50% 0",
        background: `hsl(${30 + index * 8}, ${50 + index * 5}%, ${45 + index * 4}%)`,
        bottom: "30%",
        left: "50%",
        transformOrigin: "center bottom",
      }}
      initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0 }}
      animate={
        isCelebrate
          ? {
              opacity: [0, 0.9, 0.7, 0],
              x: [0, side * (30 + Math.random() * 50)],
              y: [0, -(40 + Math.random() * 60)],
              rotate: [0, side * (180 + Math.random() * 180)],
              scale: [0, 1.2, 0.8, 0.3],
            }
          : {
              opacity: [0, 0.4, 0],
              x: [0, side * (8 + Math.random() * 12)],
              y: [0, -(10 + Math.random() * 15)],
              rotate: [0, side * 30],
              scale: [0, 0.7, 0],
            }
      }
      transition={{
        duration: isCelebrate ? 1.2 : 2.5,
        delay: isCelebrate ? delay : delay + Math.random() * 3,
        repeat: isCelebrate ? 2 : Infinity,
        repeatDelay: isCelebrate ? 0.3 : 2 + Math.random() * 4,
        ease: "easeOut",
      }}
    />
  );
};

// Sparkle effect for celebrations
const Sparkle = ({ index }: { index: number }) => {
  const emojis = ["✨", "⭐", "🌟", "💫"];
  return (
    <motion.span
      className="absolute pointer-events-none text-sm"
      style={{ left: "50%", top: "30%" }}
      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0.5],
        x: [(index - 1.5) * 20, (index - 1.5) * 55],
        y: [0, -(30 + index * 20)],
      }}
      transition={{ duration: 0.8, delay: 0.2 + index * 0.15, repeat: 3, repeatDelay: 0.5 }}
    >
      {emojis[index % emojis.length]}
    </motion.span>
  );
};

const CharacterCanvas = ({
  mood,
  animationKey,
  width,
  height,
  className,
  style,
}: CharacterCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [featherKey, setFeatherKey] = useState(0);

  // Eye tracking motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const eyeX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const eyeY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  // Parallax on scroll — subtle vertical shift
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 600], [0, -18]);
  const parallaxRotate = useTransform(scrollY, [0, 600], [0, -3]);
  const smoothParallaxY = useSpring(parallaxY, { stiffness: 80, damping: 20 });
  const smoothParallaxRotate = useSpring(parallaxRotate, { stiffness: 80, damping: 20 });

  // Track mouse for eye following
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * 0.35;
      const dx = (e.clientX - cx) / window.innerWidth;
      const dy = (e.clientY - cy) / window.innerHeight;
      mouseX.set(dx * 8);
      mouseY.set(dy * 5);
    },
    [mouseX, mouseY]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // Reset feathers on mood change
  useEffect(() => {
    setFeatherKey((k) => k + 1);
  }, [mood, animationKey]);

  // Mood-based animation variants
  const getMoodAnimation = (): import("framer-motion").TargetAndTransition => {
    const ease = "easeInOut" as const;
    const easeOut = "easeOut" as const;
    switch (mood) {
      case "celebrate":
        return {
          y: [0, -12, 0, -8, 0],
          rotate: [0, -5, 5, -3, 0],
          scale: [1, 1.08, 0.96, 1.04, 1],
          transition: { duration: 0.8, repeat: Infinity, repeatDelay: 0.2, ease },
        };
      case "wave":
        return {
          rotate: [0, -8, 8, -5, 0],
          y: [0, -3, 0],
          transition: { duration: 1.2, repeat: Infinity, ease },
        };
      case "sad":
        return {
          y: [0, 3, 0],
          rotate: [0, -2, 0],
          scale: [1, 0.97, 1],
          transition: { duration: 2, repeat: Infinity, ease },
        };
      case "think":
        return {
          rotate: [0, 5, 3, 5, 0],
          y: [0, -2, 0],
          transition: { duration: 2.5, repeat: Infinity, ease },
        };
      case "point":
        return {
          x: [0, -5, -5, 0],
          rotate: [0, -3, -3, 0],
          transition: { duration: 1.5, repeat: Infinity, ease },
        };
      case "surprised":
        return {
          scale: [1, 1.1, 1.05, 1.1, 1],
          y: [0, -8, 0],
          transition: { duration: 0.6, repeat: 2, ease: easeOut },
        };
      case "talk":
        return {
          y: [0, -2, 0, -1, 0],
          rotate: [0, -1, 1, -1, 0],
          transition: { duration: 0.6, repeat: Infinity, ease },
        };
      default: // idle
        return {
          y: [0, -4, 0],
          rotate: [0, -0.5, 0.5, 0],
          transition: { duration: 3, repeat: Infinity, ease },
        };
    }
  };

  // Shadow animation based on mood
  const getShadowAnimation = () => {
    if (mood === "celebrate") {
      return {
        scaleX: [1, 1.2, 0.8, 1.1, 1],
        opacity: [0.3, 0.15, 0.35, 0.2, 0.3],
        transition: { duration: 0.8, repeat: Infinity, repeatDelay: 0.2 },
      };
    }
    return {
      scaleX: [1, 1.05, 1],
      opacity: [0.25, 0.2, 0.25],
      transition: { duration: 3, repeat: Infinity },
    };
  };

  return (
    <ErrorBoundary>
      <div
        ref={containerRef}
        style={{ width, height, ...style }}
        className={`relative ${className || ""}`}
        aria-hidden="true"
      >
        {/* Eye tracking overlay — invisible dots that follow mouse */}
        <motion.div
          className="absolute pointer-events-none z-10"
          style={{
            width: width * 0.12,
            height: width * 0.12,
            borderRadius: "50%",
            left: "38%",
            top: "28%",
            x: eyeX,
            y: eyeY,
            background: "radial-gradient(circle, rgba(0,0,0,0.15) 30%, transparent 70%)",
            mixBlendMode: "multiply",
          }}
        />
        <motion.div
          className="absolute pointer-events-none z-10"
          style={{
            width: width * 0.12,
            height: width * 0.12,
            borderRadius: "50%",
            left: "52%",
            top: "28%",
            x: eyeX,
            y: eyeY,
            background: "radial-gradient(circle, rgba(0,0,0,0.15) 30%, transparent 70%)",
            mixBlendMode: "multiply",
          }}
        />

        {/* Main owl image with mood + parallax animation */}
        <motion.div
          className="absolute inset-0"
          style={{ y: smoothParallaxY, rotate: smoothParallaxRotate }}
        >
          <motion.img
            src={professorOwl}
            alt=""
            draggable={false}
            className="w-full h-full object-contain select-none"
            style={{
              filter: mood === "sad" 
                ? "saturate(0.7) brightness(0.9)" 
                : mood === "celebrate" 
                  ? "saturate(1.2) brightness(1.05)" 
                  : "saturate(1) brightness(1)",
            }}
            animate={getMoodAnimation()}
          />
        </motion.div>

        {/* Ground shadow */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{
            width: width * 0.6,
            height: width * 0.08,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(0,0,0,0.25) 0%, transparent 70%)",
          }}
          animate={getShadowAnimation()}
        />

        {/* Feather particles */}
        <AnimatePresence>
          <div key={featherKey}>
            {Array.from({ length: mood === "celebrate" ? 10 : 5 }).map((_, i) => (
              <Feather key={`f-${i}`} index={i} mood={mood} />
            ))}
          </div>
        </AnimatePresence>

        {/* Celebration sparkles */}
        {mood === "celebrate" && (
          <div key={`sparkle-${animationKey}`}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Sparkle key={`s-${i}`} index={i} />
            ))}
          </div>
        )}

        {/* Breathing glow effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            background: "radial-gradient(circle at 50% 40%, hsl(var(--primary) / 0.08), transparent 60%)",
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [0.95, 1.02, 0.95],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" as const }}
        />
      </div>
    </ErrorBoundary>
  );
};

export default CharacterCanvas;
