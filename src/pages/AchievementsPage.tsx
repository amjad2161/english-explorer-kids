import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import {
  achievements, achievementNames, achievementDescs,
  getUnlockedAchievements, tierColors, tierBorder,
} from "@/lib/achievements";

const AchievementsPage = () => {
  const { t, lang, dir } = useLanguage();
  const unlocked = getUnlockedAchievements();
  const unlockedIds = new Set(unlocked.map(u => u.id));

  const tiers = ["bronze", "silver", "gold", "diamond"] as const;
  const tierLabels = {
    bronze: { he: "ארד", ar: "برونزي", en: "Bronze" },
    silver: { he: "כסף", ar: "فضي", en: "Silver" },
    gold: { he: "זהב", ar: "ذهبي", en: "Gold" },
    diamond: { he: "יהלום", ar: "ماسي", en: "Diamond" },
  };

  return (
    <div className="min-h-screen" dir={dir}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">
            {lang === "he" ? "🏅 הישגים ותגים" : lang === "ar" ? "🏅 إنجازات وشارات" : "🏅 Achievements & Badges"}
          </h1>
          <p className="text-muted-foreground font-body">
            {lang === "he" ? `${unlockedIds.size} מתוך ${achievements.length} נפתחו` :
             lang === "ar" ? `${unlockedIds.size} من ${achievements.length} مفتوحة` :
             `${unlockedIds.size} of ${achievements.length} unlocked`}
          </p>
          {/* Progress bar */}
          <div className="progress-bar h-3 max-w-xs mx-auto mt-3">
            <div className="progress-bar-fill" style={{ width: `${(unlockedIds.size / achievements.length) * 100}%` }} />
          </div>
        </motion.div>

        {tiers.map((tier) => {
          const tierAchievements = achievements.filter(a => a.tier === tier);
          if (tierAchievements.length === 0) return null;
          return (
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${tierColors[tier]}`} />
                {tierLabels[tier][lang]}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {tierAchievements.map((achievement, i) => {
                  const isUnlocked = unlockedIds.has(achievement.id);
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.05, type: "spring" }}
                      whileHover={isUnlocked ? { scale: 1.05, y: -3 } : {}}
                      className={`relative rounded-2xl p-4 text-center border-2 transition-all ${
                        isUnlocked
                          ? `bg-card ${tierBorder[tier]} shadow-md`
                          : "bg-muted/50 border-transparent opacity-50"
                      }`}
                    >
                      <motion.div
                        className={`w-14 h-14 rounded-xl mx-auto mb-2 flex items-center justify-center text-3xl ${
                          isUnlocked
                            ? `bg-gradient-to-br ${tierColors[tier]} shadow-lg`
                            : "bg-muted"
                        }`}
                        animate={isUnlocked ? { rotate: [0, 5, -5, 0] } : {}}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        {isUnlocked ? achievement.emoji : "🔒"}
                      </motion.div>
                      <p className="font-display text-sm font-bold text-foreground mb-0.5">
                        {achievementNames[achievement.id]?.[lang] || achievement.id}
                      </p>
                      <p className="text-xs text-muted-foreground font-body">
                        {achievementDescs[achievement.id]?.[lang] || ""}
                      </p>
                      {isUnlocked && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -end-1 text-lg"
                        >
                          ✅
                        </motion.span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsPage;
