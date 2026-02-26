import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Lock, Check, ChevronLeft } from "lucide-react";
import {
  levels,
  isLevelUnlocked,
  isStageUnlocked,
  getLevelProgress,
  getStageProgress,
  getTotalEarnedStars,
} from "@/lib/levels";
import StarRating from "@/components/StarRating";

const levelColors: Record<string, string> = {
  grass: "bg-grass",
  sky: "bg-sky",
  sunshine: "bg-primary",
  candy: "bg-candy",
};

const levelLightColors: Record<string, string> = {
  grass: "bg-grass-light",
  sky: "bg-sky-light",
  sunshine: "bg-sunshine-light",
  candy: "bg-candy-light",
};

const LevelsPage = () => {
  const navigate = useNavigate();
  const [totalStars, setTotalStars] = useState(0);
  const [, setRefresh] = useState(0);

  useEffect(() => {
    setTotalStars(getTotalEarnedStars());
  }, []);

  const handleStageClick = (levelId: number, stageId: string, type: string) => {
    // Navigate to the appropriate activity with stage context
    const params = new URLSearchParams({ stage: stageId });
    switch (type) {
      case "alphabet":
        navigate(`/alphabet?${params}`);
        break;
      case "words":
        navigate(`/words?${params}`);
        break;
      case "quiz":
        navigate(`/quiz?${params}`);
        break;
      case "memory":
        navigate(`/memory?${params}`);
        break;
    }
  };

  return (
    <div className="min-h-screen" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">
            🗺️ מסע הלמידה
          </h1>
          <p className="text-muted-foreground font-body">
            השלם שלבים כדי לפתוח רמות חדשות!
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-sunshine/20 px-4 py-2 rounded-full">
            <span className="text-xl">⭐</span>
            <span className="font-display font-bold text-lg">{totalStars} כוכבים</span>
          </div>
        </motion.div>

        {/* Levels Path */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute right-1/2 top-0 bottom-0 w-1 bg-border -translate-x-1/2 hidden md:block" />

          {levels.map((level, levelIndex) => {
            const unlocked = isLevelUnlocked(level);
            const progress = getLevelProgress(level);
            const isComplete = progress.completed === progress.total;

            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, x: levelIndex % 2 === 0 ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: levelIndex * 0.15, type: "spring" as const }}
                className="mb-8"
              >
                {/* Level Header */}
                <motion.div
                  className={`card-kid relative overflow-hidden ${
                    !unlocked ? "opacity-60" : ""
                  }`}
                >
                  {/* Level badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                          unlocked
                            ? `${level.gradient} text-primary-foreground`
                            : "bg-muted"
                        }`}
                      >
                        {unlocked ? (
                          isComplete ? "✅" : level.emoji
                        ) : (
                          <Lock className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h2 className="font-display text-xl font-bold">
                          רמה {level.id}: {level.name}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {unlocked
                            ? `${progress.completed}/${progress.total} שלבים הושלמו`
                            : `צריך ${level.starsToUnlock} ⭐ לפתיחה`}
                        </p>
                      </div>
                    </div>

                    {unlocked && (
                      <div className="text-left">
                        <StarRating earned={progress.stars} total={level.stages.reduce((a, s) => a + s.starsToComplete, 0)} size={16} />
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  {unlocked && (
                    <div className="progress-bar h-2 mb-4">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${(progress.completed / progress.total) * 100}%`,
                        }}
                      />
                    </div>
                  )}

                  {/* Stages */}
                  {unlocked && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {level.stages.map((stage, stageIndex) => {
                        const stageUnlocked = isStageUnlocked(level, stageIndex);
                        const stageProgress = getStageProgress(stage.id);

                        return (
                          <motion.button
                            key={stage.id}
                            whileHover={stageUnlocked ? { scale: 1.05, y: -3 } : {}}
                            whileTap={stageUnlocked ? { scale: 0.95 } : {}}
                            onClick={() => {
                              if (stageUnlocked) {
                                handleStageClick(level.id, stage.id, stage.type);
                              }
                            }}
                            disabled={!stageUnlocked}
                            className={`rounded-2xl p-3 text-center transition-all relative ${
                              stageProgress.completed
                                ? `${levelLightColors[level.color]} border-2 border-accent`
                                : stageUnlocked
                                ? `${levelLightColors[level.color]} border-2 border-transparent hover:border-primary cursor-pointer`
                                : "bg-muted/50 opacity-50 cursor-not-allowed"
                            }`}
                          >
                            {stageProgress.completed && (
                              <div className="absolute -top-1 -left-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-accent-foreground" />
                              </div>
                            )}

                            <span className="text-2xl block mb-1">
                              {stageUnlocked ? stage.emoji : "🔒"}
                            </span>
                            <p className="font-display text-xs font-bold leading-tight">
                              {stage.title}
                            </p>
                            {stageProgress.completed && (
                              <div className="mt-1">
                                <StarRating
                                  earned={stageProgress.starsEarned}
                                  total={stage.starsToComplete}
                                  size={10}
                                />
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  {/* Locked overlay message */}
                  {!unlocked && (
                    <div className="text-center py-4">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-4xl mb-2"
                      >
                        🔒
                      </motion.div>
                      <p className="font-display font-semibold text-muted-foreground">
                        אסוף {level.starsToUnlock - totalStars} כוכבים נוספים כדי לפתוח!
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
