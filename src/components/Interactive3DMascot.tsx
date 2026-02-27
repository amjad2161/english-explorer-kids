import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";
import owlPixar from "@/assets/owl-pixar.png";

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
          animate={isPoking
            ? { scale: [1, 1.1, 0.95, 1.03, 1], rotate: [0, -6, 6, -2, 0] }
            : mood === "wave" ? { y: [0, -8, 0], rotate: [0, -2, 2, 0] }
            : mood === "celebrate" ? { y: [0, -12, 0], rotate: [0, -4, 4, -1, 0] }
            : { y: [0, -4, 0] }
          }
          transition={{
            duration: isPoking ? 0.7 : mood === "idle" ? 3 : 1.2,
            repeat: isPoking ? 0 : Infinity,
            ease: "easeInOut",
          }}
        />

        {/* SVG animated overlays — eye sparkles + cheek blush */}
        <motion.svg
          viewBox="0 0 200 200"
          className="absolute inset-0 w-full h-full z-30 pointer-events-none select-none"
          style={{ transform: "translateZ(50px)" }}
          animate={isPoking
            ? { scale: [1, 1.1, 0.95, 1.03, 1], rotate: [0, -6, 6, -2, 0] }
            : mood === "wave" ? { y: [0, -8, 0], rotate: [0, -2, 2, 0] }
            : mood === "celebrate" ? { y: [0, -12, 0], rotate: [0, -4, 4, -1, 0] }
            : { y: [0, -4, 0] }
          }
          transition={{
            duration: isPoking ? 0.7 : mood === "idle" ? 3 : 1.2,
            repeat: isPoking ? 0 : Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Eye catchlight shimmer — left */}
          <motion.circle
            cx="76" cy="68" r="2.5"
            fill="white" opacity={0.8}
            animate={{ opacity: [0.5, 1, 0.5], r: [2, 3, 2] as any }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Eye catchlight shimmer — right */}
          <motion.circle
            cx="122" cy="68" r="2.5"
            fill="white" opacity={0.8}
            animate={{ opacity: [0.5, 1, 0.5], r: [2, 3, 2] as any }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          />

          {/* Celebrate cheek blush */}
          {mood === "celebrate" && (
            <>
              <motion.circle cx="62" cy="84" r="9" fill="#FF9999" opacity={0}
                animate={{ opacity: [0, 0.2, 0.1, 0.2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.circle cx="138" cy="84" r="9" fill="#FF9999" opacity={0}
                animate={{ opacity: [0, 0.2, 0.1, 0.2, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
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
