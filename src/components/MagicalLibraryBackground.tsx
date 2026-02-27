import { motion, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef } from "react";

/**
 * Magical Library Background
 * 
 * A cinematic, immersive background depicting an ancient magical library
 * inside a great tree. Uses layered gradients, animated light rays,
 * floating dust particles, and parallax depth to create a Disney/Pixar
 * quality environment — purely with CSS/SVG, no images.
 */

interface DustParticle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  delay: number;
  drift: number;
}

interface LightRay {
  x: number;
  width: number;
  opacity: number;
  delay: number;
  angle: number;
}

const MagicalLibraryBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const midY = useTransform(scrollYProgress, [0, 1], [0, -30]);

  // Floating dust/sparkle particles
  const particles = useMemo<DustParticle[]>(() => 
    Array.from({ length: 30 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1.5 + Math.random() * 3,
      opacity: 0.15 + Math.random() * 0.35,
      speed: 12 + Math.random() * 18,
      delay: -Math.random() * 20,
      drift: -20 + Math.random() * 40,
    })), []
  );

  // Volumetric light rays from above
  const lightRays = useMemo<LightRay[]>(() => 
    Array.from({ length: 5 }, (_, i) => ({
      x: 15 + i * 18 + (Math.random() - 0.5) * 10,
      width: 30 + Math.random() * 60,
      opacity: 0.03 + Math.random() * 0.04,
      delay: i * 1.5,
      angle: -8 + Math.random() * 16,
    })), []
  );

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* ═══ BASE: Deep warm library atmosphere ═══ */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        {/* Primary atmosphere — warm amber-brown wood tones */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% 20%, hsl(30 40% 12%) 0%, hsl(25 35% 8%) 40%, hsl(20 30% 5%) 100%)
          `,
        }} />

        {/* Warm ambient glow from center — like candlelight in a library */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 60% 50% at 50% 35%, hsl(35 60% 18% / 0.6) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 30% 60%, hsl(25 50% 12% / 0.4) 0%, transparent 60%),
            radial-gradient(ellipse 35% 25% at 75% 50%, hsl(15 45% 10% / 0.3) 0%, transparent 55%)
          `,
        }} />

        {/* Golden highlight from above — skylight through tree canopy */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 50% 30% at 50% 0%, hsl(38 70% 35% / 0.15) 0%, transparent 70%),
            radial-gradient(ellipse 30% 20% at 60% 5%, hsl(45 80% 45% / 0.08) 0%, transparent 60%)
          `,
        }} />
      </motion.div>

      {/* ═══ MID LAYER: Tree trunk structure (silhouette edges) ═══ */}
      <motion.div className="absolute inset-0" style={{ y: midY }}>
        {/* Left trunk edge */}
        <div className="absolute left-0 top-0 bottom-0 w-[12%]" style={{
          background: `linear-gradient(90deg, hsl(20 30% 4% / 0.9) 0%, hsl(25 25% 6% / 0.4) 60%, transparent 100%)`,
        }} />
        {/* Right trunk edge */}
        <div className="absolute right-0 top-0 bottom-0 w-[10%]" style={{
          background: `linear-gradient(-90deg, hsl(20 30% 4% / 0.85) 0%, hsl(25 25% 6% / 0.35) 55%, transparent 100%)`,
        }} />
        {/* Top canopy shadow */}
        <div className="absolute top-0 left-0 right-0 h-[15%]" style={{
          background: `linear-gradient(180deg, hsl(18 28% 4% / 0.7) 0%, transparent 100%)`,
        }} />

        {/* Subtle wood grain texture overlay via repeating gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-[15%] opacity-20" style={{
          background: `
            repeating-linear-gradient(185deg, transparent, transparent 8px, hsl(25 30% 10% / 0.3) 8px, hsl(25 30% 10% / 0.3) 9px)
          `,
        }} />
        <div className="absolute right-0 top-0 bottom-0 w-[13%] opacity-15" style={{
          background: `
            repeating-linear-gradient(175deg, transparent, transparent 10px, hsl(25 30% 10% / 0.25) 10px, hsl(25 30% 10% / 0.25) 11px)
          `,
        }} />
      </motion.div>

      {/* ═══ VOLUMETRIC LIGHT RAYS ═══ */}
      {lightRays.map((ray, i) => (
        <motion.div
          key={i}
          className="absolute top-0 will-change-transform"
          style={{
            left: `${ray.x}%`,
            width: ray.width,
            height: "110%",
            background: `linear-gradient(180deg, hsl(40 70% 50% / ${ray.opacity}) 0%, hsl(35 60% 40% / ${ray.opacity * 0.5}) 40%, transparent 80%)`,
            transformOrigin: "top center",
            transform: `rotate(${ray.angle}deg)`,
            filter: "blur(15px)",
          }}
          animate={{
            opacity: [ray.opacity * 8, ray.opacity * 12, ray.opacity * 8],
            scaleX: [1, 1.15, 1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            delay: ray.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* ═══ FLOATING DUST / SPARKLE PARTICLES ═══ */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full will-change-transform"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, hsl(40 60% 70% / ${p.opacity}) 0%, hsl(35 50% 50% / ${p.opacity * 0.3}) 60%, transparent 100%)`,
            boxShadow: `0 0 ${p.size * 2}px hsl(40 60% 60% / ${p.opacity * 0.5})`,
          }}
          animate={{
            y: [0, -40 - Math.random() * 30, 0],
            x: [0, p.drift, 0],
            opacity: [p.opacity * 0.3, p.opacity, p.opacity * 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: p.speed,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* ═══ SHELF SILHOUETTES (subtle horizontal lines suggesting bookshelves) ═══ */}
      <div className="absolute inset-0 opacity-[0.06]" style={{
        background: `
          repeating-linear-gradient(
            180deg,
            transparent,
            transparent 80px,
            hsl(25 30% 20%) 80px,
            hsl(25 30% 20%) 82px,
            transparent 82px,
            transparent 180px
          )
        `,
        maskImage: `
          linear-gradient(90deg, 
            transparent 5%, 
            black 15%, 
            black 85%, 
            transparent 95%
          ),
          linear-gradient(180deg,
            transparent 10%,
            black 30%,
            black 85%,
            transparent 100%
          )
        `,
        maskComposite: "intersect",
        WebkitMaskImage: `
          linear-gradient(90deg, transparent 8%, black 20%, black 80%, transparent 92%)
        `,
      }} />

      {/* ═══ WARM VIGNETTE ═══ */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse 65% 60% at 50% 45%, transparent 40%, hsl(18 30% 4% / 0.5) 100%)
        `,
      }} />

      {/* ═══ BOTTOM FLOOR GLOW — warm ground reflection ═══ */}
      <div className="absolute bottom-0 left-0 right-0 h-[20%]" style={{
        background: `
          linear-gradient(0deg, hsl(30 40% 10% / 0.4) 0%, transparent 100%),
          radial-gradient(ellipse 80% 40% at 50% 100%, hsl(35 50% 15% / 0.3) 0%, transparent 70%)
        `,
      }} />

      {/* ═══ SUBTLE ANIMATED AMBIENT GLOW ═══ */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 400,
          height: 400,
          left: "40%",
          top: "25%",
          background: "radial-gradient(circle, hsl(38 60% 35% / 0.06), transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.8, 0.5],
          x: [0, 20, 0],
          y: [0, -10, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Secondary warm orb */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 250,
          height: 250,
          left: "60%",
          top: "55%",
          background: "radial-gradient(circle, hsl(25 50% 25% / 0.05), transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 15, repeat: Infinity, delay: 3, ease: "easeInOut" }}
      />
    </div>
  );
};

export default MagicalLibraryBackground;
