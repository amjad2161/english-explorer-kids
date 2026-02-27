import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useCallback } from "react";

interface InteractiveHeroImageProps {
  src: string;
  alt: string;
  className?: string;
  glowColor?: string;
}

const InteractiveHeroImage = ({ src, alt, className = "", glowColor = "--primary" }: InteractiveHeroImageProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 25 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);
  const imgX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig);
  const imgY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-10, 10]), springConfig);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden rounded-3xl cursor-default ${className}`}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Seamless gradient edges that blend into background */}
      <div className="absolute inset-0 z-10 pointer-events-none rounded-3xl"
        style={{
          background: `
            linear-gradient(to top, hsl(var(--background)) 0%, transparent 20%),
            linear-gradient(to bottom, hsl(var(--background)) 0%, transparent 15%),
            linear-gradient(to left, hsl(var(--background)) 0%, transparent 10%),
            linear-gradient(to right, hsl(var(--background)) 0%, transparent 10%)
          `,
        }}
      />

      {/* Ambient glow behind image */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, hsl(var(${glowColor}) / 0.08), transparent 70%)`,
          filter: "blur(30px)",
        }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Interactive parallax image */}
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        style={{
          x: imgX,
          y: imgY,
          scale: 1.1, // slightly overscale to hide edges during parallax
        }}
        draggable={false}
      />

      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background: "linear-gradient(120deg, transparent 30%, hsl(var(--background) / 0.08) 50%, transparent 70%)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPositionX: ["-100%", "200%"] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

export default InteractiveHeroImage;
