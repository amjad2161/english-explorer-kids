import { motion } from "framer-motion";

/**
 * LibraryGuardian — A mystical fox-spirit librarian
 * 
 * Pure CSS/SVG animated character that sits naturally in the
 * magical library background. Gentle breathing, ear twitches,
 * tail sway, and glowing lantern. No owl.
 */

const LibraryGuardian = () => {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{
        bottom: "8%",
        right: "6%",
        width: 120,
        height: 160,
        zIndex: 1,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, delay: 1.5, ease: "easeOut" }}
    >
      {/* Ambient glow around the guardian */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 140,
          height: 100,
          left: -10,
          bottom: -10,
          background: "radial-gradient(ellipse, hsl(var(--library-gold) / 0.06), transparent 70%)",
          filter: "blur(20px)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg
        viewBox="0 0 120 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 4px 12px hsl(20 30% 8% / 0.5))" }}
      >
        {/* ── Tail (behind body) ── */}
        <motion.path
          d="M85 130 Q110 115 105 95 Q100 80 90 85 Q80 90 75 110 Q72 120 85 130Z"
          fill="hsl(25 55% 35%)"
          stroke="hsl(30 45% 25%)"
          strokeWidth="0.5"
          animate={{ d: [
            "M85 130 Q110 115 105 95 Q100 80 90 85 Q80 90 75 110 Q72 120 85 130Z",
            "M85 130 Q115 110 108 90 Q103 75 92 82 Q82 88 76 108 Q73 118 85 130Z",
            "M85 130 Q110 115 105 95 Q100 80 90 85 Q80 90 75 110 Q72 120 85 130Z",
          ]}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Tail tip — lighter */}
        <motion.path
          d="M105 95 Q100 80 92 84 Q98 82 103 92Z"
          fill="hsl(35 60% 70%)"
          opacity="0.6"
          animate={{ d: [
            "M105 95 Q100 80 92 84 Q98 82 103 92Z",
            "M108 90 Q103 75 94 80 Q100 78 106 88Z",
            "M105 95 Q100 80 92 84 Q98 82 103 92Z",
          ]}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* ── Body — sitting fox shape ── */}
        <motion.ellipse
          cx="55" cy="120" rx="28" ry="22"
          fill="hsl(25 50% 32%)"
          stroke="hsl(28 40% 22%)"
          strokeWidth="0.5"
          animate={{ ry: [22, 23, 22] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Chest/belly lighter patch */}
        <ellipse cx="55" cy="124" rx="16" ry="14" fill="hsl(35 50% 65%)" opacity="0.3" />

        {/* ── Head ── */}
        <motion.g
          animate={{ y: [0, -1.5, 0], rotate: [0, 1, -0.5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "55px 90px" }}
        >
          {/* Head shape */}
          <ellipse cx="55" cy="85" rx="22" ry="20" fill="hsl(25 50% 35%)" />
          
          {/* Face lighter area */}
          <ellipse cx="55" cy="90" rx="14" ry="12" fill="hsl(35 45% 55%)" opacity="0.35" />

          {/* ── Left ear ── */}
          <motion.path
            d="M38 72 L30 50 L45 68Z"
            fill="hsl(25 50% 32%)"
            stroke="hsl(28 40% 22%)"
            strokeWidth="0.5"
            animate={{ rotate: [0, -4, 0, 3, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            style={{ transformOrigin: "38px 72px" }}
          />
          {/* Left ear inner */}
          <motion.path
            d="M39 70 L34 56 L44 67Z"
            fill="hsl(350 40% 50%)"
            opacity="0.3"
            animate={{ rotate: [0, -4, 0, 3, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            style={{ transformOrigin: "38px 72px" }}
          />

          {/* ── Right ear ── */}
          <motion.path
            d="M72 72 L80 50 L65 68Z"
            fill="hsl(25 50% 32%)"
            stroke="hsl(28 40% 22%)"
            strokeWidth="0.5"
            animate={{ rotate: [0, 3, 0, -3, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            style={{ transformOrigin: "72px 72px" }}
          />
          {/* Right ear inner */}
          <motion.path
            d="M71 70 L76 56 L66 67Z"
            fill="hsl(350 40% 50%)"
            opacity="0.3"
            animate={{ rotate: [0, 3, 0, -3, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            style={{ transformOrigin: "72px 72px" }}
          />

          {/* ── Eyes ── */}
          {/* Left eye */}
          <ellipse cx="46" cy="83" rx="4" ry="4.5" fill="hsl(25 30% 12%)" />
          <ellipse cx="46" cy="83" rx="3" ry="3.5" fill="hsl(38 70% 40%)" />
          <circle cx="46" cy="82.5" r="1.8" fill="hsl(25 30% 12%)" />
          {/* Eye highlight */}
          <motion.circle
            cx="47.5" cy="81.5" r="0.8"
            fill="white"
            opacity="0.8"
            animate={{ opacity: [0.8, 0.4, 0.8] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Right eye */}
          <ellipse cx="64" cy="83" rx="4" ry="4.5" fill="hsl(25 30% 12%)" />
          <ellipse cx="64" cy="83" rx="3" ry="3.5" fill="hsl(38 70% 40%)" />
          <circle cx="64" cy="82.5" r="1.8" fill="hsl(25 30% 12%)" />
          <motion.circle
            cx="65.5" cy="81.5" r="0.8"
            fill="white"
            opacity="0.8"
            animate={{ opacity: [0.8, 0.4, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          />

          {/* ── Blink overlay ── */}
          <motion.rect
            x="40" y="78" width="12" height="10" rx="4"
            fill="hsl(25 50% 35%)"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 0, 0, 1, 0, 0, 0, 0, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            style={{ transformOrigin: "46px 83px" }}
          />
          <motion.rect
            x="58" y="78" width="12" height="10" rx="4"
            fill="hsl(25 50% 35%)"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 0, 0, 1, 0, 0, 0, 0, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            style={{ transformOrigin: "64px 83px" }}
          />

          {/* ── Nose ── */}
          <ellipse cx="55" cy="90" rx="2.5" ry="1.8" fill="hsl(350 30% 25%)" />
          {/* Nose highlight */}
          <ellipse cx="54.5" cy="89.5" rx="1" ry="0.6" fill="hsl(350 20% 40%)" opacity="0.5" />

          {/* ── Mouth — gentle smile ── */}
          <path d="M51 93 Q55 96 59 93" stroke="hsl(25 30% 20%)" strokeWidth="0.8" fill="none" strokeLinecap="round" />

          {/* ── Whiskers ── */}
          <motion.g
            animate={{ x: [0, 0.5, -0.5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <line x1="38" y1="88" x2="22" y2="86" stroke="hsl(35 30% 50%)" strokeWidth="0.4" opacity="0.4" />
            <line x1="38" y1="91" x2="20" y2="92" stroke="hsl(35 30% 50%)" strokeWidth="0.4" opacity="0.4" />
            <line x1="72" y1="88" x2="88" y2="86" stroke="hsl(35 30% 50%)" strokeWidth="0.4" opacity="0.4" />
            <line x1="72" y1="91" x2="90" y2="92" stroke="hsl(35 30% 50%)" strokeWidth="0.4" opacity="0.4" />
          </motion.g>
        </motion.g>

        {/* ── Front paws ── */}
        <ellipse cx="40" cy="138" rx="8" ry="5" fill="hsl(25 45% 30%)" />
        <ellipse cx="70" cy="138" rx="8" ry="5" fill="hsl(25 45% 30%)" />
        {/* Paw pads (lighter) */}
        <ellipse cx="40" cy="139" rx="5" ry="3" fill="hsl(35 40% 55%)" opacity="0.25" />
        <ellipse cx="70" cy="139" rx="5" ry="3" fill="hsl(35 40% 55%)" opacity="0.25" />

        {/* ── Lantern held by the fox ── */}
        <motion.g
          animate={{ rotate: [0, 2, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "30px 110px" }}
        >
          {/* Lantern handle */}
          <path d="M30 110 Q28 105 30 100 Q32 105 30 110" stroke="hsl(35 40% 40%)" strokeWidth="1" fill="none" />
          {/* Lantern body */}
          <rect x="24" y="110" width="12" height="16" rx="2" fill="hsl(35 30% 25%)" stroke="hsl(35 40% 35%)" strokeWidth="0.5" />
          {/* Lantern glass */}
          <rect x="26" y="112" width="8" height="12" rx="1" fill="hsl(40 80% 55% / 0.2)" />
          {/* Lantern flame */}
          <motion.ellipse
            cx="30" cy="118"
            rx="2.5" ry="4"
            fill="hsl(var(--library-gold) / 0.7)"
            animate={{
              ry: [4, 5, 3.5, 4],
              rx: [2.5, 2, 3, 2.5],
              opacity: [0.7, 0.9, 0.6, 0.7],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Flame glow */}
          <motion.circle
            cx="30" cy="118" r="8"
            fill="hsl(var(--library-gold) / 0.08)"
            animate={{
              r: [8, 11, 8],
              opacity: [0.08, 0.15, 0.08],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>

        {/* ── Shadow beneath fox ── */}
        <ellipse cx="55" cy="144" rx="30" ry="4" fill="hsl(20 30% 6% / 0.3)" />
      </svg>
    </motion.div>
  );
};

export default LibraryGuardian;
