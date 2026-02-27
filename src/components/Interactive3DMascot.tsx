import { motion } from "framer-motion";
import owlPixar from "@/assets/owl-pixar.png";

interface Interactive3DMascotProps {
  mood?: "idle" | "wave" | "celebrate";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const sizeMap = { sm: 130, md: 200, lg: 280 };

const Interactive3DMascot = ({ mood = "idle", size = "md", onClick }: Interactive3DMascotProps) => {
  const dim = sizeMap[size];

  const animationByMood =
    mood === "wave"
      ? {
          y: [0, -8, 0, -6, 0],
          rotate: [0, -4, 4, -3, 0],
          scale: [1, 1.02, 1, 1.02, 1],
        }
      : mood === "celebrate"
      ? {
          y: [0, -12, 0, -10, 0],
          rotate: [0, -6, 6, -4, 0],
          scale: [1, 1.04, 1, 1.03, 1],
        }
      : {
          y: [0, -5, 0],
          rotate: [0, -1.5, 1.5, 0],
          scale: [1, 1.015, 1],
        };

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
        style={{ filter: "drop-shadow(0 10px 28px hsl(var(--foreground) / 0.22))" }}
        animate={animationByMood}
        transition={{
          duration: mood === "idle" ? 3.2 : mood === "wave" ? 1.6 : 1.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {mood === "wave" && (
        <>
          <motion.span
            className="absolute pointer-events-none"
            style={{ right: "10%", top: "14%", fontSize: dim * 0.11 }}
            animate={{ y: [0, -14, 0], opacity: [0, 0.8, 0], rotate: [0, 12, -8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            👋
          </motion.span>
          <motion.span
            className="absolute pointer-events-none"
            style={{ right: "22%", top: "9%", fontSize: dim * 0.08 }}
            animate={{ y: [0, -10, 0], opacity: [0, 0.7, 0], rotate: [0, -10, 6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            ✨
          </motion.span>
        </>
      )}
    </motion.button>
  );
};

export default Interactive3DMascot;
