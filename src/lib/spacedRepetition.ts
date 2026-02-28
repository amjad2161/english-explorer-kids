/**
 * Word-Level Spaced Repetition System
 *
 * SM-2 algorithm with Leitner box enhancements for per-word tracking.
 * Each word has its own review schedule independent of activity-level progress.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WordSR {
  word: string;
  /** Leitner box 0-5 (0=new, 5=mastered) */
  box: number;
  /** SM-2 ease factor */
  ease: number;
  /** Current interval in hours */
  interval: number;
  /** Next review timestamp (ms) */
  nextReview: number;
  /** Last review timestamp (ms) */
  lastReview: number;
  /** Total times reviewed */
  reps: number;
  /** Consecutive correct answers */
  streak: number;
  /** Total correct answers */
  correctCount: number;
  /** Total wrong answers */
  wrongCount: number;
}

export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;
// 0=blackout, 1=wrong, 2=wrong but familiar, 3=correct with difficulty
// 4=correct, 5=easy

// ---------------------------------------------------------------------------
// Leitner intervals (hours)
// ---------------------------------------------------------------------------

const LEITNER_INTERVALS: Record<number, number> = {
  0: 0.25,     // 15 minutes (new/failed)
  1: 4,        // 4 hours
  2: 24,       // 1 day
  3: 72,       // 3 days
  4: 168,      // 1 week
  5: 720,      // 30 days (mastered)
};

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const SR_KEY = "english-fun-word-sr";

const getAllWords = (): Record<string, WordSR> => {
  try {
    const raw = localStorage.getItem(SR_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveAllWords = (data: Record<string, WordSR>) => {
  try {
    localStorage.setItem(SR_KEY, JSON.stringify(data));
  } catch {
    console.error("Failed to save SR data");
  }
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get or create SR data for a word.
 */
export const getWordSR = (word: string): WordSR => {
  const all = getAllWords();
  const key = word.toLowerCase();
  if (all[key]) return all[key];

  const fresh: WordSR = {
    word: key,
    box: 0,
    ease: 2.5,
    interval: 0,
    nextReview: 0,
    lastReview: 0,
    reps: 0,
    streak: 0,
    correctCount: 0,
    wrongCount: 0,
  };
  return fresh;
};

/**
 * Record a review of a word with SM-2 quality score.
 * Updates box, ease, interval, and schedules next review.
 */
export const reviewWord = (word: string, quality: ReviewQuality): WordSR => {
  const all = getAllWords();
  const key = word.toLowerCase();
  const sr = all[key] || getWordSR(word);
  const now = Date.now();

  sr.reps += 1;
  sr.lastReview = now;

  if (quality >= 3) {
    // Correct answer
    sr.correctCount += 1;
    sr.streak += 1;

    // Move up in Leitner box
    sr.box = Math.min(5, sr.box + 1);

    // SM-2 ease factor update
    sr.ease = Math.max(1.3, sr.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

    // Interval: use Leitner box base * SM-2 ease
    const baseHours = LEITNER_INTERVALS[sr.box] || 720;
    sr.interval = Math.round(baseHours * (sr.ease / 2.5));
  } else {
    // Wrong answer
    sr.wrongCount += 1;
    sr.streak = 0;

    // Drop back in Leitner box
    sr.box = Math.max(0, sr.box - 2);
    sr.ease = Math.max(1.3, sr.ease - 0.2);

    // Short interval for re-learning
    sr.interval = LEITNER_INTERVALS[0];
  }

  sr.nextReview = now + sr.interval * 60 * 60 * 1000;
  all[key] = sr;
  saveAllWords(all);
  return sr;
};

/**
 * Batch review: record multiple words at once.
 */
export const reviewWords = (results: Array<{ word: string; correct: boolean }>): WordSR[] => {
  return results.map(({ word, correct }) =>
    reviewWord(word, correct ? 4 : 1)
  );
};

/**
 * Get words due for review now.
 * @param limit Max words to return
 */
export const getDueWords = (limit = 20): WordSR[] => {
  const all = getAllWords();
  const now = Date.now();

  return Object.values(all)
    .filter((w) => w.nextReview <= now && w.box < 5)
    .sort((a, b) => {
      // Priority: lower box first, then older reviews first
      if (a.box !== b.box) return a.box - b.box;
      return a.nextReview - b.nextReview;
    })
    .slice(0, limit);
};

/**
 * Get words that the user struggles with (box 0-1, at least 2 reps).
 */
export const getWeakWordsSR = (limit = 15): WordSR[] => {
  const all = getAllWords();
  return Object.values(all)
    .filter((w) => w.box <= 1 && w.reps >= 2)
    .sort((a, b) => a.ease - b.ease)
    .slice(0, limit);
};

/**
 * Get mastered words (box 4-5).
 */
export const getMasteredWordsSR = (): WordSR[] => {
  const all = getAllWords();
  return Object.values(all).filter((w) => w.box >= 4);
};

/**
 * Get words in learning (box 1-3).
 */
export const getLearningWordsSR = (): WordSR[] => {
  const all = getAllWords();
  return Object.values(all).filter((w) => w.box >= 1 && w.box <= 3);
};

/**
 * Get new/unseen words from a vocabulary list.
 */
export const getNewWords = (vocabulary: string[], limit = 5): string[] => {
  const all = getAllWords();
  return vocabulary
    .filter((w) => !all[w.toLowerCase()])
    .slice(0, limit);
};

/**
 * Get warm-up words: recently learned but not yet mastered.
 */
export const getWarmUpWords = (limit = 5): WordSR[] => {
  const all = getAllWords();
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

  return Object.values(all)
    .filter((w) => w.lastReview > oneDayAgo && w.box >= 1 && w.box <= 3)
    .sort((a, b) => b.lastReview - a.lastReview)
    .slice(0, limit);
};

/**
 * Get overall SR statistics.
 */
export const getSRStats = () => {
  const all = getAllWords();
  const words = Object.values(all);

  const boxCounts = [0, 0, 0, 0, 0, 0]; // box 0-5
  words.forEach((w) => boxCounts[w.box]++);

  const totalReviews = words.reduce((sum, w) => sum + w.reps, 0);
  const totalCorrect = words.reduce((sum, w) => sum + w.correctCount, 0);

  return {
    totalWords: words.length,
    newWords: boxCounts[0],
    learning: boxCounts[1] + boxCounts[2] + boxCounts[3],
    mastered: boxCounts[4] + boxCounts[5],
    boxDistribution: boxCounts,
    totalReviews,
    accuracy: totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0,
    dueNow: words.filter((w) => w.nextReview <= Date.now() && w.box < 5).length,
  };
};
