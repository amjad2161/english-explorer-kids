import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { getSpellingWords, getWordTranslation, WordCard } from "@/data/learningData";
import { speakEnglish, playLetterPopSound, playCorrectSound, playWrongSound, playVictoryFanfare, startBgMusic, stopBgMusic } from "@/lib/sounds";
import { useRewardsPipeline } from "@/hooks/useRewardsPipeline";
import GameSceneShell from "@/components/GameSceneShell";
import GameTimer from "@/components/GameTimer";
import StarRating from "@/components/StarRating";
import { Volume2, RotateCcw, Zap, Trophy } from "lucide-react";
import { useAgeAdaptive } from "@/hooks/useAgeAdaptive";

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const SpellingBee = () => {
  const [searchParams] = useSearchParams();
  const stageId = searchParams.get("stage");
  const { t, lang } = useLanguage();
  const adaptive = useAgeAdaptive();
  const rewards = useRewardsPipeline();
  const TOTAL_ROUNDS = adaptive.spellingRounds;
  const TIME_PER_ROUND = Math.round(20 * adaptive.timerMultiplier);

  const [words, setWords] = useState<WordCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledLetters, setShuffledLetters] = useState<{ letter: string; id: number }[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<{ letter: string; id: number }[]>([]);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [timerKey, setTimerKey] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    startBgMusic();
    return () => stopBgMusic();
  }, []);

  useEffect(() => {
    const all = shuffle(getSpellingWords(adaptive.maxWordLength));
    const selected = all.slice(0, TOTAL_ROUNDS);
    selected.sort((a, b) => a.english.length - b.english.length);
    setWords(selected);
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
      setResult("correct");
      setCorrectCount(c => c + 1);
      playCorrectSound();
      rewards.fireEvent({ type: "correct", points: 15 });
    } else {
      setResult("wrong");
      playWrongSound();
      rewards.fireEvent({ type: "wrong" });
    }
    setTimeout(() => advance(), 1500);
  };

  const handleTimeUp = useCallback(() => {
    if (result) return;
    setResult("wrong");
    playWrongSound();
    rewards.fireEvent({ type: "wrong" });
    setTimeout(() => advance(), 1200);
  }, [result, currentIndex, rewards]);

  const advance = () => {
    if (currentIndex + 1 >= words.length) {
      const finalCorrect = correctCount + (result === "correct" ? 1 : 0);
      if (finalCorrect >= TOTAL_ROUNDS * 0.7) playVictoryFanfare();
      stopBgMusic();
      rewards.completeGame({
        gameType: "spelling",
        stageId,
        correct: finalCorrect,
        wrong: TOTAL_ROUNDS - finalCorrect,
        totalRounds: TOTAL_ROUNDS,
      });
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  const restart = () => {
    const all = shuffle(getSpellingWords(adaptive.maxWordLength));
    const selected = all.slice(0, TOTAL_ROUNDS);
    selected.sort((a, b) => a.english.length - b.english.length);
    setWords(selected);
    setCurrentIndex(0); setCorrectCount(0);
    rewards.reset();
  };

  const currentWord = words[currentIndex];
  const progress = words.length > 0 ? (Math.min(currentIndex + 1, words.length) / words.length) * 100 : 0;
  if (!currentWord && !rewards.isComplete) return null;

  return (
    <GameSceneShell
      title={t("spelling.title")}
      emoji="🐝"
      gameType="spelling"
      rewards={rewards}
      onDismissXP={rewards.dismissXP}
      progress={progress}
      currentRound={currentIndex + 1}
      totalRounds={words.length}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 relative z-10">
        {!rewards.isComplete && currentWord ? (
          <>
            <div className="mb-4">
              <GameTimer key={timerKey} seconds={TIME_PER_ROUND} running={timerRunning} onTimeUp={handleTimeUp} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="card-glass rounded-3xl p-6 sm:p-8 text-center mb-6 relative overflow-hidden"
              >
                <div className="absolute -top-16 -end-16 w-32 h-32 rounded-full opacity-15 blur-3xl pointer-events-none"
                  style={{ background: "linear-gradient(135deg, hsl(var(--sunshine)), hsl(var(--primary)))" }} />

                <motion.span className="text-6xl sm:text-7xl mb-4 block relative z-10" key={currentIndex}
                  initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}>
                  {currentWord.emoji}
                </motion.span>
                <p className="font-display text-lg text-muted-foreground mb-2 relative z-10">
                  {getWordTranslation(currentWord, lang)}
                </p>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => speakEnglish(currentWord.english)}
                  className="inline-flex items-center gap-1.5 text-primary font-display text-sm mb-6 px-4 py-2 rounded-full border border-primary/25 transition-all duration-200 relative z-10"
                  style={{ background: "hsl(var(--primary) / 0.08)" }}>
                  <Volume2 className="w-4 h-4" /> {t("spelling.listen")}
                </motion.button>

                {/* Answer slots */}
                <div className="flex justify-center gap-2 mb-6 min-h-[60px] relative z-10">
                  {currentWord.english.split("").map((_, i) => {
                    const placed = selectedLetters[i];
                    return (
                      <motion.div key={i} layout
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className={`w-11 sm:w-12 h-13 sm:h-14 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-display font-bold border-2 transition-all duration-300 cursor-pointer ${
                          result === "correct" ? "border-accent text-accent" :
                          result === "wrong" ? "border-destructive text-destructive" :
                          placed ? "border-primary text-foreground" : "border-muted/40 text-transparent"
                        }`}
                        style={
                          result === "correct" ? { background: "hsl(var(--accent) / 0.12)", boxShadow: "0 0 12px hsl(var(--accent) / 0.15)" } :
                          result === "wrong" ? { background: "hsl(var(--destructive) / 0.1)" } :
                          placed ? { background: "hsl(var(--primary) / 0.08)", boxShadow: "0 2px 8px hsl(var(--primary) / 0.1)" } :
                          { background: "hsl(var(--muted) / 0.15)" }
                        }
                        onClick={() => placed && handleRemoveLetter(placed, i)}>
                        {placed ? (
                          <motion.span initial={{ scale: 0, y: -8 }} animate={{ scale: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 350, damping: 15 }}>{placed.letter}</motion.span>
                        ) : <span className="opacity-30">_</span>}
                      </motion.div>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {result && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`text-lg font-display font-bold mb-4 py-2.5 px-5 rounded-2xl inline-block backdrop-blur-sm relative z-10 ${
                        result === "correct" ? "text-accent border border-accent/25" : "text-destructive border border-destructive/25"
                      }`}
                      style={result === "correct"
                        ? { background: "hsl(var(--accent) / 0.1)", boxShadow: "0 0 20px hsl(var(--accent) / 0.1)" }
                        : { background: "hsl(var(--destructive) / 0.1)" }}>
                      {result === "correct" ? `🎉 ${t("quiz.correct")}` : `😅 ${t("quiz.wrong")} → ${currentWord.english}`}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Letter tiles */}
                <div className="flex justify-center gap-2 flex-wrap relative z-10">
                  {shuffledLetters.map((item, i) => (
                    <motion.button key={item.id} layout
                      initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03, type: "spring", stiffness: 300 }}
                      whileHover={{ scale: 1.12, y: -5, rotate: [-1, 1] }}
                      whileTap={{ scale: 0.88 }}
                      onClick={() => handleLetterClick(item)}
                      disabled={!!result}
                      className="w-11 sm:w-12 h-13 sm:h-14 rounded-xl border-2 border-primary/30 text-xl font-display font-bold text-foreground transition-all duration-200 relative overflow-hidden"
                      style={{ background: "hsl(var(--card))", boxShadow: "var(--shadow-card)" }}>
                      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                        style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.08), transparent 60%)" }} />
                      <span className="relative z-10">{item.letter}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          /* ═══ Results ═══ */
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            className="card-glass rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-15 blur-3xl" style={{ background: "var(--gradient-hero)" }} />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-gradient mb-4">{t("spelling.finished")}</h2>
              <div className="flex justify-center gap-3 mb-5">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
                  className="rounded-2xl px-5 py-2.5 flex items-center gap-2 border border-primary/25" style={{ background: "hsl(var(--primary) / 0.1)" }}>
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-display font-bold text-xl">{rewards.score}</span>
                </motion.div>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}
                  className="rounded-2xl px-5 py-2.5 flex items-center gap-2 border border-accent/25" style={{ background: "hsl(var(--accent) / 0.1)" }}>
                  <Trophy className="w-5 h-5 text-accent" />
                  <span className="font-display font-bold text-xl">{rewards.bestStreak}</span>
                </motion.div>
              </div>
              <div className="flex justify-center mb-6"><StarRating earned={rewards.starsEarned} total={5} size={32} /></div>
              <p className="text-muted-foreground font-body text-sm mb-6">
                {rewards.starsEarned >= 4 ? t("quiz.amazing") : rewards.starsEarned >= 2 ? t("quiz.wellDone") : t("quiz.keepTrying")}
              </p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={restart}
                className="px-6 py-3 rounded-2xl font-display font-bold text-sm inline-flex items-center gap-2 border border-primary/30 text-primary"
                style={{ background: "hsl(var(--primary) / 0.1)" }}>
                <RotateCcw className="w-4 h-4" /> {t("quiz.playAgain")}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </GameSceneShell>
  );
};

export default SpellingBee;
