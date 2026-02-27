/**
 * Learning Path Engine
 * Manages structured learning progression from zero for each age band.
 * Implements spaced repetition, prerequisite checking, error analysis,
 * and adaptive difficulty.
 *
 * Age bands: 0–3, 4–6, 7–10, 11–14
 */

export type AgeBand = "0-3" | "4-6" | "7-10" | "11-14";
export type SkillDomain = "phonics" | "vocabulary" | "grammar" | "speaking" | "reading" | "writing" | "listening";
export type SessionMode = "game" | "lesson" | "mixed";

export interface LearningObjective {
  id: string;
  domain: SkillDomain;
  /** Descriptive label (English) */
  label: string;
  /** Required objectives that must be mastered first */
  prerequisites: string[];
  /** Minimum age band */
  minAge: AgeBand;
  /** Difficulty 1–5 */
  difficulty: number;
}

export interface MasteryRecord {
  objectiveId: string;
  /** 0–1 mastery score */
  score: number;
  /** Total attempts */
  attempts: number;
  /** Correct attempts */
  correct: number;
  /** Timestamp of last practice */
  lastPracticed: number;
  /** Spaced repetition interval in hours */
  intervalHours: number;
  /** Common error types */
  errorTypes: string[];
}

export interface DailyPlan {
  warmup: string[];
  teach: string[];
  practice: string[];
  game: string[];
  review: string[];
}

// ── Foundation Objectives ──
export const FOUNDATION_OBJECTIVES: LearningObjective[] = [
  // Phonics (4-6)
  { id: "ph-letters", domain: "phonics", label: "Letter names A–Z", prerequisites: [], minAge: "4-6", difficulty: 1 },
  { id: "ph-sounds", domain: "phonics", label: "Letter sounds", prerequisites: ["ph-letters"], minAge: "4-6", difficulty: 1 },
  { id: "ph-blending", domain: "phonics", label: "Blending CVC words", prerequisites: ["ph-sounds"], minAge: "4-6", difficulty: 2 },
  { id: "ph-sight", domain: "phonics", label: "Sight words (Dolch pre-primer)", prerequisites: ["ph-sounds"], minAge: "4-6", difficulty: 2 },

  // Vocabulary (0-14)
  { id: "vc-animals", domain: "vocabulary", label: "Animals vocabulary", prerequisites: [], minAge: "0-3", difficulty: 1 },
  { id: "vc-colors", domain: "vocabulary", label: "Colors vocabulary", prerequisites: [], minAge: "0-3", difficulty: 1 },
  { id: "vc-numbers", domain: "vocabulary", label: "Numbers 1–10", prerequisites: [], minAge: "0-3", difficulty: 1 },
  { id: "vc-body", domain: "vocabulary", label: "Body parts", prerequisites: [], minAge: "0-3", difficulty: 1 },
  { id: "vc-family", domain: "vocabulary", label: "Family members", prerequisites: [], minAge: "0-3", difficulty: 1 },
  { id: "vc-food", domain: "vocabulary", label: "Food & drinks", prerequisites: [], minAge: "4-6", difficulty: 2 },
  { id: "vc-school", domain: "vocabulary", label: "School items", prerequisites: [], minAge: "4-6", difficulty: 2 },
  { id: "vc-nature", domain: "vocabulary", label: "Nature & weather", prerequisites: [], minAge: "4-6", difficulty: 2 },

  // Grammar (5-14)
  { id: "gr-be", domain: "grammar", label: "Verb 'be' (am/is/are)", prerequisites: ["vc-family", "ph-sight"], minAge: "7-10", difficulty: 2 },
  { id: "gr-svo", domain: "grammar", label: "SVO sentence order", prerequisites: ["gr-be"], minAge: "7-10", difficulty: 2 },
  { id: "gr-present", domain: "grammar", label: "Present simple tense", prerequisites: ["gr-svo"], minAge: "7-10", difficulty: 3 },
  { id: "gr-questions", domain: "grammar", label: "Yes/No questions", prerequisites: ["gr-present"], minAge: "7-10", difficulty: 3 },
  { id: "gr-negation", domain: "grammar", label: "Negation (don't/doesn't)", prerequisites: ["gr-present"], minAge: "7-10", difficulty: 3 },
  { id: "gr-past", domain: "grammar", label: "Past simple tense", prerequisites: ["gr-present"], minAge: "11-14", difficulty: 4 },
  { id: "gr-articles", domain: "grammar", label: "Articles a/an/the", prerequisites: ["gr-svo"], minAge: "7-10", difficulty: 3 },
  { id: "gr-modals", domain: "grammar", label: "Modals (can/must/should)", prerequisites: ["gr-present"], minAge: "11-14", difficulty: 4 },

  // Listening/Speaking (0-14)
  { id: "ls-greetings", domain: "speaking", label: "Greetings & introductions", prerequisites: [], minAge: "0-3", difficulty: 1 },
  { id: "ls-commands", domain: "listening", label: "Following simple commands (TPR)", prerequisites: [], minAge: "0-3", difficulty: 1 },
  { id: "ls-feelings", domain: "speaking", label: "Expressing feelings", prerequisites: ["ls-greetings"], minAge: "4-6", difficulty: 2 },
  { id: "ls-routine", domain: "speaking", label: "Daily routine language", prerequisites: ["ls-greetings"], minAge: "4-6", difficulty: 2 },
];

