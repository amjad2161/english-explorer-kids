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
      const timer = setTimeout(onDone, 3500);
      return () => clearTimeout(timer);
    }
  }, [achievement, onDone]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ y: -100, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -100, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
        >
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 ${
            achievement.tier === "diamond" ? "border-cyan-400/60" :
            achievement.tier === "gold" ? "border-yellow-400/60" :
            achievement.tier === "silver" ? "border-slate-400/60" :
            "border-amber-500/60"
          } bg-card shadow-2xl`}>
            <motion.div
              animate={{ rotate: [0, 360], scale: [1, 1.3, 1] }}
              transition={{ duration: 1 }}
              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tierColors[achievement.tier]} flex items-center justify-center text-3xl shadow-lg`}
            >
              {achievement.emoji}
            </motion.div>
            <div>
              <p className="text-xs font-display font-semibold text-muted-foreground mb-0.5">
                {lang === "he" ? "🏅 הישג חדש!" : lang === "ar" ? "🏅 إنجاز جديد!" : "🏅 New Achievement!"}
              </p>
              <p className="font-display text-lg font-bold text-foreground">
                {achievementNames[achievement.id]?.[lang] || achievement.id}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementToast;
