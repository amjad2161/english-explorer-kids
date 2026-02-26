import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Lock, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import {
  levels, isLevelUnlocked, isStageUnlocked, getLevelProgress,
  getStageProgress, getTotalEarnedStars,
} from "@/lib/levels";
import StarRating from "@/components/StarRating";
import LevelCompleteCelebration from "@/components/LevelCompleteCelebration";

const levelLightColors: Record<string, string> = {
  grass: "bg-grass-light", sky: "bg-sky-light", sunshine: "bg-sunshine-light", candy: "bg-candy-light",
};

const LevelsPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [totalStars, setTotalStars] = useState(0);
  const [celebration, setCelebration] = useState<{ levelNumber: number; emoji: string; stars: number } | null>(null);
  const [celebratedLevels, setCelebratedLevels] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem("celebrated-levels");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  const checkForCompletedLevels = useCallback(() => {
    for (const level of levels) {
      if (!isLevelUnlocked(level)) continue;
      const progress = getLevelProgress(level);
      const totalLevelStars = level.stages.reduce((a, s) => a + s.starsToComplete, 0);
      if (progress.completed === progress.total && progress.stars >= totalLevelStars && !celebratedLevels.has(level.id)) {
        setCelebration({ levelNumber: level.id, emoji: level.emoji, stars: progress.stars });
        const updated = new Set(celebratedLevels);
        updated.add(level.id);
        setCelebratedLevels(updated);
        localStorage.setItem("celebrated-levels", JSON.stringify([...updated]));
        break;
      }
    }
  }, [celebratedLevels]);

  useEffect(() => {
    setTotalStars(getTotalEarnedStars());
    checkForCompletedLevels();
  }, [checkForCompletedLevels]);

  const handleStageClick = (_levelId: number, stageId: string, type: string) => {
    const params = new URLSearchParams({ stage: stageId });
    const routes: Record<string, string> = {
      alphabet: "/alphabet", words: "/words", quiz: "/quiz", memory: "/memory",
      spelling: "/spelling", scramble: "/scramble", hangman: "/hangman",
    };
    navigate(`${routes[type]}?${params}`);
  };

  return (
    <div className="min-h-screen" dir="rtl">
      <LevelCompleteCelebration
        show={!!celebration}
        levelNumber={celebration?.levelNumber ?? 0}
        levelEmoji={celebration?.emoji ?? ""}
        totalStars={Math.min(celebration?.stars ?? 0, 8)}
        onClose={() => setCelebration(null)}
      />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">{t("levels.title")}</h1>
          <p className="text-muted-foreground font-body">{t("levels.subtitle")}</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-sunshine/20 px-4 py-2 rounded-full">
            <span className="text-xl">⭐</span>
            <span className="font-display font-bold text-lg">{totalStars} {t("home.stars")}</span>
          </div>
        </motion.div>

        <div className="relative">
          {levels.map((level, levelIndex) => {
            const unlocked = isLevelUnlocked(level);
            const progress = getLevelProgress(level);

            return (
              <motion.div key={level.id}
                initial={{ opacity: 0, x: levelIndex % 2 === 0 ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: levelIndex * 0.15, type: "spring" as const }}
                className="mb-8">
                <motion.div className={`card-kid relative overflow-hidden ${!unlocked ? "opacity-60" : ""}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                        unlocked ? `${level.gradient} text-primary-foreground` : "bg-muted"
                      }`}>
                        {unlocked ? (progress.completed === progress.total ? "✅" : level.emoji) : <Lock className="w-6 h-6 text-muted-foreground" />}
                      </div>
                      <div>
                        <h2 className="font-display text-xl font-bold">{t("home.level")} {level.id}: {t(`level.${level.id}`)}</h2>
                        <p className="text-sm text-muted-foreground">
                          {unlocked ? `${progress.completed}/${progress.total} ${t("levels.stagesCompleted")}` : `${t("levels.needStars")} ${level.starsToUnlock} ⭐ ${t("levels.toUnlock")}`}
                        </p>
                      </div>
                    </div>
                    {unlocked && <StarRating earned={progress.stars} total={level.stages.reduce((a, s) => a + s.starsToComplete, 0)} size={16} />}
                  </div>

                  {unlocked && (
                    <>
                      <div className="progress-bar h-2 mb-4">
                        <div className="progress-bar-fill" style={{ width: `${(progress.completed / progress.total) * 100}%` }} />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {level.stages.map((stage, stageIndex) => {
                          const stageUnlocked = isStageUnlocked(level, stageIndex);
                          const sp = getStageProgress(stage.id);
                          return (
                            <motion.button key={stage.id}
                              whileHover={stageUnlocked ? { scale: 1.05, y: -3 } : {}}
                              whileTap={stageUnlocked ? { scale: 0.95 } : {}}
                              onClick={() => stageUnlocked && handleStageClick(level.id, stage.id, stage.type)}
                              disabled={!stageUnlocked}
                              className={`rounded-2xl p-3 text-center transition-all relative ${
                                sp.completed ? `${levelLightColors[level.color]} border-2 border-accent`
                                : stageUnlocked ? `${levelLightColors[level.color]} border-2 border-transparent hover:border-primary cursor-pointer`
                                : "bg-muted/50 opacity-50 cursor-not-allowed"
                              }`}>
                              {sp.completed && (
                                <div className="absolute -top-1 -left-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                                  <Check className="w-3 h-3 text-accent-foreground" />
                                </div>
                              )}
                              <span className="text-2xl block mb-1">{stageUnlocked ? stage.emoji : "🔒"}</span>
                              <p className="font-display text-xs font-bold leading-tight">{stage.title}</p>
                              {sp.completed && <div className="mt-1"><StarRating earned={sp.starsEarned} total={stage.starsToComplete} size={10} /></div>}
                            </motion.button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {!unlocked && (
                    <div className="text-center py-4">
                      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-4xl mb-2">🔒</motion.div>
                      <p className="font-display font-semibold text-muted-foreground">
                        {t("levels.collectMore")} {level.starsToUnlock - totalStars} {t("levels.moreStarsToUnlock")}
                      </p>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelsPage;