// ── Age Band Utilities ──

const AGE_ORDER: AgeBand[] = ["0-3", "4-6", "7-10", "11-14"];

export function getAgeBand(age: number): AgeBand {
  if (age <= 3) return "0-3";
  if (age <= 6) return "4-6";
  if (age <= 10) return "7-10";
  return "11-14";
}

function ageBandIndex(band: AgeBand): number {
  return AGE_ORDER.indexOf(band);
}

// ── Spaced Repetition ──

const SR_INTERVALS = [1, 4, 12, 24, 72, 168]; // hours

export function nextInterval(currentInterval: number, correct: boolean): number {
  if (!correct) {
    return SR_INTERVALS[0]; // Reset to 1 hour
  }
  const idx = SR_INTERVALS.indexOf(currentInterval);
  if (idx === -1 || idx >= SR_INTERVALS.length - 1) {
    return SR_INTERVALS[SR_INTERVALS.length - 1];
  }
  return SR_INTERVALS[idx + 1];
}

export function isDueForReview(record: MasteryRecord): boolean {
  const hoursSince = (Date.now() - record.lastPracticed) / (1000 * 60 * 60);
  return hoursSince >= record.intervalHours;
}

// ── Prerequisite Checking ──

export function checkPrerequisites(
  objectiveId: string,
  mastery: Map<string, MasteryRecord>,
  objectives: LearningObjective[] = FOUNDATION_OBJECTIVES,
): boolean {
  const obj = objectives.find((o) => o.id === objectiveId);
  if (!obj) return false;
  if (obj.prerequisites.length === 0) return true;

  return obj.prerequisites.every((preId) => {
    const record = mastery.get(preId);
    return record != null && record.score >= 0.7; // 70% mastery threshold
  });
}

// ── Available Objectives ──

export function getAvailableObjectives(
  age: number,
  mastery: Map<string, MasteryRecord>,
  objectives: LearningObjective[] = FOUNDATION_OBJECTIVES,
): LearningObjective[] {
  const band = getAgeBand(age);
  const bandIdx = ageBandIndex(band);

  return objectives.filter((obj) => {
    // Must be age-appropriate
    if (ageBandIndex(obj.minAge) > bandIdx) return false;
    // Must have prerequisites met
    if (!checkPrerequisites(obj.id, mastery, objectives)) return false;
    // Not yet fully mastered
    const record = mastery.get(obj.id);
    if (record && record.score >= 0.95) return false;
    return true;
  });
}

// ── Error Analysis ──

