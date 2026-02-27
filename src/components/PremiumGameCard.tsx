import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

interface PremiumGameCardProps {
  emoji: string;
  title: string;
  color: string;
  index: number;
  description?: string;
  onClick: () => void;
}

/**
 * AAA-quality game card with holographic shine, depth layers,
 * and spring-physics 3D tilt. Nintendo-inspired bounce and glow.
 */
const PremiumGameCard = ({ emoji, title, color, index, description, onClick }: PremiumGameCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springCfg = { stiffness: 350, damping: 25 };
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [10, -10]), springCfg);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-10, 10]), springCfg);

  // Holographic shine position
  const shineX = useTransform(mouseX, [0, 1], ["-50%", "150%"]);
  const shineY = useTransform(mouseY, [0, 1], ["-50%", "150%"]);

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 800,
      }}
      className="cursor-pointer group"
      initial={{ opacity: 0, y: 40, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 180,
        damping: 18,
        delay: 0.1 + index * 0.06,
      }}
      whileTap={{ scale: 0.9 }}
    >
      <div
        className={`${color} rounded-2xl p-4 sm:p-5 text-center border border-transparent 
          group-hover:border-primary/25 transition-[border-color] duration-300 
          group-hover:shadow-[var(--shadow-card-hover)] relative overflow-hidden`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Holographic shine layer */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
          style={{
            background: `radial-gradient(circle at var(--shine-x, 50%) var(--shine-y, 50%), 
              hsl(var(--primary) / 0.12) 0%, 
              hsl(var(--sunshine) / 0.06) 30%, 
              transparent 60%)`,
            // @ts-ignore -- CSS custom properties
            "--shine-x": shineX,
            "--shine-y": shineY,
          }}
        />

        {/* Rainbow edge glow on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `
              linear-gradient(135deg, 
                hsl(var(--primary) / 0.08) 0%, 
                hsl(var(--candy) / 0.06) 25%, 
                hsl(var(--sky) / 0.06) 50%, 
                hsl(var(--sunshine) / 0.08) 75%, 
                hsl(var(--lavender) / 0.06) 100%)
            `,
          }}
        />

        {/* Emoji with squash-and-stretch */}
        <motion.span
          className="text-3xl sm:text-4xl block mb-2 relative"
          style={{ transform: "translateZ(35px)" }}
          whileHover={{
            scale: [1, 1.3, 1.15],
            rotate: [0, -8, 8, 0],
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 12,
          }}
        >
          {emoji}
        </motion.span>

        {/* Title with depth */}
        <span
          className="font-display text-[11px] sm:text-xs font-bold block leading-tight relative"
          style={{ transform: "translateZ(20px)" }}
        >
          {title}
        </span>
      </div>
    </motion.div>
  );
};

export default PremiumGameCard;
