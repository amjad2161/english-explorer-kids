import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";

interface Interactive3DMascotProps {
  mood?: "idle" | "wave" | "celebrate";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const sizeMap = { sm: 130, md: 200, lg: 280 };

const Interactive3DMascot = ({ mood = "idle", size = "md", onClick }: Interactive3DMascotProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isPoking, setIsPoking] = useState(false);
  const [pokeCount, setPokeCount] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const dim = sizeMap[size];

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springCfg = { stiffness: 200, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springCfg);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springCfg);
  const scaleVal = useSpring(1, { stiffness: 300, damping: 25 });

  // Natural blinking
  useEffect(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
    };
    const interval = setInterval(() => {
      blink();
      if (Math.random() > 0.7) setTimeout(blink, 280);
    }, 2800 + Math.random() * 2200);
    return () => clearInterval(interval);
  }, []);

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

  const glowStyle = mood === "celebrate"
    ? "radial-gradient(circle, hsl(var(--sunshine) / 0.22), hsl(var(--candy) / 0.12), transparent 65%)"
    : mood === "wave"
    ? "radial-gradient(circle, hsl(var(--sky) / 0.18), hsl(var(--primary) / 0.1), transparent 65%)"
    : "radial-gradient(circle, hsl(var(--primary) / 0.12), hsl(var(--lavender) / 0.06), transparent 65%)";

  return (
    <div className="relative inline-block" ref={ref}>
      {/* Mood-reactive glow */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: "240%", height: "240%", left: "-70%", top: "-70%", background: glowStyle, filter: "blur(30px)" }}
        animate={mood === "celebrate"
          ? { scale: [1, 1.25, 1.05, 1.2, 1], opacity: [0.5, 0.9, 0.6, 0.85, 0.5] }
          : mood === "wave"
          ? { scale: [1, 1.15, 1], opacity: [0.4, 0.65, 0.4] }
          : { scale: [1, 1.08, 1], opacity: [0.3, 0.45, 0.3] }
        }
        transition={{ duration: mood === "celebrate" ? 1.5 : mood === "wave" ? 3 : 5, repeat: Infinity, ease: "easeInOut" }}
      />
      {mood === "celebrate" && (
        <motion.div
          className="absolute rounded-full pointer-events-none border-2"
          style={{ width: "160%", height: "160%", left: "-30%", top: "-30%", borderColor: "hsl(var(--sunshine) / 0.25)" }}
          animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.4, 0, 0.4] }}
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
          className="absolute bottom-[-5%] left-[20%] right-[20%] h-[6%] rounded-[50%] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, hsl(var(--foreground) / 0.18), transparent 70%)", filter: "blur(8px)", transform: "translateZ(-20px)" }}
          animate={{ scaleX: [0.85, 1.1, 0.85], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Ultra-detailed SVG Owl */}
        <motion.svg
          viewBox="0 0 240 290"
          width={dim}
          height={dim}
          className="relative z-20 select-none pointer-events-none"
          style={{ filter: "drop-shadow(0 8px 24px hsl(var(--primary) / 0.18))", transform: "translateZ(40px)" }}
          animate={isPoking
            ? { scale: [1, 1.12, 0.94, 1.04, 1], rotate: [0, -8, 8, -3, 0] }
            : mood === "wave" ? { y: [0, -8, 0], rotate: [0, -3, 3, 0] }
            : mood === "celebrate" ? { y: [0, -14, 0], rotate: [0, -5, 5, -2, 0] }
            : { y: [0, -5, 0] }
          }
          transition={{ duration: isPoking ? 0.7 : mood === "idle" ? 3 : 1.2, repeat: isPoking ? 0 : Infinity, ease: "easeInOut" }}
        >
          <defs>
            {/* === BODY GRADIENTS === */}
            <radialGradient id="owlBody" cx="50%" cy="38%" r="58%" fx="48%" fy="35%">
              <stop offset="0%" stopColor="#D4975E" />
              <stop offset="30%" stopColor="#C47F45" />
              <stop offset="60%" stopColor="#A86830" />
              <stop offset="85%" stopColor="#8B5528" />
              <stop offset="100%" stopColor="#6D4420" />
            </radialGradient>
            <radialGradient id="owlBodyShadow" cx="50%" cy="70%" r="50%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="70%" stopColor="#5A3818" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3D2510" stopOpacity="0.5" />
            </radialGradient>
            <radialGradient id="owlBelly" cx="50%" cy="30%" r="55%" fx="45%" fy="28%">
              <stop offset="0%" stopColor="#FFF5E8" />
              <stop offset="25%" stopColor="#FFECD2" />
              <stop offset="55%" stopColor="#F5D5B0" />
              <stop offset="80%" stopColor="#E8C39E" />
              <stop offset="100%" stopColor="#D4A87A" />
            </radialGradient>
            <radialGradient id="headGrad" cx="50%" cy="42%" r="55%" fx="46%" fy="38%">
              <stop offset="0%" stopColor="#D8A060" />
              <stop offset="40%" stopColor="#C48545" />
              <stop offset="75%" stopColor="#A86830" />
              <stop offset="100%" stopColor="#7A5025" />
            </radialGradient>

            {/* === EYE GRADIENTS === */}
            <radialGradient id="eyeWhite" cx="45%" cy="38%" r="52%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#F8F5F0" />
              <stop offset="100%" stopColor="#EDE8E0" />
            </radialGradient>
            <radialGradient id="eyeWhiteShadow" cx="50%" cy="20%" r="50%">
              <stop offset="0%" stopColor="#D4C8B8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <radialGradient id="irisLeft" cx="42%" cy="36%" r="52%" fx="38%" fy="32%">
              <stop offset="0%" stopColor="#FFD060" />
              <stop offset="20%" stopColor="#F5B830" />
              <stop offset="45%" stopColor="#E8A020" />
              <stop offset="70%" stopColor="#D48818" />
              <stop offset="100%" stopColor="#B06A10" />
            </radialGradient>
            <radialGradient id="irisRight" cx="58%" cy="36%" r="52%" fx="62%" fy="32%">
              <stop offset="0%" stopColor="#FFD060" />
              <stop offset="20%" stopColor="#F5B830" />
              <stop offset="45%" stopColor="#E8A020" />
              <stop offset="70%" stopColor="#D48818" />
              <stop offset="100%" stopColor="#B06A10" />
            </radialGradient>
            <radialGradient id="pupilGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1A1008" />
              <stop offset="80%" stopColor="#0A0804" />
              <stop offset="100%" stopColor="#050300" />
            </radialGradient>
            <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFD060" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FFD060" stopOpacity="0" />
            </radialGradient>

            {/* === CAP GRADIENTS === */}
            <linearGradient id="capBase" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3D506E" />
              <stop offset="30%" stopColor="#2F3E58" />
              <stop offset="70%" stopColor="#243348" />
              <stop offset="100%" stopColor="#1A2538" />
            </linearGradient>
            <linearGradient id="capTop" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#4A6080" />
              <stop offset="50%" stopColor="#354D68" />
              <stop offset="100%" stopColor="#263A50" />
            </linearGradient>
            <linearGradient id="capHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* === BEAK === */}
            <linearGradient id="beakGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#F5B030" />
              <stop offset="40%" stopColor="#E89820" />
              <stop offset="100%" stopColor="#D08015" />
            </linearGradient>
            <linearGradient id="beakShadow" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="100%" stopColor="#A06010" stopOpacity="0.4" />
            </linearGradient>

            {/* === FEATHER PATTERNS === */}
            <pattern id="bodyFeathers" width="14" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(-3)">
              <ellipse cx="7" cy="8" rx="6.5" ry="7.5" fill="none" stroke="#8B5A2B" strokeWidth="0.5" opacity="0.18" />
              <ellipse cx="7" cy="8" rx="4" ry="5" fill="none" stroke="#A06830" strokeWidth="0.3" opacity="0.1" />
            </pattern>
            <pattern id="bellyFeathers" width="10" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(2)">
              <path d="M0 6 Q5 3 10 6" fill="none" stroke="#D4A874" strokeWidth="0.5" opacity="0.2" />
            </pattern>

            {/* === FILTERS === */}
            <filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
              <feOffset dx="0" dy="2" result="offsetBlur" />
              <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff" />
              <feFlood floodColor="#3D2510" floodOpacity="0.25" result="color" />
              <feComposite in2="shadowDiff" operator="in" />
              <feComposite in2="SourceGraphic" operator="over" />
            </filter>
            <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Cheek glow */}
            <radialGradient id="cheekBlush" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF9080" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#FFB088" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#FFB088" stopOpacity="0" />
            </radialGradient>

            {/* Rim light */}
            <linearGradient id="rimLight" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.06" />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* ════════ BODY ════════ */}
          <ellipse cx="120" cy="180" rx="62" ry="78" fill="url(#owlBody)" filter="url(#innerShadow)" />
          <ellipse cx="120" cy="180" rx="60" ry="76" fill="url(#bodyFeathers)" />
          <ellipse cx="120" cy="180" rx="62" ry="78" fill="url(#owlBodyShadow)" />
          {/* Rim light on body */}
          <ellipse cx="120" cy="180" rx="62" ry="78" fill="url(#rimLight)" />

          {/* Belly with feather scallops */}
          <ellipse cx="120" cy="192" rx="40" ry="52" fill="url(#owlBelly)" />
          <ellipse cx="120" cy="192" rx="38" ry="50" fill="url(#bellyFeathers)" />
          {/* Belly scallop lines - detailed */}
          {[0,1,2,3,4,5,6].map(i => (
            <path
              key={`scallop-${i}`}
              d={`M${84 + i*2} ${158 + i*12} Q${120} ${162 + i*12} ${156 - i*2} ${158 + i*12}`}
              fill="none" stroke="#D4A574" strokeWidth="0.6" opacity={0.3 - i*0.02}
            />
          ))}
          {/* Belly center highlight */}
          <ellipse cx="118" cy="180" rx="20" ry="30" fill="#FFFFFF" opacity="0.04" />

          {/* ════════ HEAD ════════ */}
          <ellipse cx="120" cy="105" rx="58" ry="50" fill="url(#headGrad)" filter="url(#innerShadow)" />
          <ellipse cx="120" cy="105" rx="56" ry="48" fill="url(#bodyFeathers)" />

          {/* Facial disc - lighter feather ring */}
          <ellipse cx="120" cy="108" rx="50" ry="40" fill="#C89858" opacity="0.25" />
          <ellipse cx="120" cy="108" rx="48" ry="38" fill="none" stroke="#B88548" strokeWidth="0.5" opacity="0.15" />

          {/* Head highlight */}
          <ellipse cx="108" cy="82" rx="20" ry="12" fill="#FFFFFF" opacity="0.06" transform="rotate(-12 108 82)" />

          {/* ════════ EAR TUFTS ════════ */}
          {/* Left tuft - multi-layered */}
          <path d="M68 74 Q60 42 72 58 Q64 48 70 68 Z" fill="#7A5025" />
          <path d="M70 72 Q63 46 74 60 Q66 50 72 66 Z" fill="#9B6834" />
          <path d="M71 70 Q65 50 75 62" fill="none" stroke="#B87840" strokeWidth="1.2" opacity="0.6" />
          <path d="M69 72 Q64 52 73 60" fill="none" stroke="#C88850" strokeWidth="0.6" opacity="0.3" />
          {/* Right tuft */}
          <path d="M172 74 Q180 42 168 58 Q176 48 170 68 Z" fill="#7A5025" />
          <path d="M170 72 Q177 46 166 60 Q174 50 168 66 Z" fill="#9B6834" />
          <path d="M169 70 Q175 50 165 62" fill="none" stroke="#B87840" strokeWidth="1.2" opacity="0.6" />
          <path d="M171 72 Q176 52 167 60" fill="none" stroke="#C88850" strokeWidth="0.6" opacity="0.3" />

          {/* ════════ EYES ════════ */}
          {/* Eye ambient glow */}
          <circle cx="92" cy="104" r="24" fill="url(#eyeGlow)" />
          <circle cx="148" cy="104" r="24" fill="url(#eyeGlow)" />

          {/* Left eye */}
          <g>
            {/* Eye socket shadow */}
            <ellipse cx="92" cy="106" rx="21" ry="22" fill="#6D4420" opacity="0.3" />
            {/* Eye white */}
            <ellipse cx="92" cy="104" rx="20" ry="21" fill="url(#eyeWhite)" stroke="#8B7355" strokeWidth="1.2" />
            <ellipse cx="92" cy="104" rx="20" ry="21" fill="url(#eyeWhiteShadow)" />

            {isBlinking ? (
              /* Blink - closed eye */
              <>
                <ellipse cx="92" cy="104" rx="18" ry="4" fill="#B87340" />
                <path d="M74 104 Q92 96 110 104" fill="none" stroke="#8B5A2B" strokeWidth="2" strokeLinecap="round" />
                <path d="M76 104 Q92 110 108 104" fill="none" stroke="#A06830" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
              </>
            ) : (
              <>
                {/* Iris */}
                <ellipse cx="90" cy="103" rx="13" ry="14" fill="url(#irisLeft)" />
                {/* Iris detail rings */}
                <ellipse cx="90" cy="103" rx="13" ry="14" fill="none" stroke="#C88018" strokeWidth="0.4" opacity="0.3" />
                <ellipse cx="90" cy="103" rx="9" ry="10" fill="none" stroke="#D49020" strokeWidth="0.3" opacity="0.2" />
                {/* Iris radial lines */}
                {[0,30,60,90,120,150,180,210,240,270,300,330].map(angle => (
                  <line
                    key={`iris-l-${angle}`}
                    x1={90 + Math.cos(angle * Math.PI/180) * 5}
                    y1={103 + Math.sin(angle * Math.PI/180) * 5.5}
                    x2={90 + Math.cos(angle * Math.PI/180) * 12}
                    y2={103 + Math.sin(angle * Math.PI/180) * 13}
                    stroke="#B07010" strokeWidth="0.3" opacity="0.15"
                  />
                ))}
                {/* Pupil */}
                <ellipse cx="88" cy="101" rx="5.5" ry="6" fill="url(#pupilGlow)" />
                {/* Primary catchlight */}
                <ellipse cx="85" cy="97" rx="3" ry="3.5" fill="#FFFFFF" opacity="0.92" />
                {/* Secondary catchlight */}
                <ellipse cx="94" cy="107" rx="1.5" ry="1.8" fill="#FFFFFF" opacity="0.45" />
                {/* Tertiary micro-catchlight */}
                <circle cx="87" cy="100" r="0.8" fill="#FFFFFF" opacity="0.3" />
              </>
            )}
          </g>

          {/* Right eye */}
          <g>
            <ellipse cx="148" cy="106" rx="21" ry="22" fill="#6D4420" opacity="0.3" />
            <ellipse cx="148" cy="104" rx="20" ry="21" fill="url(#eyeWhite)" stroke="#8B7355" strokeWidth="1.2" />
            <ellipse cx="148" cy="104" rx="20" ry="21" fill="url(#eyeWhiteShadow)" />

            {isBlinking ? (
              <>
                <ellipse cx="148" cy="104" rx="18" ry="4" fill="#B87340" />
                <path d="M130 104 Q148 96 166 104" fill="none" stroke="#8B5A2B" strokeWidth="2" strokeLinecap="round" />
                <path d="M132 104 Q148 110 164 104" fill="none" stroke="#A06830" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
              </>
            ) : (
              <>
                <ellipse cx="150" cy="103" rx="13" ry="14" fill="url(#irisRight)" />
                <ellipse cx="150" cy="103" rx="13" ry="14" fill="none" stroke="#C88018" strokeWidth="0.4" opacity="0.3" />
                <ellipse cx="150" cy="103" rx="9" ry="10" fill="none" stroke="#D49020" strokeWidth="0.3" opacity="0.2" />
                {[0,30,60,90,120,150,180,210,240,270,300,330].map(angle => (
                  <line
                    key={`iris-r-${angle}`}
                    x1={150 + Math.cos(angle * Math.PI/180) * 5}
                    y1={103 + Math.sin(angle * Math.PI/180) * 5.5}
                    x2={150 + Math.cos(angle * Math.PI/180) * 12}
                    y2={103 + Math.sin(angle * Math.PI/180) * 13}
                    stroke="#B07010" strokeWidth="0.3" opacity="0.15"
                  />
                ))}
                <ellipse cx="152" cy="101" rx="5.5" ry="6" fill="url(#pupilGlow)" />
                <ellipse cx="155" cy="97" rx="3" ry="3.5" fill="#FFFFFF" opacity="0.92" />
                <ellipse cx="146" cy="107" rx="1.5" ry="1.8" fill="#FFFFFF" opacity="0.45" />
                <circle cx="153" cy="100" r="0.8" fill="#FFFFFF" opacity="0.3" />
              </>
            )}
          </g>

          {/* Brow ridges - detailed */}
          <path d="M68 92 Q78 82 96 90" fill="none" stroke="#6D4420" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M70 91 Q80 83 94 89" fill="none" stroke="#8B5828" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
          <path d="M172 92 Q162 82 144 90" fill="none" stroke="#6D4420" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M170 91 Q160 83 146 89" fill="none" stroke="#8B5828" strokeWidth="1" strokeLinecap="round" opacity="0.4" />

          {/* Cheek blush */}
          <circle cx="72" cy="118" r="12" fill="url(#cheekBlush)" />
          <circle cx="168" cy="118" r="12" fill="url(#cheekBlush)" />

          {/* ════════ BEAK ════════ */}
          <g>
            {/* Beak shadow */}
            <path d="M112 124 L120 140 L128 124" fill="#8B5A2B" opacity="0.2" transform="translate(0, 2)" />
            {/* Main beak */}
            <path d="M112 122 L120 138 L128 122 Q120 127 112 122 Z" fill="url(#beakGrad)" />
            {/* Beak detail line */}
            <path d="M115 124 L120 136 L125 124" fill="none" stroke="#C87810" strokeWidth="0.6" opacity="0.5" />
            {/* Beak highlight */}
            <path d="M116 123 L120 128 L124 123" fill="#FFD060" opacity="0.3" />
            {/* Nostril dots */}
            <circle cx="117" cy="126" r="0.6" fill="#A06010" opacity="0.4" />
            <circle cx="123" cy="126" r="0.6" fill="#A06010" opacity="0.4" />
          </g>

          {/* Mouth line for mood */}
          {mood === "celebrate" && (
            <path d="M114 136 Q120 140 126 136" fill="none" stroke="#D08015" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
          )}

          {/* ════════ GRADUATION CAP ════════ */}
          <g>
            {/* Cap shadow on head */}
            <ellipse cx="120" cy="72" rx="46" ry="10" fill="#3D2510" opacity="0.15" />
            {/* Cap base */}
            <ellipse cx="120" cy="68" rx="46" ry="9" fill="url(#capBase)" />
            {/* Mortarboard top */}
            <polygon points="68,64 120,44 172,64 120,56" fill="url(#capTop)" />
            <polygon points="68,64 120,56 172,64 120,68" fill="url(#capBase)" />
            {/* Cap highlight */}
            <polygon points="78,62 120,46 150,60 120,54" fill="url(#capHighlight)" />
            {/* Cap edge */}
            <line x1="70" y1="64" x2="170" y2="64" stroke="#5A6D8A" strokeWidth="0.6" opacity="0.4" />

            {/* Tassel - detailed */}
            <path d="M120 54 Q100 54 82 54" stroke="#D4A830" strokeWidth="1.8" fill="none" />
            <path d="M82 54 Q76 62 72 78" stroke="#D4A830" strokeWidth="1.8" fill="none" />
            {/* Tassel knot */}
            <circle cx="120" cy="54" r="2.5" fill="#D4A830" />
            <circle cx="120" cy="54" r="1.5" fill="#E8C040" />
            {/* Tassel ball */}
            <circle cx="72" cy="80" r="4" fill="#E8C840" />
            <circle cx="72" cy="80" r="2.5" fill="#F0D850" opacity="0.6" />
            {/* Tassel threads */}
            <path d="M69 80 L66 92" stroke="#D4A830" strokeWidth="0.9" />
            <path d="M71 80 L70 93" stroke="#D4A830" strokeWidth="0.9" />
            <path d="M73 80 L73 92" stroke="#D4A830" strokeWidth="0.9" />
            <path d="M75 80 L77 91" stroke="#D4A830" strokeWidth="0.9" />
            {/* Thread ends */}
            {[66, 70, 73, 77].map((x, i) => (
              <circle key={`thread-${i}`} cx={x + (i === 0 ? 0 : i === 3 ? 0 : 0)} cy={91 + i * 0.5} r="0.8" fill="#D4A830" opacity="0.6" />
            ))}
          </g>

          {/* ════════ WINGS ════════ */}
          {/* Left wing - multi-layered */}
          <g>
            <path d="M60 145 Q42 168 48 202 Q52 192 56 198 Q54 182 60 170 Q56 178 62 186 Q58 165 64 155 Z"
              fill="#7A5025" />
            <path d="M62 148 Q46 170 50 198 Q54 190 56 194 Q54 180 60 168"
              fill="#8B5A2B" opacity="0.6" />
            {/* Wing feather lines */}
            <path d="M58 155 Q48 172 50 192" fill="none" stroke="#9B6834" strokeWidth="0.8" opacity="0.4" />
            <path d="M60 160 Q52 175 52 188" fill="none" stroke="#A07038" strokeWidth="0.6" opacity="0.3" />
            <path d="M62 165 Q56 178 56 185" fill="none" stroke="#A07038" strokeWidth="0.5" opacity="0.2" />
            {/* Wing highlight */}
            <path d="M62 148 Q52 162 54 175" fill="none" stroke="#C89050" strokeWidth="0.5" opacity="0.2" />
          </g>
          {/* Right wing */}
          <g>
            <path d="M180 145 Q198 168 192 202 Q188 192 184 198 Q186 182 180 170 Q184 178 178 186 Q182 165 176 155 Z"
              fill="#7A5025" />
            <path d="M178 148 Q194 170 190 198 Q186 190 184 194 Q186 180 180 168"
              fill="#8B5A2B" opacity="0.6" />
            <path d="M182 155 Q192 172 190 192" fill="none" stroke="#9B6834" strokeWidth="0.8" opacity="0.4" />
            <path d="M180 160 Q188 175 188 188" fill="none" stroke="#A07038" strokeWidth="0.6" opacity="0.3" />
            <path d="M178 165 Q184 178 184 185" fill="none" stroke="#A07038" strokeWidth="0.5" opacity="0.2" />
            <path d="M178 148 Q188 162 186 175" fill="none" stroke="#C89050" strokeWidth="0.5" opacity="0.2" />
          </g>

          {/* Wave wing animation overlay */}
          {mood === "wave" && (
            <g>
              <animateTransform attributeName="transform" type="rotate" values="0 56 160;-15 56 160;0 56 160;-15 56 160;0 56 160" dur="1.2s" repeatCount="indefinite" />
            </g>
          )}

          {/* ════════ FEET ════════ */}
          {/* Left foot */}
          <g>
            <rect x="98" y="248" width="7" height="12" rx="3.5" fill="#E89420" />
            <path d="M96 258 L88 270 L96 268 L94 274 L102 268 L100 274 L106 268 L104 260 Z" fill="#E89420" />
            <path d="M96 258 L104 260" stroke="#D07810" strokeWidth="0.6" opacity="0.5" />
            {/* Toe highlights */}
            <path d="M90 269 L93 267" stroke="#F5B040" strokeWidth="0.5" opacity="0.3" />
            <path d="M97 271 L99 269" stroke="#F5B040" strokeWidth="0.5" opacity="0.3" />
          </g>
          {/* Right foot */}
          <g>
            <rect x="135" y="248" width="7" height="12" rx="3.5" fill="#E89420" />
            <path d="M144 258 L152 270 L144 268 L146 274 L138 268 L140 274 L134 268 L136 260 Z" fill="#E89420" />
            <path d="M144 258 L136 260" stroke="#D07810" strokeWidth="0.6" opacity="0.5" />
            <path d="M150 269 L147 267" stroke="#F5B040" strokeWidth="0.5" opacity="0.3" />
            <path d="M143 271 L141 269" stroke="#F5B040" strokeWidth="0.5" opacity="0.3" />
          </g>

          {/* ════════ BODY DETAIL OVERLAYS ════════ */}
          {/* Subtle body highlight */}
          <ellipse cx="108" cy="160" rx="15" ry="25" fill="#FFFFFF" opacity="0.03" transform="rotate(-8 108 160)" />
          {/* Body rim light */}
          <path d="M62 130 Q58 180 82 245" fill="none" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.05" />
        </motion.svg>

        {/* Animated eye catchlight sparkle */}
        {!isBlinking && (
          <motion.svg
            viewBox="0 0 240 290"
            className="absolute inset-0 w-full h-full z-30 pointer-events-none"
            style={{ transform: "translateZ(50px)" }}
            animate={isPoking
              ? { scale: [1, 1.12, 0.94, 1.04, 1], rotate: [0, -8, 8, -3, 0] }
              : mood === "wave" ? { y: [0, -8, 0], rotate: [0, -3, 3, 0] }
              : mood === "celebrate" ? { y: [0, -14, 0], rotate: [0, -5, 5, -2, 0] }
              : { y: [0, -5, 0] }
            }
            transition={{ duration: isPoking ? 0.7 : mood === "idle" ? 3 : 1.2, repeat: isPoking ? 0 : Infinity, ease: "easeInOut" }}
          >
            {/* Animated catchlight shimmer */}
            <motion.ellipse
              cx="85" cy="97" rx="3" ry="3.5"
              fill="white" opacity={0.9}
              animate={{ opacity: [0.7, 1, 0.7], rx: [2.8, 3.2, 2.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.ellipse
              cx="155" cy="97" rx="3" ry="3.5"
              fill="white" opacity={0.9}
              animate={{ opacity: [0.7, 1, 0.7], rx: [2.8, 3.2, 2.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            />
          </motion.svg>
        )}

        {/* Celebrate mood sparkles */}
        {mood === "celebrate" && !isPoking && [0,1,2,3].map(i => (
          <motion.span
            key={`sparkle-${i}`}
            className="absolute pointer-events-none z-30"
            style={{ fontSize: dim * 0.09, left: `${15 + i * 22}%`, top: `${5 + (i % 2) * 18}%` }}
            animate={{ y: [0, -12, 0], opacity: [0.3, 0.8, 0.3], scale: [0.7, 1.1, 0.7], rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
          >
            ✨
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
