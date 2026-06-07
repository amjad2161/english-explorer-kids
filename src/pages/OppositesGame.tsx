import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useLanguage } from "@/lib/i18n";
import {
  playClickSound,
  playCorrectSound,
  playWrongSound,
  playVictoryFanfare,
  speakEnglish,
  startBgMusic,
  stopBgMusic,
} from "@/lib/sounds";
import { useRewardsPipeline } from "@/hooks/useRewardsPipeline";
import GameSceneShell from "@/components/GameSceneShell";
import Confetti from "@/components/Confetti";
import StarRating from "@/components/StarRating";
import BackToLevels from "@/components/BackToLevels";
import ClassroomBackground from "@/components/ClassroomBackground";
import FloatingParticles from "@/components/FloatingParticles";
import Interactive3DMascot from "@/components/Interactive3DMascot";
import { Timer, RotateCcw, Sparkles, Zap, ArrowRight, CheckCircle, XCircle, Volume2 } from "lucide-react";

/* ─── Opposites data ─── */
interface OppositePair {
  word: string;
  opposite: string;
  emoji1: string;
  emoji2: string;
  hebrew: [string, string];
  arabic: [string, string];
}

const OPPOSITES: OppositePair[] = [
  { word: "Big", opposite: "Small", emoji1: "🐘", emoji2: "🐜", hebrew: ["גדול", "קטן"], arabic: ["كبير", "صغير"] },
  { word: "Hot", opposite: "Cold", emoji1: "🔥", emoji2: "❄️", hebrew: ["חם", "קר"], arabic: ["حار", "بارد"] },
  { word: "Fast", opposite: "Slow", emoji1: "🐆", emoji2: "🐢", hebrew: ["מהיר", "איטי"], arabic: ["سريع", "بطيء"] },
  { word: "Happy", opposite: "Sad", emoji1: "😊", emoji2: "😢", hebrew: ["שמח", "עצוב"], arabic: ["سعيد", "حزين"] },
  { word: "Light", opposite: "Dark", emoji1: "☀️", emoji2: "🌑", hebrew: ["בהיר", "כהה"], arabic: ["فاتح", "غامق"] },
  { word: "Up", opposite: "Down", emoji1: "⬆️", emoji2: "⬇️", hebrew: ["למעלה", "למטה"], arabic: ["فوق", "تحت"] },
  { word: "Open", opposite: "Close", emoji1: "📖", emoji2: "📕", hebrew: ["פתוח", "סגור"], arabic: ["مفتوح", "مغلق"] },
  { word: "Old", opposite: "Young", emoji1: "👴", emoji2: "👶", hebrew: ["זקן", "צעיר"], arabic: ["كبير", "صغير"] },
  { word: "Long", opposite: "Short", emoji1: "🐍", emoji2: "🐛", hebrew: ["ארוך", "קצר"], arabic: ["طويل", "قصير"] },
  { word: "Full", opposite: "Empty", emoji1: "🥛", emoji2: "🫙", hebrew: ["מלא", "ריק"], arabic: ["ممتلئ", "فارغ"] },
  { word: "Loud", opposite: "Quiet", emoji1: "📢", emoji2: "🤫", hebrew: ["רועש", "שקט"], arabic: ["صاخب", "هادئ"] },
  { word: "Hard", opposite: "Soft", emoji1: "🪨", emoji2: "☁️", hebrew: ["קשה", "רך"], arabic: ["صلب", "ناعم"] },
  { word: "Rich", opposite: "Poor", emoji1: "💰", emoji2: "🪹", hebrew: ["עשיר", "עני"], arabic: ["غني", "فقير"] },
  { word: "Clean", opposite: "Dirty", emoji1: "✨", emoji2: "🫥", hebrew: ["נקי", "מלוכלך"], arabic: ["نظيف", "متسخ"] },
  { word: "Strong", opposite: "Weak", emoji1: "💪", emoji2: "🪶", hebrew: ["חזק", "חלש"], arabic: ["قوي", "ضعيف"] },
  { word: "Tall", opposite: "Short", emoji1: "🦒", emoji2: "🐁", hebrew: ["גבוה", "נמוך"], arabic: ["طويل", "قصير"] },
  { word: "New", opposite: "Old", emoji1: "🆕", emoji2: "📜", hebrew: ["חדש", "ישן"], arabic: ["جديد", "قديم"] },
  { word: "Wet", opposite: "Dry", emoji1: "💧", emoji2: "🏜️", hebrew: ["רטוב", "יבש"], arabic: ["مبلل", "جاف"] },
  { word: "Wide", opposite: "Narrow", emoji1: "🛣️", emoji2: "🚶", hebrew: ["רחב", "צר"], arabic: ["واسع", "ضيق"] },
  { word: "Day", opposite: "Night", emoji1: "🌞", emoji2: "🌙", hebrew: ["יום", "לילה"], arabic: ["نهار", "ليل"] },
  { word: "Win", opposite: "Lose", emoji1: "🏆", emoji2: "😞", hebrew: ["לנצח", "להפסיד"], arabic: ["يفوز", "يخسر"] },
  { word: "Start", opposite: "Stop", emoji1: "▶️", emoji2: "⏹️", hebrew: ["להתחיל", "לעצור"], arabic: ["يبدأ", "يتوقف"] },
  { word: "Buy", opposite: "Sell", emoji1: "🛒", emoji2: "🏪", hebrew: ["לקנות", "למכור"], arabic: ["يشتري", "يبيع"] },
  { word: "Push", opposite: "Pull", emoji1: "👐", emoji2: "🤏", hebrew: ["לדחוף", "למשוך"], arabic: ["يدفع", "يسحب"] },
  { word: "Give", opposite: "Take", emoji1: "🎁", emoji2: "🤲", hebrew: ["לתת", "לקחת"], arabic: ["يعطي", "يأخذ"] },
  { word: "Love", opposite: "Hate", emoji1: "❤️", emoji2: "💔", hebrew: ["אהבה", "שנאה"], arabic: ["حب", "كره"] },
  { word: "Easy", opposite: "Hard", emoji1: "🟢", emoji2: "🔴", hebrew: ["קל", "קשה"], arabic: ["سهل", "صعب"] },
  { word: "Beautiful", opposite: "Ugly", emoji1: "🌸", emoji2: "🗑️", hebrew: ["יפה", "מכוער"], arabic: ["جميل", "قبيح"] },
  { word: "Inside", opposite: "Outside", emoji1: "🏠", emoji2: "🌳", hebrew: ["בפנים", "בחוץ"], arabic: ["داخل", "خارج"] },
  { word: "Asleep", opposite: "Awake", emoji1: "😴", emoji2: "👀", hebrew: ["ישן", "ער"], arabic: ["نائم", "مستيقظ"] },
];

