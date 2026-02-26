import { getTotalEarnedStars, levels, getStageProgress } from "./levels";

export interface Achievement {
  id: string;
  emoji: string;
  tier: "bronze" | "silver" | "gold" | "diamond";
  check: () => boolean;
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: number;
}

const STORAGE_KEY = "achievements-unlocked";

// ─── Achievement Definitions ───
export const achievements: Achievement[] = [
  // Stars
  { id: "stars_5", emoji: "⭐", tier: "bronze", check: () => getTotalEarnedStars() >= 5 },
  { id: "stars_20", emoji: "🌟", tier: "silver", check: () => getTotalEarnedStars() >= 20 },
  { id: "stars_50", emoji: "💫", tier: "gold", check: () => getTotalEarnedStars() >= 50 },
  { id: "stars_100", emoji: "✨", tier: "diamond", check: () => getTotalEarnedStars() >= 100 },

  // Stages completed
  { id: "stages_3", emoji: "🎯", tier: "bronze", check: () => countCompletedStages() >= 3 },
  { id: "stages_10", emoji: "🏅", tier: "silver", check: () => countCompletedStages() >= 10 },
  { id: "stages_20", emoji: "🥇", tier: "gold", check: () => countCompletedStages() >= 20 },

  // Perfect scores (5 stars)
  { id: "perfect_1", emoji: "💎", tier: "bronze", check: () => countPerfectStages() >= 1 },
  { id: "perfect_5", emoji: "👑", tier: "silver", check: () => countPerfectStages() >= 5 },
  { id: "perfect_10", emoji: "🏆", tier: "gold", check: () => countPerfectStages() >= 10 },

  // Level unlocks
  { id: "level_2", emoji: "🚀", tier: "bronze", check: () => getTotalEarnedStars() >= 10 },
  { id: "level_3", emoji: "🔍", tier: "silver", check: () => getTotalEarnedStars() >= 22 },
  { id: "level_4", emoji: "🏆", tier: "gold", check: () => getTotalEarnedStars() >= 40 },

  // Game-specific
  { id: "first_quiz", emoji: "🧠", tier: "bronze", check: () => hasCompletedGameType("quiz") },
  { id: "first_spelling", emoji: "🐝", tier: "bronze", check: () => hasCompletedGameType("spelling") },
  { id: "first_scramble", emoji: "🔀", tier: "bronze", check: () => hasCompletedGameType("scramble") },
  { id: "first_hangman", emoji: "🎭", tier: "bronze", check: () => hasCompletedGameType("hangman") },
  { id: "first_memory", emoji: "🧩", tier: "bronze", check: () => hasCompletedGameType("memory") },
  { id: "all_games", emoji: "🎮", tier: "gold", check: () => ["quiz","spelling","scramble","hangman","memory"].every(t => hasCompletedGameType(t)) },

  // Streaks (from localStorage)
  { id: "streak_3", emoji: "🔥", tier: "bronze", check: () => getBestStreak() >= 3 },
  { id: "streak_5", emoji: "🔥", tier: "silver", check: () => getBestStreak() >= 5 },
  { id: "streak_10", emoji: "🔥", tier: "gold", check: () => getBestStreak() >= 10 },

  // Words learned
  { id: "words_10", emoji: "📖", tier: "bronze", check: () => getLearnedWordsCount() >= 10 },
  { id: "words_50", emoji: "📚", tier: "silver", check: () => getLearnedWordsCount() >= 50 },
  { id: "words_100", emoji: "🎓", tier: "gold", check: () => getLearnedWordsCount() >= 100 },

  // Letters learned
  { id: "letters_13", emoji: "🔤", tier: "bronze", check: () => getLearnedLettersCount() >= 13 },
  { id: "letters_26", emoji: "🅰️", tier: "gold", check: () => getLearnedLettersCount() >= 26 },
];

