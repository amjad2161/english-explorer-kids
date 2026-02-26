import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface ScoreEvent {
  id: number;
  points: number;
  x: number;
  y: number;
  label?: string;
}

let nextId = 0;

export const useScorePopups = () => {
  const [popups, setPopups] = useState<ScoreEvent[]>([]);

  const addPopup = (points: number, label?: string) => {
    const id = nextId++;
    setPopups(prev => [...prev, { id, points, x: 40 + Math.random() * 20, y: 30 + Math.random() * 20, label }]);
    setTimeout(() => setPopups(prev => prev.filter(p => p.id !== id)), 1200);
  };

  return { popups, addPopup };
};

const ScorePopup = ({ popups }: { popups: ScoreEvent[] }) => (
  <div className="fixed inset-0 pointer-events-none z-40">
    <AnimatePresence>
      {popups.map(p => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, y: 0, scale: 0.5 }}
          animate={{ opacity: 0, y: -80, scale: 1.3 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute font-display font-bold text-2xl"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          <span className="text-accent drop-shadow-lg">
            +{p.points} {p.label || ""}
          </span>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

export default ScorePopup;
