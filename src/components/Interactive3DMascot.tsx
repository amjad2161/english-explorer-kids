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

        {/* === THE OWL SVG === */}
        <motion.svg
          viewBox="0 0 200 220"
          width={dim}
          height={dim}
          className="relative z-20 select-none"
          style={{
            filter: "drop-shadow(0 10px 25px hsl(var(--primary) / 0.2)) drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
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
          {/* Body feathers - animated ruffling */}
          <motion.ellipse
            cx="100" cy="150" rx="55" ry="60"
            fill="hsl(25, 50%, 35%)"
            animate={{ rx: [55, 57, 55], ry: [60, 62, 60] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Body main */}
          <motion.ellipse
            cx="100" cy="145" rx="50" ry="55"
            fill="hsl(25, 45%, 42%)"
            animate={{ ry: [55, 57, 55] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Belly */}
          <motion.ellipse
            cx="100" cy="155" rx="32" ry="38"
            fill="hsl(38, 60%, 78%)"
            animate={{ ry: [38, 40, 38] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />
          {/* Belly feather pattern */}
          {[0, 1, 2, 3, 4].map(i => (
            <motion.path
              key={`belly-${i}`}
              d={`M ${80 + i * 10} ${140 + (i % 2) * 5} Q ${85 + i * 10} ${148 + (i % 2) * 5} ${80 + i * 10} ${155 + (i % 2) * 5}`}
              stroke="hsl(30, 40%, 65%)"
              strokeWidth="1.5"
              fill="none"
              opacity="0.5"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}

          {/* Left wing */}
          <motion.path
            d="M50 130 Q25 140 30 170 Q35 185 55 180 Q60 165 55 145 Z"
            fill="hsl(25, 48%, 38%)"
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
          {/* Left wing feather details */}
          <motion.path
            d="M42 150 Q30 155 35 170"
            stroke="hsl(25, 40%, 30%)"
            strokeWidth="1.5"
            fill="none"
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

          {/* Right wing */}
          <motion.path
            d="M150 130 Q175 140 170 170 Q165 185 145 180 Q140 165 145 145 Z"
            fill="hsl(25, 48%, 38%)"
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
          {/* Right wing feather details */}
          <motion.path
            d="M158 150 Q170 155 165 170"
            stroke="hsl(25, 40%, 30%)"
            strokeWidth="1.5"
            fill="none"
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

          {/* Head */}
          <motion.circle
            cx="100" cy="85" r="45"
            fill="hsl(25, 45%, 42%)"
            animate={{ r: [45, 46, 45] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />

          {/* Ear tufts left */}
          <motion.path
            d="M65 55 L55 25 L78 50 Z"
            fill="hsl(25, 50%, 35%)"
            animate={isPoking
              ? { rotate: [0, -15, 10, 0], y: [0, -5, 0] }
              : { rotate: [0, -3, 3, 0] }
            }
            style={{ transformOrigin: "70px 50px" }}
            transition={{ duration: isPoking ? 0.6 : 2, repeat: isPoking ? 0 : Infinity }}
          />
          {/* Ear tufts right */}
          <motion.path
            d="M135 55 L145 25 L122 50 Z"
            fill="hsl(25, 50%, 35%)"
            animate={isPoking
              ? { rotate: [0, 15, -10, 0], y: [0, -5, 0] }
              : { rotate: [0, 3, -3, 0] }
            }
            style={{ transformOrigin: "130px 50px" }}
            transition={{ duration: isPoking ? 0.6 : 2, repeat: isPoking ? 0 : Infinity }}
          />

          {/* Face disc */}
          <ellipse cx="100" cy="88" rx="35" ry="32" fill="hsl(38, 55%, 72%)" />

          {/* Eye sockets */}
          <circle cx="82" cy="82" r="16" fill="white" />
          <circle cx="118" cy="82" r="16" fill="white" />

          {/* Irises - follow mouse */}
          <motion.circle
            cx={82 + eyeTarget.x}
            cy={82 + eyeTarget.y}
            r="10"
            fill="hsl(25, 90%, 45%)"
          />
          <motion.circle
            cx={118 + eyeTarget.x}
            cy={82 + eyeTarget.y}
            r="10"
            fill="hsl(25, 90%, 45%)"
          />

          {/* Pupils - follow mouse */}
          <motion.circle
            cx={82 + eyeTarget.x * 1.2}
            cy={82 + eyeTarget.y * 1.2}
            r="5"
            fill="hsl(220, 30%, 10%)"
          />
          <motion.circle
            cx={118 + eyeTarget.x * 1.2}
            cy={82 + eyeTarget.y * 1.2}
            r="5"
            fill="hsl(220, 30%, 10%)"
          />

          {/* Eye shine */}
          <circle cx={79 + eyeTarget.x * 0.5} cy={79 + eyeTarget.y * 0.5} r="3" fill="white" opacity="0.9" />
          <circle cx={115 + eyeTarget.x * 0.5} cy={79 + eyeTarget.y * 0.5} r="3" fill="white" opacity="0.9" />

          {/* Eyelids (blink) */}
          <AnimatePresence>
            {blinkState && (
              <>
                <motion.ellipse
                  cx="82" cy="82" rx="16" ry="16"
                  fill="hsl(25, 45%, 42%)"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  exit={{ scaleY: 0 }}
                  transition={{ duration: 0.08 }}
                  style={{ transformOrigin: "82px 82px" }}
                />
                <motion.ellipse
                  cx="118" cy="82" rx="16" ry="16"
                  fill="hsl(25, 45%, 42%)"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  exit={{ scaleY: 0 }}
                  transition={{ duration: 0.08 }}
                  style={{ transformOrigin: "118px 82px" }}
                />
              </>
            )}
          </AnimatePresence>

          {/* Beak */}
          <motion.path
            d="M93 95 L100 110 L107 95 Z"
            fill="hsl(35, 90%, 55%)"
            animate={isPoking
              ? { scaleY: [1, 1.3, 0.8, 1.1, 1], y: [0, -2, 0] }
              : { scaleY: [1, 1.05, 1] }
            }
            style={{ transformOrigin: "100px 100px" }}
            transition={{ duration: isPoking ? 0.6 : 2, repeat: isPoking ? 0 : Infinity }}
          />
          {/* Beak shine */}
          <path d="M96 97 L100 105 L100 97 Z" fill="hsl(40, 95%, 65%)" opacity="0.6" />

          {/* Feet */}
          <motion.g
            animate={{ y: [0, 2, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Left foot */}
            <path d="M78 198 L72 210 L78 208 L82 212 L86 208 L90 210 L84 198" fill="hsl(35, 80%, 50%)" />
            {/* Right foot */}
            <path d="M110 198 L104 210 L110 208 L114 212 L118 208 L122 210 L116 198" fill="hsl(35, 80%, 50%)" />
          </motion.g>

          {/* Tail feathers */}
          <motion.g
            animate={isPoking
              ? { rotate: [0, 8, -8, 0] }
              : { rotate: [0, 2, -2, 0] }
            }
            style={{ transformOrigin: "100px 180px" }}
            transition={{ duration: isPoking ? 0.6 : 3, repeat: isPoking ? 0 : Infinity }}
          >
            <path d="M85 185 L80 205 L90 195 Z" fill="hsl(25, 48%, 35%)" />
            <path d="M100 188 L100 210 L105 195 Z" fill="hsl(25, 50%, 38%)" />
            <path d="M115 185 L120 205 L110 195 Z" fill="hsl(25, 48%, 35%)" />
          </motion.g>

          {/* Eyebrows - expressive */}
          <motion.path
            d="M68 68 Q78 62 94 68"
            stroke="hsl(25, 50%, 30%)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            animate={mood === "celebrate"
              ? { d: ["M68 68 Q78 58 94 68", "M68 64 Q78 55 94 64", "M68 68 Q78 58 94 68"] }
              : isPoking
              ? { d: ["M68 68 Q78 62 94 68", "M68 72 Q78 66 94 72", "M68 68 Q78 62 94 68"] }
              : {}
            }
            transition={{ duration: 0.6, repeat: isPoking ? 0 : mood === "celebrate" ? 3 : 0 }}
          />
          <motion.path
            d="M106 68 Q122 62 132 68"
            stroke="hsl(25, 50%, 30%)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            animate={mood === "celebrate"
              ? { d: ["M106 68 Q118 58 132 68", "M106 64 Q118 55 132 64", "M106 68 Q118 58 132 68"] }
              : isPoking
              ? { d: ["M106 68 Q122 62 132 68", "M106 72 Q122 66 132 72", "M106 68 Q122 62 132 68"] }
              : {}
            }
            transition={{ duration: 0.6, repeat: isPoking ? 0 : mood === "celebrate" ? 3 : 0 }}
          />

          {/* Cheek blush */}
          <motion.circle
            cx="65" cy="95" r="8"
            fill="hsl(0, 70%, 75%)"
            opacity={0.3}
            animate={{ opacity: [0.2, 0.4, 0.2], r: [7, 9, 7] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.circle
            cx="135" cy="95" r="8"
            fill="hsl(0, 70%, 75%)"
            opacity={0.3}
            animate={{ opacity: [0.2, 0.4, 0.2], r: [7, 9, 7] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          />
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
