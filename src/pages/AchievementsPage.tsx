import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import {
  achievements, Achievement, achievementNames, achievementDescs,
  getUnlockedAchievements, tierColors, tierBorder,
} from "@/lib/achievements";
import { playClickSound } from "@/lib/sounds";
import { Lock, X } from "lucide-react";
import FloatingParticles from "@/components/FloatingParticles";

const isRareTier = (tier: string) => tier === "gold" || tier === "diamond";

const AchievementsPage = () => {
  const { lang, dir } = useLanguage();
  const unlocked = getUnlockedAchievements();
  const unlockedIds = new Set(unlocked.map(u => u.id));
  const [selectedLocked, setSelectedLocked] = useState<Achievement | null>(null);

  const tiers = ["bronze", "silver", "gold", "diamond"] as const;
  const tierLabels = {
    bronze: { he: "🥉 ארד", ar: "🥉 برونزي", en: "🥉 Bronze" },
    silver: { he: "🥈 כסף", ar: "🥈 فضي", en: "🥈 Silver" },
    gold: { he: "🥇 זהב", ar: "🥇 ذهبي", en: "🥇 Gold" },
    diamond: { he: "💎 יהלום", ar: "💎 ماسي", en: "💎 Diamond" },
  };

  const rareGlow: Record<string, string> = {
    gold: "0 0 20px hsl(var(--sunshine) / 0.25), 0 4px 15px hsl(var(--sunshine) / 0.1)",
    diamond: "0 0 20px hsl(var(--sky) / 0.25), 0 4px 15px hsl(var(--sky) / 0.1)",
  };

  const handleLockedClick = (achievement: Achievement) => {
    playClickSound();
    setSelectedLocked(achievement);
  };

  return (
    <div className="min-h-screen relative" dir={dir}>
      <FloatingParticles count={10} />

      {/* Locked achievement modal */}
      <AnimatePresence>
        {selectedLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={() => setSelectedLocked(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="card-kid max-w-xs w-full text-center relative overflow-hidden"
            >
              {/* Decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/10 pointer-events-none" />

              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedLocked(null)}
                className="absolute top-3 end-3 w-7 h-7 rounded-full bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </motion.button>

              {/* Lock animation */}
              <div className="relative z-10">
                <motion.div
                  className="w-24 h-24 rounded-3xl mx-auto mb-4 bg-muted/60 flex items-center justify-center relative"
                  animate={{ rotate: [0, -8, 8, -5, 5, 0] }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  {/* Shaking lock */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <Lock className="w-10 h-10 text-muted-foreground" />
                  </motion.div>

                  {/* Sparkle hints around the lock */}
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-primary/40"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        x: Math.cos((i / 4) * Math.PI * 2) * 40,
                        y: Math.sin((i / 4) * Math.PI * 2) * 40,
                      }}
                      transition={{ duration: 1.5, delay: 0.5 + i * 0.15, repeat: Infinity, repeatDelay: 1 }}
                    />
                  ))}
                </motion.div>

                {/* Hidden emoji peek */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl mb-3 grayscale opacity-30"
                >
                  {selectedLocked.emoji}
                </motion.div>

                {/* Achievement name */}
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="font-display text-lg font-bold text-foreground mb-1"
                >
                  {achievementNames[selectedLocked.id]?.[lang] || selectedLocked.id}
                </motion.h3>

                {/* Tier badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="inline-block mb-3"
                >
                  <span className={`text-xs font-display font-bold px-3 py-1 rounded-full bg-gradient-to-r ${tierColors[selectedLocked.tier]} text-white`}>
                    {tierLabels[selectedLocked.tier][lang]}
                  </span>
                </motion.div>

                {/* Requirement description */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-muted/50 rounded-xl px-4 py-3 mb-4"
                >
                  <p className="text-xs text-muted-foreground font-display font-semibold mb-1">
                    {lang === "he" ? "🎯 מה צריך:" : lang === "ar" ? "🎯 المطلوب:" : "🎯 Requirement:"}
                  </p>
                  <p className="text-sm font-body text-foreground font-medium">
                    {achievementDescs[selectedLocked.id]?.[lang] || ""}
                  </p>
                </motion.div>

                {/* Encouragement */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-xs text-muted-foreground font-body"
                >
                  {lang === "he" ? "🌟 המשך ללמוד ותפתח את זה!" : lang === "ar" ? "🌟 استمر بالتعلم وستفتحه!" : "🌟 Keep learning and you'll unlock it!"}
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto px-4 py-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="text-6xl mb-3">🏅</div>
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
                      whileHover={isUnlocked ? { scale: 1.06, y: -4 } : { scale: 1.04 }}
                      whileTap={!isUnlocked ? { scale: 0.96 } : undefined}
                      onClick={!isUnlocked ? () => handleLockedClick(achievement) : undefined}
                      className={`relative rounded-2xl p-4 text-center border-2 overflow-hidden ${
                        isUnlocked
                          ? `bg-card/90 backdrop-blur-sm ${tierBorder[tier]} shadow-md`
                          : "bg-muted/30 border-muted/40 cursor-pointer hover:border-primary/30 hover:bg-muted/50 transition-colors"
                      } ${isRare ? "animate-glow-pulse" : ""}`}
                      style={isRare ? { boxShadow: rareGlow[tier] } : {}}
                    >
                      {/* Shimmer stripe for rare unlocked */}
                      {isRare && (
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-r ${
                            tier === "diamond"
                              ? "from-transparent via-sky/15 to-transparent"
                              : "from-transparent via-sunshine/15 to-transparent"
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
                        {isUnlocked ? achievement.emoji : (
                          <Lock className="w-6 h-6 text-muted-foreground" />
                        )}
                        {/* Sparkle dots orbiting rare badges */}
                        {isRare && (
                          <>
                            {[0, 1, 2].map(j => (
                              <motion.div
                                key={j}
                                className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
                                style={{
                                  background: tier === "diamond" ? "hsl(var(--sky))" : "hsl(var(--sunshine))",
                                  boxShadow: `0 0 6px ${tier === "diamond" ? "hsl(var(--sky))" : "hsl(var(--sunshine))"}`,
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
                        {isUnlocked
                          ? (achievementNames[achievement.id]?.[lang] || achievement.id)
                          : "???"
                        }
                      </p>
                      <p className="text-xs text-muted-foreground font-body leading-tight relative z-10">
                        {isUnlocked
                          ? (achievementDescs[achievement.id]?.[lang] || "")
                          : (lang === "he" ? "לחץ לגלות 👆" : lang === "ar" ? "اضغط لاكتشاف 👆" : "Tap to discover 👆")
                        }
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
