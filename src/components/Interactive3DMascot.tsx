import { motion, AnimatePresence } from "framer-motion";
import owlPixar from "@/assets/owl-pixar.png";

interface Interactive3DMascotProps {
  mood?: "idle" | "wave" | "celebrate" | "surprised" | "sad";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  showSpeechBubble?: string;
}

const sizeMap = { sm: 120, md: 180, lg: 260 };

const Interactive3DMascot = ({ mood = "idle", size = "md", onClick, showSpeechBubble }: Interactive3DMascotProps) => {
  const dim = sizeMap[size];

  const animateByMood =
    mood === "wave"
      ? { y: [0, -10, 0, -7, 0], rotate: [0, -5, 5, -3, 0], scale: [1, 1.03, 1, 1.02, 1], scaleX: [1, 1.02, 0.98, 1.01, 1], scaleY: [1, 0.98, 1.03, 0.99, 1] }
      : mood === "celebrate"
      ? { y: [0, -16, 0, -12, 0], rotate: [0, -6, 6, -4, 0], scale: [1, 1.08, 0.96, 1.04, 1], scaleX: [1, 0.94, 1.06, 0.98, 1], scaleY: [1, 1.06, 0.94, 1.02, 1] }
      : mood === "surprised"
      ? { y: [0, -8, 0], scale: [1, 1.1, 1.02, 1], scaleX: [1, 0.92, 1.04, 1], scaleY: [1, 1.08, 0.97, 1], rotate: [0, 2, -1, 0] }
      : mood === "sad"
      ? { y: [0, 3, 0], rotate: [0, -1.5, 0], scale: [1, 0.97, 1], scaleY: [1, 0.98, 1] }
      : { y: [0, -4, 0], rotate: [0, -0.8, 0.8, 0], scale: [1, 1.01, 1], scaleY: [1, 1.005, 0.998, 1] };

  const transitionByMood =
    mood === "idle" ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" as const }
    : mood === "wave" ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" as const }
    : mood === "celebrate" ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" as const }
    : mood === "sad" ? { duration: 4, repeat: Infinity, ease: "easeInOut" as const }
    : { duration: 0.8, repeat: 0, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] };

  const shadowByMood =
    mood === "celebrate"
      ? "drop-shadow(0 10px 28px hsl(var(--sunshine) / 0.35)) drop-shadow(0 3px 8px hsl(var(--foreground) / 0.12))"
      : mood === "surprised"
      ? "drop-shadow(0 8px 24px hsl(var(--primary) / 0.25)) drop-shadow(0 2px 6px hsl(var(--foreground) / 0.1))"
      : mood === "wave"
      ? "drop-shadow(0 7px 22px hsl(var(--primary) / 0.2)) drop-shadow(0 2px 6px hsl(var(--foreground) / 0.1))"
      : mood === "sad"
      ? "drop-shadow(0 4px 12px hsl(var(--foreground) / 0.2))"
      : "drop-shadow(0 6px 18px hsl(var(--foreground) / 0.15)) drop-shadow(0 2px 4px hsl(var(--foreground) / 0.06))";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="relative inline-flex items-center justify-center p-0 border-0 bg-transparent"
      style={{ width: dim, height: dim }}
      whileTap={{
        scale: [1, 0.88, 1.05, 0.98, 1],
        scaleY: [1, 0.9, 1.06, 0.99, 1],
        transition: { duration: 0.4, ease: "easeOut" },
      }}
      aria-label="Interactive Owl Mascot"
    >
      {/* Ambient glow behind the mascot */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: dim * 0.7,
          height: dim * 0.5,
          left: "50%",
          bottom: "5%",
          transform: "translateX(-50%)",
          background: mood === "celebrate"
            ? "radial-gradient(ellipse, hsl(var(--sunshine) / 0.15), transparent 70%)"
            : mood === "surprised"
            ? "radial-gradient(ellipse, hsl(var(--primary) / 0.12), transparent 70%)"
            : "radial-gradient(ellipse, hsl(var(--primary) / 0.08), transparent 70%)",
          filter: "blur(12px)",
        }}
        animate={{
          opacity: mood === "celebrate" ? [0.6, 1, 0.6] : mood === "surprised" ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3],
          scale: mood === "celebrate" ? [1, 1.15, 1] : [1, 1.05, 1],
        }}
        transition={{ duration: mood === "celebrate" ? 1.5 : 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main owl image with soft circular vignette to blend black bg */}
      <motion.img
        src={owlPixar}
        alt="Pixar-style owl mascot"
        draggable={false}
        className="w-full h-full object-contain select-none pointer-events-none relative z-10"
        style={{
          filter: shadowByMood,
          WebkitMaskImage: "radial-gradient(ellipse 70% 75% at 50% 48%, black 40%, rgba(0,0,0,0.9) 55%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.2) 85%, transparent 100%)",
          maskImage: "radial-gradient(ellipse 70% 75% at 50% 48%, black 40%, rgba(0,0,0,0.9) 55%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.2) 85%, transparent 100%)",
        }}
        animate={animateByMood}
        transition={transitionByMood}
      />

      {/* Speech bubble */}
      <AnimatePresence>
        {showSpeechBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl px-3 py-1.5 shadow-md z-20 whitespace-nowrap"
            style={{ fontSize: Math.max(11, dim / 16) }}
          >
            <span className="font-display font-bold text-foreground">{showSpeechBubble}</span>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-r border-b border-border rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default Interactive3DMascot;
