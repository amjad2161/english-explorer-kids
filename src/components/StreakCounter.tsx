import { motion, AnimatePresence } from "framer-motion";

interface Props {
  streak: number;
  bestStreak: number;
}

const streakEmojis = ["", "🔥", "🔥🔥", "🔥🔥🔥", "💥", "⚡", "🌟", "👑", "🏆"];

const StreakCounter = ({ streak, bestStreak }: Props) => {
  const emoji = streakEmojis[Math.min(streak, streakEmojis.length - 1)] || "🏆";
  const isHot = streak >= 3;
  const isOnFire = streak >= 5;

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
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-display font-bold text-sm relative overflow-hidden ${
              isOnFire ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-600" :
              isHot ? "bg-destructive/15 text-destructive" : "bg-accent/15 text-accent"
            }`}
          >
            {isOnFire && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}
            <span className="relative z-10">{emoji}</span>
            <span className="relative z-10">×{streak}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {bestStreak > 0 && (
        <div className="text-xs text-muted-foreground font-display flex items-center gap-1">
          🏅 {bestStreak}
        </div>
      )}
    </div>
  );
};

export default StreakCounter;
