import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Lock, Check, ChevronRight, Star, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import {
  levels, isLevelUnlocked, isStageUnlocked, getLevelProgress,
  getStageProgress, getTotalEarnedStars,
} from "@/lib/levels";
import StarRating from "@/components/StarRating";
import LevelCompleteCelebration from "@/components/LevelCompleteCelebration";
import FloatingParticles from "@/components/FloatingParticles";

const levelColors: Record<string, { gradient: string; bg: string; border: string; glow: string }> = {
  grass: { gradient: "from-grass to-grass/70", bg: "bg-grass/8", border: "border-grass/30", glow: "shadow-grass/20" },
  sky: { gradient: "from-sky to-sky/70", bg: "bg-sky/8", border: "border-sky/30", glow: "shadow-sky/20" },
  sunshine: { gradient: "from-primary to-sunshine", bg: "bg-sunshine/8", border: "border-sunshine/30", glow: "shadow-sunshine/20" },
  candy: { gradient: "from-candy to-candy/70", bg: "bg-candy/8", border: "border-candy/30", glow: "shadow-candy/20" },
};

const stageTypeIcons: Record<string, string> = {
  alphabet: "🔤", words: "📝", quiz: "🎯", memory: "🧩",
  spelling: "🐝", scramble: "🔀", hangman: "🎭",
};

