import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n";
import {
  playClickSound,
  speakEnglish,
  playVictoryFanfare,
} from "@/lib/sounds";
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
} from "lucide-react";

/* ─── Sentence data ─── */
interface SentenceQ {
  sentence: string; // use ___ for blank
  answer: string;
  distractors: string[];
  hint: string; // translation
  hintAr: string;
  emoji: string;
  category: string;
}

const SENTENCES: SentenceQ[] = [
  // Animals & Nature
  { sentence: "The ___ is swimming in the ocean.", answer: "fish", distractors: ["bird", "cat", "car"], hint: "הדג שוחה באוקיינוס", hintAr: "السمكة تسبح في المحيط", emoji: "🐟", category: "animals" },
  { sentence: "I can see a ___ in the sky.", answer: "bird", distractors: ["fish", "dog", "table"], hint: "אני רואה ציפור בשמיים", hintAr: "أستطيع رؤية طائر في السماء", emoji: "🐦", category: "animals" },
  { sentence: "The ___ has four legs.", answer: "dog", distractors: ["fish", "snake", "ant"], hint: "לכלב יש ארבע רגליים", hintAr: "الكلب لديه أربعة أرجل", emoji: "🐕", category: "animals" },
  { sentence: "A ___ lives in the jungle.", answer: "lion", distractors: ["penguin", "fish", "cow"], hint: "אריה חי בג'ונגל", hintAr: "الأسد يعيش في الغابة", emoji: "🦁", category: "animals" },
  { sentence: "The ___ is very tall.", answer: "giraffe", distractors: ["mouse", "frog", "ant"], hint: "הג'ירפה מאוד גבוהה", hintAr: "الزرافة طويلة جداً", emoji: "🦒", category: "animals" },
  { sentence: "A ___ can fly at night.", answer: "bat", distractors: ["cow", "fish", "turtle"], hint: "עטלף יכול לעוף בלילה", hintAr: "الخفاش يطير في الليل", emoji: "🦇", category: "animals" },
  { sentence: "The ___ lays eggs.", answer: "chicken", distractors: ["dog", "cat", "horse"], hint: "התרנגולת מטילה ביצים", hintAr: "الدجاجة تبيض", emoji: "🐔", category: "animals" },

  // Colors
  { sentence: "The sky is ___.", answer: "blue", distractors: ["red", "green", "black"], hint: "השמיים כחולים", hintAr: "السماء زرقاء", emoji: "🔵", category: "colors" },
  { sentence: "Grass is ___.", answer: "green", distractors: ["blue", "red", "white"], hint: "הדשא ירוק", hintAr: "العشب أخضر", emoji: "🟢", category: "colors" },
  { sentence: "Snow is ___.", answer: "white", distractors: ["black", "red", "green"], hint: "השלג לבן", hintAr: "الثلج أبيض", emoji: "⚪", category: "colors" },
  { sentence: "A banana is ___.", answer: "yellow", distractors: ["red", "blue", "black"], hint: "בננה צהובה", hintAr: "الموز أصفر", emoji: "🟡", category: "colors" },
  { sentence: "Tomatoes are ___.", answer: "red", distractors: ["blue", "white", "green"], hint: "עגבניות אדומות", hintAr: "الطماطم حمراء", emoji: "🔴", category: "colors" },

  // Food
  { sentence: "I like to eat ___ for breakfast.", answer: "eggs", distractors: ["shoes", "books", "chairs"], hint: "אני אוהב לאכול ביצים לארוחת בוקר", hintAr: "أحب أكل البيض في الفطور", emoji: "🍳", category: "food" },
  { sentence: "Can I have a glass of ___?", answer: "water", distractors: ["paper", "stone", "wood"], hint: "אפשר כוס מים?", hintAr: "هل يمكنني الحصول على كوب ماء؟", emoji: "💧", category: "food" },
  { sentence: "My favorite ___ is chocolate.", answer: "candy", distractors: ["animal", "color", "sport"], hint: "הממתק האהוב עליי הוא שוקולד", hintAr: "حلواي المفضلة هي الشوكولاتة", emoji: "🍫", category: "food" },
  { sentence: "We eat ___ with a fork.", answer: "food", distractors: ["rain", "sun", "wind"], hint: "אנחנו אוכלים אוכל עם מזלג", hintAr: "نأكل الطعام بالشوكة", emoji: "🍴", category: "food" },
  { sentence: "I want to ___ some juice.", answer: "drink", distractors: ["sleep", "read", "write"], hint: "אני רוצה לשתות מיץ", hintAr: "أريد أن أشرب عصير", emoji: "🧃", category: "food" },

  // Body
  { sentence: "I can see with my ___.", answer: "eyes", distractors: ["feet", "hands", "ears"], hint: "אני יכול לראות עם העיניים", hintAr: "أستطيع الرؤية بعينيّ", emoji: "👀", category: "body" },
  { sentence: "I hear with my ___.", answer: "ears", distractors: ["eyes", "nose", "mouth"], hint: "אני שומע עם האוזניים", hintAr: "أسمع بأذنيّ", emoji: "👂", category: "body" },
  { sentence: "I write with my ___.", answer: "hand", distractors: ["foot", "ear", "nose"], hint: "אני כותב עם היד", hintAr: "أكتب بيدي", emoji: "✍️", category: "body" },
  { sentence: "I smell with my ___.", answer: "nose", distractors: ["feet", "hand", "eye"], hint: "אני מריח עם האף", hintAr: "أشم بأنفي", emoji: "👃", category: "body" },
  { sentence: "I walk with my ___.", answer: "legs", distractors: ["arms", "ears", "eyes"], hint: "אני הולך עם הרגליים", hintAr: "أمشي بساقيّ", emoji: "🦵", category: "body" },

  // Actions / Verbs
  { sentence: "I ___ to school every day.", answer: "go", distractors: ["eat", "sleep", "fly"], hint: "אני הולך לבית הספר כל יום", hintAr: "أذهب إلى المدرسة كل يوم", emoji: "🏫", category: "verbs" },
  { sentence: "She can ___ very fast.", answer: "run", distractors: ["eat", "sleep", "sit"], hint: "היא יכולה לרוץ מהר מאוד", hintAr: "تستطيع الركض بسرعة كبيرة", emoji: "🏃‍♀️", category: "verbs" },
  { sentence: "I ___ a book every night.", answer: "read", distractors: ["eat", "drink", "throw"], hint: "אני קורא ספר כל לילה", hintAr: "أقرأ كتاباً كل ليلة", emoji: "📖", category: "verbs" },
  { sentence: "We ___ songs in music class.", answer: "sing", distractors: ["eat", "drive", "swim"], hint: "אנחנו שרים שירים בשיעור מוזיקה", hintAr: "نغني أغاني في درس الموسيقى", emoji: "🎤", category: "verbs" },
  { sentence: "He likes to ___ in the pool.", answer: "swim", distractors: ["fly", "cook", "write"], hint: "הוא אוהב לשחות בבריכה", hintAr: "يحب السباحة في المسبح", emoji: "🏊", category: "verbs" },
  { sentence: "Please ___ the door.", answer: "open", distractors: ["eat", "drink", "sing"], hint: "בבקשה פתח את הדלת", hintAr: "من فضلك افتح الباب", emoji: "🚪", category: "verbs" },
  { sentence: "I ___ my teeth every morning.", answer: "brush", distractors: ["eat", "throw", "kick"], hint: "אני מצחצח שיניים כל בוקר", hintAr: "أنظف أسناني كل صباح", emoji: "🪥", category: "verbs" },
  { sentence: "They ___ soccer after school.", answer: "play", distractors: ["cook", "read", "sleep"], hint: "הם משחקים כדורגל אחרי בית הספר", hintAr: "يلعبون كرة القدم بعد المدرسة", emoji: "⚽", category: "verbs" },

  // Weather & Time
  { sentence: "It is ___ outside, bring a jacket.", answer: "cold", distractors: ["happy", "fast", "loud"], hint: "קר בחוץ, קח מעיל", hintAr: "الجو بارد، خذ سترة", emoji: "🥶", category: "weather" },
  { sentence: "The sun is very ___ today.", answer: "hot", distractors: ["cold", "blue", "old"], hint: "השמש חמה מאוד היום", hintAr: "الشمس حارة جداً اليوم", emoji: "☀️", category: "weather" },
  { sentence: "I go to ___ at night.", answer: "sleep", distractors: ["school", "work", "swim"], hint: "אני הולך לישון בלילה", hintAr: "أذهب للنوم في الليل", emoji: "😴", category: "weather" },
  { sentence: "We eat ___ in the morning.", answer: "breakfast", distractors: ["dinner", "lunch", "midnight"], hint: "אנחנו אוכלים ארוחת בוקר", hintAr: "نأكل الفطور في الصباح", emoji: "🌅", category: "weather" },

  // Family
  { sentence: "My ___ cooks dinner for us.", answer: "mother", distractors: ["teacher", "friend", "doctor"], hint: "אמא שלי מבשלת ארוחת ערב", hintAr: "أمي تطبخ العشاء لنا", emoji: "👩‍🍳", category: "family" },
  { sentence: "My ___ drives me to school.", answer: "father", distractors: ["fish", "bird", "tree"], hint: "אבא שלי נוהג אותי לבית הספר", hintAr: "أبي يوصلني إلى المدرسة", emoji: "👨", category: "family" },
  { sentence: "I play with my ___ at home.", answer: "brother", distractors: ["teacher", "doctor", "driver"], hint: "אני משחק עם האח שלי בבית", hintAr: "ألعب مع أخي في البيت", emoji: "👦", category: "family" },
  { sentence: "My ___ is older than me.", answer: "sister", distractors: ["pencil", "table", "window"], hint: "האחות שלי גדולה ממני", hintAr: "أختي أكبر مني", emoji: "👧", category: "family" },

  // School
  { sentence: "I write with a ___.", answer: "pencil", distractors: ["fork", "shoe", "cup"], hint: "אני כותב עם עיפרון", hintAr: "أكتب بقلم رصاص", emoji: "✏️", category: "school" },
  { sentence: "The ___ teaches us math.", answer: "teacher", distractors: ["doctor", "farmer", "pilot"], hint: "המורה מלמד אותנו מתמטיקה", hintAr: "المعلم يعلمنا الرياضيات", emoji: "👩‍🏫", category: "school" },
  { sentence: "I carry my books in a ___.", answer: "bag", distractors: ["hat", "shoe", "cup"], hint: "אני נושא את הספרים בתיק", hintAr: "أحمل كتبي في حقيبة", emoji: "🎒", category: "school" },
  { sentence: "We study ___ at school.", answer: "English", distractors: ["cooking", "driving", "sleeping"], hint: "אנחנו לומדים אנגלית בבית הספר", hintAr: "ندرس الإنجليزية في المدرسة", emoji: "📚", category: "school" },

  // Numbers & size
  { sentence: "An elephant is very ___.", answer: "big", distractors: ["small", "thin", "short"], hint: "פיל מאוד גדול", hintAr: "الفيل كبير جداً", emoji: "🐘", category: "adjectives" },
  { sentence: "A mouse is very ___.", answer: "small", distractors: ["big", "tall", "heavy"], hint: "עכבר מאוד קטן", hintAr: "الفأر صغير جداً", emoji: "🐭", category: "adjectives" },
  { sentence: "The opposite of happy is ___.", answer: "sad", distractors: ["fast", "big", "tall"], hint: "ההפך של שמח הוא עצוב", hintAr: "عكس سعيد هو حزين", emoji: "😢", category: "adjectives" },
  { sentence: "She is a very ___ girl.", answer: "smart", distractors: ["blue", "round", "wooden"], hint: "היא ילדה מאוד חכמה", hintAr: "هي فتاة ذكية جداً", emoji: "🧠", category: "adjectives" },
  { sentence: "The baby is very ___.", answer: "cute", distractors: ["old", "tall", "heavy"], hint: "התינוק מאוד חמוד", hintAr: "الطفل لطيف جداً", emoji: "👶", category: "adjectives" },

  // Places
  { sentence: "We buy food at the ___.", answer: "store", distractors: ["school", "hospital", "park"], hint: "אנחנו קונים אוכל בחנות", hintAr: "نشتري الطعام من المتجر", emoji: "🏪", category: "places" },
  { sentence: "I play at the ___.", answer: "park", distractors: ["hospital", "office", "bank"], hint: "אני משחק בפארק", hintAr: "ألعب في الحديقة", emoji: "🏞️", category: "places" },
  { sentence: "We go to the ___ when we are sick.", answer: "hospital", distractors: ["park", "school", "store"], hint: "אנחנו הולכים לבית חולים כשאנחנו חולים", hintAr: "نذهب إلى المستشفى عندما نمرض", emoji: "🏥", category: "places" },
  { sentence: "Books are in the ___.", answer: "library", distractors: ["kitchen", "garden", "beach"], hint: "ספרים נמצאים בספרייה", hintAr: "الكتب في المكتبة", emoji: "📚", category: "places" },

  // Clothes
  { sentence: "I wear ___ on my feet.", answer: "shoes", distractors: ["hat", "shirt", "gloves"], hint: "אני נועל נעליים על הרגליים", hintAr: "ألبس أحذية على قدميّ", emoji: "👟", category: "clothes" },
  { sentence: "I wear a ___ on my head.", answer: "hat", distractors: ["shoe", "pants", "ring"], hint: "אני חובש כובע על הראש", hintAr: "ألبس قبعة على رأسي", emoji: "🧢", category: "clothes" },
  { sentence: "When it rains I use an ___.", answer: "umbrella", distractors: ["apple", "elephant", "engine"], hint: "כשיורד גשם אני משתמש במטרייה", hintAr: "عندما تمطر أستخدم مظلة", emoji: "☂️", category: "clothes" },
];

