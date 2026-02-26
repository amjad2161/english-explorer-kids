import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { quizQuestions } from "@/data/learningData";
import { speakEnglish, playCorrectSound, playWrongSound, playStarSound } from "@/lib/sounds";
import { addQuizScore } from "@/lib/progress";
import { saveStageProgress } from "@/lib/levels";
import StarRating from "@/components/StarRating";
import Confetti from "@/components/Confetti";

const optionColors = [
  "gradient-sky",
  "gradient-grass",
  "gradient-candy",
  "gradient-lavender",
];

const QuizPage = () => {
  const [searchParams] = useSearchParams();
  const stageId = searchParams.get("stage");
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

  const handleAnswer = useCallback(
    (index: number) => {
      if (selected !== null) return;
      setSelected(index);
      const correct = index === question.correct;
      setIsCorrect(correct);

      if (correct) {
        playCorrectSound();
        setScore((s) => s + 1);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 100);
      } else {
        playWrongSound();
      }

      setTimeout(() => {
        if (currentQ < shuffledQuestions.length - 1) {
          setCurrentQ((q) => q + 1);
          setSelected(null);
          setIsCorrect(null);
        } else {
          const finalScore = correct ? score + 1 : score;
          addQuizScore(finalScore);
          setIsFinished(true);
          if (stageId) {
            saveStageProgress(stageId, finalScore);
          }
          if (finalScore >= 3) {
            playStarSound();
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 100);
          }
        }
      }, 1500);
    },
    [selected, question, currentQ, shuffledQuestions.length, score]
  );

  const restart = () => {
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setIsCorrect(null);
    setIsFinished(false);
  };

  return (
    <div className="min-h-screen" dir="rtl">
      <Confetti show={showConfetti} />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">
            🎯 חידון כיף
          </h1>
          <p className="text-muted-foreground font-body">
            בדוק כמה למדת!
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div
              key={`q-${currentQ}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="font-display font-semibold text-sm">
                    שאלה {currentQ + 1} מתוך {shuffledQuestions.length}
                  </span>
                  <span className="font-display font-semibold text-sm text-primary">
                    ⭐ {score}
                  </span>
                </div>
                <div className="progress-bar h-3">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${((currentQ + 1) / shuffledQuestions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="card-kid text-center mb-6">
                <motion.span
                  className="text-6xl block mb-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {question.emoji}
                </motion.span>
                <h2 className="font-display text-xl font-bold mb-2">
                  {question.question}
                </h2>
                <p className="text-muted-foreground font-body text-sm">
                  {question.questionHebrew}
                </p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                {question.options.map((option, index) => {
                  const isSelected = selected === index;
                  const isCorrectOption = index === question.correct;
                  let stateClass = "";

                  if (selected !== null) {
                    if (isCorrectOption) {
                      stateClass = "ring-4 ring-accent ring-offset-2";
                    } else if (isSelected && !isCorrect) {
                      stateClass = "ring-4 ring-destructive ring-offset-2 opacity-60";
                    } else {
                      stateClass = "opacity-40";
                    }
                  }

                  return (
                    <motion.button
                      key={index}
                      whileHover={selected === null ? { scale: 1.05 } : {}}
                      whileTap={selected === null ? { scale: 0.95 } : {}}
                      onClick={() => handleAnswer(index)}
                      disabled={selected !== null}
                      className={`card-kid font-display text-lg font-bold py-6 transition-all ${stateClass}`}
                    >
                      {option}
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
                    </motion.button>
                  );
                })}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {selected !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-center mt-4 font-display text-xl font-bold ${
                      isCorrect ? "text-accent" : "text-destructive"
                    }`}
                  >
                    {isCorrect ? "!🎉 מעולה! נכון" : "😊 לא נורא, ננסה שוב"}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring" }}
              className="card-kid text-center"
            >
              <motion.span
                className="text-7xl block mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: 3 }}
              >
                {score >= 4 ? "🏆" : score >= 3 ? "🎉" : "💪"}
              </motion.span>

              <h2 className="font-display text-3xl font-bold mb-3">
                !סיימת את החידון
              </h2>

              <div className="mb-4">
                <StarRating
                  earned={score}
                  total={shuffledQuestions.length}
                  size={36}
                />
              </div>

              <p className="font-display text-xl mb-2">
                {score} מתוך {shuffledQuestions.length} תשובות נכונות
              </p>

              <p className="text-muted-foreground font-body mb-6">
                {score >= 4
                  ? "!מדהים! אתה כוכב אמיתי ⭐"
                  : score >= 3
                  ? "!כל הכבוד! המשך כך 👏"
                  : "!לא נורא, תרגול עושה מושלם 💪"}
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={restart}
                className="btn-kid gradient-primary text-primary-foreground text-lg px-8"
              >
                🔄 שחק שוב
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizPage;
