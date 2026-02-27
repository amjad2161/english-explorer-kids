import { getProgress, LearningProgress } from "./progress";

export interface LevelStage {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  emoji: string;
  type: "alphabet" | "words" | "quiz" | "memory" | "spelling" | "scramble" | "hangman" | "pattern";
  // For alphabet: which letters (indices)
  letterRange?: [number, number];
  // For words: which category indices
  categoryIndices?: number[];
  // Stars needed to complete
  starsToComplete: number;
}

export interface Level {
  id: number;
  name: string;
  nameEn: string;
  emoji: string;
  color: string;
  gradient: string;
  starsToUnlock: number; // total stars needed to unlock this level
  stages: LevelStage[];
}

export const levels: Level[] = [
  {
    id: 1,
    name: "צעדים ראשונים",
    nameEn: "First Steps",
    emoji: "🌱",
    color: "grass",
    gradient: "gradient-grass",
    starsToUnlock: 0,   // Always available
    stages: [
      { id: "1-1", title: "אותיות A-I", titleEn: "Letters A-I", description: "למד את 9 האותיות הראשונות", emoji: "🔤", type: "alphabet", letterRange: [0, 8], starsToComplete: 5 },
      { id: "1-2", title: "חיות", titleEn: "Animals", description: "למד שמות של חיות באנגלית", emoji: "🐾", type: "words", categoryIndices: [0], starsToComplete: 4 },
      { id: "1-3", title: "צבעים", titleEn: "Colors", description: "למד את הצבעים באנגלית", emoji: "🎨", type: "words", categoryIndices: [1], starsToComplete: 4 },
      { id: "1-4", title: "מרוץ איות", titleEn: "Spelling Bee", description: "סדר אותיות ובנה מילים!", emoji: "🐝", type: "spelling", starsToComplete: 3 },
    ],
  },
  {
    id: 2,
    name: "מתקדמים!",
    nameEn: "Moving Up",
    emoji: "🚀",
    color: "sky",
    gradient: "gradient-sky",
    starsToUnlock: 12,  // Earn ~75% of Level 1's 16 max stars
    stages: [
      { id: "2-1", title: "אותיות J-R", titleEn: "Letters J-R", description: "למד עוד 9 אותיות", emoji: "🔤", type: "alphabet", letterRange: [9, 17], starsToComplete: 5 },
      { id: "2-2", title: "מספרים", titleEn: "Numbers", description: "למד מספרים באנגלית", emoji: "🔢", type: "words", categoryIndices: [2], starsToComplete: 4 },
      { id: "2-3", title: "פירות", titleEn: "Fruits", description: "למד שמות של פירות", emoji: "🍎", type: "words", categoryIndices: [3], starsToComplete: 4 },
      { id: "2-4", title: "חידון רמה 1", titleEn: "Quiz Level 1", description: "בדוק מה למדת עד כה!", emoji: "🎯", type: "quiz", starsToComplete: 3 },
      { id: "2-5", title: "מילים מבולבלות", titleEn: "Word Scramble", description: "פענח מילים מעורבבות!", emoji: "🔀", type: "scramble", starsToComplete: 3 },
    ],
  },
  {
    id: 3,
    name: "חוקר מילים",
    nameEn: "Word Explorer",
    emoji: "🔍",
    color: "sunshine",
    gradient: "gradient-primary",
    starsToUnlock: 28,  // Earn most of Levels 1+2 (35 max) stars
    stages: [
      { id: "3-1", title: "אותיות S-Z", titleEn: "Letters S-Z", description: "השלם את כל האלפבית!", emoji: "🔤", type: "alphabet", letterRange: [18, 25], starsToComplete: 5 },
      { id: "3-2", title: "חלקי גוף", titleEn: "Body Parts", description: "למד חלקי גוף באנגלית", emoji: "🦵", type: "words", categoryIndices: [4], starsToComplete: 4 },
      { id: "3-3", title: "משפחה", titleEn: "Family", description: "למד מילים על המשפחה", emoji: "👨‍👩‍👧‍👦", type: "words", categoryIndices: [5], starsToComplete: 4 },
      { id: "3-4", title: "משחק התאמה", titleEn: "Memory Match", description: "התאם מילים לתמונות!", emoji: "🧩", type: "memory", starsToComplete: 3 },
      { id: "3-5", title: "נחש את המילה", titleEn: "Hangman", description: "גלה את המילה הנסתרת!", emoji: "🎭", type: "hangman", starsToComplete: 3 },
      { id: "3-6", title: "איות מתקדם", titleEn: "Advanced Spelling", description: "מרוץ איות עם טיימר!", emoji: "🐝", type: "spelling", starsToComplete: 4 },
      { id: "3-7", title: "פאזל דפוסים", titleEn: "Pattern Puzzle", description: "פתור דפוסים ורצפים!", emoji: "🔮", type: "pattern", starsToComplete: 3 },
    ],
  },
  {
    id: 4,
    name: "אלוף אנגלית!",
    nameEn: "English Champion",
    emoji: "🏆",
    color: "candy",
    gradient: "gradient-candy",
    starsToUnlock: 50,  // Earn most of Levels 1+2+3 (61 max) stars
    stages: [
      { id: "4-1", title: "בית ספר", titleEn: "School", description: "למד מילים על בית הספר", emoji: "🏫", type: "words", categoryIndices: [6], starsToComplete: 4 },
      { id: "4-2", title: "אוכל", titleEn: "Food", description: "למד שמות של מאכלים", emoji: "🍕", type: "words", categoryIndices: [7], starsToComplete: 4 },
      { id: "4-3", title: "בגדים וטבע", titleEn: "Clothes & Nature", description: "קטגוריות חדשות!", emoji: "👕", type: "words", categoryIndices: [8, 9], starsToComplete: 4 },
      { id: "4-4", title: "חידון מאסטר", titleEn: "Master Quiz", description: "החידון הגדול!", emoji: "🎯", type: "quiz", starsToComplete: 4 },
      { id: "4-5", title: "בלבול מאסטר", titleEn: "Master Scramble", description: "מילים מבולבלות ברמה גבוהה!", emoji: "🔀", type: "scramble", starsToComplete: 4 },
      { id: "4-6", title: "ניחוש מאסטר", titleEn: "Master Hangman", description: "נחש מילים קשות!", emoji: "🎭", type: "hangman", starsToComplete: 4 },
      { id: "4-7", title: "התאמה מאסטר", titleEn: "Master Match", description: "משחק התאמה מתקדם!", emoji: "🧩", type: "memory", starsToComplete: 3 },
    ],
  },
];

