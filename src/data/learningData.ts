import { Language } from "@/lib/i18n";

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
      { english: "Lion", hebrew: "אריה", arabic: "أسد", emoji: "🦁", category: "animals" },
      { english: "Elephant", hebrew: "פיל", arabic: "فيل", emoji: "🐘", category: "animals" },
      { english: "Monkey", hebrew: "קוף", arabic: "قرد", emoji: "🐵", category: "animals" },
      { english: "Bear", hebrew: "דוב", arabic: "دب", emoji: "🐻", category: "animals" },
      { english: "Tiger", hebrew: "נמר", arabic: "نمر", emoji: "🐯", category: "animals" },
      { english: "Cow", hebrew: "פרה", arabic: "بقرة", emoji: "🐄", category: "animals" },
      { english: "Pig", hebrew: "חזיר", arabic: "خنزير", emoji: "🐷", category: "animals" },
      { english: "Duck", hebrew: "ברווז", arabic: "بطة", emoji: "🦆", category: "animals" },
      { english: "Frog", hebrew: "צפרדע", arabic: "ضفدع", emoji: "🐸", category: "animals" },
      { english: "Snake", hebrew: "נחש", arabic: "ثعبان", emoji: "🐍", category: "animals" },
      { english: "Turtle", hebrew: "צב", arabic: "سلحفاة", emoji: "🐢", category: "animals" },
      { english: "Bee", hebrew: "דבורה", arabic: "نحلة", emoji: "🐝", category: "animals" },
      { english: "Butterfly", hebrew: "פרפר", arabic: "فراشة", emoji: "🦋", category: "animals" },
      { english: "Penguin", hebrew: "פינגווין", arabic: "بطريق", emoji: "🐧", category: "animals" },
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
      { english: "Pink", hebrew: "ורוד", arabic: "وردي", emoji: "💗", category: "colors" },
      { english: "Black", hebrew: "שחור", arabic: "أسود", emoji: "⚫", category: "colors" },
      { english: "White", hebrew: "לבן", arabic: "أبيض", emoji: "⚪", category: "colors" },
      { english: "Brown", hebrew: "חום", arabic: "بني", emoji: "🟤", category: "colors" },
      { english: "Gray", hebrew: "אפור", arabic: "رمادي", emoji: "🩶", category: "colors" },
      { english: "Gold", hebrew: "זהב", arabic: "ذهبي", emoji: "🌟", category: "colors" },
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
      { english: "Seven", hebrew: "שבעה", arabic: "سبعة", emoji: "7️⃣", category: "numbers" },
      { english: "Eight", hebrew: "שמונה", arabic: "ثمانية", emoji: "8️⃣", category: "numbers" },
      { english: "Nine", hebrew: "תשעה", arabic: "تسعة", emoji: "9️⃣", category: "numbers" },
      { english: "Ten", hebrew: "עשרה", arabic: "عشرة", emoji: "🔟", category: "numbers" },
      { english: "Twenty", hebrew: "עשרים", arabic: "عشرون", emoji: "2️⃣0️⃣", category: "numbers" },
      { english: "Hundred", hebrew: "מאה", arabic: "مائة", emoji: "💯", category: "numbers" },
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
      { english: "Pineapple", hebrew: "אננס", arabic: "أناناس", emoji: "🍍", category: "fruits" },
      { english: "Mango", hebrew: "מנגו", arabic: "مانجو", emoji: "🥭", category: "fruits" },
      { english: "Cherry", hebrew: "דובדבן", arabic: "كرز", emoji: "🍒", category: "fruits" },
      { english: "Peach", hebrew: "אפרסק", arabic: "خوخ", emoji: "🍑", category: "fruits" },
      { english: "Lemon", hebrew: "לימון", arabic: "ليمون", emoji: "🍋", category: "fruits" },
      { english: "Coconut", hebrew: "קוקוס", arabic: "جوز هند", emoji: "🥥", category: "fruits" },
      { english: "Kiwi", hebrew: "קיווי", arabic: "كيوي", emoji: "🥝", category: "fruits" },
      { english: "Avocado", hebrew: "אבוקדו", arabic: "أفوكادو", emoji: "🥑", category: "fruits" },
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
      { english: "Arm", hebrew: "זרוע", arabic: "ذراع", emoji: "💪", category: "body" },
      { english: "Leg", hebrew: "רגל", arabic: "ساق", emoji: "🦵", category: "body" },
      { english: "Hair", hebrew: "שיער", arabic: "شعر", emoji: "💇", category: "body" },
      { english: "Teeth", hebrew: "שיניים", arabic: "أسنان", emoji: "🦷", category: "body" },
      { english: "Heart", hebrew: "לב", arabic: "قلب", emoji: "❤️", category: "body" },
      { english: "Knee", hebrew: "ברך", arabic: "ركبة", emoji: "🦵", category: "body" },
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
      { english: "Uncle", hebrew: "דוד", arabic: "عم", emoji: "👨‍🦱", category: "family" },
      { english: "Aunt", hebrew: "דודה", arabic: "عمة", emoji: "👩‍🦱", category: "family" },
      { english: "Cousin", hebrew: "בן דוד", arabic: "ابن عم", emoji: "🧑", category: "family" },
      { english: "Son", hebrew: "בן", arabic: "ابن", emoji: "👦", category: "family" },
      { english: "Daughter", hebrew: "בת", arabic: "ابنة", emoji: "👧", category: "family" },
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
      { english: "Eraser", hebrew: "מחק", arabic: "ممحاة", emoji: "🧽", category: "school" },
      { english: "Clock", hebrew: "שעון", arabic: "ساعة", emoji: "🕐", category: "school" },
      { english: "Map", hebrew: "מפה", arabic: "خريطة", emoji: "🗺️", category: "school" },
      { english: "Paint", hebrew: "צבע", arabic: "طلاء", emoji: "🎨", category: "school" },
      { english: "Paper", hebrew: "נייר", arabic: "ورقة", emoji: "📄", category: "school" },
      { english: "Computer", hebrew: "מחשב", arabic: "حاسوب", emoji: "💻", category: "school" },
      { english: "Board", hebrew: "לוח", arabic: "سبورة", emoji: "📋", category: "school" },
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
      { english: "Cheese", hebrew: "גבינה", arabic: "جبن", emoji: "🧀", category: "food" },
      { english: "Soup", hebrew: "מרק", arabic: "شوربة", emoji: "🍲", category: "food" },
      { english: "Salad", hebrew: "סלט", arabic: "سلطة", emoji: "🥗", category: "food" },
      { english: "Cookie", hebrew: "עוגייה", arabic: "كعكة", emoji: "🍪", category: "food" },
      { english: "Sandwich", hebrew: "סנדוויץ'", arabic: "ساندويتش", emoji: "🥪", category: "food" },
      { english: "Ice Cream", hebrew: "גלידה", arabic: "آيس كريم", emoji: "🍦", category: "food" },
      { english: "Juice", hebrew: "מיץ", arabic: "عصير", emoji: "🧃", category: "food" },
      { english: "Pasta", hebrew: "פסטה", arabic: "باستا", emoji: "🍝", category: "food" },
    ],
  },
  {
    name: "בגדים",
    nameAr: "ملابس",
    nameEn: "Clothes",
    emoji: "👕",
    color: "lavender" as const,
    words: [
      { english: "Shirt", hebrew: "חולצה", arabic: "قميص", emoji: "👕", category: "clothes" },
      { english: "Pants", hebrew: "מכנסיים", arabic: "بنطال", emoji: "👖", category: "clothes" },
      { english: "Shoes", hebrew: "נעליים", arabic: "أحذية", emoji: "👟", category: "clothes" },
      { english: "Hat", hebrew: "כובע", arabic: "قبعة", emoji: "🎩", category: "clothes" },
      { english: "Dress", hebrew: "שמלה", arabic: "فستان", emoji: "👗", category: "clothes" },
      { english: "Socks", hebrew: "גרביים", arabic: "جوارب", emoji: "🧦", category: "clothes" },
      { english: "Jacket", hebrew: "ז'קט", arabic: "جاكيت", emoji: "🧥", category: "clothes" },
      { english: "Scarf", hebrew: "צעיף", arabic: "وشاح", emoji: "🧣", category: "clothes" },
      { english: "Gloves", hebrew: "כפפות", arabic: "قفازات", emoji: "🧤", category: "clothes" },
      { english: "Boots", hebrew: "מגפיים", arabic: "أحذية طويلة", emoji: "🥾", category: "clothes" },
    ],
  },
  {
    name: "טבע",
    nameAr: "طبيعة",
    nameEn: "Nature",
    emoji: "🌿",
    color: "grass" as const,
    words: [
      { english: "Tree", hebrew: "עץ", arabic: "شجرة", emoji: "🌳", category: "nature" },
      { english: "Flower", hebrew: "פרח", arabic: "زهرة", emoji: "🌸", category: "nature" },
      { english: "Sun", hebrew: "שמש", arabic: "شمس", emoji: "☀️", category: "nature" },
      { english: "Moon", hebrew: "ירח", arabic: "قمر", emoji: "🌙", category: "nature" },
      { english: "Star", hebrew: "כוכב", arabic: "نجمة", emoji: "⭐", category: "nature" },
      { english: "Rain", hebrew: "גשם", arabic: "مطر", emoji: "🌧️", category: "nature" },
      { english: "Snow", hebrew: "שלג", arabic: "ثلج", emoji: "❄️", category: "nature" },
      { english: "Cloud", hebrew: "ענן", arabic: "سحابة", emoji: "☁️", category: "nature" },
      { english: "Mountain", hebrew: "הר", arabic: "جبل", emoji: "⛰️", category: "nature" },
      { english: "River", hebrew: "נהר", arabic: "نهر", emoji: "🏞️", category: "nature" },
      { english: "Sea", hebrew: "ים", arabic: "بحر", emoji: "🌊", category: "nature" },
      { english: "Forest", hebrew: "יער", arabic: "غابة", emoji: "🌲", category: "nature" },
      { english: "Rainbow", hebrew: "קשת", arabic: "قوس قزح", emoji: "🌈", category: "nature" },
      { english: "Wind", hebrew: "רוח", arabic: "رياح", emoji: "💨", category: "nature" },
    ],
  },
  {
    name: "בית",
    nameAr: "بيت",
    nameEn: "Home",
    emoji: "🏠",
    color: "sunshine" as const,
    words: [
      { english: "Door", hebrew: "דלת", arabic: "باب", emoji: "🚪", category: "home" },
      { english: "Window", hebrew: "חלון", arabic: "نافذة", emoji: "🪟", category: "home" },
      { english: "Bed", hebrew: "מיטה", arabic: "سرير", emoji: "🛏️", category: "home" },
      { english: "Chair", hebrew: "כיסא", arabic: "كرسي", emoji: "🪑", category: "home" },
      { english: "Lamp", hebrew: "מנורה", arabic: "مصباح", emoji: "💡", category: "home" },
      { english: "Key", hebrew: "מפתח", arabic: "مفتاح", emoji: "🔑", category: "home" },
      { english: "TV", hebrew: "טלוויזיה", arabic: "تلفزيون", emoji: "📺", category: "home" },
      { english: "Kitchen", hebrew: "מטבח", arabic: "مطبخ", emoji: "🍳", category: "home" },
      { english: "Bath", hebrew: "אמבטיה", arabic: "حمام", emoji: "🛁", category: "home" },
      { english: "Garden", hebrew: "גינה", arabic: "حديقة", emoji: "🌻", category: "home" },
      { english: "Roof", hebrew: "גג", arabic: "سقف", emoji: "🏠", category: "home" },
      { english: "Phone", hebrew: "טלפון", arabic: "هاتف", emoji: "📱", category: "home" },
    ],
  },
  {
    name: "רכבים",
    nameAr: "مركبات",
    nameEn: "Vehicles",
    emoji: "🚗",
    color: "sky" as const,
    words: [
      { english: "Car", hebrew: "מכונית", arabic: "سيارة", emoji: "🚗", category: "vehicles" },
      { english: "Bus", hebrew: "אוטובוס", arabic: "حافلة", emoji: "🚌", category: "vehicles" },
      { english: "Train", hebrew: "רכבת", arabic: "قطار", emoji: "🚂", category: "vehicles" },
      { english: "Plane", hebrew: "מטוס", arabic: "طائرة", emoji: "✈️", category: "vehicles" },
      { english: "Boat", hebrew: "סירה", arabic: "قارب", emoji: "⛵", category: "vehicles" },
      { english: "Bicycle", hebrew: "אופניים", arabic: "دراجة", emoji: "🚲", category: "vehicles" },
      { english: "Truck", hebrew: "משאית", arabic: "شاحنة", emoji: "🚛", category: "vehicles" },
      { english: "Helicopter", hebrew: "מסוק", arabic: "مروحية", emoji: "🚁", category: "vehicles" },
      { english: "Rocket", hebrew: "טיל", arabic: "صاروخ", emoji: "🚀", category: "vehicles" },
      { english: "Ship", hebrew: "אונייה", arabic: "سفينة", emoji: "🚢", category: "vehicles" },
    ],
  },
];

