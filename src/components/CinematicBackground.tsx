import { motion, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef } from "react";

/**
 * Cinematic parallax background with layered depth.
 * Creates a Disney/Pixar-style atmospheric depth effect.
 */

interface OrbConfig {
  x: number;
  y: number;
  size: number;
  color: string;
  blur: number;
  speed: number;
  delay: number;
  layer: number; // 0=far, 1=mid, 2=near
}

const ORB_COLORS = [
  "hsl(var(--primary) / 0.06)",
  "hsl(var(--sunshine) / 0.05)",
  "hsl(var(--sky) / 0.04)",
  "hsl(var(--candy) / 0.04)",
  "hsl(var(--lavender) / 0.035)",
  "hsl(var(--accent) / 0.045)",
];

const CinematicBackground = ({ intensity = 1 }: { intensity?: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Parallax transforms for different layers
  const farY = useTransform(scrollYProgress, [0, 1], [0, -40 * intensity]);
  const midY = useTransform(scrollYProgress, [0, 1], [0, -80 * intensity]);
  const nearY = useTransform(scrollYProgress, [0, 1], [0, -120 * intensity]);
  const layerTransforms = [farY, midY, nearY];

  const orbs = useMemo<OrbConfig[]>(() => {
    const count = 10;
    return Array.from({ length: count }, (_, i) => ({
      x: 5 + Math.random() * 90,
      y: 5 + Math.random() * 90,
      size: 120 + Math.random() * 280,
      color: ORB_COLORS[i % ORB_COLORS.length],
      blur: 40 + Math.random() * 60,
      speed: 25 + Math.random() * 20,
      delay: -Math.random() * 20,
      layer: i % 3,
    }));
  }, []);

  // Group by layer
  const layers = [0, 1, 2].map(l => orbs.filter(o => o.layer === l));

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Base atmospheric gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, hsl(var(--primary) / 0.04) 0%, transparent 70%),
            radial-gradient(ellipse 60% 60% at 20% 80%, hsl(var(--sky) / 0.03) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 85% 60%, hsl(var(--candy) / 0.025) 0%, transparent 50%)
          `,
        }}
      />

      {/* Parallax orb layers */}
      {layers.map((layerOrbs, layerIdx) => (
        <motion.div
          key={layerIdx}
          className="absolute inset-0"
          style={{ y: layerTransforms[layerIdx] }}
        >
          {layerOrbs.map((orb, i) => (
            <motion.div
              key={`${layerIdx}-${i}`}
              className="absolute rounded-full will-change-transform"
              style={{
                left: `${orb.x}%`,
                top: `${orb.y}%`,
                width: orb.size,
                height: orb.size,
                background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
                filter: `blur(${orb.blur}px)`,
              }}
              animate={{
                y: [0, -20 * (layerIdx + 1), 8, -12, 0],
                x: [0, 10, -5, 8, 0],
                scale: [1, 1.05, 0.98, 1.02, 1],
              }}
              transition={{
                duration: orb.speed,
                repeat: Infinity,
                delay: orb.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      ))}

      {/* Subtle vignette for cinematic depth */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 50%, hsl(var(--background) / 0.4) 100%)",
        }}
      />
    </div>
  );
};

export default CinematicBackground;
