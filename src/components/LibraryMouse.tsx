import { motion } from "framer-motion";
import mouseLibrarian from "@/assets/mouse-librarian.png";

/**
 * LibraryMouse — Pixar-style mouse librarian character.
 * Uses AI-generated 3D character image.
 */

const LibraryMouse = () => {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{
        bottom: "2%",
        left: "12%",
        width: 100,
        height: 130,
        zIndex: 1,
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.2, delay: 3, ease: "easeOut" }}
    >
      {/* Ambient glow */}
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

      <motion.img
        src={mouseLibrarian}
        alt="Mouse Librarian"
        draggable={false}
        className="w-full h-full object-contain select-none pointer-events-none relative z-10"
        style={{
          filter: "drop-shadow(0 5px 14px hsl(20 30% 8% / 0.5))",
        }}
        animate={{ y: [0, -2, 0], x: [0, 1, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

export default LibraryMouse;
