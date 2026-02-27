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
              isLegendary ? "bg-sunshine/25 text-sunshine-foreground shadow-lg shadow-sunshine/15" :
              isOnFire ? "bg-accent/20 text-accent shadow-md shadow-accent/10" :
              isHot ? "bg-destructive/15 text-destructive" : "bg-accent/15 text-accent"
            }`}
          >
            {/* Animated fire glow background */}
            {isOnFire && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: isLegendary
                    ? "radial-gradient(circle, hsl(var(--sunshine) / 0.15), transparent)"
                    : "radial-gradient(circle, hsl(var(--accent) / 0.1), transparent)",
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
                color: ["hsl(var(--sunshine))", "hsl(var(--accent))", "hsl(var(--sunshine))"],
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
                    className="absolute w-1 h-1 rounded-full bg-sunshine"
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
