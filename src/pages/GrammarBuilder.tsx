import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameShell from "@/components/GameShell";
import Confetti from "@/components/Confetti";
import { useLanguage } from "@/lib/i18n";
import { dispatchCharacterEvent } from "@/lib/characterStore";
import { speakEnglish, playCorrectSound, playWrongSound, playVictoryFanfare, playClickSound } from "@/lib/sounds";
import { updateDailyProgress } from "@/lib/xp";
import { useNavigate } from "react-router-dom";

// ─── Exercise Data ──────────────────────────────────────────────────────────
interface Exercise {
  id: string;
  tier: 1 | 2 | 3;
  words: string[];
  correct: string[];
  translation: { he: string; ar: string; en: string };
  tip?: { he: string; ar: string; en: string };
}

const EXERCISES: Exercise[] = [
  { id: "g1", tier: 1, words: ["I", "am", "happy"], correct: ["I", "am", "happy"], translation: { he: "אני שמח", ar: "أنا سعيد", en: "I am happy" }, tip: { he: "Subject + am/is/are + adjective", ar: "الفاعل + am/is/are + صفة", en: "Subject + am/is/are + adjective" } },
  { id: "g2", tier: 1, words: ["She", "is", "tall"], correct: ["She", "is", "tall"], translation: { he: "היא גבוהה", ar: "هي طويلة", en: "She is tall" } },
  { id: "g3", tier: 1, words: ["The", "cat", "is", "big"], correct: ["The", "cat", "is", "big"], translation: { he: "החתול גדול", ar: "القطة كبيرة", en: "The cat is big" } },
  { id: "g4", tier: 1, words: ["We", "are", "friends"], correct: ["We", "are", "friends"], translation: { he: "אנחנו חברים", ar: "نحن أصدقاء", en: "We are friends" } },
  { id: "g5", tier: 1, words: ["The", "dog", "is", "small"], correct: ["The", "dog", "is", "small"], translation: { he: "הכלב קטן", ar: "الكلب صغير", en: "The dog is small" } },
  { id: "g6", tier: 1, words: ["I", "have", "a", "book"], correct: ["I", "have", "a", "book"], translation: { he: "יש לי ספר", ar: "لدي كتاب", en: "I have a book" } },
  { id: "g7", tier: 1, words: ["They", "are", "happy"], correct: ["They", "are", "happy"], translation: { he: "הם שמחים", ar: "هم سعداء", en: "They are happy" } },
  { id: "g8", tier: 2, words: ["Is", "she", "happy", "?"], correct: ["Is", "she", "happy", "?"], translation: { he: "?האם היא שמחה", ar: "هل هي سعيدة؟", en: "Is she happy?" } },
  { id: "g9", tier: 2, words: ["He", "is", "not", "tall"], correct: ["He", "is", "not", "tall"], translation: { he: "הוא לא גבוה", ar: "هو ليس طويلاً", en: "He is not tall" } },
  { id: "g10", tier: 2, words: ["Do", "you", "like", "cats", "?"], correct: ["Do", "you", "like", "cats", "?"], translation: { he: "?אתה אוהב חתולים", ar: "هل تحب القطط؟", en: "Do you like cats?" } },
  { id: "g11", tier: 2, words: ["The", "dog", "is", "not", "small"], correct: ["The", "dog", "is", "not", "small"], translation: { he: "הכלב לא קטן", ar: "الكلب ليس صغيراً", en: "The dog is not small" } },
  { id: "g12", tier: 2, words: ["Can", "you", "help", "me", "?"], correct: ["Can", "you", "help", "me", "?"], translation: { he: "?אתה יכול לעזור לי", ar: "هل يمكنك مساعدتي؟", en: "Can you help me?" } },
  { id: "g13", tier: 3, words: ["She", "was", "tired"], correct: ["She", "was", "tired"], translation: { he: "היא הייתה עייפה", ar: "كانت متعبة", en: "She was tired" } },
  { id: "g14", tier: 3, words: ["They", "will", "play"], correct: ["They", "will", "play"], translation: { he: "הם ישחקו", ar: "سيلعبون", en: "They will play" } },
  { id: "g15", tier: 3, words: ["We", "were", "at", "school"], correct: ["We", "were", "at", "school"], translation: { he: "היינו בבית ספר", ar: "كنا في المدرسة", en: "We were at school" } },
  { id: "g16", tier: 3, words: ["I", "will", "eat", "lunch"], correct: ["I", "will", "eat", "lunch"], translation: { he: "אני אוכל צהריים", ar: "سآكل الغداء", en: "I will eat lunch" } },
];

