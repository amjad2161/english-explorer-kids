import { motion } from "framer-motion";

/**
 * LibraryMouse — A tiny mouse librarian scurrying along the bottom shelf.
 * Pure SVG/CSS animated. Appears near the bottom-left of the library.
 */

const LibraryMouse = () => {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{
        bottom: "4%",
        left: "15%",
        width: 65,
        height: 55,
        zIndex: 1,
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.2, delay: 3, ease: "easeOut" }}
    >
      <svg viewBox="0 0 65 55" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* ── Tail ── */}
        <motion.path
          d="M8 38 Q-2 30 2 22 Q5 16 8 20"
          stroke="hsl(340 25% 55%)"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          animate={{
            d: [
              "M8 38 Q-2 30 2 22 Q5 16 8 20",
              "M8 38 Q-4 28 0 20 Q4 14 8 20",
              "M8 38 Q-2 30 2 22 Q5 16 8 20",
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* ── Body ── */}
        <motion.ellipse
          cx="24" cy="38" rx="16" ry="11"
          fill="hsl(25 20% 50%)"
          animate={{ ry: [11, 11.5, 11] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Belly */}
        <ellipse cx="24" cy="40" rx="10" ry="7" fill="hsl(30 25% 70%)" opacity="0.25" />

        {/* ── Head ── */}
        <motion.g
          animate={{ x: [0, 1, 0, -0.5, 0], rotate: [0, 2, 0, -1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "40px 35px" }}
        >
          <ellipse cx="40" cy="34" rx="11" ry="10" fill="hsl(25 20% 50%)" />
          {/* Face lighter */}
          <ellipse cx="42" cy="36" rx="7" ry="6" fill="hsl(30 25% 65%)" opacity="0.25" />

          {/* ── Ears ── */}
          <motion.g
            animate={{ rotate: [0, -3, 0, 3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            style={{ transformOrigin: "34px 26px" }}
          >
            <ellipse cx="34" cy="24" rx="6" ry="7" fill="hsl(25 20% 48%)" />
            <ellipse cx="34" cy="24" rx="4" ry="5" fill="hsl(340 30% 55%)" opacity="0.35" />
          </motion.g>
          <motion.g
            animate={{ rotate: [0, 3, 0, -2, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            style={{ transformOrigin: "46px 26px" }}
          >
            <ellipse cx="46" cy="24" rx="6" ry="7" fill="hsl(25 20% 48%)" />
            <ellipse cx="46" cy="24" rx="4" ry="5" fill="hsl(340 30% 55%)" opacity="0.35" />
          </motion.g>

          {/* ── Eyes ── */}
          <circle cx="37" cy="33" r="2.2" fill="hsl(20 15% 10%)" />
          <circle cx="45" cy="33" r="2.2" fill="hsl(20 15% 10%)" />
          <motion.circle cx="37.7" cy="32.3" r="0.7" fill="white" opacity="0.85"
            animate={{ opacity: [0.85, 0.4, 0.85] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.circle cx="45.7" cy="32.3" r="0.7" fill="white" opacity="0.85"
            animate={{ opacity: [0.85, 0.4, 0.85] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          />

          {/* Blink */}
          <motion.rect x="34" y="30" width="7" height="6" rx="3" fill="hsl(25 20% 50%)"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 0, 0, 1, 0, 0, 0, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 1.5 }}
            style={{ transformOrigin: "37px 33px" }}
          />
          <motion.rect x="42" y="30" width="7" height="6" rx="3" fill="hsl(25 20% 50%)"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 0, 0, 1, 0, 0, 0, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 1.5 }}
            style={{ transformOrigin: "45px 33px" }}
          />

          {/* ── Nose ── */}
          <ellipse cx="50" cy="35" rx="2" ry="1.5" fill="hsl(340 35% 40%)" />
          <ellipse cx="49.5" cy="34.5" rx="0.8" ry="0.5" fill="hsl(340 25% 55%)" opacity="0.4" />

          {/* ── Whiskers ── */}
          <motion.g
            animate={{ x: [0, 0.5, -0.3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <line x1="50" y1="34" x2="62" y2="31" stroke="hsl(30 20% 55%)" strokeWidth="0.4" opacity="0.5" />
            <line x1="50" y1="36" x2="63" y2="37" stroke="hsl(30 20% 55%)" strokeWidth="0.4" opacity="0.5" />
            <line x1="50" y1="38" x2="61" y2="41" stroke="hsl(30 20% 55%)" strokeWidth="0.4" opacity="0.4" />
          </motion.g>

          {/* ── Tiny book the mouse is carrying ── */}
          <motion.g
            animate={{ rotate: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "48px 42px" }}
          >
            <rect x="44" y="40" width="8" height="6" rx="0.5" fill="hsl(45 60% 50%)" />
            <rect x="44" y="40" width="8" height="1.2" rx="0.3" fill="hsl(45 55% 58%)" opacity="0.5" />
            <line x1="48" y1="40" x2="48" y2="46" stroke="hsl(45 50% 38%)" strokeWidth="0.5" />
          </motion.g>
        </motion.g>

        {/* ── Paws ── */}
        <ellipse cx="18" cy="47" rx="4" ry="2.5" fill="hsl(340 25% 55%)" opacity="0.6" />
        <ellipse cx="30" cy="47" rx="4" ry="2.5" fill="hsl(340 25% 55%)" opacity="0.6" />

        {/* ── Shadow ── */}
        <ellipse cx="28" cy="49" rx="18" ry="3" fill="hsl(20 30% 6% / 0.25)" />
      </svg>
    </motion.div>
  );
};

export default LibraryMouse;
