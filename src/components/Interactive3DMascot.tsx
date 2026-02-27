import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import owlImage from "@/assets/owl-mascot.png";

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
  const [isBlinking, setIsBlinking] = useState(false);
  const dim = sizeMap[size];

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springCfg = { stiffness: 200, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springCfg);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springCfg);
  const scaleVal = useSpring(1, { stiffness: 300, damping: 25 });

  // Natural blinking
  useState(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    };
    const interval = setInterval(() => {
      blink();
      // Sometimes double-blink
      if (Math.random() > 0.7) setTimeout(blink, 300);
    }, 2500 + Math.random() * 2000);
    return () => clearInterval(interval);
  });

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

  // Mood-based glow colors
  const glowStyle = mood === "celebrate"
    ? "radial-gradient(circle, hsl(var(--sunshine) / 0.2), hsl(var(--candy) / 0.12), transparent 65%)"
    : mood === "wave"
    ? "radial-gradient(circle, hsl(var(--sky) / 0.18), hsl(var(--primary) / 0.1), transparent 65%)"
    : "radial-gradient(circle, hsl(var(--primary) / 0.12), hsl(var(--lavender) / 0.06), transparent 65%)";

  return (
    <div className="relative inline-block" ref={ref}>
      {/* Mood-reactive glow */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "220%", height: "220%", left: "-60%", top: "-60%",
          background: glowStyle,
          filter: mood === "celebrate" ? "blur(25px)" : "blur(35px)",
        }}
        animate={mood === "celebrate"
          ? { scale: [1, 1.25, 1.05, 1.2, 1], opacity: [0.5, 0.9, 0.6, 0.85, 0.5] }
          : mood === "wave"
          ? { scale: [1, 1.15, 1], opacity: [0.4, 0.65, 0.4] }
          : { scale: [1, 1.08, 1], opacity: [0.3, 0.45, 0.3] }
        }
        transition={{
          duration: mood === "celebrate" ? 1.5 : mood === "wave" ? 3 : 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Celebrate pulse ring */}
      {mood === "celebrate" && (
        <motion.div
          className="absolute rounded-full pointer-events-none border-2"
          style={{
            width: "160%", height: "160%", left: "-30%", top: "-30%",
            borderColor: "hsl(var(--sunshine) / 0.25)",
          }}
          animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.4, 0, 0.4] }}
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
          className="absolute bottom-[-8%] left-[18%] right-[18%] h-[8%] rounded-[50%] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, hsl(var(--foreground) / 0.15), transparent 70%)",
            filter: "blur(8px)",
            transform: "translateZ(-20px)",
          }}
          animate={{ scaleX: [0.85, 1.1, 0.85], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Pixar Owl Image */}
        <motion.img
          src={owlImage}
          alt="English Fun Owl Mascot"
          className="w-full h-full object-contain relative z-20 select-none pointer-events-none"
          draggable={false}
          style={{
            filter: "drop-shadow(0 8px 24px hsl(var(--primary) / 0.2))",
            transform: "translateZ(40px)",
            // Blend into dark background
            WebkitMaskImage: "radial-gradient(ellipse 52% 54% at 50% 46%, black 60%, transparent 85%)",
            maskImage: "radial-gradient(ellipse 52% 54% at 50% 46%, black 60%, transparent 85%)",
          }}
          animate={isPoking
            ? { scale: [1, 1.12, 0.94, 1.04, 1], rotate: [0, -8, 8, -3, 0] }
            : mood === "wave"
            ? { y: [0, -8, 0], rotate: [0, -3, 3, 0] }
            : mood === "celebrate"
            ? { y: [0, -14, 0], rotate: [0, -5, 5, -2, 0] }
            : { y: [0, -5, 0] }
          }
          transition={{
            duration: isPoking ? 0.7 : mood === "idle" ? 3 : 1.2,
            repeat: isPoking ? 0 : Infinity,
            ease: "easeInOut",
          }}
        />

        {/* SVG Overlay — Animated Eyes (Blink) */}
        <motion.svg
          viewBox="0 0 200 200"
          className="absolute inset-0 w-full h-full z-30 pointer-events-none select-none"
          style={{ transform: "translateZ(50px)" }}
          animate={isPoking
            ? { scale: [1, 1.12, 0.94, 1.04, 1], rotate: [0, -8, 8, -3, 0] }
            : mood === "wave"
            ? { y: [0, -8, 0], rotate: [0, -3, 3, 0] }
            : mood === "celebrate"
            ? { y: [0, -14, 0], rotate: [0, -5, 5, -2, 0] }
            : { y: [0, -5, 0] }
          }
          transition={{
            duration: isPoking ? 0.7 : mood === "idle" ? 3 : 1.2,
            repeat: isPoking ? 0 : Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Eye blink overlays — positioned over the owl's eyes */}
          {isBlinking && (
            <>
              {/* Left eye blink */}
              <ellipse cx="82" cy="74" rx="10" ry="3" fill="#B87340" opacity="0.9" />
              <path d="M72 74 Q82 70 92 74" fill="none" stroke="#8B5A2B" strokeWidth="1.5" strokeLinecap="round" />
              {/* Right eye blink */}
              <ellipse cx="118" cy="74" rx="10" ry="3" fill="#B87340" opacity="0.9" />
              <path d="M108 74 Q118 70 128 74" fill="none" stroke="#8B5A2B" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}

          {/* Eye sparkle/catchlight animation */}
          {!isBlinking && (
            <>
              <motion.circle
                cx="79" cy="70" r="2"
                fill="white" opacity={0.7}
                animate={{ opacity: [0.5, 0.9, 0.5], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.circle
                cx="121" cy="70" r="2"
                fill="white" opacity={0.7}
                animate={{ opacity: [0.5, 0.9, 0.5], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              />
            </>
          )}

          {/* Mood expression — cheek blush for celebrate */}
          {mood === "celebrate" && (
            <>
              <motion.circle
                cx="68" cy="86" r="8"
                fill="#FF9999" opacity={0}
                animate={{ opacity: [0, 0.3, 0.15, 0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.circle
                cx="132" cy="86" r="8"
                fill="#FF9999" opacity={0}
                animate={{ opacity: [0, 0.3, 0.15, 0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
              />
            </>
          )}
        </motion.svg>

        {/* Floating sparkles around owl for celebrate mood */}
        {mood === "celebrate" && !isPoking && (
          <>
            {[0, 1, 2, 3].map(i => (
              <motion.span
                key={`sparkle-${i}`}
                className="absolute pointer-events-none z-30 text-sunshine"
                style={{
                  fontSize: dim * 0.08,
                  left: `${20 + i * 20}%`,
                  top: `${10 + (i % 2) * 15}%`,
                }}
                animate={{
                  y: [0, -12, 0],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [0.7, 1.1, 0.7],
                  rotate: [0, 15, -15, 0],
                }}
                transition={{
                  duration: 2 + i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.4,
                }}
              >
                ✨
              </motion.span>
            ))}
          </>
        )}

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
