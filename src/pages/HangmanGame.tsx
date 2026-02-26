import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { getSpellingWords, getWordTranslation, WordCard } from "@/data/learningData";
import { speakEnglish, playCorrectSound, playWrongSound, playVictoryFanfare, playClickSound, playComboSound } from "@/lib/sounds";
import { saveStageProgress } from "@/lib/levels";
import StarRating from "@/components/StarRating";
import Confetti from "@/components/Confetti";
import StreakCounter from "@/components/StreakCounter";
import ScorePopup, { useScorePopups } from "@/components/ScorePopup";
import { Volume2, RotateCcw } from "lucide-react";

const TOTAL_ROUNDS = 8;
const MAX_WRONG = 6;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Kid-friendly character stages (instead of hangman)
const characterStages = ["😊", "😐", "😟", "😰", "😱", "😵", "💀"];

const shuffleArray = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const HangmanGame = () => {
  const [searchParams] = useSearchParams();
  const stageId = searchParams.get("stage");
  const { t, lang } = useLanguage();

  const [words, setWords] = useState<WordCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [result, setResult] = useState<"won" | "lost" | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { popups, addPopup } = useScorePopups();

  useEffect(() => {
    const all = shuffleArray(getSpellingWords(7));
    setWords(all.slice(0, TOTAL_ROUNDS));
  }, []);

  useEffect(() => {
    if (words.length > 0 && currentIndex < words.length) {
      setGuessedLetters(new Set());
      setWrongCount(0);
      setResult(null);
      setTimeout(() => speakEnglish(words[currentIndex].english), 400);
    }
  }, [words, currentIndex]);

  const currentWord = words[currentIndex];
  const wordLetters = currentWord?.english.toUpperCase().split("") || [];
  const isWordGuessed = wordLetters.every(l => guessedLetters.has(l));

  const handleGuess = (letter: string) => {
    if (result || guessedLetters.has(letter)) return;
    playClickSound();

    const newGuessed = new Set(guessedLetters);
    newGuessed.add(letter);
    setGuessedLetters(newGuessed);

    if (wordLetters.includes(letter)) {
      // Check if word is now complete
      if (wordLetters.every(l => newGuessed.has(l))) {
        const newStreak = streak + 1;
        const points = Math.max(5, (MAX_WRONG - wrongCount) * 5 + Math.min(newStreak, 5) * 3);
        setResult("won");
        setScore(s => s + points);
        setStreak(newStreak);
        setBestStreak(b => Math.max(b, newStreak));
        if (newStreak >= 3) playComboSound(newStreak); else playCorrectSound();
        addPopup(points, newStreak >= 3 ? `×${newStreak}` : "✓");
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 100);
        setTimeout(() => advance(), 1800);
      }
    } else {
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      playWrongSound();
      if (newWrong >= MAX_WRONG) {
        setResult("lost");
        setStreak(0);
        setTimeout(() => advance(), 2000);
      }
    }
  };

  const advance = () => {
    if (currentIndex + 1 >= words.length) {
      setFinished(true);
      playVictoryFanfare();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
      if (stageId) saveStageProgress(stageId, Math.min(Math.ceil((score / (TOTAL_ROUNDS * 30)) * 5), 5));
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  const restart = () => {
    const all = shuffleArray(getSpellingWords(7));
    setWords(all.slice(0, TOTAL_ROUNDS));
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setFinished(false);
  };

  const stars = Math.ceil((score / (TOTAL_ROUNDS * 30)) * 5);
  if (words.length === 0) return null;

  return (
    <div className="min-h-screen" dir="rtl">
      <Confetti show={showConfetti} />
      <ScorePopup popups={popups} />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">{t("hangman.title")}</h1>
          <p className="text-muted-foreground font-body">{t("hangman.subtitle")}</p>
        </motion.div>

        {!finished ? (
          <>
            <div className="card-kid mb-4 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <span className="font-display font-bold text-sm">{currentIndex + 1}/{words.length}</span>
                <span className="font-display font-bold text-primary">🎯 {score}</span>
              </div>
              <StreakCounter streak={streak} bestStreak={bestStreak} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="card-kid text-center mb-6"
              >
                {/* Character & progress */}
                <div className="flex items-center justify-center gap-6 mb-4">
                  <motion.div
                    key={wrongCount}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="text-6xl"
                  >
                    {characterStages[wrongCount]}
                  </motion.div>
                  <div className="flex gap-1">
                    {Array.from({ length: MAX_WRONG }).map((_, i) => (
                      <motion.div
                        key={i}
                        className={`w-4 h-4 rounded-full transition-colors ${
                          i < wrongCount ? "bg-destructive" : "bg-accent/30"
                        }`}
                        animate={i < wrongCount ? { scale: [1, 1.3, 1] } : {}}
                      />
                    ))}
                  </div>
                </div>

                {/* Hint */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  <motion.div className="text-4xl" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    {currentWord.emoji}
                  </motion.div>
                  <p className="font-display text-lg text-muted-foreground">{getWordTranslation(currentWord, lang)}</p>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => speakEnglish(currentWord.english)}
                    className="text-primary">
                    <Volume2 className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Word display */}
                <div className="flex justify-center gap-2 mb-6 flex-wrap" dir="ltr">
                  {wordLetters.map((letter, i) => {
                    const revealed = guessedLetters.has(letter) || result === "lost";
                    return (
                      <motion.div
                        key={i}
                        layout
                        className={`w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-display font-bold border-b-4 ${
                          result === "won" ? "border-accent bg-accent/10 text-accent" :
                          result === "lost" && !guessedLetters.has(letter) ? "border-destructive bg-destructive/10 text-destructive" :
                          revealed ? "border-primary bg-primary/10 text-foreground" :
                          "border-muted bg-muted/30"
                        }`}
                      >
                        <AnimatePresence mode="wait">
                          {revealed ? (
                            <motion.span
                              key="letter"
                              initial={{ rotateX: 90 }}
                              animate={{ rotateX: 0 }}
                              transition={{ type: "spring" }}
                            >
                              {letter}
                            </motion.span>
                          ) : (
                            <motion.span key="blank" className="text-muted-foreground">_</motion.span>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Result */}
                <AnimatePresence>
                  {result && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className={`text-lg font-display font-bold mb-4 ${result === "won" ? "text-accent" : "text-destructive"}`}>
                      {result === "won" ? t("quiz.correct") : `${t("hangman.lost")} → ${currentWord.english}`}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Keyboard */}
                <div className="flex flex-wrap justify-center gap-1.5 max-w-md mx-auto" dir="ltr">
                  {ALPHABET.map(letter => {
                    const guessed = guessedLetters.has(letter);
                    const isCorrect = guessed && wordLetters.includes(letter);
                    const isWrong = guessed && !wordLetters.includes(letter);
                    return (
                      <motion.button
                        key={letter}
                        whileHover={!guessed && !result ? { scale: 1.2, y: -3 } : {}}
                        whileTap={!guessed && !result ? { scale: 0.9 } : {}}
                        onClick={() => handleGuess(letter)}
                        disabled={guessed || !!result}
                        className={`w-9 h-10 rounded-lg font-display font-bold text-sm transition-all ${
                          isCorrect ? "bg-accent text-accent-foreground" :
                          isWrong ? "bg-destructive/20 text-destructive line-through" :
                          "bg-muted hover:bg-primary/20 text-foreground"
                        } ${guessed || result ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        {letter}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card-kid text-center">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-7xl mb-4">🎭</motion.div>
            <h2 className="text-3xl font-display font-bold text-gradient mb-2">{t("spelling.finished")}</h2>
            <p className="text-xl font-display mb-2">🎯 {score} {t("spelling.points")}</p>
            <p className="text-muted-foreground font-body mb-2">🏅 {t("spelling.bestStreak")}: {bestStreak}</p>
            <div className="my-4"><StarRating earned={stars} total={5} size={28} /></div>
            <p className="font-display text-lg font-semibold text-primary mb-4">
              {stars >= 4 ? t("quiz.amazing") : stars >= 2 ? t("quiz.wellDone") : t("quiz.keepTrying")}
            </p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={restart} className="btn-kid gradient-primary text-primary-foreground flex items-center gap-2 mx-auto">
              <RotateCcw className="w-5 h-5" /> {t("quiz.playAgain")}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HangmanGame;
