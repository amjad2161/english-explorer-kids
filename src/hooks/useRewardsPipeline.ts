import { useCallback, useRef, useState } from "react";
import { addXP, getLevel, updateDailyProgress } from "@/lib/xp";
import { checkAchievements, Achievement, saveBestStreak } from "@/lib/achievements";
import { trackGamePlayed } from "@/lib/statsTracker";
import { saveStageProgress } from "@/lib/levels";
import { dispatchCharacterEvent, CharacterEventType } from "@/lib/characterStore";
import {
  playCorrectSound,
  playWrongSound,
  playComboSound,
  playVictoryFanfare,
  playXPGainSound,
  playStarSound,
  playLevelUpSound,
} from "@/lib/sounds";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RewardEvent {
  type: "correct" | "wrong" | "hint" | "complete";
  /** Points earned for this action */
  points?: number;
  /** Word / letter associated with this event (for spaced repetition) */
  word?: string;
}

export interface GameResult {
  gameType: string;
  stageId?: string | null;
  correct: number;
  wrong: number;
  totalRounds: number;
  /** Override star calculation */
  stars?: number;
  /** Bonus XP multiplier */
  xpMultiplier?: number;
}

export interface RewardsPipelineState {
  score: number;
  streak: number;
  bestStreak: number;
  combo: number;
  xpEarned: number;
  starsEarned: number;
  isComplete: boolean;
  showXP: boolean;
  showConfetti: boolean;
  showCombo: boolean;
  leveledUp: boolean;
  newAchievements: Achievement[];
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useRewardsPipeline = () => {
  const [state, setState] = useState<RewardsPipelineState>({
    score: 0,
    streak: 0,
    bestStreak: 0,
    combo: 0,
    xpEarned: 0,
    starsEarned: 0,
    isComplete: false,
    showXP: false,
    showConfetti: false,
    showCombo: false,
    leveledUp: false,
    newAchievements: [],
  });

  const streakRef = useRef(0);
  const bestStreakRef = useRef(0);
  const scoreRef = useRef(0);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);

  /**
   * Fire a single reward event (correct / wrong answer, hint used, etc.)
   */
  const fireEvent = useCallback((event: RewardEvent) => {
    if (event.type === "correct") {
      streakRef.current += 1;
      const streak = streakRef.current;
      bestStreakRef.current = Math.max(bestStreakRef.current, streak);
      correctRef.current += 1;

      const bonus = Math.min(streak, 5);
      const points = (event.points ?? 10) + bonus * 5;
      scoreRef.current += points;

      // Sound + character
      if (streak >= 3) {
        playComboSound(streak);
        dispatchCharacterEvent({ type: "celebrate" });
        setState((s) => ({
          ...s,
          score: scoreRef.current,
          streak,
          bestStreak: bestStreakRef.current,
          combo: streak,
          showCombo: true,
          showConfetti: true,
        }));
        setTimeout(() => setState((s) => ({ ...s, showCombo: false, showConfetti: false })), 1200);
      } else {
        playCorrectSound();
        dispatchCharacterEvent({ type: "correct" });
        setState((s) => ({
          ...s,
          score: scoreRef.current,
          streak,
          bestStreak: bestStreakRef.current,
          showConfetti: true,
        }));
        setTimeout(() => setState((s) => ({ ...s, showConfetti: false })), 100);
      }
    } else if (event.type === "wrong") {
      streakRef.current = 0;
      wrongRef.current += 1;
      playWrongSound();
      dispatchCharacterEvent({ type: "wrong" });
      setState((s) => ({ ...s, streak: 0 }));
    } else if (event.type === "hint") {
      dispatchCharacterEvent({
        type: "hint",
        payload: { message: event.word, duration: 3000 },
      });
    }
  }, []);

  /**
   * Complete the game — runs the full rewards pipeline:
   * XP, achievements, daily progress, stats, stage save, level-up check.
   */
  const completeGame = useCallback((result: GameResult) => {
    const { gameType, stageId, correct, wrong, totalRounds, xpMultiplier = 1 } = result;

    // Calculate stars (1-5)
    const accuracy = totalRounds > 0 ? correct / totalRounds : 0;
    const stars =
      result.stars ??
      (accuracy >= 0.95 ? 5 : accuracy >= 0.8 ? 4 : accuracy >= 0.6 ? 3 : accuracy >= 0.4 ? 2 : 1);

    // Calculate XP
    const baseXP = Math.max(10, scoreRef.current);
    const xp = Math.round(baseXP * xpMultiplier);

    // Save stage progress
    if (stageId) saveStageProgress(stageId, Math.min(stars, 5));

    // Save best streak
    saveBestStreak(bestStreakRef.current);

    // Track stats
    trackGamePlayed(gameType, correct, wrong, xp);
    updateDailyProgress(gameType);

    // Add XP & check level up
    const oldLevel = getLevel(addXP(0).totalXP).level;
    const newState = addXP(xp);
    const newLevel = getLevel(newState.totalXP).level;
    const leveledUp = newLevel > oldLevel;

    // Check achievements
    const newAchievements = checkAchievements();

    // Play sounds
    playVictoryFanfare();
    playXPGainSound(xp);
    if (stars >= 4) playStarSound();
    if (leveledUp) setTimeout(() => playLevelUpSound(), 1500);

    // Character celebration
    dispatchCharacterEvent({ type: "celebrate" });

    setState((s) => ({
      ...s,
      starsEarned: stars,
      xpEarned: xp,
      isComplete: true,
      showXP: true,
      showConfetti: true,
      leveledUp,
      newAchievements,
    }));

    setTimeout(() => setState((s) => ({ ...s, showConfetti: false })), 100);
  }, []);

  /**
   * Reset all state for a new game round.
   */
  const reset = useCallback(() => {
    streakRef.current = 0;
    bestStreakRef.current = 0;
    scoreRef.current = 0;
    correctRef.current = 0;
    wrongRef.current = 0;
    setState({
      score: 0,
      streak: 0,
      bestStreak: 0,
      combo: 0,
      xpEarned: 0,
      starsEarned: 0,
      isComplete: false,
      showXP: false,
      showConfetti: false,
      showCombo: false,
      leveledUp: false,
      newAchievements: [],
    });
    dispatchCharacterEvent({ type: "idle" });
  }, []);

  const dismissXP = useCallback(() => {
    setState((s) => ({ ...s, showXP: false }));
  }, []);

  return {
    ...state,
    fireEvent,
    completeGame,
    reset,
    dismissXP,
    /** Quick access to ref values for calculations */
    getScore: () => scoreRef.current,
    getCorrect: () => correctRef.current,
    getWrong: () => wrongRef.current,
  };
};
