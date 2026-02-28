import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { useRewardsPipeline } from "@/hooks/useRewardsPipeline";
import GameSceneShell from "@/components/GameSceneShell";
import StarRating from "@/components/StarRating";
import { useAgeAdaptive } from "@/hooks/useAgeAdaptive";
import { playCorrectSound, playWrongSound, playVictoryFanfare, playClickSound, startBgMusic, stopBgMusic } from "@/lib/sounds";
import { Zap, Trophy, RotateCcw, Lightbulb } from "lucide-react";

/* ─── Pattern Types ─── */
type PatternType = "letter-sequence" | "number-sequence" | "shape-pattern" | "mirror-pattern" | "color-word" | "analogy" | "sentence-completion" | "odd-letter-out";

interface Puzzle {
  type: PatternType;
  sequence: string[];
  missingIndex: number;
  answer: string;
  options: string[];
  hint: string;
}

/* ─── Puzzle Generators (unchanged) ─── */
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const generateLetterSequence = (): Puzzle => {
  const startIdx = Math.floor(Math.random() * 20);
  const length = 5;
  const seq = Array.from({ length }, (_, i) => ALPHABET[startIdx + i]);
  const missingIndex = 1 + Math.floor(Math.random() * (length - 2));
  const answer = seq[missingIndex];
  const distractors = new Set<string>();
  while (distractors.size < 3) {
    const r = ALPHABET[Math.floor(Math.random() * 26)];
    if (r !== answer) distractors.add(r);
  }
  const options = [...distractors, answer].sort(() => Math.random() - 0.5);
  return { type: "letter-sequence", sequence: seq.map((s, i) => (i === missingIndex ? "?" : s)), missingIndex, answer, options, hint: `Think about the alphabet order starting from ${seq[0]}` };
};

const generateNumberSequence = (): Puzzle => {
  const patterns = [
    { start: Math.floor(Math.random() * 10), step: 2 + Math.floor(Math.random() * 4) },
    { start: Math.floor(Math.random() * 5), step: 3 },
    { start: 1 + Math.floor(Math.random() * 5), step: 5 },
  ];
  const p = patterns[Math.floor(Math.random() * patterns.length)];
  const length = 5;
  const seq = Array.from({ length }, (_, i) => String(p.start + i * p.step));
  const missingIndex = 1 + Math.floor(Math.random() * (length - 2));
  const answer = seq[missingIndex];
  const distractors = new Set<string>();
  while (distractors.size < 3) {
    const offset = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 3));
    const r = String(Number(answer) + offset);
    if (r !== answer) distractors.add(r);
  }
  const options = [...distractors, answer].sort(() => Math.random() - 0.5);
  return { type: "number-sequence", sequence: seq.map((s, i) => (i === missingIndex ? "?" : s)), missingIndex, answer, options, hint: `Each number increases by ${p.step}` };
};

const SHAPES = ["●", "■", "▲", "◆", "★", "⬟", "⬡"];

const generateShapePattern = (): Puzzle => {
  const patternLen = 2 + Math.floor(Math.random() * 2);
  const pattern = Array.from({ length: patternLen }, () => SHAPES[Math.floor(Math.random() * SHAPES.length)]);
  const fullLen = patternLen * 2 + Math.floor(Math.random() * 2);
  const seq = Array.from({ length: fullLen }, (_, i) => pattern[i % patternLen]);
  const missingIndex = patternLen + Math.floor(Math.random() * (fullLen - patternLen));
  const answer = seq[missingIndex];
  const distractors = new Set<string>();
  while (distractors.size < 3) { const r = SHAPES[Math.floor(Math.random() * SHAPES.length)]; if (r !== answer) distractors.add(r); }
  const options = [...distractors, answer].sort(() => Math.random() - 0.5);
  return { type: "shape-pattern", sequence: seq.map((s, i) => (i === missingIndex ? "?" : s)), missingIndex, answer, options, hint: `The pattern repeats every ${patternLen} shapes` };
};

