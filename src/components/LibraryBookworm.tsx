import { motion } from "framer-motion";
import CharacterCanvas from "@/components/character/CharacterCanvas";

const LibraryBookworm = () => {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{
        bottom: "18%",
        left: "2%",
        width: 120,
        height: 150,
        zIndex: 1,
      }}
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.5, delay: 2.5, ease: "easeOut" }}
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

      {/* Real-time 3D character — no <img> */}
      <motion.div
        animate={{ y: [0, -3, 0], rotate: [0, 1, -1, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-full h-full relative z-10"
      >
        <CharacterCanvas
          mood="idle"
          animationKey={0}
          width={120}
          height={150}
        />
      </motion.div>
    </motion.div>
  );
};

export default LibraryBookworm;
