import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  size: number;
  shape: "circle" | "square" | "star";
}

const colors = [
  "hsl(25, 95%, 55%)",
  "hsl(45, 100%, 60%)",
  "hsl(195, 85%, 55%)",
  "hsl(145, 65%, 48%)",
  "hsl(330, 85%, 60%)",
  "hsl(270, 70%, 65%)",
  "hsl(0, 85%, 60%)",
  "hsl(60, 100%, 55%)",
];

const Confetti = ({ show }: { show: boolean }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (show) {
      const newPieces: ConfettiPiece[] = Array.from({ length: 45 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.6,
        rotation: Math.random() * 1080 - 540,
        size: 6 + Math.random() * 10,
        shape: (["circle", "square", "star"] as const)[Math.floor(Math.random() * 3)],
      }));
      setPieces(newPieces);
      const timer = setTimeout(() => setPieces([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            top: "-5%",
            left: `${piece.x}%`,
            opacity: 1,
            rotate: 0,
            scale: 1,
          }}
          animate={{
            top: "110%",
            opacity: 0,
            rotate: piece.rotation,
            scale: [1, 1.2, 0.5],
            x: [0, (Math.random() - 0.5) * 80],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 2.5,
            delay: piece.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="fixed z-50 pointer-events-none"
          style={{
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            borderRadius: piece.shape === "circle" ? "50%" : piece.shape === "star" ? "2px" : "3px",
            backgroundColor: piece.color,
            boxShadow: `0 0 6px ${piece.color}`,
          }}
        />
      ))}
    </AnimatePresence>
  );
};

export default Confetti;
