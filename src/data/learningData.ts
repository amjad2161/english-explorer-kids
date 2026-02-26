import { Language } from "@/lib/i18n";

// Learning data for the English learning app
export interface LetterData {
  letter: string;
  hebrew: string;
  arabic: string;
  word: string;
  wordHebrew: string;
  wordArabic: string;
  emoji: string;
}

export interface WordCard {
  english: string;
  hebrew: string;
  arabic: string;
  emoji: string;
  category: string;
}

export interface QuizQuestion {
  question: string;
  questionHebrew: string;
  questionArabic: string;
  options: string[];
  correct: number;
  emoji: string;
}

// Helper to get localized text
export const getLocal = (item: { hebrew: string; arabic: string }, lang: Language) =>
  lang === "he" ? item.hebrew : item.arabic;

export const getWordLocal = (item: { wordHebrew: string; wordArabic: string }, lang: Language) =>
  lang === "he" ? item.wordHebrew : item.wordArabic;

export const getQuestionLocal = (item: { questionHebrew: string; questionArabic: string }, lang: Language) =>
  lang === "he" ? item.questionHebrew : item.questionArabic;

export const alphabet: LetterData[] = [
  { letter: "A", hebrew: "אֵי", arabic: "إيْ", word: "Apple", wordHebrew: "תפוח", wordArabic: "تفاحة", emoji: "🍎" },
  { letter: "B", hebrew: "בִּי", arabic: "بِي", word: "Ball", wordHebrew: "כדור", wordArabic: "كرة", emoji: "⚽" },
  { letter: "C", hebrew: "סִי", arabic: "سِي", word: "Cat", wordHebrew: "חתול", wordArabic: "قطة", emoji: "🐱" },
  { letter: "D", hebrew: "דִי", arabic: "دِي", word: "Dog", wordHebrew: "כלב", wordArabic: "كلب", emoji: "🐶" },
  { letter: "E", hebrew: "אִי", arabic: "إِي", word: "Egg", wordHebrew: "ביצה", wordArabic: "بيضة", emoji: "🥚" },
  { letter: "F", hebrew: "אֶף", arabic: "إِف", word: "Fish", wordHebrew: "דג", wordArabic: "سمكة", emoji: "🐟" },
  { letter: "G", hebrew: "ג'י", arabic: "جِي", word: "Grape", wordHebrew: "ענב", wordArabic: "عنب", emoji: "🍇" },
  { letter: "H", hebrew: "אֵייצ'", arabic: "إيتْش", word: "Hat", wordHebrew: "כובע", wordArabic: "قبعة", emoji: "🎩" },
  { letter: "I", hebrew: "אַי", arabic: "آي", word: "Ice", wordHebrew: "קרח", wordArabic: "ثلج", emoji: "🧊" },
  { letter: "J", hebrew: "ג'יי", arabic: "جَيْ", word: "Juice", wordHebrew: "מיץ", wordArabic: "عصير", emoji: "🧃" },
  { letter: "K", hebrew: "קֵיי", arabic: "كَيْ", word: "Kite", wordHebrew: "עפיפון", wordArabic: "طائرة ورقية", emoji: "🪁" },
  { letter: "L", hebrew: "אֶל", arabic: "إِل", word: "Lion", wordHebrew: "אריה", wordArabic: "أسد", emoji: "🦁" },
  { letter: "M", hebrew: "אֶם", arabic: "إِم", word: "Moon", wordHebrew: "ירח", wordArabic: "قمر", emoji: "🌙" },
  { letter: "N", hebrew: "אֶן", arabic: "إِن", word: "Nest", wordHebrew: "קן", wordArabic: "عش", emoji: "🪹" },
  { letter: "O", hebrew: "אוֹ", arabic: "أُو", word: "Orange", wordHebrew: "תפוז", wordArabic: "برتقال", emoji: "🍊" },
  { letter: "P", hebrew: "פִּי", arabic: "بِي", word: "Pen", wordHebrew: "עט", wordArabic: "قلم", emoji: "🖊️" },
  { letter: "Q", hebrew: "קיוּ", arabic: "كْيُو", word: "Queen", wordHebrew: "מלכה", wordArabic: "ملكة", emoji: "👑" },
  { letter: "R", hebrew: "אָר", arabic: "آر", word: "Rain", wordHebrew: "גשם", wordArabic: "مطر", emoji: "🌧️" },
  { letter: "S", hebrew: "אֶס", arabic: "إِس", word: "Sun", wordHebrew: "שמש", wordArabic: "شمس", emoji: "☀️" },
  { letter: "T", hebrew: "טִי", arabic: "تِي", word: "Tree", wordHebrew: "עץ", wordArabic: "شجرة", emoji: "🌳" },
  { letter: "U", hebrew: "יוּ", arabic: "يُو", word: "Umbrella", wordHebrew: "מטרייה", wordArabic: "مظلة", emoji: "☂️" },
  { letter: "V", hebrew: "וִי", arabic: "فِي", word: "Violin", wordHebrew: "כינור", wordArabic: "كمان", emoji: "🎻" },
  { letter: "W", hebrew: "דַבְּליוּ", arabic: "دَبْلْيُو", word: "Water", wordHebrew: "מים", wordArabic: "ماء", emoji: "💧" },
  { letter: "X", hebrew: "אֶקְס", arabic: "إِكْس", word: "Xylophone", wordHebrew: "קסילופון", wordArabic: "إكسيلوفون", emoji: "🎵" },
  { letter: "Y", hebrew: "וַואי", arabic: "وَاي", word: "Yellow", wordHebrew: "צהוב", wordArabic: "أصفر", emoji: "💛" },
  { letter: "Z", hebrew: "זֶד", arabic: "زِد", word: "Zebra", wordHebrew: "זברה", wordArabic: "حمار وحشي", emoji: "🦓" },
];