type Difficulty = "easy" | "medium" | "hard";
const ROUND_COUNTS: Record<Difficulty, number> = { easy: 6, medium: 10, hard: 15 };
const TIME_LIMITS: Record<Difficulty, number> = { easy: 60, medium: 45, hard: 35 };

const OppositesGame = () => {
  const { lang, dir } = useLanguage();
  const t = (texts: Record<string, string>) => texts[lang] || texts.en;
  const rewards = useRewardsPipeline();

  /* state */
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [rounds, setRounds] = useState<OppositePair[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  // Ref tracks the authoritative score to avoid stale-closure in endGame.
  const scoreRef = useRef(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const current = rounds[currentIdx];

  /* start game */
  const startGame = useCallback((diff: Difficulty) => {
    playClickSound();
    setDifficulty(diff);
    const shuffled = [...OPPOSITES].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, ROUND_COUNTS[diff]);
    setRounds(picked);
    setCurrentIdx(0);
    scoreRef.current = 0;
    setScore(0);
    setCombo(0);
    setGameOver(false);
    setSelected(null);
    setIsCorrect(null);
    setTimeLeft(TIME_LIMITS[diff]);
    rewards.reset();
    generateOptions(picked[0], picked);
  }, [rewards]);

  /* generate 4 options for current round */
  const generateOptions = useCallback((pair: OppositePair, allRounds: OppositePair[]) => {
    const correct = pair.opposite;
    const distractors = OPPOSITES
      .filter((p) => p.opposite !== correct && p.word !== pair.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((p) => Math.random() > 0.5 ? p.opposite : p.word);
    const opts = [correct, ...distractors].sort(() => Math.random() - 0.5);
    setOptions(opts);
  }, []);

  /* timer */
  useEffect(() => {
    if (!difficulty || gameOver) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [difficulty, gameOver]);

  /* speak current word */
  useEffect(() => {
    if (current && !gameOver && selected === null) {
      speakEnglish(current.word);
    }
  }, [currentIdx, gameOver]);

  // `lastRoundWon` is passed explicitly so we don't depend on the stale
  // `score` or `isCorrect` closure values inside the setTimeout callback.
  const endGame = useCallback((lastRoundWon = false) => {
    setGameOver(true);
    if (timerRef.current) clearInterval(timerRef.current);
    const finalCorrect = scoreRef.current + (lastRoundWon ? 1 : 0);
    rewards.completeGame({
      gameType: "opposites",
      correct: finalCorrect,
      wrong: rounds.length - finalCorrect,
      totalRounds: rounds.length,
    });
    const stars = finalCorrect >= rounds.length * 0.9 ? 3 : finalCorrect >= rounds.length * 0.6 ? 2 : finalCorrect > 0 ? 1 : 0;
    if (stars >= 2) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
    }
  }, [rounds.length, rewards]);

  const handleSelect = useCallback((option: string) => {
    if (selected !== null || !current) return;
    playClickSound();
    setSelected(option);

    const correct = option === current.opposite;
    setIsCorrect(correct);

    if (correct) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setCombo((c) => c + 1);
      rewards.fireEvent({ type: "correct" });
    } else {
      setCombo(0);
      rewards.fireEvent({ type: "wrong" });
    }

    // Pass `correct` explicitly so endGame() sees the right value without
    // relying on the stale `score` or `isCorrect` closure.
    setTimeout(() => {
      const nextIdx = currentIdx + 1;
      if (nextIdx >= rounds.length) {
        endGame(correct);
      } else {
        setCurrentIdx(nextIdx);
        setSelected(null);
        setIsCorrect(null);
        generateOptions(rounds[nextIdx], rounds);
      }
    }, 1200);
  }, [selected, current, currentIdx, rounds, rewards, endGame, generateOptions]);

  const getTranslation = (pair: OppositePair, isOpposite: boolean) => {
    const idx = isOpposite ? 1 : 0;
    return lang === "he" ? pair.hebrew[idx] : lang === "ar" ? pair.arabic[idx] : "";
  };

  /* ─── Difficulty select ─── */
  if (!difficulty) {
    return (
      <div className="min-h-screen relative" dir={dir}>
        <ClassroomBackground />
        <FloatingParticles count={6} />
        <div className="max-w-md mx-auto px-4 py-8 relative z-10">
          <BackToLevels />
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Interactive3DMascot mood="idle" size="sm" />
            <span className="text-5xl mb-3 block">🔄</span>
            <h1 className="text-3xl font-display font-bold text-gradient mb-2">
              {t({ he: "מה ההפך?", ar: "ما العكس؟", en: "What's the Opposite?" })}
            </h1>
            <p className="text-muted-foreground font-body text-sm">
              {t({ he: "התאם כל מילה להפך שלה!", ar: "طابق كل كلمة مع عكسها!", en: "Match each word to its opposite!" })}
            </p>
          </motion.div>

          <div className="space-y-3">
            {(["easy", "medium", "hard"] as Difficulty[]).map((diff, i) => {
              const labels: Record<Difficulty, Record<string, string>> = {
                easy: { he: "🟢 קל", ar: "🟢 سهل", en: "🟢 Easy" },
                medium: { he: "🟡 בינוני", ar: "🟡 متوسط", en: "🟡 Medium" },
                hard: { he: "🔴 קשה", ar: "🔴 صعب", en: "🔴 Hard" },
              };
              const descs: Record<Difficulty, Record<string, string>> = {
                easy: { he: `${ROUND_COUNTS.easy} שאלות · ${TIME_LIMITS.easy} שניות`, ar: `${ROUND_COUNTS.easy} أسئلة · ${TIME_LIMITS.easy} ثانية`, en: `${ROUND_COUNTS.easy} questions · ${TIME_LIMITS.easy}s` },
                medium: { he: `${ROUND_COUNTS.medium} שאלות · ${TIME_LIMITS.medium} שניות`, ar: `${ROUND_COUNTS.medium} أسئلة · ${TIME_LIMITS.medium} ثانية`, en: `${ROUND_COUNTS.medium} questions · ${TIME_LIMITS.medium}s` },
                hard: { he: `${ROUND_COUNTS.hard} שאלות · ${TIME_LIMITS.hard} שניות`, ar: `${ROUND_COUNTS.hard} أسئلة · ${TIME_LIMITS.hard} ثانية`, en: `${ROUND_COUNTS.hard} questions · ${TIME_LIMITS.hard}s` },
              };
              return (
                <motion.button
                  key={diff}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => startGame(diff)}
                  className="card-kid w-full text-start flex items-center gap-4 p-4"
                >
                  <span className="text-3xl">{diff === "easy" ? "🌱" : diff === "medium" ? "🌿" : "🌲"}</span>
                  <div>
                    <p className="font-display font-bold">{t(labels[diff])}</p>
                    <p className="text-xs text-muted-foreground">{t(descs[diff])}</p>
                  </div>
                  <ArrowRight className={`w-5 h-5 text-muted-foreground ms-auto ${dir === "rtl" ? "rotate-180" : ""}`} />
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ─── Game Over ─── */
  if (gameOver) {
    const stars = score >= rounds.length * 0.9 ? 3 : score >= rounds.length * 0.6 ? 2 : score > 0 ? 1 : 0;
    const pct = Math.round((score / rounds.length) * 100);
    return (
      <div className="min-h-screen relative" dir={dir}>
        <ClassroomBackground />
        <Confetti show={showConfetti} />
        <div className="max-w-md mx-auto px-4 py-12 relative z-10 text-center">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}>
            <Interactive3DMascot mood={stars >= 2 ? "celebrate" : "think"} size="sm" />
            <span className="text-6xl mb-4 block">{stars >= 2 ? "🎉" : "💪"}</span>
            <h2 className="text-3xl font-display font-bold text-gradient mb-2">
              {stars >= 2
                ? t({ he: "מדהים!", ar: "رائع!", en: "Amazing!" })
                : t({ he: "כל הכבוד!", ar: "أحسنت!", en: "Good job!" })}
            </h2>
            <StarRating earned={stars} total={3} size={32} />
            <div className="grid grid-cols-2 gap-3 mt-6 mb-6">
              <div className="card-kid p-3 text-center">
                <p className="font-display font-bold text-2xl text-primary">{score}/{rounds.length}</p>
                <p className="text-xs text-muted-foreground">{t({ he: "תשובות נכונות", ar: "إجابات صحيحة", en: "Correct" })}</p>
              </div>
              <div className="card-kid p-3 text-center">
                <p className="font-display font-bold text-2xl text-accent">{pct}%</p>
                <p className="text-xs text-muted-foreground">{t({ he: "דיוק", ar: "دقة", en: "Accuracy" })}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => startGame(difficulty)}
                className="btn-kid gradient-primary text-primary-foreground flex-1 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />{t({ he: "שחק שוב", ar: "العب مرة أخرى", en: "Play Again" })}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setDifficulty(null)}
                className="btn-kid bg-card border border-border text-foreground flex-1"
              >
                {t({ he: "שנה רמה", ar: "غيّر المستوى", en: "Change Level" })}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ─── Active Game ─── */
  const progress = ((currentIdx) / rounds.length) * 100;
  const timerPct = (timeLeft / TIME_LIMITS[difficulty]) * 100;
  const isUrgent = timeLeft <= 10;

  return (
    <GameSceneShell title={t({ he: "מה ההפך?", ar: "ما العكس؟", en: "What's the Opposite?" })} emoji="🔄" gameType="opposites" progress={progress} totalRounds={rounds.length} currentRound={currentIdx + 1} rewards={rewards}>
      <div className="min-h-screen relative" dir={dir}>
        <ClassroomBackground />
        <div className="max-w-lg mx-auto px-4 py-6 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔄</span>
              <span className="font-display font-bold text-sm">
                {currentIdx + 1}/{rounds.length}
              </span>
            </div>
            <motion.div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-display font-bold text-sm ${
                isUrgent ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-primary"
              }`}
              animate={isUrgent ? { scale: [1, 1.08, 1] } : {}}
              transition={isUrgent ? { duration: 0.5, repeat: Infinity } : {}}
            >
              <Timer className="w-4 h-4" />
              {timeLeft}s
            </motion.div>
            {combo >= 2 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 bg-accent/15 text-accent px-2 py-1 rounded-full"
              >
                <Zap className="w-3 h-3" />
                <span className="font-display font-bold text-xs">×{combo}</span>
              </motion.div>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-muted/40 rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          {/* Timer bar */}
          <div className="h-1 bg-muted/30 rounded-full overflow-hidden mb-6">
            <motion.div
              className={`h-full rounded-full ${isUrgent ? "bg-destructive" : "bg-primary/40"}`}
              animate={{ width: `${timerPct}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>

          {/* Question card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, scale: 0.9, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: 90 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="card-kid p-6 text-center mb-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
              <p className="text-xs font-display text-muted-foreground mb-2">
                {t({ he: "מה ההפך של:", ar: "ما عكس:", en: "What's the opposite of:" })}
              </p>
              <motion.span className="text-5xl block mb-3" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                {current.emoji1}
              </motion.span>
              <p className="font-display font-bold text-3xl text-foreground mb-1">{current.word}</p>
              <p className="text-sm text-muted-foreground">{getTranslation(current, false)}</p>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => speakEnglish(current.word)}
                className="mt-2 inline-flex items-center gap-1 text-primary text-xs font-display"
              >
                <Volume2 className="w-3 h-3" /> {t({ he: "שמע", ar: "استمع", en: "Listen" })}
              </motion.button>
            </motion.div>
          </AnimatePresence>

          {/* Options grid */}
          <div className="grid grid-cols-2 gap-3">
            {options.map((opt, i) => {
              const isSelected = selected === opt;
              const isAnswer = opt === current.opposite;
              const showResult = selected !== null;

              let cardStyle = "card-kid";
              if (showResult && isAnswer) cardStyle += " border-2 border-accent bg-accent/10";
              else if (showResult && isSelected && !isAnswer) cardStyle += " border-2 border-destructive bg-destructive/10";

              return (
                <motion.button
                  key={`${currentIdx}-${opt}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                  whileHover={!showResult ? { y: -4, scale: 1.03 } : {}}
                  whileTap={!showResult ? { scale: 0.96 } : {}}
                  onClick={() => handleSelect(opt)}
                  disabled={showResult}
                  className={`${cardStyle} p-4 text-center relative overflow-hidden`}
                >
                  <p className="font-display font-bold text-lg">{opt}</p>
                  {showResult && isAnswer && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1.5 end-1.5"
                    >
                      <CheckCircle className="w-5 h-5 text-accent" />
                    </motion.div>
                  )}
                  {showResult && isSelected && !isAnswer && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1.5 end-1.5"
                    >
                      <XCircle className="w-5 h-5 text-destructive" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {isCorrect !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 text-center p-3 rounded-xl font-display font-semibold text-sm ${
                  isCorrect ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
                }`}
              >
                {isCorrect
                  ? t({ he: "🎉 נכון! מעולה!", ar: "🎉 صحيح! ممتاز!", en: "🎉 Correct! Great job!" })
                  : `${t({ he: "ההפך הנכון:", ar: "العكس الصحيح:", en: "The opposite is:" })} ${current.opposite} ${current.emoji2}`}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </GameSceneShell>
  );
};

export default OppositesGame;