export interface StageProgress {
  stageId: string;
  starsEarned: number;
  completed: boolean;
}

export const getStageProgress = (stageId: string): StageProgress => {
  try {
    const stored = localStorage.getItem(`stage-${stageId}`);
    if (stored) return JSON.parse(stored);
  } catch { /* ignored */ }
  return { stageId, starsEarned: 0, completed: false };
};

export const saveStageProgress = (stageId: string, stars: number) => {
  const existing = getStageProgress(stageId);
  const updated: StageProgress = {
    stageId,
    starsEarned: Math.max(existing.starsEarned, stars),
    completed: true,
  };
  localStorage.setItem(`stage-${stageId}`, JSON.stringify(updated));
};

export const getTotalEarnedStars = (): number => {
  let total = 0;
  for (const level of levels) {
    for (const stage of level.stages) {
      const p = getStageProgress(stage.id);
      total += p.starsEarned;
    }
  }
  return total;
};

export const isLevelUnlocked = (level: Level): boolean => {
  return getTotalEarnedStars() >= level.starsToUnlock;
};

export const isStageUnlocked = (level: Level, stageIndex: number): boolean => {
  if (stageIndex === 0) return true; // First stage of a level always unlocked
  const prevStage = level.stages[stageIndex - 1];
  return getStageProgress(prevStage.id).completed;
};

export const getLevelProgress = (level: Level): { completed: number; total: number; stars: number } => {
  let completed = 0;
  let stars = 0;
  for (const stage of level.stages) {
    const p = getStageProgress(stage.id);
    if (p.completed) completed++;
    stars += p.starsEarned;
  }
  return { completed, total: level.stages.length, stars };
};

export const getCurrentLevel = (): number => {
  const stars = getTotalEarnedStars();
  let current = 1;
  for (const level of levels) {
    if (stars >= level.starsToUnlock) current = level.id;
  }
  return current;
};
