import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, forwardRef } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  size: number;
  shape: "circle" | "square" | "star" | "triangle";
  drift: number;
  wobble: number;
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
  "hsl(180, 70%, 50%)",
  "hsl(300, 80%, 65%)",
];

const Confetti = forwardRef<HTMLDivElement, { show: boolean }>(({ show }, _ref) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (show) {
      const newPieces: ConfettiPiece[] = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.8,
        rotation: Math.random() * 1440 - 720,
        size: 5 + Math.random() * 12,
        shape: (["circle", "square", "star", "triangle"] as const)[Math.floor(Math.random() * 4)],
        drift: (Math.random() - 0.5) * 150,
        wobble: Math.random() * 30,
      }));
      setPieces(newPieces);
      const timer = setTimeout(() => setPieces([]), 3500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const getShape = (shape: ConfettiPiece["shape"]) => {
    switch (shape) {
      case "circle": return "50%";
      case "star": return "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";
      case "triangle": return "polygon(50% 0%, 0% 100%, 100% 100%)";
      default: return "3px";
    }
  };

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
            scale: 0,
          }}
          animate={{
            top: "115%",
            opacity: [1, 1, 0.8, 0],
            rotate: piece.rotation,
            scale: [0, 1.4, 1, 0.6],
            x: [0, piece.drift * 0.3, piece.drift, piece.drift * 1.2],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 3,
            delay: piece.delay,
            ease: [0.22, 0.61, 0.36, 1],
          }}
          className="fixed z-50 pointer-events-none"
          style={{
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            clipPath: piece.shape !== "circle" ? getShape(piece.shape) : undefined,
            borderRadius: piece.shape === "circle" ? "50%" : piece.shape === "square" ? "3px" : undefined,
            backgroundColor: piece.color,
            boxShadow: `0 0 8px ${piece.color}`,
          }}
        />
      ))}
    </AnimatePresence>
  );
});

Confetti.displayName = "Confetti";

export default Confetti;
