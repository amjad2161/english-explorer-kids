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
import Interactive3DMascot from "@/components/Interactive3DMascot";
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
  const [owlMood, setOwlMood] = useState<"idle" | "celebrate" | "sad">("idle");
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
      setOwlMood("celebrate");
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
      setOwlMood("sad");
      playWrongSound();
    }
    setTimeout(() => {
      setOwlMood("idle");
      if (currentQ < shuffledQuestions.length - 1) {
        setCurrentQ(q => q + 1);
        setSelected(null);
        setIsCorrect(null);
      } else {
        const finalScore = correct ? score + (10 + Math.min(streak + 1, 5) * 5) : score;
        const stars = Math.min(Math.ceil((finalScore / (QUIZ_SIZE * 30)) * 5), 5);
        addQuizScore(stars);
        setIsFinished(true);
        setOwlMood("celebrate");
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
    setCurrentQ(0); setScore(0); setStreak(0); setBestStreak(0);
    setSelected(null); setIsCorrect(null); setIsFinished(false);
    setQuizKey(k => k + 1); setOwlMood("idle");
  };

  const stars = Math.min(Math.ceil((score / (QUIZ_SIZE * 30)) * 5), 5);
  const progress = ((currentQ + 1) / shuffledQuestions.length) * 100;

  if (!question && !isFinished) return null;

  return (
    <div className="min-h-screen relative" dir={dir}>
      <FloatingParticles count={8} />
      <Confetti show={showConfetti} />
      <ScorePopup popups={popups} />
      <ComboBurst combo={streak} show={showCombo} />
      <XPReward amount={xpAmount} show={showXP} gameType="quiz" onComplete={() => setShowXP(false)} />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10">
        <BackToLevels />

        {/* Premium hero header with owl */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <Interactive3DMascot mood={owlMood} size="sm" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-gradient mb-1">
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
              {/* Premium stats bar */}
              <div className="card-glass rounded-2xl p-3 mb-4 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 bg-muted/40 rounded-full px-3 py-1.5 border border-border">
                    <Target className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-display font-bold text-sm">{currentQ + 1}/{shuffledQuestions.length}</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border border-primary/20" style={{ background: "hsl(var(--primary) / 0.08)" }}>
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    <span className="font-display font-bold text-sm text-primary">{score}</span>
                  </div>
                </div>
                <StreakCounter streak={streak} bestStreak={bestStreak} />
              </div>

              {/* Cinematic progress bar */}
              <div className="mb-6">
                <div className="h-3 rounded-full bg-muted/60 overflow-hidden border border-border backdrop-blur-sm">
                  <motion.div
                    className="h-full rounded-full relative overflow-hidden"
                    style={{ background: "var(--gradient-hero)" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <div className="absolute inset-0 animate-shimmer" />
                  </motion.div>
                </div>
                <div className="flex justify-between mt-1.5 px-1">
                  {shuffledQuestions.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: i === currentQ ? 1.4 : 1, opacity: i <= currentQ ? 1 : 0.4 }}
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                        i < currentQ ? "bg-accent" : i === currentQ ? "bg-primary shadow-sm" : "bg-muted"
                      }`}
                      style={i === currentQ ? { boxShadow: "0 0 8px hsl(var(--primary) / 0.5)" } : {}}
                    />
                  ))}
                </div>
              </div>

              {/* Premium question card */}
              <motion.div
                className="card-glass rounded-3xl p-6 sm:p-8 text-center mb-6 relative overflow-hidden"
                layoutId="question-card"
              >
                {/* Decorative gradient orb */}
                <div
                  className="absolute -top-20 -end-20 w-40 h-40 rounded-full opacity-20 blur-3xl pointer-events-none"
                  style={{ background: "var(--gradient-hero)" }}
                />
                <motion.span 
                  className="text-6xl sm:text-7xl block mb-4 relative z-10"
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                  key={currentQ}
                >
                  {question.emoji}
                </motion.span>
                <h2 className="font-display text-xl sm:text-2xl font-bold mb-2 relative z-10">{question.question}</h2>
                <p className="text-muted-foreground font-body text-sm relative z-10">{getQuestionLocal(question, lang)}</p>
              </motion.div>

              {/* Premium answer options */}
              <div className="grid grid-cols-2 gap-3">
                {question.options.map((option, index) => {
                  const isSelected = selected === index;
                  const isCorrectOption = index === question.correct;
                  let borderClass = "border-border/60 hover:border-primary/40";
                  let bgClass = "bg-card/80 backdrop-blur-sm";
                  let glowStyle = {};
                  let opacityClass = "";
                  
                  if (selected !== null) {
                    if (isCorrectOption) {
                      borderClass = "border-accent ring-2 ring-accent/30";
                      bgClass = "bg-accent/12";
                      glowStyle = { boxShadow: "0 0 20px hsl(var(--accent) / 0.15)" };
                    } else if (isSelected && !isCorrect) {
                      borderClass = "border-destructive ring-2 ring-destructive/30";
                      bgClass = "bg-destructive/10";
                      opacityClass = "opacity-80";
                    } else {
                      opacityClass = "opacity-25";
                    }
                  }
                  
                  return (
                    <motion.button
                      key={`${index}-${option}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06, duration: 0.3 }}
                      whileHover={selected === null ? { scale: 1.04, y: -4 } : {}}
                      whileTap={selected === null ? { scale: 0.96 } : {}}
                      onClick={() => handleAnswer(index)}
                      disabled={selected !== null}
                      className={`rounded-2xl border-2 ${borderClass} ${bgClass} ${opacityClass} font-display text-base sm:text-lg font-bold py-5 sm:py-6 relative overflow-hidden transition-all duration-300`}
                      style={glowStyle}
                    >
                      {/* Shine overlay */}
                      {selected === null && (
                        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                          style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.06), transparent 60%)" }}
                        />
                      )}
                      <span className="absolute top-2 start-3 text-[10px] font-display font-bold text-muted-foreground/50 bg-muted/40 w-6 h-6 rounded-full flex items-center justify-center border border-border/30">
                        {optionLabels[index]}
                      </span>
                      <span className="relative z-10">{option}</span>
                      {selected !== null && isCorrectOption && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }} className="block mt-1.5 text-sm">✅</motion.span>
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
                    className={`text-center mt-5 py-3 px-5 rounded-2xl font-display text-lg font-bold backdrop-blur-sm ${
                      isCorrect 
                        ? "text-accent bg-accent/10 border border-accent/25" 
                        : "text-destructive bg-destructive/10 border border-destructive/25"
                    }`}
                    style={isCorrect ? { boxShadow: "0 0 24px hsl(var(--accent) / 0.1)" } : {}}
                  >
                    {isCorrect ? `🎉 ${t("quiz.correct")}` : `😅 ${t("quiz.wrong")}`}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* ═══ Premium Results Screen ═══ */
            <motion.div
              key="results"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 18 }}
              className="card-glass rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden"
            >
              {/* Background glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-15 blur-3xl" style={{ background: "var(--gradient-hero)" }} />
              </div>

              <div className="relative z-10">
                <Interactive3DMascot mood="celebrate" size="md" />
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold mb-4 text-gradient">{t("quiz.finished")}</h2>
                
                <div className="flex justify-center gap-3 mb-5">
                  <motion.div
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="rounded-2xl px-5 py-2.5 flex items-center gap-2 border border-primary/25"
                    style={{ background: "hsl(var(--primary) / 0.1)" }}
                  >
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="font-display font-bold text-xl">{score}</span>
                    <span className="text-xs text-muted-foreground font-display">XP</span>
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="bg-accent/10 border border-accent/25 rounded-2xl px-5 py-2.5 flex items-center gap-2"
                  >
                    <Trophy className="w-5 h-5 text-accent" />
                    <span className="font-display font-bold text-xl">{bestStreak}</span>
                    <span className="text-xs text-muted-foreground font-display">streak</span>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="mb-5"
                >
                  <StarRating earned={stars} total={5} size={40} />
                </motion.div>
                
                <p className="text-muted-foreground font-body text-base mb-7 max-w-xs mx-auto">
                  {stars >= 4 ? t("quiz.amazing") : stars >= 2 ? t("quiz.wellDone") : t("quiz.keepTrying")}
                </p>
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={restart}
                  className="btn-kid gradient-primary text-primary-foreground text-base sm:text-lg px-8 py-3.5 inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" /> {t("quiz.playAgain")}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizPage;