const MIRROR_PAIRS: [string, string][] = [["d", "b"], ["p", "q"], ["A", "A"], ["M", "M"], ["W", "W"]];

const generateMirrorPattern = (): Puzzle => {
  const pairCount = 3;
  const seq: string[] = [];
  for (let i = 0; i < pairCount; i++) { const pair = MIRROR_PAIRS[Math.floor(Math.random() * MIRROR_PAIRS.length)]; seq.push(pair[0], pair[1]); }
  const missingIndex = Math.floor(Math.random() * pairCount) * 2 + 1;
  const answer = seq[missingIndex];
  const distractors = new Set<string>();
  const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
  while (distractors.size < 3) { const r = allLetters[Math.floor(Math.random() * allLetters.length)]; if (r !== answer) distractors.add(r); }
  const options = [...distractors, answer].sort(() => Math.random() - 0.5);
  return { type: "mirror-pattern", sequence: seq.map((s, i) => (i === missingIndex ? "?" : s)), missingIndex, answer, options, hint: `Look at the letter before "?" — what's its mirror?` };
};

const COLOR_WORDS: { word: string; color: string }[] = [
  { word: "RED", color: "hsl(0 75% 50%)" }, { word: "BLUE", color: "hsl(220 80% 50%)" },
  { word: "GREEN", color: "hsl(140 60% 40%)" }, { word: "YELLOW", color: "hsl(50 90% 50%)" },
  { word: "PINK", color: "hsl(330 70% 60%)" }, { word: "ORANGE", color: "hsl(30 90% 55%)" },
];

const generateColorWordPattern = (): Puzzle => {
  const shuffled = [...COLOR_WORDS].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 4);
  const missingIndex = Math.floor(Math.random() * 4);
  const answer = selected[missingIndex].word;
  const remaining = COLOR_WORDS.filter(c => c.word !== answer);
  const distractors = remaining.sort(() => Math.random() - 0.5).slice(0, 3).map(c => c.word);
  const options = [...distractors, answer].sort(() => Math.random() - 0.5);
  return { type: "color-word", sequence: selected.map((c, i) => (i === missingIndex ? "?" : c.word)), missingIndex, answer, options, hint: `Which color is missing from the pattern?` };
};

const ANALOGIES: { a: string; b: string; c: string; d: string; hint: string }[] = [
  { a: "Hot", b: "Cold", c: "Big", d: "Small", hint: "Opposites!" },
  { a: "Cat", b: "Kitten", c: "Dog", d: "Puppy", hint: "Parent → Baby" },
  { a: "Day", b: "Night", c: "Sun", d: "Moon", hint: "Opposites in the sky" },
  { a: "Up", b: "Down", c: "Left", d: "Right", hint: "Opposite directions" },
  { a: "Happy", b: "Sad", c: "Fast", d: "Slow", hint: "Opposites!" },
  { a: "Book", b: "Read", c: "Food", d: "Eat", hint: "Object → Action" },
  { a: "Eye", b: "See", c: "Ear", d: "Hear", hint: "Body part → Sense" },
  { a: "Bird", b: "Fly", c: "Fish", d: "Swim", hint: "Animal → Movement" },
  { a: "Teacher", b: "School", c: "Doctor", d: "Hospital", hint: "Person → Place" },
  { a: "Milk", b: "White", c: "Sky", d: "Blue", hint: "Thing → Color" },
  { a: "Winter", b: "Cold", c: "Summer", d: "Hot", hint: "Season → Temperature" },
  { a: "Hand", b: "Glove", c: "Foot", d: "Shoe", hint: "Body part → Clothing" },
  // New analogies inspired by reference content
  { a: "Mother", b: "Father", c: "Sister", d: "Brother", hint: "Female → Male" },
  { a: "Beautiful", b: "Ugly", c: "Clean", d: "Dirty", hint: "Opposites!" },
  { a: "Expensive", b: "Cheap", c: "New", d: "Old", hint: "Opposites!" },
  { a: "Morning", b: "Breakfast", c: "Evening", d: "Dinner", hint: "Time → Meal" },
  { a: "Monday", b: "Tuesday", c: "Wednesday", d: "Thursday", hint: "Next day of the week" },
  { a: "Red", b: "Apple", c: "Yellow", d: "Banana", hint: "Color → Fruit" },
  { a: "Passport", b: "Travel", c: "Ticket", d: "Bus", hint: "Document → Usage" },
  { a: "Water", b: "Drink", c: "Bread", d: "Eat", hint: "Item → Action" },
];

