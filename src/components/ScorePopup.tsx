import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ScoreEvent {
  id: number;
  points: number;
  x: number;
  y: number;
  label?: string;
  particles: { angle: number; dist: number; color: string }[];
}

let nextId = 0;

const particleColors = [
  "hsl(25, 95%, 55%)", "hsl(45, 100%, 60%)", "hsl(145, 65%, 48%)",
  "hsl(195, 85%, 55%)", "hsl(330, 85%, 60%)",
];

export const useScorePopups = () => {
  const [popups, setPopups] = useState<ScoreEvent[]>([]);

  const addPopup = (points: number, label?: string) => {
    const id = nextId++;
    const particles = Array.from({ length: 8 }, () => ({
      angle: Math.random() * 360,
      dist: 30 + Math.random() * 50,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
    }));
    setPopups(prev => [...prev, {
      id, points,
      x: 35 + Math.random() * 30,
      y: 25 + Math.random() * 25,
      label, particles,
    }]);
    setTimeout(() => setPopups(prev => prev.filter(p => p.id !== id)), 1500);
  };

  return { popups, addPopup };
};

const ScorePopup = ({ popups }: { popups: ScoreEvent[] }) => (
  <div className="fixed inset-0 pointer-events-none z-40">
    <AnimatePresence>
      {popups.map(p => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, y: 0, scale: 0.3 }}
          animate={{ opacity: 0, y: -100, scale: 1.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          {/* Score text */}
          <motion.span
            className="font-display font-extrabold text-3xl text-accent drop-shadow-lg block text-center"
            initial={{ scale: 0, rotateZ: -15 }}
            animate={{ scale: [0, 1.4, 1], rotateZ: [15, -5, 0] }}
            transition={{ duration: 0.4, type: "spring", stiffness: 400 }}
          >
            +{p.points}
          </motion.span>
          {p.label && (
            <motion.span
              className="text-sm font-display font-bold text-primary block text-center mt-0.5"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {p.label}
            </motion.span>
          )}
          
          {/* Burst particles */}
          {p.particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
              style={{ backgroundColor: particle.color }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos(particle.angle * Math.PI / 180) * particle.dist,
                y: Math.sin(particle.angle * Math.PI / 180) * particle.dist,
                opacity: 0,
                scale: 0,
              }}
              transition={{ duration: 0.7, delay: i * 0.02, ease: "easeOut" }}
            />
          ))}
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

export default ScorePopup;
