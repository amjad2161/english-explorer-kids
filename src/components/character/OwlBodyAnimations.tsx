import { motion } from "framer-motion";
import type { CharacterMood } from "@/lib/characterStore";

interface OwlBodyAnimationsProps {
  mood: CharacterMood;
  width: number;
}

/**
 * Overlay animations layered on top of the static owl PNG.
 * Creates the illusion of wing flaps, head tilts, feather ruffles,
 * blinking, and breathing — all via transparent motion divs.
 */

// ─── Wing Flap ───
const WingFlap = ({ side, mood, width }: { side: "left" | "right"; mood: CharacterMood; width: number }) => {
  const isLeft = side === "left";
  const isCelebrate = mood === "celebrate";
  const isWave = mood === "wave";
  const isSad = mood === "sad";

  const flapIntensity = isCelebrate ? 14 : isWave ? 10 : isSad ? 3 : 6;
  const duration = isCelebrate ? 0.35 : isWave ? 0.6 : isSad ? 3 : 1.8;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: width * 0.28,
        height: width * 0.35,
        left: isLeft ? "6%" : undefined,
        right: isLeft ? undefined : "6%",
        top: "38%",
        transformOrigin: isLeft ? "right center" : "left center",
        background: "transparent",
      }}
      animate={{
        rotateY: isLeft
          ? [0, -flapIntensity, 0, -flapIntensity * 0.6, 0]
          : [0, flapIntensity, 0, flapIntensity * 0.6, 0],
        scaleX: isCelebrate
          ? [1, 1.15, 0.92, 1.08, 1]
          : [1, 1.06, 0.97, 1.03, 1],
        skewY: isLeft
          ? [0, -flapIntensity * 0.3, 0, -flapIntensity * 0.15, 0]
          : [0, flapIntensity * 0.3, 0, flapIntensity * 0.15, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatDelay: isCelebrate ? 0.05 : 0.8,
        ease: "easeInOut",
      }}
    >
      {/* Wing shadow / shape hint */}
      <motion.div
        className="w-full h-full rounded-full"
        style={{
          background: `radial-gradient(ellipse at ${isLeft ? "80%" : "20%"} 50%, 
            hsla(30, 40%, 35%, 0.06) 0%, transparent 70%)`,
        }}
        animate={{
          opacity: [0, 0.4, 0.1, 0.3, 0],
        }}
        transition={{
          duration: duration * 0.8,
          repeat: Infinity,
          repeatDelay: isCelebrate ? 0.1 : 1,
        }}
      />
    </motion.div>
  );
};

