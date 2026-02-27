/**
 * Age-Adaptive Game Hook
 * 
 * Provides age-group-aware game configuration for all games.
 * Reads from the learner profile and returns adjusted parameters.
 */

import { useMemo } from "react";
import { getActiveAgeConfig, getProfile, AgeGroupConfig, LearnerProfile } from "@/lib/ageProfile";

export interface AdaptiveGameConfig {
  /** Difficulty multiplier (0.5 = easy, 1.3 = hard) */
  difficulty: number;
  /** Maximum word length for this age group */
  maxWordLength: number;
  /** Timer multiplier (higher = more time) */
  timerMultiplier: number;
  /** How many hints allowed per game */
  hintsAllowed: number;
  /** Whether to show phonetic guides */
  showPhonetics: boolean;
  /** Font size class */
  fontSize: "lg" | "md" | "sm";
  /** Animation intensity */
  animationIntensity: "high" | "medium" | "low";
  /** Current age group config */
  ageConfig: AgeGroupConfig;
  /** Current learner profile (may be null) */
  profile: LearnerProfile | null;
  /** Learner's display name */
  displayName: string;
  /** Learner's avatar emoji */
  avatar: string;
  /** Quiz question count adjusted by age */
  quizSize: number;
  /** Memory pairs count adjusted by age */
  memoryPairs: number;
  /** Spelling rounds adjusted by age */
  spellingRounds: number;
  /** Scramble timer seconds */
  scrambleTimer: number;
  /** Hangman max wrong guesses */
  hangmanLives: number;
}

export const useAgeAdaptive = (): AdaptiveGameConfig => {
  return useMemo(() => {
    const config = getActiveAgeConfig();
    const profile = getProfile();

    // Scale game parameters by age group
    const quizSizeByAge = {
      toddler: 5,
      child: 6,
      preteen: 8,
      teen: 10,
    };

    const memoryPairsByAge = {
      toddler: 4,
      child: 6,
      preteen: 8,
      teen: 10,
    };

    const spellingRoundsByAge = {
      toddler: 4,
      child: 6,
      preteen: 8,
      teen: 10,
    };

    const scrambleTimerByAge = {
      toddler: 40,
      child: 30,
      preteen: 20,
      teen: 15,
    };

    const hangmanLivesByAge = {
      toddler: 8,
      child: 7,
      preteen: 6,
      teen: 5,
    };

    return {
      difficulty: config.difficultyMultiplier,
      maxWordLength: config.maxWordLength,
      timerMultiplier: config.timerMultiplier,
      hintsAllowed: config.hintsAllowed,
      showPhonetics: config.showPhonetics,
      fontSize: config.fontSize,
      animationIntensity: config.animationIntensity,
      ageConfig: config,
      profile,
      displayName: profile?.name || "",
      avatar: profile?.avatar || "🦊",
      quizSize: quizSizeByAge[config.id],
      memoryPairs: memoryPairsByAge[config.id],
      spellingRounds: spellingRoundsByAge[config.id],
      scrambleTimer: scrambleTimerByAge[config.id],
      hangmanLives: hangmanLivesByAge[config.id],
    };
  }, []);
};
