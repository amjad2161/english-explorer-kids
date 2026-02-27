/**
 * Learning Path Engine
 *
 * Manages learning progression from zero for ages 0–14.
 * Handles: placement, daily plan generation, spaced repetition,
 * adaptive difficulty, error-based remediation.
 *
 * All data is stored locally (localStorage) — no external calls.
 */
import type { Language } from "@/lib/i18n";

// ─── Types ──────────────────────────────────────────────────────────────────

export type AgeGroup = "0-3" | "4-6" | "7-10" | "11-14";
export type SkillArea = "phonics" | "vocabulary" | "grammar" | "listening" | "speaking" | "reading" | "writing";
export type LearningGoal = SkillArea;

export interface LearnerProfile {
  age: number;
  ageGroup: AgeGroup;
  uiLang: Language;
  /** 0 = complete beginner, 100 = advanced */
  overallLevel: number;
  /** Per-skill mastery 0–100 */
  skillLevels: Record<SkillArea, number>;
  /** Items due for spaced repetition (item id → next review timestamp) */
  spacedRepetition: Record<string, number>;
  /** Consecutive-error count per item */
  errorCounts: Record<string, number>;
  /** Total sessions completed */
  sessionsCompleted: number;
}

export interface SessionStep {
  type: "warm_up" | "teach" | "guided_practice" | "game" | "story" | "review" | "reward";
  skill: SkillArea;
  /** Human-readable instruction in the UI language */
  label: Record<Language, string>;
  /** Route or component identifier */
  route?: string;
  durationMin: number;
}

export interface DailyPlan {
  date: string;
  goal: LearningGoal;
  steps: SessionStep[];
  estimatedMinutes: number;
}

// ─── Age group helpers ───────────────────────────────────────────────────────

export const getAgeGroup = (age: number): AgeGroup => {
  if (age <= 3) return "0-3";
  if (age <= 6) return "4-6";
  if (age <= 10) return "7-10";
  return "11-14";
};

const SKILL_PREREQUISITES: Partial<Record<SkillArea, SkillArea[]>> = {
  grammar: ["phonics", "vocabulary"],
  reading: ["phonics"],
  writing: ["phonics", "vocabulary"],
  speaking: ["listening"],
};

/** Returns whether the learner meets the prerequisites for a skill */
export const meetsPrerequisites = (
  skill: SkillArea,
  skillLevels: Record<SkillArea, number>,
  threshold = 20
): boolean => {
  const prereqs = SKILL_PREREQUISITES[skill];
  if (!prereqs) return true;
  return prereqs.every((p) => skillLevels[p] >= threshold);
};

// ─── Spaced Repetition ───────────────────────────────────────────────────────

/** SM-2 simplified: returns next review interval in milliseconds */
const nextReviewInterval = (errorCount: number): number => {
  const baseMs = 24 * 60 * 60 * 1000; // 1 day
  if (errorCount === 0) return baseMs * 4;
  if (errorCount === 1) return baseMs * 2;
  if (errorCount === 2) return baseMs;
  return baseMs / 2; // review same day for repeated errors
};

/** Mark an item as reviewed and schedule next review */
export const scheduleReview = (
  profile: LearnerProfile,
  itemId: string,
  isCorrect: boolean
): LearnerProfile => {
  const errors = profile.errorCounts[itemId] ?? 0;
  const newErrors = isCorrect ? Math.max(0, errors - 1) : errors + 1;
  const interval = nextReviewInterval(newErrors);
  return {
    ...profile,
    errorCounts: { ...profile.errorCounts, [itemId]: newErrors },
    spacedRepetition: {
      ...profile.spacedRepetition,
      [itemId]: Date.now() + interval,
    },
  };
};

/** Returns item IDs due for review */
export const getDueItems = (profile: LearnerProfile): string[] => {
  const now = Date.now();
  return Object.entries(profile.spacedRepetition)
    .filter(([, nextReview]) => nextReview <= now)
    .map(([id]) => id);
};

// ─── Plan generation ─────────────────────────────────────────────────────────

const GAME_ROUTES: Partial<Record<SkillArea, string>> = {
  phonics: "/alphabet",
  vocabulary: "/words",
  grammar: "/quiz",
  listening: "/memory",
  speaking: "/spelling",
};