const generateAnalogy = (): Puzzle => {
  const a = ANALOGIES[Math.floor(Math.random() * ANALOGIES.length)];
  const wrongAnswers = ANALOGIES.filter(x => x.d !== a.d).sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.d);
  const options = [...wrongAnswers, a.d].sort(() => Math.random() - 0.5);
  return { type: "analogy", sequence: [a.a, "→", a.b, "|", a.c, "→", "?"], missingIndex: 6, answer: a.d, options, hint: a.hint };
};

const SENTENCES: { parts: string[]; answer: string; distractors: string[]; hint: string }[] = [
  { parts: ["The cat is", "?", "the table"], answer: "on", distractors: ["run", "blue", "eat"], hint: "A place word (preposition)" },
  { parts: ["I", "?", "to school every day"], answer: "go", distractors: ["eat", "red", "big"], hint: "A movement verb" },
  { parts: ["She is", "?", "a book"], answer: "reading", distractors: ["swimming", "green", "table"], hint: "What do you do with a book?" },
  { parts: ["The sun is", "?"], answer: "yellow", distractors: ["running", "eating", "sleeping"], hint: "It's a color" },
  { parts: ["We drink", "?", "every morning"], answer: "water", distractors: ["chair", "happy", "run"], hint: "A liquid" },
  { parts: ["He has two", "?"], answer: "eyes", distractors: ["run", "blue", "happy"], hint: "Body parts for seeing" },
  { parts: ["Birds can", "?"], answer: "fly", distractors: ["table", "green", "milk"], hint: "Movement in the sky" },
  { parts: ["I sleep in my", "?"], answer: "bed", distractors: ["eat", "run", "sing"], hint: "Furniture for sleeping" },
  { parts: ["The dog likes to", "?"], answer: "play", distractors: ["chair", "blue", "milk"], hint: "A fun activity" },
  { parts: ["It is very", "?", "outside"], answer: "cold", distractors: ["running", "book", "singing"], hint: "A weather feeling" },
  // New: "I want to..." patterns
  { parts: ["I want to", "?"], answer: "eat", distractors: ["chair", "blue", "happy"], hint: "A daily action" },
  { parts: ["I want to", "?", "a new language"], answer: "learn", distractors: ["table", "red", "cold"], hint: "What you do at school" },
  { parts: ["She wants to", "?", "to the park"], answer: "go", distractors: ["milk", "big", "sing"], hint: "A movement word" },
  // New: Question patterns
  { parts: ["Are you", "?"], answer: "ready", distractors: ["table", "water", "blue"], hint: "Prepared to start" },
  { parts: ["How", "?", "are you?"], answer: "old", distractors: ["eat", "run", "milk"], hint: "Asking about age" },
  { parts: ["What is your", "?"], answer: "name", distractors: ["run", "blue", "cold"], hint: "What people call you" },
  // New: Daily expressions
  { parts: ["Good", "?"], answer: "morning", distractors: ["table", "run", "blue"], hint: "A greeting at the start of the day" },
  { parts: ["Thank", "?", "very much"], answer: "you", distractors: ["run", "big", "eat"], hint: "A polite word" },
  { parts: ["See you", "?"], answer: "later", distractors: ["eat", "blue", "big"], hint: "Means 'after some time'" },
  // New: Feelings
  { parts: ["I am very", "?", "today"], answer: "happy", distractors: ["table", "water", "run"], hint: "A good feeling 😊" },
  { parts: ["Don't be", "?"], answer: "afraid", distractors: ["table", "water", "run"], hint: "A scary feeling" },
  // New: Home & Daily
  { parts: ["The kitchen is", "?"], answer: "clean", distractors: ["fly", "sing", "jump"], hint: "Tidy and neat" },
  { parts: ["Close the", "?", "please"], answer: "door", distractors: ["run", "happy", "eat"], hint: "You walk through it" },
  { parts: ["Where is the", "?"], answer: "bathroom", distractors: ["run", "big", "cold"], hint: "A room to wash" },
  // New: Opposites in context
  { parts: ["The elephant is big, the ant is", "?"], answer: "small", distractors: ["blue", "run", "eat"], hint: "The opposite of big" },
  { parts: ["Summer is hot, winter is", "?"], answer: "cold", distractors: ["run", "eat", "big"], hint: "The opposite of hot" },
];