// Shuffle helper
const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

type Tier = 1 | 2 | 3;
type CheckState = "idle" | "correct" | "wrong";

const TIER_CONFIG = {
  1: { label: "Beginner", emoji: "🌱", color: "from-green-400 to-emerald-500" },
  2: { label: "Intermediate", emoji: "🌿", color: "from-blue-400 to-cyan-500" },
  3: { label: "Advanced", emoji: "🌳", color: "from-purple-400 to-violet-500" },
} as const;

export default function GrammarBuilder() {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [bank, setBank] = useState<string[]>([]);
  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [finished, setFinished] = useState(false);

  const tierExercises = useMemo(
    () => EXERCISES.filter((e) => e.tier === selectedTier),
    [selectedTier]
  );

  const exercise = tierExercises[currentIndex];

  // Initialize bank when exercise or tier changes
  const initExercise = useCallback((ex: Exercise) => {
    setBank(shuffle(ex.words));
    setPlaced([]);
    setCheckState("idle");
    setWrongAttempts(0);
    setShowHint(false);
  }, []);

  const handleTierSelect = (tier: Tier) => {
    playClickSound();
    setSelectedTier(tier);
    setCurrentIndex(0);
    setFinished(false);
    const exercises = EXERCISES.filter((e) => e.tier === tier);
    if (exercises.length > 0) initExercise(exercises[0]);
  };

  // Place a word from bank into the drop zone
  const placeWord = (word: string, bankIndex: number) => {
    if (checkState === "correct") return;
    playClickSound();
    setBank((prev) => prev.filter((_, i) => i !== bankIndex));
    setPlaced((prev) => [...prev, word]);
    setCheckState("idle");
  };

  // Remove a word from drop zone back to bank
  const removeWord = (placedIndex: number) => {
    if (checkState === "correct") return;
    playClickSound();
    const word = placed[placedIndex];
    setPlaced((prev) => prev.filter((_, i) => i !== placedIndex));
    setBank((prev) => [...prev, word]);
    setCheckState("idle");
  };

  const handleCheck = () => {
    if (!exercise || placed.length === 0) return;
    const isCorrect = placed.join(" ") === exercise.correct.join(" ");
    if (isCorrect) {
      setCheckState("correct");
      playCorrectSound();
      dispatchCharacterEvent({ type: "correct" });
      updateDailyProgress("grammar");
    } else {
      setCheckState("wrong");
      playWrongSound();
      dispatchCharacterEvent({ type: "wrong" });
      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);
      if (newAttempts >= 2) setShowHint(true);
    }
  };

  const handleNext = () => {
    playClickSound();
    if (currentIndex + 1 >= tierExercises.length) {
      playVictoryFanfare();
      dispatchCharacterEvent({ type: "celebrate" });
      setShowConfetti(true);
      setFinished(true);
      setTimeout(() => setShowConfetti(false), 3500);
    } else {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      initExercise(tierExercises[next]);
    }
  };

  const handleSpeak = () => {
    if (exercise) speakEnglish(exercise.correct.join(" "));
  };

  const characterMood =
    checkState === "correct" ? "celebrate" : checkState === "wrong" ? "sad" : "idle";

  // ─── Tier Selection Screen ──────────────────────────────────────────────
  if (!selectedTier) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center text-indigo-700"
        >
          🏗️ Grammar Builder
        </motion.h1>
        <p className="text-lg text-gray-600 text-center">Choose your level to start building sentences!</p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          {([1, 2, 3] as Tier[]).map((tier) => (
            <motion.button
              key={tier}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleTierSelect(tier)}
              className={`bg-gradient-to-r ${TIER_CONFIG[tier].color} text-white text-xl font-bold py-5 px-6 rounded-2xl shadow-lg flex items-center gap-3`}
            >
              <span className="text-3xl">{TIER_CONFIG[tier].emoji}</span>
              <span>{TIER_CONFIG[tier].label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // ─── Finished Screen ────────────────────────────────────────────────────
  if (finished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-gradient-to-br from-yellow-50 to-orange-50">
        <Confetti show={showConfetti} />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-8xl"
        >
          🏆
        </motion.div>
        <h2 className="text-3xl font-bold text-orange-600 text-center">
          Amazing! You finished {TIER_CONFIG[selectedTier].emoji} {TIER_CONFIG[selectedTier].label}!
        </h2>
        <div className="flex gap-4 mt-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedTier(null)}
            className="bg-indigo-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg text-lg"
          >
            🔄 Play Again
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-2xl shadow-lg text-lg"
          >
            🏠 Home
          </motion.button>
        </div>
      </div>
    );
  }

  if (!exercise) return null;

  const translation = exercise.translation[lang] ?? exercise.translation.en;
  const tip = exercise.tip?.[lang] ?? exercise.tip?.en;

  return (
    <GameShell
      title="🏗️ Grammar Builder"
      totalSteps={tierExercises.length}
      currentStep={currentIndex}
      characterMood={characterMood}
    >
      <Confetti show={showConfetti} />

      <div className="max-w-xl mx-auto p-4 flex flex-col gap-6">
        {/* Tier badge */}
        <div className="flex items-center justify-between">
          <span className={`bg-gradient-to-r ${TIER_CONFIG[selectedTier].color} text-white text-sm font-bold py-1 px-3 rounded-full`}>
            {TIER_CONFIG[selectedTier].emoji} {TIER_CONFIG[selectedTier].label}
          </span>
          <button onClick={handleSpeak} className="text-2xl" aria-label="Listen">🔊</button>
        </div>

        {/* Drop zone */}
        <motion.div
          animate={
            checkState === "correct"
              ? { borderColor: "#22c55e", backgroundColor: "#f0fdf4" }
              : checkState === "wrong"
              ? { borderColor: "#ef4444", backgroundColor: "#fef2f2" }
              : { borderColor: "#a5b4fc", backgroundColor: "#f5f3ff" }
          }
          transition={{ duration: 0.3 }}
          className="min-h-[80px] rounded-2xl border-4 border-dashed p-4 flex flex-wrap gap-2 items-center"
        >
          <AnimatePresence mode="popLayout">
            {placed.length === 0 ? (
              <motion.p
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-gray-400 text-sm w-full text-center"
              >
                Tap words below to build your sentence
              </motion.p>
            ) : (
              placed.map((word, i) => (
                <motion.button
                  key={`placed-${i}-${word}`}
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeWord(i)}
                  className="bg-indigo-500 text-white font-bold py-2 px-4 rounded-xl shadow text-lg cursor-pointer"
                >
                  {word}
                </motion.button>
              ))
            )}
          </AnimatePresence>
        </motion.div>

        {/* Check feedback */}
        <AnimatePresence mode="wait">
          {checkState === "correct" && (
            <motion.div
              key="correct"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-green-600 font-bold text-center text-lg"
            >
              ✅ Correct! Well done!
            </motion.div>
          )}
          {checkState === "wrong" && (
            <motion.div
              key="wrong"
              initial={{ x: -10 }}
              animate={{ x: [0, -8, 8, -5, 5, 0] }}
              transition={{ duration: 0.4 }}
              exit={{ opacity: 0 }}
              className="text-red-500 font-bold text-center text-lg"
            >
              ❌ Try again!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Translation hint */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center"
            >
              <p className="text-yellow-800 font-semibold text-base">{translation}</p>
              {tip && <p className="text-yellow-600 text-sm mt-1">{tip}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Word bank */}
        <div className="flex flex-wrap gap-2 justify-center min-h-[60px]">
          <AnimatePresence mode="popLayout">
            {bank.map((word, i) => (
              <motion.button
                key={`bank-${i}-${word}`}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => placeWord(word, i)}
                className="bg-white border-2 border-indigo-300 text-indigo-700 font-bold py-2 px-4 rounded-xl shadow text-lg cursor-pointer hover:bg-indigo-50"
              >
                {word}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          {checkState !== "correct" ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCheck}
              disabled={placed.length === 0}
              className="bg-indigo-600 disabled:opacity-40 text-white font-bold py-3 px-8 rounded-2xl shadow-lg text-xl"
            >
              Check ✓
            </motion.button>
          ) : (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="bg-green-500 text-white font-bold py-3 px-8 rounded-2xl shadow-lg text-xl"
            >
              {currentIndex + 1 >= tierExercises.length ? "Finish 🎉" : "Next →"}
            </motion.button>
          )}
          {!showHint && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHint(true)}
              className="bg-yellow-400 text-yellow-900 font-bold py-3 px-5 rounded-2xl shadow text-lg"
            >
              💡 Hint
            </motion.button>
          )}
        </div>
      </div>
    </GameShell>
  );
}