/** Generate a daily learning plan for the given learner profile and goal */
export const generateDailyPlan = (
  profile: LearnerProfile,
  goal: LearningGoal,
  sessionLengthMin = 20
): DailyPlan => {
  const { ageGroup } = profile;
  const steps: SessionStep[] = [];

  // 1. Warm-up — always phonics/vocab based on age
  const warmupSkill: SkillArea = ageGroup === "0-3" ? "listening" : "phonics";
  steps.push({
    type: "warm_up",
    skill: warmupSkill,
    label: {
      he: "חימום — שמיעה ומשחק",
      ar: "إحماء — استماع ولعب",
      en: "Warm-up — Listen & Play",
    },
    route: GAME_ROUTES[warmupSkill] ?? "/",
    durationMin: 3,
  });

  // 2. Teach — introduce the concept
  if (meetsPrerequisites(goal, profile.skillLevels)) {
    steps.push({
      type: "teach",
      skill: goal,
      label: {
        he: "הסבר — ללמוד משהו חדש",
        ar: "شرح — تعلم شيئاً جديداً",
        en: "Teach — Learn Something New",
      },
      durationMin: 4,
    });
  }

  // 3. Guided practice — interactive activity
  steps.push({
    type: "guided_practice",
    skill: goal,
    label: {
      he: "תרגול מודרך",
      ar: "ممارسة موجهة",
      en: "Guided Practice",
    },
    route: GAME_ROUTES[goal] ?? "/quiz",
    durationMin: 5,
  });

  // 4. Game — reinforce through play
  steps.push({
    type: "game",
    skill: goal,
    label: {
      he: "משחק — חזק את מה שלמדת",
      ar: "لعبة — عزز ما تعلمته",
      en: "Game — Reinforce Learning",
    },
    route: GAME_ROUTES[goal] ?? "/memory",
    durationMin: 5,
  });

  // 5. Story — narrative context (skip for 0-3 in short sessions)
  if (ageGroup !== "0-3" || sessionLengthMin >= 15) {
    steps.push({
      type: "story",
      skill: goal,
      label: {
        he: "סיפור — אנגלית בהקשר",
        ar: "قصة — الإنجليزية في سياق",
        en: "Story — English in Context",
      },
      route: "/story",
      durationMin: 4,
    });
  }

  // 6. Review — spaced repetition of due items
  const dueItems = getDueItems(profile);
  if (dueItems.length > 0) {
    steps.push({
      type: "review",
      skill: goal,
      label: {
        he: "חזרה — תרגול חומר ישן",
        ar: "مراجعة — تدريب على مادة قديمة",
        en: "Review — Practice Old Material",
      },
      route: "/quiz",
      durationMin: 3,
    });
  }

  // 7. Reward — always last
  steps.push({
    type: "reward",
    skill: goal,
    label: {
      he: "🏆 פרס על ההתקדמות שלך!",
      ar: "🏆 جائزة على تقدمك!",
      en: "🏆 Reward for Your Progress!",
    },
    durationMin: 1,
  });

  const estimatedMinutes = steps.reduce((sum, s) => sum + s.durationMin, 0);

  return {
    date: new Date().toISOString().slice(0, 10),
    goal,
    steps,
    estimatedMinutes,
  };
};

// ─── Error-based remediation ─────────────────────────────────────────────────

export interface RemediationPlan {
  skill: SkillArea;
  /** Route to send the learner to */
  route: string;
  reason: Record<Language, string>;
}

/** Given repeated errors on a skill, return a targeted remediation plan */
export const getRemediationPlan = (
  profile: LearnerProfile,
  skill: SkillArea
): RemediationPlan | null => {
  const errors = Object.entries(profile.errorCounts)
    .filter(([id]) => id.startsWith(skill))
    .reduce((sum, [, count]) => sum + count, 0);

  if (errors < 3) return null;

  const prereqs = SKILL_PREREQUISITES[skill];
  // If prereqs not met, send back to prerequisite
  if (prereqs) {
    for (const prereq of prereqs) {
      if (profile.skillLevels[prereq] < 30) {
        return {
          skill: prereq,
          route: GAME_ROUTES[prereq] ?? "/",
          reason: {
            he: `נראה שצריך לחזק ${prereq} לפני ${skill}`,
            ar: `يبدو أننا بحاجة لتقوية ${prereq} قبل ${skill}`,
            en: `Let's strengthen ${prereq} before moving on to ${skill}`,
          },
        };
      }
    }
  }

  // Otherwise, re-practice the same skill at a lower intensity
  return {
    skill,
    route: GAME_ROUTES[skill] ?? "/",
    reason: {
      he: "בואו נתרגל שוב — פעילות נוספת תעזור!",
      ar: "دعنا نتدرب مرة أخرى — ممارسة إضافية ستساعد!",
      en: "Let's practice again — a bit more practice will help!",
    },
  };
};

// ─── Profile persistence ──────────────────────────────────────────────────────

const PROFILE_KEY = "learning-path-profile";

const DEFAULT_SKILL_LEVELS: Record<SkillArea, number> = {
  phonics: 0,
  vocabulary: 0,
  grammar: 0,
  listening: 0,
  speaking: 0,
  reading: 0,
  writing: 0,
};

export const getDefaultProfile = (age = 6, uiLang: Language = "he"): LearnerProfile => ({
  age,
  ageGroup: getAgeGroup(age),
  uiLang,
  overallLevel: 0,
  skillLevels: { ...DEFAULT_SKILL_LEVELS },
  spacedRepetition: {},
  errorCounts: {},
  sessionsCompleted: 0,
});

export const loadProfile = (): LearnerProfile | null => {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored ? (JSON.parse(stored) as LearnerProfile) : null;
  } catch {
    return null;
  }
};

export const saveProfile = (profile: LearnerProfile): void => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Storage quota exceeded or private browsing
  }
};

export const updateSkillLevel = (
  profile: LearnerProfile,
  skill: SkillArea,
  delta: number
): LearnerProfile => {
  const current = profile.skillLevels[skill] ?? 0;
  const updated = Math.min(100, Math.max(0, current + delta));
  const allLevels = { ...profile.skillLevels, [skill]: updated };
  const overallLevel =
    Math.round(Object.values(allLevels).reduce((a, b) => a + b, 0) / Object.keys(allLevels).length);
  return { ...profile, skillLevels: allLevels, overallLevel };
};
