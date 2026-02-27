import { motion } from "framer-motion";

/**
 * LibraryBookworm — A cute bookworm peeking from between books on a shelf.
 * Pure SVG/CSS animated. Sits on the left side of the library background.
 */

const LibraryBookworm = () => {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{
        bottom: "32%",
        left: "4%",
        width: 70,
        height: 90,
        zIndex: 1,
      }}
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.5, delay: 2.5, ease: "easeOut" }}
    >
      <svg viewBox="0 0 70 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* ── Book the worm sits on ── */}
        <rect x="5" y="60" width="60" height="10" rx="1.5" fill="hsl(350 40% 28%)" />
        <rect x="5" y="60" width="60" height="2" rx="1" fill="hsl(350 35% 35%)" opacity="0.5" />
        <rect x="8" y="70" width="55" height="9" rx="1.5" fill="hsl(220 35% 30%)" />
        <rect x="10" y="79" width="50" height="8" rx="1.5" fill="hsl(140 30% 28%)" />
        {/* Book page edges */}
        <rect x="6" y="62" width="1.5" height="6" fill="hsl(40 25% 75%)" opacity="0.4" rx="0.5" />

        {/* ── Worm body — curvy segmented ── */}
        <motion.g
          animate={{ y: [0, -2, 0], rotate: [0, 2, -1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "35px 55px" }}
        >
          {/* Body segments */}
          <motion.path
            d="M30 58 Q28 50 32 42 Q36 34 34 26 Q32 22 35 18"
            stroke="hsl(100 45% 40%)"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
            animate={{
              d: [
                "M30 58 Q28 50 32 42 Q36 34 34 26 Q32 22 35 18",
                "M30 58 Q26 50 31 42 Q38 34 33 26 Q31 21 35 17",
                "M30 58 Q28 50 32 42 Q36 34 34 26 Q32 22 35 18",
              ],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Lighter belly stripe */}
          <motion.path
            d="M30 58 Q28 50 32 42 Q36 34 34 26 Q32 22 35 18"
            stroke="hsl(90 40% 55%)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.3"
            animate={{
              d: [
                "M30 58 Q28 50 32 42 Q36 34 34 26 Q32 22 35 18",
                "M30 58 Q26 50 31 42 Q38 34 33 26 Q31 21 35 17",
                "M30 58 Q28 50 32 42 Q36 34 34 26 Q32 22 35 18",
              ],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* ── Head ── */}
          <circle cx="35" cy="15" r="7" fill="hsl(100 45% 40%)" />
          <circle cx="35" cy="16" r="5" fill="hsl(95 40% 48%)" opacity="0.3" />

          {/* Eyes — round with glasses */}
          {/* Glasses frames */}
          <circle cx="31" cy="14" r="4" stroke="hsl(35 30% 35%)" strokeWidth="0.7" fill="none" />
          <circle cx="39" cy="14" r="4" stroke="hsl(35 30% 35%)" strokeWidth="0.7" fill="none" />
          <line x1="35" y1="14" x2="35" y2="14" stroke="hsl(35 30% 35%)" strokeWidth="0.7" />
          {/* Glasses bridge */}
          <path d="M34.5 13.5 Q35 12.5 35.5 13.5" stroke="hsl(35 30% 35%)" strokeWidth="0.6" fill="none" />

          {/* Eyes */}
          <circle cx="31" cy="14" r="2" fill="hsl(30 20% 10%)" />
          <circle cx="39" cy="14" r="2" fill="hsl(30 20% 10%)" />
          <motion.circle cx="31.5" cy="13.3" r="0.7" fill="white" opacity="0.8"
            animate={{ opacity: [0.8, 0.4, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <motion.circle cx="39.5" cy="13.3" r="0.7" fill="white" opacity="0.8"
            animate={{ opacity: [0.8, 0.4, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
          />

          {/* Blink */}
          <motion.rect x="28" y="11" width="7" height="6" rx="3" fill="hsl(100 45% 40%)"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 0, 0, 0, 0, 1, 0, 0, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 3 }}
            style={{ transformOrigin: "31px 14px" }}
          />
          <motion.rect x="36" y="11" width="7" height="6" rx="3" fill="hsl(100 45% 40%)"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 0, 0, 0, 0, 1, 0, 0, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 3 }}
            style={{ transformOrigin: "39px 14px" }}
          />

          {/* Mouth — happy */}
          <path d="M33 18 Q35 20 37 18" stroke="hsl(100 30% 25%)" strokeWidth="0.6" fill="none" strokeLinecap="round" />

          {/* Little hat / beret */}
          <ellipse cx="35" cy="10" rx="6" ry="2.5" fill="hsl(270 35% 30%)" />
          <ellipse cx="35" cy="9.5" rx="4" ry="1.5" fill="hsl(270 30% 38%)" opacity="0.5" />
          <circle cx="35" cy="8" r="1.2" fill="hsl(270 35% 30%)" />
        </motion.g>
      </svg>
    </motion.div>
  );
};

export default LibraryBookworm;
