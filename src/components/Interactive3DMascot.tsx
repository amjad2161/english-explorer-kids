import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import mascotImg from "@/assets/mascot.png";

interface Interactive3DMascotProps {
  mood?: "idle" | "wave" | "celebrate";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const sizes = {
  sm: "w-20 h-20",
  md: "w-28 h-28 md:w-36 md:h-36",
  lg: "w-36 h-36 md:w-44 md:h-44",
};

const Interactive3DMascot = ({ mood = "idle", size = "md", onClick }: Interactive3DMascotProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isPoking, setIsPoking] = useState(false);
  const [pokeCount, setPokeCount] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 200, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, -20]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-25, 25]), springConfig);
  const scale = useSpring(1, { stiffness: 300, damping: 25 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    scale.set(1);
  }, [mouseX, mouseY, scale]);

  const handleClick = useCallback(() => {
    setIsPoking(true);
    setPokeCount(c => c + 1);
    scale.set(1.15);
    setTimeout(() => {
      scale.set(1);
      setIsPoking(false);
    }, 600);
    onClick?.();
  }, [onClick, scale]);

  const moodAnimation = mood === "wave"
    ? { y: [0, -15, 0], rotate: [0, -8, 8, 0] }
    : mood === "celebrate"
    ? { y: [0, -25, 0], rotate: [0, -12, 12, -6, 0] }
    : { y: [0, -6, 0] };

  const reactions = ["✨", "💫", "⭐", "🌟", "💖", "🎉"];

  return (
    <div className="relative inline-block" ref={ref}>
      {/* Multi-layer ambient glow - blends into background */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.2), hsl(var(--sunshine) / 0.1), transparent 65%)",
          filter: "blur(50px)",
          width: "300%", height: "300%", left: "-100%", top: "-100%",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Dark mode secondary glow */}
      <motion.div
        className="absolute rounded-full pointer-events-none hidden dark:block"
        style={{
          background: "radial-gradient(circle, hsl(var(--candy) / 0.12), transparent 55%)",
          filter: "blur(60px)",
          width: "350%", height: "350%", left: "-125%", top: "-125%",
        }}
        animate={{ scale: [0.8, 1.1, 0.8] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: -4 }}
      />

      {/* 3D Interactive Mascot */}
      <motion.div
        className="relative z-10 cursor-pointer"
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: "preserve-3d",
          perspective: 800,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        whileTap={{ scale: 0.92 }}
      >
        {/* Shadow that moves with tilt */}
        <motion.div
          className="absolute bottom-[-10%] left-[10%] right-[10%] h-[15%] rounded-[50%] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, hsl(var(--foreground) / 0.12), transparent 70%)",
            filter: "blur(8px)",
            transform: "translateZ(-30px)",
          }}
          animate={{ scaleX: [0.9, 1.05, 0.9], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Mascot image - blended into background, no visible box */}
        <motion.img
          src={mascotImg}
          alt="Owl mascot"
          className={`${sizes[size]} relative z-10 select-none dark:mix-blend-lighten`}
          style={{
            filter: "drop-shadow(0 20px 40px hsl(var(--primary) / 0.2)) drop-shadow(0 8px 16px hsl(var(--foreground) / 0.1))",
            transform: "translateZ(40px)",
            maskImage: "radial-gradient(ellipse 78% 80% at 50% 46%, black 45%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse 78% 80% at 50% 46%, black 45%, transparent 70%)",
          }}
          animate={isPoking ? { scale: [1, 1.2, 0.95, 1.05, 1], rotate: [0, -15, 15, -5, 0] } : moodAnimation}
          transition={{
            duration: isPoking ? 0.6 : mood === "idle" ? 4 : 1.5,
            repeat: isPoking ? 0 : mood === "idle" ? Infinity : 0,
            ease: "easeInOut",
          }}
          draggable={false}
        />

        {/* Sparkle particles on interaction */}
        {isPoking && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={`${pokeCount}-${i}`}
                className="absolute text-lg pointer-events-none z-20"
                style={{
                  left: "50%", top: "50%",
                }}
                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: [0, 1.5, 0],
                  x: Math.cos((i * 60) * Math.PI / 180) * 80,
                  y: Math.sin((i * 60) * Math.PI / 180) * 80 - 20,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {reactions[i % reactions.length]}
              </motion.span>
            ))}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Interactive3DMascot;
