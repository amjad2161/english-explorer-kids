import { motion } from "framer-motion";
import owlPixar from "@/assets/owl-pixar.png";

interface Interactive3DMascotProps {
  mood?: "idle" | "wave" | "celebrate" | "surprised" | "sad";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const sizeMap = { sm: 130, md: 200, lg: 280 };

/**
 * Interactive 3D Owl Mascot
 * 
 * The owl PNG has a solid black background. We use a CSS radial mask
 * to smoothly fade out the black edges, leaving only the owl visible.
 * This avoids all checker/transparency issues permanently.
 */
const Interactive3DMascot = ({ mood = "idle", size = "md", onClick }: Interactive3DMascotProps) => {
  const dim = sizeMap[size];

  const animateByMood =
    mood === "wave"
      ? { y: [0, -8, 0, -6, 0], rotate: [0, -4, 4, -3, 0], scale: [1, 1.02, 1, 1.02, 1] }
      : mood === "celebrate"
      ? { y: [0, -12, 0, -10, 0], rotate: [0, -6, 6, -4, 0], scale: [1, 1.05, 1, 1.03, 1] }
      : mood === "surprised"
      ? { y: [0, -5, 0], scale: [1, 1.06, 1], rotate: [0, 1.5, -1.5, 0] }
      : mood === "sad"
      ? { y: [0, 2, 0], rotate: [0, -1, 0], scale: [1, 0.985, 1] }
      : { y: [0, -5, 0], rotate: [0, -1.5, 1.5, 0], scale: [1, 1.015, 1] };

  const shadowByMood =
    mood === "celebrate"
      ? "drop-shadow(0 8px 24px hsl(var(--sunshine) / 0.3)) drop-shadow(0 2px 8px hsl(var(--foreground) / 0.15))"
      : mood === "wave"
      ? "drop-shadow(0 6px 20px hsl(var(--primary) / 0.2)) drop-shadow(0 2px 6px hsl(var(--foreground) / 0.12))"
      : mood === "sad"
      ? "drop-shadow(0 4px 14px hsl(var(--foreground) / 0.25))"
      : "drop-shadow(0 6px 18px hsl(var(--foreground) / 0.18)) drop-shadow(0 2px 4px hsl(var(--foreground) / 0.08))";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="relative inline-flex items-center justify-center p-0 border-0 bg-transparent"
      style={{ width: dim, height: dim }}
      whileTap={{ scale: 0.96 }}
      aria-label="Interactive Owl Mascot"
    >
      <motion.img
        src={owlPixar}
        alt="Pixar style owl mascot"
        draggable={false}
        className="w-full h-full object-contain select-none pointer-events-none"
        style={{
          filter: shadowByMood,
          WebkitMaskImage: "radial-gradient(ellipse 52% 56% at 50% 46%, black 50%, rgba(0,0,0,0.9) 60%, rgba(0,0,0,0.5) 72%, transparent 85%)",
          maskImage: "radial-gradient(ellipse 52% 56% at 50% 46%, black 50%, rgba(0,0,0,0.9) 60%, rgba(0,0,0,0.5) 72%, transparent 85%)",
        }}
        animate={animateByMood}
        transition={{
          duration:
            mood === "idle" ? 3.2
            : mood === "wave" ? 1.6
            : mood === "celebrate" ? 1.2
            : mood === "sad" ? 3.8
            : 0.95,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.button>
  );
};

export default Interactive3DMascot;
