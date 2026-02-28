import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { getSpellingWords, getWordTranslation, WordCard } from "@/data/learningData";
import { speakEnglish, playClickSound, playCorrectSound, playWrongSound, playVictoryFanfare, startBgMusic, stopBgMusic } from "@/lib/sounds";
import { useRewardsPipeline } from "@/hooks/useRewardsPipeline";
import GameSceneShell from "@/components/GameSceneShell";
import GameTimer from "@/components/GameTimer";
import StarRating from "@/components/StarRating";
import { Volume2, RotateCcw, Shuffle, Zap, Trophy } from "lucide-react";
import { useAgeAdaptive } from "@/hooks/useAgeAdaptive";

const shuffleArray = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const ScrambledTile = ({ letter, index }: { letter: string; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: -20, rotateX: -90 }}
    animate={{ opacity: 1, y: 0, rotateX: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 18, delay: index * 0.05 }}
    whileHover={{ y: -4, scale: 1.08, rotateZ: [-2, 2, 0] }}
    className="w-12 h-14 rounded-xl bg-gradient-to-br from-candy/20 to-candy/10 border-2 border-candy/30 flex items-center justify-center text-2xl font-display font-bold text-foreground shadow-md relative overflow-hidden cursor-default"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
    {letter}
  </motion.div>
);