type Difficulty = "easy" | "medium" | "hard";
const ROUND_COUNTS: Record<Difficulty, number> = { easy: 8, medium: 12, hard: 18 };
const TIME_LIMITS: Record<Difficulty, number> = { easy: 90, medium: 75, hard: 60 };

const SentenceGame = () => {
  const { lang, dir } = useLanguage();
  const t = (texts: Record<string, string>) => texts[lang] || texts.en;
  const rewards = useRewardsPipeline();

  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [rounds, setRounds] = useState<SentenceQ[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Ref to track authoritative score, avoiding stale-closure in endGame.
  const scoreRef = useRef(0);

  const current = rounds[currentIdx];

  const startGame = useCallback(
    (diff: Difficulty) => {
      playClickSound();
      setDifficulty(diff);
      const shuffled = [...SENTENCES].sort(() => Math.random() - 0.5);
      const picked = shuffled.slice(0, ROUND_COUNTS[diff]);
      setRounds(picked);
      setCurrentIdx(0);
      scoreRef.current = 0;
      setScore(0);
      setCombo(0);
      setGameOver(false);
      setSelected(null);
      setIsCorrect(null);
      setShowHint(false);
      setTimeLeft(TIME_LIMITS[diff]);
      rewards.reset();
      buildOptions(picked[0]);
    },
    [rewards]
  );

  const buildOptions = useCallback((q: SentenceQ) => {
    const opts = [q.answer, ...q.distractors].sort(() => Math.random() - 0.5);
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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [difficulty, gameOver]);

  /* speak sentence on new question */
  useEffect(() => {
    if (current && !gameOver && selected === null) {
      const full = current.sentence.replace("___", current.answer);
      speakEnglish(full);
    }
  }, [currentIdx, gameOver]);

  // `lastRoundWon` passed explicitly to avoid stale-closure on `score`.
  const endGame = useCallback((lastRoundWon = false) => {
    setGameOver(true);
    if (timerRef.current) clearInterval(timerRef.current);
    const finalCorrect = scoreRef.current + (lastRoundWon ? 1 : 0);
    rewards.completeGame({
      gameType: "sentences",
      correct: finalCorrect,
      wrong: rounds.length - finalCorrect,
      totalRounds: rounds.length,
    });
    const stars =
      finalCorrect >= rounds.length * 0.9
        ? 3
        : finalCorrect >= rounds.length * 0.6
        ? 2
        : finalCorrect > 0
        ? 1
        : 0;
    if (stars >= 2) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
    }
  }, [rounds.length, rewards]);

  const handleSelect = useCallback(
    (option: string) => {
      if (selected !== null || !current) return;
      playClickSound();
      setSelected(option);
      setShowHint(false);

      const correct = option === current.answer;
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

      // Pass `correct` explicitly so endGame() reads the right value without
      // relying on the stale `score` closure.
      setTimeout(() => {
        const nextIdx = currentIdx + 1;
        if (nextIdx >= rounds.length) {
          endGame(correct);
        } else {
          setCurrentIdx(nextIdx);
          setSelected(null);
          setIsCorrect(null);
          setShowHint(false);
          buildOptions(rounds[nextIdx]);
        }
      }, 1400);
    },
    [selected, current, currentIdx, rounds, rewards, endGame, buildOptions]
  );

  /* ─── Difficulty Select ─── */
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
            <span className="text-5xl mb-3 block">📝</span>
            <h1 className="text-3xl font-display font-bold text-gradient mb-2">
              {t({
                he: "השלם את המשפט",
                ar: "أكمل الجملة",
                en: "Complete the Sentence",
              })}
            </h1>
            <p className="text-muted-foreground font-body text-sm">
              {t({
                he: "בחר את המילה הנכונה להשלמת המשפט!",
                ar: "اختر الكلمة الصحيحة لإكمال الجملة!",
                en: "Choose the right word to complete the sentence!",
              })}
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
                easy: {
                  he: `${ROUND_COUNTS.easy} משפטים · ${TIME_LIMITS.easy} שניות`,
                  ar: `${ROUND_COUNTS.easy} جمل · ${TIME_LIMITS.easy} ثانية`,
                  en: `${ROUND_COUNTS.easy} sentences · ${TIME_LIMITS.easy}s`,
                },
                medium: {
                  he: `${ROUND_COUNTS.medium} משפטים · ${TIME_LIMITS.medium} שניות`,
                  ar: `${ROUND_COUNTS.medium} جمل · ${TIME_LIMITS.medium} ثانية`,
                  en: `${ROUND_COUNTS.medium} sentences · ${TIME_LIMITS.medium}s`,
                },
                hard: {
                  he: `${ROUND_COUNTS.hard} משפטים · ${TIME_LIMITS.hard} שניות`,
                  ar: `${ROUND_COUNTS.hard} جمل · ${TIME_LIMITS.hard} ثانية`,
                  en: `${ROUND_COUNTS.hard} sentences · ${TIME_LIMITS.hard}s`,
                },
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
                  <span className="text-3xl">
                    {diff === "easy" ? "🌱" : diff === "medium" ? "🌿" : "🌲"}
                  </span>
                  <div>
                    <p className="font-display font-bold">{t(labels[diff])}</p>
                    <p className="text-xs text-muted-foreground">
                      {t(descs[diff])}
                    </p>
                  </div>
                  <ArrowRight
                    className={`w-5 h-5 text-muted-foreground ms-auto ${dir === "rtl" ? "rotate-180" : ""}`}
                  />
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
    const stars =
      score >= rounds.length * 0.9
        ? 3
        : score >= rounds.length * 0.6
        ? 2
        : score > 0
        ? 1
        : 0;
    const pct = Math.round((score / rounds.length) * 100);
    return (
      <div className="min-h-screen relative" dir={dir}>
        <ClassroomBackground />
        <Confetti show={showConfetti} />
        <div className="max-w-md mx-auto px-4 py-12 relative z-10 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <Interactive3DMascot
              mood={stars >= 2 ? "celebrate" : "think"}
              size="sm"
            />
            <span className="text-6xl mb-4 block">
              {stars >= 2 ? "🎉" : "💪"}
            </span>
            <h2 className="text-3xl font-display font-bold text-gradient mb-2">
              {stars >= 2
                ? t({ he: "מדהים!", ar: "رائع!", en: "Amazing!" })
                : t({ he: "כל הכבוד!", ar: "أحسنت!", en: "Good job!" })}
            </h2>
            <StarRating earned={stars} total={3} size={32} />
            <div className="grid grid-cols-2 gap-3 mt-6 mb-6">
              <div className="card-kid p-3 text-center">
                <p className="font-display font-bold text-2xl text-primary">
                  {score}/{rounds.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t({
                    he: "תשובות נכונות",
                    ar: "إجابات صحيحة",
                    en: "Correct",
                  })}
                </p>
              </div>
              <div className="card-kid p-3 text-center">
                <p className="font-display font-bold text-2xl text-accent">
                  {pct}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {t({ he: "דיוק", ar: "دقة", en: "Accuracy" })}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => startGame(difficulty)}
                className="btn-kid gradient-primary text-primary-foreground flex-1 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {t({ he: "שחק שוב", ar: "العب مجدداً", en: "Play Again" })}
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
  const progress = (currentIdx / rounds.length) * 100;
  const timerPct = (timeLeft / TIME_LIMITS[difficulty]) * 100;
  const isUrgent = timeLeft <= 10;

  // Build displayed sentence with blank highlighted
  const parts = current.sentence.split("___");

  return (
    <GameSceneShell
      title={t({
        he: "השלם את המשפט",
        ar: "أكمل الجملة",
        en: "Complete the Sentence",
      })}
      emoji="📝"
      gameType="sentences"
      progress={progress}
      totalRounds={rounds.length}
      currentRound={currentIdx + 1}
      rewards={rewards}
    >
      <div className="min-h-screen relative" dir={dir}>
        <ClassroomBackground />
        <div className="max-w-lg mx-auto px-4 py-6 relative z-10">
          {/* Header bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">📝</span>
              <span className="font-display font-bold text-sm">
                {currentIdx + 1}/{rounds.length}
              </span>
            </div>
            <motion.div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-display font-bold text-sm ${
                isUrgent
                  ? "bg-destructive/15 text-destructive"
                  : "bg-primary/10 text-primary"
              }`}
              animate={isUrgent ? { scale: [1, 1.08, 1] } : {}}
              transition={isUrgent ? { duration: 0.5, repeat: Infinity } : {}}
            >
              <Timer className="w-4 h-4" />
              {timeLeft}s
            </motion.div>
            {combo >= 2 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 bg-accent/15 text-accent px-2 py-1 rounded-full"
              >
                <Zap className="w-3 h-3" />
                <span className="font-display font-bold text-xs">×{combo}</span>
              </motion.div>
            )}
          </div>

          {/* Progress + timer bars */}
          <div className="h-2 bg-muted/40 rounded-full overflow-hidden mb-1.5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="h-1 bg-muted/30 rounded-full overflow-hidden mb-6">
            <motion.div
              className={`h-full rounded-full ${isUrgent ? "bg-destructive" : "bg-primary/40"}`}
              animate={{ width: `${timerPct}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>

          {/* Sentence card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.35 }}
              className="card-kid p-5 sm:p-6 mb-5 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

              {/* Category badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{current.emoji}</span>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    speakEnglish(
                      current.sentence.replace("___", current.answer)
                    )
                  }
                  className="flex items-center gap-1 text-primary text-xs font-display"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {t({ he: "שמע", ar: "استمع", en: "Listen" })}
                </motion.button>
              </div>

              {/* Sentence with blank */}
              <p className="font-display text-xl sm:text-2xl font-bold leading-relaxed text-foreground text-center">
                {parts[0]}
                <motion.span
                  className={`inline-block mx-1 px-3 py-0.5 rounded-lg border-2 border-dashed min-w-[80px] text-center ${
                    isCorrect === true
                      ? "border-accent bg-accent/10 text-accent"
                      : isCorrect === false
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : "border-primary/40 bg-primary/5 text-primary"
                  }`}
                  animate={
                    selected === null
                      ? { scale: [1, 1.05, 1] }
                      : {}
                  }
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {selected || "???"}
                </motion.span>
                {parts[1]}
              </p>

              {/* Hint toggle */}
              <div className="text-center mt-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs text-muted-foreground font-display hover:text-foreground"
                >
                  💡 {t({ he: "רמז", ar: "تلميح", en: "Hint" })}
                </motion.button>
                <AnimatePresence>
                  {showHint && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-sm text-muted-foreground mt-1 font-body"
                    >
                      {lang === "ar" ? current.hintAr : current.hint}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Options grid */}
          <div className="grid grid-cols-2 gap-3">
            {options.map((opt, i) => {
              const isSelected = selected === opt;
              const isAnswer = opt === current.answer;
              const showResult = selected !== null;

              let cardClass = "card-kid";
              if (showResult && isAnswer)
                cardClass += " border-2 border-accent bg-accent/10";
              else if (showResult && isSelected && !isAnswer)
                cardClass += " border-2 border-destructive bg-destructive/10";

              return (
                <motion.button
                  key={`${currentIdx}-${opt}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                  whileHover={!showResult ? { y: -3, scale: 1.03 } : {}}
                  whileTap={!showResult ? { scale: 0.96 } : {}}
                  onClick={() => handleSelect(opt)}
                  disabled={showResult}
                  className={`${cardClass} p-4 text-center relative`}
                >
                  <p className="font-display font-bold text-lg capitalize">
                    {opt}
                  </p>
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
                  isCorrect
                    ? "bg-accent/10 text-accent"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {isCorrect
                  ? t({
                      he: "🎉 נכון! מעולה!",
                      ar: "🎉 صحيح! ممتاز!",
                      en: "🎉 Correct! Excellent!",
                    })
                  : `${t({ he: "התשובה:", ar: "الإجابة:", en: "Answer:" })} "${current.answer}"`}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </GameSceneShell>
  );
};

export default SentenceGame;
