import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState, useCallback } from "react";

interface Interactive3DMascotProps {
  mood?: "idle" | "wave" | "celebrate";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const sizeMap = {
  sm: { container: "w-24 h-24", owl: "text-6xl", hat: "text-2xl", book: "text-2xl" },
  md: { container: "w-32 h-32 md:w-40 md:h-40", owl: "text-7xl md:text-8xl", hat: "text-3xl md:text-4xl", book: "text-3xl md:text-4xl" },
  lg: { container: "w-40 h-40 md:w-48 md:h-48", owl: "text-8xl md:text-9xl", hat: "text-4xl md:text-5xl", book: "text-4xl md:text-5xl" },
};

const Interactive3DMascot = ({ mood = "idle", size = "md", onClick }: Interactive3DMascotProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isPoking, setIsPoking] = useState(false);
  const [pokeCount, setPokeCount] = useState(0);
  const s = sizeMap[size];

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 200, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [18, -18]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-22, 22]), springConfig);
  const scale = useSpring(1, { stiffness: 300, damping: 25 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0); mouseY.set(0); scale.set(1);
  }, [mouseX, mouseY, scale]);

  const handleClick = useCallback(() => {
    setIsPoking(true);
    setPokeCount(c => c + 1);
    scale.set(1.15);
    setTimeout(() => { scale.set(1); setIsPoking(false); }, 700);
    onClick?.();
  }, [onClick, scale]);

  const moodAnimation = mood === "wave"
    ? { y: [0, -18, 0], rotate: [0, -10, 10, 0] }
    : mood === "celebrate"
    ? { y: [0, -30, 0], rotate: [0, -15, 15, -8, 0] }
    : { y: [0, -8, 0] };

  const sparkles = ["✨", "💫", "⭐", "🌟", "📚", "🎓"];

  return (
    <div className="relative inline-block" ref={ref}>
      {/* Ambient glow */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.15), hsl(var(--sunshine) / 0.08), transparent 60%)",
          filter: "blur(40px)",
          width: "280%", height: "280%", left: "-90%", top: "-90%",
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 3D container */}
      <motion.div
        className={`relative z-10 cursor-pointer ${s.container} flex items-center justify-center`}
        style={{
          rotateX, rotateY, scale,
          transformStyle: "preserve-3d",
          perspective: 800,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        whileTap={{ scale: 0.92 }}
      >
        {/* Dynamic shadow */}
        <motion.div
          className="absolute bottom-[-8%] left-[15%] right-[15%] h-[12%] rounded-[50%] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, hsl(var(--foreground) / 0.15), transparent 70%)",
            filter: "blur(8px)",
            transform: "translateZ(-30px)",
          }}
          animate={{ scaleX: [0.85, 1.05, 0.85], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Graduation cap - floating above */}
        <motion.span
          className={`absolute z-30 ${s.hat} select-none`}
          style={{
            top: "-12%", left: "50%", x: "-50%",
            transform: "translateZ(60px)",
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
          }}
          animate={isPoking
            ? { rotate: [0, -25, 30, -10, 0], y: [0, -15, 0] }
            : { rotate: [0, 3, -3, 0], y: [0, -3, 0] }
          }
          transition={{ duration: isPoking ? 0.7 : 3, repeat: isPoking ? 0 : Infinity, ease: "easeInOut" }}
        >
          🎓
        </motion.span>

        {/* Main owl body */}
        <motion.span
          className={`${s.owl} select-none relative z-20`}
          style={{
            filter: "drop-shadow(0 12px 25px hsl(var(--primary) / 0.25)) drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
            transform: "translateZ(40px)",
          }}
          animate={isPoking
            ? { scale: [1, 1.25, 0.9, 1.1, 1], rotate: [0, -18, 18, -6, 0] }
            : moodAnimation
          }
          transition={{
            duration: isPoking ? 0.7 : mood === "idle" ? 4 : 1.5,
            repeat: isPoking ? 0 : mood === "idle" ? Infinity : 0,
            ease: "easeInOut",
          }}
        >
          🦉
        </motion.span>

        {/* Book - floating below */}
        <motion.span
          className={`absolute z-20 ${s.book} select-none`}
          style={{
            bottom: "5%", left: "50%", x: "-50%",
            transform: "translateZ(50px)",
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
          }}
          animate={{
            rotate: [0, -4, 4, 0],
            y: [0, -4, 0],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: -1 }}
        >
          📖
        </motion.span>

        {/* Orbiting sparkles */}
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="absolute text-sm select-none pointer-events-none z-10"
            style={{
              transform: "translateZ(35px)",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
            }}
            animate={{
              x: [
                Math.cos((i * 120) * Math.PI / 180) * 55,
                Math.cos((i * 120 + 180) * Math.PI / 180) * 55,
                Math.cos((i * 120 + 360) * Math.PI / 180) * 55,
              ],
              y: [
                Math.sin((i * 120) * Math.PI / 180) * 45,
                Math.sin((i * 120 + 180) * Math.PI / 180) * 45,
                Math.sin((i * 120 + 360) * Math.PI / 180) * 45,
              ],
              opacity: [0.4, 0.8, 0.4],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
          >
            {["✏️", "⭐", "💡"][i]}
          </motion.span>
        ))}

        {/* Burst particles on click */}
        {isPoking && sparkles.map((s, i) => (
          <motion.span
            key={`${pokeCount}-${i}`}
            className="absolute text-xl pointer-events-none z-30"
            style={{ left: "50%", top: "40%", transform: "translateZ(50px)" }}
            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: 0,
              scale: [0, 1.8, 0],
              x: Math.cos((i * 60) * Math.PI / 180) * 90,
              y: Math.sin((i * 60) * Math.PI / 180) * 90 - 20,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {s}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
};

export default Interactive3DMascot;
