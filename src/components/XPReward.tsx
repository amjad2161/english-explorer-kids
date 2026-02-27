import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { addXP, getLevel, updateDailyProgress } from "@/lib/xp";
import { playXPGainSound } from "@/lib/sounds";

interface Props {
  amount: number;
  gameType?: string;
  show: boolean;
  onComplete?: () => void;
}

const XPReward = ({ amount, gameType, show, onComplete }: Props) => {
  const [visible, setVisible] = useState(false);
  const [levelUp, setLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(0);

  useEffect(() => {
    if (show && amount > 0) {
      const oldLevel = getLevel(addXP(0).totalXP).level;
      setPrevLevel(oldLevel);
      
      const newState = addXP(amount);
      if (gameType) updateDailyProgress(gameType);
      
      const newLevel = getLevel(newState.totalXP).level;
      setLevelUp(newLevel > oldLevel);
      setVisible(true);
      playXPGainSound(amount);
      
      const timer = setTimeout(() => {
        setVisible(false);
        setLevelUp(false);
        onComplete?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.5 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] pointer-events-none"
        >
          <div className="relative">
            {/* Main XP badge */}
            <motion.div
              className="bg-card/95 backdrop-blur-xl rounded-2xl px-6 py-3 shadow-xl border border-primary/30 flex items-center gap-3"
              animate={{ boxShadow: ["0 0 20px hsl(var(--primary) / 0.3)", "0 0 40px hsl(var(--primary) / 0.5)", "0 0 20px hsl(var(--primary) / 0.3)"] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <motion.span
                className="text-3xl"
                animate={{ rotate: [0, 360], scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8 }}
              >
                ✨
              </motion.span>
              <div className="text-center">
                <motion.p
                  className="font-display font-extrabold text-2xl text-primary"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  +{amount} XP
                </motion.p>
                {levelUp && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-xs font-display font-bold text-accent"
                  >
                    🎉 LEVEL UP!
                  </motion.p>
                )}
              </div>
            </motion.div>

            {/* Floating particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-primary/60"
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: (Math.random() - 0.5) * 120,
                  y: (Math.random() - 0.5) * 80 - 30,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 1, delay: i * 0.05, ease: "easeOut" }}
                style={{ top: "50%", left: "50%" }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default XPReward;
