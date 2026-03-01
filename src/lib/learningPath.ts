/**
 * Learning Path Engine v1
 *
 * Provides:
 * - Age-bucketed learning progression (0–4, 5–7, 8–10, 11–14)
 * - Prerequisite graph
 * - Spaced-repetition scheduling (simple interval model)
 * - Session plan generator
 * - Remediation paths for struggling learners
 */

import type { Language } from "@/lib/i18n";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AgeBucket = "0-4" | "5-7" | "8-10" | "11-14";

export type ActivityType =
  | "alphabet"
  | "words"
  | "quiz"
  | "memory"
  | "spelling"
  | "scramble"
  | "hangman"
  | "pattern"
  | "story"
  | "phrases"
  | "grammar"
  | "opposites"
  | "sentences"
  | "body-parts"
  | "animal-match"
  | "abc-animals"
  | "topics"
  | "video";

export interface LearningActivity {
  id: string;
  type: ActivityType;
  /** Localised title */
  title: Record<Language, string>;
  /** Localised description */
  description: Record<Language, string>;
  emoji: string;
  /** Route to navigate to */
  path: string;
  /** Activities that must be completed before this one */
  prerequisites: string[];
  /** Which age buckets this activity is appropriate for */
  ageBuckets: AgeBucket[];
  /** Minimum correct rate needed to consider this mastered (0-1) */
  masteryThreshold: number;
  /** Estimated time in minutes */
  estimatedMinutes: number;
  /** Spaced-repetition interval in days (initial) */
  initialInterval: number;
}

export interface ActivityProgress {
  activityId: string;
  completedAt: number; // timestamp ms
  correctRate: number; // 0-1
  attempts: number;
  nextReviewAt: number; // timestamp ms
  interval: number; // days
  easeFactor: number; // SM2 ease factor
}

export interface SessionActivity {
  activity: LearningActivity;
  /** Why this was included */
  reason: "new" | "review" | "remediation";
  priority: number; // higher = more urgent
}

export interface SessionPlan {
  activities: SessionActivity[];
  estimatedMinutes: number;
  ageBucket: AgeBucket;
}

// ---------------------------------------------------------------------------
// Activity Catalogue
// ---------------------------------------------------------------------------

