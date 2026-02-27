import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import CharacterCanvas from "@/components/character/CharacterCanvas";

/**
 * OwlPageEntrance — The owl flies in on page navigation.
 * Game pages get a special dramatic entrance with power-up effects.
 */

const GAME_ROUTES = ["/quiz", "/memory", "/spelling", "/scramble", "/hangman", "/pattern"];

const DustParticle = ({ index }: { index: number }) => {
  const side = index % 2 === 0 ? -1 : 1;
  const x = side * (20 + Math.random() * 40);
  const y = -(10 + Math.random() * 30);

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: 4 + Math.random() * 4,
        height: 4 + Math.random() * 4,
        bottom: 8,
        left: "50%",
        background: "hsl(var(--primary) / 0.3)",
      }}
      initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.8, 0],
        x: [0, x],
        y: [0, y],
        scale: [0, 1.2, 0.3],
      }}
      transition={{ duration: 0.7, delay: 0.35 + index * 0.04, ease: "easeOut" }}
    />
  );
};

// ─── Game-specific energy ring effect ───
const EnergyRing = ({ delay, size }: { delay: number; size: number }) => (
  <motion.div
    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
    style={{
      border: "2px solid hsl(var(--primary) / 0.4)",
      boxShadow: "0 0 12px hsl(var(--primary) / 0.2), inset 0 0 12px hsl(var(--primary) / 0.1)",
    }}
    initial={{ width: 0, height: 0, opacity: 0 }}
    animate={{
      width: [0, size, size * 1.3],
      height: [0, size, size * 1.3],
      opacity: [0, 0.7, 0],
    }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
  />
);

// ─── Power-up sparkle trail for games ───
const PowerSparkle = ({ index }: { index: number }) => {
  const angle = (index / 8) * Math.PI * 2;
  const radius = 50 + Math.random() * 30;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  const emojis = ["⚡", "🔥", "💥", "✨", "🌟", "⭐", "🎯", "🏆"];

  return (
    <motion.span
      className="absolute text-xs pointer-events-none"
      style={{ left: "50%", top: "50%" }}
      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
      animate={{
        opacity: [0, 1, 0.8, 0],
        scale: [0, 1.5, 1, 0.3],
        x: [0, x * 0.3, x],
        y: [0, y * 0.3, y],
      }}
      transition={{ duration: 0.8, delay: 0.4 + index * 0.06, ease: "easeOut" }}
    >
      {emojis[index % emojis.length]}
    </motion.span>
  );
};

// ─── "Ready?" text flash for games ───
const ReadyText = () => {
  const texts = ["!יאללה", "!בוא נשחק", "Ready?"];
  const text = texts[Math.floor(Math.random() * texts.length)];

  return (
    <motion.div
      className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap font-bold text-lg"
      style={{
        color: "hsl(var(--primary))",
        textShadow: "0 0 15px hsl(var(--primary) / 0.5), 0 2px 4px rgba(0,0,0,0.3)",
      }}
      initial={{ opacity: 0, scale: 0.5, y: 10 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1.2, 1, 0.8],
        y: [10, 0, 0, -10],
      }}
      transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
    >
      {text}
    </motion.div>
  );
};

const OwlPageEntrance = () => {
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [key, setKey] = useState("");
  const [animKey, setAnimKey] = useState(0);

  const isGame = useMemo(
    () => GAME_ROUTES.includes(location.pathname),
    [location.pathname]
  );

  useEffect(() => {
    if (location.pathname === "/") return;

    setKey(location.pathname + Date.now());
    setAnimKey((k) => k + 1);
    setShow(true);
    const timer = setTimeout(() => setShow(false), isGame ? 1800 : 1400);
    return () => clearTimeout(timer);
  }, [location.pathname, isGame]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={key}
          className="fixed inset-0 z-50 pointer-events-none flex items-end justify-center pb-[30vh]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
        >
          {/* Game: background flash */}
          {isGame && (
            <motion.div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(circle at 50% 60%, hsl(var(--primary) / 0.08), transparent 60%)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          )}

          {/* Owl flying in */}
          <motion.div
            className="relative"
            style={{
              filter: isGame
                ? "drop-shadow(0 0 25px hsl(var(--primary) / 0.5))"
                : "drop-shadow(0 8px 20px hsl(var(--primary) / 0.3))",
            }}
            initial={
              isGame
                ? { y: -400, x: 0, rotate: 0, scale: 0.3, opacity: 0 }
                : { x: -300, y: -200, rotate: -25, scale: 0.4, opacity: 0 }
            }
            animate={
              isGame
                ? {
                    y: [-400, 20, -15, 5, 0],
                    x: [0, 0, 0, 0, 0],
                    rotate: [0, 0, -8, 4, 0],
                    scale: [0.3, 0.6, 1.2, 0.9, 1.05],
                    opacity: [0, 0.8, 1, 1, 1],
                  }
                : {
                    x: [-300, 30, -8, 0],
                    y: [-200, -40, 8, 0],
                    rotate: [-25, 10, -5, 0],
                    scale: [0.4, 1.15, 0.92, 1],
                    opacity: [0, 1, 1, 1],
                  }
            }
            transition={
              isGame
                ? {
                    duration: 1,
                    ease: [0.22, 1.3, 0.36, 1],
                    times: [0, 0.3, 0.6, 0.8, 1],
                  }
                : {
                    duration: 0.8,
                    ease: [0.22, 1.2, 0.36, 1],
                    times: [0, 0.5, 0.75, 1],
                  }
            }
          >
            <CharacterCanvas
              mood={isGame ? "celebrate" : "wave"}
              animationKey={animKey}
              width={isGame ? 112 : 96}
              height={isGame ? 112 : 96}
            />

            {/* Game: "Ready?" text */}
            {isGame && <ReadyText />}

            {/* Game: Energy rings on landing */}
            {isGame && (
              <>
                <EnergyRing delay={0.5} size={80} />
                <EnergyRing delay={0.6} size={120} />
                <EnergyRing delay={0.7} size={160} />
              </>
            )}

            {/* Game: Power sparkle burst */}
            {isGame &&
              Array.from({ length: 8 }).map((_, i) => (
                <PowerSparkle key={`ps-${i}`} index={i} />
              ))}

            {/* Landing impact ring */}
            <motion.div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border-2 border-primary/30"
              initial={{ width: 0, height: 0, opacity: 0 }}
              animate={{
                width: [0, isGame ? 120 : 100, isGame ? 170 : 140],
                height: [0, isGame ? 35 : 30, isGame ? 50 : 40],
                opacity: [0, 0.5, 0],
              }}
              transition={{ duration: 0.6, delay: isGame ? 0.6 : 0.5, ease: "easeOut" }}
            />

            {/* Dust particles on landing */}
            {Array.from({ length: isGame ? 12 : 8 }).map((_, i) => (
              <DustParticle key={i} index={i} />
            ))}

            {/* Sparkle burst (non-game pages) */}
            {!isGame &&
              ["✨", "⭐", "🌟"].map((emoji, i) => (
                <motion.span
                  key={i}
                  className="absolute text-sm pointer-events-none"
                  style={{ left: "50%", top: "50%" }}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.3, 0.5],
                    x: [0, (i - 1) * 50],
                    y: [0, -30 - i * 15],
                  }}
                  transition={{ duration: 0.7, delay: 0.5 + i * 0.1 }}
                >
                  {emoji}
                </motion.span>
              ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OwlPageEntrance;