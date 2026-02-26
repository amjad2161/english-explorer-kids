// Learning data for the English learning app
export interface LetterData {
  letter: string;
  hebrew: string;
  word: string;
  wordHebrew: string;
  emoji: string;
}

export interface WordCard {
  english: string;
  hebrew: string;
  emoji: string;
  category: string;
}

export interface QuizQuestion {
  question: string;
  questionHebrew: string;
  options: string[];
  correct: number;
  emoji: string;
}

export const alphabet: LetterData[] = [
  { letter: "A", hebrew: "אֵי", word: "Apple", wordHebrew: "תפוח", emoji: "🍎" },
  { letter: "B", hebrew: "בִּי", word: "Ball", wordHebrew: "כדור", emoji: "⚽" },
  { letter: "C", hebrew: "סִי", word: "Cat", wordHebrew: "חתול", emoji: "🐱" },
  { letter: "D", hebrew: "דִי", word: "Dog", wordHebrew: "כלב", emoji: "🐶" },
  { letter: "E", hebrew: "אִי", word: "Egg", wordHebrew: "ביצה", emoji: "🥚" },
  { letter: "F", hebrew: "אֶף", word: "Fish", wordHebrew: "דג", emoji: "🐟" },
  { letter: "G", hebrew: "ג'י", word: "Grape", wordHebrew: "ענב", emoji: "🍇" },
  { letter: "H", hebrew: "אֵייצ'", word: "Hat", wordHebrew: "כובע", emoji: "🎩" },
  { letter: "I", hebrew: "אַי", word: "Ice", wordHebrew: "קרח", emoji: "🧊" },
  { letter: "J", hebrew: "ג'יי", word: "Juice", wordHebrew: "מיץ", emoji: "🧃" },
  { letter: "K", hebrew: "קֵיי", word: "Kite", wordHebrew: "עפיפון", emoji: "🪁" },
  { letter: "L", hebrew: "אֶל", word: "Lion", wordHebrew: "אריה", emoji: "🦁" },
  { letter: "M", hebrew: "אֶם", word: "Moon", wordHebrew: "ירח", emoji: "🌙" },
  { letter: "N", hebrew: "אֶן", word: "Nest", wordHebrew: "קן", emoji: "🪹" },
  { letter: "O", hebrew: "אוֹ", word: "Orange", wordHebrew: "תפוז", emoji: "🍊" },
  { letter: "P", hebrew: "פִּי", word: "Pen", wordHebrew: "עט", emoji: "🖊️" },
  { letter: "Q", hebrew: "קיוּ", word: "Queen", wordHebrew: "מלכה", emoji: "👑" },
  { letter: "R", hebrew: "אָר", word: "Rain", wordHebrew: "גשם", emoji: "🌧️" },
  { letter: "S", hebrew: "אֶס", word: "Sun", wordHebrew: "שמש", emoji: "☀️" },
  { letter: "T", hebrew: "טִי", word: "Tree", wordHebrew: "עץ", emoji: "🌳" },
  { letter: "U", hebrew: "יוּ", word: "Umbrella", wordHebrew: "מטרייה", emoji: "☂️" },
  { letter: "V", hebrew: "וִי", word: "Violin", wordHebrew: "כינור", emoji: "🎻" },
  { letter: "W", hebrew: "דַבְּליוּ", word: "Water", wordHebrew: "מים", emoji: "💧" },
  { letter: "X", hebrew: "אֶקְס", word: "Xylophone", wordHebrew: "קסילופון", emoji: "🎵" },
  { letter: "Y", hebrew: "וַואי", word: "Yellow", wordHebrew: "צהוב", emoji: "💛" },
  { letter: "Z", hebrew: "זֶד", word: "Zebra", wordHebrew: "זברה", emoji: "🦓" },
];