export const ACTIVITIES: LearningActivity[] = [
  // Alphabet
  {
    id: "abc-a-i",
    type: "alphabet",
    title: { en: "Letters A–I", he: "אותיות A–I", ar: "حروف A–I" },
    description: { en: "Learn the first 9 letters", he: "למד 9 האותיות הראשונות", ar: "تعلم أول 9 حروف" },
    emoji: "🔤",
    path: "/alphabet",
    prerequisites: [],
    ageBuckets: ["0-4", "5-7", "8-10", "11-14"],
    masteryThreshold: 0.7,
    estimatedMinutes: 5,
    initialInterval: 1,
  },
  {
    id: "abc-j-r",
    type: "alphabet",
    title: { en: "Letters J–R", he: "אותיות J–R", ar: "حروف J–R" },
    description: { en: "Continue with the next 9 letters", he: "המשך עם 9 אותיות נוספות", ar: "تابع مع 9 حروف أخرى" },
    emoji: "🔤",
    path: "/alphabet",
    prerequisites: ["abc-a-i"],
    ageBuckets: ["5-7", "8-10", "11-14"],
    masteryThreshold: 0.7,
    estimatedMinutes: 5,
    initialInterval: 1,
  },
  {
    id: "abc-s-z",
    type: "alphabet",
    title: { en: "Letters S–Z", he: "אותיות S–Z", ar: "حروف S–Z" },
    description: { en: "Complete the alphabet", he: "השלם את כל האלפבית", ar: "أكمل الأبجدية" },
    emoji: "🔤",
    path: "/alphabet",
    prerequisites: ["abc-j-r"],
    ageBuckets: ["5-7", "8-10", "11-14"],
    masteryThreshold: 0.7,
    estimatedMinutes: 5,
    initialInterval: 2,
  },
  // Words
  {
    id: "words-animals",
    type: "words",
    title: { en: "Animals", he: "חיות", ar: "حيوانات" },
    description: { en: "Learn animal names in English", he: "למד שמות חיות", ar: "تعلم أسماء الحيوانات" },
    emoji: "🐾",
    path: "/words",
    prerequisites: ["abc-a-i"],
    ageBuckets: ["0-4", "5-7", "8-10", "11-14"],
    masteryThreshold: 0.65,
    estimatedMinutes: 6,
    initialInterval: 1,
  },
  {
    id: "words-colors",
    type: "words",
    title: { en: "Colors", he: "צבעים", ar: "ألوان" },
    description: { en: "Learn color names", he: "למד שמות צבעים", ar: "تعلم أسماء الألوان" },
    emoji: "🎨",
    path: "/words",
    prerequisites: ["abc-a-i"],
    ageBuckets: ["0-4", "5-7", "8-10", "11-14"],
    masteryThreshold: 0.65,
    estimatedMinutes: 5,
    initialInterval: 1,
  },
  {
    id: "words-numbers",
    type: "words",
    title: { en: "Numbers", he: "מספרים", ar: "أرقام" },
    description: { en: "Learn numbers 1–20", he: "למד מספרים 1-20", ar: "تعلم الأرقام 1-20" },
    emoji: "🔢",
    path: "/words",
    prerequisites: ["words-animals"],
    ageBuckets: ["0-4", "5-7", "8-10", "11-14"],
    masteryThreshold: 0.65,
    estimatedMinutes: 5,
    initialInterval: 1,
  },
  {
    id: "words-fruits",
    type: "words",
    title: { en: "Fruits & Veggies", he: "פירות וירקות", ar: "فواكه وخضروات" },
    description: { en: "Learn fruit and vegetable names", he: "למד שמות פירות וירקות", ar: "تعلم أسماء الفواكه والخضروات" },
    emoji: "🍎",
    path: "/words",
    prerequisites: ["words-colors"],
    ageBuckets: ["5-7", "8-10", "11-14"],
    masteryThreshold: 0.65,
    estimatedMinutes: 6,
    initialInterval: 1,
  },
  {
    id: "words-body",
    type: "words",
    title: { en: "Body Parts", he: "חלקי גוף", ar: "أجزاء الجسم" },
    description: { en: "Learn body part names", he: "למד חלקי גוף", ar: "تعلم أجزاء الجسم" },
    emoji: "🦵",
    path: "/words",
    prerequisites: ["words-numbers"],
    ageBuckets: ["5-7", "8-10", "11-14"],
    masteryThreshold: 0.6,
    estimatedMinutes: 6,
    initialInterval: 2,
  },
  {
    id: "words-family",
    type: "words",
    title: { en: "Family", he: "משפחה", ar: "عائلة" },
    description: { en: "Learn family member names", he: "למד מילים על משפחה", ar: "تعلم كلمات العائلة" },
    emoji: "👨‍👩‍👧",
    path: "/words",
    prerequisites: ["words-body"],
    ageBuckets: ["5-7", "8-10", "11-14"],
    masteryThreshold: 0.6,
    estimatedMinutes: 5,
    initialInterval: 2,
  },
  // Games
  {
    id: "quiz-basic",
    type: "quiz",
    title: { en: "Fun Quiz", he: "חידון כיף", ar: "اختبار ممتع" },
    description: { en: "Test what you've learned!", he: "בדוק מה למדת!", ar: "اختبر ما تعلمته!" },
    emoji: "🎯",
    path: "/quiz",
    prerequisites: ["words-animals", "words-colors"],
    ageBuckets: ["5-7", "8-10", "11-14"],
    masteryThreshold: 0.7,
    estimatedMinutes: 8,
    initialInterval: 3,
  },
  {
    id: "memory-basic",
    type: "memory",
    title: { en: "Matching Game", he: "משחק התאמה", ar: "لعبة التطابق" },
    description: { en: "Match words to pictures!", he: "התאם מילים לתמונות!", ar: "طابق الكلمات مع الصور!" },
    emoji: "🧩",
    path: "/memory",
    prerequisites: ["words-animals"],
    ageBuckets: ["0-4", "5-7", "8-10", "11-14"],
    masteryThreshold: 0.65,
    estimatedMinutes: 7,
    initialInterval: 2,
  },
  {
    id: "spelling-basic",
    type: "spelling",
    title: { en: "Spelling Bee", he: "מרוץ האיות", ar: "سباق التهجئة" },
    description: { en: "Listen and arrange letters!", he: "שמע וסדר אותיות!", ar: "اسمع ورتّب الحروف!" },
    emoji: "🐝",
    path: "/spelling",
    prerequisites: ["abc-a-i", "words-animals"],
    ageBuckets: ["5-7", "8-10", "11-14"],
    masteryThreshold: 0.6,
    estimatedMinutes: 8,
    initialInterval: 2,
  },
  {
    id: "scramble-basic",
    type: "scramble",
    title: { en: "Word Scramble", he: "מילים מבולבלות", ar: "كلمات مخلوطة" },
    description: { en: "Unscramble the mixed-up word!", he: "פענח מילה מבולבלת!", ar: "فك شفرة الكلمة المخلوطة!" },
    emoji: "🔀",
    path: "/scramble",
    prerequisites: ["spelling-basic"],
    ageBuckets: ["8-10", "11-14"],
    masteryThreshold: 0.6,
    estimatedMinutes: 7,
    initialInterval: 3,
  },
  {
    id: "hangman-basic",
    type: "hangman",
    title: { en: "Guess the Word", he: "נחש את המילה", ar: "خمّن الكلمة" },
    description: { en: "Pick letters and discover the word!", he: "בחר אותיות וגלה את המילה!", ar: "اختر حروف واكتشف الكلمة!" },
    emoji: "🎭",
    path: "/hangman",
    prerequisites: ["spelling-basic"],
    ageBuckets: ["8-10", "11-14"],
    masteryThreshold: 0.55,
    estimatedMinutes: 8,
    initialInterval: 3,
  },
  {
    id: "pattern-basic",
    type: "pattern",
    title: { en: "Pattern Puzzle", he: "פאזל דפוסים", ar: "لغز الأنماط" },
    description: { en: "Complete the pattern sequence!", he: "השלם את הדפוס!", ar: "أكمل نمط التسلسل!" },
    emoji: "🧩",
    path: "/pattern",
    prerequisites: ["quiz-basic"],
    ageBuckets: ["8-10", "11-14"],
    masteryThreshold: 0.6,
    estimatedMinutes: 8,
    initialInterval: 3,
  },
  {
    id: "story-basic",
    type: "story",
    title: { en: "Story Time", he: "שעת סיפור", ar: "وقت القصة" },
    description: { en: "Interactive learning stories!", he: "סיפורי למידה אינטראקטיביים!", ar: "قصص تعليمية تفاعلية!" },
    emoji: "📖",
    path: "/story",
    prerequisites: ["words-family"],
    ageBuckets: ["5-7", "8-10", "11-14"],
    masteryThreshold: 0.65,
    estimatedMinutes: 10,
    initialInterval: 3,
  },
  // ABC Animals
  {
    id: "abc-animals",
    type: "abc-animals",
    title: { en: "ABC Animals", he: "חיות ה-ABC", ar: "حيوانات ABC" },
    description: { en: "Learn letters with animals!", he: "למד אותיות עם חיות!", ar: "تعلم الحروف مع الحيوانات!" },
    emoji: "🦁",
    path: "/abc-animals",
    prerequisites: ["abc-a-i"],
    ageBuckets: ["0-4", "5-7", "8-10"],
    masteryThreshold: 0.6,
    estimatedMinutes: 8,
    initialInterval: 2,
  },
  // Animal Match
  {
    id: "animal-match",
    type: "animal-match",
    title: { en: "Animal Match", he: "התאמת חיות", ar: "مطابقة الحيوانات" },
    description: { en: "Match animals to their names!", he: "התאם חיות לשמותיהן!", ar: "طابق الحيوانات مع أسمائها!" },
    emoji: "🐾",
    path: "/animal-match",
    prerequisites: ["words-animals"],
    ageBuckets: ["0-4", "5-7", "8-10"],
    masteryThreshold: 0.65,
    estimatedMinutes: 7,
    initialInterval: 2,
  },
  // Phrases
  {
    id: "phrases-basic",
    type: "phrases",
    title: { en: "Daily Phrases", he: "ביטויים יומיומיים", ar: "عبارات يومية" },
    description: { en: "Learn useful everyday phrases!", he: "למד ביטויים שימושיים!", ar: "تعلم عبارات مفيدة!" },
    emoji: "💬",
    path: "/phrases",
    prerequisites: ["words-animals", "words-colors"],
    ageBuckets: ["5-7", "8-10", "11-14"],
    masteryThreshold: 0.6,
    estimatedMinutes: 8,
    initialInterval: 2,
  },
  // Body Parts Game
  {
    id: "body-parts-game",
    type: "body-parts",
    title: { en: "Body Parts Game", he: "משחק חלקי גוף", ar: "لعبة أجزاء الجسم" },
    description: { en: "Interactive body parts game!", he: "משחק חלקי גוף אינטראקטיבי!", ar: "لعبة أجزاء الجسم التفاعلية!" },
    emoji: "🦵",
    path: "/body-parts",
    prerequisites: ["words-body"],
    ageBuckets: ["5-7", "8-10", "11-14"],
    masteryThreshold: 0.6,
    estimatedMinutes: 7,
    initialInterval: 2,
  },
  // Grammar
  {
    id: "grammar-basic",
    type: "grammar",
    title: { en: "Grammar Basics", he: "יסודות דקדוק", ar: "أساسيات القواعد" },
    description: { en: "Learn English grammar rules!", he: "למד כללי דקדוק באנגלית!", ar: "تعلم قواعد اللغة الإنجليزية!" },
    emoji: "📐",
    path: "/grammar",
    prerequisites: ["phrases-basic"],
    ageBuckets: ["8-10", "11-14"],
    masteryThreshold: 0.6,
    estimatedMinutes: 10,
    initialInterval: 3,
  },
  // Opposites
  {
    id: "opposites-game",
    type: "opposites",
    title: { en: "Opposites", he: "הפכים", ar: "المتضادات" },
    description: { en: "Match words with their opposites!", he: "התאם מילים להפכים שלהן!", ar: "طابق الكلمات مع أضدادها!" },
    emoji: "🔄",
    path: "/opposites",
    prerequisites: ["words-fruits"],
    ageBuckets: ["5-7", "8-10", "11-14"],
    masteryThreshold: 0.6,
    estimatedMinutes: 7,
    initialInterval: 2,
  },
  // Sentences
  {
    id: "sentences-game",
    type: "sentences",
    title: { en: "Complete the Sentence", he: "השלם את המשפט", ar: "أكمل الجملة" },
    description: { en: "Choose the right word to complete sentences!", he: "בחר את המילה הנכונה להשלמת משפטים!", ar: "اختر الكلمة الصحيحة لإكمال الجمل!" },
    emoji: "✏️",
    path: "/sentences",
    prerequisites: ["phrases-basic"],
    ageBuckets: ["5-7", "8-10", "11-14"],
    masteryThreshold: 0.6,
    estimatedMinutes: 8,
    initialInterval: 2,
  },
  // Topic Games
  {
    id: "topics-explore",
    type: "topics",
    title: { en: "Topic Games", he: "משחקי נושאים", ar: "ألعاب المواضيع" },
    description: { en: "Explore games by topic!", he: "חקור משחקים לפי נושא!", ar: "استكشف الألعاب حسب الموضوع!" },
    emoji: "🎮",
    path: "/topics",
    prerequisites: ["quiz-basic"],
    ageBuckets: ["5-7", "8-10", "11-14"],
    masteryThreshold: 0.6,
    estimatedMinutes: 10,
    initialInterval: 3,
  },
  // Videos
  {
    id: "video-abc-song",
    type: "video",
    title: { en: "ABC Animals Song", he: "שיר חיות ABC", ar: "أغنية حيوانات ABC" },
    description: { en: "Watch and sing along!", he: "צפה ושיר ביחד!", ar: "شاهد وغنِّ معنا!" },
    emoji: "🎬",
    path: "/abc-animals",
    prerequisites: [],
    ageBuckets: ["0-4", "5-7", "8-10", "11-14"],
    masteryThreshold: 0.5,
    estimatedMinutes: 3,
    initialInterval: 3,
  },
  {
    id: "video-reference",
    type: "video",
    title: { en: "Learning Style Guide", he: "מדריך סגנון למידה", ar: "دليل أسلوب التعلم" },
    description: { en: "Tips for effective learning!", he: "טיפים ללמידה אפקטיבית!", ar: "نصائح للتعلم الفعال!" },
    emoji: "🎥",
    path: "/video/reference",
    prerequisites: [],
    ageBuckets: ["5-7", "8-10", "11-14"],
    masteryThreshold: 0.5,
    estimatedMinutes: 4,
    initialInterval: 7,
  },
];

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

