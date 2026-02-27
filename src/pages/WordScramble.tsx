import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { getSpellingWords, getWordTranslation, WordCard } from "@/data/learningData";
import { speakEnglish, playCorrectSound, playWrongSound, playComboSound, playVictoryFanfare, playClickSound } from "@/lib/sounds";
import { saveStageProgress } from "@/lib/levels";
import { saveBestStreak } from "@/lib/achievements";
import { trackGamePlayed } from "@/lib/statsTracker";
import { updateDailyProgress } from "@/lib/xp";
import StarRating from "@/components/StarRating";
import Confetti from "@/components/Confetti";
import GameTimer from "@/components/GameTimer";
import StreakCounter from "@/components/StreakCounter";
import ScorePopup, { useScorePopups } from "@/components/ScorePopup";
import XPReward from "@/components/XPReward";
import Interactive3DMascot from "@/components/Interactive3DMascot";
import FloatingParticles from "@/components/FloatingParticles";
import { Volume2, RotateCcw, Shuffle, Zap, Trophy } from "lucide-react";
import BackToLevels from "@/components/BackToLevels";
import ClassroomBackground from "@/components/ClassroomBackground";
import GameEntrance from "@/components/GameEntrance";
import { useAgeAdaptive } from "@/hooks/useAgeAdaptive";
import UserAvatar, { CompanionAvatars } from "@/components/UserAvatar";
import { useOwlEncouragement } from "@/hooks/useOwlEncouragement";
const shuffleArray = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

