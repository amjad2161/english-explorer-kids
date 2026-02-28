import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { phraseGroups, getPhraseGroupName, getPhraseTranslation, Phrase, PhraseGroup } from "@/data/phrasesData";
import { speakEnglish, speakHebrew, speakArabic, playClickSound, playCorrectSound, playWrongSound, playVictoryFanfare } from "@/lib/sounds";
import { Volume2, ChevronLeft, ChevronRight, RotateCcw, Shuffle, Brain, CheckCircle, XCircle } from "lucide-react";
import GameShell from "@/components/GameShell";
import StarRating from "@/components/StarRating";
import Confetti from "@/components/Confetti";

type Mode = "flashcards" | "quiz";

/** Plays victory fanfare once on mount */
const CompletionFanfare = () => {
  const played = useRef(false);
  useEffect(() => { if (!played.current) { played.current = true; playVictoryFanfare(); } }, []);
  return null;
};

const PhrasesPage = () => {
  const { lang, t, dir } = useLanguage();
  const [selectedGroup, setSelectedGroup] = useState<PhraseGroup | null>(null);
  const [mode, setMode] = useState<Mode>("flashcards");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [shuffledPhrases, setShuffledPhrases] = useState<Phrase[]>([]);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<{ phrase: Phrase; options: string[]; correctIndex: number }[]>([]);

  const phrases = useMemo(() => {
    if (!selectedGroup) return [];
    if (shuffled) return shuffledPhrases;
    return selectedGroup.phrases;
  }, [selectedGroup, shuffled, shuffledPhrases]);

  const currentPhrase = phrases[cardIndex] || null;

  const speakPhrase = useCallback((phrase: Phrase, targetLang?: string) => {
    const speakLang = targetLang || "en";
    if (speakLang === "en") speakEnglish(phrase.english);
    else if (speakLang === "he") speakHebrew(phrase.hebrew);
    else if (speakLang === "ar") speakArabic(phrase.arabic);
  }, []);

  // ─── Flashcard handlers ───
  const handleFlip = useCallback(() => { playClickSound(); setFlipped(f => !f); }, []);
  const handleNext = useCallback(() => { if (cardIndex < phrases.length - 1) { playClickSound(); setCardIndex(i => i + 1); setFlipped(false); } }, [cardIndex, phrases.length]);
  const handlePrev = useCallback(() => { if (cardIndex > 0) { playClickSound(); setCardIndex(i => i - 1); setFlipped(false); } }, [cardIndex]);

  const handleShuffle = useCallback(() => {
    if (!selectedGroup) return;
    playCorrectSound();
    setShuffledPhrases([...selectedGroup.phrases].sort(() => Math.random() - 0.5));
    setShuffled(true); setCardIndex(0); setFlipped(false);
  }, [selectedGroup]);

  const handleReset = useCallback(() => { playClickSound(); setShuffled(false); setCardIndex(0); setFlipped(false); }, []);

  const handleSelectGroup = useCallback((group: PhraseGroup) => {
    playClickSound(); setSelectedGroup(group); setCardIndex(0); setFlipped(false); setShuffled(false); setMode("flashcards");
  }, []);

  const handleBack = useCallback(() => { playClickSound(); setSelectedGroup(null); setMode("flashcards"); }, []);

  // ─── Quiz generation ───
  const generateQuiz = useCallback(() => {
    if (!selectedGroup) return;
    playClickSound();
    const allPhrases = phraseGroups.flatMap(g => g.phrases);
    const groupPhrases = [...selectedGroup.phrases].sort(() => Math.random() - 0.5);

    const questions = groupPhrases.map(phrase => {
      const correctAnswer = phrase.english;
      const distractors: string[] = [];
      const pool = allPhrases.filter(p => p.english !== correctAnswer);
      while (distractors.length < 3 && pool.length > 0) {
        const idx = Math.floor(Math.random() * pool.length);
        const picked = pool.splice(idx, 1)[0];
        if (!distractors.includes(picked.english)) distractors.push(picked.english);
      }
      const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);
      return { phrase, options, correctIndex: options.indexOf(correctAnswer) };
    });

    setQuizQuestions(questions);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizSelected(null);
    setQuizFinished(false);
    setMode("quiz");
  }, [selectedGroup]);

  const handleQuizAnswer = useCallback((idx: number) => {
    if (quizSelected !== null) return;
    setQuizSelected(idx);
    if (idx === quizQuestions[quizIndex].correctIndex) {
      playCorrectSound();
      setQuizScore(s => s + 1);
    } else {
      playWrongSound();
    }
  }, [quizSelected, quizQuestions, quizIndex]);

  const handleQuizNext = useCallback(() => {
    playClickSound();
    if (quizIndex + 1 >= quizQuestions.length) {
      setQuizFinished(true);
      if (quizScore >= quizQuestions.length * 0.7) playVictoryFanfare();
    } else {
      setQuizIndex(i => i + 1);
      setQuizSelected(null);
    }
  }, [quizIndex, quizQuestions.length, quizScore]);

  const quizStars = quizQuestions.length > 0
    ? quizScore >= quizQuestions.length * 0.9 ? 3
      : quizScore >= quizQuestions.length * 0.7 ? 2
        : quizScore >= quizQuestions.length * 0.4 ? 1 : 0
    : 0;

  // ═══ Category grid ═══
  if (!selectedGroup) {
    return (
      <GameShell title={lang === "he" ? "תרגול ביטויים" : lang === "ar" ? "تمرين العبارات" : "Phrases Practice"} emoji="💬" backPath="/">
        <div className="max-w-4xl mx-auto px-4 py-8" dir={dir}>
          <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-center mb-2" style={{ color: "hsl(var(--chalk))" }}>
            {lang === "he" ? "בחר קטגוריה" : lang === "ar" ? "اختر فئة" : "Choose a Category"}
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-center mb-8 text-sm" style={{ color: "hsl(var(--chalk) / 0.6)" }}>
            {lang === "he" ? "למד ביטויים שימושיים באנגלית" : lang === "ar" ? "تعلّم عبارات مفيدة بالإنجليزية" : "Learn useful English phrases & expressions"}
          </motion.p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {phraseGroups.map((group, i) => (
              <motion.button key={group.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }} onClick={() => handleSelectGroup(group)}
                className="relative rounded-2xl p-5 text-center transition-all overflow-hidden group"
                style={{ background: "linear-gradient(135deg, hsl(var(--board) / 0.8), hsl(var(--board) / 0.6))", border: "2px solid hsl(var(--grass) / 0.2)", boxShadow: "0 4px 20px hsl(var(--board) / 0.3)" }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "radial-gradient(circle at center, hsl(var(--grass) / 0.1), transparent 70%)" }} />
                <div className="text-4xl mb-3">{group.emoji}</div>
                <div className="font-bold text-sm" style={{ color: "hsl(var(--chalk))" }}>{getPhraseGroupName(group, lang)}</div>
                <div className="text-xs mt-1" style={{ color: "hsl(var(--chalk) / 0.5)" }}>{group.phrases.length} {lang === "he" ? "ביטויים" : lang === "ar" ? "عبارات" : "phrases"}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </GameShell>
    );
  }

  // ═══ Quiz results ═══
  if (mode === "quiz" && quizFinished) {
    return (
      <GameShell title={getPhraseGroupName(selectedGroup, lang)} emoji={selectedGroup.emoji} backPath="/phrases">
        <div className="max-w-md mx-auto px-4 py-8" dir={dir}>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-6 rounded-2xl"
            style={{ background: "linear-gradient(135deg, hsl(var(--grass) / 0.12), hsl(var(--sky) / 0.08))", border: "2px solid hsl(var(--grass) / 0.3)" }}>
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "hsl(var(--chalk))" }}>
              {lang === "he" ? "כל הכבוד!" : lang === "ar" ? "أحسنت!" : "Well Done!"}
            </h3>
            <p className="text-3xl font-extrabold mb-2" style={{ color: "hsl(var(--grass))" }}>{quizScore}/{quizQuestions.length}</p>
            <div className="mb-4"><StarRating earned={quizStars} total={3} /></div>
            <div className="flex flex-col gap-2 max-w-xs mx-auto">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={generateQuiz}
                className="px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: "var(--gradient-sky)", color: "hsl(var(--primary-foreground))" }}>
                <RotateCcw size={16} /> {lang === "he" ? "נסה שוב" : lang === "ar" ? "حاول مرة أخرى" : "Try Again"}
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { playClickSound(); setMode("flashcards"); setCardIndex(0); setFlipped(false); }}
                className="px-5 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: "hsl(var(--board) / 0.5)", color: "hsl(var(--chalk))", border: "1px solid hsl(var(--chalk) / 0.15)" }}>
                📝 {lang === "he" ? "חזור לכרטיסיות" : lang === "ar" ? "العودة للبطاقات" : "Back to Flashcards"}
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleBack}
                className="px-5 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: "hsl(var(--board) / 0.3)", color: "hsl(var(--chalk) / 0.7)" }}>
                {lang === "he" ? "כל הקטגוריות" : lang === "ar" ? "كل الفئات" : "All Categories"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </GameShell>
    );
  }

  // ═══ Quiz mode ═══
  if (mode === "quiz" && quizQuestions.length > 0) {
    const q = quizQuestions[quizIndex];
    return (
      <GameShell title={getPhraseGroupName(selectedGroup, lang)} emoji={selectedGroup.emoji} backPath="/phrases">
        <div className="max-w-lg mx-auto px-4 py-6" dir={dir}>
          <motion.button whileHover={{ x: -4 }} onClick={() => { playClickSound(); setMode("flashcards"); }}
            className="flex items-center gap-1 mb-4 text-sm" style={{ color: "hsl(var(--chalk) / 0.5)" }}>
            <ChevronLeft size={16} /> {lang === "he" ? "חזור לכרטיסיות" : lang === "ar" ? "العودة للبطاقات" : "Back to Flashcards"}
          </motion.button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "hsl(var(--board) / 0.5)" }}>
              <motion.div className="h-full rounded-full" style={{ background: "var(--gradient-grass)" }}
                animate={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }} transition={{ type: "spring", stiffness: 200 }} />
            </div>
            <span className="text-sm font-bold" style={{ color: "hsl(var(--chalk) / 0.7)" }}>{quizIndex + 1}/{quizQuestions.length}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={quizIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="text-center mb-6">
                <p className="text-xs mb-2 font-bold" style={{ color: "hsl(var(--chalk) / 0.5)" }}>
                  {lang === "he" ? "מה התרגום של:" : lang === "ar" ? "ما ترجمة:" : "What is the English for:"}
                </p>
                <div className="p-4 rounded-2xl mb-2" style={{ background: "hsl(var(--sky) / 0.1)", border: "2px solid hsl(var(--sky) / 0.2)" }}>
                  <span className="text-3xl block mb-2">{q.phrase.emoji}</span>
                  <p className="text-xl font-extrabold" style={{ color: "hsl(var(--sky))", fontFamily: "'Baloo 2', cursive" }} dir="rtl">
                    {getPhraseTranslation(q.phrase, lang)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5 mb-5">
                {q.options.map((opt, i) => {
                  const isSelected = quizSelected === i;
                  const isCorrect = i === q.correctIndex;
                  const showResult = quizSelected !== null;
                  return (
                    <motion.button key={i}
                      whileHover={!showResult ? { scale: 1.02 } : {}}
                      whileTap={!showResult ? { scale: 0.98 } : {}}
                      onClick={() => handleQuizAnswer(i)}
                      disabled={quizSelected !== null}
                      className="p-3.5 rounded-xl text-sm font-bold transition-all flex items-center gap-3"
                      style={{
                        background: showResult ? (isCorrect ? "hsl(var(--grass) / 0.15)" : isSelected ? "hsl(var(--destructive) / 0.15)" : "hsl(var(--board) / 0.3)") : "hsl(var(--board) / 0.3)",
                        border: showResult ? (isCorrect ? "2px solid hsl(var(--grass) / 0.5)" : isSelected ? "2px solid hsl(var(--destructive) / 0.5)" : "1px solid hsl(var(--chalk) / 0.1)") : "1px solid hsl(var(--chalk) / 0.1)",
                        color: showResult ? (isCorrect ? "hsl(var(--grass))" : isSelected ? "hsl(var(--destructive))" : "hsl(var(--chalk) / 0.5)") : "hsl(var(--chalk))",
                      }}>
                      {showResult && isCorrect && <CheckCircle size={18} />}
                      {showResult && isSelected && !isCorrect && <XCircle size={18} />}
                      <span className="flex-1 text-start">{opt}</span>
                      {showResult && isCorrect && (
                        <motion.button onClick={(e) => { e.stopPropagation(); speakEnglish(opt); }}
                          whileHover={{ scale: 1.2 }} className="p-1 rounded-full" style={{ background: "hsl(var(--grass) / 0.2)" }}>
                          <Volume2 size={14} />
                        </motion.button>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {quizSelected !== null && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleQuizNext}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold"
                    style={{ background: "var(--gradient-sky)", color: "hsl(var(--primary-foreground))" }}>
                    {quizIndex + 1 >= quizQuestions.length
                      ? (lang === "he" ? "סיום" : lang === "ar" ? "إنهاء" : "Finish")
                      : (lang === "he" ? "הבא" : lang === "ar" ? "التالي" : "Next")} →
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </GameShell>
    );
  }

  // ═══ Flashcard view ═══
  return (
    <GameShell title={getPhraseGroupName(selectedGroup, lang)} emoji={selectedGroup.emoji} backPath="/phrases">
      <div className="max-w-2xl mx-auto px-4 py-6" dir={dir}>
        <div className="flex items-center justify-between mb-6">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ color: "hsl(var(--chalk))", background: "hsl(var(--board) / 0.5)", border: "1px solid hsl(var(--grass) / 0.2)" }}>
            <ChevronLeft size={16} />
            {lang === "he" ? "חזור" : lang === "ar" ? "رجوع" : "Back"}
          </motion.button>
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={generateQuiz}
              className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
              style={{ background: "hsl(var(--candy) / 0.15)", color: "hsl(var(--candy))", border: "1px solid hsl(var(--candy) / 0.3)" }}>
              <Brain size={16} />
              {lang === "he" ? "בחן אותי!" : lang === "ar" ? "اختبرني!" : "Quiz Me!"}
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleShuffle}
              className="p-2 rounded-xl" style={{ background: "hsl(var(--sky) / 0.15)", color: "hsl(var(--sky))", border: "1px solid hsl(var(--sky) / 0.3)" }} title="Shuffle">
              <Shuffle size={18} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleReset}
              className="p-2 rounded-xl" style={{ background: "hsl(var(--sunshine) / 0.15)", color: "hsl(var(--sunshine))", border: "1px solid hsl(var(--sunshine) / 0.3)" }} title="Reset">
              <RotateCcw size={18} />
            </motion.button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "hsl(var(--board) / 0.5)" }}>
            <motion.div className="h-full rounded-full" style={{ background: "var(--gradient-grass)" }}
              animate={{ width: `${((cardIndex + 1) / phrases.length) * 100}%` }} transition={{ type: "spring", stiffness: 200 }} />
          </div>
          <span className="text-sm font-bold" style={{ color: "hsl(var(--chalk) / 0.7)" }}>{cardIndex + 1}/{phrases.length}</span>
        </div>

        {currentPhrase && (
          <div className="mb-8" style={{ perspective: "1000px" }}>
            <AnimatePresence mode="wait">
              <motion.div key={`${cardIndex}-${flipped}`}
                initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }} onClick={handleFlip}
                className="cursor-pointer rounded-3xl p-8 min-h-[260px] flex flex-col items-center justify-center text-center relative select-none"
                style={{
                  background: flipped ? "linear-gradient(135deg, hsl(var(--sky) / 0.15), hsl(var(--lavender) / 0.1))" : "linear-gradient(135deg, hsl(var(--grass) / 0.15), hsl(var(--sky) / 0.08))",
                  border: `2px solid ${flipped ? "hsl(var(--sky) / 0.3)" : "hsl(var(--grass) / 0.3)"}`,
                  boxShadow: `0 8px 32px ${flipped ? "hsl(var(--sky) / 0.15)" : "hsl(var(--grass) / 0.15)"}`,
                }}>
                <div className="text-5xl mb-4">{currentPhrase.emoji}</div>
                {!flipped ? (
                  <>
                    <h3 className="text-2xl sm:text-3xl font-extrabold mb-3" style={{ color: "hsl(var(--chalk))", fontFamily: "'Baloo 2', cursive" }}>{currentPhrase.english}</h3>
                    <p className="text-sm" style={{ color: "hsl(var(--chalk) / 0.5)" }}>{lang === "he" ? "לחץ לתרגום" : lang === "ar" ? "انقر للترجمة" : "Tap to translate"}</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl sm:text-3xl font-extrabold mb-2" style={{ color: "hsl(var(--sky))", fontFamily: "'Baloo 2', cursive" }}>{getPhraseTranslation(currentPhrase, lang)}</h3>
                    <p className="text-lg mb-1" style={{ color: "hsl(var(--chalk) / 0.7)" }}>{currentPhrase.english}</p>
                    <div className="mt-3 flex flex-col gap-1 text-sm" style={{ color: "hsl(var(--chalk) / 0.5)" }}>
                      {lang !== "he" && <span dir="rtl">🇮🇱 {currentPhrase.hebrew}</span>}
                      {lang !== "ar" && <span dir="rtl">🇸🇦 {currentPhrase.arabic}</span>}
                      {lang !== "en" && <span>🇬🇧 {currentPhrase.english}</span>}
                    </div>
                  </>
                )}
                <div className="absolute bottom-3 right-3 text-xs px-2 py-1 rounded-lg" style={{ background: "hsl(var(--board) / 0.3)", color: "hsl(var(--chalk) / 0.4)" }}>
                  {flipped ? "🔄" : "👆"}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        <div className="flex items-center justify-center gap-4">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handlePrev} disabled={cardIndex === 0}
            className="w-14 h-14 rounded-2xl flex items-center justify-center disabled:opacity-30"
            style={{ background: "hsl(var(--board) / 0.5)", border: "2px solid hsl(var(--grass) / 0.2)", color: "hsl(var(--chalk))" }}>
            <ChevronLeft size={24} />
          </motion.button>
          {currentPhrase && (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); speakPhrase(currentPhrase, flipped ? lang : "en"); }}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "var(--gradient-grass)", color: "hsl(var(--primary-foreground))", boxShadow: "0 4px 20px hsl(var(--grass) / 0.3)" }}>
              <Volume2 size={28} />
            </motion.button>
          )}
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleNext} disabled={cardIndex >= phrases.length - 1}
            className="w-14 h-14 rounded-2xl flex items-center justify-center disabled:opacity-30"
            style={{ background: "hsl(var(--board) / 0.5)", border: "2px solid hsl(var(--grass) / 0.2)", color: "hsl(var(--chalk))" }}>
            <ChevronRight size={24} />
          </motion.button>
        </div>

        {cardIndex === phrases.length - 1 && flipped && (
          <>
            <Confetti show={true} />
            <CompletionFanfare />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center p-4 rounded-2xl"
              style={{ background: "hsl(var(--grass) / 0.1)", border: "2px solid hsl(var(--grass) / 0.3)" }}>
              <p className="text-lg font-bold" style={{ color: "hsl(var(--grass))" }}>
                🎉 {lang === "he" ? "כל הכבוד! סיימת את כל הביטויים!" : lang === "ar" ? "أحسنت! أتممت جميع العبارات!" : "Well done! You completed all phrases!"}
              </p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={generateQuiz}
                className="mt-3 px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 mx-auto"
                style={{ background: "var(--gradient-candy)", color: "hsl(var(--primary-foreground))" }}>
                <Brain size={16} /> {lang === "he" ? "עכשיו בחן אותי!" : lang === "ar" ? "الآن اختبرني!" : "Now Quiz Me!"}
              </motion.button>
            </motion.div>
          </>
        )}
      </div>
    </GameShell>
  );
};

export default PhrasesPage;