const PROGRESS_KEY = "learning-path-progress";

export const getActivityProgress = (activityId: string): ActivityProgress | null => {
  try {
    const raw = localStorage.getItem(`${PROGRESS_KEY}-${activityId}`);
    return raw ? (JSON.parse(raw) as ActivityProgress) : null;
  } catch {
    return null;
  }
};

export const saveActivityProgress = (progress: ActivityProgress): void => {
  try {
    localStorage.setItem(`${PROGRESS_KEY}-${progress.activityId}`, JSON.stringify(progress));
  } catch {
    console.error("Failed to save activity progress");
  }
};

/**
 * Record completion of an activity and update spaced-repetition data.
 * Implements simplified SM-2 algorithm.
 */
export const recordActivityCompletion = (activityId: string, correctRate: number): ActivityProgress => {
  const existing = getActivityProgress(activityId);
  const now = Date.now();

  const attempts = (existing?.attempts ?? 0) + 1;
  const easeFactor = Math.max(
    1.3,
    (existing?.easeFactor ?? 2.5) + 0.1 - (1 - correctRate) * 0.5
  );
  const interval = existing
    ? attempts === 1
      ? 1
      : attempts === 2
      ? 6
      : Math.round(existing.interval * easeFactor)
    : 1;

  const progress: ActivityProgress = {
    activityId,
    completedAt: now,
    correctRate,
    attempts,
    nextReviewAt: now + interval * 24 * 60 * 60 * 1000,
    interval,
    easeFactor,
  };

  saveActivityProgress(progress);
  return progress;
};