export function analyzeErrors(records: MasteryRecord[]): {
  weakDomains: SkillDomain[];
  needsRemediation: string[];
} {
  const domainScores = new Map<SkillDomain, number[]>();
  const needsRemediation: string[] = [];

  for (const record of records) {
    if (record.attempts >= 3 && record.score < 0.5) {
      needsRemediation.push(record.objectiveId);
    }
    // Find domain
    const obj = FOUNDATION_OBJECTIVES.find((o) => o.id === record.objectiveId);
    if (obj) {
      const scores = domainScores.get(obj.domain) || [];
      scores.push(record.score);
      domainScores.set(obj.domain, scores);
    }
  }

  const weakDomains: SkillDomain[] = [];
  for (const [domain, scores] of domainScores) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg < 0.6) {
      weakDomains.push(domain);
    }
  }

  return { weakDomains, needsRemediation };
}

// ── Daily Plan Generation ──

export function generateDailyPlan(
  age: number,
  mastery: Map<string, MasteryRecord>,
  mode: SessionMode = "mixed",
): DailyPlan {
  const available = getAvailableObjectives(age, mastery);
  const records = Array.from(mastery.values());

  // Find items due for review
  const dueForReview = records
    .filter(isDueForReview)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((r) => r.objectiveId);

  // Find new items to teach (not yet attempted or low attempts)
  const newItems = available
    .filter((obj) => {
      const record = mastery.get(obj.id);
      return !record || record.attempts < 2;
    })
    .slice(0, 2)
    .map((obj) => obj.id);

  // Find items needing practice (attempted but not mastered)
  const practiceItems = available
    .filter((obj) => {
      const record = mastery.get(obj.id);
      return record && record.attempts >= 2 && record.score < 0.7;
    })
    .slice(0, 3)
    .map((obj) => obj.id);

  // Compose plan based on mode
  if (mode === "game") {
    return {
      warmup: dueForReview.slice(0, 1),
      teach: [],
      practice: [],
      game: [...newItems, ...practiceItems],
      review: dueForReview,
    };
  }

  if (mode === "lesson") {
    return {
      warmup: dueForReview.slice(0, 1),
      teach: newItems,
      practice: practiceItems,
      game: [],
      review: dueForReview,
    };
  }

  // Mixed mode (default)
  return {
    warmup: dueForReview.slice(0, 1),
    teach: newItems,
    practice: practiceItems.slice(0, 2),
    game: practiceItems.slice(0, 1),
    review: dueForReview,
  };
}

// ── Mastery Persistence (localStorage) ──

const MASTERY_STORAGE_KEY = "learning-mastery";

export function loadMastery(): Map<string, MasteryRecord> {
  try {
    const raw = localStorage.getItem(MASTERY_STORAGE_KEY);
    if (!raw) return new Map();
    const arr: [string, MasteryRecord][] = JSON.parse(raw);
    return new Map(arr);
  } catch {
    return new Map();
  }
}

export function saveMastery(mastery: Map<string, MasteryRecord>): void {
  try {
    localStorage.setItem(MASTERY_STORAGE_KEY, JSON.stringify(Array.from(mastery.entries())));
  } catch {
    // Storage full - graceful degradation
  }
}

export function updateMastery(
  mastery: Map<string, MasteryRecord>,
  objectiveId: string,
  correct: boolean,
  errorType?: string,
): Map<string, MasteryRecord> {
  const existing = mastery.get(objectiveId) || {
    objectiveId,
    score: 0,
    attempts: 0,
    correct: 0,
    lastPracticed: Date.now(),
    intervalHours: SR_INTERVALS[0],
    errorTypes: [],
  };

  const newAttempts = existing.attempts + 1;
  const newCorrect = existing.correct + (correct ? 1 : 0);
  const newScore = newCorrect / newAttempts;

  const updated: MasteryRecord = {
    ...existing,
    score: newScore,
    attempts: newAttempts,
    correct: newCorrect,
    lastPracticed: Date.now(),
    intervalHours: nextInterval(existing.intervalHours, correct),
    errorTypes: errorType
      ? [...existing.errorTypes.slice(-4), errorType]
      : existing.errorTypes,
  };

  const newMastery = new Map(mastery);
  newMastery.set(objectiveId, updated);
  return newMastery;
}
