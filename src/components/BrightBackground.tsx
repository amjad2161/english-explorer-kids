import { motion } from "framer-motion";
import { useMemo } from "react";

/**
 * Bright, cheerful Duolingo-style background.
 * Soft pastel blobs, no dark library elements.
 */
const BrightBackground = () => {
  const blobs = useMemo(() => [
    { x: 10, y: 5, size: 400, color: "hsl(var(--primary) / 0.07)", blur: 80 },
    { x: 75, y: 15, size: 350, color: "hsl(var(--sunshine) / 0.08)", blur: 70 },
    { x: 50, y: 60, size: 300, color: "hsl(var(--sky) / 0.06)", blur: 60 },
    { x: 20, y: 80, size: 250, color: "hsl(var(--candy) / 0.05)", blur: 50 },
    { x: 85, y: 70, size: 280, color: "hsl(var(--lavender) / 0.06)", blur: 55 },
    { x: 45, y: 30, size: 200, color: "hsl(var(--grass) / 0.05)", blur: 45 },
  ], []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Clean light base */}
      <div className="absolute inset-0 bg-background" />

      {/* Soft pastel blobs */}
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            width: blob.size,
            height: blob.size,
            background: `radial-gradient(circle, ${blob.color}, transparent 70%)`,
            filter: `blur(${blob.blur}px)`,
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            x: [0, 15, -10, 0],
            y: [0, -10, 8, 0],
            scale: [1, 1.05, 0.97, 1],
          }}
          transition={{
            duration: 20 + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 2,
          }}
        />
      ))}

      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />
    </div>
  );
};

export default BrightBackground;
