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
import Interactive3DMascot from "@/components/Interactive3DMascot";
import FloatingParticles from "@/components/FloatingParticles";
import { Volume2, RotateCcw, Zap, Trophy, Heart } from "lucide-react";
import BackToLevels from "@/components/BackToLevels";
import CinematicBackground from "@/components/CinematicBackground";
import GameEntrance from "@/components/GameEntrance";
import { useAgeAdaptive } from "@/hooks/useAgeAdaptive";
const DEFAULT_MAX_WRONG = 6;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const shuffleArray = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

/* Hangman figure stages */
const HangmanFigure = ({ wrongCount, maxWrong = DEFAULT_MAX_WRONG }: { wrongCount: number; maxWrong?: number }) => {
  const parts = [
    // Head
    <motion.circle key="head" cx="50" cy="25" r="10" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2.5"
      initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.4 }} />,
    // Body
    <motion.line key="body" x1="50" y1="35" x2="50" y2="60" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }} />,
    // Left arm
    <motion.line key="larm" x1="50" y1="42" x2="35" y2="52" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }} />,
    // Right arm
    <motion.line key="rarm" x1="50" y1="42" x2="65" y2="52" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }} />,
    // Left leg
    <motion.line key="lleg" x1="50" y1="60" x2="38" y2="75" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }} />,
    // Right leg
    <motion.line key="rleg" x1="50" y1="60" x2="62" y2="75" stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }} />,
  ];

  return (
    <svg viewBox="0 0 100 85" className="w-28 h-28 sm:w-32 sm:h-32 mx-auto">
      {/* Gallows */}
      <line x1="15" y1="82" x2="85" y2="82" stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="2" />
      <line x1="30" y1="82" x2="30" y2="5" stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="2" />
      <line x1="30" y1="5" x2="50" y2="5" stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="2" />
      <line x1="50" y1="5" x2="50" y2="15" stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="2" />
      {/* Body parts */}
      <AnimatePresence>
        {parts.slice(0, wrongCount)}
      </AnimatePresence>
      {/* Face expressions */}
      {wrongCount > 0 && wrongCount < maxWrong && (
        <>
          <circle cx="46" cy="23" r="1.5" fill="hsl(var(--foreground))" />
          <circle cx="54" cy="23" r="1.5" fill="hsl(var(--foreground))" />
          {wrongCount >= 4 ? (
            <path d="M 45 30 Q 50 27 55 30" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
          ) : (
            <line x1="46" y1="29" x2="54" y2="29" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
          )}
        </>
      )}
      {wrongCount >= maxWrong && (
        <>
          <motion.text x="43" y="27" fontSize="8" fill="hsl(var(--destructive))"
            initial={{ scale: 0 }} animate={{ scale: 1 }}>✕</motion.text>
          <motion.text x="51" y="27" fontSize="8" fill="hsl(var(--destructive))"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}>✕</motion.text>
        </>
      )}
    </svg>
  );
};