// ---------------------------------------------------------------------------
// Age detection
// ---------------------------------------------------------------------------

export const getAgeBucket = (age?: number): AgeBucket => {
  if (!age) {
    // Try to read from profile
    try {
      const profile = JSON.parse(localStorage.getItem("ageProfile") || "{}");
      age = profile.age;
    } catch {
      age = 7;
    }
  }
  if (!age || age <= 4) return "0-4";
  if (age <= 7) return "5-7";
  if (age <= 10) return "8-10";
  return "11-14";
};

// ---------------------------------------------------------------------------
// Prerequisite check
// ---------------------------------------------------------------------------

const isUnlocked = (activity: LearningActivity): boolean => {
  if (activity.prerequisites.length === 0) return true;
  return activity.prerequisites.every((prereqId) => {
    const p = getActivityProgress(prereqId);
    const prereqActivity = ACTIVITIES.find((a) => a.id === prereqId);
    if (!p || !prereqActivity) return false;
    return p.correctRate >= prereqActivity.masteryThreshold;
  });
};

const isMastered = (activity: LearningActivity): boolean => {
  const p = getActivityProgress(activity.id);
  if (!p) return false;
  return p.correctRate >= activity.masteryThreshold && p.attempts >= 2;
};

const isDueForReview = (activityId: string): boolean => {
  const p = getActivityProgress(activityId);
  if (!p) return false;
  return Date.now() >= p.nextReviewAt;
};

