import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState, useCallback } from "react";

interface Interactive3DMascotProps {
  mood?: "idle" | "wave" | "celebrate";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const sizeMap = { sm: 120, md: 180, lg: 240 };

const Interactive3DMascot = ({ mood = "idle", size = "md", onClick }: Interactive3DMascotProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isPoking, setIsPoking] = useState(false);
  const [pokeCount, setPokeCount] = useState(0);
  const dim = sizeMap[size];

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springCfg = { stiffness: 200, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springCfg);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springCfg);
  const scaleVal = useSpring(1, { stiffness: 300, damping: 25 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0); mouseY.set(0); scaleVal.set(1);
  }, [mouseX, mouseY, scaleVal]);

  const handleClick = useCallback(() => {
    setIsPoking(true);
    setPokeCount(c => c + 1);
    scaleVal.set(1.1);
    setTimeout(() => { scaleVal.set(1); setIsPoking(false); }, 700);
    onClick?.();
  }, [onClick, scaleVal]);

  const sparkles = ["✨", "💫", "⭐", "🌟", "📚", "🎓"];

  return (
    <div className="relative inline-block" ref={ref}>
      {/* Mood-reactive glow */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "200%", height: "200%", left: "-50%", top: "-50%",
          background: mood === "celebrate"
            ? "radial-gradient(circle, hsl(var(--sunshine) / 0.18), hsl(var(--candy) / 0.1), transparent 60%)"
            : mood === "wave"
            ? "radial-gradient(circle, hsl(var(--sky) / 0.15), hsl(var(--primary) / 0.08), transparent 60%)"
            : "radial-gradient(circle, hsl(var(--primary) / 0.1), hsl(var(--lavender) / 0.05), transparent 60%)",
          filter: mood === "celebrate" ? "blur(25px)" : "blur(30px)",
        }}
        animate={mood === "celebrate"
          ? { scale: [1, 1.25, 1.05, 1.2, 1], opacity: [0.4, 0.8, 0.5, 0.75, 0.4] }
          : mood === "wave"
          ? { scale: [1, 1.15, 1], opacity: [0.35, 0.6, 0.35] }
          : { scale: [1, 1.08, 1], opacity: [0.25, 0.4, 0.25] }
        }
        transition={{
          duration: mood === "celebrate" ? 1.5 : mood === "wave" ? 3 : 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Secondary pulse ring for celebrate */}
      {mood === "celebrate" && (
        <motion.div
          className="absolute rounded-full pointer-events-none border-2"
          style={{
            width: "140%", height: "140%", left: "-20%", top: "-20%",
            borderColor: "hsl(var(--sunshine) / 0.2)",
          }}
          animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
      )}

      {/* 3D interactive container */}
      <motion.div
        className="relative z-10 cursor-pointer"
        style={{
          width: dim, height: dim,
          rotateX, rotateY, scale: scaleVal,
          transformStyle: "preserve-3d",
          perspective: 800,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        whileTap={{ scale: 0.93 }}
      >
        {/* Ground shadow */}
        <motion.div
          className="absolute bottom-[-6%] left-[22%] right-[22%] h-[6%] rounded-[50%] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, hsl(var(--foreground) / 0.12), transparent 70%)",
            filter: "blur(6px)",
            transform: "translateZ(-20px)",
          }}
          animate={{ scaleX: [0.85, 1.05, 0.85], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* SVG Owl Character */}
        <motion.svg
          viewBox="0 0 200 240"
          width={dim}
          height={dim}
          className="relative z-20 select-none pointer-events-none"
          style={{
            filter: "drop-shadow(0 6px 20px hsl(var(--primary) / 0.15))",
            transform: "translateZ(40px)",
          }}
          animate={isPoking
            ? { scale: [1, 1.12, 0.94, 1.04, 1], rotate: [0, -8, 8, -3, 0] }
            : mood === "wave"
            ? { y: [0, -8, 0], rotate: [0, -3, 3, 0] }
            : mood === "celebrate"
            ? { y: [0, -14, 0], rotate: [0, -5, 5, -2, 0] }
            : { y: [0, -4, 0] }
          }
          transition={{
            duration: isPoking ? 0.7 : mood === "idle" ? 3 : 1.2,
            repeat: isPoking ? 0 : Infinity,
            ease: "easeInOut",
          }}
        >
          <defs>
            {/* Feather gradients */}
            <radialGradient id="bodyGrad" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#D4915C" />
              <stop offset="45%" stopColor="#B87340" />
              <stop offset="100%" stopColor="#8B5A2B" />
            </radialGradient>
            <radialGradient id="bellyGrad" cx="50%" cy="35%" r="50%">
              <stop offset="0%" stopColor="#FFECD2" />
              <stop offset="60%" stopColor="#F5D5B0" />
              <stop offset="100%" stopColor="#E8C39E" />
            </radialGradient>
            <radialGradient id="eyeGrad" cx="45%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F0EDE8" />
            </radialGradient>
            <radialGradient id="irisGrad" cx="42%" cy="38%" r="50%">
              <stop offset="0%" stopColor="#F5A623" />
              <stop offset="50%" stopColor="#E8941E" />
              <stop offset="100%" stopColor="#C67A14" />
            </radialGradient>
            <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3D4F6E" />
              <stop offset="50%" stopColor="#2C3A52" />
              <stop offset="100%" stopColor="#1E2A3C" />
            </linearGradient>
            <linearGradient id="capTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4A5D7A" />
              <stop offset="100%" stopColor="#2C3A52" />
            </linearGradient>
            <radialGradient id="cheekGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFB088" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FFB088" stopOpacity="0" />
            </radialGradient>
            {/* Feather texture pattern */}
            <pattern id="featherPat" width="12" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-5)">
              <ellipse cx="6" cy="7" rx="5.5" ry="6.5" fill="none" stroke="#A06830" strokeWidth="0.4" opacity="0.2" />
            </pattern>
          </defs>

          {/* ── BODY ── */}
          <ellipse cx="100" cy="148" rx="58" ry="72" fill="url(#bodyGrad)" />
          {/* Feather texture overlay */}
          <ellipse cx="100" cy="148" rx="56" ry="70" fill="url(#featherPat)" />

          {/* Belly */}
          <ellipse cx="100" cy="158" rx="38" ry="48" fill="url(#bellyGrad)" />
          {/* Belly feather lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <path
              key={`bf-${i}`}
              d={`M${72 + i * 4} ${140 + i * 12} Q${100} ${144 + i * 12} ${128 - i * 4} ${140 + i * 12}`}
              fill="none"
              stroke="#D4A574"
              strokeWidth="0.6"
              opacity="0.35"
            />
          ))}

          {/* ── HEAD (wider than body for owl look) ── */}
          <ellipse cx="100" cy="88" rx="52" ry="44" fill="url(#bodyGrad)" />
          <ellipse cx="100" cy="88" rx="50" ry="42" fill="url(#featherPat)" />

          {/* Ear tufts */}
          <path d="M56 62 Q50 38 62 50 Q56 46 60 60 Z" fill="#9B6834" />
          <path d="M58 61 Q53 42 63 52" fill="none" stroke="#B87840" strokeWidth="1.5" />
          <path d="M144 62 Q150 38 138 50 Q144 46 140 60 Z" fill="#9B6834" />
          <path d="M142 61 Q147 42 137 52" fill="none" stroke="#B87840" strokeWidth="1.5" />

          {/* Facial disc (lighter feather ring around eyes) */}
          <ellipse cx="100" cy="90" rx="46" ry="36" fill="#C8935A" opacity="0.3" />

          {/* ── EYES ── */}
          {/* Left eye */}
          <ellipse cx="78" cy="88" rx="18" ry="19" fill="url(#eyeGrad)" stroke="#8B7355" strokeWidth="1" />
          <ellipse cx="77" cy="87" rx="11" ry="12" fill="url(#irisGrad)" />
          <ellipse cx="75" cy="85" rx="4.5" ry="5" fill="#1A1A1A" />
          <ellipse cx="73.5" cy="83" rx="2" ry="2.2" fill="#FFFFFF" opacity="0.9" />
          <ellipse cx="78" cy="88" rx="1" ry="1.2" fill="#FFFFFF" opacity="0.4" />

          {/* Right eye */}
          <ellipse cx="122" cy="88" rx="18" ry="19" fill="url(#eyeGrad)" stroke="#8B7355" strokeWidth="1" />
          <ellipse cx="123" cy="87" rx="11" ry="12" fill="url(#irisGrad)" />
          <ellipse cx="125" cy="85" rx="4.5" ry="5" fill="#1A1A1A" />
          <ellipse cx="126.5" cy="83" rx="2" ry="2.2" fill="#FFFFFF" opacity="0.9" />
          <ellipse cx="122" cy="88" rx="1" ry="1.2" fill="#FFFFFF" opacity="0.4" />

          {/* Brow ridges */}
          <path d="M58 78 Q68 70 80 76" fill="none" stroke="#7A5025" strokeWidth="2" strokeLinecap="round" />
          <path d="M142 78 Q132 70 120 76" fill="none" stroke="#7A5025" strokeWidth="2" strokeLinecap="round" />

          {/* Cheek glow */}
          <circle cx="62" cy="100" r="10" fill="url(#cheekGlow)" />
          <circle cx="138" cy="100" r="10" fill="url(#cheekGlow)" />

          {/* ── BEAK ── */}
          <path d="M94 102 L100 114 L106 102 Q100 106 94 102 Z" fill="#E8941E" />
          <path d="M96 104 L100 112 L104 104" fill="none" stroke="#D4820A" strokeWidth="0.5" />
          {/* Beak highlight */}
          <path d="M97 103 L100 106 L103 103" fill="#F5B94E" opacity="0.4" />

          {/* ── GRADUATION CAP ── */}
          {/* Cap base */}
          <ellipse cx="100" cy="58" rx="42" ry="8" fill="url(#capGrad)" />
          {/* Cap top (mortarboard) */}
          <polygon points="54,54 100,38 146,54 100,48" fill="url(#capTopGrad)" />
          <polygon points="54,54 100,48 146,54 100,58" fill="url(#capGrad)" />
          {/* Cap edge highlight */}
          <line x1="56" y1="54" x2="144" y2="54" stroke="#5A6D8A" strokeWidth="0.5" opacity="0.5" />
          {/* Tassel */}
          <line x1="100" y1="46" x2="68" y2="46" stroke="#C9A830" strokeWidth="1.5" />
          <line x1="68" y1="46" x2="62" y2="64" stroke="#C9A830" strokeWidth="1.5" />
          <circle cx="62" cy="66" r="3" fill="#E8C840" />
          <circle cx="100" cy="46" r="2" fill="#C9A830" />
          {/* Tassel threads */}
          <path d="M60 66 L58 74" stroke="#C9A830" strokeWidth="0.8" />
          <path d="M62 66 L62 75" stroke="#C9A830" strokeWidth="0.8" />
          <path d="M64 66 L66 74" stroke="#C9A830" strokeWidth="0.8" />

          {/* ── WINGS ── */}
          {/* Left wing */}
          <path d="M44 120 Q30 140 36 170 Q40 162 44 168 Q42 155 48 145 Q44 150 50 158 Q48 140 52 132 Z"
            fill="#9B6834" />
          <path d="M44 130 Q38 145 40 160" fill="none" stroke="#B87840" strokeWidth="0.8" opacity="0.5" />
          {/* Right wing */}
          <path d="M156 120 Q170 140 164 170 Q160 162 156 168 Q158 155 152 145 Q156 150 150 158 Q152 140 148 132 Z"
            fill="#9B6834" />
          <path d="M156 130 Q162 145 160 160" fill="none" stroke="#B87840" strokeWidth="0.8" opacity="0.5" />

          {/* ── FEET ── */}
          {/* Left foot */}
          <g>
            <path d="M78 214 L72 226 L78 224 L76 228 L82 224 L80 228 L86 224 L84 218 Z" fill="#E8941E" />
            <path d="M78 214 L84 218" stroke="#D4820A" strokeWidth="0.5" />
          </g>
          {/* Right foot */}
          <g>
            <path d="M122 214 L116 224 L120 228 L118 224 L124 228 L122 224 L128 226 L122 218 Z" fill="#E8941E" />
            <path d="M122 214 L116 218" stroke="#D4820A" strokeWidth="0.5" />
          </g>
          {/* Legs */}
          <rect x="80" y="206" width="6" height="10" rx="3" fill="#E8941E" />
          <rect x="114" y="206" width="6" height="10" rx="3" fill="#E8941E" />

          {/* ── Subtle shine on head ── */}
          <ellipse cx="88" cy="68" rx="12" ry="6" fill="#FFFFFF" opacity="0.06" transform="rotate(-15 88 68)" />
        </motion.svg>

        {/* Burst particles on click */}
        {isPoking && sparkles.map((sp, i) => (
          <motion.span
            key={`${pokeCount}-${i}`}
            className="absolute pointer-events-none z-30"
            style={{
              left: "50%", top: "40%",
              fontSize: dim * 0.12,
              transform: "translateZ(50px)",
            }}
            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: 0,
              scale: [0, 1.6, 0],
              x: Math.cos((i * 60) * Math.PI / 180) * dim * 0.45,
              y: Math.sin((i * 60) * Math.PI / 180) * dim * 0.45 - 15,
            }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {sp}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
};

export default Interactive3DMascot;