// ─── Head Bob / Tilt ───
const HeadBob = ({ mood, width }: { mood: CharacterMood; width: number }) => {
  const isThink = mood === "think";
  const isSurprised = mood === "surprised";
  const isTalk = mood === "talk";
  const isCelebrate = mood === "celebrate";

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: width * 0.4,
        height: width * 0.3,
        left: "30%",
        top: "8%",
        transformOrigin: "center bottom",
      }}
      animate={{
        rotate: isThink
          ? [0, 8, 5, 8, 0]
          : isTalk
            ? [0, -2, 3, -2, 0]
            : isCelebrate
              ? [0, -4, 4, -3, 0]
              : [0, -1.5, 1.5, 0],
        y: isSurprised
          ? [0, -6, -3, -5, 0]
          : isTalk
            ? [0, -1.5, 0, -1, 0]
            : [0, -1, 0],
        scale: isSurprised
          ? [1, 1.04, 1, 1.02, 1]
          : [1, 1, 1],
      }}
      transition={{
        duration: isThink ? 2.5 : isTalk ? 0.5 : isCelebrate ? 0.7 : 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

// ─── Feather Ruffle ───
const FeatherRuffle = ({ mood, width }: { mood: CharacterMood; width: number }) => {
  const isCelebrate = mood === "celebrate";
  const isSurprised = mood === "surprised";
  const intensity = isCelebrate ? 1.5 : isSurprised ? 1.2 : 0.6;

  return (
    <>
      {/* Chest feather ruffle */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: width * 0.35,
          height: width * 0.2,
          left: "32%",
          top: "55%",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, hsla(35, 50%, 60%, 0.04) 0%, transparent 70%)",
          transformOrigin: "center top",
        }}
        animate={{
          scaleY: [1, 1 + 0.04 * intensity, 1 - 0.02 * intensity, 1 + 0.02 * intensity, 1],
          scaleX: [1, 1 + 0.02 * intensity, 1 - 0.01 * intensity, 1],
        }}
        transition={{
          duration: isCelebrate ? 0.6 : 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Side feather wisps */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`wisp-${i}`}
          className="absolute pointer-events-none"
          style={{
            width: 2 + Math.random() * 3,
            height: 8 + Math.random() * 10,
            left: `${25 + i * 15}%`,
            top: `${45 + (i % 2) * 10}%`,
            borderRadius: "50%",
            background: `hsla(30, 40%, 50%, ${0.03 + i * 0.01})`,
            transformOrigin: "bottom center",
          }}
          animate={{
            rotate: [0, (i % 2 === 0 ? 1 : -1) * 5 * intensity, 0],
            y: [0, -2 * intensity, 0],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 2 + i * 0.5,
            delay: i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
};

// ─── Blink Overlay ───
const BlinkOverlay = ({ width }: { width: number }) => {
  return (
    <>
      {/* Left eye blink line */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: width * 0.09,
          height: 2,
          left: "37%",
          top: "32%",
          borderRadius: "50%",
          background: "hsla(30, 30%, 30%, 0.5)",
          transformOrigin: "center",
        }}
        animate={{
          scaleY: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          opacity: [0, 0, 0, 0.7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Right eye blink line */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: width * 0.09,
          height: 2,
          left: "53%",
          top: "32%",
          borderRadius: "50%",
          background: "hsla(30, 30%, 30%, 0.5)",
          transformOrigin: "center",
        }}
        animate={{
          scaleY: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          opacity: [0, 0, 0, 0.7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.02,
        }}
      />
    </>
  );
};

// ─── Breathing ───
const BreathingOverlay = ({ mood, width }: { mood: CharacterMood; width: number }) => {
  const isSad = mood === "sad";
  const rate = isSad ? 2 : 3.5;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: width * 0.4,
        height: width * 0.25,
        left: "30%",
        top: "50%",
        borderRadius: "50%",
        transformOrigin: "center center",
      }}
      animate={{
        scaleY: [1, 1.025, 1],
        scaleX: [1, 1.012, 1],
      }}
      transition={{
        duration: rate,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

// ─── Tail Wag (celebrate/wave) ───
const TailWag = ({ mood, width }: { mood: CharacterMood; width: number }) => {
  const isActive = mood === "celebrate" || mood === "wave" || mood === "surprised";
  if (!isActive) return null;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: width * 0.12,
        height: width * 0.15,
        right: "18%",
        bottom: "18%",
        transformOrigin: "center top",
        background: "transparent",
      }}
      animate={{
        rotate: [0, 8, -8, 6, -4, 0],
        scaleX: [1, 1.1, 0.9, 1.05, 1],
      }}
      transition={{
        duration: mood === "celebrate" ? 0.5 : 1,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

const OwlBodyAnimations = ({ mood, width }: OwlBodyAnimationsProps) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-[5]">
      <WingFlap side="left" mood={mood} width={width} />
      <WingFlap side="right" mood={mood} width={width} />
      <HeadBob mood={mood} width={width} />
      <FeatherRuffle mood={mood} width={width} />
      <BlinkOverlay width={width} />
      <BreathingOverlay mood={mood} width={width} />
      <TailWag mood={mood} width={width} />
    </div>
  );
};

export default OwlBodyAnimations;
