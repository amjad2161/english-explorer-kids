import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";

interface Interactive3DMascotProps {
  mood?: "idle" | "wave" | "celebrate";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const sizeMap = {
  sm: 120,
  md: 180,
  lg: 240,
};

const Interactive3DMascot = ({ mood = "idle", size = "md", onClick }: Interactive3DMascotProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isPoking, setIsPoking] = useState(false);
  const [pokeCount, setPokeCount] = useState(0);
  const [blinkState, setBlinkState] = useState(false);
  const [eyeTarget, setEyeTarget] = useState({ x: 0, y: 0 });
  const dim = sizeMap[size];

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 200, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), springConfig);
  const scaleVal = useSpring(1, { stiffness: 300, damping: 25 });

  // Blinking
  useEffect(() => {
    const blink = () => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 150);
    };
    const interval = setInterval(blink, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width - 0.5;
    const my = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(mx);
    mouseY.set(my);
    setEyeTarget({ x: mx * 6, y: my * 4 });
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0); mouseY.set(0); scaleVal.set(1);
    setEyeTarget({ x: 0, y: 0 });
  }, [mouseX, mouseY, scaleVal]);

  const handleClick = useCallback(() => {
    setIsPoking(true);
    setPokeCount(c => c + 1);
    scaleVal.set(1.12);
    setTimeout(() => { scaleVal.set(1); setIsPoking(false); }, 800);
    onClick?.();
  }, [onClick, scaleVal]);

  const sparkles = ["✨", "💫", "⭐", "🌟", "📚", "🎓"];

  return (
    <div className="relative inline-block" ref={ref}>
      {/* Ambient glow */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.12), hsl(var(--sunshine) / 0.06), transparent 60%)",
          filter: "blur(50px)",
          width: "300%", height: "300%", left: "-100%", top: "-100%",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 3D container */}
      <motion.div
        className="relative z-10 cursor-pointer flex items-center justify-center"
        style={{
          width: dim, height: dim,
          rotateX, rotateY, scale: scaleVal,
          transformStyle: "preserve-3d",
          perspective: 800,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        whileTap={{ scale: 0.92 }}
      >
        {/* Dynamic shadow on ground */}
        <motion.div
          className="absolute bottom-[-10%] left-[15%] right-[15%] h-[10%] rounded-[50%] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, hsl(var(--foreground) / 0.12), transparent 70%)",
            filter: "blur(10px)",
            transform: "translateZ(-30px)",
          }}
          animate={{ scaleX: [0.8, 1.1, 0.8], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* === THE OWL SVG - Realistic Cartoon === */}
        <motion.svg
          viewBox="0 0 200 240"
          width={dim}
          height={dim}
          className="relative z-20 select-none"
          style={{
            filter: "drop-shadow(0 12px 30px hsl(var(--primary) / 0.25)) drop-shadow(0 4px 10px rgba(0,0,0,0.15))",
            transform: "translateZ(40px)",
          }}
          animate={isPoking
            ? { scale: [1, 1.15, 0.92, 1.05, 1], rotate: [0, -12, 12, -4, 0] }
            : mood === "wave"
            ? { y: [0, -15, 0], rotate: [0, -6, 6, 0] }
            : mood === "celebrate"
            ? { y: [0, -25, 0], rotate: [0, -10, 10, -5, 0] }
            : { y: [0, -6, 0] }
          }
          transition={{
            duration: isPoking ? 0.8 : mood === "idle" ? 3 : 1.2,
            repeat: isPoking ? 0 : Infinity,
            ease: "easeInOut",
          }}
        >
          <defs>
            {/* Realistic feather gradients */}
            <radialGradient id="bodyGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="hsl(25, 48%, 48%)" />
              <stop offset="50%" stopColor="hsl(25, 45%, 38%)" />
              <stop offset="100%" stopColor="hsl(25, 42%, 28%)" />
            </radialGradient>
            <radialGradient id="headGrad" cx="50%" cy="35%" r="55%">
              <stop offset="0%" stopColor="hsl(25, 48%, 48%)" />
              <stop offset="60%" stopColor="hsl(25, 45%, 40%)" />
              <stop offset="100%" stopColor="hsl(25, 40%, 32%)" />
            </radialGradient>
            <radialGradient id="bellyGrad" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="hsl(40, 65%, 85%)" />
              <stop offset="50%" stopColor="hsl(38, 58%, 76%)" />
              <stop offset="100%" stopColor="hsl(35, 50%, 65%)" />
            </radialGradient>
            <radialGradient id="faceGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="hsl(42, 65%, 82%)" />
              <stop offset="60%" stopColor="hsl(38, 55%, 72%)" />
              <stop offset="100%" stopColor="hsl(35, 48%, 62%)" />
            </radialGradient>
            <radialGradient id="irisGrad" cx="40%" cy="35%" r="55%">
              <stop offset="0%" stopColor="hsl(30, 95%, 55%)" />
              <stop offset="40%" stopColor="hsl(25, 90%, 42%)" />
              <stop offset="100%" stopColor="hsl(20, 85%, 28%)" />
            </radialGradient>
            <radialGradient id="eyeWhite" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stopColor="hsl(0, 0%, 100%)" />
              <stop offset="80%" stopColor="hsl(0, 0%, 96%)" />
              <stop offset="100%" stopColor="hsl(220, 10%, 90%)" />
            </radialGradient>
            <linearGradient id="wingGradL" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(25, 50%, 40%)" />
              <stop offset="50%" stopColor="hsl(25, 46%, 34%)" />
              <stop offset="100%" stopColor="hsl(25, 42%, 28%)" />
            </linearGradient>
            <linearGradient id="wingGradR" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(25, 50%, 40%)" />
              <stop offset="50%" stopColor="hsl(25, 46%, 34%)" />
              <stop offset="100%" stopColor="hsl(25, 42%, 28%)" />
            </linearGradient>
            <linearGradient id="beakGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="hsl(38, 92%, 60%)" />
              <stop offset="50%" stopColor="hsl(35, 88%, 52%)" />
              <stop offset="100%" stopColor="hsl(30, 85%, 42%)" />
            </linearGradient>
            <linearGradient id="talonGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="hsl(38, 80%, 55%)" />
              <stop offset="100%" stopColor="hsl(30, 75%, 40%)" />
            </linearGradient>
            {/* Feather texture filter */}
            <filter id="featherTex" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
            </filter>
            {/* Soft inner shadow */}
            <filter id="innerShadow">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
              <feOffset dx="0" dy="2" result="offsetBlur" />
              <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
            </filter>
          </defs>

          {/* === TAIL FEATHERS (behind body) === */}
          <motion.g
            animate={isPoking
              ? { rotate: [0, 8, -8, 0] }
              : { rotate: [0, 2, -2, 0] }
            }
            style={{ transformOrigin: "100px 190px" }}
            transition={{ duration: isPoking ? 0.6 : 3, repeat: isPoking ? 0 : Infinity }}
          >
            <path d="M82 190 L72 218 L80 212 L88 220 L92 200 Z" fill="hsl(25, 42%, 30%)" />
            <path d="M96 192 L94 222 L100 216 L106 224 L104 195 Z" fill="hsl(25, 45%, 33%)" />
            <path d="M108 190 L112 218 L118 212 L125 218 L118 200 Z" fill="hsl(25, 42%, 30%)" />
            {/* Tail feather stripes */}
            <path d="M78 208 Q85 206 90 210" stroke="hsl(25, 38%, 24%)" strokeWidth="1" fill="none" opacity="0.5" />
            <path d="M100 212 Q104 210 108 214" stroke="hsl(25, 38%, 24%)" strokeWidth="1" fill="none" opacity="0.5" />
            <path d="M114 208 Q118 206 122 210" stroke="hsl(25, 38%, 24%)" strokeWidth="1" fill="none" opacity="0.5" />
          </motion.g>

          {/* === BODY - layered for depth === */}
          {/* Outer feather edge */}
          <ellipse
            cx="100" cy="155" rx="58" ry="62"
            fill="hsl(25, 42%, 28%)"
          />
          {/* Main body */}
          <ellipse
            cx="100" cy="152" rx="53" ry="58"
            fill="url(#bodyGrad)"
          />
          {/* Body feather rows - scalloped pattern */}
          {[0, 1, 2, 3].map(row => (
            <g key={`row-${row}`} opacity="0.25">
              {[-2, -1, 0, 1, 2].map(col => (
                <motion.path
                  key={`f-${row}-${col}`}
                  d={`M ${88 + col * 12 + (row % 2) * 6} ${128 + row * 14} Q ${94 + col * 12 + (row % 2) * 6} ${135 + row * 14} ${88 + col * 12 + (row % 2) * 6} ${142 + row * 14}`}
                  stroke="hsl(25, 35%, 25%)"
                  strokeWidth="1.2"
                  fill="none"
                  animate={{ opacity: [0.2, 0.35, 0.2] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: (row + col) * 0.15 }}
                />
              ))}
            </g>
          ))}

          {/* Belly - soft warm patch */}
          <ellipse
            cx="100" cy="162" rx="34" ry="40"
            fill="url(#bellyGrad)"
          />
          {/* Belly chevron feather markings */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <motion.path
              key={`chevron-${i}`}
              d={`M ${82 + (i % 3) * 12} ${142 + Math.floor(i / 3) * 16} l 6 5 l 6 -5`}
              stroke="hsl(30, 38%, 60%)"
              strokeWidth="1.2"
              fill="none"
              opacity="0.4"
              animate={{ opacity: [0.25, 0.45, 0.25] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}

          {/* === LEFT WING === */}
          <motion.path
            d="M48 128 Q22 142 26 172 Q30 192 52 188 Q62 178 58 155 Q55 140 50 130 Z"
            fill="url(#wingGradL)"
            style={{ transformOrigin: "55px 145px" }}
            animate={isPoking || mood === "wave"
              ? { rotate: [0, -30, -15, -25, 0], scaleY: [1, 1.1, 1] }
              : { rotate: [0, -5, 0, -3, 0] }
            }
            transition={{
              duration: isPoking ? 0.8 : mood === "wave" ? 1.2 : 3,
              repeat: isPoking ? 0 : Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Left wing feather lines */}
          {[0, 1, 2].map(i => (
            <motion.path
              key={`lw-${i}`}
              d={`M ${40 + i * 5} ${148 + i * 10} Q ${30 + i * 4} ${155 + i * 10} ${34 + i * 5} ${168 + i * 6}`}
              stroke="hsl(25, 38%, 26%)"
              strokeWidth="1.2"
              fill="none"
              opacity="0.4"
              style={{ transformOrigin: "55px 145px" }}
              animate={isPoking || mood === "wave"
                ? { rotate: [0, -30, -15, -25, 0] }
                : { rotate: [0, -5, 0, -3, 0] }
              }
              transition={{
                duration: isPoking ? 0.8 : mood === "wave" ? 1.2 : 3,
                repeat: isPoking ? 0 : Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* === RIGHT WING === */}
          <motion.path
            d="M152 128 Q178 142 174 172 Q170 192 148 188 Q138 178 142 155 Q145 140 150 130 Z"
            fill="url(#wingGradR)"
            style={{ transformOrigin: "145px 145px" }}
            animate={isPoking || mood === "wave"
              ? { rotate: [0, 30, 15, 25, 0], scaleY: [1, 1.1, 1] }
              : { rotate: [0, 5, 0, 3, 0] }
            }
            transition={{
              duration: isPoking ? 0.8 : mood === "wave" ? 1.2 : 3,
              repeat: isPoking ? 0 : Infinity,
              ease: "easeInOut",
              delay: 0.1,
            }}
          />
          {/* Right wing feather lines */}
          {[0, 1, 2].map(i => (
            <motion.path
              key={`rw-${i}`}
              d={`M ${160 - i * 5} ${148 + i * 10} Q ${170 - i * 4} ${155 + i * 10} ${166 - i * 5} ${168 + i * 6}`}
              stroke="hsl(25, 38%, 26%)"
              strokeWidth="1.2"
              fill="none"
              opacity="0.4"
              style={{ transformOrigin: "145px 145px" }}
              animate={isPoking || mood === "wave"
                ? { rotate: [0, 30, 15, 25, 0] }
                : { rotate: [0, 5, 0, 3, 0] }
              }
              transition={{
                duration: isPoking ? 0.8 : mood === "wave" ? 1.2 : 3,
                repeat: isPoking ? 0 : Infinity,
                ease: "easeInOut",
                delay: 0.1,
              }}
            />
          ))}

          {/* === HEAD === */}
          <circle cx="100" cy="88" r="47" fill="hsl(25, 42%, 28%)" />
          <circle cx="100" cy="87" r="45" fill="url(#headGrad)" />
          {/* Head feather texture - subtle arcs */}
          {[0, 1, 2].map(i => (
            <path
              key={`hf-${i}`}
              d={`M ${70 + i * 15} ${60 + i * 4} Q ${78 + i * 15} ${55 + i * 4} ${85 + i * 15} ${60 + i * 4}`}
              stroke="hsl(25, 38%, 32%)"
              strokeWidth="1"
              fill="none"
              opacity="0.3"
            />
          ))}

          {/* === EAR TUFTS - more detailed === */}
          <motion.g
            style={{ transformOrigin: "70px 50px" }}
            animate={isPoking
              ? { rotate: [0, -15, 10, 0], y: [0, -5, 0] }
              : { rotate: [0, -3, 3, 0] }
            }
            transition={{ duration: isPoking ? 0.6 : 2, repeat: isPoking ? 0 : Infinity }}
          >
            <path d="M68 52 L58 22 L72 38 L64 18 L80 48 Z" fill="hsl(25, 48%, 32%)" />
            <path d="M70 48 L62 25 L76 44 Z" fill="hsl(25, 52%, 38%)" />
          </motion.g>
          <motion.g
            style={{ transformOrigin: "130px 50px" }}
            animate={isPoking
              ? { rotate: [0, 15, -10, 0], y: [0, -5, 0] }
              : { rotate: [0, 3, -3, 0] }
            }
            transition={{ duration: isPoking ? 0.6 : 2, repeat: isPoking ? 0 : Infinity }}
          >
            <path d="M132 52 L142 22 L128 38 L136 18 L120 48 Z" fill="hsl(25, 48%, 32%)" />
            <path d="M130 48 L138 25 L124 44 Z" fill="hsl(25, 52%, 38%)" />
          </motion.g>

          {/* === FACE DISC - realistic heart shape === */}
          <path
            d="M100 55 Q65 58 62 88 Q60 108 80 115 Q92 120 100 118 Q108 120 120 115 Q140 108 138 88 Q135 58 100 55 Z"
            fill="url(#faceGrad)"
          />
          {/* Face disc rim - subtle darker edge */}
          <path
            d="M100 55 Q65 58 62 88 Q60 108 80 115 Q92 120 100 118 Q108 120 120 115 Q140 108 138 88 Q135 58 100 55 Z"
            fill="none"
            stroke="hsl(30, 40%, 55%)"
            strokeWidth="1.5"
            opacity="0.4"
          />
          {/* Face V pattern between eyes */}
          <path d="M100 68 L94 82 M100 68 L106 82" stroke="hsl(30, 42%, 58%)" strokeWidth="1.2" fill="none" opacity="0.35" />

          {/* === EYES - hyper detailed === */}
          {/* Eye sockets - subtle shadow around */}
          <circle cx="80" cy="84" r="19" fill="hsl(25, 30%, 55%)" opacity="0.3" />
          <circle cx="120" cy="84" r="19" fill="hsl(25, 30%, 55%)" opacity="0.3" />

          {/* Eye whites with gradient */}
          <circle cx="80" cy="84" r="17" fill="url(#eyeWhite)" />
          <circle cx="120" cy="84" r="17" fill="url(#eyeWhite)" />

          {/* Iris - complex layered */}
          <g>
            {/* Iris base */}
            <circle cx={80 + eyeTarget.x} cy={84 + eyeTarget.y} r="11" fill="url(#irisGrad)" />
            <circle cx={120 + eyeTarget.x} cy={84 + eyeTarget.y} r="11" fill="url(#irisGrad)" />
            {/* Iris ring detail */}
            <circle cx={80 + eyeTarget.x} cy={84 + eyeTarget.y} r="9" fill="none" stroke="hsl(28, 80%, 38%)" strokeWidth="0.8" opacity="0.5" />
            <circle cx={120 + eyeTarget.x} cy={84 + eyeTarget.y} r="9" fill="none" stroke="hsl(28, 80%, 38%)" strokeWidth="0.8" opacity="0.5" />
            {/* Iris radial lines */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
              <g key={`iris-${angle}`} opacity="0.15">
                <line
                  x1={80 + eyeTarget.x + Math.cos(angle * Math.PI / 180) * 4}
                  y1={84 + eyeTarget.y + Math.sin(angle * Math.PI / 180) * 4}
                  x2={80 + eyeTarget.x + Math.cos(angle * Math.PI / 180) * 10}
                  y2={84 + eyeTarget.y + Math.sin(angle * Math.PI / 180) * 10}
                  stroke="hsl(20, 70%, 25%)" strokeWidth="0.6"
                />
                <line
                  x1={120 + eyeTarget.x + Math.cos(angle * Math.PI / 180) * 4}
                  y1={84 + eyeTarget.y + Math.sin(angle * Math.PI / 180) * 4}
                  x2={120 + eyeTarget.x + Math.cos(angle * Math.PI / 180) * 10}
                  y2={84 + eyeTarget.y + Math.sin(angle * Math.PI / 180) * 10}
                  stroke="hsl(20, 70%, 25%)" strokeWidth="0.6"
                />
              </g>
            ))}
            {/* Pupils */}
            <circle cx={80 + eyeTarget.x * 1.2} cy={84 + eyeTarget.y * 1.2} r="5.5" fill="hsl(220, 25%, 8%)" />
            <circle cx={120 + eyeTarget.x * 1.2} cy={84 + eyeTarget.y * 1.2} r="5.5" fill="hsl(220, 25%, 8%)" />
            {/* Eye shine - primary highlight */}
            <circle cx={77 + eyeTarget.x * 0.4} cy={80 + eyeTarget.y * 0.4} r="3.5" fill="white" opacity="0.95" />
            <circle cx={117 + eyeTarget.x * 0.4} cy={80 + eyeTarget.y * 0.4} r="3.5" fill="white" opacity="0.95" />
            {/* Eye shine - secondary smaller */}
            <circle cx={83 + eyeTarget.x * 0.6} cy={88 + eyeTarget.y * 0.6} r="1.8" fill="white" opacity="0.6" />
            <circle cx={123 + eyeTarget.x * 0.6} cy={88 + eyeTarget.y * 0.6} r="1.8" fill="white" opacity="0.6" />
          </g>

          {/* Eyelids (blink) */}
          <AnimatePresence>
            {blinkState && (
              <>
                <motion.ellipse
                  cx="80" cy="84" rx="17" ry="17"
                  fill="url(#headGrad)"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  exit={{ scaleY: 0 }}
                  transition={{ duration: 0.08 }}
                  style={{ transformOrigin: "80px 84px" }}
                />
                <motion.ellipse
                  cx="120" cy="84" rx="17" ry="17"
                  fill="url(#headGrad)"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  exit={{ scaleY: 0 }}
                  transition={{ duration: 0.08 }}
                  style={{ transformOrigin: "120px 84px" }}
                />
                {/* Eyelash lines */}
                <motion.path d="M64 82 Q72 78 80 80" stroke="hsl(25, 40%, 28%)" strokeWidth="1.5" fill="none"
                  initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} />
                <motion.path d="M136 82 Q128 78 120 80" stroke="hsl(25, 40%, 28%)" strokeWidth="1.5" fill="none"
                  initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} />
              </>
            )}
          </AnimatePresence>

          {/* === EYEBROWS - expressive === */}
          <motion.path
            d="M64 66 Q76 58 96 66"
            stroke="hsl(25, 48%, 28%)"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
            animate={mood === "celebrate"
              ? { d: ["M64 66 Q76 56 96 66", "M64 62 Q76 52 96 62", "M64 66 Q76 56 96 66"] }
              : isPoking
              ? { d: ["M64 66 Q76 58 96 66", "M64 70 Q76 64 96 70", "M64 66 Q76 58 96 66"] }
              : {}
            }
            transition={{ duration: 0.6, repeat: isPoking ? 0 : mood === "celebrate" ? 3 : 0 }}
          />
          <motion.path
            d="M104 66 Q124 58 136 66"
            stroke="hsl(25, 48%, 28%)"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
            animate={mood === "celebrate"
              ? { d: ["M104 66 Q120 56 136 66", "M104 62 Q120 52 136 62", "M104 66 Q120 56 136 66"] }
              : isPoking
              ? { d: ["M104 66 Q124 58 136 66", "M104 70 Q124 64 136 70", "M104 66 Q124 58 136 66"] }
              : {}
            }
            transition={{ duration: 0.6, repeat: isPoking ? 0 : mood === "celebrate" ? 3 : 0 }}
          />

          {/* === BEAK - detailed with nostril === */}
          <motion.path
            d="M91 98 Q96 96 100 112 Q104 96 109 98 Q100 116 91 98 Z"
            fill="url(#beakGrad)"
            animate={isPoking
              ? { scaleY: [1, 1.3, 0.8, 1.1, 1], y: [0, -2, 0] }
              : { scaleY: [1, 1.05, 1] }
            }
            style={{ transformOrigin: "100px 105px" }}
            transition={{ duration: isPoking ? 0.6 : 2, repeat: isPoking ? 0 : Infinity }}
          />
          {/* Beak highlight */}
          <path d="M95 99 Q98 97 100 107 L97 100 Z" fill="hsl(42, 95%, 68%)" opacity="0.5" />
          {/* Beak ridge line */}
          <path d="M100 98 L100 111" stroke="hsl(30, 80%, 42%)" strokeWidth="0.8" opacity="0.35" />
          {/* Nostrils */}
          <circle cx="97" cy="102" r="1" fill="hsl(30, 70%, 35%)" opacity="0.4" />
          <circle cx="103" cy="102" r="1" fill="hsl(30, 70%, 35%)" opacity="0.4" />

          {/* === CHEEK BLUSH - realistic soft === */}
          <motion.ellipse
            cx="62" cy="98" rx="10" ry="7"
            fill="hsl(350, 65%, 72%)"
            opacity={0.25}
            animate={{ opacity: [0.15, 0.3, 0.15], scale: [0.9, 1.1, 0.9] }}
            style={{ transformOrigin: "62px 98px" }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.ellipse
            cx="138" cy="98" rx="10" ry="7"
            fill="hsl(350, 65%, 72%)"
            opacity={0.25}
            animate={{ opacity: [0.15, 0.3, 0.15], scale: [0.9, 1.1, 0.9] }}
            style={{ transformOrigin: "138px 98px" }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          />

          {/* === FEET - detailed talons === */}
          <motion.g
            animate={{ y: [0, 2, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Left foot */}
            <path d="M76 202 Q70 208 68 216 L72 214 L76 218 L80 214 L84 216 Q82 208 80 202" fill="url(#talonGrad)" />
            <path d="M70 214 L68 218" stroke="hsl(30, 60%, 35%)" strokeWidth="1" strokeLinecap="round" />
            <path d="M76 216 L76 220" stroke="hsl(30, 60%, 35%)" strokeWidth="1" strokeLinecap="round" />
            <path d="M82 214 L84 218" stroke="hsl(30, 60%, 35%)" strokeWidth="1" strokeLinecap="round" />
            {/* Right foot */}
            <path d="M116 202 Q110 208 108 216 L112 214 L116 218 L120 214 L124 216 Q122 208 120 202" fill="url(#talonGrad)" />
            <path d="M110 214 L108 218" stroke="hsl(30, 60%, 35%)" strokeWidth="1" strokeLinecap="round" />
            <path d="M116 216 L116 220" stroke="hsl(30, 60%, 35%)" strokeWidth="1" strokeLinecap="round" />
            <path d="M122 214 L124 218" stroke="hsl(30, 60%, 35%)" strokeWidth="1" strokeLinecap="round" />
          </motion.g>

          {/* === Ambient light reflection on head === */}
          <ellipse cx="88" cy="65" rx="12" ry="6" fill="white" opacity="0.06" />
        </motion.svg>

        {/* Graduation cap on top */}
        <motion.span
          className="absolute z-30 select-none"
          style={{
            top: "-5%", left: "50%", x: "-50%",
            fontSize: dim * 0.22,
            filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.2))",
            transform: "translateZ(60px)",
          }}
          animate={isPoking
            ? { rotate: [0, -25, 30, -10, 0], y: [0, -15, 0] }
            : { rotate: [0, 4, -4, 0], y: [0, -4, 0] }
          }
          transition={{ duration: isPoking ? 0.7 : 3.5, repeat: isPoking ? 0 : Infinity, ease: "easeInOut" }}
        >
          🎓
        </motion.span>

        {/* Orbiting items */}
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="absolute select-none pointer-events-none z-10"
            style={{
              fontSize: dim * 0.1,
              transform: "translateZ(35px)",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
            }}
            animate={{
              x: [
                Math.cos((i * 120) * Math.PI / 180) * dim * 0.4,
                Math.cos((i * 120 + 180) * Math.PI / 180) * dim * 0.4,
                Math.cos((i * 120 + 360) * Math.PI / 180) * dim * 0.4,
              ],
              y: [
                Math.sin((i * 120) * Math.PI / 180) * dim * 0.35,
                Math.sin((i * 120 + 180) * Math.PI / 180) * dim * 0.35,
                Math.sin((i * 120 + 360) * Math.PI / 180) * dim * 0.35,
              ],
              opacity: [0.5, 0.9, 0.5],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
          >
            {["✏️", "⭐", "💡"][i]}
          </motion.span>
        ))}

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
              scale: [0, 1.8, 0],
              x: Math.cos((i * 60) * Math.PI / 180) * dim * 0.5,
              y: Math.sin((i * 60) * Math.PI / 180) * dim * 0.5 - 20,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {sp}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
};

export default Interactive3DMascot;
