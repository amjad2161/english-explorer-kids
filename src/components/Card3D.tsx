import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, ReactNode } from "react";

interface Card3DProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  glowColor?: string;
  intensity?: number;
}

const Card3D = ({ children, className = "", onClick, glowColor = "var(--primary)", intensity = 15 }: Card3DProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 30 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), springConfig);

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
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      onClick={onClick}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 800 }}
      className={`relative cursor-pointer ${className}`}
      whileTap={{ scale: 0.97 }}
    >
      {/* Glow layer */}
      <motion.div
        className="absolute -inset-1 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at center, hsl(${glowColor} / 0.15), transparent 70%)`,
          filter: "blur(20px)",
        }}
      />
      {/* Content */}
      <div style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
};

export default Card3D;
