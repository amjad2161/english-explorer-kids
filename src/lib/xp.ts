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
  } catch {}
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

// Daily challenge tracking
export const getDailyChallenge = (): { type: string; target: number; progress: number } => {
  const raw = localStorage.getItem(DAILY_KEY);
  const todayStr = today();
  
  if (raw) {
    const data = JSON.parse(raw);
    if (data.date === todayStr) return data;
  }

  const challenges = [
    { type: "quiz", target: 3 },
    { type: "words", target: 10 },
    { type: "spelling", target: 5 },
    { type: "memory", target: 2 },
  ];
  
  const challenge = challenges[Math.floor(Math.random() * challenges.length)];
  const data = { ...challenge, progress: 0, date: todayStr };
  localStorage.setItem(DAILY_KEY, JSON.stringify(data));
  return data;
};

export const updateDailyProgress = (type: string) => {
  const challenge = getDailyChallenge();
  if (challenge.type === type && challenge.progress < challenge.target) {
    challenge.progress += 1;
    localStorage.setItem(DAILY_KEY, JSON.stringify({ ...challenge, date: today() }));
    if (challenge.progress >= challenge.target) {
      addXP(50); // Bonus for completing daily challenge
    }
  }
};
