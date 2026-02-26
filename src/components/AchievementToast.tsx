import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Achievement, achievementNames, tierColors } from "@/lib/achievements";
import { useLanguage } from "@/lib/i18n";
import { playStarSound } from "@/lib/sounds";

interface AchievementToastProps {
  achievement: Achievement | null;
  onDone: () => void;
}

const AchievementToast = ({ achievement, onDone }: AchievementToastProps) => {
  const { lang } = useLanguage();

  useEffect(() => {
    if (achievement) {
      playStarSound();
      const timer = setTimeout(onDone, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onDone]);

  const tierBg: Record<string, string> = {
    bronze: "border-amber-500/50 shadow-amber-500/20",
    silver: "border-slate-400/50 shadow-slate-400/20",
    gold: "border-yellow-400/50 shadow-yellow-400/20",
    diamond: "border-cyan-400/50 shadow-cyan-400/20",
  };

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ y: -120, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -120, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100]"
        >
          <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border-2 ${tierBg[achievement.tier]} bg-card/95 backdrop-blur-xl shadow-2xl`}>
            <motion.div
              animate={{ rotate: [0, 360], scale: [1, 1.3, 1] }}
              transition={{ duration: 1.2 }}
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tierColors[achievement.tier]} flex items-center justify-center text-3xl shadow-lg`}
            >
              {achievement.emoji}
            </motion.div>
            <div>
              <motion.p
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs font-display font-semibold text-muted-foreground mb-0.5"
              >
                {lang === "he" ? "🏅 הישג חדש!" : lang === "ar" ? "🏅 إنجاز جديد!" : "🏅 New Achievement!"}
              </motion.p>
              <motion.p
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="font-display text-xl font-bold text-foreground"
              >
                {achievementNames[achievement.id]?.[lang] || achievement.id}
              </motion.p>
            </div>

            {/* Sparkle effects */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-sm pointer-events-none"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: (Math.random() - 0.5) * 100,
                  y: (Math.random() - 0.5) * 60,
                }}
                transition={{ duration: 1.5, delay: 0.3 + i * 0.15, repeat: 1 }}
                style={{ left: "50%", top: "50%" }}
              >
                ✨
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementToast;