const isStruggling = (activity: LearningActivity): boolean => {
  const p = getActivityProgress(activity.id);
  if (!p) return false;
  return p.attempts >= 2 && p.correctRate < activity.masteryThreshold * 0.8;
};

// ---------------------------------------------------------------------------
// Session plan generator
// ---------------------------------------------------------------------------

/**
 * Generate a personalised session plan for the given age.
 *
 * @param age - Player age (uses stored profile if omitted)
 * @param maxActivities - Maximum number of activities in the session (default 5)
 * @returns SessionPlan with ordered activities
 */
export const generateSessionPlan = (age?: number, maxActivities = 5): SessionPlan => {
  const bucket = getAgeBucket(age);
  const eligible = ACTIVITIES.filter((a) => a.ageBuckets.includes(bucket));

  const activities: SessionActivity[] = [];

  // 1. Remediation — struggling activities with high priority
  for (const act of eligible) {
    if (isStruggling(act) && isUnlocked(act)) {
      activities.push({ activity: act, reason: "remediation", priority: 100 });
    }
  }

  // 2. Reviews due
  for (const act of eligible) {
    if (isMastered(act) && isDueForReview(act.id) && !activities.find((a) => a.activity.id === act.id)) {
      activities.push({ activity: act, reason: "review", priority: 60 });
    }
  }

  // 3. New unlocked activities
  for (const act of eligible) {
    const p = getActivityProgress(act.id);
    if (!p && isUnlocked(act) && !activities.find((a) => a.activity.id === act.id)) {
      activities.push({ activity: act, reason: "new", priority: 40 });
    }
  }

  // Sort by priority desc, then take top N
  activities.sort((a, b) => b.priority - a.priority);
  const selected = activities.slice(0, maxActivities);

  return {
    activities: selected,
    estimatedMinutes: selected.reduce((sum, a) => sum + a.activity.estimatedMinutes, 0),
    ageBucket: bucket,
  };
};

/**
 * Get all activities available for the current age bucket, grouped by status.
 */
export const getProgressOverview = (age?: number) => {
  const bucket = getAgeBucket(age);
  const eligible = ACTIVITIES.filter((a) => a.ageBuckets.includes(bucket));

  return {
    mastered: eligible.filter(isMastered),
    inProgress: eligible.filter((a) => {
      const p = getActivityProgress(a.id);
      return p && !isMastered(a);
    }),
    unlocked: eligible.filter((a) => isUnlocked(a) && !getActivityProgress(a.id)),
    locked: eligible.filter((a) => !isUnlocked(a)),
    remediation: eligible.filter(isStruggling),
  };
};
