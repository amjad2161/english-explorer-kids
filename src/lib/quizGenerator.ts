import { getAllWords, wordCategories, WordCard, QuizQuestion } from "@/data/learningData";
import { getAllPhrases, Phrase, phraseGroups } from "@/data/phrasesData";
import { Language } from "@/lib/i18n";
import { getAdaptiveQuizParams, getWeakWords } from "@/lib/adaptiveDifficulty";

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const pick = <T,>(arr: T[], n: number): T[] => shuffle(arr).slice(0, n);
const randItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

interface QuizTemplate {
  generate: (word: WordCard, allWords: WordCard[], lang: Language) => QuizQuestion | null;
}

/* ── Phrase-based quiz template helpers ── */
interface PhraseQuizTemplate {
  generate: (phrase: Phrase, allPhrases: Phrase[], lang: Language) => QuizQuestion | null;
}

const phraseTemplates: PhraseQuizTemplate[] = [
  // "How do you say X in English?" (phrase edition)
  {
    generate: (phrase, allPhrases, lang) => {
      const translation = lang === "he" ? phrase.hebrew : phrase.arabic;
      const distractors = pick(allPhrases.filter(p => p.category === phrase.category && p.english !== phrase.english), 3);
      if (distractors.length < 3) return null;
      const options = shuffle([phrase, ...distractors]);
      return {
        question: `How do you say '${translation}' in English?`,
        questionHebrew: `איך אומרים '${phrase.hebrew}' באנגלית?`,
        questionArabic: `كيف تقول '${phrase.arabic}' بالإنجليزية؟`,
        options: options.map(o => o.english),
        correct: options.findIndex(o => o.english === phrase.english),
        emoji: phrase.emoji,
      };
    },
  },
  // "What does X mean?" (phrase edition)
  {
    generate: (phrase, allPhrases, lang) => {
      const distractors = pick(allPhrases.filter(p => p.category === phrase.category && p.english !== phrase.english), 3);
      if (distractors.length < 3) return null;
      const options = shuffle([phrase, ...distractors]);
      const getT = (p: Phrase) => lang === "he" ? p.hebrew : p.arabic;
      return {
        question: `What does '${phrase.english}' mean?`,
        questionHebrew: `מה המשמעות של '${phrase.english}'?`,
        questionArabic: `ما معنى '${phrase.english}'؟`,
        options: options.map(o => getT(o)),
        correct: options.findIndex(o => o.english === phrase.english),
        emoji: phrase.emoji,
      };
    },
  },
  // "Complete the phrase: I want to ___"
  {
    generate: (phrase, allPhrases, lang) => {
      if (!phrase.english.includes(" ")) return null;
      const words = phrase.english.split(" ");
      if (words.length < 3) return null;
      const lastWord = words[words.length - 1];
      const prefix = words.slice(0, -1).join(" ");
      const distractors = pick(
        allPhrases
          .filter(p => p.english !== phrase.english)
          .map(p => p.english.split(" ").pop()!)
          .filter(w => w !== lastWord),
        3
      );
      if (distractors.length < 3) return null;
      const options = shuffle([lastWord, ...distractors]);
      return {
        question: `Complete: "${prefix} ___"`,
        questionHebrew: `השלם: "${prefix} ___"`,
        questionArabic: `أكمل: "${prefix} ___"`,
        options,
        correct: options.indexOf(lastWord),
        emoji: phrase.emoji,
      };
    },
  },
  // "Which emoji matches this phrase?"
  {
    generate: (phrase, allPhrases, lang) => {
      const distractors = pick(allPhrases.filter(p => p.emoji !== phrase.emoji && p.category === phrase.category), 3);
      if (distractors.length < 3) return null;
      const options = shuffle([phrase, ...distractors]);
      return {
        question: `Which emoji matches '${phrase.english}'?`,
        questionHebrew: `איזה אימוג'י מתאים ל-'${phrase.english}'?`,
        questionArabic: `أي رمز يمثل '${phrase.english}'؟`,
        options: options.map(o => o.emoji),
        correct: options.findIndex(o => o.english === phrase.english),
        emoji: "🤔",
      };
    },
  },
];

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
  // "What is the opposite of X?"
  {
    generate: (word, allWords, lang) => {
      const opposites: Record<string, string> = {
        Happy: "Sad", Sad: "Happy", Hot: "Cold", Cold: "Hot",
        Big: "Small", Small: "Big", Fast: "Slow", Slow: "Fast",
        New: "Old", Old: "New", Clean: "Dirty", Dirty: "Clean",
        Beautiful: "Ugly", Ugly: "Beautiful", Strong: "Weak",
        Long: "Short", Short: "Long", Heavy: "Light", Light: "Heavy",
        Expensive: "Cheap", Cheap: "Expensive",
      };
      const opposite = opposites[word.english];
      if (!opposite) return null;
      const distractors = pick(
        allWords.filter(w => w.english !== opposite && w.english !== word.english), 3
      );
      if (distractors.length < 3) return null;
      const oppWord = allWords.find(w => w.english === opposite);
      if (!oppWord) return null;
      const options = shuffle([oppWord, ...distractors]);
      return {
        question: `What is the opposite of '${word.english}'?`,
        questionHebrew: `מה ההפך של '${word.english}'?`,
        questionArabic: `ما عكس '${word.english}'؟`,
        options: options.map(o => o.english),
        correct: options.findIndex(o => o.english === opposite),
        emoji: "↔️",
      };
    },
  },
];

/**
 * Generate N unique dynamic quiz questions with adaptive difficulty.
 * Now includes phrase-based questions (~25% of total).
 */
export const generateDynamicQuiz = (count: number, lang: Language): QuizQuestion[] => {
  const allWords = getAllWords();
  const allPhrases = getAllPhrases();
  const adaptive = getAdaptiveQuizParams("quiz");
  const weakWords = getWeakWords();
  const questions: QuizQuestion[] = [];
  const usedKeys = new Set<string>();
  let attempts = 0;

  // Filter words by difficulty-appropriate length
  const eligibleWords = allWords.filter(w => w.english.length <= adaptive.maxWordLength);

  // Prioritize weak words (30% of questions)
  const weakCount = Math.floor(count * 0.3);
  const weakWordObjects = eligibleWords.filter(w => weakWords.includes(w.english));

  // Reserve ~25% for phrase questions
  const phraseCount = Math.floor(count * 0.25);
  const wordCount = count - phraseCount;

  // Generate word-based questions
  while (questions.length < wordCount && attempts < wordCount * 10) {
    attempts++;
    
    let word: WordCard;
    if (questions.length < weakCount && weakWordObjects.length > 0) {
      word = randItem(weakWordObjects);
    } else {
      word = randItem(eligibleWords);
    }
    
    if (usedKeys.has(`w:${word.english}`)) continue;

    const template = randItem(templates);
    const q = template.generate(word, allWords, lang);
    if (q) {
      questions.push(q);
      usedKeys.add(`w:${word.english}`);
    }
  }

  // Generate phrase-based questions
  attempts = 0;
  while (questions.length < count && attempts < phraseCount * 10) {
    attempts++;
    const phrase = randItem(allPhrases);
    if (usedKeys.has(`p:${phrase.english}`)) continue;

    const template = randItem(phraseTemplates);
    const q = template.generate(phrase, allPhrases, lang);
    if (q) {
      questions.push(q);
      usedKeys.add(`p:${phrase.english}`);
    }
  }

  return shuffle(questions);
};
