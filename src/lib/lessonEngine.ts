/**
 * Lesson Engine — Pedagogical Learning Session Manager
 *
 * Orchestrates structured learning sessions through 7 phases:
 *   1. warm-up   → Review recently learned words (spaced repetition)
 *   2. teach     → Introduce new vocabulary/concepts
 *   3. practice  → Guided exercises with feedback
 *   4. game      → Fun reinforcement through gameplay
 *   5. story     → Contextual learning through narrative
 *   6. review    → Spaced repetition quiz on due words
 *   7. reward    → XP, achievements, celebration
 *
 * Integrates with:
 * - spacedRepetition.ts (word-level SM-2 + Leitner boxes)
 * - adaptiveDifficulty.ts (per-game difficulty)
 * - learningPath.ts (activity catalogue + prerequisites)
 * - xp.ts (rewards)
 * - characterStore.ts (owl reactions)
 */

import { create } from "zustand";
import type { Language } from "@/lib/i18n";
import {
  getWarmUpWords,
  getDueWords,
  getNewWords,
  getWeakWordsSR,
  reviewWord,
  type WordSR,
  type ReviewQuality,
} from "@/lib/spacedRepetition";
import {
  ACTIVITIES,
  getAgeBucket,
  getActivityProgress,
  recordActivityCompletion,
  type AgeBucket,
  type LearningActivity,
} from "@/lib/learningPath";
import { getDifficulty } from "@/lib/adaptiveDifficulty";
import { wordCategories } from "@/data/learningData";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LessonPhase =
  | "warm-up"
  | "teach"
  | "practice"
  | "game"
  | "story"
  | "review"
  | "reward"
  | "complete";

export interface TeachItem {
  word: string;
  translation: { he: string; ar: string };
  emoji: string;
  category: string;
  /** Phonetic hint for pronunciation */
  phonetic?: string;
}

export interface PracticeItem {
  type: "pick" | "spell" | "match" | "translate";
  word: string;
  emoji: string;
  options?: string[];
  correctAnswer: string;
  hint?: string;
}

export interface ReviewItem {
  word: string;
  emoji: string;
  sr: WordSR;
  options: string[];
  correctAnswer: string;
}

export interface GameRecommendation {
  activity: LearningActivity;
  reason: string;
  difficulty: number;
}

export interface LessonReward {
  xpEarned: number;
  wordsLearned: number;
  wordsReviewed: number;
  accuracy: number;
  streakBonus: number;
  perfectBonus: boolean;
  newMasteries: string[];
}