export const wordCategories = [
  {
    name: "חיות",
    nameEn: "Animals",
    emoji: "🐾",
    color: "grass" as const,
    words: [
      { english: "Dog", hebrew: "כלב", emoji: "🐶", category: "animals" },
      { english: "Cat", hebrew: "חתול", emoji: "🐱", category: "animals" },
      { english: "Bird", hebrew: "ציפור", emoji: "🐦", category: "animals" },
      { english: "Fish", hebrew: "דג", emoji: "🐟", category: "animals" },
      { english: "Horse", hebrew: "סוס", emoji: "🐴", category: "animals" },
      { english: "Rabbit", hebrew: "ארנב", emoji: "🐰", category: "animals" },
    ],
  },
  {
    name: "צבעים",
    nameEn: "Colors",
    emoji: "🎨",
    color: "candy" as const,
    words: [
      { english: "Red", hebrew: "אדום", emoji: "🔴", category: "colors" },
      { english: "Blue", hebrew: "כחול", emoji: "🔵", category: "colors" },
      { english: "Green", hebrew: "ירוק", emoji: "🟢", category: "colors" },
      { english: "Yellow", hebrew: "צהוב", emoji: "🟡", category: "colors" },
      { english: "Orange", hebrew: "כתום", emoji: "🟠", category: "colors" },
      { english: "Purple", hebrew: "סגול", emoji: "🟣", category: "colors" },
    ],
  },
  {
    name: "מספרים",
    nameEn: "Numbers",
    emoji: "🔢",
    color: "sky" as const,
    words: [
      { english: "One", hebrew: "אחד", emoji: "1️⃣", category: "numbers" },
      { english: "Two", hebrew: "שניים", emoji: "2️⃣", category: "numbers" },
      { english: "Three", hebrew: "שלושה", emoji: "3️⃣", category: "numbers" },
      { english: "Four", hebrew: "ארבעה", emoji: "4️⃣", category: "numbers" },
      { english: "Five", hebrew: "חמישה", emoji: "5️⃣", category: "numbers" },
      { english: "Six", hebrew: "שישה", emoji: "6️⃣", category: "numbers" },
    ],
  },
  {
    name: "פירות",
    nameEn: "Fruits",
    emoji: "🍎",
    color: "sunshine" as const,
    words: [
      { english: "Apple", hebrew: "תפוח", emoji: "🍎", category: "fruits" },
      { english: "Banana", hebrew: "בננה", emoji: "🍌", category: "fruits" },
      { english: "Orange", hebrew: "תפוז", emoji: "🍊", category: "fruits" },
      { english: "Grape", hebrew: "ענב", emoji: "🍇", category: "fruits" },
      { english: "Strawberry", hebrew: "תות", emoji: "🍓", category: "fruits" },
      { english: "Watermelon", hebrew: "אבטיח", emoji: "🍉", category: "fruits" },
    ],
  },
];

export const quizQuestions: QuizQuestion[] = [
  {
    question: "What color is the sun?",
    questionHebrew: "באיזה צבע השמש?",
    options: ["Red", "Yellow", "Blue", "Green"],
    correct: 1,
    emoji: "☀️",
  },
  {
    question: "What animal says 'Meow'?",
    questionHebrew: "איזו חיה אומרת 'מיאו'?",
    options: ["Dog", "Cat", "Bird", "Fish"],
    correct: 1,
    emoji: "🐱",
  },
  {
    question: "How do you say 'כלב' in English?",
    questionHebrew: "איך אומרים 'כלב' באנגלית?",
    options: ["Cat", "Bird", "Dog", "Fish"],
    correct: 2,
    emoji: "🐶",
  },
  {
    question: "What number comes after 3?",
    questionHebrew: "איזה מספר בא אחרי 3?",
    options: ["2", "5", "4", "1"],
    correct: 2,
    emoji: "🔢",
  },
  {
    question: "Which fruit is yellow?",
    questionHebrew: "איזה פרי צהוב?",
    options: ["Apple", "Banana", "Grape", "Strawberry"],
    correct: 1,
    emoji: "🍌",
  },
  {
    question: "How do you say 'שמש' in English?",
    questionHebrew: "איך אומרים 'שמש' באנגלית?",
    options: ["Moon", "Star", "Sun", "Rain"],
    correct: 2,
    emoji: "☀️",
  },
  {
    question: "What letter does 'Apple' start with?",
    questionHebrew: "באיזו אות מתחילה המילה Apple?",
    options: ["B", "A", "C", "D"],
    correct: 1,
    emoji: "🍎",
  },
  {
    question: "How do you say 'אדום' in English?",
    questionHebrew: "איך אומרים 'אדום' באנגלית?",
    options: ["Blue", "Green", "Yellow", "Red"],
    correct: 3,
    emoji: "🔴",
  },
];
