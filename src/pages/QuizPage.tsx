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
import ComboBurst from "@/components/ComboBurst";
import FloatingParticles from "@/components/FloatingParticles";
import { RotateCcw, Zap, Target, Trophy, Sparkles } from "lucide-react";

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
        const xp = Math.max(10, finalScore);
        setXpAmount(xp);
        setShowXP(true);
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
      <FloatingParticles count={6} />
      <Confetti show={showConfetti} />
      <ScorePopup popups={popups} />
      <ComboBurst combo={streak} show={showCombo} />
      <XPReward amount={xpAmount} show={showXP} gameType="quiz" onComplete={() => setShowXP(false)} />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10">
        <BackToLevels />

        {/* Hero header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg"
            style={{ background: "var(--gradient-hero)" }}
          >
            🎯
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-gradient mb-2">
            {t("quiz.title")}
          </h1>
          <p className="text-muted-foreground font-body text-sm sm:text-base max-w-sm mx-auto">{t("quiz.subtitle")}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div
              key={`q-${currentQ}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Stats bar */}
              <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] p-3 mb-4 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1.5">
                    <Target className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-display font-bold text-sm">{currentQ + 1}/{shuffledQuestions.length}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-primary/10 rounded-full px-3 py-1.5">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    <span className="font-display font-bold text-sm text-primary">{score}</span>
                  </div>
                </div>
                <StreakCounter streak={streak} bestStreak={bestStreak} />
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="h-3 rounded-full bg-muted overflow-hidden border border-border">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "var(--gradient-hero)" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 px-1">
                  {shuffledQuestions.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: i === currentQ ? 1.3 : 1 }}
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                        i < currentQ ? "bg-accent" : i === currentQ ? "bg-primary shadow-sm" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Question card */}
              <div className="bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] p-6 sm:p-8 text-center mb-6">
                <motion.span 
                  className="text-6xl sm:text-7xl block mb-4"
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                  key={currentQ}
                >
                  {question.emoji}
                </motion.span>
                <h2 className="font-display text-xl sm:text-2xl font-bold mb-2">{question.question}</h2>
                <p className="text-muted-foreground font-body text-sm">{getQuestionLocal(question, lang)}</p>
              </div>

              {/* Answer options */}
              <div className="grid grid-cols-2 gap-3">
                {question.options.map((option, index) => {
                  const isSelected = selected === index;
                  const isCorrectOption = index === question.correct;
                  let borderClass = "border-border hover:border-primary/30";
                  let bgClass = "bg-card";
                  let shadowClass = "shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]";
                  let opacityClass = "";
                  
                  if (selected !== null) {
                    shadowClass = "";
                    if (isCorrectOption) {
                      borderClass = "border-accent ring-2 ring-accent/30";
                      bgClass = "bg-accent/8";
                    } else if (isSelected && !isCorrect) {
                      borderClass = "border-destructive ring-2 ring-destructive/30";
                      bgClass = "bg-destructive/8";
                      opacityClass = "opacity-70";
                    } else {
                      opacityClass = "opacity-30";
                    }
                  }
                  
                  return (
                    <motion.button
                      key={`${index}-${option}`}
                      whileHover={selected === null ? { scale: 1.03, y: -3 } : {}}
                      whileTap={selected === null ? { scale: 0.97 } : {}}
                      onClick={() => handleAnswer(index)}
                      disabled={selected !== null}
                      className={`rounded-xl border-2 ${borderClass} ${bgClass} ${shadowClass} ${opacityClass} font-display text-base sm:text-lg font-bold py-5 sm:py-6 relative overflow-hidden transition-all duration-300`}
                    >
                      <span className="absolute top-2 start-3 text-[10px] font-display font-bold text-muted-foreground/50 bg-muted/40 w-6 h-6 rounded-full flex items-center justify-center">
                        {optionLabels[index]}
                      </span>
                      <span className="relative z-10">{option}</span>
                      {selected !== null && isCorrectOption && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="block mt-1.5 text-sm">✅</motion.span>
                      )}
                      {isSelected && !isCorrect && selected !== null && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="block mt-1.5 text-sm">❌</motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Result feedback */}
              <AnimatePresence>
                {selected !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`text-center mt-5 py-3 px-5 rounded-xl font-display text-lg font-bold ${
                      isCorrect 
                        ? "text-accent bg-accent/10 border border-accent/20" 
                        : "text-destructive bg-destructive/10 border border-destructive/20"
                    }`}
                  >
                    {isCorrect ? `🎉 ${t("quiz.correct")}` : `😅 ${t("quiz.wrong")}`}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 18 }}
              className="bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] p-8 sm:p-10 text-center"
            >
              <motion.span
                className="text-7xl sm:text-8xl block mb-5"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.15 }}
              >
                {stars >= 4 ? "🏆" : stars >= 2 ? "🎉" : "💪"}
              </motion.span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold mb-4 text-gradient">{t("quiz.finished")}</h2>
              <div className="flex justify-center gap-3 mb-5">
                <div className="bg-primary/10 border border-primary/20 rounded-2xl px-5 py-2.5 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-display font-bold text-xl">{score}</span>
                  <span className="text-xs text-muted-foreground font-display">XP</span>
                </div>
                <div className="bg-accent/10 border border-accent/20 rounded-2xl px-5 py-2.5 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-accent" />
                  <span className="font-display font-bold text-xl">{bestStreak}</span>
                  <span className="text-xs text-muted-foreground font-display">streak</span>
                </div>
              </div>
              <div className="mb-5"><StarRating earned={stars} total={5} size={40} /></div>
              <p className="text-muted-foreground font-body text-base mb-7 max-w-xs mx-auto">
                {stars >= 4 ? t("quiz.amazing") : stars >= 2 ? t("quiz.wellDone") : t("quiz.keepTrying")}
              </p>
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={restart}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display font-bold text-base sm:text-lg px-8 py-3.5 rounded-xl shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-button-hover)] hover:brightness-105 transition-all duration-200"
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
