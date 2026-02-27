import { motion, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef } from "react";
import LibraryGuardian from "./LibraryGuardian";
import LibraryBookworm from "./LibraryBookworm";
import LibraryMouse from "./LibraryMouse";

/**
 * Magical Library Background — Disney/Pixar-quality cinematic environment.
 * Layered gradients, animated fireflies, volumetric light, parallax depth.
 */

const MagicalLibraryBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const midY = useTransform(scrollYProgress, [0, 1], [0, -30]);

  // Firefly particles
  const fireflies = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      opacity: 0.2 + Math.random() * 0.5,
      speed: 10 + Math.random() * 15,
      delay: -Math.random() * 20,
      drift: -30 + Math.random() * 60,
      color: Math.random() > 0.6
        ? `hsl(${40 + Math.random() * 20} ${60 + Math.random() * 30}% ${50 + Math.random() * 20}%)`
        : `hsl(${30 + Math.random() * 15} ${50 + Math.random() * 20}% ${45 + Math.random() * 15}%)`,
    })), []
  );

  // Volumetric light rays
  const lightRays = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      x: 10 + i * 16 + (Math.random() - 0.5) * 8,
      width: 40 + Math.random() * 80,
      opacity: 0.025 + Math.random() * 0.04,
      delay: i * 1.2,
      angle: -10 + Math.random() * 20,
    })), []
  );

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* BASE: Rich warm atmosphere */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 130% 90% at 50% 15%, hsl(28 45% 14%) 0%, hsl(22 38% 9%) 35%, hsl(18 30% 5%) 100%)
          `,
        }} />
        {/* Warm ambient glow — multiple light sources */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 65% 55% at 50% 30%, hsl(35 65% 20% / 0.7) 0%, transparent 70%),
            radial-gradient(ellipse 45% 35% at 25% 65%, hsl(25 55% 14% / 0.5) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 80% 45%, hsl(15 50% 12% / 0.4) 0%, transparent 55%),
            radial-gradient(ellipse 30% 25% at 70% 80%, hsl(30 40% 15% / 0.3) 0%, transparent 50%)
          `,
        }} />
        {/* Golden skylight */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 55% 35% at 50% -5%, hsl(38 75% 40% / 0.2) 0%, transparent 70%),
            radial-gradient(ellipse 35% 25% at 55% 0%, hsl(45 85% 50% / 0.1) 0%, transparent 60%)
          `,
        }} />
      </motion.div>

      {/* MID LAYER: Tree trunk structure */}
      <motion.div className="absolute inset-0" style={{ y: midY }}>
        <div className="absolute left-0 top-0 bottom-0 w-[14%]" style={{
          background: `linear-gradient(90deg, hsl(18 32% 4% / 0.92) 0%, hsl(22 28% 6% / 0.5) 50%, transparent 100%)`,
        }} />
        <div className="absolute right-0 top-0 bottom-0 w-[12%]" style={{
          background: `linear-gradient(-90deg, hsl(18 32% 4% / 0.88) 0%, hsl(22 28% 6% / 0.4) 45%, transparent 100%)`,
        }} />
        <div className="absolute top-0 left-0 right-0 h-[18%]" style={{
          background: `linear-gradient(180deg, hsl(16 30% 4% / 0.75) 0%, transparent 100%)`,
        }} />
        {/* Wood grain */}
        <div className="absolute left-0 top-0 bottom-0 w-[16%] opacity-25" style={{
          background: `repeating-linear-gradient(185deg, transparent, transparent 8px, hsl(25 30% 10% / 0.3) 8px, hsl(25 30% 10% / 0.3) 9px)`,
        }} />
        <div className="absolute right-0 top-0 bottom-0 w-[14%] opacity-20" style={{
          background: `repeating-linear-gradient(175deg, transparent, transparent 10px, hsl(25 30% 10% / 0.25) 10px, hsl(25 30% 10% / 0.25) 11px)`,
        }} />
      </motion.div>

      {/* VOLUMETRIC LIGHT RAYS */}
      {lightRays.map((ray, i) => (
        <motion.div
          key={i}
          className="absolute top-0 will-change-transform"
          style={{
            left: `${ray.x}%`,
            width: ray.width,
            height: "115%",
            background: `linear-gradient(180deg, hsl(40 75% 55% / ${ray.opacity}) 0%, hsl(35 65% 45% / ${ray.opacity * 0.5}) 35%, transparent 75%)`,
            transformOrigin: "top center",
            transform: `rotate(${ray.angle}deg)`,
            filter: "blur(18px)",
          }}
          animate={{
            opacity: [ray.opacity * 8, ray.opacity * 14, ray.opacity * 8],
            scaleX: [1, 1.2, 1],
          }}
          transition={{
            duration: 7 + i * 1.8,
            repeat: Infinity,
            delay: ray.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* FIREFLY PARTICLES */}
      {fireflies.map((f, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full will-change-transform"
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            width: f.size,
            height: f.size,
            background: `radial-gradient(circle, ${f.color} 0%, transparent 70%)`,
            boxShadow: `0 0 ${f.size * 3}px ${f.color.replace(")", " / 0.6)")}`,
          }}
          animate={{
            y: [0, -50 - Math.random() * 40, 0],
            x: [0, f.drift, 0],
            opacity: [0, f.opacity, f.opacity * 0.5, f.opacity, 0],
            scale: [0.5, 1.3, 0.8, 1.2, 0.5],
          }}
          transition={{
            duration: f.speed,
            repeat: Infinity,
            delay: f.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Shelf silhouettes */}
      <div className="absolute inset-0 opacity-[0.07]" style={{
        background: `repeating-linear-gradient(180deg, transparent, transparent 80px, hsl(25 30% 20%) 80px, hsl(25 30% 20%) 82px, transparent 82px, transparent 180px)`,
        WebkitMaskImage: `linear-gradient(90deg, transparent 8%, black 20%, black 80%, transparent 92%)`,
      }} />

      {/* Warm vignette */}
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 60% 55% at 50% 45%, transparent 35%, hsl(16 32% 4% / 0.55) 100%)`,
      }} />

      {/* Floor glow */}
      <div className="absolute bottom-0 left-0 right-0 h-[22%]" style={{
        background: `
          linear-gradient(0deg, hsl(30 45% 12% / 0.5) 0%, transparent 100%),
          radial-gradient(ellipse 85% 45% at 50% 100%, hsl(35 55% 18% / 0.35) 0%, transparent 70%)
        `,
      }} />

      {/* Ambient glow orbs */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 500, height: 500, left: "35%", top: "20%",
          background: "radial-gradient(circle, hsl(38 65% 38% / 0.08), transparent 70%)",
          filter: "blur(70px)",
        }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5], x: [0, 25, 0], y: [0, -15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 300, height: 300, left: "55%", top: "50%",
          background: "radial-gradient(circle, hsl(25 55% 28% / 0.06), transparent 70%)",
          filter: "blur(45px)",
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.65, 0.3] }}
        transition={{ duration: 15, repeat: Infinity, delay: 3, ease: "easeInOut" }}
      />

      {/* LIBRARY CREATURES */}
      <LibraryGuardian />
      <LibraryBookworm />
      <LibraryMouse />
    </div>
  );
};

export default MagicalLibraryBackground;
