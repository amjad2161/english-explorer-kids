import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
}

const colors = [
  "hsl(25, 95%, 55%)",
  "hsl(45, 100%, 60%)",
  "hsl(195, 85%, 55%)",
  "hsl(145, 65%, 48%)",
  "hsl(330, 85%, 60%)",
  "hsl(270, 70%, 65%)",
];

const Confetti = ({ show }: { show: boolean }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (show) {
      const newPieces: ConfettiPiece[] = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        rotation: Math.random() * 720 - 360,
      }));
      setPieces(newPieces);
      const timer = setTimeout(() => setPieces([]), 2500);
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
            top: "105%",
            opacity: 0,
            rotate: piece.rotation,
            scale: 0.5,
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 2,
            delay: piece.delay,
            ease: "easeIn",
          }}
          className="fixed z-50 pointer-events-none"
          style={{
            width: "12px",
            height: "12px",
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            backgroundColor: piece.color,
          }}
        />
      ))}
    </AnimatePresence>
  );
};

export default Confetti;