const HangmanGame = () => {
  const [searchParams] = useSearchParams();
  const stageId = searchParams.get("stage");
  const { t, lang, dir } = useLanguage();
  const adaptive = useAgeAdaptive();
  const TOTAL_ROUNDS = 8;
  const MAX_WRONG = adaptive.hangmanLives;

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
  const [owlMood, setOwlMood] = useState<"idle" | "surprised" | "sad" | "celebrate">("idle");
  const { popups, addPopup } = useScorePopups();

  useEffect(() => {
    const maxLen = adaptive.maxWordLength;
    const all = shuffleArray(getSpellingWords(maxLen));
    setWords(all.slice(0, TOTAL_ROUNDS));
  }, []);

  useEffect(() => {
    if (words.length > 0 && currentIndex < words.length) {
      setGuessedLetters(new Set());
      setWrongCount(0);
      setResult(null);
      setOwlMood("idle");
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
        setOwlMood("surprised");
        setBestStreak(b => { const best = Math.max(b, newStreak); saveBestStreak(best); return best; });
        if (newStreak >= 3) playComboSound(newStreak); else playCorrectSound();
        addPopup(points, newStreak >= 3 ? `×${newStreak}` : "✓");
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 100);
        setTimeout(() => { setOwlMood("idle"); advance(); }, 1800);
      }
    } else {
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      setOwlMood("sad");
      playWrongSound();
      if (newWrong >= MAX_WRONG) {
        setResult("lost");
        setStreak(0);
        setTimeout(() => { setOwlMood("idle"); advance(); }, 2000);
      } else {
        setTimeout(() => setOwlMood("idle"), 1000);
      }
    }
  };

  const advance = () => {
    if (currentIndex + 1 >= words.length) {
      setFinished(true);
      setOwlMood("celebrate");
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
    const maxLen = adaptive.maxWordLength;
    const all = shuffleArray(getSpellingWords(maxLen));
    setWords(all.slice(0, TOTAL_ROUNDS));
    setCurrentIndex(0); setScore(0); setStreak(0); setBestStreak(0);
    setFinished(false); setOwlMood("idle");
  };

  const stars = Math.ceil((score / (TOTAL_ROUNDS * 30)) * 5);
  if (words.length === 0) return null;

  return (
    <div className="min-h-screen relative" dir={dir}>
      <GameEntrance title={t("quick.hangman")} emoji="🎭" />
      <CinematicBackground intensity={0.5} />
      <FloatingParticles count={6} />
      <Confetti show={showConfetti} />
      <ScorePopup popups={popups} />
      <XPReward amount={xpAmount} show={showXP} gameType="hangman" onComplete={() => setShowXP(false)} />

      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        <BackToLevels />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <Interactive3DMascot mood={owlMood} size="sm" />
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">{t("hangman.title")}</h1>
          <p className="text-muted-foreground font-body">{t("hangman.subtitle")}</p>
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
                  background: result === "won"
                    ? "radial-gradient(circle at 50% 30%, hsl(var(--accent) / 0.06), transparent 60%)"
                    : result === "lost"
                    ? "radial-gradient(circle at 50% 30%, hsl(var(--destructive) / 0.06), transparent 60%)"
                    : "radial-gradient(circle at 50% 30%, hsl(var(--primary) / 0.03), transparent 60%)"
                }} />

                {/* Hangman figure + lives */}
                <div className="flex items-center justify-center gap-6 mb-4 relative">
                  <HangmanFigure wrongCount={wrongCount} maxWrong={MAX_WRONG} />
                  <div className="flex flex-col gap-1">
                    {Array.from({ length: MAX_WRONG }).map((_, i) => (
                      <motion.div key={i}
                        animate={i === wrongCount - 1 ? { scale: [1, 1.4, 1], opacity: [1, 0.5, 0.3] } : {}}
                        transition={{ duration: 0.4 }}
                      >
                        <Heart
                          className={`w-5 h-5 transition-all duration-300 ${
                            i < wrongCount
                              ? "text-destructive/25 fill-destructive/25"
                              : "text-destructive fill-destructive"
                          }`}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Hint */}
                <div className="flex items-center justify-center gap-3 mb-5 relative">
                  <motion.span className="text-5xl" whileHover={{ scale: 1.15 }}>{currentWord.emoji}</motion.span>
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
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className={`w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-display font-bold border-b-4 shadow-sm transition-colors duration-300 ${
                          result === "won" ? "border-accent bg-accent/10 text-accent" :
                          result === "lost" && !guessedLetters.has(letter) ? "border-destructive bg-destructive/10 text-destructive" :
                          revealed ? "border-primary bg-primary/10 text-foreground" :
                          "border-muted/60 bg-muted/20"
                        }`}
                      >
                        {revealed ? (
                          <motion.span
                            initial={{ opacity: 0, y: -12, scale: 0.5 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
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
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`text-lg font-display font-bold mb-4 ${result === "won" ? "text-accent" : "text-destructive"}`}
                    >
                      {result === "won" ? `${t("quiz.correct")} 🎉` : `${t("hangman.lost")} → ${currentWord.english}`}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Keyboard */}
                <div className="flex flex-wrap justify-center gap-1.5 max-w-md mx-auto relative" dir="ltr">
                  {ALPHABET.map((letter) => {
                    const guessed = guessedLetters.has(letter);
                    const isCorrectGuess = guessed && wordLetters.includes(letter);
                    const isWrongGuess = guessed && !wordLetters.includes(letter);
                    return (
                      <motion.button
                        key={letter}
                        whileHover={!guessed && !result ? { scale: 1.18, y: -3 } : {}}
                        whileTap={!guessed && !result ? { scale: 0.85 } : {}}
                        onClick={() => handleGuess(letter)}
                        disabled={guessed || !!result}
                        className={`w-9 h-10 rounded-lg font-display font-bold text-sm shadow-sm transition-all duration-200 ${
                          isCorrectGuess ? "bg-accent text-accent-foreground shadow-md" :
                          isWrongGuess ? "bg-destructive/15 text-destructive/50 line-through" :
                          "bg-muted hover:bg-primary/15 hover:shadow-md text-foreground"
                        } ${guessed || result ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
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
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            className="card-kid text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none" style={{
              background: "radial-gradient(circle at 50% 20%, hsl(var(--sunshine) / 0.08), transparent 60%)"
            }} />
            <div className="relative">
              <Interactive3DMascot mood="celebrate" size="md" />
              <h2 className="text-3xl font-display font-bold text-gradient mb-2">{t("spelling.finished")}</h2>
              <div className="flex justify-center gap-4 mb-4">
                <motion.div whileHover={{ scale: 1.05 }} className="bg-primary/10 rounded-2xl px-4 py-2 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-display font-bold text-lg">{score}</span>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="bg-accent/10 rounded-2xl px-4 py-2 flex items-center gap-2">
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

export default HangmanGame;
