import { getProgress, saveProgress } from "@/lib/progress";
import type { CognitiveSkill, DifficultyLevel, ProgressMetric } from "../types";

const QUEUE_KEY = "kidgenius.offlineProgressQueue";
const PROGRESS_KEY = "kidgenius.progress";
const SYNCED_KEY = "kidgenius.syncedEvents";

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

function readSynced(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(SYNCED_KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

function writeSynced(ids: Set<string>) {
  localStorage.setItem(SYNCED_KEY, JSON.stringify([...ids]));
}

function eventKey(event: ProgressEvent): string {
  return `${event.gameId}:${event.timestamp}`;
}

function bridgeToMainProgress(gameId: string, metric: ProgressMetric): void {
  const progress = getProgress();
  const marker = `academy:${gameId}`;
  if (!progress.completedWords.includes(marker)) {
    progress.completedWords.push(marker);
  }
  const stars = Math.max(1, Math.min(5, Math.round(metric.score / 20)));
  progress.totalStars += stars;
  progress.quizScores.push(Math.round(metric.accuracy * 100));
  progress.currentStreak += 1;
  saveProgress(progress);
}

function persistSnapshot(gameId: string, metric: ProgressMetric) {
  const snapshot = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}") as Record<string, ProgressMetric>;
  snapshot[gameId] = metric;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(snapshot));
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
  persistSnapshot(gameId, metric);
  bridgeToMainProgress(gameId, metric);

  void flushQueue();
  return metric;
}

function inferDifficulty(accuracy: number): DifficultyLevel {
  if (accuracy >= 0.9) return "mastery";
  if (accuracy >= 0.65) return "growing";
  return "intro";
}

export function getAcademyProgressSnapshot(): Record<string, ProgressMetric> {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}") as Record<string, ProgressMetric>;
  } catch {
    return {};
  }
}

export async function flushQueue(): Promise<{ flushed: number; pending: number }> {
  const queue = readQueue();
  if (!queue.length) return { flushed: 0, pending: 0 };

  const synced = readSynced();
  const pending: ProgressEvent[] = [];

  for (const event of queue) {
    const key = eventKey(event);
    if (synced.has(key)) continue;

    if (!navigator.onLine) {
      pending.push(event);
      continue;
    }

    // Local-first sync: mark acknowledged once bridged to main progress storage.
    bridgeToMainProgress(event.gameId, event.metric);
    persistSnapshot(event.gameId, event.metric);
    synced.add(key);
  }

  writeSynced(synced);
  writeQueue(pending);

  return { flushed: queue.length - pending.length, pending: pending.length };
}
