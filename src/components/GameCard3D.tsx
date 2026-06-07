import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, ReactNode } from "react";

interface GameCard3DProps {
  emoji: string;
  title: string;
  color: string;
  index: number;
  onClick: () => void;
}

const GameCard3D = ({ emoji, title, color, index, onClick }: GameCard3DProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springCfg = { stiffness: 400, damping: 30 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), springCfg);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), springCfg);

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={title}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 600 }}
      className="cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl"
      initial={{ opacity: 0, y: 30, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: 0.15 + index * 0.06,
      }}
      whileTap={{ scale: 0.92 }}
    >
      <div
        className={`${color} rounded-2xl p-4 sm:p-5 text-center border border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] relative overflow-hidden`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Shine effect on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: "linear-gradient(105deg, transparent 40%, hsl(var(--primary) / 0.06) 45%, hsl(var(--primary) / 0.12) 50%, hsl(var(--primary) / 0.06) 55%, transparent 60%)",
          }}
        />

        {/* Emoji with 3D pop */}
        <motion.span
          className="text-3xl sm:text-4xl block mb-2 relative"
          style={{ transform: "translateZ(30px)" }}
          whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          {emoji}
        </motion.span>

        {/* Title */}
        <span
          className="font-display text-[11px] sm:text-xs font-bold block leading-tight"
          style={{ transform: "translateZ(20px)" }}
        >
          {title}
        </span>
      </div>
    </motion.div>
  );
};

export default GameCard3D;