export interface LessonPlan {
  id: string;
  ageBucket: AgeBucket;
  /** Words to review in warm-up */
  warmUpWords: WordSR[];
  /** New words to teach */
  teachItems: TeachItem[];
  /** Practice exercises */
  practiceItems: PracticeItem[];
  /** Recommended game */
  gameRecommendation: GameRecommendation | null;
  /** Story ID to use (or null) */
  storyId: string | null;
  /** Words due for spaced-repetition review */
  reviewItems: ReviewItem[];
  /** Estimated total time in minutes */
  estimatedMinutes: number;
  /** Category focus for this lesson */
  category: string;
  /** Vocabulary pool for this lesson */
  vocabulary: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get all words across all categories as a flat list */
const getAllWords = () =>
  wordCategories.flatMap((cat) =>
    cat.words.map((w) => ({
      english: w.english,
      hebrew: w.hebrew,
      arabic: w.arabic,
      emoji: w.emoji,
      category: cat.nameEn,
    }))
  );

/** Pick N random items from array */
const pickRandom = <T>(arr: T[], n: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

/** Generate wrong options for a word quiz */
const generateOptions = (correctWord: string, allWords: string[], count = 3): string[] => {
  const others = allWords.filter((w) => w.toLowerCase() !== correctWord.toLowerCase());
  const wrongOptions = pickRandom(others, count);
  const options = [...wrongOptions, correctWord].sort(() => Math.random() - 0.5);
  return options;
};

/** Select category for this lesson based on progress */
const selectCategory = (ageBucket: AgeBucket): typeof wordCategories[number] => {
  // Prefer categories with fewer mastered words
  const scored = wordCategories.map((cat) => {
    const dueWords = getDueWords(100).filter((w) =>
      cat.words.some((cw) => cw.english.toLowerCase() === w.word)
    );
    return { cat, dueCount: dueWords.length, total: cat.words.length };
  });

  // Prioritize categories with due reviews, then least explored
  scored.sort((a, b) => b.dueCount - a.dueCount || b.total - a.total);
  return scored[0]?.cat || wordCategories[0];
};

/** Determine how many new words to teach based on age */
const getTeachCount = (ageBucket: AgeBucket): number => {
  switch (ageBucket) {
    case "0-4": return 3;
    case "5-7": return 4;
    case "8-10": return 5;
    case "11-14": return 6;
  }
};

// ---------------------------------------------------------------------------
// Lesson Plan Generator
// ---------------------------------------------------------------------------

export const generateLessonPlan = (age?: number): LessonPlan => {
  const ageBucket = getAgeBucket(age);
  const allWordsList = getAllWords();
  const allEnglishWords = allWordsList.map((w) => w.english);
  const category = selectCategory(ageBucket);
  const categoryWords = category.words;
  const categoryEnglish = categoryWords.map((w) => w.english);

  // --- Warm-up: recently learned words ---
  const warmUpWords = getWarmUpWords(ageBucket === "0-4" ? 3 : 5);

  // --- Teach: new words from category ---
  const teachCount = getTeachCount(ageBucket);
  const newWordStrings = getNewWords(categoryEnglish, teachCount);
  const teachItems: TeachItem[] = newWordStrings.map((word) => {
    const data = categoryWords.find((w) => w.english === word)!;
    return {
      word: data.english,
      translation: { he: data.hebrew, ar: data.arabic },
      emoji: data.emoji,
      category: category.nameEn,
    };
  });

  // If not enough new words, add weak words for re-teaching
  if (teachItems.length < teachCount) {
    const weakWords = getWeakWordsSR(teachCount - teachItems.length);
    for (const w of weakWords) {
      const data = allWordsList.find(
        (wd) => wd.english.toLowerCase() === w.word
      );
      if (data && !teachItems.find((t) => t.word === data.english)) {
        teachItems.push({
          word: data.english,
          translation: { he: data.hebrew, ar: data.arabic },
          emoji: data.emoji,
          category: data.category,
        });
      }
    }
  }

  // --- Practice: exercises on taught + warm-up words ---
  const practiceVocab = [
    ...teachItems.map((t) => t.word),
    ...warmUpWords.map((w) => w.word),
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  const practiceItems: PracticeItem[] = practiceVocab.slice(0, 8).map((word, i) => {
    const data = allWordsList.find(
      (w) => w.english.toLowerCase() === word.toLowerCase()
    );
    const types: PracticeItem["type"][] = ["pick", "spell", "match", "translate"];
    const type = types[i % types.length];

    return {
      type,
      word: data?.english || word,
      emoji: data?.emoji || "📝",
      options: type === "pick" ? generateOptions(data?.english || word, allEnglishWords) : undefined,
      correctAnswer: data?.english || word,
      hint: data ? `${data.emoji} ${data.category}` : undefined,
    };
  });

  // --- Game recommendation ---
  const eligibleGames = ACTIVITIES.filter(
    (a) =>
      a.ageBuckets.includes(ageBucket) &&
      ["quiz", "memory", "spelling", "scramble", "hangman", "pattern"].includes(a.type)
  );
  const game = eligibleGames.length > 0
    ? pickRandom(eligibleGames, 1)[0]
    : null;

  const gameRecommendation: GameRecommendation | null = game
    ? {
        activity: game,
        reason: getActivityProgress(game.id) ? "reinforce" : "explore",
        difficulty: getDifficulty(game.type),
      }
    : null;

  // --- Story: pick one if available ---
  const storyActivities = ACTIVITIES.filter(
    (a) => a.type === "story" && a.ageBuckets.includes(ageBucket)
  );
  const storyId = storyActivities.length > 0
    ? pickRandom(storyActivities, 1)[0].id
    : null;

  // --- Review: due words from spaced repetition ---
  const dueWords = getDueWords(ageBucket === "0-4" ? 5 : 10);
  const reviewItems: ReviewItem[] = dueWords.map((sr) => {
    const data = allWordsList.find(
      (w) => w.english.toLowerCase() === sr.word
    );
    return {
      word: data?.english || sr.word,
      emoji: data?.emoji || "📝",
      sr,
      options: generateOptions(data?.english || sr.word, allEnglishWords, 3),
      correctAnswer: data?.english || sr.word,
    };
  });

  // --- Estimate time ---
  const warmUpMins = warmUpWords.length > 0 ? 2 : 0;
  const teachMins = teachItems.length * 0.75;
  const practiceMins = practiceItems.length * 0.5;
  const gameMins = gameRecommendation ? 5 : 0;
  const storyMins = storyId ? 5 : 0;
  const reviewMins = reviewItems.length * 0.5;
  const rewardMins = 1;

  return {
    id: `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ageBucket,
    warmUpWords,
    teachItems,
    practiceItems,
    gameRecommendation,
    storyId,
    reviewItems,
    estimatedMinutes: Math.round(
      warmUpMins + teachMins + practiceMins + gameMins + storyMins + reviewMins + rewardMins
    ),
    category: category.nameEn,
    vocabulary: [...new Set([
      ...teachItems.map((t) => t.word),
      ...warmUpWords.map((w) => w.word),
      ...reviewItems.map((r) => r.word),
    ])],
  };
};

// ---------------------------------------------------------------------------
// Zustand Store — Lesson Session State
// ---------------------------------------------------------------------------

interface PhaseResult {
  phase: LessonPhase;
  correct: number;
  total: number;
  words: string[];
  timeSpent: number; // seconds
}

interface LessonState {
  /** Whether a lesson is currently active */
  active: boolean;
  /** Current lesson plan */
  plan: LessonPlan | null;
  /** Current phase */
  phase: LessonPhase;
  /** Index within current phase's items */
  phaseIndex: number;
  /** Results per phase */
  phaseResults: PhaseResult[];
  /** Total correct in current phase */
  currentPhaseCorrect: number;
  /** Total attempted in current phase */
  currentPhaseTotal: number;
  /** Words touched in current phase */
  currentPhaseWords: string[];
  /** Phase start timestamp */
  phaseStartTime: number;
  /** Final reward summary */
  reward: LessonReward | null;
  /** Consecutive correct in current phase */
  currentStreak: number;

  // Actions
  startLesson: (age?: number) => void;
  advancePhase: () => void;
  skipPhase: () => void;
  recordAnswer: (word: string, correct: boolean, quality?: ReviewQuality) => void;
  completePhase: () => void;
  endLesson: () => void;
  resetLesson: () => void;

  // Computed
  getPhaseItems: () => number;
  getProgress: () => { current: number; total: number; percentage: number };
}

const PHASE_ORDER: LessonPhase[] = [
  "warm-up",
  "teach",
  "practice",
  "game",
  "story",
  "review",
  "reward",
  "complete",
];

/** Determine which phases to skip based on content */
const shouldSkipPhase = (phase: LessonPhase, plan: LessonPlan): boolean => {
  switch (phase) {
    case "warm-up": return plan.warmUpWords.length === 0;
    case "teach": return plan.teachItems.length === 0;
    case "practice": return plan.practiceItems.length === 0;
    case "game": return plan.gameRecommendation === null;
    case "story": return plan.storyId === null;
    case "review": return plan.reviewItems.length === 0;
    case "reward": return false;
    case "complete": return false;
    default: return false;
  }
};

export const useLessonEngine = create<LessonState>((set, get) => ({
  active: false,
  plan: null,
  phase: "warm-up",
  phaseIndex: 0,
  phaseResults: [],
  currentPhaseCorrect: 0,
  currentPhaseTotal: 0,
  currentPhaseWords: [],
  phaseStartTime: 0,
  reward: null,
  currentStreak: 0,

  startLesson: (age?: number) => {
    const plan = generateLessonPlan(age);
    let firstPhase: LessonPhase = "warm-up";

    // Find first non-empty phase
    for (const p of PHASE_ORDER) {
      if (!shouldSkipPhase(p, plan)) {
        firstPhase = p;
        break;
      }
    }

    set({
      active: true,
      plan,
      phase: firstPhase,
      phaseIndex: 0,
      phaseResults: [],
      currentPhaseCorrect: 0,
      currentPhaseTotal: 0,
      currentPhaseWords: [],
      phaseStartTime: Date.now(),
      reward: null,
      currentStreak: 0,
    });
  },

  advancePhase: () => {
    const { phase, plan } = get();
    if (!plan) return;

    // Save current phase results first
    get().completePhase();

    // Find next non-skippable phase
    const currentIndex = PHASE_ORDER.indexOf(phase);
    let nextPhase: LessonPhase = "complete";

    for (let i = currentIndex + 1; i < PHASE_ORDER.length; i++) {
      if (!shouldSkipPhase(PHASE_ORDER[i], plan)) {
        nextPhase = PHASE_ORDER[i];
        break;
      }
    }

    // If entering reward phase, calculate rewards
    if (nextPhase === "reward") {
      const results = get().phaseResults;
      const totalCorrect = results.reduce((s, r) => s + r.correct, 0);
      const totalAttempts = results.reduce((s, r) => s + r.total, 0);
      const accuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;
      const allWords = results.flatMap((r) => r.words);
      const uniqueWords = [...new Set(allWords)];

      const teachWords = results.find((r) => r.phase === "teach")?.words || [];
      const reviewWords = results.find((r) => r.phase === "review")?.words || [];

      const perfectBonus = accuracy >= 1 && totalAttempts >= 5;
      const streakBonus = Math.min(10, get().currentStreak);

      const baseXP = totalCorrect * 5;
      const perfectXP = perfectBonus ? 25 : 0;
      const streakXP = streakBonus * 2;

      const reward: LessonReward = {
        xpEarned: baseXP + perfectXP + streakXP,
        wordsLearned: teachWords.length,
        wordsReviewed: reviewWords.length,
        accuracy: Math.round(accuracy * 100),
        streakBonus: streakXP,
        perfectBonus,
        newMasteries: uniqueWords.filter((w) => {
          // Check if any word got promoted to box 4+
          const allData = JSON.parse(localStorage.getItem("english-fun-word-sr") || "{}");
          const sr = allData[w.toLowerCase()];
          return sr && sr.box >= 4;
        }),
      };

      set({ reward });
    }

    set({
      phase: nextPhase,
      phaseIndex: 0,
      currentPhaseCorrect: 0,
      currentPhaseTotal: 0,
      currentPhaseWords: [],
      phaseStartTime: Date.now(),
    });
  },

  skipPhase: () => {
    get().advancePhase();
  },

  recordAnswer: (word: string, correct: boolean, quality?: ReviewQuality) => {
    const { phase } = get();

    // Update spaced repetition
    const q: ReviewQuality = quality ?? (correct ? 4 : 1);
    reviewWord(word, q);

    set((s) => ({
      currentPhaseCorrect: s.currentPhaseCorrect + (correct ? 1 : 0),
      currentPhaseTotal: s.currentPhaseTotal + 1,
      currentPhaseWords: [...new Set([...s.currentPhaseWords, word])],
      currentStreak: correct ? s.currentStreak + 1 : 0,
    }));
  },

  completePhase: () => {
    const { phase, currentPhaseCorrect, currentPhaseTotal, currentPhaseWords, phaseStartTime } = get();

    if (currentPhaseTotal > 0 || currentPhaseWords.length > 0) {
      const result: PhaseResult = {
        phase,
        correct: currentPhaseCorrect,
        total: currentPhaseTotal,
        words: currentPhaseWords,
        timeSpent: Math.round((Date.now() - phaseStartTime) / 1000),
      };

      set((s) => ({
        phaseResults: [...s.phaseResults, result],
      }));
    }
  },

  endLesson: () => {
    const { plan, phaseResults } = get();
    if (!plan) return;

    // Record activity-level completion
    const totalCorrect = phaseResults.reduce((s, r) => s + r.correct, 0);
    const totalAttempts = phaseResults.reduce((s, r) => s + r.total, 0);
    const correctRate = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;

    // Find matching activity and record
    const matchingActivity = ACTIVITIES.find(
      (a) => a.type === "words" && plan.category.toLowerCase().includes(a.title.en.toLowerCase())
    );
    if (matchingActivity) {
      recordActivityCompletion(matchingActivity.id, correctRate);
    }

    set({
      active: false,
      phase: "complete",
    });
  },

  resetLesson: () => {
    set({
      active: false,
      plan: null,
      phase: "warm-up",
      phaseIndex: 0,
      phaseResults: [],
      currentPhaseCorrect: 0,
      currentPhaseTotal: 0,
      currentPhaseWords: [],
      phaseStartTime: 0,
      reward: null,
      currentStreak: 0,
    });
  },

  getPhaseItems: () => {
    const { phase, plan } = get();
    if (!plan) return 0;
    switch (phase) {
      case "warm-up": return plan.warmUpWords.length;
      case "teach": return plan.teachItems.length;
      case "practice": return plan.practiceItems.length;
      case "game": return 1;
      case "story": return 1;
      case "review": return plan.reviewItems.length;
      case "reward": return 1;
      default: return 0;
    }
  },

  getProgress: () => {
    const { phase, plan, phaseIndex } = get();
    if (!plan) return { current: 0, total: 1, percentage: 0 };

    const phaseWeights: Record<LessonPhase, number> = {
      "warm-up": plan.warmUpWords.length,
      teach: plan.teachItems.length,
      practice: plan.practiceItems.length,
      game: plan.gameRecommendation ? 1 : 0,
      story: plan.storyId ? 1 : 0,
      review: plan.reviewItems.length,
      reward: 1,
      complete: 0,
    };

    const total = Object.values(phaseWeights).reduce((s, v) => s + v, 0);
    let current = 0;

    for (const p of PHASE_ORDER) {
      if (p === phase) {
        current += phaseIndex;
        break;
      }
      current += phaseWeights[p];
    }

    return {
      current,
      total,
      percentage: total > 0 ? Math.round((current / total) * 100) : 0,
    };
  },
}));

// ---------------------------------------------------------------------------
// Phase metadata for UI
// ---------------------------------------------------------------------------

export interface PhaseInfo {
  id: LessonPhase;
  title: Record<Language, string>;
  emoji: string;
  description: Record<Language, string>;
  color: string;
}

export const PHASE_INFO: Record<LessonPhase, PhaseInfo> = {
  "warm-up": {
    id: "warm-up",
    title: { en: "Warm Up", he: "חימום", ar: "إحماء" },
    emoji: "🔥",
    description: {
      en: "Let's remember what we learned!",
      he: "בואו ניזכר מה למדנו!",
      ar: "هيا نتذكر ما تعلمناه!",
    },
    color: "hsl(25, 95%, 53%)",
  },
  teach: {
    id: "teach",
    title: { en: "Learn", he: "ללמוד", ar: "تعلّم" },
    emoji: "📚",
    description: {
      en: "Time to learn new words!",
      he: "הגיע הזמן ללמוד מילים חדשות!",
      ar: "حان وقت تعلم كلمات جديدة!",
    },
    color: "hsl(210, 80%, 55%)",
  },
  practice: {
    id: "practice",
    title: { en: "Practice", he: "תרגול", ar: "تمرين" },
    emoji: "✏️",
    description: {
      en: "Practice makes perfect!",
      he: "תרגול עושה מושלם!",
      ar: "التمرين يصنع الكمال!",
    },
    color: "hsl(145, 65%, 42%)",
  },
  game: {
    id: "game",
    title: { en: "Game Time", he: "זמן משחק", ar: "وقت اللعب" },
    emoji: "🎮",
    description: {
      en: "Let's play and learn!",
      he: "בואו נשחק ונלמד!",
      ar: "هيا نلعب ونتعلم!",
    },
    color: "hsl(280, 70%, 55%)",
  },
  story: {
    id: "story",
    title: { en: "Story", he: "סיפור", ar: "قصة" },
    emoji: "📖",
    description: {
      en: "Story time!",
      he: "שעת סיפור!",
      ar: "وقت القصة!",
    },
    color: "hsl(330, 70%, 55%)",
  },
  review: {
    id: "review",
    title: { en: "Review", he: "חזרה", ar: "مراجعة" },
    emoji: "🔄",
    description: {
      en: "Let's review what we know!",
      he: "בואו נחזור על מה שאנחנו יודעים!",
      ar: "هيا نراجع ما نعرفه!",
    },
    color: "hsl(45, 90%, 50%)",
  },
  reward: {
    id: "reward",
    title: { en: "Reward", he: "פרס", ar: "مكافأة" },
    emoji: "🏆",
    description: {
      en: "Amazing work! Here's your reward!",
      he: "עבודה מדהימה! הנה הפרס שלך!",
      ar: "عمل رائع! ها هي مكافأتك!",
    },
    color: "hsl(50, 95%, 55%)",
  },
  complete: {
    id: "complete",
    title: { en: "Done", he: "סיום", ar: "انتهى" },
    emoji: "✅",
    description: {
      en: "Lesson complete!",
      he: "השיעור הושלם!",
      ar: "الدرس مكتمل!",
    },
    color: "hsl(145, 65%, 42%)",
  },
};
