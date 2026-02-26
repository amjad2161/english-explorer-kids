import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import {
  achievements, achievementNames, achievementDescs,
  getUnlockedAchievements, tierColors, tierBorder,
} from "@/lib/achievements";

const isRareTier = (tier: string) => tier === "gold" || tier === "diamond";

const AchievementsPage = () => {
  const { lang, dir } = useLanguage();
  const unlocked = getUnlockedAchievements();
  const unlockedIds = new Set(unlocked.map(u => u.id));

  const tiers = ["bronze", "silver", "gold", "diamond"] as const;
  const tierLabels = {
    bronze: { he: "🥉 ארד", ar: "🥉 برونزي", en: "🥉 Bronze" },
    silver: { he: "🥈 כסף", ar: "🥈 فضي", en: "🥈 Silver" },
    gold: { he: "🥇 זהב", ar: "🥇 ذهبي", en: "🥇 Gold" },
    diamond: { he: "💎 יהלום", ar: "💎 ماسي", en: "💎 Diamond" },
  };

  const rareGlow: Record<string, string> = {
    gold: "0 0 20px hsl(45, 100%, 55%, 0.25), 0 4px 15px hsl(45, 100%, 55%, 0.1)",
    diamond: "0 0 20px hsl(195, 85%, 55%, 0.25), 0 4px 15px hsl(195, 85%, 55%, 0.1)",
  };

  return (
    <div className="min-h-screen relative" dir={dir}>
      <div className="bg-particles" />
      <div className="max-w-3xl mx-auto px-4 py-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <motion.div
            className="text-6xl mb-3"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🏅
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">
            {lang === "he" ? "הישגים ותגים" : lang === "ar" ? "إنجازات وشارات" : "Achievements & Badges"}
          </h1>
          <p className="text-muted-foreground font-body mb-4">
            {lang === "he" ? `${unlockedIds.size} מתוך ${achievements.length} נפתחו` :
             lang === "ar" ? `${unlockedIds.size} من ${achievements.length} مفتوحة` :
             `${unlockedIds.size} of ${achievements.length} unlocked`}
          </p>
          <div className="progress-bar h-4 max-w-xs mx-auto">
            <div className="progress-bar-fill" style={{ width: `${(unlockedIds.size / achievements.length) * 100}%` }} />
          </div>
        </motion.div>

        {tiers.map((tier, ti) => {
          const tierAchievements = achievements.filter(a => a.tier === tier);
          if (tierAchievements.length === 0) return null;
          const unlockedCount = tierAchievements.filter(a => unlockedIds.has(a.id)).length;
          const rare = isRareTier(tier);

          return (
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ti * 0.1 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg font-bold flex items-center gap-2">
                  {tierLabels[tier][lang]}
                </h2>
                <span className="text-xs font-display text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {unlockedCount}/{tierAchievements.length}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {tierAchievements.map((achievement, i) => {
                  const isUnlocked = unlockedIds.has(achievement.id);
                  const isRare = rare && isUnlocked;

                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: ti * 0.1 + i * 0.04, type: "spring" }}
                      whileHover={isUnlocked ? { scale: 1.06, y: -4 } : { scale: 1.02 }}
                      className={`relative rounded-2xl p-4 text-center border-2 transition-all overflow-hidden ${
                        isUnlocked
                          ? `bg-card/90 backdrop-blur-sm ${tierBorder[tier]} shadow-md`
                          : "bg-muted/30 border-transparent opacity-50 grayscale"
                      } ${isRare ? "animate-glow-pulse" : ""}`}
                      style={isRare ? { boxShadow: rareGlow[tier] } : {}}
                    >
                      {/* Shimmer stripe for rare unlocked */}
                      {isRare && (
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-r ${
                            tier === "diamond"
                              ? "from-transparent via-cyan-300/15 to-transparent"
                              : "from-transparent via-yellow-300/15 to-transparent"
                          } pointer-events-none`}
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                        />
                      )}

                      {/* Rainbow border animation for diamond */}
                      {tier === "diamond" && isUnlocked && (
                        <div className="absolute inset-0 rounded-2xl animate-rainbow-border pointer-events-none" />
                      )}

                      <motion.div
                        className={`w-16 h-16 rounded-2xl mx-auto mb-2 flex items-center justify-center text-3xl relative ${
                          isUnlocked
                            ? `bg-gradient-to-br ${tierColors[tier]} shadow-lg`
                            : "bg-muted"
                        }`}
                        animate={isRare
                          ? { rotate: [0, 5, -5, 0], scale: [1, 1.08, 1] }
                          : isUnlocked ? { rotate: [0, 3, -3, 0] } : {}}
                        transition={{ duration: isRare ? 3 : 4, repeat: Infinity }}
                      >
                        {isUnlocked ? achievement.emoji : "🔒"}
                        {/* Sparkle dots orbiting rare badges */}
                        {isRare && (
                          <>
                            {[0, 1, 2].map(j => (
                              <motion.div
                                key={j}
                                className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
                                style={{
                                  background: tier === "diamond" ? "hsl(195, 85%, 65%)" : "hsl(45, 100%, 65%)",
                                  boxShadow: `0 0 6px ${tier === "diamond" ? "hsl(195, 85%, 65%)" : "hsl(45, 100%, 65%)"}`,
                                }}
                                animate={{
                                  x: [
                                    Math.cos((j / 3) * Math.PI * 2) * 28,
                                    Math.cos((j / 3) * Math.PI * 2 + Math.PI) * 28,
                                    Math.cos((j / 3) * Math.PI * 2 + Math.PI * 2) * 28,
                                  ],
                                  y: [
                                    Math.sin((j / 3) * Math.PI * 2) * 28,
                                    Math.sin((j / 3) * Math.PI * 2 + Math.PI) * 28,
                                    Math.sin((j / 3) * Math.PI * 2 + Math.PI * 2) * 28,
                                  ],
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: j * 0.5 }}
                              />
                            ))}
                          </>
                        )}
                      </motion.div>

                      <p className="font-display text-sm font-bold text-foreground mb-0.5 relative z-10">
                        {achievementNames[achievement.id]?.[lang] || achievement.id}
                      </p>
                      <p className="text-xs text-muted-foreground font-body leading-tight relative z-10">
                        {achievementDescs[achievement.id]?.[lang] || ""}
                      </p>

                      {isUnlocked && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1.5 -end-1.5 text-lg drop-shadow-sm"
                        >
                          {isRare ? (tier === "diamond" ? "💎" : "🥇") : "✅"}
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
