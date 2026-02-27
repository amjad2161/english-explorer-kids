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
import XPReward from "@/components/XPReward";
import FloatingParticles from "@/components/FloatingParticles";
import { Volume2, RotateCcw, Shuffle, Zap, Trophy } from "lucide-react";
import BackToLevels from "@/components/BackToLevels";

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

  const handleSubmit = () => {
    if (result || !userInput) return;
    setTimerRunning(false);
    const correct = words[currentIndex].english.toUpperCase();
    if (userInput.toUpperCase() === correct) {
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
      setXpAmount(Math.max(10, score));
      setShowXP(true);
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
    <div className="min-h-screen relative" dir={dir}>
      <FloatingParticles count={10} />
      <Confetti show={showConfetti} />
      <ScorePopup popups={popups} />
      <XPReward amount={xpAmount} show={showXP} gameType="scramble" onComplete={() => setShowXP(false)} />
      
      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        <BackToLevels />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">{t("scramble.title")}</h1>
          <p className="text-muted-foreground font-body">{t("scramble.subtitle")}</p>
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

            <div className="mb-4">
              <GameTimer key={timerKey} seconds={TIME_PER_ROUND} running={timerRunning} onTimeUp={handleTimeUp} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ x: 100, opacity: 0, rotateY: 20 }}
                animate={{ x: 0, opacity: 1, rotateY: 0 }}
                exit={{ x: -100, opacity: 0, rotateY: -20 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="card-kid text-center mb-6 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-candy/3 to-primary/3 pointer-events-none" />
                
                <motion.div className="text-6xl mb-3 relative z-10 drop-shadow-lg"
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {currentWord.emoji}
                </motion.div>
                <p className="font-display text-lg text-muted-foreground mb-1 relative z-10">{getWordTranslation(currentWord, lang)}</p>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => speakEnglish(currentWord.english)}
                  className="inline-flex items-center gap-1.5 text-primary font-display text-sm mb-4 bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/15 transition-colors relative z-10">
                  <Volume2 className="w-4 h-4" /> {t("spelling.listen")}
                </motion.button>

                {/* Scrambled letters with 3D effect */}
                <div className="flex justify-center gap-2 mb-5 flex-wrap relative z-10">
                  {scrambled.split("").map((letter, i) => (
                    <motion.div
                      key={`${i}-${letter}-${scrambled}`}
                      initial={{ rotate: Math.random() * 30 - 15, scale: 0, y: -20 }}
                      animate={{ rotate: 0, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.06, type: "spring", stiffness: 300 }}
                      className="w-12 h-14 rounded-xl bg-candy/15 border-2 border-candy/30 flex items-center justify-center text-2xl font-display font-bold text-foreground shadow-sm"
                    >
                      {letter}
                    </motion.div>
                  ))}
                </div>

                {/* Input */}
                <div className="flex justify-center gap-2 mb-4 relative z-10">
                  <input
                    type="text"
                    value={userInput}
                    onChange={e => setUserInput(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    maxLength={currentWord.english.length}
                    className={`text-center text-2xl font-display font-bold tracking-[0.3em] w-full max-w-xs px-4 py-3 rounded-xl border-2 bg-card focus:outline-none transition-all ${
                      result === "correct" ? "border-accent bg-accent/10 shadow-md" :
                      result === "wrong" ? "border-destructive bg-destructive/10" :
                      "border-primary/30 focus:border-primary focus:shadow-md"
                    }`}
                    placeholder={currentWord.english.replace(/./g, "_ ").trim()}
                    disabled={!!result}
                    dir="ltr"
                  />
                </div>

                <AnimatePresence>
                  {result && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className={`text-lg font-display font-bold mb-3 relative z-10 ${result === "correct" ? "text-accent" : "text-destructive"}`}>
                      {result === "correct" ? t("quiz.correct") : `${t("quiz.wrong")} → ${currentWord.english}`}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-center gap-3 relative z-10">
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
          <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="card-kid text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-candy/5 to-primary/5 pointer-events-none" />
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="text-8xl mb-4 relative z-10 drop-shadow-xl">🔀</motion.div>
            <h2 className="text-3xl font-display font-bold text-gradient mb-2 relative z-10">{t("spelling.finished")}</h2>
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
            <div className="my-4 relative z-10"><StarRating earned={stars} total={5} size={32} /></div>
            <p className="font-display text-lg font-semibold text-primary mb-4 relative z-10">
              {stars >= 4 ? t("quiz.amazing") : stars >= 2 ? t("quiz.wellDone") : t("quiz.keepTrying")}
            </p>
            <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
              onClick={restart} className="btn-kid gradient-primary text-primary-foreground flex items-center gap-2 mx-auto relative z-10">
              <RotateCcw className="w-5 h-5" /> {t("quiz.playAgain")}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WordScramble;