export const quizQuestions: QuizQuestion[] = [
  { question: "What color is the sun?", questionHebrew: "באיזה צבע השמש?", questionArabic: "ما لون الشمس؟", options: ["Red", "Yellow", "Blue", "Green"], correct: 1, emoji: "☀️" },
  { question: "What animal says 'Meow'?", questionHebrew: "איזו חיה אומרת 'מיאו'?", questionArabic: "أي حيوان يقول 'مياو'؟", options: ["Dog", "Cat", "Bird", "Fish"], correct: 1, emoji: "🐱" },
  { question: "How do you say 'Dog' in English?", questionHebrew: "איך אומרים 'כלב' באנגלית?", questionArabic: "كيف تقول 'كلب' بالإنجليزية؟", options: ["Cat", "Bird", "Dog", "Fish"], correct: 2, emoji: "🐶" },
  { question: "What number comes after 3?", questionHebrew: "איזה מספר בא אחרי 3?", questionArabic: "ما الرقم الذي يأتي بعد 3؟", options: ["2", "5", "4", "1"], correct: 2, emoji: "🔢" },
  { question: "Which fruit is yellow?", questionHebrew: "איזה פרי צהוב?", questionArabic: "أي فاكهة صفراء؟", options: ["Apple", "Banana", "Grape", "Strawberry"], correct: 1, emoji: "🍌" },
  { question: "How do you say 'Sun' in English?", questionHebrew: "איך אומרים 'שמש' באנגלית?", questionArabic: "كيف تقول 'شمس' بالإنجليزية؟", options: ["Moon", "Star", "Sun", "Rain"], correct: 2, emoji: "☀️" },
  { question: "What letter does 'Apple' start with?", questionHebrew: "באיזו אות מתחילה המילה Apple?", questionArabic: "بأي حرف تبدأ كلمة Apple؟", options: ["B", "A", "C", "D"], correct: 1, emoji: "🍎" },
  { question: "How do you say 'Red' in English?", questionHebrew: "איך אומרים 'אדום' באנגלית?", questionArabic: "كيف تقول 'أحمر' بالإنجليزية؟", options: ["Blue", "Green", "Yellow", "Red"], correct: 3, emoji: "🔴" },
  { question: "What animal has a trunk?", questionHebrew: "לאיזו חיה יש חדק?", questionArabic: "أي حيوان لديه خرطوم؟", options: ["Lion", "Elephant", "Dog", "Cat"], correct: 1, emoji: "🐘" },
  { question: "How many legs does a cat have?", questionHebrew: "כמה רגליים לחתול?", questionArabic: "كم رجل للقطة؟", options: ["Two", "Three", "Four", "Six"], correct: 2, emoji: "🐱" },
  { question: "What color is grass?", questionHebrew: "באיזה צבע הדשא?", questionArabic: "ما لون العشب؟", options: ["Blue", "Red", "Green", "Yellow"], correct: 2, emoji: "🌿" },
  { question: "Which one can fly?", questionHebrew: "מי יכול לעוף?", questionArabic: "أيهم يستطيع الطيران؟", options: ["Dog", "Fish", "Bird", "Cat"], correct: 2, emoji: "🐦" },
  { question: "What do we use to write?", questionHebrew: "במה אנחנו כותבים?", questionArabic: "بماذا نكتب؟", options: ["Book", "Pencil", "Table", "Bag"], correct: 1, emoji: "✏️" },
  { question: "What is 2 + 3?", questionHebrew: "כמה זה 2 + 3?", questionArabic: "كم 2 + 3؟", options: ["Four", "Five", "Six", "Three"], correct: 1, emoji: "🔢" },
  { question: "Which is the biggest?", questionHebrew: "מה הכי גדול?", questionArabic: "أيهم الأكبر؟", options: ["Mouse", "Cat", "Elephant", "Dog"], correct: 2, emoji: "🐘" },
  { question: "What falls from clouds?", questionHebrew: "מה נופל מהעננים?", questionArabic: "ماذا يسقط من السحب؟", options: ["Snow", "Rain", "Sun", "Both A and B"], correct: 3, emoji: "🌧️" },
  { question: "Where does a fish live?", questionHebrew: "איפה דג חי?", questionArabic: "أين يعيش السمك؟", options: ["Tree", "Water", "Sky", "House"], correct: 1, emoji: "🐟" },
  { question: "What do you wear on your feet?", questionHebrew: "מה לובשים על הרגליים?", questionArabic: "ماذا تلبس على قدميك؟", options: ["Hat", "Gloves", "Shoes", "Scarf"], correct: 2, emoji: "👟" },
  { question: "What vehicle flies in the sky?", questionHebrew: "איזה רכב טס בשמיים?", questionArabic: "أي مركبة تطير في السماء؟", options: ["Car", "Bus", "Plane", "Boat"], correct: 2, emoji: "✈️" },
  { question: "What do we drink in the morning?", questionHebrew: "מה שותים בבוקר?", questionArabic: "ماذا نشرب في الصباح؟", options: ["Pizza", "Milk", "Cake", "Rice"], correct: 1, emoji: "🥛" },
];

export const getCategoryName = (cat: typeof wordCategories[0], lang: Language) =>
  lang === "he" ? cat.name : cat.nameAr;

export const getWordTranslation = (word: WordCard, lang: Language) =>
  lang === "he" ? word.hebrew : word.arabic;

/** Get all words flattened from all categories */
export const getAllWords = (): WordCard[] =>
  wordCategories.flatMap(cat => cat.words);

/** Get words suitable for spelling games (3-7 letter words) */
export const getSpellingWords = (maxLen = 7): WordCard[] =>
  getAllWords().filter(w => w.english.length <= maxLen && !w.english.includes(" "));
