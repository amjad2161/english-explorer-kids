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
        bottom: "6%",
        right: "5%",
        width: 130,
        height: 170,
        zIndex: 2,
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.8, delay: 1.5, ease: "easeOut" }}
    >
      {/* Ambient glow around the guardian */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 160,
          height: 120,
          left: -15,
          bottom: -10,
          background: "radial-gradient(ellipse, hsl(var(--library-gold) / 0.08), transparent 70%)",
          filter: "blur(25px)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg
        viewBox="0 0 130 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 6px 16px hsl(20 30% 8% / 0.6))" }}
      >
        {/* ── Tail (behind body) ── */}
        <motion.path
          d="M90 140 Q118 122 112 98 Q106 80 95 88 Q84 94 80 116 Q77 128 90 140Z"
          fill="hsl(25 55% 35%)"
          stroke="hsl(30 45% 25%)"
          strokeWidth="0.5"
          animate={{ d: [
            "M90 140 Q118 122 112 98 Q106 80 95 88 Q84 94 80 116 Q77 128 90 140Z",
            "M90 140 Q122 116 116 92 Q110 74 97 84 Q86 90 81 112 Q78 124 90 140Z",
            "M90 140 Q118 122 112 98 Q106 80 95 88 Q84 94 80 116 Q77 128 90 140Z",
          ]}}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Tail tip — white */}
        <motion.path
          d="M112 98 Q106 80 97 86 Q104 82 110 95Z"
          fill="hsl(40 35% 80%)"
          opacity="0.7"
          animate={{ d: [
            "M112 98 Q106 80 97 86 Q104 82 110 95Z",
            "M116 92 Q110 74 99 82 Q106 78 114 89Z",
            "M112 98 Q106 80 97 86 Q104 82 110 95Z",
          ]}}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* ── Body — sitting fox shape ── */}
        <motion.ellipse
          cx="60" cy="128" rx="30" ry="24"
          fill="hsl(25 50% 32%)"
          stroke="hsl(28 40% 22%)"
          strokeWidth="0.5"
          animate={{ ry: [24, 25, 24] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Chest/belly — creamy white */}
        <ellipse cx="60" cy="133" rx="18" ry="15" fill="hsl(40 40% 78%)" opacity="0.25" />

        {/* ── Scarf / bandana — library keeper mark ── */}
        <motion.path
          d="M42 108 Q60 114 78 108 Q76 118 60 120 Q44 118 42 108Z"
          fill="hsl(350 50% 35%)"
          opacity="0.7"
          animate={{ d: [
            "M42 108 Q60 114 78 108 Q76 118 60 120 Q44 118 42 108Z",
            "M42 107 Q60 113 78 107 Q76 117 60 119 Q44 117 42 107Z",
            "M42 108 Q60 114 78 108 Q76 118 60 120 Q44 118 42 108Z",
          ]}}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Scarf knot */}
        <circle cx="72" cy="115" r="3" fill="hsl(350 45% 30%)" opacity="0.7" />

        {/* ── Head ── */}
        <motion.g
          animate={{ y: [0, -2, 0], rotate: [0, 1, -0.5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "60px 90px" }}
        >
          {/* Head shape */}
          <ellipse cx="60" cy="88" rx="24" ry="22" fill="hsl(25 50% 35%)" />
          
          {/* Face lighter area */}
          <ellipse cx="60" cy="94" rx="16" ry="13" fill="hsl(40 45% 60%)" opacity="0.3" />

          {/* ── Left ear ── */}
          <motion.g
            animate={{ rotate: [0, -5, 0, 4, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            style={{ transformOrigin: "42px 75px" }}
          >
            <path d="M42 75 L32 50 L50 70Z" fill="hsl(25 50% 32%)" stroke="hsl(28 40% 22%)" strokeWidth="0.5" />
            <path d="M43 73 L36 56 L48 69Z" fill="hsl(350 40% 50%)" opacity="0.3" />
          </motion.g>

          {/* ── Right ear ── */}
          <motion.g
            animate={{ rotate: [0, 4, 0, -4, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            style={{ transformOrigin: "78px 75px" }}
          >
            <path d="M78 75 L88 50 L70 70Z" fill="hsl(25 50% 32%)" stroke="hsl(28 40% 22%)" strokeWidth="0.5" />
            <path d="M77 73 L84 56 L72 69Z" fill="hsl(350 40% 50%)" opacity="0.3" />
          </motion.g>

          {/* ── Eyes ── */}
          {/* Left eye */}
          <ellipse cx="50" cy="86" rx="4.5" ry="5" fill="hsl(25 30% 10%)" />
          <ellipse cx="50" cy="86" rx="3.5" ry="4" fill="hsl(38 70% 40%)" />
          <circle cx="50" cy="85.5" r="2" fill="hsl(25 30% 10%)" />
          <motion.circle cx="51.5" cy="84.5" r="1" fill="white" opacity="0.85"
            animate={{ opacity: [0.85, 0.4, 0.85] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Right eye */}
          <ellipse cx="70" cy="86" rx="4.5" ry="5" fill="hsl(25 30% 10%)" />
          <ellipse cx="70" cy="86" rx="3.5" ry="4" fill="hsl(38 70% 40%)" />
          <circle cx="70" cy="85.5" r="2" fill="hsl(25 30% 10%)" />
          <motion.circle cx="71.5" cy="84.5" r="1" fill="white" opacity="0.85"
            animate={{ opacity: [0.85, 0.4, 0.85] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          />

          {/* ── Blink overlay ── */}
          <motion.rect x="44" y="80" width="13" height="11" rx="5"
            fill="hsl(25 50% 35%)"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            style={{ transformOrigin: "50px 86px" }}
          />
          <motion.rect x="63" y="80" width="13" height="11" rx="5"
            fill="hsl(25 50% 35%)"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            style={{ transformOrigin: "70px 86px" }}
          />

          {/* ── Nose ── */}
          <ellipse cx="60" cy="93" rx="3" ry="2" fill="hsl(350 30% 22%)" />
          <ellipse cx="59.3" cy="92.3" rx="1.2" ry="0.7" fill="hsl(350 20% 38%)" opacity="0.5" />

          {/* ── Mouth — gentle smile ── */}
          <path d="M55 96 Q60 100 65 96" stroke="hsl(25 30% 18%)" strokeWidth="0.9" fill="none" strokeLinecap="round" />

          {/* ── Whiskers ── */}
          <motion.g
            animate={{ x: [0, 0.7, -0.5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <line x1="42" y1="91" x2="24" y2="88" stroke="hsl(35 30% 50%)" strokeWidth="0.4" opacity="0.5" />
            <line x1="42" y1="94" x2="22" y2="95" stroke="hsl(35 30% 50%)" strokeWidth="0.4" opacity="0.4" />
            <line x1="78" y1="91" x2="96" y2="88" stroke="hsl(35 30% 50%)" strokeWidth="0.4" opacity="0.5" />
            <line x1="78" y1="94" x2="98" y2="95" stroke="hsl(35 30% 50%)" strokeWidth="0.4" opacity="0.4" />
          </motion.g>

          {/* Cheek marks — cute detail */}
          <circle cx="43" cy="92" r="2.5" fill="hsl(350 45% 55%)" opacity="0.12" />
          <circle cx="77" cy="92" r="2.5" fill="hsl(350 45% 55%)" opacity="0.12" />
        </motion.g>

        {/* ── Front paws ── */}
        <ellipse cx="44" cy="148" rx="9" ry="5.5" fill="hsl(25 45% 30%)" />
        <ellipse cx="76" cy="148" rx="9" ry="5.5" fill="hsl(25 45% 30%)" />
        <ellipse cx="44" cy="149" rx="5.5" ry="3" fill="hsl(40 35% 60%)" opacity="0.2" />
        <ellipse cx="76" cy="149" rx="5.5" ry="3" fill="hsl(40 35% 60%)" opacity="0.2" />

        {/* ── Lantern held by the fox ── */}
        <motion.g
          animate={{ rotate: [0, 2.5, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "32px 118px" }}
        >
          {/* Lantern handle */}
          <path d="M32 118 Q30 112 32 106 Q34 112 32 118" stroke="hsl(35 40% 40%)" strokeWidth="1.2" fill="none" />
          {/* Lantern body */}
          <rect x="25" y="118" width="14" height="18" rx="2.5" fill="hsl(35 30% 22%)" stroke="hsl(35 40% 35%)" strokeWidth="0.5" />
          {/* Lantern glass */}
          <rect x="27" y="120" width="10" height="14" rx="1.5" fill="hsl(40 80% 55% / 0.15)" />
          {/* Lantern flame */}
          <motion.ellipse
            cx="32" cy="127"
            rx="2.8" ry="4.5"
            fill="hsl(var(--library-gold) / 0.75)"
            animate={{
              ry: [4.5, 5.5, 3.8, 4.5],
              rx: [2.8, 2.2, 3.2, 2.8],
              opacity: [0.75, 0.95, 0.6, 0.75],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Flame inner core */}
          <motion.ellipse
            cx="32" cy="126"
            rx="1.2" ry="2.5"
            fill="hsl(50 90% 85% / 0.6)"
            animate={{ ry: [2.5, 3, 2, 2.5], opacity: [0.6, 0.8, 0.5, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Flame glow — large */}
          <motion.circle
            cx="32" cy="127" r="10"
            fill="hsl(var(--library-gold) / 0.06)"
            animate={{ r: [10, 14, 10], opacity: [0.06, 0.12, 0.06] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>

        {/* ── Shadow beneath fox ── */}
        <ellipse cx="60" cy="154" rx="34" ry="5" fill="hsl(20 30% 6% / 0.35)" />
      </svg>
    </motion.div>
  );
};

export default LibraryGuardian;