const LevelsPage = () => {
  const navigate = useNavigate();
  const { t, lang, dir } = useLanguage();
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
    <div className="min-h-screen relative" dir={dir}>
      <FloatingParticles count={10} />
      <LevelCompleteCelebration
        show={!!celebration}
        levelNumber={celebration?.levelNumber ?? 0}
        levelEmoji={celebration?.emoji ?? ""}
        totalStars={Math.min(celebration?.stars ?? 0, 8)}
        onClose={() => setCelebration(null)}
      />
      
      <div className="max-w-3xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">
            {t("levels.title")}
          </h1>
          <p className="text-muted-foreground font-body mb-4">{t("levels.subtitle")}</p>
          
          {/* Stars counter with glow */}
          <motion.div
            className="inline-flex items-center gap-2.5 bg-sunshine/15 border border-sunshine/20 px-5 py-2.5 rounded-full shadow-lg"
            whileHover={{ scale: 1.05 }}
            animate={{ boxShadow: ["0 0 15px hsl(var(--sunshine) / 0.1)", "0 0 25px hsl(var(--sunshine) / 0.2)", "0 0 15px hsl(var(--sunshine) / 0.1)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <motion.span
              className="text-xl"
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⭐
            </motion.span>
            <span className="font-display font-bold text-lg">{totalStars} {t("home.stars")}</span>
          </motion.div>
        </motion.div>

        {/* Level path */}
        <div className="relative">
          {/* Connecting path line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-gradient-to-b from-grass/30 via-primary/30 to-candy/30 rounded-full hidden md:block" />
          
          {levels.map((level, levelIndex) => {
            const unlocked = isLevelUnlocked(level);
            const progress = getLevelProgress(level);
            const colors = levelColors[level.color] || levelColors.grass;
            const isComplete = progress.completed === progress.total;

            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, x: levelIndex % 2 === 0 ? 40 : -40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: levelIndex * 0.15, type: "spring", stiffness: 150 }}
                className="mb-8 relative"
              >
                {/* Path node indicator */}
                <div className="hidden md:flex absolute left-1/2 top-6 -translate-x-1/2 z-20">
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg border-2 ${
                      isComplete
                        ? "bg-accent border-accent text-accent-foreground"
                        : unlocked
                        ? `bg-gradient-to-br ${colors.gradient} border-white/30 text-white`
                        : "bg-muted border-muted-foreground/20 text-muted-foreground"
                    }`}
                    animate={unlocked && !isComplete ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {isComplete ? <Check className="w-5 h-5" /> : unlocked ? level.id : <Lock className="w-4 h-4" />}
                  </motion.div>
                </div>

                <motion.div
                  className={`card-kid relative overflow-hidden border-2 ${
                    !unlocked ? "opacity-50 border-muted/30" : 
                    isComplete ? `${colors.border} border-accent/30` : colors.border
                  }`}
                  whileHover={unlocked ? { y: -4 } : {}}
                >
                  {/* Decorative glow for unlocked levels */}
                  {unlocked && (
                    <div className={`absolute inset-0 ${colors.bg} pointer-events-none`} />
                  )}
                  
                  {/* Complete sparkle effect */}
                  {isComplete && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: "linear-gradient(135deg, transparent, hsl(var(--accent) / 0.05), transparent)" }}
                    />
                  )}

                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${
                          unlocked
                            ? `bg-gradient-to-br ${colors.gradient} text-white`
                            : "bg-muted"
                        }`}
                        animate={unlocked ? { rotate: [0, 3, -3, 0] } : {}}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        {unlocked ? (isComplete ? "✅" : level.emoji) : <Lock className="w-6 h-6 text-muted-foreground" />}
                      </motion.div>
                      <div>
                        <h2 className="font-display text-xl font-bold flex items-center gap-2">
                          {t("home.level")} {level.id}: {t(`level.${level.id}`)}
                          {isComplete && (
                            <Sparkles className="w-4 h-4 text-accent" />
                          )}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {unlocked
                            ? `${progress.completed}/${progress.total} ${t("levels.stagesCompleted")}`
                            : `${t("levels.needStars")} ${level.starsToUnlock} ⭐ ${t("levels.toUnlock")}`
                          }
                        </p>
                      </div>
                    </div>
                    {unlocked && (
                      <StarRating
                        earned={progress.stars}
                        total={level.stages.reduce((a, s) => a + s.starsToComplete, 0)}
                        size={16}
                      />
                    )}
                  </div>

                  {unlocked && (
                    <>
                      {/* Progress bar */}
                      <div className="progress-bar h-2.5 mb-5 relative z-10">
                        <motion.div
                          className="progress-bar-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${(progress.completed / progress.total) * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: levelIndex * 0.15 + 0.3 }}
                        />
                      </div>

                      {/* Stages grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
                        {level.stages.map((stage, stageIndex) => {
                          const stageUnlocked = isStageUnlocked(level, stageIndex);
                          const sp = getStageProgress(stage.id);
                          
                          return (
                            <motion.button
                              key={stage.id}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: levelIndex * 0.15 + stageIndex * 0.05 + 0.4, type: "spring" }}
                              whileHover={stageUnlocked ? { scale: 1.06, y: -4 } : {}}
                              whileTap={stageUnlocked ? { scale: 0.95 } : {}}
                              onClick={() => stageUnlocked && handleStageClick(level.id, stage.id, stage.type)}
                              disabled={!stageUnlocked}
                              className={`rounded-2xl p-3.5 text-center relative overflow-hidden group ${
                                sp.completed
                                  ? `${colors.bg} border-2 border-accent/40 shadow-md`
                                  : stageUnlocked
                                  ? `${colors.bg} border-2 border-transparent hover:border-primary/40 cursor-pointer shadow-sm`
                                  : "bg-muted/30 opacity-40 cursor-not-allowed"
                              }`}
                            >
                              {/* Completed badge */}
                              {sp.completed && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute -top-1 -start-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow-sm z-10"
                                >
                                  <Check className="w-3.5 h-3.5 text-accent-foreground" />
                                </motion.div>
                              )}
                              
                              {/* Type icon */}
                              <div className="text-xs text-muted-foreground/60 mb-0.5">
                                {stageTypeIcons[stage.type] || "📋"}
                              </div>
                              
                              {/* Stage emoji */}
                              <motion.span
                                className="text-2xl block mb-1"
                                animate={stageUnlocked ? { rotate: [0, 5, -5, 0] } : {}}
                                transition={{ duration: 3, repeat: Infinity, delay: stageIndex * 0.3 }}
                              >
                                {stageUnlocked ? stage.emoji : "🔒"}
                              </motion.span>
                              
                              <p className="font-display text-xs font-bold leading-tight">
                                {lang === "en" ? stage.titleEn : stage.title}
                              </p>
                              
                              {/* Stars display */}
                              {sp.completed && (
                                <div className="mt-1.5">
                                  <StarRating earned={sp.starsEarned} total={stage.starsToComplete} size={10} />
                                </div>
                              )}
                              
                              {/* Hover arrow */}
                              {stageUnlocked && !sp.completed && (
                                <motion.div
                                  className="absolute bottom-1 end-1 text-primary/40 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </motion.div>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Locked level */}
                  {!unlocked && (
                    <div className="text-center py-6 relative z-10">
                      <motion.div
                        animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="text-5xl mb-3"
                      >
                        🔒
                      </motion.div>
                      <p className="font-display font-semibold text-muted-foreground">
                        {t("levels.collectMore")} {level.starsToUnlock - totalStars} {t("levels.moreStarsToUnlock")}
                      </p>
                      {/* Progress towards unlock */}
                      <div className="mt-3 max-w-[200px] mx-auto">
                        <div className="progress-bar h-2">
                          <motion.div
                            className="progress-bar-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((totalStars / level.starsToUnlock) * 100, 100)}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-display">
                          {totalStars}/{level.starsToUnlock} ⭐
                        </p>
                      </div>
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