const generateSentenceCompletion = (): Puzzle => {
  const s = SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
  const missingIndex = s.parts.indexOf("?");
  const options = [...s.distractors, s.answer].sort(() => Math.random() - 0.5);
  return { type: "sentence-completion", sequence: s.parts, missingIndex, answer: s.answer, options, hint: s.hint };
};

const generateOddLetterOut = (): Puzzle => {
  const vowels = ["A", "E", "I", "O", "U"];
  const consonants = "BCDFGHJKLMNPQRSTVWXYZ".split("");
  const useVowelGroup = Math.random() > 0.5;
  let items: string[], oddItem: string, hintText: string;
  if (useVowelGroup) {
    items = [...vowels].sort(() => Math.random() - 0.5).slice(0, 4);
    oddItem = consonants[Math.floor(Math.random() * consonants.length)];
    hintText = "One is not a vowel (A, E, I, O, U)";
  } else {
    items = [...consonants].sort(() => Math.random() - 0.5).slice(0, 4);
    oddItem = vowels[Math.floor(Math.random() * vowels.length)];
    hintText = "One is a vowel among consonants";
  }
  const insertAt = Math.floor(Math.random() * 5);
  const seq = [...items]; seq.splice(insertAt, 0, oddItem);
  const options = [...seq].sort(() => Math.random() - 0.5);
  return { type: "odd-letter-out", sequence: seq, missingIndex: -1, answer: oddItem, options, hint: hintText };
};

const GENERATORS = [generateLetterSequence, generateNumberSequence, generateShapePattern, generateMirrorPattern, generateColorWordPattern, generateAnalogy, generateSentenceCompletion, generateOddLetterOut];

const generatePuzzles = (count: number): Puzzle[] => {
  const puzzles: Puzzle[] = [];
  for (let i = 0; i < count; i++) puzzles.push(GENERATORS[i % GENERATORS.length]());
  return puzzles.sort(() => Math.random() - 0.5);
};

const TYPE_LABELS: Record<PatternType, Record<string, string>> = {
  "letter-sequence": { he: "סדרת אותיות", ar: "تسلسل حروف", en: "Letter Sequence" },
  "number-sequence": { he: "סדרת מספרים", ar: "تسلسل أرقام", en: "Number Sequence" },
  "shape-pattern": { he: "דפוס צורות", ar: "نمط أشكال", en: "Shape Pattern" },
  "mirror-pattern": { he: "דפוס מראה", ar: "نمط مرآة", en: "Mirror Pattern" },
  "color-word": { he: "מילות צבע", ar: "كلمات ألوان", en: "Color Words" },
  "analogy": { he: "אנלוגיה", ar: "قياس", en: "Analogy" },
  "sentence-completion": { he: "השלמת משפט", ar: "إكمال جملة", en: "Complete the Sentence" },
  "odd-letter-out": { he: "אות חורגת", ar: "الحرف الشاذ", en: "Odd Letter Out" },
};

const TYPE_EMOJIS: Record<PatternType, string> = {
  "letter-sequence": "🔤", "number-sequence": "🔢", "shape-pattern": "🔷", "mirror-pattern": "🪞",
  "color-word": "🎨", "analogy": "🔗", "sentence-completion": "📝", "odd-letter-out": "🚫",
};

