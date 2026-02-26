import { motion, AnimatePresence } from "framer-motion";

interface Props {
  streak: number;
  bestStreak: number;
}

const streakEmojis = ["", "🔥", "🔥🔥", "🔥🔥🔥", "💥", "⚡", "🌟", "👑", "🏆"];

const StreakCounter = ({ streak, bestStreak }: Props) => {
  const emoji = streakEmojis[Math.min(streak, streakEmojis.length - 1)] || "🏆";
  const isHot = streak >= 3;

  return (
    <div className="flex items-center gap-3">
      <AnimatePresence mode="wait">
        {streak > 0 && (
          <motion.div
            key={streak}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 400 }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-display font-bold text-sm ${
              isHot ? "bg-destructive/20 text-destructive" : "bg-accent/20 text-accent"
            }`}
          >
            <span>{emoji}</span>
            <span>×{streak}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {bestStreak > 0 && (
        <div className="text-xs text-muted-foreground font-display">
          🏅 {bestStreak}
        </div>
      )}
    </div>
  );
};

export default StreakCounter;
