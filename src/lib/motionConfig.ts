/**
 * Motion configuration based on performance tier.
 * Import and use to conditionally reduce animations.
 */
import type { PerformanceTier } from "@/hooks/usePerformanceTier";

export interface MotionConfig {
  /** Whether to show particle effects */
  particles: boolean;
  /** Whether to show 3D perspective transforms */
  perspective: boolean;
  /** Animation duration multiplier (1 = normal, 0.5 = half speed) */
  durationMultiplier: number;
  /** Whether to show confetti */
  confetti: boolean;
  /** Max sparkles to render */
  maxSparkles: number;
}

export const getMotionConfig = (tier: PerformanceTier): MotionConfig => {
  switch (tier) {
    case "low":
      return { particles: false, perspective: false, durationMultiplier: 0.5, confetti: false, maxSparkles: 0 };
    case "medium":
      return { particles: true, perspective: false, durationMultiplier: 0.8, confetti: true, maxSparkles: 4 };
    case "high":
      return { particles: true, perspective: true, durationMultiplier: 1, confetti: true, maxSparkles: 8 };
  }
};
