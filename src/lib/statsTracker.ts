// Daily activity tracking for stats & graphs
const STATS_KEY = "english-fun-stats";

export interface DailyStats {
  date: string; // YYYY-MM-DD
  xpEarned: number;
  gamesPlayed: number;
  wordsLearned: number;
  lettersLearned: number;
  correctAnswers: number;
  wrongAnswers: number;
  timeSpentSeconds: number;
  gameBreakdown: Record<string, number>; // game type -> count
}

export interface StatsHistory {
  days: DailyStats[];
  totalGamesPlayed: number;
  totalCorrectAnswers: number;
  totalWrongAnswers: number;
  longestDayStreak: number;
  currentDayStreak: number;
  firstPlayDate: string;
}

const today = () => new Date().toISOString().slice(0, 10);

export const getStatsHistory = (): StatsHistory => {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignored */ }
  return {
    days: [],
    totalGamesPlayed: 0,
    totalCorrectAnswers: 0,
    totalWrongAnswers: 0,
    longestDayStreak: 0,
    currentDayStreak: 0,
    firstPlayDate: today(),
  };
};

const saveStats = (stats: StatsHistory) => {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
};

const getTodayStats = (stats: StatsHistory): DailyStats => {
  const todayStr = today();
  let dayStats = stats.days.find(d => d.date === todayStr);
  if (!dayStats) {
    dayStats = {
      date: todayStr,
      xpEarned: 0,
      gamesPlayed: 0,
      wordsLearned: 0,
      lettersLearned: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      timeSpentSeconds: 0,
      gameBreakdown: {},
    };
    stats.days.push(dayStats);
    // Keep only last 60 days
    if (stats.days.length > 60) {
      stats.days = stats.days.slice(-60);
    }
    // Update day streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    const playedYesterday = stats.days.some(d => d.date === yesterdayStr && d.gamesPlayed > 0);
    if (playedYesterday) {
      stats.currentDayStreak += 1;
    } else {
      stats.currentDayStreak = 1;
    }
    stats.longestDayStreak = Math.max(stats.longestDayStreak, stats.currentDayStreak);
  }
  return dayStats;
};

export const trackGamePlayed = (gameType: string, correct: number, wrong: number, xp: number) => {
  const stats = getStatsHistory();
  const day = getTodayStats(stats);
  day.gamesPlayed += 1;
  day.correctAnswers += correct;
  day.wrongAnswers += wrong;
  day.xpEarned += xp;
  day.gameBreakdown[gameType] = (day.gameBreakdown[gameType] || 0) + 1;
  stats.totalGamesPlayed += 1;
  stats.totalCorrectAnswers += correct;
  stats.totalWrongAnswers += wrong;
  saveStats(stats);
};

export const trackWordLearned = () => {
  const stats = getStatsHistory();
  const day = getTodayStats(stats);
  day.wordsLearned += 1;
  saveStats(stats);
};

export const trackLetterLearned = () => {
  const stats = getStatsHistory();
  const day = getTodayStats(stats);
  day.lettersLearned += 1;
  saveStats(stats);
};

export const trackTimeSpent = (seconds: number) => {
  const stats = getStatsHistory();
  const day = getTodayStats(stats);
  day.timeSpentSeconds += seconds;
  saveStats(stats);
};

// Get last N days of stats, filling in gaps with empty days
export const getLastNDays = (n: number): DailyStats[] => {
  const stats = getStatsHistory();
  const result: DailyStats[] = [];
  const now = new Date();
  
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const existing = stats.days.find(day => day.date === dateStr);
    result.push(existing || {
      date: dateStr,
      xpEarned: 0,
      gamesPlayed: 0,
      wordsLearned: 0,
      lettersLearned: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      timeSpentSeconds: 0,
      gameBreakdown: {},
    });
  }
  
  return result;
};

// Get weekly summary
export const getWeeklySummary = () => {
  const last7 = getLastNDays(7);
  return {
    totalXP: last7.reduce((a, d) => a + d.xpEarned, 0),
    totalGames: last7.reduce((a, d) => a + d.gamesPlayed, 0),
    totalCorrect: last7.reduce((a, d) => a + d.correctAnswers, 0),
    totalWrong: last7.reduce((a, d) => a + d.wrongAnswers, 0),
    totalWords: last7.reduce((a, d) => a + d.wordsLearned, 0),
    activeDays: last7.filter(d => d.gamesPlayed > 0).length,
    avgAccuracy: (() => {
      const total = last7.reduce((a, d) => a + d.correctAnswers + d.wrongAnswers, 0);
      const correct = last7.reduce((a, d) => a + d.correctAnswers, 0);
      return total > 0 ? Math.round((correct / total) * 100) : 0;
    })(),
  };
};
