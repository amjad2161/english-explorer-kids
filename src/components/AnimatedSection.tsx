import { motion, useInView } from "framer-motion";
import { ReactNode, useRef, forwardRef } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

/**
 * Cinematic scroll-triggered section with directional reveal.
 * Uses IntersectionObserver for performant viewport detection.
 */
const AnimatedSection = forwardRef<HTMLDivElement, AnimatedSectionProps>(({ children, className = "", delay = 0, direction = "up" }, _ref) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const offsets = {
    up: { y: 30, x: 0 },
    down: { y: -30, x: 0 },
    left: { y: 0, x: 30 },
    right: { y: 0, x: -30 },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{
        opacity: 0,
        y: offsets[direction].y,
        x: offsets[direction].x,
        scale: 0.97,
      }}
      animate={isInView ? {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
      } : {}}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.div>
  );
});

AnimatedSection.displayName = "AnimatedSection";

export default AnimatedSection;
