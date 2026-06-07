import type { CognitiveSkill, DifficultyLevel, ProgressMetric } from "../types";

const QUEUE_KEY = "kidgenius.offlineProgressQueue";
const PROGRESS_KEY = "kidgenius.progress";

export interface ProgressEvent {
  gameId: string;
  skill: CognitiveSkill;
  metric: ProgressMetric;
  timestamp: number;
}

function readQueue(): ProgressEvent[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]") as ProgressEvent[];
  } catch {
    return [];
  }
}

function writeQueue(events: ProgressEvent[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(events));
}

export function recordProgress(
  gameId: string,
  skill: CognitiveSkill,
  partial: Partial<ProgressMetric> & { accuracy: number; score: number },
): ProgressMetric {
  const metric: ProgressMetric = {
    accuracy: partial.accuracy,
    score: partial.score,
    timeSpentSec: partial.timeSpentSec ?? 0,
    progress: partial.progress ?? Math.min(1, partial.accuracy),
    difficulty: partial.difficulty ?? inferDifficulty(partial.accuracy),
    metadata: partial.metadata,
  };

  const event: ProgressEvent = { gameId, skill, metric, timestamp: Date.now() };
  const queue = readQueue();
  queue.push(event);
  writeQueue(queue);

  const snapshot = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}") as Record<string, ProgressMetric>;
  snapshot[gameId] = metric;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(snapshot));

  void flushQueue();
  return metric;
}

function inferDifficulty(accuracy: number): DifficultyLevel {
  if (accuracy >= 0.9) return "mastery";
  if (accuracy >= 0.65) return "growing";
  return "intro";
}

export async function flushQueue(): Promise<void> {
  if (!navigator.onLine) return;
  const queue = readQueue();
  if (!queue.length) return;
  // Supabase hook placeholder — keeps UI non-blocking
  writeQueue([]);
}