const SequenceCell = ({ value, isMissing, isRevealed, revealedAnswer, type }: {
  value: string; isMissing: boolean; isRevealed: boolean; revealedAnswer?: string; type: PatternType;
}) => {
  const colorInfo = type === "color-word" ? COLOR_WORDS.find(c => c.word === (isRevealed ? revealedAnswer : value)) : null;
  const isWord = type === "sentence-completion" || type === "analogy";
  const isSymbol = value === "→" || value === "|";
  if (isSymbol) return <span className="text-muted-foreground font-display font-bold text-xl mx-1">{value === "|" ? ":" : value}</span>;
  return (
    <motion.div layout
      className={`${isWord ? "px-3 py-2 min-w-[3rem]" : "w-12 h-14 sm:w-14 sm:h-16"} rounded-xl flex items-center justify-center font-display font-extrabold ${isWord ? "text-sm sm:text-base" : "text-lg sm:text-xl"} border-2 transition-all ${
        isMissing ? isRevealed ? "border-accent" : "border-primary/50 animate-pulse" : "border-border/40"
      }`}
      style={{
        background: isMissing ? isRevealed ? "hsl(var(--accent) / 0.15)" : "hsl(var(--primary) / 0.08)" : "hsl(var(--card) / 0.7)",
        boxShadow: isMissing ? "0 0 16px hsl(var(--primary) / 0.15)" : "var(--shadow-card)",
        color: colorInfo?.color || undefined,
      }}
      whileHover={isMissing && !isRevealed ? { scale: 1.08 } : {}}
    >
      {isMissing ? (isRevealed ? (
        <motion.span initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 12 }}>{revealedAnswer}</motion.span>
      ) : <span className="text-primary/60 text-2xl">?</span>) : value}
    </motion.div>
  );
};

const TYPE_QUESTIONS: Record<PatternType, Record<string, string>> = {
  "letter-sequence": { he: "מצא את האות החסרה בסדרה", ar: "اعثر على الحرف المفقود", en: "Find the missing letter" },
  "number-sequence": { he: "מצא את המספר החסר בסדרה", ar: "اعثر على الرقم المفقود", en: "Find the missing number" },
  "shape-pattern": { he: "מצא את הצורה החסרה בדפוס", ar: "اعثر على الشكل المفقود", en: "Find the missing shape" },
  "mirror-pattern": { he: "מצא את המראה של האות", ar: "اعثر على انعكاس الحرف", en: "Find the mirror letter" },
  "color-word": { he: "איזה צבע חסר?", ar: "أي لون مفقود؟", en: "Which color is missing?" },
  "analogy": { he: "השלם את האנלוגיה", ar: "أكمل القياس", en: "Complete the analogy" },
  "sentence-completion": { he: "השלם את המשפט", ar: "أكمل الجملة", en: "Complete the sentence" },
  "odd-letter-out": { he: "מצא את האות שלא שייכת!", ar: "اعثر على الحرف الذي لا ينتمي!", en: "Find the letter that doesn't belong!" },
};

