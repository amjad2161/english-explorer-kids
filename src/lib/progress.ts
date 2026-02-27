// Progress tracking with localStorage

export interface LearningProgress {
  completedLetters: string[];
  completedWords: string[];
  quizScores: number[];
  totalStars: number;
  currentStreak: number;
}

const STORAGE_KEY = 'english-learning-progress';

export const getProgress = (): LearningProgress => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* intentional */ }
  return {
    completedLetters: [],
    completedWords: [],
    quizScores: [],
    totalStars: 0,
    currentStreak: 0,
  };
};

export const saveProgress = (progress: LearningProgress) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

export const addCompletedLetter = (letter: string) => {
  const progress = getProgress();
  if (!progress.completedLetters.includes(letter)) {
    progress.completedLetters.push(letter);
    progress.totalStars += 1;
    saveProgress(progress);
  }
  return progress;
};

export const addCompletedWord = (word: string) => {
  const progress = getProgress();
  if (!progress.completedWords.includes(word)) {
    progress.completedWords.push(word);
    progress.totalStars += 1;
    saveProgress(progress);
  }
  return progress;
};

export const addQuizScore = (score: number) => {
  const progress = getProgress();
  progress.quizScores.push(score);
  progress.totalStars += score;
  progress.currentStreak += 1;
  saveProgress(progress);
  return progress;
};
