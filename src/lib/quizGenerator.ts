import { getAllWords, wordCategories, WordCard, QuizQuestion } from "@/data/learningData";
import { Language } from "@/lib/i18n";

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
const pick = <T,>(arr: T[], n: number): T[] => shuffle(arr).slice(0, n);
const randItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

interface QuizTemplate {
  generate: (word: WordCard, allWords: WordCard[], lang: Language) => QuizQuestion | null;
}

const templates: QuizTemplate[] = [
  // "What is this emoji?" → pick word from emoji
  {
    generate: (word, allWords, lang) => {
      const distractors = pick(allWords.filter(w => w.category === word.category && w.english !== word.english), 3);
      if (distractors.length < 3) return null;
      const options = shuffle([word, ...distractors]);
      return {
        question: `What is ${word.emoji}?`,
        questionHebrew: `מה זה ${word.emoji}?`,
        questionArabic: `ما هذا ${word.emoji}؟`,
        options: options.map(o => o.english),
        correct: options.findIndex(o => o.english === word.english),
        emoji: word.emoji,
      };
    },
  },
  // "Translate to English"
  {
    generate: (word, allWords, lang) => {
      const translation = lang === "he" ? word.hebrew : word.arabic;
      const distractors = pick(allWords.filter(w => w.category === word.category && w.english !== word.english), 3);
      if (distractors.length < 3) return null;
      const options = shuffle([word, ...distractors]);
      return {
        question: `How do you say '${translation}' in English?`,
        questionHebrew: `איך אומרים '${word.hebrew}' באנגלית?`,
        questionArabic: `كيف تقول '${word.arabic}' بالإنجليزية؟`,
        options: options.map(o => o.english),
        correct: options.findIndex(o => o.english === word.english),
        emoji: word.emoji,
      };
    },
  },
  // "What does X mean?" → show English, pick translation
  {
    generate: (word, allWords, lang) => {
      const distractors = pick(allWords.filter(w => w.category === word.category && w.english !== word.english), 3);
      if (distractors.length < 3) return null;
      const options = shuffle([word, ...distractors]);
      const getTranslation = (w: WordCard) => lang === "he" ? w.hebrew : w.arabic;
      return {
        question: `What does '${word.english}' mean?`,
        questionHebrew: `מה המשמעות של '${word.english}'?`,
        questionArabic: `ما معنى '${word.english}'؟`,
        options: options.map(o => getTranslation(o)),
        correct: options.findIndex(o => o.english === word.english),
        emoji: word.emoji,
      };
    },
  },
  // "Which emoji matches X?"
  {
    generate: (word, allWords, lang) => {
      const distractors = pick(allWords.filter(w => w.category === word.category && w.english !== word.english), 3);
      if (distractors.length < 3) return null;
      const options = shuffle([word, ...distractors]);
      return {
        question: `Which emoji is '${word.english}'?`,
        questionHebrew: `איזה אימוג'י מתאים ל-'${word.english}'?`,
        questionArabic: `أي رمز تعبيري يمثل '${word.english}'؟`,
        options: options.map(o => o.emoji),
        correct: options.findIndex(o => o.english === word.english),
        emoji: "🤔",
      };
    },
  },
  // "Which word starts with letter X?"
  {
    generate: (word, allWords, lang) => {
      const firstLetter = word.english[0];
      const distractors = pick(
        allWords.filter(w => w.english[0] !== firstLetter && w.english !== word.english), 3
      );
      if (distractors.length < 3) return null;
      const options = shuffle([word, ...distractors]);
      return {
        question: `Which word starts with '${firstLetter}'?`,
        questionHebrew: `איזו מילה מתחילה באות '${firstLetter}'?`,
        questionArabic: `أي كلمة تبدأ بحرف '${firstLetter}'؟`,
        options: options.map(o => o.english),
        correct: options.findIndex(o => o.english === word.english),
        emoji: "🔤",
      };
    },
  },
  // "How many letters in X?"
  {
    generate: (word, allWords, lang) => {
      if (word.english.includes(" ")) return null;
      const len = word.english.length;
      const wrongLens = shuffle([len - 1, len + 1, len + 2].filter(n => n > 0));
      if (wrongLens.length < 3) return null;
      const options = shuffle([len, ...wrongLens.slice(0, 3)]);
      return {
        question: `How many letters in '${word.english}'?`,
        questionHebrew: `כמה אותיות במילה '${word.english}'?`,
        questionArabic: `كم حرف في كلمة '${word.english}'؟`,
        options: options.map(o => String(o)),
        correct: options.indexOf(len),
        emoji: "🔢",
      };
    },
  },
  // "Which one is NOT a [category]?"
  {
    generate: (word, allWords, lang) => {
      const catName = wordCategories.find(c => c.words.some(w => w.english === word.english));
      if (!catName) return null;
      const outsider = randItem(allWords.filter(w => w.category !== word.category));
      if (!outsider) return null;
      const sameCategory = pick(allWords.filter(w => w.category === word.category && w.english !== word.english), 2);
      if (sameCategory.length < 2) return null;
      const options = shuffle([...sameCategory, word, outsider]);
      return {
        question: `Which one is NOT in the '${catName.nameEn}' category?`,
        questionHebrew: `מה לא שייך לקטגוריית '${catName.name}'?`,
        questionArabic: `أي واحد لا ينتمي لفئة '${catName.nameAr}'؟`,
        options: options.map(o => `${o.emoji} ${o.english}`),
        correct: options.findIndex(o => o.english === outsider.english),
        emoji: "🚫",
      };
    },
  },
];

/**
 * Generate N unique dynamic quiz questions with fully shuffled options each time.
 */
export const generateDynamicQuiz = (count: number, lang: Language): QuizQuestion[] => {
  const allWords = getAllWords();
  const questions: QuizQuestion[] = [];
  const usedWords = new Set<string>();
  let attempts = 0;

  while (questions.length < count && attempts < count * 10) {
    attempts++;
    const word = randItem(allWords);
    if (usedWords.has(word.english)) continue;

    const template = randItem(templates);
    const q = template.generate(word, allWords, lang);
    if (q) {
      questions.push(q);
      usedWords.add(word.english);
    }
  }

  return shuffle(questions);
};
