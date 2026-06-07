import type { ProgressMetric } from "../../types";

export type GameResult = Pick<
  ProgressMetric,
  "accuracy" | "score" | "timeSpentSec" | "progress" | "metadata"
>;

export interface GameProps {
  onComplete: (result: GameResult) => void;
}

export function buildGameResult(
  startedAt: number,
  accuracy: number,
  score: number,
  metadata?: GameResult["metadata"],
): GameResult {
  return {
    accuracy: Math.min(1, Math.max(0, accuracy)),
    score: Math.round(score),
    timeSpentSec: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
    progress: 1,
    metadata,
  };
}

export function useGameStartedAt(): number {
  return Date.now();
}
