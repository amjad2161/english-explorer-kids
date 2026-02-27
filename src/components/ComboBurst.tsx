import { motion, AnimatePresence } from "framer-motion";

interface Props {
  combo: number;
  show: boolean;
}

const comboLabels = [
  "", "Nice!", "Great!", "Amazing!", "Incredible!", "LEGENDARY!", "GODLIKE!", "UNSTOPPABLE!"
];

const comboColors = [
  "", "text-accent", "text-accent", "text-primary", "text-candy", "text-candy", "text-candy", "text-candy"
];

const ComboBurst = ({ combo, show }: Props) => {
  if (combo < 2) return null;
  
  const label = comboLabels[Math.min(combo, comboLabels.length - 1)];
  const colorClass = comboColors[Math.min(combo, comboColors.length - 1)];
  const ringCount = Math.min(combo, 4);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          {/* Expanding rings */}
          {[...Array(ringCount)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute inset-0 rounded-full border-2 ${
                combo >= 5 ? "border-candy/30" : "border-primary/25"
              }`}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 3 + i * 1.5, opacity: 0 }}
              transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
              style={{ width: 60, height: 60, marginLeft: -30, marginTop: -30 }}
            />
          ))}
          
          {/* Main text */}
          <motion.div
            className="text-center relative"
            initial={{ rotateZ: -10, y: 20 }}
            animate={{ rotateZ: [10, -5, 0], y: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.p
              className={`font-display font-extrabold text-4xl md:text-5xl ${colorClass} drop-shadow-lg`}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.6, repeat: 2 }}
            >
              {label}
            </motion.p>
            <motion.p
              className="font-display font-bold text-lg text-muted-foreground mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              ×{combo} Combo!
            </motion.p>
          </motion.div>
          
          {/* Sparkle particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`spark-${i}`}
              className="absolute w-1.5 h-1.5 rounded-full bg-sunshine"
              style={{ top: "50%", left: "50%" }}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: Math.cos(i * 30 * Math.PI / 180) * (60 + Math.random() * 40),
                y: Math.sin(i * 30 * Math.PI / 180) * (60 + Math.random() * 40),
                opacity: 0,
                scale: [1, 1.5, 0],
              }}
              transition={{ duration: 0.8, delay: i * 0.03, ease: "easeOut" }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ComboBurst;
