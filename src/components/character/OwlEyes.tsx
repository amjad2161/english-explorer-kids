import { motion, useSpring, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CharacterMood } from "@/lib/characterStore";

interface OwlEyesProps {
  /** Container width for scaling */
  width: number;
  mood: CharacterMood;
  /** Ref to the owl container for mouse-relative calculations */
  containerRef: React.RefObject<HTMLDivElement>;
}

/**
 * Realistic owl eye overlay with:
 * - Independent per-eye pupil tracking (slight parallax offset)
 * - Iris gradient with mood-reactive color shift
 * - Specular glint highlights that move opposite to gaze
 * - Pupil dilation based on mood (wide in surprise, narrow in think)
 * - Natural micro-saccades (tiny random movements)
 * - Smooth spring physics
 */

const EYE_CONFIG = {
  left:  { cx: "39%", cy: "30%", parallaxOffset: -0.6 },
  right: { cx: "53%", cy: "30%", parallaxOffset: 0.6 },
} as const;

// Mood → pupil scale multiplier
const PUPIL_SCALE: Partial<Record<CharacterMood, number>> = {
  surprised: 1.4,
  celebrate: 1.25,
  sad: 0.85,
  think: 0.75,
  idle: 1,
  wave: 1.1,
  talk: 1.05,
  point: 1.1,
};

// Mood → iris hue shift
const IRIS_HUE: Partial<Record<CharacterMood, number>> = {
  celebrate: 45,  // warm gold
  sad: 200,       // cooler
  surprised: 30,  // bright amber
  think: 180,     // teal tint
};

const SingleEye = ({
  side,
  width,
  mood,
  gazeX,
  gazeY,
}: {
  side: "left" | "right";
  width: number;
  mood: CharacterMood;
  gazeX: MotionValue<number>;
  gazeY: MotionValue<number>;
}) => {
  const config = EYE_CONFIG[side];
  const eyeSize = width * 0.105;
  const pupilBase = eyeSize * 0.42;
  const pupilScale = PUPIL_SCALE[mood] ?? 1;
  const irisHue = IRIS_HUE[mood] ?? 35;

  // Per-eye parallax: each eye shifts slightly differently for depth
  const offsetX = useTransform(gazeX, (v) => v + config.parallaxOffset * (v * 0.15));
  const offsetY = useTransform(gazeY, (v) => v);

  // Clamp movement to eye socket bounds
  const maxTravel = eyeSize * 0.18;
  const clampedX = useTransform(offsetX, (v) => Math.max(-maxTravel, Math.min(maxTravel, v)));
  const clampedY = useTransform(offsetY, (v) => Math.max(-maxTravel * 0.7, Math.min(maxTravel * 0.7, v)));

  // Glint moves opposite to gaze
  const glintX = useTransform(clampedX, (v) => -v * 0.3);
  const glintY = useTransform(clampedY, (v) => -v * 0.3 - eyeSize * 0.12);

  // Smooth pupil dilation
  const pupilSizeMotion = useSpring(pupilBase * pupilScale, { stiffness: 120, damping: 15 });
  useEffect(() => {
    pupilSizeMotion.set(pupilBase * pupilScale);
  }, [pupilScale, pupilBase, pupilSizeMotion]);

  return (
    <div
      className="absolute pointer-events-none z-10"
      style={{
        width: eyeSize,
        height: eyeSize,
        left: config.cx,
        top: config.cy,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Iris / colored part */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: `radial-gradient(circle at 45% 40%, 
            hsl(${irisHue}, 70%, 55%) 0%, 
            hsl(${irisHue}, 60%, 35%) 50%, 
            hsl(${irisHue - 10}, 50%, 20%) 100%)`,
          opacity: 0.35,
          mixBlendMode: "multiply",
        }}
      />

      {/* Pupil — dark center that tracks mouse */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: pupilSizeMotion,
          height: pupilSizeMotion,
          left: "50%",
          top: "50%",
          x: clampedX,
          y: clampedY,
          translateX: "-50%",
          translateY: "-50%",
          background: `radial-gradient(circle at 40% 35%, 
            hsla(0, 0%, 8%, 0.55) 0%, 
            hsla(0, 0%, 3%, 0.45) 60%, 
            hsla(0, 0%, 0%, 0.3) 100%)`,
          mixBlendMode: "multiply",
        }}
      />

      {/* Primary specular glint — bright white dot */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: eyeSize * 0.18,
          height: eyeSize * 0.18,
          left: "55%",
          top: "32%",
          x: glintX,
          y: glintY,
          background: "radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
          filter: "blur(0.3px)",
        }}
        animate={{
          opacity: [0.7, 0.9, 0.7],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Secondary smaller glint */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: eyeSize * 0.09,
          height: eyeSize * 0.09,
          left: "38%",
          top: "55%",
          x: glintX,
          y: glintY,
          background: "radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 100%)",
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />

      {/* Iris ring / limbal ring for depth */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: `1px solid hsla(${irisHue}, 40%, 25%, 0.15)`,
          boxShadow: `inset 0 0 ${eyeSize * 0.15}px hsla(0, 0%, 0%, 0.08)`,
        }}
      />
    </div>
  );
};

const OwlEyes = ({ width, mood, containerRef }: OwlEyesProps) => {
  const gazeRawX = useMotionValue(0);
  const gazeRawY = useMotionValue(0);

  // Smooth spring physics for natural eye movement
  const gazeX = useSpring(gazeRawX, { stiffness: 200, damping: 25, mass: 0.5 });
  const gazeY = useSpring(gazeRawY, { stiffness: 200, damping: 25, mass: 0.5 });

  // Micro-saccades — tiny natural eye jitter
  const saccadeTimer = useRef<ReturnType<typeof setInterval>>();
  useEffect(() => {
    saccadeTimer.current = setInterval(() => {
      const jitterX = (Math.random() - 0.5) * 1.5;
      const jitterY = (Math.random() - 0.5) * 1;
      gazeRawX.set(gazeRawX.get() + jitterX);
      gazeRawY.set(gazeRawY.get() + jitterY);
    }, 2000 + Math.random() * 3000);

    return () => {
      if (saccadeTimer.current) clearInterval(saccadeTimer.current);
    };
  }, [gazeRawX, gazeRawY]);

  // Mouse tracking
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * 0.3;

      // Distance-based intensity: closer = more movement
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.max(window.innerWidth, window.innerHeight) * 0.5;
      const intensity = Math.min(dist / maxDist, 1);

      // Non-linear response: fast initial tracking, dampened at extremes
      const eased = Math.pow(intensity, 0.7);
      const maxShift = width * 0.06;

      const angle = Math.atan2(dy, dx);
      gazeRawX.set(Math.cos(angle) * eased * maxShift);
      gazeRawY.set(Math.sin(angle) * eased * maxShift * 0.7);
    },
    [containerRef, gazeRawX, gazeRawY, width]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // Reset gaze to center on certain moods
  useEffect(() => {
    if (mood === "think") {
      gazeRawX.set(width * 0.03); // look slightly right when thinking
      gazeRawY.set(-width * 0.01);
    } else if (mood === "sad") {
      gazeRawX.set(0);
      gazeRawY.set(width * 0.02); // look down when sad
    }
  }, [mood, gazeRawX, gazeRawY, width]);

  return (
    <>
      <SingleEye side="left" width={width} mood={mood} gazeX={gazeX} gazeY={gazeY} />
      <SingleEye side="right" width={width} mood={mood} gazeX={gazeX} gazeY={gazeY} />
    </>
  );
};

export default OwlEyes;