// ─── Translation keys ───
export const achievementNames: Record<string, { he: string; ar: string; en: string }> = {
  stars_5: { he: "אספן כוכבים", ar: "جامع النجوم", en: "Star Collector" },
  stars_20: { he: "כוכב עולה", ar: "نجم صاعد", en: "Rising Star" },
  stars_50: { he: "סופרסטאר", ar: "سوبر ستار", en: "Superstar" },
  stars_100: { he: "אגדה!", ar: "أسطورة!", en: "Legend!" },
  stages_3: { he: "התחלה טובה", ar: "بداية جيدة", en: "Good Start" },
  stages_10: { he: "שחקן מנוסה", ar: "لاعب متمرس", en: "Experienced" },
  stages_20: { he: "אלוף השלבים", ar: "بطل المراحل", en: "Stage Champion" },
  perfect_1: { he: "שלמות ראשונה", ar: "الكمال الأول", en: "First Perfect" },
  perfect_5: { he: "שאפתן", ar: "طموح", en: "Perfectionist" },
  perfect_10: { he: "מושלם!", ar: "مثالي!", en: "Flawless!" },
  level_2: { he: "מתקדם!", ar: "متقدم!", en: "Level Up!" },
  level_3: { he: "חוקר", ar: "مستكشف", en: "Explorer" },
  level_4: { he: "אלוף!", ar: "بطل!", en: "Champion!" },
  first_quiz: { he: "חידון ראשון", ar: "أول اختبار", en: "First Quiz" },
  first_spelling: { he: "מאיית מתחיל", ar: "مبتدئ التهجئة", en: "Spelling Start" },
  first_scramble: { he: "מפענח", ar: "فك الشفرة", en: "Unscrambler" },
  first_hangman: { he: "מנחש", ar: "المخمّن", en: "Guesser" },
  first_memory: { he: "זיכרון חד", ar: "ذاكرة حادة", en: "Sharp Memory" },
  all_games: { he: "שחקן מושלם", ar: "لاعب كامل", en: "All-Rounder" },
  streak_3: { he: "רצף חם", ar: "سلسلة حارة", en: "Hot Streak" },
  streak_5: { he: "בוער!", ar: "مشتعل!", en: "On Fire!" },
  streak_10: { he: "בלתי ניתן לעצירה", ar: "لا يُوقف", en: "Unstoppable" },
  words_10: { he: "לומד מילים", ar: "متعلم كلمات", en: "Word Learner" },
  words_50: { he: "אוצר מילים", ar: "ثروة لغوية", en: "Vocabulary Pro" },
  words_100: { he: "מילוני!", ar: "خبير لغوي!", en: "Word Master!" },
  letters_13: { he: "חצי אלפבית", ar: "نصف الأبجدية", en: "Half ABC" },
  letters_26: { he: "כל האלפבית!", ar: "كل الأبجدية!", en: "Full ABC!" },
};

export const achievementDescs: Record<string, { he: string; ar: string; en: string }> = {
  stars_5: { he: "אסוף 5 כוכבים", ar: "اجمع 5 نجوم", en: "Collect 5 stars" },
  stars_20: { he: "אסוף 20 כוכבים", ar: "اجمع 20 نجمة", en: "Collect 20 stars" },
  stars_50: { he: "אסוף 50 כוכבים", ar: "اجمع 50 نجمة", en: "Collect 50 stars" },
  stars_100: { he: "אסוף 100 כוכבים", ar: "اجمع 100 نجمة", en: "Collect 100 stars" },
  stages_3: { he: "השלם 3 שלבים", ar: "أكمل 3 مراحل", en: "Complete 3 stages" },
  stages_10: { he: "השלם 10 שלבים", ar: "أكمل 10 مراحل", en: "Complete 10 stages" },
  stages_20: { he: "השלם 20 שלבים", ar: "أكمل 20 مرحلة", en: "Complete 20 stages" },
  perfect_1: { he: "קבל 5 כוכבים בשלב", ar: "احصل على 5 نجوم في مرحلة", en: "Get 5 stars in a stage" },
  perfect_5: { he: "קבל 5 כוכבים ב-5 שלבים", ar: "احصل على 5 نجوم في 5 مراحل", en: "Get 5 stars in 5 stages" },
  perfect_10: { he: "קבל 5 כוכבים ב-10 שלבים", ar: "احصل على 5 نجوم في 10 مراحل", en: "Get 5 stars in 10 stages" },
  level_2: { he: "פתח רמה 2", ar: "افتح المستوى 2", en: "Unlock level 2" },
  level_3: { he: "פתח רמה 3", ar: "افتح المستوى 3", en: "Unlock level 3" },
  level_4: { he: "פתח רמה 4", ar: "افتح المستوى 4", en: "Unlock level 4" },
  first_quiz: { he: "השלם חידון ראשון", ar: "أكمل أول اختبار", en: "Complete first quiz" },
  first_spelling: { he: "השלם משחק איות", ar: "أكمل لعبة تهجئة", en: "Complete a spelling game" },
  first_scramble: { he: "השלם מילים מבולבלות", ar: "أكمل كلمات مخلوطة", en: "Complete word scramble" },
  first_hangman: { he: "השלם ניחוש מילה", ar: "أكمل تخمين كلمة", en: "Complete hangman" },
  first_memory: { he: "השלם משחק זיכרון", ar: "أكمل لعبة ذاكرة", en: "Complete memory game" },
  all_games: { he: "שחק בכל סוגי המשחקים", ar: "العب جميع أنواع الألعاب", en: "Play all game types" },
  streak_3: { he: "רצף של 3 תשובות נכונות", ar: "سلسلة من 3 إجابات صحيحة", en: "3 correct in a row" },
  streak_5: { he: "רצף של 5 תשובות נכונות", ar: "سلسلة من 5 إجابات صحيحة", en: "5 correct in a row" },
  streak_10: { he: "רצף של 10 תשובות נכונות", ar: "سلسلة من 10 إجابات صحيحة", en: "10 correct in a row" },
  words_10: { he: "למד 10 מילים", ar: "تعلم 10 كلمات", en: "Learn 10 words" },
  words_50: { he: "למד 50 מילים", ar: "تعلم 50 كلمة", en: "Learn 50 words" },
  words_100: { he: "למד 100 מילים", ar: "تعلم 100 كلمة", en: "Learn 100 words" },
  letters_13: { he: "למד 13 אותיות", ar: "تعلم 13 حرف", en: "Learn 13 letters" },
  letters_26: { he: "למד את כל ה-26 אותיות", ar: "تعلم كل الـ26 حرف", en: "Learn all 26 letters" },
};

