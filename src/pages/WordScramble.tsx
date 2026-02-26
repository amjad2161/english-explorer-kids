import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { getSpellingWords, getWordTranslation, WordCard } from "@/data/learningData";
import { speakEnglish, playCorrectSound, playWrongSound, playComboSound, playVictoryFanfare, playClickSound } from "@/lib/sounds";
import { saveStageProgress } from "@/lib/levels";
import { saveBestStreak } from "@/lib/achievements";
import StarRating from "@/components/StarRating";
import Confetti from "@/components/Confetti";
import GameTimer from "@/components/GameTimer";
import StreakCounter from "@/components/StreakCounter";
import ScorePopup, { useScorePopups } from "@/components/ScorePopup";
import { Volume2, RotateCcw, Shuffle } from "lucide-react";

const TOTAL_ROUNDS = 8;
const TIME_PER_ROUND = 25;

const shuffleArray = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const WordScramble = () => {
  const [searchParams] = useSearchParams();
  const stageId = searchParams.get("stage");
  const { t, lang, dir } = useLanguage();

  const [words, setWords] = useState<WordCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambled, setScrambled] = useState("");
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [hintRevealed, setHintRevealed] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const { popups, addPopup } = useScorePopups();

  useEffect(() => {
    // Mix different word lengths for variety
    const short = shuffleArray(getSpellingWords(5)).slice(0, 3);
    const medium = shuffleArray(getSpellingWords(7).filter(w => w.english.length > 4)).slice(0, 3);
    const long = shuffleArray(getSpellingWords(9).filter(w => w.english.length > 6)).slice(0, 2);
    setWords(shuffleArray([...short, ...medium, ...long]).slice(0, TOTAL_ROUNDS));
  }, []);

  useEffect(() => {
    if (words.length > 0 && currentIndex < words.length) setupRound();
  }, [words, currentIndex]);

  const setupRound = () => {
    const word = words[currentIndex].english.toUpperCase();
    let s = shuffleArray(word.split("")).join("");
    while (s === word && word.length > 2) s = shuffleArray(word.split("")).join("");
    setScrambled(s);
    setUserInput("");
    setResult(null);
    setHintRevealed(0);
    setTimerKey(k => k + 1);
    setTimerRunning(true);
    setTimeout(() => speakEnglish(words[currentIndex].english), 300);
  };

  const reshuffle = () => {
    playClickSound();
    const word = words[currentIndex].english.toUpperCase();
    setScrambled(shuffleArray(word.split("")).join(""));
  };

  const revealHint = () => {
    if (hintRevealed >= words[currentIndex].english.length - 1) return;
    playClickSound();
    const next = hintRevealed + 1;
    setHintRevealed(next);
    setUserInput(words[currentIndex].english.substring(0, next).toUpperCase());
  };

  const handleInputChange = (val: string) => {
    if (result) return;
    setUserInput(val.toUpperCase());
  };

  const handleSubmit = () => {
    if (result || !userInput) return;
    setTimerRunning(false);
    const correct = words[currentIndex].english.toUpperCase();

    if (userInput === correct) {
      const newStreak = streak + 1;
      const hintPenalty = hintRevealed * 3;
      const points = Math.max(5, 15 + Math.min(newStreak, 5) * 3 - hintPenalty);
      setResult("correct");
      setScore(s => s + points);
      setStreak(newStreak);
      setBestStreak(b => { const best = Math.max(b, newStreak); saveBestStreak(best); return best; });
      if (newStreak >= 3) playComboSound(newStreak); else playCorrectSound();
      addPopup(points, newStreak >= 3 ? `×${newStreak}` : "✓");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
    } else {
      setResult("wrong");
      setStreak(0);
      playWrongSound();
    }
    setTimeout(() => advance(), 1500);
  };

  const handleTimeUp = useCallback(() => {
    if (result) return;
    setResult("wrong");
    setStreak(0);
    playWrongSound();
    setTimeout(() => advance(), 1200);
  }, [result, currentIndex]);

  const advance = () => {
    if (currentIndex + 1 >= words.length) {
      setFinished(true);
      playVictoryFanfare();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
      if (stageId) saveStageProgress(stageId, Math.min(Math.ceil((score / (TOTAL_ROUNDS * 20)) * 5), 5));
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

  const currentWord = words[currentIndex];
  const stars = Math.ceil((score / (TOTAL_ROUNDS * 20)) * 5);

  if (words.length === 0) return null;

  return (
    <div className="min-h-screen" dir={dir}>
      <Confetti show={showConfetti} />
      <ScorePopup popups={popups} />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">{t("scramble.title")}</h1>
          <p className="text-muted-foreground font-body">{t("scramble.subtitle")}</p>
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

            <div className="mb-4">
              <GameTimer key={timerKey} seconds={TIME_PER_ROUND} running={timerRunning} onTimeUp={handleTimeUp} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                className="card-kid text-center mb-6"
              >
                <motion.div className="text-5xl mb-3" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  {currentWord.emoji}
                </motion.div>
                <p className="font-display text-lg text-muted-foreground mb-1">{getWordTranslation(currentWord, lang)}</p>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => speakEnglish(currentWord.english)}
                  className="inline-flex items-center gap-1 text-primary font-display text-sm mb-4">
                  <Volume2 className="w-4 h-4" /> {t("spelling.listen")}
                </motion.button>

                {/* Scrambled letters */}
                <div className="flex justify-center gap-2 mb-4 flex-wrap">
                  {scrambled.split("").map((letter, i) => (
                    <motion.div
                      key={`${i}-${letter}`}
                      initial={{ rotate: Math.random() * 40 - 20, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ delay: i * 0.08, type: "spring" }}
                      className="w-12 h-14 rounded-xl bg-candy/20 border-2 border-candy/40 flex items-center justify-center text-2xl font-display font-bold text-foreground"
                    >
                      {letter}
                    </motion.div>
                  ))}
                </div>

                {/* Input */}
                <div className="flex justify-center gap-2 mb-4">
                  <input
                    type="text"
                    value={userInput}
                    onChange={e => handleInputChange(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    maxLength={currentWord.english.length}
                    className={`text-center text-2xl font-display font-bold tracking-[0.3em] w-full max-w-xs px-4 py-3 rounded-xl border-2 bg-card focus:outline-none transition-colors ${
                      result === "correct" ? "border-accent bg-accent/10" :
                      result === "wrong" ? "border-destructive bg-destructive/10" :
                      "border-primary/30 focus:border-primary"
                    }`}
                    placeholder={currentWord.english.replace(/./g, "_ ").trim()}
                    disabled={!!result}
                    dir="ltr"
                  />
                </div>

                <AnimatePresence>
                  {result && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className={`text-lg font-display font-bold mb-3 ${result === "correct" ? "text-accent" : "text-destructive"}`}>
                      {result === "correct" ? t("quiz.correct") : `${t("quiz.wrong")} → ${currentWord.english}`}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-center gap-3">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={reshuffle} disabled={!!result}
                    className="btn-kid gradient-sky text-secondary-foreground flex items-center gap-1 text-sm">
                    <Shuffle className="w-4 h-4" /> {t("scramble.reshuffle")}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={revealHint} disabled={!!result || hintRevealed >= currentWord.english.length - 1}
                    className="btn-kid bg-muted text-foreground text-sm">
                    💡 {t("scramble.hint")}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit} disabled={!!result || !userInput}
                    className="btn-kid gradient-primary text-primary-foreground text-sm">
                    ✓ {t("scramble.check")}
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card-kid text-center">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="text-7xl mb-4">🔀</motion.div>
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

export default WordScramble;