export const wordCategories = [
  {
    name: "חיות",
    nameAr: "حيوانات",
    nameEn: "Animals",
    emoji: "🐾",
    color: "grass" as const,
    words: [
      { english: "Dog", hebrew: "כלב", arabic: "كلب", emoji: "🐶", category: "animals" },
      { english: "Cat", hebrew: "חתול", arabic: "قطة", emoji: "🐱", category: "animals" },
      { english: "Bird", hebrew: "ציפור", arabic: "طائر", emoji: "🐦", category: "animals" },
      { english: "Fish", hebrew: "דג", arabic: "سمكة", emoji: "🐟", category: "animals" },
      { english: "Horse", hebrew: "סוס", arabic: "حصان", emoji: "🐴", category: "animals" },
      { english: "Rabbit", hebrew: "ארנב", arabic: "أرنب", emoji: "🐰", category: "animals" },
    ],
  },
  {
    name: "צבעים",
    nameAr: "ألوان",
    nameEn: "Colors",
    emoji: "🎨",
    color: "candy" as const,
    words: [
      { english: "Red", hebrew: "אדום", arabic: "أحمر", emoji: "🔴", category: "colors" },
      { english: "Blue", hebrew: "כחול", arabic: "أزرق", emoji: "🔵", category: "colors" },
      { english: "Green", hebrew: "ירוק", arabic: "أخضر", emoji: "🟢", category: "colors" },
      { english: "Yellow", hebrew: "צהוב", arabic: "أصفر", emoji: "🟡", category: "colors" },
      { english: "Orange", hebrew: "כתום", arabic: "برتقالي", emoji: "🟠", category: "colors" },
      { english: "Purple", hebrew: "סגול", arabic: "بنفسجي", emoji: "🟣", category: "colors" },
    ],
  },
  {
    name: "מספרים",
    nameAr: "أرقام",
    nameEn: "Numbers",
    emoji: "🔢",
    color: "sky" as const,
    words: [
      { english: "One", hebrew: "אחד", arabic: "واحد", emoji: "1️⃣", category: "numbers" },
      { english: "Two", hebrew: "שניים", arabic: "اثنان", emoji: "2️⃣", category: "numbers" },
      { english: "Three", hebrew: "שלושה", arabic: "ثلاثة", emoji: "3️⃣", category: "numbers" },
      { english: "Four", hebrew: "ארבעה", arabic: "أربعة", emoji: "4️⃣", category: "numbers" },
      { english: "Five", hebrew: "חמישה", arabic: "خمسة", emoji: "5️⃣", category: "numbers" },
      { english: "Six", hebrew: "שישה", arabic: "ستة", emoji: "6️⃣", category: "numbers" },
    ],
  },
  {
    name: "פירות",
    nameAr: "فواكه",
    nameEn: "Fruits",
    emoji: "🍎",
    color: "sunshine" as const,
    words: [
      { english: "Apple", hebrew: "תפוח", arabic: "تفاحة", emoji: "🍎", category: "fruits" },
      { english: "Banana", hebrew: "בננה", arabic: "موزة", emoji: "🍌", category: "fruits" },
      { english: "Orange", hebrew: "תפוז", arabic: "برتقالة", emoji: "🍊", category: "fruits" },
      { english: "Grape", hebrew: "ענב", arabic: "عنب", emoji: "🍇", category: "fruits" },
      { english: "Strawberry", hebrew: "תות", arabic: "فراولة", emoji: "🍓", category: "fruits" },
      { english: "Watermelon", hebrew: "אבטיח", arabic: "بطيخ", emoji: "🍉", category: "fruits" },
    ],
  },
  {
    name: "חלקי גוף",
    nameAr: "أجزاء الجسم",
    nameEn: "Body Parts",
    emoji: "🦵",
    color: "sky" as const,
    words: [
      { english: "Head", hebrew: "ראש", arabic: "رأس", emoji: "🗣️", category: "body" },
      { english: "Hand", hebrew: "יד", arabic: "يد", emoji: "✋", category: "body" },
      { english: "Eye", hebrew: "עין", arabic: "عين", emoji: "👁️", category: "body" },
      { english: "Ear", hebrew: "אוזן", arabic: "أذن", emoji: "👂", category: "body" },
      { english: "Nose", hebrew: "אף", arabic: "أنف", emoji: "👃", category: "body" },
      { english: "Mouth", hebrew: "פה", arabic: "فم", emoji: "👄", category: "body" },
      { english: "Foot", hebrew: "רגל", arabic: "قدم", emoji: "🦶", category: "body" },
      { english: "Finger", hebrew: "אצבע", arabic: "إصبع", emoji: "☝️", category: "body" },
    ],
  },
  {
    name: "משפחה",
    nameAr: "عائلة",
    nameEn: "Family",
    emoji: "👨‍👩‍👧‍👦",
    color: "candy" as const,
    words: [
      { english: "Mother", hebrew: "אמא", arabic: "أم", emoji: "👩", category: "family" },
      { english: "Father", hebrew: "אבא", arabic: "أب", emoji: "👨", category: "family" },
      { english: "Sister", hebrew: "אחות", arabic: "أخت", emoji: "👧", category: "family" },
      { english: "Brother", hebrew: "אח", arabic: "أخ", emoji: "👦", category: "family" },
      { english: "Baby", hebrew: "תינוק", arabic: "طفل", emoji: "👶", category: "family" },
      { english: "Grandmother", hebrew: "סבתא", arabic: "جدة", emoji: "👵", category: "family" },
      { english: "Grandfather", hebrew: "סבא", arabic: "جد", emoji: "👴", category: "family" },
    ],
  },
  {
    name: "בית ספר",
    nameAr: "مدرسة",
    nameEn: "School",
    emoji: "🏫",
    color: "lavender" as const,
    words: [
      { english: "Book", hebrew: "ספר", arabic: "كتاب", emoji: "📚", category: "school" },
      { english: "Pencil", hebrew: "עיפרון", arabic: "قلم رصاص", emoji: "✏️", category: "school" },
      { english: "Teacher", hebrew: "מורה", arabic: "معلم", emoji: "👩‍🏫", category: "school" },
      { english: "Student", hebrew: "תלמיד", arabic: "طالب", emoji: "🧑‍🎓", category: "school" },
      { english: "Table", hebrew: "שולחן", arabic: "طاولة", emoji: "🪑", category: "school" },
      { english: "Bag", hebrew: "תיק", arabic: "حقيبة", emoji: "🎒", category: "school" },
      { english: "Ruler", hebrew: "סרגל", arabic: "مسطرة", emoji: "📏", category: "school" },
    ],
  },
  {
    name: "אוכל",
    nameAr: "طعام",
    nameEn: "Food",
    emoji: "🍕",
    color: "grass" as const,
    words: [
      { english: "Bread", hebrew: "לחם", arabic: "خبز", emoji: "🍞", category: "food" },
      { english: "Milk", hebrew: "חלב", arabic: "حليب", emoji: "🥛", category: "food" },
      { english: "Egg", hebrew: "ביצה", arabic: "بيضة", emoji: "🥚", category: "food" },
      { english: "Rice", hebrew: "אורז", arabic: "أرز", emoji: "🍚", category: "food" },
      { english: "Pizza", hebrew: "פיצה", arabic: "بيتزا", emoji: "🍕", category: "food" },
      { english: "Chicken", hebrew: "עוף", arabic: "دجاج", emoji: "🍗", category: "food" },
      { english: "Water", hebrew: "מים", arabic: "ماء", emoji: "💧", category: "food" },
      { english: "Cake", hebrew: "עוגה", arabic: "كعكة", emoji: "🎂", category: "food" },
    ],
  },
];

