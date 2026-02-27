import { motion } from "framer-motion";
import bookworm from "@/assets/bookworm.png";

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

      <motion.img
        src={bookworm}
        alt="Bookworm"
        draggable={false}
        className="w-full h-full object-contain select-none pointer-events-none relative z-10"
        style={{
          filter: "drop-shadow(0 6px 16px hsl(20 30% 8% / 0.5))",
          WebkitMaskImage: "radial-gradient(ellipse 42% 48% at 50% 44%, black 50%, rgba(0,0,0,0.5) 65%, transparent 72%)",
          maskImage: "radial-gradient(ellipse 42% 48% at 50% 44%, black 50%, rgba(0,0,0,0.5) 65%, transparent 72%)",
        }}
        animate={{ y: [0, -3, 0], rotate: [0, 1, -1, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

export default LibraryBookworm;
