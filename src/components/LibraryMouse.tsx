import { motion } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import CharacterCanvas from "@/components/character/CharacterCanvas";
import { useCharacterStore } from "@/lib/characterStore";
import { playCompanionSound } from "@/lib/sounds";
import type { CharacterMood } from "@/lib/characterStore";

const LibraryMouse = () => {
  const owlMood = useCharacterStore((s) => s.mood);
  const [localMood, setLocalMood] = useState<CharacterMood>("idle");
  const [animKey, setAnimKey] = useState(0);

  // Sync with owl mood and play sound
  useEffect(() => {
    if (owlMood === "celebrate") {
      setLocalMood("celebrate");
      setAnimKey((k) => k + 1);
      playCompanionSound('mouse', 'excited');
    } else if (owlMood === "sad") {
      setLocalMood("sad");
      playCompanionSound('mouse', 'sad');
    } else if (owlMood !== "idle") {
      setLocalMood("wave");
      playCompanionSound('mouse', 'happy');
    }
    const timer = setTimeout(() => setLocalMood("idle"), 2000);
    return () => clearTimeout(timer);
  }, [owlMood]);

  // Click handler
  const handleClick = useCallback(() => {
    setLocalMood("surprised");
    setAnimKey((k) => k + 1);
    playCompanionSound('mouse', 'happy');
    setTimeout(() => setLocalMood("idle"), 2000);
  }, []);

  return (
    <motion.div
      className="absolute select-none"
      style={{
        bottom: "2%",
        left: "12%",
        width: 100,
        height: 130,
        zIndex: 1,
        cursor: "pointer",
        pointerEvents: "auto",
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.2, delay: 3, ease: "easeOut" }}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 100, height: 70, left: 0, bottom: 0,
          background: "radial-gradient(ellipse, hsl(340 30% 50% / 0.08), transparent 70%)",
          filter: "blur(15px)",
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        animate={{ y: [0, -2, 0], x: [0, 1, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="w-full h-full relative z-10"
      >
        <CharacterCanvas
          mood={localMood}
          animationKey={animKey}
          width={100}
          height={130}
        />
      </motion.div>
    </motion.div>
  );
};

export default LibraryMouse;
