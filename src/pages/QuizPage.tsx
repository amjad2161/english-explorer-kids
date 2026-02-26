import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { quizQuestions, getQuestionLocal } from "@/data/learningData";
import { playCorrectSound, playWrongSound, playStarSound } from "@/lib/sounds";
import { addQuizScore } from "@/lib/progress";
import { saveStageProgress } from "@/lib/levels";
import StarRating from "@/components/StarRating";
import Confetti from "@/components/Confetti";

const QuizPage = () => {
  const [searchParams] = useSearchParams();
  const stageId = searchParams.get("stage");
  const { t, lang } = useLanguage();
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shuffledQuestions] = useState(() =>
    [...quizQuestions].sort(() => Math.random() - 0.5).slice(0, 5)
  );

  const question = shuffledQuestions[currentQ];

  const handleAnswer = useCallback((index: number) => {
    if (selected !== null) return;
    setSelected(index);
    const correct = index === question.correct;
    setIsCorrect(correct);
    if (correct) { playCorrectSound(); setScore((s) => s + 1); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 100); }
    else { playWrongSound(); }
    setTimeout(() => {
      if (currentQ < shuffledQuestions.length - 1) {
        setCurrentQ((q) => q + 1); setSelected(null); setIsCorrect(null);
      } else {
        const finalScore = correct ? score + 1 : score;
        addQuizScore(finalScore);
        setIsFinished(true);
        if (stageId) saveStageProgress(stageId, finalScore);
        if (finalScore >= 3) { playStarSound(); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 100); }
      }
    }, 1500);
  }, [selected, question, currentQ, shuffledQuestions.length, score, stageId]);

  const restart = () => { setCurrentQ(0); setScore(0); setSelected(null); setIsCorrect(null); setIsFinished(false); };
  const getStars = () => (score >= 4 ? 3 : score >= 3 ? 2 : 1);

  return (
    <div className="min-h-screen" dir="rtl">
      <Confetti show={showConfetti} />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">{t("quiz.title")}</h1>
          <p className="text-muted-foreground font-body">{t("quiz.subtitle")}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }} transition={{ type: "spring" as const, stiffness: 200 }}>
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="font-display font-semibold text-sm">{t("quiz.question")} {currentQ + 1} {t("quiz.outOf")} {shuffledQuestions.length}</span>
                  <span className="font-display font-semibold text-sm text-primary">⭐ {score}</span>
                </div>
                <div className="progress-bar h-3">
                  <div className="progress-bar-fill" style={{ width: `${((currentQ + 1) / shuffledQuestions.length) * 100}%` }} />
                </div>
              </div>

              <div className="card-kid text-center mb-6">
                <motion.span className="text-6xl block mb-4" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                  {question.emoji}
                </motion.span>
                <h2 className="font-display text-xl font-bold mb-2">{question.question}</h2>
                <p className="text-muted-foreground font-body text-sm">{getQuestionLocal(question, lang)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {question.options.map((option, index) => {
                  const isSelected = selected === index;
                  const isCorrectOption = index === question.correct;
                  let stateClass = "";
                  if (selected !== null) {
                    if (isCorrectOption) stateClass = "ring-4 ring-accent ring-offset-2";
                    else if (isSelected && !isCorrect) stateClass = "ring-4 ring-destructive ring-offset-2 opacity-60";
                    else stateClass = "opacity-40";
                  }
                  return (
                    <motion.button key={index}
                      whileHover={selected === null ? { scale: 1.05 } : {}}
                      whileTap={selected === null ? { scale: 0.95 } : {}}
                      onClick={() => handleAnswer(index)} disabled={selected !== null}
                      className={`card-kid font-display text-lg font-bold py-6 transition-all ${stateClass}`}>
                      {option}
                      {selected !== null && isCorrectOption && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="block mt-1 text-sm">✅</motion.span>}
                      {isSelected && !isCorrect && selected !== null && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="block mt-1 text-sm">❌</motion.span>}
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {selected !== null && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className={`text-center mt-4 font-display text-xl font-bold ${isCorrect ? "text-accent" : "text-destructive"}`}>
                    {isCorrect ? t("quiz.correct") : t("quiz.wrong")}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring" }} className="card-kid text-center">
              <motion.span className="text-7xl block mb-4" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: 3 }}>
                {score >= 4 ? "🏆" : score >= 3 ? "🎉" : "💪"}
              </motion.span>
              <h2 className="font-display text-3xl font-bold mb-3">{t("quiz.finished")}</h2>
              <div className="mb-4"><StarRating earned={getStars()} total={3} size={36} /></div>
              <p className="font-display text-xl mb-2">{score} {t("quiz.outOf")} {shuffledQuestions.length} {t("quiz.correctAnswers")}</p>
              <p className="text-muted-foreground font-body mb-6">
                {score >= 4 ? t("quiz.amazing") : score >= 3 ? t("quiz.wellDone") : t("quiz.keepTrying")}
              </p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={restart} className="btn-kid gradient-primary text-primary-foreground text-lg px-8">
                {t("quiz.playAgain")}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizPage;
