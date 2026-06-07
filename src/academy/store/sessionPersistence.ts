import type { InteractionId } from "../types";

const SESSION_KEY = "kidgenius.academySession";

export interface PersistedAcademySession {
  elapsedSec: number;
  interactionComplete: InteractionId[];
  empathyWarmth: number;
  heartBpm: number;
  finaleLocksOpen: number;
  medalEarned: boolean;
  sessionActive: boolean;
  updatedAt: number;
}

export function loadAcademySession(): PersistedAcademySession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedAcademySession;
    if (typeof parsed.elapsedSec !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAcademySession(session: PersistedAcademySession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, updatedAt: Date.now() }));
}

export function clearAcademySession(): void {
  localStorage.removeItem(SESSION_KEY);
}
