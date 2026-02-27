/**
 * Age-Adaptive Profile System
 * 
 * Manages learner profiles with age-based content adaptation.
 * 4 age groups with distinct difficulty, vocabulary, and UI adjustments.
 */

const PROFILE_KEY = "english-fun-profile";

export type AgeGroup = "toddler" | "child" | "preteen" | "teen";

export interface LearnerProfile {
  name: string;
  age: number;
  ageGroup: AgeGroup;
  avatar: string;
  createdAt: string;
  parentPin?: string; // 4-digit PIN for parent dashboard
}

export interface AgeGroupConfig {
  id: AgeGroup;
  label: Record<string, string>;
  ageRange: string;
  emoji: string;
  description: Record<string, string>;
  difficultyMultiplier: number;
  maxWordLength: number;
  timerMultiplier: number; // Higher = more time
  hintsAllowed: number;
  showPhonetics: boolean;
  fontSize: "lg" | "md" | "sm";
  animationIntensity: "high" | "medium" | "low";
}

export const AGE_GROUPS: AgeGroupConfig[] = [
  {
    id: "toddler",
    label: { he: "גילאי 0-4", ar: "الأعمار 0-4", en: "Ages 0-4" },
    ageRange: "0-4",
    emoji: "🧒",
    description: {
      he: "משחקים חזותיים, אותיות גדולות, צבעים ובעלי חיים",
      ar: "ألعاب بصرية، حروف كبيرة، ألوان وحيوانات",
      en: "Visual games, large letters, colors & animals",
    },
    difficultyMultiplier: 0.5,
    maxWordLength: 4,
    timerMultiplier: 2.0,
    hintsAllowed: 5,
    showPhonetics: true,
    fontSize: "lg",
    animationIntensity: "high",
  },
  {
    id: "child",
    label: { he: "גילאי 5-7", ar: "الأعمار 5-7", en: "Ages 5-7" },
    ageRange: "5-7",
    emoji: "👦",
    description: {
      he: "למידת מילים, איות בסיסי, משחקי זיכרון",
      ar: "تعلم الكلمات، تهجئة أساسية، ألعاب ذاكرة",
      en: "Word learning, basic spelling, memory games",
    },
    difficultyMultiplier: 0.75,
    maxWordLength: 6,
    timerMultiplier: 1.5,
    hintsAllowed: 3,
    showPhonetics: true,
    fontSize: "md",
    animationIntensity: "high",
  },
  {
    id: "preteen",
    label: { he: "גילאי 8-11", ar: "الأعمار 8-11", en: "Ages 8-11" },
    ageRange: "8-11",
    emoji: "🧑",
    description: {
      he: "משפטים, איות מתקדם, אתגרים לוגיים",
      ar: "جمل، تهجئة متقدمة، تحديات منطقية",
      en: "Sentences, advanced spelling, logic challenges",
    },
    difficultyMultiplier: 1.0,
    maxWordLength: 9,
    timerMultiplier: 1.0,
    hintsAllowed: 2,
    showPhonetics: false,
    fontSize: "md",
    animationIntensity: "medium",
  },
  {
    id: "teen",
    label: { he: "גילאי 12-14", ar: "الأعمار 12-14", en: "Ages 12-14" },
    ageRange: "12-14",
    emoji: "🧑‍🎓",
    description: {
      he: "אוצר מילים מתקדם, דקדוק, כתיבה יצירתית",
      ar: "مفردات متقدمة، قواعد، كتابة إبداعية",
      en: "Advanced vocabulary, grammar, creative writing",
    },
    difficultyMultiplier: 1.3,
    maxWordLength: 12,
    timerMultiplier: 0.8,
    hintsAllowed: 1,
    showPhonetics: false,
    fontSize: "sm",
    animationIntensity: "low",
  },
];

export const getAgeGroup = (age: number): AgeGroup => {
  if (age <= 4) return "toddler";
  if (age <= 7) return "child";
  if (age <= 11) return "preteen";
  return "teen";
};

export const getAgeGroupConfig = (group: AgeGroup): AgeGroupConfig => {
  return AGE_GROUPS.find(g => g.id === group) || AGE_GROUPS[1];
};

export const getProfile = (): LearnerProfile | null => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignored */ }
  return null;
};

export const saveProfile = (profile: LearnerProfile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const getActiveAgeConfig = (): AgeGroupConfig => {
  const profile = getProfile();
  if (profile) return getAgeGroupConfig(profile.ageGroup);
  return AGE_GROUPS[1]; // Default: child (5-7)
};

export const AVATAR_OPTIONS = [
  "🦊", "🐻", "🐼", "🦁", "🐸", "🐨", "🐯", "🦉",
  "🐙", "🦋", "🐝", "🐬", "🦄", "🐲", "🦜", "🐢",
];

// Session tracking for parent dashboard
const SESSION_KEY = "english-fun-sessions";

export interface SessionRecord {
  date: string;
  duration: number; // minutes
  gamesPlayed: string[];
  wordsLearned: number;
  xpEarned: number;
}

export const recordSession = (data: Omit<SessionRecord, "date">) => {
  const sessions = getSessions();
  sessions.push({ ...data, date: new Date().toISOString() });
  // Keep last 90 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const filtered = sessions.filter(s => new Date(s.date) > cutoff);
  localStorage.setItem(SESSION_KEY, JSON.stringify(filtered));
};

export const getSessions = (): SessionRecord[] => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignored */ }
  return [];
};

export const getWeeklyStats = () => {
  const sessions = getSessions();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekly = sessions.filter(s => new Date(s.date) > weekAgo);
  
  return {
    totalMinutes: weekly.reduce((sum, s) => sum + s.duration, 0),
    totalGames: weekly.reduce((sum, s) => sum + s.gamesPlayed.length, 0),
    totalWords: weekly.reduce((sum, s) => sum + s.wordsLearned, 0),
    totalXP: weekly.reduce((sum, s) => sum + s.xpEarned, 0),
    daysActive: new Set(weekly.map(s => s.date.slice(0, 10))).size,
  };
};
