/**
 * RewardBadge — animated badge displayed on level/story completion.
 * Shows star rating, XP earned, title, and message.
 */
import { motion } from "framer-motion";
import { Star, Zap } from "lucide-react";
import CharacterProxy from "@/components/character/CharacterProxy";

interface RewardBadgeProps {
  title: string;
  message: string;
  stars?: number; // 1-3
  xp?: number;
  onContinue?: () => void;
  continueLabel?: string;
}

const RewardBadge = ({ title, message, stars = 3, xp, onContinue, continueLabel = "Continue →" }: RewardBadgeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="flex flex-col items-center gap-4 p-6 text-center"
    >
      {/* Character celebrating */}
      <CharacterProxy mood="celebrate" size="lg" />

      {/* Trophy icon */}
      <motion.div
        initial={{ rotate: -10, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
        className="text-6xl"
      >
        🏆
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-extrabold text-foreground"
      >
        {title}
      </motion.h2>

      {/* Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-muted-foreground text-base max-w-xs"
      >
        {message}
      </motion.p>

      {/* Stars */}
      <motion.div className="flex gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        {[1, 2, 3].map((s) => (
          <motion.div
            key={s}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: s <= stars ? 1 : 0.6, rotate: 0 }}
            transition={{ delay: 0.6 + s * 0.15, type: "spring", stiffness: 300 }}
          >
            <Star
              className={`w-10 h-10 ${s <= stars ? "text-yellow-400 fill-yellow-400" : "text-muted stroke-muted"}`}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* XP earned */}
      {xp !== undefined && xp > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1, type: "spring" }}
          className="flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 rounded-full px-4 py-1.5 text-sm font-bold"
        >
          <Zap className="w-4 h-4" />
          +{xp} XP
        </motion.div>
      )}

      {/* Continue button */}
      {onContinue && (
        <motion.button
          type="button"
          onClick={onContinue}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          whileTap={{ scale: 0.95 }}
          className="mt-2 px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {continueLabel}
        </motion.button>
      )}
    </motion.div>
  );
};

export default RewardBadge;
