import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import owlPixar from "@/assets/owl-pixar.png";

interface Interactive3DMascotProps {
  mood?: "idle" | "wave" | "celebrate";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const sizeMap = { sm: 130, md: 200, lg: 280 };

/* ── SVG Wing (mirrored via scaleX) ── */
const Wing = ({ side, mood, isPoking }: { side: "left" | "right"; mood: string; isPoking: boolean }) => {
  const flip = side === "right" ? -1 : 1;
  const cx = side === "left" ? 38 : 162;

  const waveAnim = mood === "wave"
    ? { rotate: [0, -25 * flip, 15 * flip, -20 * flip, 0], y: [0, -4, 2, -3, 0] }
    : mood === "celebrate"
    ? { rotate: [0, -30 * flip, 20 * flip, -25 * flip, 10 * flip, 0], y: [0, -6, 3, -5, 2, 0] }
    : { rotate: [0, -4 * flip, 0, 3 * flip, 0], y: [0, -1, 0, 1, 0] };

  const pokingAnim = { rotate: [0, -35 * flip, 25 * flip, -15 * flip, 0], y: [0, -8, 4, -2, 0] };

  return (
    <motion.ellipse
      cx={cx} cy={95}
      rx="18" ry="28"
      fill="hsl(var(--primary) / 0.0)"
      stroke="none"
      style={{ originX: `${cx}px`, originY: "80px", transformOrigin: `${cx}px 80px` }}
      animate={isPoking ? pokingAnim : waveAnim}
      transition={{
        duration: isPoking ? 0.7 : mood === "idle" ? 4 : mood === "wave" ? 1.2 : 0.8,
        repeat: isPoking ? 0 : Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

/* ── Academic Cap Tassel ── */
const Tassel = ({ mood, isPoking }: { mood: string; isPoking: boolean }) => {
  const swingAnim = mood === "celebrate"
    ? { rotate: [0, 25, -20, 18, -10, 0], x: [0, 8, -6, 5, -3, 0] }
    : mood === "wave"
    ? { rotate: [0, 15, -12, 8, 0], x: [0, 5, -4, 2, 0] }
    : { rotate: [0, 6, -4, 3, 0], x: [0, 2, -1, 1, 0] };

  const pokingSwing = { rotate: [0, 35, -30, 20, -10, 0], x: [0, 10, -8, 5, -2, 0] };

  return (
    <motion.g style={{ originX: "108px", originY: "28px", transformOrigin: "108px 28px" }}
      animate={isPoking ? pokingSwing : swingAnim}
      transition={{
        duration: isPoking ? 0.7 : mood === "idle" ? 3.5 : 1.5,
        repeat: isPoking ? 0 : Infinity,
        ease: "easeInOut",
        delay: 0.1,
      }}
    >
      {/* Tassel string */}
      <motion.path
        d="M 108 28 Q 118 38 122 52"
        stroke="hsl(var(--sunshine))"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Tassel end */}
      <motion.circle
        cx="122" cy="54" r="4"
        fill="hsl(var(--sunshine))"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Tassel threads */}
      {[0, 1, 2].map(i => (
        <motion.line
          key={i}
          x1="122" y1="54"
          x2={120 + i * 2} y2="62"
          stroke="hsl(var(--sunshine) / 0.7)"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{ y2: [62, 65, 62], x2: [120 + i * 2, 119 + i * 2.5, 120 + i * 2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
        />
      ))}
    </motion.g>
  );
};

/* ── Blink animation for eyes ── */
const BlinkingEyes = ({ mood, isPoking }: { mood: string; isPoking: boolean }) => {
  // Eyelid that closes over the eye — simulates blink
  const blinkAnim = {
    scaleY: [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  };

  return (
    <>
      {/* Left eyelid blink */}
      <motion.ellipse
        cx="76" cy="68" rx="10" ry="8"
        fill="hsl(var(--primary) / 0.0)"
        style={{ originX: "76px", originY: "68px", transformOrigin: "76px 68px" }}
        animate={!isPoking ? blinkAnim : {}}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      {/* Right eyelid blink */}
      <motion.ellipse
        cx="122" cy="68" rx="10" ry="8"
        fill="hsl(var(--primary) / 0.0)"
        style={{ originX: "122px", originY: "68px", transformOrigin: "122px 68px" }}
        animate={!isPoking ? blinkAnim : {}}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Eye catchlight shimmer — left */}
      <motion.circle
        cx="76" cy="68" r="2.5"
        fill="white" opacity={0.8}
        animate={{
          opacity: [0.5, 1, 0.5],
          r: [2, 3, 2] as any,
          cy: mood === "wave" ? [68, 66, 68] : mood === "celebrate" ? [68, 65, 70, 68] : [68, 67, 68],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Eye catchlight shimmer — right */}
      <motion.circle
        cx="122" cy="68" r="2.5"
        fill="white" opacity={0.8}
        animate={{
          opacity: [0.5, 1, 0.5],
          r: [2, 3, 2] as any,
          cy: mood === "wave" ? [68, 66, 68] : mood === "celebrate" ? [68, 65, 70, 68] : [68, 67, 68],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      />

      {/* Pupil tracking — subtle size change by mood */}
      <motion.circle
        cx="76" cy="70" r="1.5"
        fill="hsl(var(--foreground) / 0.0)"
        animate={mood === "celebrate"
          ? { r: [1.5, 2.5, 1.5] as any, cy: [70, 68, 70] }
          : { r: [1.5, 1.8, 1.5] as any }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.circle
        cx="122" cy="70" r="1.5"
        fill="hsl(var(--foreground) / 0.0)"
        animate={mood === "celebrate"
          ? { r: [1.5, 2.5, 1.5] as any, cy: [70, 68, 70] }
          : { r: [1.5, 1.8, 1.5] as any }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      />
    </>
  );
};

/* ── Mouth expressions ── */
const MouthExpression = ({ mood, isPoking }: { mood: string; isPoking: boolean }) => {
  const smilePath = mood === "celebrate"
    ? "M 85 92 Q 99 108 113 92"   // Big open smile
    : mood === "wave"
    ? "M 88 92 Q 99 102 110 92"   // Friendly smile
    : "M 90 92 Q 99 98 108 92";   // Gentle smile

  const pokedPath = "M 86 90 Q 99 112 112 90"; // Surprised O

  return (
    <>
      <motion.path
        d={isPoking ? pokedPath : smilePath}
        stroke="hsl(var(--foreground) / 0.0)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        animate={mood === "celebrate" && !isPoking ? {
          d: [
            "M 85 92 Q 99 108 113 92",
            "M 85 92 Q 99 112 113 92",
            "M 85 92 Q 99 108 113 92",
          ]
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Tongue peek for celebrate */}
      {mood === "celebrate" && !isPoking && (
        <motion.ellipse
          cx="99" cy="100" rx="4" ry="3"
          fill="hsl(var(--candy) / 0.0)"
          animate={{ ry: [0, 3, 2, 3, 0], opacity: [0, 0.6, 0.4, 0.6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      )}
    </>
  );
};

const Interactive3DMascot = ({ mood = "idle", size = "md", onClick }: Interactive3DMascotProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isPoking, setIsPoking] = useState(false);
  const [pokeCount, setPokeCount] = useState(0);
  const dim = sizeMap[size];

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springCfg = { stiffness: 200, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springCfg);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springCfg);
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

  const glowBg = mood === "celebrate"
    ? "radial-gradient(circle, hsl(var(--sunshine) / 0.22), hsl(var(--candy) / 0.12), transparent 60%)"
    : mood === "wave"
    ? "radial-gradient(circle, hsl(var(--sky) / 0.18), hsl(var(--primary) / 0.08), transparent 60%)"
    : "radial-gradient(circle, hsl(var(--primary) / 0.1), hsl(var(--lavender) / 0.05), transparent 60%)";

  const bodyAnim = isPoking
    ? { scale: [1, 1.1, 0.95, 1.03, 1], rotate: [0, -6, 6, -2, 0] }
    : mood === "wave" ? { y: [0, -8, 0], rotate: [0, -2, 2, 0] }
    : mood === "celebrate" ? { y: [0, -12, 0], rotate: [0, -4, 4, -1, 0] }
    : { y: [0, -4, 0] };

  const bodyTransition = {
    duration: isPoking ? 0.7 : mood === "idle" ? 3 : 1.2,
    repeat: isPoking ? 0 : Infinity,
    ease: "easeInOut" as const,
  };

  return (
    <div className="relative inline-block" ref={ref}>
      {/* Mood-reactive glow */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: "240%", height: "240%", left: "-70%", top: "-70%", background: glowBg, filter: "blur(30px)" }}
        animate={mood === "celebrate"
          ? { scale: [1, 1.2, 1.05, 1.18, 1], opacity: [0.5, 0.85, 0.55, 0.8, 0.5] }
          : mood === "wave"
          ? { scale: [1, 1.12, 1], opacity: [0.4, 0.6, 0.4] }
          : { scale: [1, 1.06, 1], opacity: [0.3, 0.42, 0.3] }
        }
        transition={{ duration: mood === "celebrate" ? 1.5 : mood === "wave" ? 3 : 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {mood === "celebrate" && (
        <motion.div
          className="absolute rounded-full pointer-events-none border-2"
          style={{ width: "160%", height: "160%", left: "-30%", top: "-30%", borderColor: "hsl(var(--sunshine) / 0.2)" }}
          animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
      )}

      {/* 3D interactive container */}
      <motion.div
        className="relative z-10 cursor-pointer"
        style={{ width: dim, height: dim, rotateX, rotateY, scale: scaleVal, transformStyle: "preserve-3d", perspective: 800 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        whileTap={{ scale: 0.93 }}
      >
        {/* Ground shadow */}
        <motion.div
          className="absolute bottom-[-4%] left-[20%] right-[20%] h-[6%] rounded-[50%] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, hsl(var(--foreground) / 0.15), transparent 70%)", filter: "blur(8px)", transform: "translateZ(-20px)" }}
          animate={{ scaleX: [0.9, 1.1, 0.9], opacity: [0.12, 0.25, 0.12] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Pixar Owl Image — blended into background */}
        <motion.img
          src={owlPixar}
          alt="English Fun Owl"
          className="w-full h-full object-contain relative z-20 select-none pointer-events-none"
          draggable={false}
          style={{
            filter: `drop-shadow(0 8px 28px hsl(var(--primary) / 0.2)) brightness(1.05)`,
            transform: "translateZ(40px)",
            WebkitMaskImage: "radial-gradient(ellipse 56% 58% at 50% 45%, black 55%, rgba(0,0,0,0.8) 65%, rgba(0,0,0,0.4) 75%, transparent 88%)",
            maskImage: "radial-gradient(ellipse 56% 58% at 50% 45%, black 55%, rgba(0,0,0,0.8) 65%, rgba(0,0,0,0.4) 75%, transparent 88%)",
          }}
          animate={bodyAnim}
          transition={bodyTransition}
        />

        {/* SVG animated overlays — eyes, wings, tassel, mouth */}
        <motion.svg
          viewBox="0 0 200 200"
          className="absolute inset-0 w-full h-full z-30 pointer-events-none select-none"
          style={{ transform: "translateZ(50px)" }}
          animate={bodyAnim}
          transition={bodyTransition}
        >
          {/* Wings */}
          <Wing side="left" mood={mood} isPoking={isPoking} />
          <Wing side="right" mood={mood} isPoking={isPoking} />

          {/* Academic cap tassel */}
          <Tassel mood={mood} isPoking={isPoking} />

          {/* Eyes with blink + tracking */}
          <BlinkingEyes mood={mood} isPoking={isPoking} />

          {/* Mouth expression */}
          <MouthExpression mood={mood} isPoking={isPoking} />

          {/* Celebrate cheek blush */}
          {mood === "celebrate" && (
            <>
              <motion.circle cx="62" cy="84" r="9" fill="#FF9999" opacity={0}
                animate={{ opacity: [0, 0.25, 0.1, 0.25, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.circle cx="138" cy="84" r="9" fill="#FF9999" opacity={0}
                animate={{ opacity: [0, 0.25, 0.1, 0.25, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
              />
            </>
          )}

          {/* Poke — surprised eyebrows */}
          {isPoking && (
            <>
              <motion.line x1="66" y1="58" x2="86" y2="56"
                stroke="hsl(var(--foreground) / 0.0)" strokeWidth="2.5" strokeLinecap="round"
                initial={{ y: 0 }} animate={{ y: [0, -5, -3] }}
                transition={{ duration: 0.3 }}
              />
              <motion.line x1="132" y1="58" x2="112" y2="56"
                stroke="hsl(var(--foreground) / 0.0)" strokeWidth="2.5" strokeLinecap="round"
                initial={{ y: 0 }} animate={{ y: [0, -5, -3] }}
                transition={{ duration: 0.3 }}
              />
            </>
          )}
        </motion.svg>

        {/* Floating sparkles for celebrate */}
        {mood === "celebrate" && !isPoking && [0, 1, 2, 3].map(i => (
          <motion.span
            key={`sp-${i}`}
            className="absolute pointer-events-none z-30"
            style={{ fontSize: dim * 0.08, left: `${15 + i * 22}%`, top: `${5 + (i % 2) * 18}%` }}
            animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.1, 0.8], rotate: [0, 12, -12, 0] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.35 }}
          >
            ✨
          </motion.span>
        ))}

        {/* Musical notes for wave */}
        {mood === "wave" && !isPoking && [0, 1].map(i => (
          <motion.span
            key={`note-${i}`}
            className="absolute pointer-events-none z-30"
            style={{ fontSize: dim * 0.07, right: `${5 + i * 12}%`, top: `${15 + i * 10}%` }}
            animate={{ y: [0, -15, 0], opacity: [0, 0.6, 0], rotate: [0, 15, -10, 0], x: [0, 8, -4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 + i * 0.8 }}
          >
            {i === 0 ? "🎵" : "♪"}
          </motion.span>
        ))}

        {/* Burst particles on click */}
        {isPoking && sparkles.map((sp, i) => (
          <motion.span
            key={`${pokeCount}-${i}`}
            className="absolute pointer-events-none z-30"
            style={{ left: "50%", top: "40%", fontSize: dim * 0.12, transform: "translateZ(50px)" }}
            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
            animate={{ opacity: 0, scale: [0, 1.6, 0], x: Math.cos((i * 60) * Math.PI / 180) * dim * 0.45, y: Math.sin((i * 60) * Math.PI / 180) * dim * 0.45 - 15 }}
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
