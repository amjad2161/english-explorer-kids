import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { getQuestionLocal } from "@/data/learningData";
import { generateDynamicQuiz } from "@/lib/quizGenerator";
import { playCorrectSound, playWrongSound, playStarSound, playComboSound, playVictoryFanfare } from "@/lib/sounds";
import { updateDailyProgress } from "@/lib/xp";
import { addQuizScore } from "@/lib/progress";
import { saveStageProgress } from "@/lib/levels";
import { saveBestStreak } from "@/lib/achievements";
import { trackGamePlayed } from "@/lib/statsTracker";
import StarRating from "@/components/StarRating";
import Confetti from "@/components/Confetti";
import StreakCounter from "@/components/StreakCounter";
import ScorePopup, { useScorePopups } from "@/components/ScorePopup";
import BackToLevels from "@/components/BackToLevels";
import XPReward from "@/components/XPReward";
import FloatingParticles from "@/components/FloatingParticles";
import ComboBurst from "@/components/ComboBurst";
import { RotateCcw, Zap, Target, Trophy } from "lucide-react";

const QUIZ_SIZE = 8;

const optionLabels = ["A", "B", "C", "D"];

const QuizPage = () => {
  const [searchParams] = useSearchParams();
  const stageId = searchParams.get("stage");
  const { t, lang, dir } = useLanguage();
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCombo, setShowCombo] = useState(false);
  const [quizKey, setQuizKey] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);
  const { popups, addPopup } = useScorePopups();

  const shuffledQuestions = useMemo(
    () => generateDynamicQuiz(QUIZ_SIZE, lang),
    [lang, quizKey]
  );

  const question = shuffledQuestions[currentQ];

  const handleAnswer = useCallback((index: number) => {
    if (selected !== null) return;
    setSelected(index);
    const correct = index === question.correct;
    setIsCorrect(correct);
    if (correct) {
      const newStreak = streak + 1;
      const points = 10 + Math.min(newStreak, 5) * 5;
      setScore(s => s + points);
      setStreak(newStreak);
      setBestStreak(b => { const best = Math.max(b, newStreak); saveBestStreak(best); return best; });
      if (newStreak >= 3) {
        playComboSound(newStreak);
        setShowCombo(true);
        setTimeout(() => setShowCombo(false), 1200);
      } else playCorrectSound();
      addPopup(points, newStreak >= 3 ? `×${newStreak}` : "✓");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
    } else {
      setStreak(0);
      playWrongSound();
    }
    setTimeout(() => {
      if (currentQ < shuffledQuestions.length - 1) {
        setCurrentQ(q => q + 1);
        setSelected(null);
        setIsCorrect(null);
      } else {
        const finalScore = correct ? score + (10 + Math.min(streak + 1, 5) * 5) : score;
        const stars = Math.min(Math.ceil((finalScore / (QUIZ_SIZE * 30)) * 5), 5);
        addQuizScore(stars);
        setIsFinished(true);
        if (stageId) saveStageProgress(stageId, stars);
        if (stars >= 3) { playVictoryFanfare(); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 100); }
        // XP reward
        const xp = Math.max(10, finalScore);
        setXpAmount(xp);
        setShowXP(true);
        // Track stats
        const totalCorrect = correct ? (score > 0 ? Math.round(score / 15) + 1 : 1) : Math.round(score / 15);
        trackGamePlayed("quiz", totalCorrect, QUIZ_SIZE - totalCorrect, xp);
        updateDailyProgress("quiz");
      }
    }, 1500);
  }, [selected, question, currentQ, shuffledQuestions.length, score, streak, stageId, addPopup]);

  const restart = () => {
    setCurrentQ(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSelected(null);
    setIsCorrect(null);
    setIsFinished(false);
    setQuizKey(k => k + 1);
  };

  const stars = Math.min(Math.ceil((score / (QUIZ_SIZE * 30)) * 5), 5);
  const progress = ((currentQ + 1) / shuffledQuestions.length) * 100;

  if (!question && !isFinished) return null;

  return (
    <div className="min-h-screen relative" dir={dir}>
      <FloatingParticles count={10} />
      <Confetti show={showConfetti} />
      <ScorePopup popups={popups} />
      <ComboBurst combo={streak} show={showCombo} />
      <XPReward amount={xpAmount} show={showXP} gameType="quiz" onComplete={() => setShowXP(false)} />
      
      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        <BackToLevels />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">
            {t("quiz.title")}
          </h1>
          <p className="text-muted-foreground font-body">{t("quiz.subtitle")}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div
              key={`q-${currentQ}`}
              initial={{ opacity: 0, x: 60, rotateY: 15 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: -60, rotateY: -15 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              {/* Stats bar with visual upgrade */}
              <div className="card-glass mb-4 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1">
                    <Target className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-display font-bold text-sm">{currentQ + 1}/{shuffledQuestions.length}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-primary/10 rounded-full px-3 py-1">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    <span className="font-display font-bold text-sm text-primary">{score}</span>
                  </div>
                </div>
                <StreakCounter streak={streak} bestStreak={bestStreak} />
              </div>

              {/* Animated progress bar */}
              <div className="mb-5 relative">
                <div className="progress-bar h-3">
                  <motion.div
                    className="progress-bar-fill"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                {/* Step dots */}
                <div className="flex justify-between mt-1 px-1">
                  {shuffledQuestions.map((_, i) => (
                    <motion.div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i < currentQ ? "bg-accent" : i === currentQ ? "bg-primary" : "bg-muted"
                      }`}
                      animate={i === currentQ ? { scale: [1, 1.4, 1] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>

              {/* Question card */}
              <div className="card-kid text-center mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-accent/3 pointer-events-none" />
                <motion.span
                  className="text-7xl block mb-4 drop-shadow-lg relative z-10"
                  animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {question.emoji}
                </motion.span>
                <h2 className="font-display text-xl font-bold mb-2 relative z-10">{question.question}</h2>
                <p className="text-muted-foreground font-body text-sm relative z-10">{getQuestionLocal(question, lang)}</p>
              </div>

              {/* Answer options with labels */}
              <div className="grid grid-cols-2 gap-3">
                {question.options.map((option, index) => {
                  const isSelected = selected === index;
                  const isCorrectOption = index === question.correct;
                  let stateClass = "";
                  let bgOverride = "";
                  
                  if (selected !== null) {
                    if (isCorrectOption) {
                      stateClass = "ring-4 ring-accent ring-offset-2";
                      bgOverride = "bg-accent/10";
                    }
                    else if (isSelected && !isCorrect) {
                      stateClass = "ring-4 ring-destructive ring-offset-2 opacity-60";
                      bgOverride = "bg-destructive/10";
                    }
                    else stateClass = "opacity-35";
                  }
                  
                  return (
                    <motion.button
                      key={`${index}-${option}`}
                      whileHover={selected === null ? { scale: 1.04, y: -3 } : {}}
                      whileTap={selected === null ? { scale: 0.96 } : {}}
                      onClick={() => handleAnswer(index)}
                      disabled={selected !== null}
                      className={`card-kid font-display text-lg font-bold py-5 relative overflow-hidden group ${stateClass} ${bgOverride}`}
                    >
                      {/* Option label */}
                      <span className="absolute top-2 start-3 text-xs font-display font-bold text-muted-foreground/50 bg-muted/30 w-6 h-6 rounded-full flex items-center justify-center">
                        {optionLabels[index]}
                      </span>
                      
                      <span className="relative z-10">{option}</span>
                      
                      {selected !== null && isCorrectOption && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="block mt-1 text-sm"
                        >
                          ✅
                        </motion.span>
                      )}
                      {isSelected && !isCorrect && selected !== null && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="block mt-1 text-sm"
                        >
                          ❌
                        </motion.span>
                      )}
                      
                      {/* Hover gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </motion.button>
                  );
                })}
              </div>

              {/* Result feedback */}
              <AnimatePresence>
                {selected !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`text-center mt-5 font-display text-xl font-bold ${
                      isCorrect ? "text-accent" : "text-destructive"
                    }`}
                  >
                    {isCorrect ? t("quiz.correct") : t("quiz.wrong")}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ scale: 0.7, opacity: 0, rotateY: 30 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="card-kid text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sunshine/5 via-transparent to-primary/5 pointer-events-none" />
              
              <motion.span
                className="text-8xl block mb-4 relative z-10 drop-shadow-xl"
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: 3 }}
              >
                {stars >= 4 ? "🏆" : stars >= 2 ? "🎉" : "💪"}
              </motion.span>
              
              <h2 className="font-display text-3xl font-bold mb-3 relative z-10 text-gradient">
                {t("quiz.finished")}
              </h2>
              
              <div className="flex justify-center gap-4 mb-4 relative z-10">
                <div className="bg-primary/10 rounded-2xl px-4 py-2 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-display font-bold text-lg">{score}</span>
                </div>
                <div className="bg-accent/10 rounded-2xl px-4 py-2 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-accent" />
                  <span className="font-display font-bold text-lg">{bestStreak}</span>
                </div>
              </div>
              
              <div className="mb-4 relative z-10">
                <StarRating earned={stars} total={5} size={36} />
              </div>
              
              <p className="text-muted-foreground font-body mb-6 relative z-10">
                {stars >= 4 ? t("quiz.amazing") : stars >= 2 ? t("quiz.wellDone") : t("quiz.keepTrying")}
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={restart}
                className="btn-kid gradient-primary text-primary-foreground text-lg px-8 flex items-center gap-2 mx-auto relative z-10"
              >
                <RotateCcw className="w-5 h-5" /> {t("quiz.playAgain")}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizPage;