export const quizQuestions: QuizQuestion[] = [
  {
    question: "What color is the sun?",
    questionHebrew: "באיזה צבע השמש?",
    questionArabic: "ما لون الشمس؟",
    options: ["Red", "Yellow", "Blue", "Green"],
    correct: 1,
    emoji: "☀️",
  },
  {
    question: "What animal says 'Meow'?",
    questionHebrew: "איזו חיה אומרת 'מיאו'?",
    questionArabic: "أي حيوان يقول 'مياو'؟",
    options: ["Dog", "Cat", "Bird", "Fish"],
    correct: 1,
    emoji: "🐱",
  },
  {
    question: "How do you say 'Dog' in English?",
    questionHebrew: "איך אומרים 'כלב' באנגלית?",
    questionArabic: "كيف تقول 'كلب' بالإنجليزية؟",
    options: ["Cat", "Bird", "Dog", "Fish"],
    correct: 2,
    emoji: "🐶",
  },
  {
    question: "What number comes after 3?",
    questionHebrew: "איזה מספר בא אחרי 3?",
    questionArabic: "ما الرقم الذي يأتي بعد 3؟",
    options: ["2", "5", "4", "1"],
    correct: 2,
    emoji: "🔢",
  },
  {
    question: "Which fruit is yellow?",
    questionHebrew: "איזה פרי צהוב?",
    questionArabic: "أي فاكهة صفراء؟",
    options: ["Apple", "Banana", "Grape", "Strawberry"],
    correct: 1,
    emoji: "🍌",
  },
  {
    question: "How do you say 'Sun' in English?",
    questionHebrew: "איך אומרים 'שמש' באנגלית?",
    questionArabic: "كيف تقول 'شمس' بالإنجليزية؟",
    options: ["Moon", "Star", "Sun", "Rain"],
    correct: 2,
    emoji: "☀️",
  },
  {
    question: "What letter does 'Apple' start with?",
    questionHebrew: "באיזו אות מתחילה המילה Apple?",
    questionArabic: "بأي حرف تبدأ كلمة Apple؟",
    options: ["B", "A", "C", "D"],
    correct: 1,
    emoji: "🍎",
  },
  {
    question: "How do you say 'Red' in English?",
    questionHebrew: "איך אומרים 'אדום' באנגלית?",
    questionArabic: "كيف تقول 'أحمر' بالإنجليزية؟",
    options: ["Blue", "Green", "Yellow", "Red"],
    correct: 3,
    emoji: "🔴",
  },
];

// Helper to get category name in current language
export const getCategoryName = (cat: typeof wordCategories[0], lang: Language) =>
  lang === "he" ? cat.name : cat.nameAr;

// Helper to get word translation in current language  
export const getWordTranslation = (word: WordCard, lang: Language) =>
  lang === "he" ? word.hebrew : word.arabic;