// ─── Helper functions ───
function countCompletedStages(): number {
  let count = 0;
  for (const level of levels) {
    for (const stage of level.stages) {
      if (getStageProgress(stage.id).completed) count++;
    }
  }
  return count;
}

function countPerfectStages(): number {
  let count = 0;
  for (const level of levels) {
    for (const stage of level.stages) {
      if (getStageProgress(stage.id).starsEarned >= 5) count++;
    }
  }
  return count;
}

function hasCompletedGameType(type: string): boolean {
  for (const level of levels) {
    for (const stage of level.stages) {
      if (stage.type === type && getStageProgress(stage.id).completed) return true;
    }
  }
  return false;
}

function getBestStreak(): number {
  try {
    return parseInt(localStorage.getItem("best-streak-global") || "0", 10);
  } catch { return 0; }
}

export const saveBestStreak = (streak: number) => {
  const current = getBestStreak();
  if (streak > current) {
    localStorage.setItem("best-streak-global", String(streak));
  }
};

function getLearnedWordsCount(): number {
  try {
    const p = JSON.parse(localStorage.getItem("english-learning-progress") || "{}");
    return p.completedWords?.length || 0;
  } catch { return 0; }
}

function getLearnedLettersCount(): number {
  try {
    const p = JSON.parse(localStorage.getItem("english-learning-progress") || "{}");
    return p.completedLetters?.length || 0;
  } catch { return 0; }
}

// ─── Persistence ───
export const getUnlockedAchievements = (): UnlockedAchievement[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
};

const saveUnlocked = (unlocked: UnlockedAchievement[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
};

/**
 * Check all achievements and return any newly unlocked ones.
 */
export const checkAchievements = (): Achievement[] => {
  const unlocked = getUnlockedAchievements();
  const unlockedIds = new Set(unlocked.map(u => u.id));
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of achievements) {
    if (unlockedIds.has(achievement.id)) continue;
    if (achievement.check()) {
      newlyUnlocked.push(achievement);
      unlocked.push({ id: achievement.id, unlockedAt: Date.now() });
    }
  }

  if (newlyUnlocked.length > 0) {
    saveUnlocked(unlocked);
  }

  return newlyUnlocked;
};

export const tierColors: Record<string, string> = {
  bronze: "from-amber-600 to-amber-400",
  silver: "from-slate-400 to-slate-200",
  gold: "from-yellow-500 to-amber-300",
  diamond: "from-cyan-400 to-blue-300",
};

export const tierBorder: Record<string, string> = {
  bronze: "border-amber-500/40",
  silver: "border-slate-400/40",
  gold: "border-yellow-400/40",
  diamond: "border-cyan-400/40",
};