/* ─── Draggable scrambled letter tile ─── */
const ScrambledTile = ({ letter, index, total }: { letter: string; index: number; total: number }) => (
  <motion.div
    initial={{ opacity: 0, y: -20, rotateX: -90 }}
    animate={{ opacity: 1, y: 0, rotateX: 0 }}
    transition={{
      type: "spring",
      stiffness: 300,
      damping: 18,
      delay: index * 0.05,
    }}
    whileHover={{ y: -4, scale: 1.08, rotateZ: [-2, 2, 0] }}
    className="w-12 h-14 rounded-xl bg-gradient-to-br from-candy/20 to-candy/10 border-2 border-candy/30 flex items-center justify-center text-2xl font-display font-bold text-foreground shadow-md relative overflow-hidden cursor-default"
    style={{ perspective: "400px" }}
  >
    {/* Shine effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
    {letter}
  </motion.div>
);

const WordScramble = () => {
  const [searchParams] = useSearchParams();
  const stageId = searchParams.get("stage");
  const { t, lang, dir } = useLanguage();
  const adaptive = useAgeAdaptive();
  const TOTAL_ROUNDS = adaptive.spellingRounds;
  const TIME_PER_ROUND = adaptive.scrambleTimer;

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
  const [owlMood, setOwlMood] = useState<"idle" | "surprised" | "sad" | "celebrate">("idle");
  const { popups, addPopup } = useScorePopups();
  const { speech, triggerByMood } = useOwlEncouragement();

  useEffect(() => {
    const all = shuffleArray(getSpellingWords(adaptive.maxWordLength));
    const selected = all.slice(0, TOTAL_ROUNDS);
    // Sort by word length: easy (short) first, harder (longer) later
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
    setOwlMood("idle");
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
      setOwlMood("surprised");
      triggerByMood("surprised", newStreak);
      setBestStreak(b => { const best = Math.max(b, newStreak); saveBestStreak(best); return best; });
      if (newStreak >= 3) playComboSound(newStreak); else playCorrectSound();
      addPopup(points, newStreak >= 3 ? `×${newStreak}` : "✓");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
    } else {
      setResult("wrong");
      setStreak(0);
      setOwlMood("sad");
      triggerByMood("sad");
      playWrongSound();
    }
    setTimeout(() => { setOwlMood("idle"); advance(); }, 1500);
  };

  const handleTimeUp = useCallback(() => {
    if (result) return;
    setResult("wrong");
    setStreak(0);
      setOwlMood("sad");
      triggerByMood("sad");
    playWrongSound();
    setTimeout(() => { setOwlMood("idle"); advance(); }, 1200);
  }, [result, currentIndex]);

  const advance = () => {
    if (currentIndex + 1 >= words.length) {
      setFinished(true);
      setOwlMood("celebrate");
      triggerByMood("celebrate");
      playVictoryFanfare();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
      if (stageId) saveStageProgress(stageId, Math.min(Math.ceil((score / (TOTAL_ROUNDS * 20)) * 5), 5));
      setXpAmount(Math.max(10, score));
      setShowXP(true);
      const correctCount = Math.round(score / 15);
      trackGamePlayed("scramble", correctCount, TOTAL_ROUNDS - correctCount, Math.max(10, score));
      updateDailyProgress("scramble");
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  const restart = () => {
    const all = shuffleArray(getSpellingWords(adaptive.maxWordLength));
    const selected = all.slice(0, TOTAL_ROUNDS);
    selected.sort((a, b) => a.english.length - b.english.length);
    setWords(selected);
    setCurrentIndex(0); setScore(0); setStreak(0); setBestStreak(0);
    setFinished(false); setOwlMood("idle");
  };

  const currentWord = words[currentIndex];
  const stars = Math.ceil((score / (TOTAL_ROUNDS * 20)) * 5);

  if (words.length === 0) return null;

  return (
    <div className="min-h-screen relative" dir={dir} style={{ direction: dir === "rtl" ? "rtl" : "ltr" }}>
      <GameEntrance title={t("quick.scramble")} emoji="🔀" />
      <ClassroomBackground />
      <FloatingParticles count={6} />
      <Confetti show={showConfetti} />
      <ScorePopup popups={popups} />
      <XPReward amount={xpAmount} show={showXP} gameType="scramble" onComplete={() => setShowXP(false)} />

      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        <BackToLevels />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Interactive3DMascot mood={owlMood} size="sm" showSpeechBubble={speech || undefined} />
            <UserAvatar size="md" showOwl />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">{t("scramble.title")}</h1>
          <p className="text-muted-foreground font-body">{t("scramble.subtitle")}</p>
          <CompanionAvatars size="xs" className="justify-center mt-2" mood={owlMood} />
        </motion.div>

        {!finished ? (
          <>
            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-glass mb-4 flex items-center justify-between flex-wrap gap-2"
            >
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
            </motion.div>

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
                {/* Ambient gradient */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  background: result === "correct"
                    ? "radial-gradient(circle at 50% 30%, hsl(var(--accent) / 0.08), transparent 60%)"
                    : result === "wrong"
                    ? "radial-gradient(circle at 50% 30%, hsl(var(--destructive) / 0.08), transparent 60%)"
                    : "radial-gradient(circle at 50% 30%, hsl(var(--candy) / 0.06), transparent 60%)"
                }} />
                {/* Shimmer sweep */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 4, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
                />

                <div className="relative">
                  <motion.span className="text-6xl mb-3 block" whileHover={{ scale: 1.15 }}>{currentWord.emoji}</motion.span>
                  <p className="font-display text-lg text-muted-foreground mb-1">{getWordTranslation(currentWord, lang)}</p>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => speakEnglish(currentWord.english)}
                    className="inline-flex items-center gap-1.5 text-primary font-display text-sm mb-4 bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/15 transition-colors">
                    <Volume2 className="w-4 h-4" /> {t("spelling.listen")}
                  </motion.button>

                  {/* Scrambled letters - premium tiles */}
                  <div className="flex justify-center gap-2 mb-5 flex-wrap" dir="ltr">
                    {scrambled.split("").map((letter, i) => (
                      <ScrambledTile key={`${i}-${letter}-${scrambled}`} letter={letter} index={i} total={scrambled.length} />
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
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`text-lg font-display font-bold mb-3 ${result === "correct" ? "text-accent" : "text-destructive"}`}
                      >
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
                      onClick={revealHint} disabled={!!result || hintRevealed >= currentWord.english.length - 1}
                      className="btn-kid bg-muted text-foreground text-sm">
                      💡 {t("scramble.hint")}
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
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            className="card-kid text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none" style={{
              background: "radial-gradient(circle at 50% 20%, hsl(var(--sunshine) / 0.1), transparent 60%)"
            }} />
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-sunshine/8 to-transparent pointer-events-none"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
            />
            <div className="relative">
              <Interactive3DMascot mood="celebrate" size="md" />
              <h2 className="text-3xl font-display font-bold text-gradient mb-2">{t("spelling.finished")}</h2>
              <div className="flex justify-center gap-4 mb-4">
                <motion.div whileHover={{ scale: 1.08, y: -2 }} className="bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl px-4 py-2 flex items-center gap-2 border border-primary/10 shadow-sm">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-display font-bold text-lg">{score}</span>
                </motion.div>
                <motion.div whileHover={{ scale: 1.08, y: -2 }} className="bg-gradient-to-br from-accent/15 to-accent/5 rounded-2xl px-4 py-2 flex items-center gap-2 border border-accent/10 shadow-sm">
                  <Trophy className="w-5 h-5 text-accent" />
                  <span className="font-display font-bold text-lg">{bestStreak}</span>
                </motion.div>
              </div>
              <div className="my-4"><StarRating earned={stars} total={5} size={32} /></div>
              <p className="font-display text-lg font-semibold text-primary mb-4">
                {stars >= 4 ? t("quiz.amazing") : stars >= 2 ? t("quiz.wellDone") : t("quiz.keepTrying")}
              </p>
              <motion.button whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.96 }}
                onClick={restart} className="btn-kid gradient-primary text-primary-foreground flex items-center gap-2 mx-auto">
                <RotateCcw className="w-5 h-5" /> {t("quiz.playAgain")}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WordScramble;
