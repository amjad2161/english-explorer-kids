/**
 * Adaptive Difficulty System
 * 
 * Tracks per-game performance and dynamically adjusts difficulty.
 * Uses a sliding window of recent attempts to determine skill level.
 */

const ADAPTIVE_KEY = "english-fun-adaptive";

export interface GamePerformance {
  gameType: string;
  accuracy: number; // 0-1
  timestamp: number;
  streak: number;
  timeSpent: number; // seconds
}

export interface AdaptiveState {
  performances: GamePerformance[];
  difficultyLevel: Record<string, number>; // gameType -> 1-5 difficulty
  masteredWords: string[];
  weakWords: string[];
  totalSessions: number;
}

const getState = (): AdaptiveState => {
  try {
    const raw = localStorage.getItem(ADAPTIVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignored */ }
  return {
    performances: [],
    difficultyLevel: {},
    masteredWords: [],
    weakWords: [],
    totalSessions: 0,
  };
};

const saveState = (state: AdaptiveState) => {
  localStorage.setItem(ADAPTIVE_KEY, JSON.stringify(state));
};

/**
 * Record a game session and update difficulty.
 */
export const recordPerformance = (
  gameType: string,
  correct: number,
  total: number,
  streak: number,
  timeSpent: number,
  wrongWords: string[] = [],
  correctWords: string[] = []
) => {
  const state = getState();
  const accuracy = total > 0 ? correct / total : 0;

  state.performances.push({
    gameType,
    accuracy,
    timestamp: Date.now(),
    streak,
    timeSpent,
  });

  // Keep only last 50 performances
  if (state.performances.length > 50) {
    state.performances = state.performances.slice(-50);
  }

  // Track mastered and weak words
  correctWords.forEach(w => {
    if (!state.masteredWords.includes(w)) state.masteredWords.push(w);
    state.weakWords = state.weakWords.filter(ww => ww !== w);
  });
  wrongWords.forEach(w => {
    if (!state.weakWords.includes(w)) state.weakWords.push(w);
  });

  // Keep lists manageable
  if (state.masteredWords.length > 200) state.masteredWords = state.masteredWords.slice(-200);
  if (state.weakWords.length > 100) state.weakWords = state.weakWords.slice(-100);

  // Calculate new difficulty for this game type
  const recentForGame = state.performances
    .filter(p => p.gameType === gameType)
    .slice(-10);

  if (recentForGame.length >= 3) {
    const avgAccuracy = recentForGame.reduce((a, p) => a + p.accuracy, 0) / recentForGame.length;
    const avgStreak = recentForGame.reduce((a, p) => a + p.streak, 0) / recentForGame.length;
    const currentDiff = state.difficultyLevel[gameType] || 2;

    let newDiff = currentDiff;
    if (avgAccuracy > 0.85 && avgStreak >= 3) {
      newDiff = Math.min(5, currentDiff + 1); // Increase difficulty
    } else if (avgAccuracy < 0.45) {
      newDiff = Math.max(1, currentDiff - 1); // Decrease difficulty
    }

    state.difficultyLevel[gameType] = newDiff;
  }

  state.totalSessions += 1;
  saveState(state);
};

/**
 * Get the current difficulty level for a game (1-5).
 */
export const getDifficulty = (gameType: string): number => {
  const state = getState();
  return state.difficultyLevel[gameType] || 2;
};

/**
 * Get words the user struggles with (for targeted practice).
 */
export const getWeakWords = (): string[] => {
  return getState().weakWords;
};

/**
 * Get mastered words.
 */
export const getMasteredWords = (): string[] => {
  return getState().masteredWords;
};

/**
 * Get overall performance summary.
 */
export const getPerformanceSummary = () => {
  const state = getState();
  const recent = state.performances.slice(-20);
  const avgAccuracy = recent.length > 0
    ? recent.reduce((a, p) => a + p.accuracy, 0) / recent.length
    : 0;

  const gameAccuracies: Record<string, number> = {};
  const gameTypes = [...new Set(state.performances.map(p => p.gameType))];
  gameTypes.forEach(type => {
    const forType = state.performances.filter(p => p.gameType === type).slice(-5);
    gameAccuracies[type] = forType.reduce((a, p) => a + p.accuracy, 0) / forType.length;
  });

  return {
    overallAccuracy: Math.round(avgAccuracy * 100),
    totalSessions: state.totalSessions,
    masteredCount: state.masteredWords.length,
    weakCount: state.weakWords.length,
    gameAccuracies,
    strongestGame: Object.entries(gameAccuracies).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
    weakestGame: Object.entries(gameAccuracies).sort((a, b) => a[1] - b[1])[0]?.[0] || null,
  };
};

/**
 * Get difficulty-adjusted parameters for quiz generation.
 */
export const getAdaptiveQuizParams = (gameType: string) => {
  const diff = getDifficulty(gameType);
  const weakWords = getWeakWords();

  return {
    difficulty: diff,
    // Higher difficulty = longer words, harder categories
    maxWordLength: diff <= 2 ? 6 : diff <= 3 ? 8 : 12,
    // Include weak words for targeted practice (30% chance)
    includeWeakWords: weakWords.length > 0 && Math.random() < 0.3,
    weakWords,
    // Timer multiplier (less time at higher difficulty)
    timerMultiplier: diff <= 2 ? 1.5 : diff <= 3 ? 1.0 : 0.75,
    // More options at higher difficulty (harder to guess correctly)
    optionCount: diff <= 2 ? 3 : 4,
    // Hint availability
    hintsAvailable: diff <= 2 ? 3 : diff <= 3 ? 2 : 1,
  };
};
