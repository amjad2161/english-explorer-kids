// XP & Leveling System
const XP_KEY = "english-fun-xp";
const DAILY_KEY = "english-fun-daily";

export interface XPState {
  totalXP: number;
  dailyXP: number;
  lastDate: string;
  streak: number;
}

const today = () => new Date().toISOString().slice(0, 10);

export const getXP = (): XPState => {
  try {
    const raw = localStorage.getItem(XP_KEY);
    if (raw) {
      const state: XPState = JSON.parse(raw);
      // Reset daily if new day
      if (state.lastDate !== today()) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const wasYesterday = state.lastDate === yesterday.toISOString().slice(0, 10);
        state.dailyXP = 0;
        state.streak = wasYesterday ? state.streak : 0;
        state.lastDate = today();
        saveXP(state);
      }
      return state;
    }
  } catch { /* ignored */ }
  return { totalXP: 0, dailyXP: 0, lastDate: today(), streak: 0 };
};

export const saveXP = (state: XPState) => localStorage.setItem(XP_KEY, JSON.stringify(state));

export const addXP = (amount: number): XPState => {
  const state = getXP();
  const wasZero = state.dailyXP === 0;
  state.totalXP += amount;
  state.dailyXP += amount;
  state.lastDate = today();
  if (wasZero) state.streak += 1;
  saveXP(state);
  return state;
};

export const getLevel = (xp: number): { level: number; current: number; needed: number; title: string } => {
  const thresholds = [0, 50, 150, 300, 500, 800, 1200, 1800, 2500, 3500, 5000];
  const titles = ["🌱 Seedling", "🌿 Sprout", "🌻 Bloom", "🌳 Tree", "⭐ Star", "🌟 Superstar", "🏆 Champion", "👑 Master", "💎 Diamond", "🔥 Legend", "🦉 Owl Sage"];
  
  let level = 0;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) { level = i; break; }
  }

  const current = xp - thresholds[level];
  const needed = (thresholds[level + 1] || thresholds[level] + 1000) - thresholds[level];

  return { level: level + 1, current, needed, title: titles[level] || titles[titles.length - 1] };
};

// Daily challenge system with rich variety
export interface DailyChallenge {
  type: string;
  target: number;
  progress: number;
  date: string;
  title: Record<string, string>;
  description: Record<string, string>;
  emoji: string;
  xpReward: number;
  claimed: boolean;
  path: string;
}

const challengeTemplates = [
  { type: "quiz", target: 3, emoji: "🎯", xpReward: 50, path: "/quiz",
    title: { he: "מאסטר חידון", ar: "سيد الاختبارات", en: "Quiz Master" },
    description: { he: "השלם 3 חידונים היום", ar: "أكمل 3 اختبارات اليوم", en: "Complete 3 quizzes today" } },
  { type: "words", target: 10, emoji: "📚", xpReward: 40, path: "/words",
    title: { he: "אספן מילים", ar: "جامع الكلمات", en: "Word Collector" },
    description: { he: "למד 10 מילים חדשות", ar: "تعلم 10 كلمات جديدة", en: "Learn 10 new words" } },
  { type: "spelling", target: 5, emoji: "🐝", xpReward: 60, path: "/spelling",
    title: { he: "דבורת איות", ar: "نحلة التهجئة", en: "Spelling Star" },
    description: { he: "השלם 5 סיבובי איות", ar: "أكمل 5 جولات تهجئة", en: "Complete 5 spelling rounds" } },
  { type: "memory", target: 2, emoji: "🧩", xpReward: 45, path: "/memory",
    title: { he: "אלוף הזיכרון", ar: "بطل الذاكرة", en: "Memory Champ" },
    description: { he: "נצח 2 משחקי זיכרון", ar: "اربح لعبتي ذاكرة", en: "Win 2 memory games" } },
  { type: "scramble", target: 4, emoji: "🔀", xpReward: 55, path: "/scramble",
    title: { he: "פותר בלבולים", ar: "حلّال الألغاز", en: "Unscrambler" },
    description: { he: "פתור 4 בלבולי מילים", ar: "حل 4 ألغاز كلمات", en: "Solve 4 word scrambles" } },
  { type: "hangman", target: 3, emoji: "🎭", xpReward: 50, path: "/hangman",
    title: { he: "שומר המילים", ar: "حارس الكلمات", en: "Word Guardian" },
    description: { he: "נצח 3 משחקי ניחוש", ar: "اربح 3 ألعاب تخمين", en: "Win 3 hangman games" } },
  { type: "alphabet", target: 8, emoji: "🔤", xpReward: 35, path: "/alphabet",
    title: { he: "חוקר אותיות", ar: "مستكشف الحروف", en: "Letter Explorer" },
    description: { he: "למד 8 אותיות", ar: "تعلم 8 حروف", en: "Study 8 letters" } },
];

// Seeded random based on date for consistency
const dateSeed = (dateStr: string) => {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getDailyChallenge = (): DailyChallenge => {
  const raw = localStorage.getItem(DAILY_KEY);
  const todayStr = today();
  
  if (raw) {
    try {
      const data = JSON.parse(raw);
      if (data.date === todayStr && data.title) return data;
    } catch { /* ignored */ }
  }

  // Pick challenge based on date (deterministic)
  const seed = dateSeed(todayStr);
  const template = challengeTemplates[seed % challengeTemplates.length];
  const data: DailyChallenge = { ...template, progress: 0, date: todayStr, claimed: false };
  localStorage.setItem(DAILY_KEY, JSON.stringify(data));
  return data;
};

export const updateDailyProgress = (type: string): DailyChallenge => {
  const challenge = getDailyChallenge();
  if (challenge.type === type && challenge.progress < challenge.target) {
    challenge.progress += 1;
    localStorage.setItem(DAILY_KEY, JSON.stringify(challenge));
  }
  return challenge;
};

export const claimDailyReward = (): number => {
  const challenge = getDailyChallenge();
  if (challenge.progress >= challenge.target && !challenge.claimed) {
    challenge.claimed = true;
    localStorage.setItem(DAILY_KEY, JSON.stringify(challenge));
    addXP(challenge.xpReward);
    return challenge.xpReward;
  }
  return 0;
};