const WordScramble = () => {
  const [searchParams] = useSearchParams();
  const stageId = searchParams.get("stage");
  const topicIndex = searchParams.get("topic") !== null ? parseInt(searchParams.get("topic")!) : undefined;
  const { t, lang } = useLanguage();
  const adaptive = useAgeAdaptive();
  const rewards = useRewardsPipeline();
  const TOTAL_ROUNDS = adaptive.spellingRounds;
  const TIME_PER_ROUND = adaptive.scrambleTimer;

  const [words, setWords] = useState<WordCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambled, setScrambled] = useState("");
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [hintRevealed, setHintRevealed] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    startBgMusic();
    return () => stopBgMusic();
  }, []);

  useEffect(() => {
    const all = shuffleArray(getSpellingWords(adaptive.maxWordLength, topicIndex));
    const selected = all.slice(0, TOTAL_ROUNDS);
    selected.sort((a, b) => a.english.length - b.english.length);
    setWords(selected);
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
    rewards.fireEvent({ type: "hint" });
  };

  const handleSubmit = () => {
    if (result || !userInput) return;
    setTimerRunning(false);
    const correct = words[currentIndex].english.toUpperCase();
    if (userInput.toUpperCase() === correct) {
      setResult("correct");
      setCorrectCount(c => c + 1);
      playCorrectSound();
      rewards.fireEvent({ type: "correct", points: Math.max(5, 15 - hintRevealed * 3) });
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
        gameType: "scramble",
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
    const all = shuffleArray(getSpellingWords(adaptive.maxWordLength));
    const selected = all.slice(0, TOTAL_ROUNDS);
    selected.sort((a, b) => a.english.length - b.english.length);
    setWords(selected);
    setCurrentIndex(0); setCorrectCount(0);
    rewards.reset();
  };

  const currentWord = words[currentIndex];
  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;
  if (words.length === 0) return null;

  return (
    <GameSceneShell
      title={t("scramble.title")}
      emoji="🔀"
      gameType="scramble"
      rewards={rewards}
      onDismissXP={rewards.dismissXP}
      progress={progress}
      currentRound={currentIndex + 1}
      totalRounds={words.length}
      onHint={() => { revealHint(); return null; }}
    >
      <div className="max-w-2xl mx-auto px-4 py-6 relative z-10">
        {!rewards.isComplete ? (
          <>
            <div className="mb-4">
              <GameTimer key={timerKey} seconds={TIME_PER_ROUND} running={timerRunning} onTimeUp={handleTimeUp} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="card-kid text-center mb-6 relative overflow-hidden"
              >
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: result === "correct"
                    ? "radial-gradient(circle at 50% 30%, hsl(var(--accent) / 0.08), transparent 60%)"
                    : result === "wrong"
                    ? "radial-gradient(circle at 50% 30%, hsl(var(--destructive) / 0.08), transparent 60%)"
                    : "radial-gradient(circle at 50% 30%, hsl(var(--candy) / 0.06), transparent 60%)"
                }} />

                <div className="relative">
                  <motion.span className="text-6xl mb-3 block" whileHover={{ scale: 1.15 }}>{currentWord.emoji}</motion.span>
                  <p className="font-display text-lg text-muted-foreground mb-1">{getWordTranslation(currentWord, lang)}</p>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => speakEnglish(currentWord.english)}
                    className="inline-flex items-center gap-1.5 text-primary font-display text-sm mb-4 bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/15 transition-colors">
                    <Volume2 className="w-4 h-4" /> {t("spelling.listen")}
                  </motion.button>

                  {/* Scrambled letters */}
                  <div className="flex justify-center gap-2 mb-5 flex-wrap" dir="ltr">
                    {scrambled.split("").map((letter, i) => (
                      <ScrambledTile key={`${i}-${letter}-${scrambled}`} letter={letter} index={i} />
                    ))}
                  </div>

                  {/* Input */}
                  <div className="flex justify-center gap-2 mb-4" dir="ltr">
                    <motion.input
                      type="text"
                      value={userInput}
                      onChange={e => setUserInput(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === "Enter" && handleSubmit()}
                      maxLength={currentWord.english.length}
                      className={`text-center text-2xl font-display font-bold tracking-[0.3em] w-full max-w-xs px-4 py-3 rounded-xl border-2 bg-card/90 backdrop-blur-sm focus:outline-none transition-all duration-300 ${
                        result === "correct" ? "border-accent bg-accent/10 shadow-lg shadow-accent/15" :
                        result === "wrong" ? "border-destructive bg-destructive/10 shadow-lg shadow-destructive/15" :
                        "border-primary/30 focus:border-primary focus:shadow-lg focus:shadow-primary/15 hover:border-primary/50"
                      }`}
                      placeholder={currentWord.english.replace(/./g, "_ ").trim()}
                      disabled={!!result}
                      dir="ltr"
                      animate={result === "wrong" ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                      transition={{ duration: 0.4 }}
                    />
                  </div>

                  <AnimatePresence>
                    {result && (
                      <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`text-lg font-display font-bold mb-3 ${result === "correct" ? "text-accent" : "text-destructive"}`}>
                        {result === "correct" ? `${t("quiz.correct")} 🎉` : `${t("quiz.wrong")} → ${currentWord.english}`}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-center gap-3 flex-wrap">
                    <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
                      onClick={reshuffle} disabled={!!result}
                      className="btn-kid gradient-sky text-secondary-foreground flex items-center gap-1 text-sm">
                      <Shuffle className="w-4 h-4" /> {t("scramble.reshuffle")}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
                      onClick={handleSubmit} disabled={!!result || !userInput}
                      className="btn-kid gradient-primary text-primary-foreground text-sm">
                      ✓ {t("scramble.check")}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          /* ═══ Results ═══ */
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            className="card-kid text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none" style={{
              background: "radial-gradient(circle at 50% 20%, hsl(var(--sunshine) / 0.1), transparent 60%)"
            }} />
            <div className="relative">
              <h2 className="text-3xl font-display font-bold text-gradient mb-2">{t("spelling.finished")}</h2>
              <div className="flex justify-center gap-4 mb-4">
                <motion.div whileHover={{ scale: 1.08, y: -2 }} className="bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl px-4 py-2 flex items-center gap-2 border border-primary/10 shadow-sm">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-display font-bold text-lg">{rewards.score}</span>
                </motion.div>
                <motion.div whileHover={{ scale: 1.08, y: -2 }} className="bg-gradient-to-br from-accent/15 to-accent/5 rounded-2xl px-4 py-2 flex items-center gap-2 border border-accent/10 shadow-sm">
                  <Trophy className="w-5 h-5 text-accent" />
                  <span className="font-display font-bold text-lg">{rewards.bestStreak}</span>
                </motion.div>
              </div>
              <div className="my-4"><StarRating earned={rewards.starsEarned} total={5} size={32} /></div>
              <p className="font-display text-lg font-semibold text-primary mb-4">
                {rewards.starsEarned >= 4 ? t("quiz.amazing") : rewards.starsEarned >= 2 ? t("quiz.wellDone") : t("quiz.keepTrying")}
              </p>
              <motion.button whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.96 }}
                onClick={restart} className="btn-kid gradient-primary text-primary-foreground flex items-center gap-2 mx-auto">
                <RotateCcw className="w-5 h-5" /> {t("quiz.playAgain")}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </GameSceneShell>
  );
};

export default WordScramble;
