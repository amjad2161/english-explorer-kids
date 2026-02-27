import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import CharacterCanvas from "@/components/character/CharacterCanvas";

/**
 * OwlPageEntrance — The owl flies in from the side on each page navigation,
 * does a dramatic landing with dust particles, then fades out.
 * Uses real-time 3D rendering — no <img> tags.
 */

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

const OwlPageEntrance = () => {
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [key, setKey] = useState("");
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    // Skip homepage
    if (location.pathname === "/") return;

    setKey(location.pathname + Date.now());
    setAnimKey((k) => k + 1);
    setShow(true);
    const timer = setTimeout(() => setShow(false), 1400);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={key}
          className="fixed inset-0 z-50 pointer-events-none flex items-end justify-center pb-[30vh]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
        >
          {/* Owl flying in — 3D canvas animated via container transform */}
          <motion.div
            className="relative"
            style={{
              filter: "drop-shadow(0 8px 20px hsl(var(--primary) / 0.3))",
            }}
            initial={{
              x: -300,
              y: -200,
              rotate: -25,
              scale: 0.4,
              opacity: 0,
            }}
            animate={{
              x: [-300, 30, -8, 0],
              y: [-200, -40, 8, 0],
              rotate: [-25, 10, -5, 0],
              scale: [0.4, 1.15, 0.92, 1],
              opacity: [0, 1, 1, 1],
            }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1.2, 0.36, 1],
              times: [0, 0.5, 0.75, 1],
            }}
          >
            <CharacterCanvas
              mood="wave"
              animationKey={animKey}
              width={96}
              height={96}
            />

            {/* Landing impact ring */}
            <motion.div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border-2 border-primary/30"
              initial={{ width: 0, height: 0, opacity: 0 }}
              animate={{
                width: [0, 100, 140],
                height: [0, 30, 40],
                opacity: [0, 0.5, 0],
              }}
              transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            />

            {/* Dust particles on landing */}
            {Array.from({ length: 8 }).map((_, i) => (
              <DustParticle key={i} index={i} />
            ))}

            {/* Sparkle burst */}
            {["✨", "⭐", "🌟"].map((emoji, i) => (
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
