import { motion } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import CharacterCanvas from "@/components/character/CharacterCanvas";
import { useCharacterStore } from "@/lib/characterStore";
import { playCompanionSound } from "@/lib/sounds";
import type { CharacterMood } from "@/lib/characterStore";

const LibraryBookworm = () => {
  const owlMood = useCharacterStore((s) => s.mood);
  const [localMood, setLocalMood] = useState<CharacterMood>("idle");
  const [animKey, setAnimKey] = useState(0);

  // Sync with owl mood and play sound
  useEffect(() => {
    if (owlMood === "celebrate") {
      setLocalMood("celebrate");
      setAnimKey((k) => k + 1);
      playCompanionSound('bookworm', 'excited');
    } else if (owlMood === "sad") {
      setLocalMood("sad");
      playCompanionSound('bookworm', 'sad');
    } else if (owlMood !== "idle") {
      setLocalMood("wave");
      playCompanionSound('bookworm', 'happy');
    }
    const timer = setTimeout(() => setLocalMood("idle"), 2000);
    return () => clearTimeout(timer);
  }, [owlMood]);

  // Click handler
  const handleClick = useCallback(() => {
    setLocalMood("talk");
    setAnimKey((k) => k + 1);
    playCompanionSound('bookworm', 'happy');
    setTimeout(() => setLocalMood("idle"), 2000);
  }, []);

  return (
    <motion.div
      className="absolute select-none"
      style={{
        bottom: "18%",
        left: "2%",
        width: 120,
        height: 150,
        zIndex: 1,
        cursor: "pointer",
        pointerEvents: "auto",
      }}
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.5, delay: 2.5, ease: "easeOut" }}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 120, height: 80, left: 0, bottom: 0,
          background: "radial-gradient(ellipse, hsl(100 50% 40% / 0.1), transparent 70%)",
          filter: "blur(15px)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        animate={{ y: [0, -3, 0], rotate: [0, 1, -1, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-full h-full relative z-10"
      >
        <CharacterCanvas
          mood={localMood}
          animationKey={animKey}
          width={120}
          height={150}
        />
      </motion.div>
    </motion.div>
  );
};

export default LibraryBookworm;
