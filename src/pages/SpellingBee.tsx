import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { getSpellingWords, getWordTranslation, WordCard } from "@/data/learningData";
import { speakEnglish, playCorrectSound, playWrongSound, playComboSound, playStarSound, playVictoryFanfare, playLetterPopSound } from "@/lib/sounds";
import { saveStageProgress } from "@/lib/levels";
import { saveBestStreak } from "@/lib/achievements";
import { trackGamePlayed } from "@/lib/statsTracker";
import StarRating from "@/components/StarRating";
import Confetti from "@/components/Confetti";
import GameTimer from "@/components/GameTimer";
import StreakCounter from "@/components/StreakCounter";
import ScorePopup, { useScorePopups } from "@/components/ScorePopup";
import XPReward from "@/components/XPReward";
import FloatingParticles from "@/components/FloatingParticles";
import ComboBurst from "@/components/ComboBurst";
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

  if (words.length === 0) return null;

  return (
    <div className="min-h-screen relative" dir={dir}>
      <FloatingParticles count={10} />
      <Confetti show={showConfetti} />
      <ScorePopup popups={popups} />
      <ComboBurst combo={streak} show={showCombo} />
      <XPReward amount={xpAmount} show={showXP} gameType="spelling" onComplete={() => setShowXP(false)} />
      
      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        <BackToLevels />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">{t("spelling.title")}</h1>
          <p className="text-muted-foreground font-body">{t("spelling.subtitle")}</p>
        </motion.div>

        {!finished ? (
          <>
            {/* Stats bar */}
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
                initial={{ scale: 0.85, opacity: 0, rotateY: 60 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ scale: 0.85, opacity: 0, rotateY: -60 }}
                transition={{ type: "spring", stiffness: 250, damping: 25 }}
                className="card-kid text-center mb-6 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-sunshine/3 to-primary/3 pointer-events-none" />
                
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-7xl mb-3 relative z-10 drop-shadow-lg"
                >
                  {currentWord.emoji}
                </motion.div>
                <p className="font-display text-lg text-muted-foreground mb-2 relative z-10">
                  {getWordTranslation(currentWord, lang)}
                </p>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => speakEnglish(currentWord.english)}
                  className="inline-flex items-center gap-1.5 text-primary font-display text-sm mb-5 bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/15 transition-colors relative z-10"
                >
                  <Volume2 className="w-4 h-4" /> {t("spelling.listen")}
                </motion.button>

                {/* Answer slots */}
                <div className="flex justify-center gap-2 mb-6 min-h-[60px] relative z-10">
                  {currentWord.english.split("").map((_, i) => {
                    const placed = selectedLetters[i];
                    return (
                      <motion.div
                        key={i}
                        layout
                        className={`w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-display font-bold border-2 transition-all ${
                          result === "correct"
                            ? "border-accent bg-accent/15 text-accent shadow-md"
                            : result === "wrong"
                            ? "border-destructive bg-destructive/15 text-destructive"
                            : placed
                            ? "border-primary bg-primary/10 text-foreground cursor-pointer shadow-sm"
                            : "border-muted/60 bg-muted/30 text-transparent"
                        }`}
                        onClick={() => placed && handleRemoveLetter(placed, i)}
                        whileHover={placed && !result ? { scale: 1.1, y: -2 } : {}}
                      >
                        {placed ? (
                          <motion.span
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            {placed.letter}
                          </motion.span>
                        ) : "_"}
                      </motion.div>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ scale: 0, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      className={`text-lg font-display font-bold mb-3 relative z-10 ${
                        result === "correct" ? "text-accent" : "text-destructive"
                      }`}
                    >
                      {result === "correct" ? t("quiz.correct") : `${t("quiz.wrong")} → ${currentWord.english}`}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Shuffled letters */}
                <div className="flex justify-center gap-2 flex-wrap relative z-10">
                  {shuffledLetters.map((item) => (
                    <motion.button
                      key={item.id}
                      layout
                      whileHover={{ scale: 1.18, y: -6, rotate: Math.random() * 6 - 3 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => handleLetterClick(item)}
                      disabled={!!result}
                      className="w-12 h-14 rounded-xl bg-primary/10 border-2 border-primary/30 text-xl font-display font-bold text-foreground hover:bg-primary/20 hover:border-primary hover:shadow-md transition-all"
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
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card-kid text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sunshine/5 to-accent/5 pointer-events-none" />
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-4 relative z-10 drop-shadow-xl"
            >
              🐝
            </motion.div>
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
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={restart}
              className="btn-kid gradient-primary text-primary-foreground flex items-center gap-2 mx-auto relative z-10"
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
