import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { getSpellingWords, getWordTranslation, WordCard } from "@/data/learningData";
import { speakEnglish, playCorrectSound, playWrongSound, playVictoryFanfare, playClickSound, playComboSound } from "@/lib/sounds";
import { saveStageProgress } from "@/lib/levels";
import { saveBestStreak } from "@/lib/achievements";
import { trackGamePlayed } from "@/lib/statsTracker";
import { updateDailyProgress } from "@/lib/xp";
import StarRating from "@/components/StarRating";
import Confetti from "@/components/Confetti";
import StreakCounter from "@/components/StreakCounter";
import ScorePopup, { useScorePopups } from "@/components/ScorePopup";
import XPReward from "@/components/XPReward";
import { Volume2, RotateCcw, Zap, Trophy, Heart } from "lucide-react";
import BackToLevels from "@/components/BackToLevels";

const TOTAL_ROUNDS = 8;
const MAX_WRONG = 6;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const characterStages = ["😊", "😐", "😟", "😰", "😱", "😵", "💀"];
const shuffleArray = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const HangmanGame = () => {
  const [searchParams] = useSearchParams();
  const stageId = searchParams.get("stage");
  const { t, lang, dir } = useLanguage();

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
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);
  const { popups, addPopup } = useScorePopups();

  useEffect(() => {
    const short = shuffleArray(getSpellingWords(5)).slice(0, 3);
    const medium = shuffleArray(getSpellingWords(7).filter(w => w.english.length > 4)).slice(0, 3);
    const long = shuffleArray(getSpellingWords(9).filter(w => w.english.length > 6)).slice(0, 2);
    setWords(shuffleArray([...short, ...medium, ...long]).slice(0, TOTAL_ROUNDS));
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

  const handleGuess = (letter: string) => {
    if (result || guessedLetters.has(letter)) return;
    playClickSound();
    const newGuessed = new Set(guessedLetters);
    newGuessed.add(letter);
    setGuessedLetters(newGuessed);

    if (wordLetters.includes(letter)) {
      if (wordLetters.every(l => newGuessed.has(l))) {
        const newStreak = streak + 1;
        const points = Math.max(5, (MAX_WRONG - wrongCount) * 5 + Math.min(newStreak, 5) * 3);
        setResult("won");
        setScore(s => s + points);
        setStreak(newStreak);
        setBestStreak(b => { const best = Math.max(b, newStreak); saveBestStreak(best); return best; });
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
      setXpAmount(Math.max(10, score));
      setShowXP(true);
      const correctCount = Math.round(score / 10);
      trackGamePlayed("hangman", correctCount, TOTAL_ROUNDS - correctCount, Math.max(10, score));
      updateDailyProgress("hangman");
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  const restart = () => {
    const short = shuffleArray(getSpellingWords(5)).slice(0, 3);
    const medium = shuffleArray(getSpellingWords(7).filter(w => w.english.length > 4)).slice(0, 3);
    const long = shuffleArray(getSpellingWords(9).filter(w => w.english.length > 6)).slice(0, 2);
    setWords(shuffleArray([...short, ...medium, ...long]).slice(0, TOTAL_ROUNDS));
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setFinished(false);
  };

  const stars = Math.ceil((score / (TOTAL_ROUNDS * 30)) * 5);
  if (words.length === 0) return null;

  return (
    <div className="min-h-screen relative" dir={dir}>
      <Confetti show={showConfetti} />
      <ScorePopup popups={popups} />
      <XPReward amount={xpAmount} show={showXP} gameType="hangman" onComplete={() => setShowXP(false)} />
      
      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        <BackToLevels />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-6"
        >
          <span className="text-5xl mb-3 block">🎭</span>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">{t("hangman.title")}</h1>
          <p className="text-muted-foreground font-body">{t("hangman.subtitle")}</p>
        </motion.div>

        {!finished ? (
          <>
            <div className="card-glass mb-4 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1">
                  <span className="font-display font-bold text-sm">{currentIndex + 1}/{words.length}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-primary/10 rounded-full px-3 py-1">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="font-display font-bold text-sm text-primary">{score}</span>
                </div>
              </div>
              <StreakCounter streak={streak} bestStreak={bestStreak} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="card-kid text-center mb-6"
              >
                {/* Character & lives */}
                <div className="flex items-center justify-center gap-6 mb-5">
                  <motion.div
                    key={wrongCount}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-6xl"
                  >
                    {characterStages[wrongCount]}
                  </motion.div>
                  <div className="flex gap-1.5">
                    {Array.from({ length: MAX_WRONG }).map((_, i) => (
                      <Heart
                        key={i}
                        className={`w-5 h-5 transition-all duration-300 ${
                          i < wrongCount
                            ? "text-destructive/30 fill-destructive/30"
                            : "text-destructive fill-destructive"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Hint */}
                <div className="flex items-center justify-center gap-3 mb-5">
                  <span className="text-5xl">{currentWord.emoji}</span>
                  <p className="font-display text-lg text-muted-foreground">{getWordTranslation(currentWord, lang)}</p>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => speakEnglish(currentWord.english)}
                    className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                    <Volume2 className="w-4.5 h-4.5" />
                  </motion.button>
                </div>

                {/* Word display */}
                <div className="flex justify-center gap-2.5 mb-6 flex-wrap" dir="ltr">
                  {wordLetters.map((letter, i) => {
                    const revealed = guessedLetters.has(letter) || result === "lost";
                    return (
                      <motion.div
                        key={i}
                        layout
                        className={`w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-display font-bold border-b-4 shadow-sm ${
                          result === "won" ? "border-accent bg-accent/10 text-accent" :
                          result === "lost" && !guessedLetters.has(letter) ? "border-destructive bg-destructive/10 text-destructive" :
                          revealed ? "border-primary bg-primary/10 text-foreground" :
                          "border-muted/60 bg-muted/20"
                        }`}
                      >
                        {revealed ? (
                          <motion.span
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                          >
                            {letter}
                          </motion.span>
                        ) : (
                          <span className="text-muted-foreground/40">_</span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Result */}
                <AnimatePresence>
                  {result && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className={`text-lg font-display font-bold mb-4 ${result === "won" ? "text-accent" : "text-destructive"}`}>
                      {result === "won" ? t("quiz.correct") : `${t("hangman.lost")} → ${currentWord.english}`}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Keyboard */}
                <div className="flex flex-wrap justify-center gap-1.5 max-w-md mx-auto" dir="ltr">
                  {ALPHABET.map((letter) => {
                    const guessed = guessedLetters.has(letter);
                    const isCorrectGuess = guessed && wordLetters.includes(letter);
                    const isWrongGuess = guessed && !wordLetters.includes(letter);
                    return (
                      <motion.button
                        key={letter}
                        whileHover={!guessed && !result ? { scale: 1.15, y: -2 } : {}}
                        whileTap={!guessed && !result ? { scale: 0.9 } : {}}
                        onClick={() => handleGuess(letter)}
                        disabled={guessed || !!result}
                        className={`w-9 h-10 rounded-lg font-display font-bold text-sm transition-all shadow-sm ${
                          isCorrectGuess ? "bg-accent text-accent-foreground" :
                          isWrongGuess ? "bg-destructive/15 text-destructive/60 line-through" :
                          "bg-muted hover:bg-primary/15 hover:shadow-md text-foreground"
                        } ${guessed || result ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="card-kid text-center">
            <span className="text-7xl mb-4 block">🎭</span>
            <h2 className="text-3xl font-display font-bold text-gradient mb-2">{t("spelling.finished")}</h2>
            <div className="flex justify-center gap-4 mb-4">
              <div className="bg-primary/10 rounded-2xl px-4 py-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="font-display font-bold text-lg">{score}</span>
              </div>
              <div className="bg-accent/10 rounded-2xl px-4 py-2 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent" />
                <span className="font-display font-bold text-lg">{bestStreak}</span>
              </div>
            </div>
            <div className="my-4"><StarRating earned={stars} total={5} size={32} /></div>
            <p className="font-display text-lg font-semibold text-primary mb-4">
              {stars >= 4 ? t("quiz.amazing") : stars >= 2 ? t("quiz.wellDone") : t("quiz.keepTrying")}
            </p>
            <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
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
