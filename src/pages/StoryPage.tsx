import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Volume2,
  Trophy,
  Star,
} from "lucide-react";
import {
  generateStory,
  loadStoryProgress,
  saveStoryProgress,
  markStoryComplete,
} from "@/lib/storyEngine";
import type { Story, StoryTheme, StoryActivity } from "@/lib/storyEngine";
import { useLanguage } from "@/lib/i18n";
import type { Language } from "@/lib/i18n";
import { dispatchCharacterEvent } from "@/lib/characterStore";
import type { CharacterMood } from "@/lib/characterStore";
import CharacterProxy from "@/components/character/CharacterProxy";
import GameShell from "@/components/GameShell";
import {
  playCorrectSound,
  playWrongSound,
  playVictoryFanfare,
  speakEnglish,
} from "@/lib/sounds";
import { updateDailyProgress } from "@/lib/xp";
import Confetti from "@/components/Confetti";

// ─── Theme metadata ───────────────────────────────────────────────────────────

const THEMES: { id: StoryTheme; emoji: string; label: Record<Language, string> }[] = [
  { id: "animals",    emoji: "🐾",  label: { en: "Animals",    he: "חיות",     ar: "حيوانات" } },
  { id: "school",     emoji: "📚",  label: { en: "School",     he: "בית ספר",  ar: "مدرسة"   } },
  { id: "home",       emoji: "🏠",  label: { en: "Home",       he: "בית",      ar: "بيت"      } },
  { id: "nature",     emoji: "🌿",  label: { en: "Nature",     he: "טבע",      ar: "طبيعة"   } },
  { id: "food",       emoji: "🍎",  label: { en: "Food",       he: "אוכל",     ar: "طعام"    } },
  { id: "adventure",  emoji: "🗺️", label: { en: "Adventure",  he: "הרפתקה",   ar: "مغامرة"  } },
  { id: "friendship", emoji: "💝",  label: { en: "Friendship", he: "חברות",    ar: "صداقة"   } },
];

// ─── Character action → mood mapping ─────────────────────────────────────────

type SceneCharAction = NonNullable<ReturnType<typeof generateStory>["scenes"][number]["characterAction"]>;

const actionToMood = (action: SceneCharAction): CharacterMood => {
  const map: Record<SceneCharAction, CharacterMood> = {
    idle:      "idle",
    wave:      "wave",
    celebrate: "celebrate",
    point:     "point",
    think:     "think",
  };
  return map[action] ?? "idle";
};

// ─── Page phase ───────────────────────────────────────────────────────────────

type Phase = "select" | "reading" | "reward";

// ─── Activity block ───────────────────────────────────────────────────────────

interface ActivityBlockProps {
  activity: StoryActivity;
  lang: Language;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  spellInput: string;
  onSpellChange: (v: string) => void;
  onAnswer: (answer: string) => void;
  onRepeatDone: () => void;
  onSpellSubmit: () => void;
  t: (key: string) => string;
}

