import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";
import owlImage from "@/assets/owl-mascot.png";

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
  const dim = sizeMap[size];

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 200, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig);
  const scaleVal = useSpring(1, { stiffness: 300, damping: 25 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width - 0.5;
    const my = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(mx);
    mouseY.set(my);
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
      {/* Ambient glow */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.1), hsl(var(--sunshine) / 0.05), transparent 60%)",
          filter: "blur(40px)",
          width: "250%", height: "250%", left: "-75%", top: "-75%",
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
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
        whileTap={{ scale: 0.93 }}
      >
        {/* Ground shadow */}
        <motion.div
          className="absolute bottom-[-8%] left-[20%] right-[20%] h-[8%] rounded-[50%] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, hsl(var(--foreground) / 0.1), transparent 70%)",
            filter: "blur(8px)",
            transform: "translateZ(-20px)",
          }}
          animate={{ scaleX: [0.85, 1.05, 0.85], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* The owl image — edge-masked to blend seamlessly into background */}
        <motion.img
          src={owlImage}
          alt="Owl mascot"
          className="relative z-20 select-none pointer-events-none"
          draggable={false}
          style={{
            width: dim * 1.3,
            height: dim * 1.3,
            objectFit: "contain",
            WebkitMaskImage: "radial-gradient(ellipse 48% 50% at 50% 48%, black 55%, transparent 80%)",
            maskImage: "radial-gradient(ellipse 48% 50% at 50% 48%, black 55%, transparent 80%)",
            filter: "drop-shadow(0 8px 25px hsl(var(--primary) / 0.2))",
            transform: "translateZ(40px)",
          }}
          animate={isPoking
            ? { scale: [1, 1.12, 0.94, 1.04, 1], rotate: [0, -8, 8, -3, 0] }
            : mood === "wave"
            ? { y: [0, -10, 0], rotate: [0, -4, 4, 0] }
            : mood === "celebrate"
            ? { y: [0, -18, 0], rotate: [0, -6, 6, -3, 0] }
            : { y: [0, -5, 0] }
          }
          transition={{
            duration: isPoking ? 0.7 : mood === "idle" ? 3 : 1.2,
            repeat: isPoking ? 0 : Infinity,
            ease: "easeInOut",
          }}
        />

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
