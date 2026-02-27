import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { dispatchCharacterEvent } from "@/lib/characterStore";
import { playClickSound } from "@/lib/sounds";
import {
  STORIES,
  getStoryById,
  checkAnswer,
  getStoryProgress,
  saveStoryProgress,
  type Story,
  type StoryBeat,
  type StoryActivity,
} from "@/lib/storyEngine";
import Interactive3DMascot from "@/components/Interactive3DMascot";
import { ArrowLeft, ArrowRight, BookOpen, Star, Check, RotateCcw } from "lucide-react";

// ---------------------------------------------------------------------------
// Activity components
// ---------------------------------------------------------------------------

interface PickActivityProps {
  activity: StoryActivity;
  onCorrect: () => void;
  onWrong: () => void;
}

const PickActivity = ({ activity, onCorrect, onWrong }: PickActivityProps) => {
  const { lang, dir } = useLanguage();
  const [selected, setSelected] = useState<string | null>(null);

  const handle = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    if (checkAnswer(activity, opt)) {
      dispatchCharacterEvent({ type: "correct" });
      setTimeout(onCorrect, 800);
    } else {
      dispatchCharacterEvent({ type: "wrong" });
      setTimeout(onWrong, 800);
    }
  };

  return (
    <div dir={dir}>
      <p className="font-display font-bold text-sm text-center mb-4 text-foreground">
        {activity.prompt[lang]}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {(activity.options || []).map((opt) => {
          const isCorrect = selected === opt && checkAnswer(activity, opt);
          const isWrong = selected === opt && !checkAnswer(activity, opt);
          return (
            <motion.button
              key={opt}
              onClick={() => handle(opt)}
              whileHover={!selected ? { scale: 1.04 } : {}}
              whileTap={!selected ? { scale: 0.97 } : {}}
              className="py-3 px-4 rounded-2xl font-display font-semibold text-sm transition-all"
              style={{
                background: isCorrect
                  ? "hsl(var(--grass) / 0.15)"
                  : isWrong
                  ? "hsl(var(--destructive) / 0.1)"
                  : "hsl(var(--muted))",
                border: `2px solid ${
                  isCorrect
                    ? "hsl(var(--grass))"
                    : isWrong
                    ? "hsl(var(--destructive))"
                    : "hsl(var(--border))"
                }`,
                color: "hsl(var(--foreground))",
              }}
            >
              {isCorrect ? "✅ " : isWrong ? "❌ " : ""}{opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------

interface SpellActivityProps {
  activity: StoryActivity;
  onCorrect: () => void;
  onWrong: () => void;
}

const SpellActivity = ({ activity, onCorrect, onWrong }: SpellActivityProps) => {
  const { lang, dir } = useLanguage();
  const word = activity.wordToSpell || activity.answer;
  const letters = word.split("").sort(() => Math.random() - 0.5);
  const [selected, setSelected] = useState<string[]>([]);
  const [remaining, setRemaining] = useState<Array<{ ch: string; id: number }>>(
    letters.map((ch, i) => ({ ch, id: i }))
  );
  const [submitted, setSubmitted] = useState(false);

  const pickLetter = (letter: { ch: string; id: number }) => {
    if (submitted) return;
    setSelected((s) => [...s, letter.ch]);
    setRemaining((r) => r.filter((l) => l.id !== letter.id));
  };

  const removeLetter = (index: number) => {
    if (submitted) return;
    const ch = selected[index];
    setSelected((s) => s.filter((_, i) => i !== index));
    setRemaining((r) => [...r, { ch, id: Date.now() + index }]);
  };

  const submit = () => {
    if (submitted) return;
    setSubmitted(true);
    const answer = selected.join("");
    if (checkAnswer(activity, answer)) {
      dispatchCharacterEvent({ type: "correct" });
      setTimeout(onCorrect, 800);
    } else {
      dispatchCharacterEvent({ type: "wrong" });
      setTimeout(onWrong, 800);
    }
  };

  const reset = () => {
    setSelected([]);
    setRemaining(letters.map((ch, i) => ({ ch, id: i })));
    setSubmitted(false);
  };

  return (
    <div dir={dir} className="text-center">
      <p className="font-display font-bold text-sm mb-3 text-foreground">
        {activity.prompt[lang]}
      </p>

      {/* Answer slots */}
      <div className="flex justify-center gap-2 mb-4 flex-wrap">
        {Array.from({ length: word.length }).map((_, i) => (
          <motion.div
            key={i}
            onClick={() => selected[i] && removeLetter(i)}
            className="w-10 h-10 rounded-xl border-2 flex items-center justify-center font-display font-bold text-lg cursor-pointer"
            style={{
              borderColor: submitted
                ? selected.join("").toUpperCase() === word.toUpperCase()
                  ? "hsl(var(--grass))"
                  : "hsl(var(--destructive))"
                : selected[i]
                ? "hsl(var(--primary))"
                : "hsl(var(--border))",
              background: selected[i] ? "hsl(var(--primary) / 0.1)" : "hsl(var(--muted) / 0.3)",
            }}
            whileHover={selected[i] && !submitted ? { scale: 1.1 } : {}}
          >
            {selected[i] || ""}
          </motion.div>
        ))}
      </div>

      {/* Letter pool */}
      <div className="flex justify-center gap-2 mb-4 flex-wrap min-h-[48px]">
        {remaining.map((letter) => (
          <motion.button
            key={letter.id}
            onClick={() => pickLetter(letter)}
            className="w-10 h-10 rounded-xl border font-display font-bold text-lg"
            style={{
              background: "hsl(var(--card))",
              border: "2px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
            }}
            whileHover={{ scale: 1.12, y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            {letter.ch}
          </motion.button>
        ))}
      </div>

      <div className="flex justify-center gap-2">
        <motion.button
          onClick={reset}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-glow flex items-center gap-1.5 text-sm text-muted-foreground"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </motion.button>
        <motion.button
          onClick={submit}
          disabled={selected.length < word.length}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-kid gradient-primary text-primary-foreground text-sm flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" /> Check
        </motion.button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Story Beat renderer
// ---------------------------------------------------------------------------

interface BeatCardProps {
  beat: StoryBeat;
  onContinue: () => void;
  isLast: boolean;
}

const BeatCard = ({ beat, onContinue, isLast }: BeatCardProps) => {
  const { lang, dir } = useLanguage();
  const [activityDone, setActivityDone] = useState(!beat.activity);
  const [activityResult, setActivityResult] = useState<"correct" | "wrong" | null>(null);

  const handleCorrect = useCallback(() => {
    setActivityResult("correct");
    setActivityDone(true);
  }, []);

  const handleWrong = useCallback(() => {
    setActivityResult("wrong");
    setActivityDone(true);
  }, []);

  // Signal mood to global character
  useEffect(() => {
    if (beat.characterMood) {
      dispatchCharacterEvent({ type: beat.characterMood as never });
    }
  }, [beat.characterMood]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="max-w-lg mx-auto"
      dir={dir}
    >
      {/* Scene emoji */}
      <div className="text-center mb-4">
        <motion.span
          className="text-5xl"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        >
          {beat.sceneEmoji}
        </motion.span>
      </div>

      {/* Narrative text */}
      <div
        className="rounded-2xl p-5 mb-5 relative"
        style={{
          background: "hsl(var(--card))",
          border: "2px solid hsl(var(--border))",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Quote marks */}
        <span
          className="absolute top-2 start-3 text-4xl font-display opacity-10 pointer-events-none"
          aria-hidden="true"
        >
          "
        </span>
        <p className="font-display text-base leading-relaxed text-foreground relative z-10 pt-2">
          {beat.text[lang]}
        </p>
      </div>

      {/* Activity */}
      {beat.activity && (
        <AnimatePresence mode="wait">
          {!activityDone ? (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl p-4 mb-4"
              style={{
                background: "hsl(var(--primary) / 0.05)",
                border: "1.5px solid hsl(var(--primary) / 0.2)",
              }}
            >
              {beat.activity.type === "pick" && (
                <PickActivity activity={beat.activity} onCorrect={handleCorrect} onWrong={handleWrong} />
              )}
              {beat.activity.type === "spell" && (
                <SpellActivity activity={beat.activity} onCorrect={handleCorrect} onWrong={handleWrong} />
              )}
              {/* match and build-sentence handled by pick for now */}
              {(beat.activity.type === "match" || beat.activity.type === "build-sentence") && (
                <PickActivity
                  activity={{
                    ...beat.activity,
                    type: "pick",
                    options: beat.activity.pairs
                      ? beat.activity.pairs.map(([w]) => w)
                      : beat.activity.sentenceWords,
                  }}
                  onCorrect={handleCorrect}
                  onWrong={handleWrong}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mb-4"
            >
              <span className="text-2xl">
                {activityResult === "correct" ? "🎉 " : "💪 "}
              </span>
              <span className="font-display font-bold text-sm text-foreground">
                {activityResult === "correct"
                  ? (lang === "he" ? "כל הכבוד!" : lang === "ar" ? "أحسنت!" : "Well done!")
                  : (lang === "he" ? "ננסה שוב בפעם הבאה!" : lang === "ar" ? "حاول مرة أخرى!" : "Try again next time!")}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Continue button */}
      {activityDone && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onContinue}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="btn-kid w-full gradient-primary text-primary-foreground flex items-center justify-center gap-2"
        >
          {isLast
            ? (lang === "he" ? "🎊 סיום!" : lang === "ar" ? "🎊 انتهى!" : "🎊 Finish!")
            : (lang === "he" ? "המשך" : lang === "ar" ? "تابع" : "Continue")}
          <ArrowRight className={`w-4 h-4 ${dir === "rtl" ? "rotate-180" : ""}`} />
        </motion.button>
      )}
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Story selection list
// ---------------------------------------------------------------------------

interface StoryListProps {
  onSelect: (story: Story) => void;
}

const StoryList = ({ onSelect }: StoryListProps) => {
  const { lang, dir } = useLanguage();

  return (
    <div dir={dir} className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <span className="text-5xl block mb-3">📖</span>
        <h1 className="font-display font-extrabold text-3xl text-foreground mb-2">
          {lang === "he" ? "סיפורים" : lang === "ar" ? "القصص" : "Story Time"}
        </h1>
        <p className="font-display text-sm text-muted-foreground">
          {lang === "he"
            ? "בחר סיפור ולמד אנגלית!"
            : lang === "ar"
            ? "اختر قصة وتعلم الإنجليزية!"
            : "Choose a story and learn English!"}
        </p>
      </div>

      <div className="space-y-3">
        {STORIES.map((story, i) => {
          const progress = getStoryProgress(story.id);
          return (
            <motion.button
              key={story.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => { playClickSound(); onSelect(story); }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full text-start rounded-2xl p-4 flex items-center gap-4"
              style={{
                background: "hsl(var(--card))",
                border: "2px solid hsl(var(--border))",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <span className="text-4xl">{story.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-base text-foreground">
                  {story.title[lang]}
                </p>
                <p className="font-display text-xs text-muted-foreground truncate">
                  {story.description[lang]}
                </p>
                {progress.completed && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-sunshine fill-sunshine" />
                    <span className="text-xs font-display text-sunshine">
                      {lang === "he" ? "הושלם!" : lang === "ar" ? "مكتمل!" : "Completed!"}
                    </span>
                  </div>
                )}
              </div>
              <ArrowRight className={`w-5 h-5 text-muted-foreground ${dir === "rtl" ? "rotate-180" : ""}`} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main StoryPage
// ---------------------------------------------------------------------------

const StoryPage = () => {
  const navigate = useNavigate();
  const { lang, dir } = useLanguage();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [beatIndex, setBeatIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Load saved progress when story is selected
  const handleSelectStory = useCallback((story: Story) => {
    const progress = getStoryProgress(story.id);
    setSelectedStory(story);
    setBeatIndex(progress.completed ? 0 : progress.beatIndex);
    setCompleted(false);
    dispatchCharacterEvent({ type: "wave" });
  }, []);

  const handleContinue = useCallback(() => {
    if (!selectedStory) return;
    playClickSound();
    const next = beatIndex + 1;
    if (next >= selectedStory.beats.length) {
      saveStoryProgress(selectedStory.id, beatIndex, true);
      setCompleted(true);
      dispatchCharacterEvent({ type: "celebrate" });
    } else {
      saveStoryProgress(selectedStory.id, next, false);
      setBeatIndex(next);
    }
  }, [selectedStory, beatIndex]);

  const handleBack = useCallback(() => {
    if (completed || !selectedStory) {
      setSelectedStory(null);
      setCompleted(false);
    } else if (beatIndex > 0) {
      setBeatIndex((b) => b - 1);
    } else {
      setSelectedStory(null);
    }
    playClickSound();
  }, [completed, selectedStory, beatIndex]);

  // Completion screen
  if (completed && selectedStory) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8" dir={dir}>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-center max-w-sm"
        >
          <Interactive3DMascot mood="celebrate" size="lg" />
          <h2 className="font-display font-extrabold text-3xl mt-4 mb-2 text-foreground">
            {lang === "he" ? "כל הכבוד!" : lang === "ar" ? "أحسنت!" : "Amazing!"}
          </h2>
          <p className="font-display text-base text-muted-foreground mb-6">
            {lang === "he"
              ? `סיימת את "${selectedStory.title.he}"! 🎉`
              : lang === "ar"
              ? `أكملت "${selectedStory.title.ar}"! 🎉`
              : `You finished "${selectedStory.title.en}"! 🎉`}
          </p>
          <div className="flex justify-center gap-3">
            <motion.button
              onClick={() => { setSelectedStory(null); setCompleted(false); }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="btn-kid gradient-primary text-primary-foreground flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              {lang === "he" ? "עוד סיפורים" : lang === "ar" ? "المزيد من القصص" : "More Stories"}
            </motion.button>
            <motion.button
              onClick={() => navigate("/")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="btn-glow flex items-center gap-2 text-foreground"
            >
              🏠
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir={dir}>
      {/* Header */}
      {selectedStory && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3"
          style={{
            background: "hsl(var(--background) / 0.92)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid hsl(var(--border))",
          }}
        >
          <motion.button
            onClick={handleBack}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}
          >
            <ArrowLeft className={`w-4 h-4 text-foreground ${dir === "rtl" ? "rotate-180" : ""}`} />
          </motion.button>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xl">{selectedStory.emoji}</span>
            <h1 className="font-display font-bold text-sm text-foreground truncate">
              {selectedStory.title[lang]}
            </h1>
          </div>
          {/* Beat progress */}
          <span className="font-display text-xs text-muted-foreground">
            {beatIndex + 1}/{selectedStory.beats.length}
          </span>
        </motion.div>
      )}

      {/* Progress bar */}
      {selectedStory && (
        <div className="h-1 bg-muted/30">
          <motion.div
            className="h-full gradient-primary"
            animate={{ width: `${((beatIndex + 1) / selectedStory.beats.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-6">
        {!selectedStory ? (
          <StoryList onSelect={handleSelectStory} />
        ) : (
          <AnimatePresence mode="wait">
            <BeatCard
              key={`${selectedStory.id}-beat-${beatIndex}`}
              beat={selectedStory.beats[beatIndex]}
              onContinue={handleContinue}
              isLast={beatIndex === selectedStory.beats.length - 1}
            />
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default StoryPage;
