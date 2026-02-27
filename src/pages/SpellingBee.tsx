import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { getSpellingWords, getWordTranslation, WordCard } from "@/data/learningData";
import { speakEnglish, playCorrectSound, playWrongSound, playComboSound, playStarSound, playVictoryFanfare, playLetterPopSound } from "@/lib/sounds";
import { updateDailyProgress } from "@/lib/xp";
import { saveStageProgress } from "@/lib/levels";
import { saveBestStreak } from "@/lib/achievements";
import { trackGamePlayed } from "@/lib/statsTracker";
import StarRating from "@/components/StarRating";
import Confetti from "@/components/Confetti";
import GameTimer from "@/components/GameTimer";
import StreakCounter from "@/components/StreakCounter";
import ScorePopup, { useScorePopups } from "@/components/ScorePopup";
import XPReward from "@/components/XPReward";
import ComboBurst from "@/components/ComboBurst";
import FloatingParticles from "@/components/FloatingParticles";
import { Volume2, RotateCcw, Zap, Trophy } from "lucide-react";
import BackToLevels from "@/components/BackToLevels";

const TOTAL_ROUNDS = 8;
const TIME_PER_ROUND = 20;
const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const SpellingBee = () => {
  const [searchParams] = useSearchParams();
  const stageId = searchParams.get("stage");
  const { t, lang, dir } = useLanguage();

  const [words, setWords] = useState<WordCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledLetters, setShuffledLetters] = useState<{ letter: string; id: number }[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<{ letter: string; id: number }[]>([]);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCombo, setShowCombo] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);
  const { popups, addPopup } = useScorePopups();

  useEffect(() => {
    const all = shuffle(getSpellingWords(8));
    setWords(all.slice(0, TOTAL_ROUNDS));
  }, []);

  useEffect(() => {
    if (words.length > 0 && currentIndex < words.length) {
      setupRound(words[currentIndex]);
    }
  }, [words, currentIndex]);

  const setupRound = (word: WordCard) => {
    const letters = word.english.toUpperCase().split("").map((l, i) => ({ letter: l, id: i }));
    setShuffledLetters(shuffle(letters));
    setSelectedLetters([]);
    setResult(null);
    setTimerKey(k => k + 1);
    setTimerRunning(true);
    setTimeout(() => speakEnglish(word.english), 400);
  };

  const handleLetterClick = (item: { letter: string; id: number }) => {
    if (result) return;
    playLetterPopSound(selectedLetters.length);
    const newSelected = [...selectedLetters, item];
    setSelectedLetters(newSelected);
    setShuffledLetters(prev => prev.filter(l => l.id !== item.id));
    if (newSelected.length === words[currentIndex].english.length) {
      checkAnswer(newSelected);
    }
  };

  const handleRemoveLetter = (item: { letter: string; id: number }, index: number) => {
    if (result) return;
    setSelectedLetters(prev => prev.filter((_, i) => i !== index));
    setShuffledLetters(prev => [...prev, item]);
  };

  const checkAnswer = (selected: { letter: string; id: number }[]) => {
    setTimerRunning(false);
    const answer = selected.map(s => s.letter).join("");
    const correct = words[currentIndex].english.toUpperCase();

    if (answer === correct) {
      const newStreak = streak + 1;
      const bonus = Math.min(newStreak, 5);
      const points = 10 + bonus * 5;
      setResult("correct");
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
      const finalStars = Math.ceil((score / (TOTAL_ROUNDS * 30)) * 5);
      if (stageId) saveStageProgress(stageId, Math.min(finalStars, 5));
      setXpAmount(Math.max(10, score));
      setShowXP(true);
      const correctCount = Math.round(score / 15);
      trackGamePlayed("spelling", correctCount, TOTAL_ROUNDS - correctCount, Math.max(10, score));
      updateDailyProgress("spelling");
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  const restart = () => {
    const all = shuffle(getSpellingWords(8));
    setWords(all.slice(0, TOTAL_ROUNDS));
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setFinished(false);
  };

  const currentWord = words[currentIndex];
  const stars = Math.ceil((score / (TOTAL_ROUNDS * 30)) * 5);
  const progress = ((currentIndex + 1) / words.length) * 100;

  if (words.length === 0) return null;

  return (
    <div className="min-h-screen relative" dir={dir}>
      <FloatingParticles count={6} />
      <Confetti show={showConfetti} />
      <ScorePopup popups={popups} />
      <ComboBurst combo={streak} show={showCombo} />
      <XPReward amount={xpAmount} show={showXP} gameType="spelling" onComplete={() => setShowXP(false)} />
      
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
            style={{ background: "linear-gradient(135deg, hsl(var(--sunshine)), hsl(var(--primary)))" }}
          >
            🐝
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-gradient mb-2">{t("spelling.title")}</h1>
          <p className="text-muted-foreground font-body text-sm sm:text-base">{t("spelling.subtitle")}</p>
        </motion.div>

        {!finished ? (
          <>
            {/* Stats bar */}
            <div className="bg-card rounded-xl border border-border shadow-[var(--shadow-card)] p-3 mb-4 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-muted/50 rounded-full px-3 py-1.5">
                  <span className="font-display font-bold text-sm">{currentIndex + 1}/{words.length}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-primary/10 rounded-full px-3 py-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="font-display font-bold text-sm text-primary">{score}</span>
                </div>
              </div>
              <StreakCounter streak={streak} bestStreak={bestStreak} />
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="h-2.5 rounded-full bg-muted overflow-hidden border border-border">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, hsl(var(--sunshine)), hsl(var(--primary)))" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="mb-5">
              <GameTimer key={timerKey} seconds={TIME_PER_ROUND} running={timerRunning} onTimeUp={handleTimeUp} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] p-6 sm:p-8 text-center mb-6"
              >
                <motion.span
                  className="text-6xl sm:text-7xl mb-4 block"
                  key={currentIndex}
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                >
                  {currentWord.emoji}
                </motion.span>
                <p className="font-display text-lg text-muted-foreground mb-2">
                  {getWordTranslation(currentWord, lang)}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => speakEnglish(currentWord.english)}
                  className="inline-flex items-center gap-1.5 text-primary font-display text-sm mb-6 bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/15 border border-primary/20 transition-colors"
                >
                  <Volume2 className="w-4 h-4" /> {t("spelling.listen")}
                </motion.button>

                {/* Answer slots */}
                <div className="flex justify-center gap-2 mb-6 min-h-[60px]">
                  {currentWord.english.split("").map((_, i) => {
                    const placed = selectedLetters[i];
                    return (
                      <motion.div
                        key={i}
                        layout
                        className={`w-11 sm:w-12 h-13 sm:h-14 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-display font-bold border-2 transition-all cursor-pointer ${
                          result === "correct"
                            ? "border-accent bg-accent/12 text-accent shadow-md"
                            : result === "wrong"
                            ? "border-destructive bg-destructive/12 text-destructive"
                            : placed
                            ? "border-primary bg-primary/8 text-foreground shadow-sm hover:shadow-md"
                            : "border-muted/50 bg-muted/20 text-transparent"
                        }`}
                        onClick={() => placed && handleRemoveLetter(placed, i)}
                      >
                        {placed ? (
                          <motion.span
                            initial={{ scale: 0, y: -8 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                          >
                            {placed.letter}
                          </motion.span>
                        ) : <span className="opacity-30">_</span>}
                      </motion.div>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`text-lg font-display font-bold mb-4 py-2.5 px-5 rounded-xl inline-block ${
                        result === "correct" 
                          ? "text-accent bg-accent/10 border border-accent/20" 
                          : "text-destructive bg-destructive/10 border border-destructive/20"
                      }`}
                    >
                      {result === "correct" ? `🎉 ${t("quiz.correct")}` : `😅 ${t("quiz.wrong")} → ${currentWord.english}`}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Shuffled letters */}
                <div className="flex justify-center gap-2 flex-wrap">
                  {shuffledLetters.map((item) => (
                    <motion.button
                      key={item.id}
                      layout
                      whileHover={{ scale: 1.1, y: -4 }}
                      whileTap={{ scale: 0.88 }}
                      onClick={() => handleLetterClick(item)}
                      disabled={!!result}
                      className="w-11 sm:w-12 h-13 sm:h-14 rounded-xl bg-card border-2 border-primary/25 text-xl font-display font-bold text-foreground hover:bg-primary/10 hover:border-primary/50 hover:shadow-[var(--shadow-card-hover)] active:shadow-sm transition-all duration-200"
                    >
                      {item.letter}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            className="bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] p-8 sm:p-10 text-center"
          >
            <motion.span
              className="text-7xl sm:text-8xl mb-5 block"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.15 }}
            >
              🐝
            </motion.span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-gradient mb-4">{t("spelling.finished")}</h2>
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
            <div className="my-5"><StarRating earned={stars} total={5} size={40} /></div>
            <p className="font-body text-base text-muted-foreground mb-7 max-w-xs mx-auto">
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
      </div>
    </div>
  );
};

export default SpellingBee;
