import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useLanguage } from "@/lib/i18n";
import { playClickSound, speakEnglish, playVictoryFanfare } from "@/lib/sounds";
import { useRewardsPipeline } from "@/hooks/useRewardsPipeline";
import GameSceneShell from "@/components/GameSceneShell";
import Confetti from "@/components/Confetti";
import StarRating from "@/components/StarRating";
import BackToLevels from "@/components/BackToLevels";
import ClassroomBackground from "@/components/ClassroomBackground";
import FloatingParticles from "@/components/FloatingParticles";
import Interactive3DMascot from "@/components/Interactive3DMascot";
import {
  Timer,
  RotateCcw,
  ArrowRight,
  CheckCircle,
  XCircle,
  Volume2,
  Zap,
  Lightbulb,
  Shuffle,
} from "lucide-react";

/* ─── Sentence data ─── */
interface WordOrderQ {
  words: string[];
  hint: string;
  hintAr: string;
  emoji: string;
  category: string;
}

const SENTENCES: WordOrderQ[] = [
  // Animals
  { words: ["The", "cat", "is", "sleeping"], hint: "החתול ישן", hintAr: "القطة نائمة", emoji: "🐱", category: "animals" },
  { words: ["I", "love", "my", "dog"], hint: "אני אוהב את הכלב שלי", hintAr: "أحب كلبي", emoji: "🐕", category: "animals" },
  { words: ["The", "bird", "can", "fly"], hint: "הציפור יכולה לעוף", hintAr: "الطائر يستطيع الطيران", emoji: "🐦", category: "animals" },
  { words: ["Fish", "swim", "in", "the", "sea"], hint: "דגים שוחים בים", hintAr: "الأسماك تسبح في البحر", emoji: "🐟", category: "animals" },
  { words: ["The", "elephant", "is", "very", "big"], hint: "הפיל מאוד גדול", hintAr: "الفيل كبير جداً", emoji: "🐘", category: "animals" },
  { words: ["A", "monkey", "likes", "bananas"], hint: "קוף אוהב בננות", hintAr: "القرد يحب الموز", emoji: "🐒", category: "animals" },
  { words: ["The", "rabbit", "is", "fast"], hint: "הארנב מהיר", hintAr: "الأرنب سريع", emoji: "🐇", category: "animals" },

  // Daily Life
  { words: ["I", "go", "to", "school"], hint: "אני הולך לבית הספר", hintAr: "أذهب إلى المدرسة", emoji: "🏫", category: "daily" },
  { words: ["She", "reads", "a", "book"], hint: "היא קוראת ספר", hintAr: "هي تقرأ كتاباً", emoji: "📖", category: "daily" },
  { words: ["We", "play", "in", "the", "park"], hint: "אנחנו משחקים בפארק", hintAr: "نلعب في الحديقة", emoji: "🏞️", category: "daily" },
  { words: ["He", "eats", "breakfast", "every", "morning"], hint: "הוא אוכל ארוחת בוקר כל בוקר", hintAr: "يأكل الفطور كل صباح", emoji: "🍳", category: "daily" },
  { words: ["They", "are", "playing", "soccer"], hint: "הם משחקים כדורגל", hintAr: "يلعبون كرة القدم", emoji: "⚽", category: "daily" },
  { words: ["I", "brush", "my", "teeth"], hint: "אני מצחצח שיניים", hintAr: "أنظف أسناني", emoji: "🪥", category: "daily" },
  { words: ["She", "is", "doing", "homework"], hint: "היא עושה שיעורי בית", hintAr: "هي تعمل واجبها", emoji: "📝", category: "daily" },
  { words: ["We", "eat", "lunch", "at", "noon"], hint: "אנחנו אוכלים צהריים בצהריים", hintAr: "نأكل الغداء في الظهيرة", emoji: "🍽️", category: "daily" },

  // Colors & Descriptions
  { words: ["The", "sky", "is", "blue"], hint: "השמיים כחולים", hintAr: "السماء زرقاء", emoji: "🔵", category: "colors" },
  { words: ["Flowers", "are", "very", "beautiful"], hint: "פרחים מאוד יפים", hintAr: "الأزهار جميلة جداً", emoji: "🌸", category: "colors" },
  { words: ["The", "sun", "is", "yellow"], hint: "השמש צהובה", hintAr: "الشمس صفراء", emoji: "🌞", category: "colors" },
  { words: ["I", "like", "the", "red", "apple"], hint: "אני אוהב את התפוח האדום", hintAr: "أحب التفاحة الحمراء", emoji: "🍎", category: "colors" },
  { words: ["Snow", "is", "white", "and", "cold"], hint: "שלג לבן וקר", hintAr: "الثلج أبيض وبارد", emoji: "❄️", category: "colors" },

  // Family
  { words: ["My", "mom", "is", "kind"], hint: "אמא שלי טובה", hintAr: "أمي طيبة", emoji: "👩", category: "family" },
  { words: ["Dad", "cooks", "dinner", "tonight"], hint: "אבא מבשל ארוחת ערב הערב", hintAr: "أبي يطبخ العشاء الليلة", emoji: "👨‍🍳", category: "family" },
  { words: ["My", "sister", "is", "very", "smart"], hint: "אחותי מאוד חכמה", hintAr: "أختي ذكية جداً", emoji: "👧", category: "family" },
  { words: ["We", "love", "our", "family"], hint: "אנחנו אוהבים את המשפחה שלנו", hintAr: "نحب عائلتنا", emoji: "👨‍👩‍👧‍👦", category: "family" },

  // Actions
  { words: ["Please", "close", "the", "door"], hint: "בבקשה סגור את הדלת", hintAr: "من فضلك أغلق الباب", emoji: "🚪", category: "actions" },
  { words: ["I", "can", "ride", "a", "bike"], hint: "אני יכול לרכוב על אופניים", hintAr: "أستطيع ركوب الدراجة", emoji: "🚲", category: "actions" },
  { words: ["He", "is", "running", "very", "fast"], hint: "הוא רץ מאוד מהר", hintAr: "يركض بسرعة كبيرة", emoji: "🏃", category: "actions" },
  { words: ["She", "sings", "a", "beautiful", "song"], hint: "היא שרה שיר יפה", hintAr: "تغني أغنية جميلة", emoji: "🎤", category: "actions" },
  { words: ["They", "dance", "at", "the", "party"], hint: "הם רוקדים במסיבה", hintAr: "يرقصون في الحفلة", emoji: "💃", category: "actions" },
  { words: ["I", "want", "to", "learn", "English"], hint: "אני רוצה ללמוד אנגלית", hintAr: "أريد أن أتعلم الإنجليزية", emoji: "📚", category: "actions" },

  // Weather
  { words: ["It", "is", "raining", "today"], hint: "יורד גשם היום", hintAr: "إنها تمطر اليوم", emoji: "🌧️", category: "weather" },
  { words: ["The", "wind", "is", "very", "strong"], hint: "הרוח מאוד חזקה", hintAr: "الرياح قوية جداً", emoji: "💨", category: "weather" },
  { words: ["It", "is", "sunny", "and", "warm"], hint: "שמשי וחמים", hintAr: "مشمس ودافئ", emoji: "☀️", category: "weather" },

  // Numbers & School
  { words: ["I", "have", "five", "pencils"], hint: "יש לי חמישה עפרונות", hintAr: "لدي خمسة أقلام", emoji: "✏️", category: "school" },
  { words: ["There", "are", "three", "books"], hint: "יש שלושה ספרים", hintAr: "هناك ثلاثة كتب", emoji: "📚", category: "school" },
  { words: ["The", "teacher", "is", "very", "nice"], hint: "המורה מאוד נחמדה", hintAr: "المعلمة لطيفة جداً", emoji: "👩‍🏫", category: "school" },

  // Harder sentences (5-6 words)
  { words: ["The", "little", "puppy", "is", "so", "cute"], hint: "הכלבלב הקטן כל כך חמוד", hintAr: "الجرو الصغير لطيف جداً", emoji: "🐶", category: "animals" },
  { words: ["I", "always", "drink", "milk", "before", "bed"], hint: "אני תמיד שותה חלב לפני השינה", hintAr: "أشرب الحليب دائماً قبل النوم", emoji: "🥛", category: "daily" },
  { words: ["My", "best", "friend", "lives", "next", "door"], hint: "החבר הכי טוב שלי גר ליד", hintAr: "صديقي المفضل يسكن بجواري", emoji: "🏠", category: "family" },
];