/* ═══ MAIN COMPONENT ═══ */
const PatternPuzzle = () => {
  const { t, lang } = useLanguage();
  const adaptive = useAgeAdaptive();
  const rewards = useRewardsPipeline();
  const TOTAL_ROUNDS = 10;
  const [searchParams] = useSearchParams();
  const stageId = searchParams.get("stage");

  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => { startBgMusic(); return () => stopBgMusic(); }, []);
  useEffect(() => { setPuzzles(generatePuzzles(TOTAL_ROUNDS)); }, []);

  const puzzle = puzzles[currentIndex];
  const progress = puzzles.length > 0 ? ((currentIndex + 1) / puzzles.length) * 100 : 0;

  const handleSelect = useCallback((option: string) => {
    if (result || !puzzle) return;
    setSelected(option);

    if (option === puzzle.answer) {
      setResult("correct");
      setCorrectCount(c => c + 1);
      playCorrectSound();
      rewards.fireEvent({ type: "correct", points: Math.max(5, 15 + (showHint ? 0 : 5)) });
    } else {
      setResult("wrong");
      playWrongSound();
      rewards.fireEvent({ type: "wrong" });
    }

    setTimeout(() => advance(), 1500);
  }, [result, puzzle, showHint, rewards]);

  const advance = () => {
    if (currentIndex + 1 >= puzzles.length) {
      const finalCorrect = correctCount + (result === "correct" ? 1 : 0);
      if (finalCorrect >= TOTAL_ROUNDS * 0.7) playVictoryFanfare();
      stopBgMusic();
      rewards.completeGame({
        gameType: "pattern",
        stageId,
        correct: finalCorrect,
        wrong: TOTAL_ROUNDS - finalCorrect,
        totalRounds: TOTAL_ROUNDS,
      });
    } else {
      setCurrentIndex(i => i + 1);
      setSelected(null);
      setResult(null);
      setShowHint(false);
    }
  };

  const restart = () => {
    setPuzzles(generatePuzzles(TOTAL_ROUNDS));
    setCurrentIndex(0); setCorrectCount(0);
    setSelected(null); setResult(null); setShowHint(false); setHintsUsed(0);
    rewards.reset();
  };

  const handleHint = useCallback(() => {
    if (!puzzle || showHint) return null;
    setShowHint(true);
    setHintsUsed(h => h + 1);
    return puzzle.hint;
  }, [puzzle, showHint]);

  if (puzzles.length === 0) return null;

  return (
    <GameSceneShell
      title={lang === "he" ? "חידת דפוסים" : lang === "ar" ? "لغز الأنماط" : "Pattern Puzzle"}
      emoji="🧩"
      gameType="pattern"
      rewards={rewards}
      onDismissXP={rewards.dismissXP}
      progress={progress}
      currentRound={currentIndex + 1}
      totalRounds={puzzles.length}
      onHint={handleHint}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 relative z-10">
        {!rewards.isComplete ? (
          <AnimatePresence mode="wait">
            {puzzle && (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="card-glass rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden"
              >
                <div className="absolute -top-16 -end-16 w-40 h-40 rounded-full opacity-10 blur-3xl pointer-events-none"
                  style={{ background: "linear-gradient(135deg, hsl(var(--sky)), hsl(var(--primary)))" }} />

                {/* Type badge */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-5 text-xs font-display font-semibold border"
                  style={{ background: "hsl(var(--primary) / 0.08)", borderColor: "hsl(var(--primary) / 0.2)", color: "hsl(var(--primary))" }}>
                  <span>{TYPE_EMOJIS[puzzle.type]}</span>
                  {TYPE_LABELS[puzzle.type][lang] || TYPE_LABELS[puzzle.type].en}
                </motion.div>

                <p className="text-sm font-body text-muted-foreground mb-3">
                  {TYPE_QUESTIONS[puzzle.type][lang] || TYPE_QUESTIONS[puzzle.type].en}
                </p>

                {/* Sequence */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 flex-wrap">
                  {puzzle.sequence.map((val, i) => (
                    <SequenceCell key={i} value={val} isMissing={i === puzzle.missingIndex}
                      isRevealed={result === "correct" && i === puzzle.missingIndex} revealedAnswer={puzzle.answer} type={puzzle.type} />
                  ))}
                </div>

                {/* Hint */}
                <AnimatePresence>
                  {showHint && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="text-sm text-muted-foreground font-body mb-4 px-4 py-2 rounded-xl border border-border/40 inline-block"
                      style={{ background: "hsl(var(--muted) / 0.3)" }}>
                      💡 {puzzle.hint}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Options */}
                <div className="grid grid-cols-2 gap-3 mb-5 max-w-xs mx-auto">
                  {puzzle.options.map((option, i) => {
                    const isSelected = selected === option;
                    const isCorrectAnswer = result && option === puzzle.answer;
                    const isWrong = result === "wrong" && isSelected;
                    return (
                      <motion.button key={`${currentIndex}-${i}`}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.06, type: "spring", stiffness: 250 }}
                        whileHover={!result ? { scale: 1.06, y: -3 } : {}}
                        whileTap={!result ? { scale: 0.92 } : {}}
                        onClick={() => handleSelect(option)}
                        disabled={!!result}
                        className={`relative h-14 sm:h-16 rounded-xl font-display font-bold text-xl border-2 transition-all overflow-hidden ${
                          isCorrectAnswer ? "border-accent text-accent" : isWrong ? "border-destructive text-destructive" : "border-border/50 text-foreground hover:border-primary/40"
                        }`}
                        style={isCorrectAnswer ? { background: "hsl(var(--accent) / 0.12)", boxShadow: "0 0 16px hsl(var(--accent) / 0.2)" }
                          : isWrong ? { background: "hsl(var(--destructive) / 0.1)" } : { background: "hsl(var(--card) / 0.8)", boxShadow: "var(--shadow-card)" }}>
                        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                          style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.06), transparent 60%)" }} />
                        <span className="relative z-10">{option}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Result feedback */}
                <AnimatePresence>
                  {result && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`text-lg font-display font-bold py-2.5 px-5 rounded-2xl inline-block backdrop-blur-sm ${
                        result === "correct" ? "text-accent border border-accent/25" : "text-destructive border border-destructive/25"
                      }`}
                      style={result === "correct" ? { background: "hsl(var(--accent) / 0.1)", boxShadow: "0 0 20px hsl(var(--accent) / 0.1)" } : { background: "hsl(var(--destructive) / 0.1)" }}>
                      {result === "correct" ? `🎉 ${t("quiz.correct")}` : `😅 ${lang === "he" ? "התשובה:" : lang === "ar" ? "الإجابة:" : "Answer:"} ${puzzle.answer}`}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          /* ═══ Results ═══ */
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            className="card-glass rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-15 blur-3xl" style={{ background: "var(--gradient-hero)" }} />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-gradient mb-4">
                {lang === "he" ? "!סיימת את החידות" : lang === "ar" ? "!أنهيت الألغاز" : "Puzzles Complete!"}
              </h2>
              <div className="flex justify-center gap-3 mb-5 flex-wrap">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
                  className="rounded-2xl px-5 py-2.5 flex items-center gap-2 border border-primary/25" style={{ background: "hsl(var(--primary) / 0.1)" }}>
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-display font-bold text-xl">{rewards.score}</span>
                  <span className="text-xs text-muted-foreground font-display">XP</span>
                </motion.div>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}
                  className="rounded-2xl px-5 py-2.5 flex items-center gap-2 border border-accent/25" style={{ background: "hsl(var(--accent) / 0.1)" }}>
                  <Trophy className="w-5 h-5 text-accent" />
                  <span className="font-display font-bold text-xl">{rewards.bestStreak}</span>
                  <span className="text-xs text-muted-foreground font-display">{lang === "he" ? "רצף" : "streak"}</span>
                </motion.div>
              </div>
              <div className="flex justify-center mb-6"><StarRating earned={rewards.starsEarned} total={5} size={32} /></div>
              <p className="text-muted-foreground font-body text-sm mb-6">
                {rewards.starsEarned >= 4 ? (lang === "he" ? "!מדהים! אתה גאון דפוסים ⭐" : "Amazing! You're a pattern genius ⭐!") :
                 rewards.starsEarned >= 2 ? (lang === "he" ? "!כל הכבוד! המשך לתרגל 👏" : "Well done! Keep practicing 👏!") :
                 (lang === "he" ? "!לא נורא, תרגול עושה מושלם 💪" : "Don't give up, practice makes perfect 💪!")}
              </p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={restart}
                className="px-6 py-3 rounded-2xl font-display font-bold text-sm inline-flex items-center gap-2 border border-primary/30 text-primary"
                style={{ background: "hsl(var(--primary) / 0.1)" }}>
                <RotateCcw className="w-4 h-4" /> {t("quiz.playAgain")}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </GameSceneShell>
  );
};

export default PatternPuzzle;
