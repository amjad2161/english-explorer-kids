import { motion } from "framer-motion";
import owlPixar from "@/assets/owl-pixar.png";

interface Interactive3DMascotProps {
  mood?: "idle" | "wave" | "celebrate" | "surprised" | "sad";
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
    : mood === "sad"
    ? { rotate: isLeft ? [0, 3, 0] : [0, -3, 0], y: [0, 2, 0] }
    : mood === "surprised"
    ? { rotate: isLeft ? [0, -25, 0] : [0, 25, 0], y: [0, -8, 0] }
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
        duration: mood === "wave" ? 0.8 : mood === "celebrate" ? 1.4 : mood === "surprised" ? 0.5 : 3,
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
      <div style={{ width: 2, height: dim * 0.08, background: "hsl(var(--sunshine))", borderRadius: 1 }} />
      <motion.div
        style={{
          width: tasselSize, height: tasselSize, borderRadius: "50%",
          background: "hsl(var(--sunshine))",
          boxShadow: "0 0 8px hsl(var(--sunshine) / 0.5)",
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

/* ── Face expression SVG overlay ── */
const FaceExpression = ({ dim, mood }: { dim: number; mood: string }) => {
  const s = dim; // scale reference

  return (
    <motion.svg
      viewBox="0 0 200 200"
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-10"
    >
      {/* ── HAPPY (wave / celebrate) ── */}
      {(mood === "wave" || mood === "celebrate") && (
        <>
          {/* Happy squinted eyes — curved arcs */}
          <motion.path
            d="M 70 80 Q 78 72 86 80"
            stroke="hsl(var(--sunshine))"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M 114 80 Q 122 72 130 80"
            stroke="hsl(var(--sunshine))"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />
          {/* Smile arc */}
          <motion.path
            d={mood === "celebrate"
              ? "M 82 100 Q 100 118 118 100"
              : "M 85 98 Q 100 110 115 98"}
            stroke="hsl(var(--sunshine))"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            animate={{ opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Rosy cheeks */}
          <motion.circle cx="66" cy="92" r="8"
            fill="hsl(var(--candy) / 0.25)"
            animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.circle cx="134" cy="92" r="8"
            fill="hsl(var(--candy) / 0.25)"
            animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          />
        </>
      )}

      {/* ── SURPRISED ── */}
      {mood === "surprised" && (
        <>
          {/* Big round eyes */}
          <motion.circle cx="78" cy="78" r="12"
            fill="none"
            stroke="hsl(var(--sky))"
            strokeWidth="2.5"
            animate={{ r: [10, 14, 10] as any, strokeWidth: [2, 3, 2] as any }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle cx="122" cy="78" r="12"
            fill="none"
            stroke="hsl(var(--sky))"
            strokeWidth="2.5"
            animate={{ r: [10, 14, 10] as any, strokeWidth: [2, 3, 2] as any }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
          />
          {/* Tiny pupils */}
          <motion.circle cx="78" cy="78" r="3"
            fill="hsl(var(--sky))"
            animate={{ r: [2.5, 4, 2.5] as any }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
          <motion.circle cx="122" cy="78" r="3"
            fill="hsl(var(--sky))"
            animate={{ r: [2.5, 4, 2.5] as any }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.1 }}
          />
          {/* Raised eyebrows */}
          <motion.line x1="66" y1="62" x2="90" y2="60"
            stroke="hsl(var(--sky))"
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={{ y1: [62, 56, 62], y2: [60, 54, 60] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <motion.line x1="134" y1="62" x2="110" y2="60"
            stroke="hsl(var(--sky))"
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={{ y1: [62, 56, 62], y2: [60, 54, 60] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.1 }}
          />
          {/* O-shaped mouth */}
          <motion.ellipse cx="100" cy="104" rx="7" ry="9"
            fill="none"
            stroke="hsl(var(--sky))"
            strokeWidth="2"
            animate={{ ry: [7, 11, 7] as any, rx: [6, 8, 6] as any }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </>
      )}

      {/* ── SAD ── */}
      {mood === "sad" && (
        <>
          {/* Droopy eyes — downward tilt */}
          <motion.path
            d="M 68 82 Q 78 78 88 84"
            stroke="hsl(var(--lavender))"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.path
            d="M 112 84 Q 122 78 132 82"
            stroke="hsl(var(--lavender))"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.2 }}
          />
          {/* Sad eyebrows — tilted inward */}
          <motion.line x1="68" y1="68" x2="86" y2="72"
            stroke="hsl(var(--lavender))"
            strokeWidth="2"
            strokeLinecap="round"
            animate={{ y1: [68, 66, 68] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.line x1="132" y1="68" x2="114" y2="72"
            stroke="hsl(var(--lavender))"
            strokeWidth="2"
            strokeLinecap="round"
            animate={{ y1: [68, 66, 68] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.2 }}
          />
          {/* Frown */}
          <motion.path
            d="M 86 106 Q 100 96 114 106"
            stroke="hsl(var(--lavender))"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          {/* Single teardrop */}
          <motion.ellipse cx="130" cy="90" rx="2.5" ry="3.5"
            fill="hsl(var(--sky) / 0.6)"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.7, 0.7, 0], y: [0, 0, 12, 20] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeIn", delay: 1 }}
          />
        </>
      )}

      {/* ── IDLE — subtle blink ── */}
      {mood === "idle" && (
        <>
          {/* Gentle eye shine */}
          <motion.circle cx="78" cy="78" r="3"
            fill="white"
            opacity={0.6}
            animate={{ opacity: [0.4, 0.8, 0.4], r: [2.5, 3.5, 2.5] as any }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle cx="122" cy="78" r="3"
            fill="white"
            opacity={0.6}
            animate={{ opacity: [0.4, 0.8, 0.4], r: [2.5, 3.5, 2.5] as any }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
          {/* Blink lines — appear briefly */}
          <motion.line x1="68" y1="78" x2="88" y2="78"
            stroke="hsl(var(--primary) / 0.5)"
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={{ opacity: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], scaleY: [1, 1, 1, 0.1, 1, 1, 1, 1, 1, 1, 1, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.line x1="112" y1="78" x2="132" y2="78"
            stroke="hsl(var(--primary) / 0.5)"
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={{ opacity: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], scaleY: [1, 1, 1, 0.1, 1, 1, 1, 1, 1, 1, 1, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          {/* Soft smile */}
          <motion.path
            d="M 88 98 Q 100 106 112 98"
            stroke="hsl(var(--primary) / 0.3)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </>
      )}
    </motion.svg>
  );
};

const Interactive3DMascot = ({ mood = "idle", size = "md", onClick }: Interactive3DMascotProps) => {
  const dim = sizeMap[size];

  const animationByMood =
    mood === "wave"
      ? { y: [0, -8, 0, -6, 0], rotate: [0, -4, 4, -3, 0], scale: [1, 1.02, 1, 1.02, 1] }
      : mood === "celebrate"
      ? { y: [0, -12, 0, -10, 0], rotate: [0, -6, 6, -4, 0], scale: [1, 1.04, 1, 1.03, 1] }
      : mood === "surprised"
      ? { y: [0, -6, 0], scale: [1, 1.06, 1] }
      : mood === "sad"
      ? { y: [0, 2, 0], rotate: [0, -1, 0], scale: [1, 0.98, 1] }
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
          duration: mood === "idle" ? 3.2 : mood === "wave" ? 1.6 : mood === "sad" ? 4 : 1.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Face expression overlay */}
      <FaceExpression dim={dim} mood={mood} />

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

      {/* Sad — rain drops */}
      {mood === "sad" && (
        <motion.span
          className="absolute pointer-events-none"
          style={{ left: "50%", top: "5%", fontSize: dim * 0.08, transform: "translateX(-50%)" }}
          animate={{ opacity: [0, 0.5, 0], y: [0, 4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          🌧️
        </motion.span>
      )}

      {/* Surprised — exclamation */}
      {mood === "surprised" && (
        <motion.span
          className="absolute pointer-events-none"
          style={{ right: "8%", top: "6%", fontSize: dim * 0.13 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0.8], rotate: [0, 10, -5, 0] }}
          transition={{ duration: 1, repeat: Infinity, repeatDelay: 1.5 }}
        >
          ❗
        </motion.span>
      )}
    </motion.button>
  );
};

export default Interactive3DMascot;
