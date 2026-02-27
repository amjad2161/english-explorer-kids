import { motion } from "framer-motion";
import owlPixar from "@/assets/owl-pixar.png";

interface Interactive3DMascotProps {
  mood?: "idle" | "wave" | "celebrate";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const sizeMap = { sm: 130, md: 200, lg: 280 };

/* ── Animated wing overlay ── */
const WingOverlay = ({ side, dim, mood }: { side: "left" | "right"; dim: number; mood: string }) => {
  const isLeft = side === "left";
  const wingWidth = dim * 0.22;
  const wingHeight = dim * 0.35;

  const flapAnim = mood === "wave"
    ? { rotate: isLeft ? [0, -35, 10, -30, 5, 0] : [0, 35, -10, 30, -5, 0], y: [0, -6, 2, -5, 1, 0] }
    : mood === "celebrate"
    ? { rotate: isLeft ? [0, -20, 8, -15, 0] : [0, 20, -8, 15, 0], y: [0, -4, 1, -3, 0] }
    : { rotate: isLeft ? [0, -5, 3, 0] : [0, 5, -3, 0], y: [0, -1, 0.5, 0] };

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: wingWidth,
        height: wingHeight,
        top: "42%",
        ...(isLeft ? { left: "4%" } : { right: "4%" }),
        transformOrigin: isLeft ? "right top" : "left top",
        background: `radial-gradient(ellipse at ${isLeft ? "right" : "left"} top, hsl(var(--primary) / 0.08), transparent 70%)`,
        borderRadius: "50%",
      }}
      animate={flapAnim}
      transition={{
        duration: mood === "wave" ? 0.8 : mood === "celebrate" ? 1.4 : 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

/* ── Tassel overlay for academic cap ── */
const TasselOverlay = ({ dim, mood }: { dim: number; mood: string }) => {
  const tasselSize = dim * 0.06;

  const swingAnim = mood === "celebrate"
    ? { rotate: [0, 30, -25, 20, -12, 0], x: [0, 8, -6, 5, -3, 0] }
    : mood === "wave"
    ? { rotate: [0, 12, -8, 5, 0], x: [0, 4, -3, 2, 0] }
    : { rotate: [0, 4, -3, 2, 0], x: [0, 1, -0.5, 0.5, 0] };

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: "22%",
        top: "8%",
        transformOrigin: "top center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      animate={swingAnim}
      transition={{
        duration: mood === "celebrate" ? 1 : mood === "wave" ? 2 : 3.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* String */}
      <div
        style={{
          width: 2,
          height: dim * 0.08,
          background: "hsl(var(--sunshine))",
          borderRadius: 1,
        }}
      />
      {/* Bobble */}
      <motion.div
        style={{
          width: tasselSize,
          height: tasselSize,
          borderRadius: "50%",
          background: "hsl(var(--sunshine))",
          boxShadow: "0 0 8px hsl(var(--sunshine) / 0.5)",
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

const Interactive3DMascot = ({ mood = "idle", size = "md", onClick }: Interactive3DMascotProps) => {
  const dim = sizeMap[size];

  const animationByMood =
    mood === "wave"
      ? { y: [0, -8, 0, -6, 0], rotate: [0, -4, 4, -3, 0], scale: [1, 1.02, 1, 1.02, 1] }
      : mood === "celebrate"
      ? { y: [0, -12, 0, -10, 0], rotate: [0, -6, 6, -4, 0], scale: [1, 1.04, 1, 1.03, 1] }
      : { y: [0, -5, 0], rotate: [0, -1.5, 1.5, 0], scale: [1, 1.015, 1] };

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

      {/* Wing flap overlays */}
      <WingOverlay side="left" dim={dim} mood={mood} />
      <WingOverlay side="right" dim={dim} mood={mood} />

      {/* Tassel swing */}
      <TasselOverlay dim={dim} mood={mood} />

      {/* Wave emojis */}
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

      {/* Celebrate sparkles */}
      {mood === "celebrate" && (
        <>
          {[0, 1, 2, 3].map(i => (
            <motion.span
              key={i}
              className="absolute pointer-events-none"
              style={{ fontSize: dim * 0.09, left: `${12 + i * 22}%`, top: `${4 + (i % 2) * 14}%` }}
              animate={{ y: [0, -10, 0], opacity: [0.3, 0.9, 0.3], scale: [0.8, 1.15, 0.8], rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1.8 + i * 0.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
            >
              {["✨", "🌟", "⭐", "💫"][i]}
            </motion.span>
          ))}
        </>
      )}
    </motion.button>
  );
};

export default Interactive3DMascot;
