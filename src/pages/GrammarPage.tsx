import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { grammarLessons, getLessonById, GrammarLesson, GrammarQuizItem } from "@/data/grammarData";
import { speakEnglish, playCorrectSound, playWrongSound, playClickSound, playVictoryFanfare } from "@/lib/sounds";
import GameSceneShell from "@/components/GameSceneShell";
import StarRating from "@/components/StarRating";
import { Volume2, ArrowRight, ArrowLeft, RotateCcw, BookOpen, CheckCircle, XCircle, ChevronRight } from "lucide-react";

const GrammarPage = () => {
  const { lang, dir } = useLanguage();
  const [params] = useSearchParams();
  const lessonId = params.get("lesson");

  const [selectedLesson, setSelectedLesson] = useState<GrammarLesson | null>(
    lessonId ? getLessonById(lessonId) || null : null
  );
  const [phase, setPhase] = useState<"learn" | "quiz" | "results">("learn");
  const [ruleIndex, setRuleIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [reorderWords, setReorderWords] = useState<string[]>([]);

  useEffect(() => {
    if (lessonId) {
      const l = getLessonById(lessonId);
      if (l) setSelectedLesson(l);
    }
  }, [lessonId]);

  const t = useCallback((obj: Record<string, string>) => obj[lang] || obj.en, [lang]);

  const startQuiz = useCallback(() => {
    playClickSound();
    setPhase("quiz");
    setQuizIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    if (selectedLesson?.quiz[0]?.type === "reorder" && selectedLesson.quiz[0].correctOrder) {
      setReorderWords([...selectedLesson.quiz[0].options].sort(() => Math.random() - 0.5));
    }
  }, [selectedLesson]);

  const handleAnswer = useCallback((idx: number) => {
    if (selectedAnswer !== null || !selectedLesson) return;
    const q = selectedLesson.quiz[quizIndex];
    setSelectedAnswer(idx);
    if (idx === q.correctIndex) {
      playCorrectSound();
      setScore(s => s + 1);
    } else {
      playWrongSound();
    }
    setShowExplanation(true);
  }, [selectedAnswer, selectedLesson, quizIndex]);

  const nextQuestion = useCallback(() => {
    if (!selectedLesson) return;
    playClickSound();
    if (quizIndex + 1 >= selectedLesson.quiz.length) {
      setPhase("results");
      if (score >= selectedLesson.quiz.length * 0.7) playVictoryFanfare();
    } else {
      const nextIdx = quizIndex + 1;
      setQuizIndex(nextIdx);
      setSelectedAnswer(null);
      setShowExplanation(false);
      const nextQ = selectedLesson.quiz[nextIdx];
      if (nextQ?.type === "reorder" && nextQ.correctOrder) {
        setReorderWords([...nextQ.options].sort(() => Math.random() - 0.5));
      }
    }
  }, [selectedLesson, quizIndex, score]);

  const goBack = useCallback(() => {
    playClickSound();
    setSelectedLesson(null);
    setPhase("learn");
    setRuleIndex(0);
  }, []);

  const resetLesson = useCallback(() => {
    playClickSound();
    setPhase("learn");
    setRuleIndex(0);
  }, []);

  // Group lessons by level
  const levels = [1, 2, 3, 4];
  const levelNames: Record<number, Record<string, string>> = {
    1: { en: "Beginner", he: "מתחיל", ar: "مبتدئ" },
    2: { en: "Elementary", he: "בסיסי", ar: "أساسي" },
    3: { en: "Intermediate", he: "בינוני", ar: "متوسط" },
    4: { en: "Advanced", he: "מתקדם", ar: "متقدم" },
  };

  const stars = selectedLesson
    ? score >= selectedLesson.quiz.length * 0.9 ? 3
      : score >= selectedLesson.quiz.length * 0.7 ? 2
        : score >= selectedLesson.quiz.length * 0.4 ? 1 : 0
    : 0;

  // ─── Lesson selection view ───
  if (!selectedLesson) {
    return (
      <GameSceneShell
        title={lang === "he" ? "דקדוק ובניין שפה" : lang === "ar" ? "قواعد وبناء اللغة" : "Grammar & Language"}
        emoji="📐"
        gameType="grammar"
      >
        <div className="max-w-4xl mx-auto px-4 py-6" dir={dir}>
          <p className="text-center text-sm mb-6" style={{ color: "hsl(var(--chalk) / 0.6)" }}>
            {lang === "he" ? "למד את כללי השפה האנגלית צעד אחר צעד" : lang === "ar" ? "تعلم قواعد اللغة الإنجليزية خطوة بخطوة" : "Learn English grammar step by step"}
          </p>
          
          {levels.map(level => {
            const lessons = grammarLessons.filter(l => l.level === level);
            if (lessons.length === 0) return null;
            return (
              <div key={level} className="mb-6">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: "hsl(var(--chalk))" }}>
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ 
                    background: `hsl(var(--${level <= 2 ? 'grass' : level === 3 ? 'sky' : 'candy'}) / 0.2)`,
                    color: `hsl(var(--${level <= 2 ? 'grass' : level === 3 ? 'sky' : 'candy'}))`,
                  }}>
                    {t(levelNames[level])}
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {lessons.map(lesson => (
                    <motion.button
                      key={lesson.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { playClickSound(); setSelectedLesson(lesson); setPhase("learn"); setRuleIndex(0); }}
                      className="flex items-start gap-3 p-4 rounded-2xl text-left transition-all"
                      style={{
                        background: "hsl(var(--board) / 0.3)",
                        border: "1px solid hsl(var(--chalk) / 0.1)",
                      }}
                    >
                      <span className="text-2xl">{lesson.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm" style={{ color: "hsl(var(--chalk))" }}>{t(lesson.title)}</h3>
                        <p className="text-xs mt-0.5" style={{ color: "hsl(var(--chalk) / 0.5)" }}>{t(lesson.description)}</p>
                      </div>
                      <ChevronRight size={16} style={{ color: "hsl(var(--chalk) / 0.3)" }} />
                    </motion.button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </GameSceneShell>
    );
  }

  const currentRule = selectedLesson.rules[ruleIndex];
  const currentQuiz = selectedLesson.quiz[quizIndex];

  return (
    <GameSceneShell
      title={t(selectedLesson.title)}
      emoji={selectedLesson.emoji}
      gameType="grammar"
      progress={phase === "quiz" ? ((quizIndex + 1) / selectedLesson.quiz.length) * 100 : undefined}
    >
      <div className="max-w-3xl mx-auto px-4 py-4" dir={dir}>
        {/* Back button */}
        <motion.button
          whileHover={{ x: -4 }}
          onClick={goBack}
          className="flex items-center gap-1 mb-4 text-sm"
          style={{ color: "hsl(var(--chalk) / 0.5)" }}
        >
          <ArrowLeft size={16} /> {lang === "he" ? "חזרה" : lang === "ar" ? "رجوع" : "Back"}
        </motion.button>

        {/* ─── LEARN PHASE ─── */}
        {phase === "learn" && currentRule && (
          <div>
            {/* Formula card */}
            <motion.div
              key={ruleIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-5 mb-4"
              style={{
                background: "linear-gradient(135deg, hsl(var(--sky) / 0.12), hsl(var(--grass) / 0.08))",
                border: "2px solid hsl(var(--sky) / 0.2)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={18} style={{ color: "hsl(var(--sky))" }} />
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "hsl(var(--sky) / 0.15)", color: "hsl(var(--sky))" }}>
                  {lang === "he" ? "כלל" : lang === "ar" ? "قاعدة" : "Rule"} {ruleIndex + 1}/{selectedLesson.rules.length}
                </span>
              </div>
              
              <div className="p-3 rounded-xl mb-4" style={{ background: "hsl(var(--board) / 0.4)", fontFamily: "'Courier New', monospace" }}>
                <p className="text-center font-bold" style={{ color: "hsl(var(--sky))", fontSize: "1rem" }}>
                  📐 {currentRule.formula}
                </p>
              </div>

              {/* Examples */}
              <div className="space-y-2">
                {currentRule.examples.map((ex, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "hsl(var(--board) / 0.3)" }}
                  >
                    <div className="flex-1">
                      <p className="font-bold text-sm" style={{ color: "hsl(var(--chalk))" }}>{ex.english}</p>
                      <p className="text-xs mt-0.5" style={{ color: "hsl(var(--chalk) / 0.5)" }} dir="rtl">
                        {lang === "he" ? ex.hebrew : ex.arabic}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => speakEnglish(ex.english)}
                      className="p-1.5 rounded-full shrink-0"
                      style={{ background: "hsl(var(--sky) / 0.15)" }}
                    >
                      <Volume2 size={14} style={{ color: "hsl(var(--sky))" }} />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { playClickSound(); setRuleIndex(r => Math.max(0, r - 1)); }}
                disabled={ruleIndex === 0}
                className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-30"
                style={{ background: "hsl(var(--board) / 0.4)", color: "hsl(var(--chalk))" }}
              >
                <ArrowLeft size={16} />
              </motion.button>

              {ruleIndex < selectedLesson.rules.length - 1 ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { playClickSound(); setRuleIndex(r => r + 1); }}
                  className="px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                  style={{ background: "var(--gradient-sky)", color: "hsl(var(--primary-foreground))" }}
                >
                  {lang === "he" ? "הבא" : lang === "ar" ? "التالي" : "Next"} <ArrowRight size={16} />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startQuiz}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
                  style={{ background: "var(--gradient-grass)", color: "hsl(var(--primary-foreground))", boxShadow: "0 4px 15px hsl(var(--grass) / 0.3)" }}
                >
                  🎯 {lang === "he" ? "בחן אותי!" : lang === "ar" ? "اختبرني!" : "Quiz Me!"}
                </motion.button>
              )}
            </div>
          </div>
        )}

        {/* ─── QUIZ PHASE ─── */}
        {phase === "quiz" && currentQuiz && (
          <AnimatePresence mode="wait">
            <motion.div
              key={quizIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <div className="text-center mb-4">
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "hsl(var(--sky) / 0.15)", color: "hsl(var(--sky))" }}>
                  {quizIndex + 1}/{selectedLesson.quiz.length}
                </span>
              </div>

              <p className="text-center font-bold mb-3" style={{ color: "hsl(var(--chalk))" }}>
                {t(currentQuiz.question)}
              </p>

              {/* Show sentence with blank for fill-blank */}
              {currentQuiz.sentence && (
                <div className="text-center p-4 rounded-xl mb-4" style={{ background: "hsl(var(--board) / 0.4)" }}>
                  <p className="text-lg font-bold" style={{ color: "hsl(var(--chalk))", fontFamily: "'Baloo 2', cursive" }}>
                    {currentQuiz.sentence.replace("___", selectedAnswer !== null ? currentQuiz.options[selectedAnswer] : "______")}
                  </p>
                </div>
              )}

              {/* Reorder type */}
              {currentQuiz.type === "reorder" && currentQuiz.correctOrder && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 justify-center min-h-[50px] p-3 rounded-xl" style={{ background: "hsl(var(--board) / 0.3)", border: "2px dashed hsl(var(--chalk) / 0.15)" }}>
                    {reorderWords.map((word, i) => (
                      <motion.button
                        key={`${word}-${i}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 rounded-xl text-sm font-bold"
                        style={{ background: "hsl(var(--sky) / 0.15)", color: "hsl(var(--sky))" }}
                        onClick={() => {
                          if (selectedAnswer !== null) return;
                          const newOrder = [...reorderWords];
                          // Move to correct position
                          const correctIdx = currentQuiz.correctOrder!.indexOf(word);
                          if (correctIdx === i) return;
                          newOrder.splice(i, 1);
                          newOrder.splice(correctIdx, 0, word);
                          setReorderWords(newOrder);
                          // Check if correct
                          if (newOrder.join(" ") === currentQuiz.correctOrder!.join(" ")) {
                            playCorrectSound();
                            setSelectedAnswer(0);
                            setScore(s => s + 1);
                            setShowExplanation(true);
                          }
                        }}
                      >
                        {word}
                      </motion.button>
                    ))}
                  </div>
                  {selectedAnswer !== null && (
                    <p className="text-center text-sm mt-2 font-bold" style={{ color: "hsl(var(--grass))" }}>
                      ✅ {currentQuiz.correctOrder.join(" ")}
                    </p>
                  )}
                </div>
              )}

              {/* Options for fill-blank and choose-correct */}
              {(currentQuiz.type === "fill-blank" || currentQuiz.type === "choose-correct") && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {currentQuiz.options.map((opt, i) => {
                    const isSelected = selectedAnswer === i;
                    const isCorrect = i === currentQuiz.correctIndex;
                    const showResult = selectedAnswer !== null;
                    return (
                      <motion.button
                        key={i}
                        whileHover={!showResult ? { scale: 1.03 } : {}}
                        whileTap={!showResult ? { scale: 0.97 } : {}}
                        onClick={() => handleAnswer(i)}
                        disabled={selectedAnswer !== null}
                        className="p-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                        style={{
                          background: showResult
                            ? isCorrect ? "hsl(var(--grass) / 0.2)" : isSelected ? "hsl(var(--destructive) / 0.2)" : "hsl(var(--board) / 0.3)"
                            : "hsl(var(--board) / 0.3)",
                          border: showResult
                            ? isCorrect ? "2px solid hsl(var(--grass) / 0.5)" : isSelected ? "2px solid hsl(var(--destructive) / 0.5)" : "1px solid hsl(var(--chalk) / 0.1)"
                            : "1px solid hsl(var(--chalk) / 0.1)",
                          color: showResult
                            ? isCorrect ? "hsl(var(--grass))" : isSelected ? "hsl(var(--destructive))" : "hsl(var(--chalk) / 0.5)"
                            : "hsl(var(--chalk))",
                        }}
                      >
                        {showResult && isCorrect && <CheckCircle size={16} />}
                        {showResult && isSelected && !isCorrect && <XCircle size={16} />}
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Explanation */}
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl mb-4"
                  style={{ background: "hsl(var(--sky) / 0.08)", border: "1px solid hsl(var(--sky) / 0.2)" }}
                >
                  <p className="text-sm" style={{ color: "hsl(var(--chalk) / 0.7)" }}>
                    💡 {t(currentQuiz.explanation)}
                  </p>
                </motion.div>
              )}

              {showExplanation && (
                <div className="text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={nextQuestion}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold"
                    style={{ background: "var(--gradient-sky)", color: "hsl(var(--primary-foreground))" }}
                  >
                    {quizIndex + 1 >= selectedLesson.quiz.length 
                      ? (lang === "he" ? "סיום" : lang === "ar" ? "إنهاء" : "Finish")
                      : (lang === "he" ? "הבא" : lang === "ar" ? "التالي" : "Next")} →
                  </motion.button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* ─── RESULTS PHASE ─── */}
        {phase === "results" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-6 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, hsl(var(--grass) / 0.12), hsl(var(--sky) / 0.08))",
              border: "2px solid hsl(var(--grass) / 0.3)",
            }}
          >
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "hsl(var(--chalk))" }}>
              {lang === "he" ? "כל הכבוד!" : lang === "ar" ? "أحسنت!" : "Well Done!"}
            </h3>
            <p className="text-3xl font-extrabold mb-2" style={{ color: "hsl(var(--grass))" }}>
              {score}/{selectedLesson.quiz.length}
            </p>
            <div className="mb-4">
              <StarRating earned={stars} total={3} />
            </div>
            <div className="flex flex-col gap-2 max-w-xs mx-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetLesson}
                className="px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: "var(--gradient-sky)", color: "hsl(var(--primary-foreground))" }}
              >
                <RotateCcw size={16} /> {lang === "he" ? "למד שוב" : lang === "ar" ? "تعلم مرة أخرى" : "Learn Again"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goBack}
                className="px-5 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: "hsl(var(--board) / 0.5)", color: "hsl(var(--chalk))", border: "1px solid hsl(var(--chalk) / 0.15)" }}
              >
                📐 {lang === "he" ? "כל השיעורים" : lang === "ar" ? "كل الدروس" : "All Lessons"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </GameSceneShell>
  );
};

export default GrammarPage;
