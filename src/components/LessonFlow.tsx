/**
 * LessonFlow — Full-screen lesson session UI
 *
 * Renders each phase of a lesson with appropriate content,
 * progress bar, phase indicator, and transitions.
 */

import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { useLessonEngine, PHASE_INFO, type LessonPhase } from "@/lib/lessonEngine";
import { addXP } from "@/lib/xp";
import { dispatchCharacterEvent } from "@/lib/characterStore";
import { playClickSound } from "@/lib/sounds";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  ArrowLeft,
  SkipForward,
  Volume2,
  Star,
  Trophy,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  Gamepad2,
  RotateCcw,
  Home,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Phase Header
// ---------------------------------------------------------------------------

const PhaseHeader = () => {
  const { lang } = useLanguage();
  const phase = useLessonEngine((s) => s.phase);
  const info = PHASE_INFO[phase];
  const progress = useLessonEngine((s) => s.getProgress());

  return (
    <div className="w-full space-y-3">
      {/* Phase pills */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {(["warm-up", "teach", "practice", "game", "story", "review", "reward"] as LessonPhase[]).map((p) => {
          const pi = PHASE_INFO[p];
          const isActive = p === phase;
          const isPast = (["warm-up", "teach", "practice", "game", "story", "review", "reward"] as LessonPhase[]).indexOf(p) <
            (["warm-up", "teach", "practice", "game", "story", "review", "reward"] as LessonPhase[]).indexOf(phase);

          return (
            <div
              key={p}
              className={`
                flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all
                ${isActive ? "bg-primary/20 text-primary ring-2 ring-primary/30 scale-110" : ""}
                ${isPast ? "bg-muted/60 text-muted-foreground" : ""}
                ${!isActive && !isPast ? "bg-muted/30 text-muted-foreground/50" : ""}
              `}
            >
              <span>{pi.emoji}</span>
              <span className="hidden sm:inline">{pi.title[lang]}</span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <Progress value={progress.percentage} className="h-2.5" />
        <p className="text-xs text-muted-foreground text-center">
          {progress.percentage}%
        </p>
      </div>

      {/* Phase title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <span className="text-3xl">{info.emoji}</span>
          {info.title[lang]}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{info.description[lang]}</p>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Warm-up Phase
// ---------------------------------------------------------------------------

const WarmUpPhase = () => {
  const { lang } = useLanguage();
  const plan = useLessonEngine((s) => s.plan);
  const recordAnswer = useLessonEngine((s) => s.recordAnswer);
  const advancePhase = useLessonEngine((s) => s.advancePhase);
  const [index, setIndex] = useState(0);
  const [showResult, setShowResult] = useState<boolean | null>(null);

  if (!plan || plan.warmUpWords.length === 0) return null;
  const words = plan.warmUpWords;
  const current = words[index];
  if (!current) {
    advancePhase();
    return null;
  }

  const options = [current.word, ...["cat", "dog", "sun", "tree", "fish"]
    .filter(w => w !== current.word)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
  ].sort(() => Math.random() - 0.5);

  const handleAnswer = (answer: string) => {
    const correct = answer.toLowerCase() === current.word.toLowerCase();
    setShowResult(correct);
    recordAnswer(current.word, correct);
    if (correct) {
      dispatchCharacterEvent({ type: "correct" });
      playClickSound();
    } else {
      dispatchCharacterEvent({ type: "wrong" });
    }

    setTimeout(() => {
      setShowResult(null);
      if (index + 1 >= words.length) {
        advancePhase();
      } else {
        setIndex(index + 1);
      }
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="text-6xl mb-2">🧠</div>
      <h3 className="text-lg font-semibold">
        {lang === "he" ? "איזו מילה זו?" : lang === "ar" ? "ما هذه الكلمة؟" : "Which word is this?"}
      </h3>
      <div className="text-5xl py-4">{current.word.charAt(0).toUpperCase()}{current.word.slice(1)}</div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {options.map((opt) => (
          <Button
            key={opt}
            variant={showResult !== null
              ? opt.toLowerCase() === current.word.toLowerCase()
                ? "default"
                : "outline"
              : "outline"
            }
            size="lg"
            className={`text-lg py-6 transition-all ${
              showResult !== null && opt.toLowerCase() === current.word.toLowerCase()
                ? "bg-green-500/20 border-green-500 ring-2 ring-green-500/30"
                : ""
            }`}
            disabled={showResult !== null}
            onClick={() => handleAnswer(opt)}
          >
            {opt}
          </Button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        {index + 1} / {words.length}
      </p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Teach Phase
// ---------------------------------------------------------------------------

const TeachPhase = () => {
  const { lang } = useLanguage();
  const plan = useLessonEngine((s) => s.plan);
  const recordAnswer = useLessonEngine((s) => s.recordAnswer);
  const advancePhase = useLessonEngine((s) => s.advancePhase);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  if (!plan || plan.teachItems.length === 0) return null;
  const current = plan.teachItems[index];
  if (!current) {
    advancePhase();
    return null;
  }

  const translation = lang === "he" ? current.translation.he : lang === "ar" ? current.translation.ar : "";

  const handleNext = () => {
    recordAnswer(current.word, true, 3);
    dispatchCharacterEvent({ type: "correct" });
    playClickSound();

    if (index + 1 >= plan.teachItems.length) {
      advancePhase();
    } else {
      setIndex(index + 1);
      setRevealed(false);
    }
  };

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col items-center gap-6 py-4"
    >
      <div className="text-7xl mb-2">{current.emoji}</div>

      <div className="text-center space-y-2">
        <h3 className="text-4xl font-bold tracking-wide">{current.word}</h3>
        {translation && (
          <p className="text-xl text-muted-foreground">{translation}</p>
        )}
        <p className="text-sm text-muted-foreground/60">{current.category}</p>
      </div>

      {!revealed ? (
        <Button size="lg" onClick={() => setRevealed(true)} className="gap-2">
          <Volume2 className="w-5 h-5" />
          {lang === "he" ? "הצג פרטים" : lang === "ar" ? "اعرض التفاصيل" : "Show Details"}
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 text-center"
        >
          <div className="flex items-center gap-3 justify-center text-lg">
            <span className="font-mono tracking-widest text-primary">
              {current.word.split("").join(" · ")}
            </span>
          </div>
          <Button size="lg" onClick={handleNext} className="gap-2">
            {index + 1 >= plan.teachItems.length ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                {lang === "he" ? "סיום" : lang === "ar" ? "إنهاء" : "Done"}
              </>
            ) : (
              <>
                <ArrowRight className="w-5 h-5" />
                {lang === "he" ? "הבא" : lang === "ar" ? "التالي" : "Next"}
              </>
            )}
          </Button>
        </motion.div>
      )}

      <p className="text-sm text-muted-foreground">
        {index + 1} / {plan.teachItems.length}
      </p>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Practice Phase
// ---------------------------------------------------------------------------

const PracticePhase = () => {
  const { lang } = useLanguage();
  const plan = useLessonEngine((s) => s.plan);
  const recordAnswer = useLessonEngine((s) => s.recordAnswer);
  const advancePhase = useLessonEngine((s) => s.advancePhase);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState<boolean | null>(null);

  if (!plan || plan.practiceItems.length === 0) return null;
  const current = plan.practiceItems[index];
  if (!current) {
    advancePhase();
    return null;
  }

  const handleAnswer = (answer: string) => {
    const correct = answer.toLowerCase() === current.correctAnswer.toLowerCase();
    setSelected(answer);
    setShowResult(correct);
    recordAnswer(current.word, correct);

    if (correct) {
      dispatchCharacterEvent({ type: "correct" });
      playClickSound();
    } else {
      dispatchCharacterEvent({ type: "wrong" });
    }

    setTimeout(() => {
      setSelected(null);
      setShowResult(null);
      if (index + 1 >= plan.practiceItems.length) {
        advancePhase();
      } else {
        setIndex(index + 1);
      }
    }, 1200);
  };

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 py-4"
    >
      <div className="text-5xl">{current.emoji}</div>

      <h3 className="text-lg font-semibold text-center">
        {current.type === "pick" && (lang === "he" ? "מה המילה הנכונה?" : lang === "ar" ? "ما الكلمة الصحيحة؟" : "What's the correct word?")}
        {current.type === "spell" && (lang === "he" ? "איך מאייתים?" : lang === "ar" ? "كيف تتهجى؟" : "How do you spell it?")}
        {current.type === "translate" && (lang === "he" ? "מה התרגום?" : lang === "ar" ? "ما الترجمة؟" : "What's the translation?")}
        {current.type === "match" && (lang === "he" ? "התאם את המילה" : lang === "ar" ? "طابق الكلمة" : "Match the word")}
      </h3>

      {current.hint && (
        <p className="text-sm text-muted-foreground">{current.hint}</p>
      )}

      {current.options && (
        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
          {current.options.map((opt) => {
            const isCorrect = opt.toLowerCase() === current.correctAnswer.toLowerCase();
            const isSelected = opt === selected;

            return (
              <Button
                key={opt}
                variant="outline"
                size="lg"
                className={`text-lg py-6 transition-all ${
                  showResult !== null && isCorrect
                    ? "bg-green-500/20 border-green-500 text-green-400"
                    : showResult !== null && isSelected && !isCorrect
                    ? "bg-red-500/20 border-red-500 text-red-400"
                    : ""
                }`}
                disabled={showResult !== null}
                onClick={() => handleAnswer(opt)}
              >
                {showResult !== null && isCorrect && <CheckCircle2 className="w-4 h-4 mr-1" />}
                {showResult !== null && isSelected && !isCorrect && <XCircle className="w-4 h-4 mr-1" />}
                {opt}
              </Button>
            );
          })}
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        {index + 1} / {plan.practiceItems.length}
      </p>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Game Phase
// ---------------------------------------------------------------------------

const GamePhase = () => {
  const { lang } = useLanguage();
  const plan = useLessonEngine((s) => s.plan);
  const advancePhase = useLessonEngine((s) => s.advancePhase);
  const navigate = useNavigate();

  if (!plan?.gameRecommendation) return null;
  const game = plan.gameRecommendation;

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="text-7xl">{game.activity.emoji}</div>
      <h3 className="text-2xl font-bold">{game.activity.title[lang]}</h3>
      <p className="text-muted-foreground text-center max-w-sm">
        {game.activity.description[lang]}
      </p>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Gamepad2 className="w-4 h-4" />
        {lang === "he" ? `רמת קושי: ${game.difficulty}` : lang === "ar" ? `مستوى الصعوبة: ${game.difficulty}` : `Difficulty: ${game.difficulty}`}
      </div>
      <div className="flex gap-3">
        <Button size="lg" onClick={() => navigate(game.activity.path)} className="gap-2">
          <Gamepad2 className="w-5 h-5" />
          {lang === "he" ? "שחק!" : lang === "ar" ? "العب!" : "Play!"}
        </Button>
        <Button size="lg" variant="outline" onClick={advancePhase} className="gap-2">
          <SkipForward className="w-5 h-5" />
          {lang === "he" ? "דלג" : lang === "ar" ? "تخطّ" : "Skip"}
        </Button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Story Phase
// ---------------------------------------------------------------------------

const StoryPhase = () => {
  const { lang } = useLanguage();
  const advancePhase = useLessonEngine((s) => s.advancePhase);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="text-7xl">📖</div>
      <h3 className="text-2xl font-bold">
        {lang === "he" ? "שעת סיפור!" : lang === "ar" ? "وقت القصة!" : "Story Time!"}
      </h3>
      <p className="text-muted-foreground text-center max-w-sm">
        {lang === "he" ? "למדו מילים חדשות דרך סיפור אינטראקטיבי" : lang === "ar" ? "تعلموا كلمات جديدة من خلال قصة تفاعلية" : "Learn new words through an interactive story"}
      </p>
      <div className="flex gap-3">
        <Button size="lg" onClick={() => navigate("/story")} className="gap-2">
          <BookOpen className="w-5 h-5" />
          {lang === "he" ? "קרא סיפור" : lang === "ar" ? "اقرأ قصة" : "Read Story"}
        </Button>
        <Button size="lg" variant="outline" onClick={advancePhase} className="gap-2">
          <SkipForward className="w-5 h-5" />
          {lang === "he" ? "דלג" : lang === "ar" ? "تخطّ" : "Skip"}
        </Button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Review Phase
// ---------------------------------------------------------------------------

const ReviewPhase = () => {
  const { lang } = useLanguage();
  const plan = useLessonEngine((s) => s.plan);
  const recordAnswer = useLessonEngine((s) => s.recordAnswer);
  const advancePhase = useLessonEngine((s) => s.advancePhase);
  const [index, setIndex] = useState(0);
  const [showResult, setShowResult] = useState<boolean | null>(null);

  if (!plan || plan.reviewItems.length === 0) return null;
  const current = plan.reviewItems[index];
  if (!current) {
    advancePhase();
    return null;
  }

  const handleAnswer = (answer: string) => {
    const correct = answer.toLowerCase() === current.correctAnswer.toLowerCase();
    setShowResult(correct);
    recordAnswer(current.word, correct);

    if (correct) {
      dispatchCharacterEvent({ type: "correct" });
      playClickSound();
    } else {
      dispatchCharacterEvent({ type: "wrong" });
    }

    setTimeout(() => {
      setShowResult(null);
      if (index + 1 >= plan.reviewItems.length) {
        advancePhase();
      } else {
        setIndex(index + 1);
      }
    }, 1200);
  };

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 py-4"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <RotateCcw className="w-4 h-4" />
        {lang === "he"
          ? `קופסה ${current.sr.box}/5`
          : lang === "ar"
          ? `صندوق ${current.sr.box}/5`
          : `Box ${current.sr.box}/5`}
      </div>

      <div className="text-5xl">{current.emoji}</div>

      <h3 className="text-lg font-semibold">
        {lang === "he" ? "מה המילה?" : lang === "ar" ? "ما الكلمة؟" : "What's the word?"}
      </h3>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {current.options.map((opt) => (
          <Button
            key={opt}
            variant="outline"
            size="lg"
            className={`text-lg py-6 transition-all ${
              showResult !== null && opt.toLowerCase() === current.correctAnswer.toLowerCase()
                ? "bg-green-500/20 border-green-500"
                : ""
            }`}
            disabled={showResult !== null}
            onClick={() => handleAnswer(opt)}
          >
            {opt}
          </Button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        {index + 1} / {plan.reviewItems.length}
      </p>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Reward Phase
// ---------------------------------------------------------------------------

const RewardPhase = () => {
  const { lang } = useLanguage();
  const reward = useLessonEngine((s) => s.reward);
  const endLesson = useLessonEngine((s) => s.endLesson);
  const [claimed, setClaimed] = useState(false);

  const handleClaim = useCallback(() => {
    if (claimed || !reward) return;
    setClaimed(true);
    addXP(reward.xpEarned);
    dispatchCharacterEvent({ type: "celebrate" });
    playClickSound();
  }, [claimed, reward]);

  if (!reward) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 py-6"
    >
      <div className="text-7xl">🏆</div>

      <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
        {lang === "he" ? "כל הכבוד!" : lang === "ar" ? "أحسنت!" : "Amazing!"}
      </h3>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        <div className="bg-muted/30 rounded-xl p-4 text-center">
          <Sparkles className="w-6 h-6 mx-auto mb-1 text-yellow-400" />
          <p className="text-2xl font-bold">{reward.xpEarned}</p>
          <p className="text-xs text-muted-foreground">XP</p>
        </div>
        <div className="bg-muted/30 rounded-xl p-4 text-center">
          <Star className="w-6 h-6 mx-auto mb-1 text-blue-400" />
          <p className="text-2xl font-bold">{reward.accuracy}%</p>
          <p className="text-xs text-muted-foreground">
            {lang === "he" ? "דיוק" : lang === "ar" ? "دقة" : "Accuracy"}
          </p>
        </div>
        <div className="bg-muted/30 rounded-xl p-4 text-center">
          <BookOpen className="w-6 h-6 mx-auto mb-1 text-green-400" />
          <p className="text-2xl font-bold">{reward.wordsLearned}</p>
          <p className="text-xs text-muted-foreground">
            {lang === "he" ? "מילים חדשות" : lang === "ar" ? "كلمات جديدة" : "New Words"}
          </p>
        </div>
        <div className="bg-muted/30 rounded-xl p-4 text-center">
          <RotateCcw className="w-6 h-6 mx-auto mb-1 text-purple-400" />
          <p className="text-2xl font-bold">{reward.wordsReviewed}</p>
          <p className="text-xs text-muted-foreground">
            {lang === "he" ? "חזרות" : lang === "ar" ? "مراجعات" : "Reviewed"}
          </p>
        </div>
      </div>

      {reward.perfectBonus && (
        <div className="flex items-center gap-2 text-yellow-400 font-semibold">
          <Trophy className="w-5 h-5" />
          {lang === "he" ? "ציון מושלם! +25 XP" : lang === "ar" ? "نتيجة مثالية! +25 XP" : "Perfect Score! +25 XP"}
        </div>
      )}

      {reward.newMasteries.length > 0 && (
        <div className="text-center">
          <p className="text-sm font-semibold text-green-400 mb-1">
            {lang === "he" ? "מילים שנשלטו:" : lang === "ar" ? "كلمات أُتقنت:" : "Words Mastered:"}
          </p>
          <div className="flex gap-2 flex-wrap justify-center">
            {reward.newMasteries.map((w) => (
              <span key={w} className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-sm">
                {w}
              </span>
            ))}
          </div>
        </div>
      )}

      {!claimed ? (
        <Button size="lg" onClick={handleClaim} className="gap-2 text-lg px-8">
          <Sparkles className="w-5 h-5" />
          {lang === "he" ? "קבל פרס!" : lang === "ar" ? "احصل على المكافأة!" : "Claim Reward!"}
        </Button>
      ) : (
        <Button size="lg" onClick={endLesson} className="gap-2">
          <Home className="w-5 h-5" />
          {lang === "he" ? "חזרה לדף הבית" : lang === "ar" ? "العودة للرئيسية" : "Back Home"}
        </Button>
      )}
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Phase Router
// ---------------------------------------------------------------------------

const PHASE_COMPONENTS: Record<LessonPhase, React.FC> = {
  "warm-up": WarmUpPhase,
  teach: TeachPhase,
  practice: PracticePhase,
  game: GamePhase,
  story: StoryPhase,
  review: ReviewPhase,
  reward: RewardPhase,
  complete: () => null,
};

// ---------------------------------------------------------------------------
// Main LessonFlow Component
// ---------------------------------------------------------------------------

const LessonFlow = () => {
  const { lang } = useLanguage();
  const active = useLessonEngine((s) => s.active);
  const phase = useLessonEngine((s) => s.phase);
  const plan = useLessonEngine((s) => s.plan);
  const startLesson = useLessonEngine((s) => s.startLesson);
  const resetLesson = useLessonEngine((s) => s.resetLesson);
  const skipPhase = useLessonEngine((s) => s.skipPhase);

  if (!active || !plan) {
    // Lesson start screen
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <div className="text-7xl">🦉</div>
        <h2 className="text-3xl font-bold text-center">
          {lang === "he" ? "מוכנים לשיעור?" : lang === "ar" ? "جاهزون للدرس؟" : "Ready for a Lesson?"}
        </h2>
        <p className="text-muted-foreground text-center max-w-md">
          {lang === "he"
            ? "שיעור מותאם אישית עם חימום, לימוד, תרגול, משחק, סיפור, חזרה ופרס!"
            : lang === "ar"
            ? "درس مخصص مع إحماء، تعليم، تمرين، لعبة، قصة، مراجعة ومكافأة!"
            : "A personalized lesson with warm-up, teach, practice, game, story, review & reward!"}
        </p>
        <Button size="lg" onClick={() => startLesson()} className="gap-2 text-lg px-8">
          <Sparkles className="w-5 h-5" />
          {lang === "he" ? "התחל שיעור!" : lang === "ar" ? "ابدأ الدرس!" : "Start Lesson!"}
        </Button>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="text-7xl">✅</div>
        <h2 className="text-3xl font-bold">
          {lang === "he" ? "השיעור הושלם!" : lang === "ar" ? "الدرس مكتمل!" : "Lesson Complete!"}
        </h2>
        <div className="flex gap-3">
          <Button onClick={() => startLesson()} className="gap-2">
            <RotateCcw className="w-5 h-5" />
            {lang === "he" ? "שיעור חדש" : lang === "ar" ? "درس جديد" : "New Lesson"}
          </Button>
          <Button variant="outline" onClick={resetLesson} className="gap-2">
            <Home className="w-5 h-5" />
            {lang === "he" ? "דף הבית" : lang === "ar" ? "الرئيسية" : "Home"}
          </Button>
        </div>
      </div>
    );
  }

  const PhaseComponent = PHASE_COMPONENTS[phase];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <PhaseHeader />

      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <PhaseComponent />
        </motion.div>
      </AnimatePresence>

      {/* Skip button (except reward) */}
      {phase !== "reward" && (
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={skipPhase} className="gap-1 text-muted-foreground">
            <SkipForward className="w-4 h-4" />
            {lang === "he" ? "דלג" : lang === "ar" ? "تخطّ" : "Skip"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LessonFlow;