const ActivityBlock = ({
  activity,
  lang,
  selectedAnswer,
  isCorrect,
  spellInput,
  onSpellChange,
  onAnswer,
  onRepeatDone,
  onSpellSubmit,
  t,
}: ActivityBlockProps) => {
  const prompt = activity.scaffold[lang] || activity.prompt;
  const isMultiChoice =
    activity.type === "pick_word" ||
    activity.type === "choose_answer" ||
    activity.type === "match" ||
    activity.type === "build_sentence";

  return (
    <div className="bg-indigo-50 rounded-3xl p-4 mb-4 border border-indigo-100">
      <p className="text-sm font-bold text-indigo-600 mb-3">{prompt}</p>

      {/* ── Multi-choice (pick_word / choose_answer / match / build_sentence) ── */}
      {isMultiChoice && activity.options && (
        <div className="grid grid-cols-2 gap-3">
          {activity.options.map((option) => {
            const isSelected = selectedAnswer === option;
            const correct   = isSelected && isCorrect === true;
            const wrong     = isSelected && isCorrect === false;
            return (
              <motion.button
                key={option}
                onClick={() => onAnswer(option)}
                disabled={selectedAnswer !== null && !wrong}
                whileTap={{ scale: 0.88 }}
                animate={
                  correct ? { scale: [1, 1.18, 1] } :
                  wrong   ? { x: [-6, 6, -6, 6, 0] } : {}
                }
                transition={{ duration: 0.35 }}
                className={[
                  "py-3 px-2 rounded-2xl font-bold text-base shadow-sm border-2 transition-colors",
                  "flex items-center justify-center gap-1.5 min-h-[52px]",
                  correct
                    ? "bg-emerald-100 border-emerald-400 text-emerald-700"
                    : wrong
                    ? "bg-red-100 border-red-400 text-red-600"
                    : "bg-white border-indigo-200 text-gray-700 hover:border-indigo-400",
                ].join(" ")}
              >
                {correct && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                {wrong   && <XCircle      className="w-4 h-4 flex-shrink-0" />}
                <span className="truncate">{option}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* ── Repeat ── */}
      {activity.type === "repeat" && (
        <div className="flex flex-col items-center gap-4">
          <div className="text-3xl font-extrabold text-indigo-700 py-3 px-6 bg-white rounded-2xl shadow tracking-wide">
            {activity.answer}
          </div>
          <button
            onClick={() => speakEnglish(activity.answer)}
            className="flex items-center gap-2 text-indigo-600 bg-white px-4 py-2 rounded-xl shadow border border-indigo-200 hover:bg-indigo-50 transition-colors"
          >
            <Volume2 className="w-5 h-5" />
            {lang === "he" ? "השמע" : lang === "ar" ? "استمع" : "Listen"}
          </button>
          <button
            onClick={onRepeatDone}
            className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow transition-colors"
          >
            {lang === "he" ? "!עשיתי" : lang === "ar" ? "!تمت" : "Done! ✓"}
          </button>
        </div>
      )}

      {/* ── Spell ── */}
      {activity.type === "spell" && (
        <div className="flex flex-col gap-3">
          <p className="text-center text-xs text-gray-400">
            {activity.answer.split("").map((_, i) => (
              <span key={i} className="mx-0.5 font-mono text-lg text-indigo-300">_</span>
            ))}
          </p>
          <input
            type="text"
            value={spellInput}
            onChange={(e) => onSpellChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSpellSubmit()}
            placeholder={lang === "he" ? "...כתוב כאן" : lang === "ar" ? "...اكتب هنا" : "Type here..."}
            className={[
              "w-full py-3 px-4 rounded-2xl border-2 text-center text-xl font-bold tracking-widest",
              "focus:outline-none transition-colors",
              isCorrect === false && selectedAnswer !== null
                ? "border-red-400 bg-red-50"
                : "border-indigo-200 focus:border-indigo-500",
            ].join(" ")}
            dir="ltr"
            autoComplete="off"
            autoCapitalize="none"
          />
          {isCorrect === false && selectedAnswer !== null && (
            <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
              <XCircle className="w-4 h-4" />
              {t("story.wrong")}
            </div>
          )}
          <button
            onClick={onSpellSubmit}
            disabled={spellInput.trim().length === 0}
            className="py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white font-bold shadow transition-colors"
          >
            {t("scramble.check") || "Check ✓"}
          </button>
        </div>
      )}
    </div>
  );
};

// ─── StoryPage ────────────────────────────────────────────────────────────────

const StoryPage = () => {
  const { t, lang, dir } = useLanguage();
  const navigate = useNavigate();

  const [phase, setPhase]                   = useState<Phase>("select");
  const [story, setStory]                   = useState<Story | null>(null);
  const [currentSceneIndex, setSceneIndex]  = useState(0);
  const [activityDone, setActivityDone]     = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect]           = useState<boolean | null>(null);
  const [characterMood, setCharacterMood]   = useState<CharacterMood>("idle");
  const [spellInput, setSpellInput]         = useState("");
  const [showConfetti, setShowConfetti]     = useState(false);

  // Restore in-progress story on mount
  useEffect(() => {
    const progress = loadStoryProgress();
    if (!progress.currentStoryId) return;

    // id format: "story-{goal}-{ageGroup}-{theme}-{sessionIndex}"
    // ageGroup may contain a hyphen (e.g. "4-6"), so parse from both ends:
    //   parts[0]                  = "story"
    //   parts[1]                  = goal
    //   parts[parts.length - 2]   = theme
    //   parts[parts.length - 1]   = sessionIndex
    //   parts[2 .. length-3]      = ageGroup segments
    const parts = progress.currentStoryId.split("-");
    if (parts.length < 5) return;

    const goal        = parts[1];
    const sessionIdx  = parseInt(parts[parts.length - 1], 10);
    const theme       = parts[parts.length - 2] as StoryTheme | undefined;
    const ageGroup    = parts.slice(2, parts.length - 2).join("-");

    if (!theme || !THEMES.some((th) => th.id === theme)) return;

    const restored = generateStory(
      goal as Parameters<typeof generateStory>[0],
      ageGroup as Parameters<typeof generateStory>[1],
      theme,
      isNaN(sessionIdx) ? 0 : sessionIdx,
    );
    if (restored.id === progress.currentStoryId) {
      setStory(restored);
      setSceneIndex(progress.currentSceneIndex ?? 0);
      setPhase("reading");
    }
  }, []);

  // Dispatch character event whenever scene changes
  useEffect(() => {
    if (!story || phase !== "reading") return;
    const scene = story.scenes[currentSceneIndex];
    const action = (scene.characterAction ?? "idle") as SceneCharAction;
    setCharacterMood(actionToMood(action));
    if (action === "wave" || action === "celebrate" || action === "idle") {
      dispatchCharacterEvent({ type: action });
    } else if (action === "point") {
      dispatchCharacterEvent({ type: "hint" });
    }
  }, [currentSceneIndex, story, phase]);

  // ── Theme selection ──────────────────────────────────────────────────────

  const handleThemeSelect = useCallback((theme: StoryTheme) => {
    const newStory = generateStory("vocabulary", "4-6", theme, 0);
    setStory(newStory);
    setSceneIndex(0);
    setActivityDone(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setSpellInput("");
    setPhase("reading");
    saveStoryProgress({
      ...loadStoryProgress(),
      currentStoryId: newStory.id,
      currentSceneIndex: 0,
    });
  }, []);

  // ── Activity answer ──────────────────────────────────────────────────────

  const handleAnswer = useCallback(
    (answer: string) => {
      if (!story || selectedAnswer !== null) return;
      const activity = story.scenes[currentSceneIndex].activity;
      if (!activity) return;

      setSelectedAnswer(answer);
      const correct =
        answer.toLowerCase().trim() === activity.answer.toLowerCase().trim();
      setIsCorrect(correct);

      if (correct) {
        playCorrectSound();
        dispatchCharacterEvent({ type: "correct" });
        setCharacterMood("celebrate");
        setTimeout(() => {
          setActivityDone(true);
          setCharacterMood("idle");
        }, 900);
      } else {
        playWrongSound();
        dispatchCharacterEvent({ type: "wrong" });
        setCharacterMood("sad");
        setTimeout(() => {
          setSelectedAnswer(null);
          setIsCorrect(null);
          setSpellInput("");
          setCharacterMood("idle");
        }, 1200);
      }
    },
    [story, currentSceneIndex, selectedAnswer]
  );

  const handleRepeatDone = useCallback(() => setActivityDone(true), []);

  const handleSpellSubmit = useCallback(() => {
    handleAnswer(spellInput.trim());
  }, [spellInput, handleAnswer]);

  // ── Advance scene ────────────────────────────────────────────────────────

  const handleNext = useCallback(() => {
    if (!story) return;

    if (currentSceneIndex < story.scenes.length - 1) {
      const next = currentSceneIndex + 1;
      setSceneIndex(next);
      setActivityDone(false);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setSpellInput("");
      saveStoryProgress({ ...loadStoryProgress(), currentSceneIndex: next });
    } else {
      markStoryComplete(story.id);
      updateDailyProgress("story");
      playVictoryFanfare();
      dispatchCharacterEvent({ type: "level_up" });
      setShowConfetti(true);
      setPhase("reward");
    }
  }, [story, currentSceneIndex]);

  // ── Can advance? ─────────────────────────────────────────────────────────

  const canAdvance = useMemo(() => {
    if (!story) return false;
    const scene = story.scenes[currentSceneIndex];
    return !scene.activity || activityDone;
  }, [story, currentSceneIndex, activityDone]);

  const currentScene = story?.scenes[currentSceneIndex] ?? null;

  // ════════════════════════════════════════════════════════════════════════
  // RENDER: Theme selection
  // ════════════════════════════════════════════════════════════════════════

  if (phase === "select") {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-violet-100 via-blue-50 to-emerald-50 flex flex-col"
        dir={dir}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 pt-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white/80 hover:bg-white shadow-sm text-violet-700 transition-colors"
            aria-label="Back"
          >
            ←
          </button>
          <BookOpen className="w-6 h-6 text-violet-600" />
          <h1 className="text-2xl font-extrabold text-violet-800">{t("story.title")}</h1>
        </div>

        <p className="text-center text-gray-500 text-sm mb-4 px-4">{t("story.subtitle")}</p>

        <div className="flex justify-center mb-6">
          <CharacterProxy mood="wave" size="md" />
        </div>

        {/* Theme grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 px-4 pb-8 max-w-lg mx-auto w-full">
          {THEMES.map((theme) => (
            <motion.button
              key={theme.id}
              onClick={() => handleThemeSelect(theme.id)}
              whileHover={{ scale: 1.06, y: -4 }}
              whileTap={{ scale: 0.93 }}
              className={[
                "flex flex-col items-center gap-2 p-5 rounded-3xl bg-white",
                "shadow-md border-2 border-transparent hover:border-violet-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
                "transition-colors",
              ].join(" ")}
            >
              <span className="text-4xl">{theme.emoji}</span>
              <span className="font-bold text-sm text-gray-700">{theme.label[lang]}</span>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // RENDER: Reward screen
  // ════════════════════════════════════════════════════════════════════════

  if (phase === "reward" && story) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-50 to-purple-100 flex flex-col items-center justify-center p-6"
        dir={dir}
      >
        <Confetti show={showConfetti} />

        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="flex flex-col items-center gap-6 text-center max-w-sm w-full"
        >
          <Trophy className="w-16 h-16 text-yellow-500" />

          <CharacterProxy mood="celebrate" size="lg" speech="🏆" />

          <h2 className="text-2xl font-extrabold text-purple-800 leading-snug px-2">
            {story.rewardMessage[lang]}
          </h2>

          {/* Animated 3-star rating */}
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 16,
                  delay: 0.5 + i * 0.22,
                }}
              >
                <Star className="w-12 h-12 text-yellow-400 fill-yellow-400 drop-shadow" />
              </motion.div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 w-full mt-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setPhase("select");
                setStory(null);
                setSceneIndex(0);
                setActivityDone(false);
                setSelectedAnswer(null);
                setIsCorrect(null);
                setSpellInput("");
                setShowConfetti(false);
              }}
              className="flex-1 py-4 rounded-3xl bg-white border-2 border-purple-300 text-purple-700 font-bold text-base shadow hover:bg-purple-50 transition-colors"
            >
              📖&nbsp;{lang === "he" ? "שחק שוב" : lang === "ar" ? "العب مرة أخرى" : "Play Again"}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex-1 py-4 rounded-3xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-base shadow transition-colors"
            >
              🏠&nbsp;{lang === "he" ? "חזרה" : lang === "ar" ? "رجوع" : "Back"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // RENDER: Story reading
  // ════════════════════════════════════════════════════════════════════════

  if (!story || !currentScene) return null;

  const isLastScene = currentSceneIndex === story.scenes.length - 1;

  return (
    <GameShell
      title={story.title}
      totalSteps={story.scenes.length}
      currentStep={currentSceneIndex}
      characterMood={characterMood}
      hint={currentScene.activity?.prompt}
    >
      <div
        className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 pb-24"
        dir={dir}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSceneIndex}
            initial={{ x: dir === "rtl" ? -80 : 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: dir === "rtl" ? 80 : -80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            className="px-4 pt-6 max-w-lg mx-auto"
          >
            {/* Scene counter */}
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-indigo-400">
              <BookOpen className="w-4 h-4" />
              <span>
                {t("story.scene")} {currentSceneIndex + 1} / {story.scenes.length}
              </span>
            </div>

            {/* Speech bubble */}
            <div className="relative bg-white rounded-3xl shadow-lg border-2 border-indigo-100 p-5 mb-4">
              <p className="text-xl font-bold text-gray-800 leading-relaxed">
                {currentScene.text}
              </p>

              {/* Speak button */}
              <button
                onClick={() => speakEnglish(currentScene.text)}
                className="mt-3 flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-600 font-medium transition-colors"
                aria-label="Hear the text"
              >
                <Volume2 className="w-4 h-4" />
                {lang === "he" ? "השמע" : lang === "ar" ? "استمع" : "Listen"}
              </button>

              {/* Scaffold hint */}
              {currentScene.hint && (
                <p className="mt-2 text-sm text-gray-400 italic">
                  {currentScene.hint[lang]}
                </p>
              )}

              {/* Bubble tail */}
              <div className="absolute -bottom-3 start-8 w-5 h-5 bg-white border-b-2 border-e-2 border-indigo-100 rotate-45" />
            </div>

            {/* Activity */}
            <AnimatePresence>
              {currentScene.activity && !activityDone && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <ActivityBlock
                    activity={currentScene.activity}
                    lang={lang}
                    selectedAnswer={selectedAnswer}
                    isCorrect={isCorrect}
                    spellInput={spellInput}
                    onSpellChange={setSpellInput}
                    onAnswer={handleAnswer}
                    onRepeatDone={handleRepeatDone}
                    onSpellSubmit={handleSpellSubmit}
                    t={t}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Correct answer feedback */}
            <AnimatePresence>
              {activityDone && currentScene.activity && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl p-3 mb-4"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="font-bold text-emerald-700">{t("story.correct")}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next / Finish button */}
            <AnimatePresence>
              {canAdvance && (
                <motion.button
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className={[
                    "w-full py-4 rounded-3xl font-extrabold text-lg shadow-lg",
                    "flex items-center justify-center gap-2 mt-2 transition-colors",
                    isLastScene
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white",
                  ].join(" ")}
                >
                  {isLastScene ? (
                    <>
                      <Trophy className="w-5 h-5" />
                      {t("story.finish")}
                    </>
                  ) : (
                    <>
                      {t("story.next")}
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </GameShell>
  );
};

export default StoryPage;
