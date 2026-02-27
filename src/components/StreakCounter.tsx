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
  const isLegendary = streak >= 7;

  return (
    <div className="flex items-center gap-3">
      <AnimatePresence mode="wait">
        {streak > 0 && (
          <motion.div
            key={streak}
            initial={{ scale: 0, rotate: -30, y: 20 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            exit={{ scale: 0, rotate: 30, y: -20 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-display font-bold text-sm relative overflow-hidden ${
              isLegendary ? "bg-gradient-to-r from-amber-500/25 to-orange-600/25 text-amber-600 shadow-lg shadow-amber-500/15" :
              isOnFire ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-600 shadow-md shadow-orange-500/10" :
              isHot ? "bg-destructive/15 text-destructive" : "bg-accent/15 text-accent"
            }`}
          >
            {/* Animated fire glow background */}
            {isOnFire && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: isLegendary
                    ? "radial-gradient(circle, hsl(45, 100%, 60%, 0.15), transparent)"
                    : "radial-gradient(circle, hsl(25, 95%, 55%, 0.1), transparent)",
                }}
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            )}
            
            {/* Streak emoji with bounce */}
            <motion.span
              className="relative z-10"
              animate={isHot ? {
                scale: [1, 1.2, 1],
                rotate: [0, -5, 5, 0],
              } : {}}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              {emoji}
            </motion.span>
            
            {/* Streak number with emphasis */}
            <motion.span
              className="relative z-10 tabular-nums"
              animate={isLegendary ? {
                color: ["hsl(45, 100%, 45%)", "hsl(25, 95%, 55%)", "hsl(45, 100%, 45%)"],
              } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ×{streak}
            </motion.span>
            
            {/* Particle ring for legendary */}
            {isLegendary && (
              <>
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-amber-400"
                    animate={{
                      x: [0, Math.cos(i * Math.PI / 2) * 25],
                      y: [0, Math.sin(i * Math.PI / 2) * 12],
                      opacity: [1, 0],
                      scale: [1, 0],
                    }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                    style={{ top: "50%", left: "50%" }}
                  />
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {bestStreak > 0 && (
        <motion.div
          className="text-xs text-muted-foreground font-display flex items-center gap-1 bg-muted/40 px-2 py-0.5 rounded-full"
          whileHover={{ scale: 1.1 }}
        >
          🏅 {bestStreak}
        </motion.div>
      )}
    </div>
  );
};

export default StreakCounter;