/* ─── Helpers ─── */
const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pickQuestions = (count: number): WordOrderQ[] => {
  const shuffled = shuffle(SENTENCES);
  return shuffled.slice(0, count);
};

type Difficulty = "easy" | "medium" | "hard";
const DIFFICULTY_CONFIG: Record<Difficulty, { rounds: number; timer: number; label: Record<string, string> }> = {
  easy: { rounds: 8, timer: 45, label: { en: "Easy", he: "קל", ar: "سهل" } },
  medium: { rounds: 12, timer: 30, label: { en: "Medium", he: "בינוני", ar: "متوسط" } },
  hard: { rounds: 16, timer: 20, label: { en: "Hard", he: "קשה", ar: "صعب" } },
};

/* ─── Main component ─── */
const WordOrderGame = () => {
  const { lang, dir } = useLanguage();
  const t = (texts: Record<string, string>) => texts[lang] || texts.en;

  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [questions, setQuestions] = useState<WordOrderQ[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [results, setResults] = useState<{ correct: boolean; sentence: string }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [mascotMood, setMascotMood] = useState<"idle" | "celebrate" | "sad">("idle");

  const rewards = useRewardsPipeline();
  const current = questions[currentIdx];
  const totalRounds = questions.length;

  // Start game
  const startGame = useCallback((diff: Difficulty) => {
    playClickSound();
    setDifficulty(diff);
    const qs = pickQuestions(DIFFICULTY_CONFIG[diff].rounds);
    setQuestions(qs);
    setCurrentIdx(0);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setResults([]);
    setGameOver(false);
    setFeedback(null);
    setShowHint(false);
    const q = qs[0];
    setPlaced([]);
    setAvailable(shuffle(q.words));
    setTimeLeft(DIFFICULTY_CONFIG[diff].timer);
  }, []);

  // Timer
  useEffect(() => {
    if (!difficulty || gameOver || feedback) return;
    if (timeLeft <= 0) {
      handleCheck(true);
      return;
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, difficulty, gameOver, feedback]);

  // Place a word
  const placeWord = useCallback((word: string, idx: number) => {
    playClickSound();
    setPlaced((p) => [...p, word]);
    setAvailable((a) => a.filter((_, i) => i !== idx));
  }, []);

  // Remove a placed word
  const removePlaced = useCallback((idx: number) => {
    playClickSound();
    const word = placed[idx];
    setPlaced((p) => p.filter((_, i) => i !== idx));
    setAvailable((a) => [...a, word]);
  }, [placed]);

  // Check answer
  const handleCheck = useCallback((timedOut = false) => {
    if (!current || !difficulty) return;
    const correct = !timedOut && placed.join(" ") === current.words.join(" ");

    setFeedback(correct ? "correct" : "wrong");
    setMascotMood(correct ? "celebrate" : "sad");

    if (correct) {
      const pts = 10 + combo * 2;
      setScore((s) => s + pts);
      setCombo((c) => {
        const nc = c + 1;
        setBestCombo((b) => Math.max(b, nc));
        return nc;
      });
      rewards.fireEvent({ type: "correct", points: pts });
    } else {
      setCombo(0);
      rewards.fireEvent({ type: "wrong" });
    }

    setResults((r) => [...r, { correct, sentence: current.words.join(" ") }]);

    // Move to next after delay
    setTimeout(() => {
      setFeedback(null);
      setMascotMood("idle");
      const nextIdx = currentIdx + 1;
      if (nextIdx >= totalRounds) {
        setGameOver(true);
        playVictoryFanfare();
        return;
      }
      setCurrentIdx(nextIdx);
      const q = questions[nextIdx];
      setPlaced([]);
      setAvailable(shuffle(q.words));
      setTimeLeft(DIFFICULTY_CONFIG[difficulty].timer);
      setShowHint(false);
    }, 1500);
  }, [current, placed, combo, currentIdx, totalRounds, questions, difficulty, rewards]);

  // Speak sentence
  const speak = useCallback(() => {
    if (current) speakEnglish(current.words.join(" "));
  }, [current]);

  const correctCount = results.filter((r) => r.correct).length;
  const stars = correctCount >= totalRounds * 0.9 ? 3 : correctCount >= totalRounds * 0.65 ? 2 : correctCount >= totalRounds * 0.35 ? 1 : 0;

  // ─── Difficulty select ───
  if (!difficulty) {
    return (
      <div className="min-h-screen relative" dir={dir}>
        <ClassroomBackground />
        <FloatingParticles count={6} />
        <div className="max-w-lg mx-auto px-4 py-8 relative z-10">
          <BackToLevels />
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <Interactive3DMascot mood="idle" size="sm" />
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">
              {t({ en: "🔀 Word Order", he: "🔀 סדר מילים", ar: "🔀 ترتيب الكلمات" })}
            </h1>
            <p className="text-muted-foreground font-body text-sm">
              {t({ en: "Arrange the words to make a correct sentence!", he: "סדר את המילים ליצירת משפט נכון!", ar: "رتّب الكلمات لتكوين جملة صحيحة!" })}
            </p>
          </motion.div>
          <div className="grid gap-3">
            {(["easy", "medium", "hard"] as const).map((d, i) => (
              <motion.button
                key={d}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => startGame(d)}
                className="card-kid p-4 flex items-center gap-4 text-start"
              >
                <span className="text-3xl">{d === "easy" ? "🌱" : d === "medium" ? "🌿" : "🌳"}</span>
                <div className="flex-1">
                  <p className="font-display font-bold text-base">{DIFFICULTY_CONFIG[d].label[lang]}</p>
                  <p className="text-xs text-muted-foreground">
                    {DIFFICULTY_CONFIG[d].rounds} {t({ en: "rounds", he: "סיבובים", ar: "جولات" })} · {DIFFICULTY_CONFIG[d].timer}s
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-primary" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Game Over ───
  if (gameOver) {
    return (
      <div className="min-h-screen relative" dir={dir}>
        <ClassroomBackground />
        <Confetti show={stars >= 2} />
        <div className="max-w-lg mx-auto px-4 py-8 relative z-10">
          <BackToLevels />
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card-kid p-6 text-center">
            <Interactive3DMascot mood={stars >= 2 ? "celebrate" : "idle"} size="sm" />
            <h2 className="text-2xl font-display font-bold text-gradient mb-3">
              {stars >= 2
                ? t({ en: "Amazing! 🎉", he: "מדהים! 🎉", ar: "رائع! 🎉" })
                : t({ en: "Good try! 💪", he: "ניסיון טוב! 💪", ar: "محاولة جيدة! 💪" })}
            </h2>
            <StarRating earned={stars} total={3} />
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="bg-muted/30 rounded-xl p-2">
                <p className="font-display font-bold text-xl text-primary">{score}</p>
                <p className="text-[10px] text-muted-foreground">{t({ en: "Score", he: "ניקוד", ar: "نقاط" })}</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-2">
                <p className="font-display font-bold text-xl text-accent">{correctCount}/{totalRounds}</p>
                <p className="text-[10px] text-muted-foreground">{t({ en: "Correct", he: "נכון", ar: "صحيح" })}</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-2">
                <p className="font-display font-bold text-xl text-sunshine">{bestCombo}x</p>
                <p className="text-[10px] text-muted-foreground">{t({ en: "Best Combo", he: "קומבו", ar: "أفضل سلسلة" })}</p>
              </div>
            </div>

            {/* Results list */}
            <div className="max-h-40 overflow-y-auto space-y-1.5 mb-4 text-start" dir="ltr">
              {results.map((r, i) => (
                <div key={i} className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg ${r.correct ? "bg-accent/10" : "bg-candy/10"}`}>
                  {r.correct ? <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-candy shrink-0" />}
                  <span className="font-body">{r.sentence}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startGame(difficulty)}
                className="flex-1 btn-primary py-2.5 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {t({ en: "Play Again", he: "שחק שוב", ar: "العب مرة أخرى" })}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDifficulty(null)}
                className="flex-1 bg-muted/50 py-2.5 rounded-xl font-display font-semibold text-sm"
              >
                {t({ en: "Change Level", he: "שנה רמה", ar: "غيّر المستوى" })}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── Active Game ───
  return (
    <GameSceneShell title={t({ en: "Word Order", he: "סדר מילים", ar: "ترتيب الكلمات" })} emoji="🔀" gameType="word-order" progress={Math.round((currentIdx / totalRounds) * 100)} totalRounds={totalRounds} currentRound={currentIdx + 1} rewards={rewards}>
      <div className="max-w-lg mx-auto px-4 py-4 relative z-10" dir={dir}>
        <BackToLevels />

        {/* HUD */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-primary">{currentIdx + 1}/{totalRounds}</span>
            {combo > 1 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-0.5 text-xs font-display font-bold text-sunshine bg-sunshine/15 px-2 py-0.5 rounded-full"
              >
                <Zap className="w-3 h-3" /> {combo}x
              </motion.span>
            )}
          </div>
          <div className={`flex items-center gap-1 font-display font-bold text-sm ${timeLeft <= 5 ? "text-candy animate-pulse" : "text-muted-foreground"}`}>
            <Timer className="w-4 h-4" />
            {timeLeft}s
          </div>
        </div>

        {/* Mascot */}
        <div className="flex justify-center mb-3">
          <Interactive3DMascot mood={mascotMood} size="sm" />
        </div>

        {/* Current sentence hint */}
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-kid p-4 mb-4 text-center relative"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">{current?.emoji}</span>
            <p className="font-display font-bold text-sm text-muted-foreground">
              {t({ en: "Arrange the words:", he: "סדר את המילים:", ar: "رتّب الكلمات:" })}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={speak}
              className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <Volume2 className="w-4 h-4 text-primary" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowHint((h) => !h)}
              className="w-8 h-8 rounded-full bg-sunshine/10 flex items-center justify-center"
            >
              <Lightbulb className="w-4 h-4 text-sunshine" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                playClickSound();
                setPlaced([]);
                setAvailable(shuffle(current?.words || []));
              }}
              className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center"
            >
              <Shuffle className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          </div>

          {/* Hint */}
          <AnimatePresence>
            {showHint && current && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-muted-foreground mt-2 font-body"
              >
                💡 {lang === "ar" ? current.hintAr : current.hint}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Placed words (sentence area) */}
        <div
          className="min-h-[56px] rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-3 mb-4 flex flex-wrap gap-2 items-center justify-center"
          dir="ltr"
        >
          {placed.length === 0 && (
            <p className="text-xs text-muted-foreground/50 font-body">
              {t({ en: "Tap words to build the sentence", he: "לחץ על מילים לבניית המשפט", ar: "اضغط على الكلمات لبناء الجملة" })}
            </p>
          )}
          <AnimatePresence>
            {placed.map((word, i) => (
              <motion.button
                key={`placed-${i}-${word}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => removePlaced(i)}
                className="px-3 py-1.5 rounded-lg font-display font-bold text-sm bg-primary text-primary-foreground shadow-md"
                layout
              >
                {word}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Available words */}
        <div className="flex flex-wrap gap-2 justify-center mb-4" dir="ltr">
          <AnimatePresence>
            {available.map((word, i) => (
              <motion.button
                key={`avail-${i}-${word}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => placeWord(word, i)}
                className="px-3 py-1.5 rounded-lg font-display font-bold text-sm bg-card border-2 border-border shadow-sm hover:border-primary/50 transition-colors"
                layout
              >
                {word}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Check button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleCheck(false)}
          disabled={placed.length === 0 || !!feedback}
          className="w-full btn-primary py-3 rounded-xl font-display font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40"
        >
          <CheckCircle className="w-5 h-5" />
          {t({ en: "Check Answer", he: "בדוק תשובה", ar: "تحقق من الإجابة" })}
        </motion.button>

        {/* Feedback overlay */}
        <AnimatePresence>
          {feedback && current && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className={`card-kid p-6 text-center max-w-sm mx-4 ${feedback === "correct" ? "border-accent/40" : "border-candy/40"}`}
              >
                {feedback === "correct" ? (
                  <>
                    <span className="text-5xl block mb-2">🎉</span>
                    <p className="font-display font-bold text-lg text-accent">
                      {t({ en: "Correct!", he: "נכון!", ar: "صحيح!" })}
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-5xl block mb-2">😕</span>
                    <p className="font-display font-bold text-lg text-candy mb-1">
                      {t({ en: "Not quite!", he: "לא בדיוק!", ar: "ليس تماماً!" })}
                    </p>
                    <p className="text-sm font-body text-muted-foreground" dir="ltr">
                      ✅ {current.words.join(" ")}
                    </p>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameSceneShell>
  );
};

export default WordOrderGame;
