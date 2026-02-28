/**
 * Phrases, expressions, idioms & sentence patterns database
 * Inspired by real-world language learning content
 */
import { Language } from "@/lib/i18n";

export interface Phrase {
  english: string;
  hebrew: string;
  arabic: string;
  category: PhraseCategory;
  emoji: string;
}

export type PhraseCategory =
  | "i_want"
  | "questions"
  | "daily_expressions"
  | "feelings_states"
  | "dont_be"
  | "why_questions"
  | "common_phrases"
  | "idioms"
  | "polite_phrases"
  | "at_the_airport";

export interface PhraseGroup {
  id: PhraseCategory;
  nameEn: string;
  nameHe: string;
  nameAr: string;
  emoji: string;
  phrases: Phrase[];
}

export const phraseGroups: PhraseGroup[] = [
  {
    id: "i_want",
    nameEn: "I Want To...",
    nameHe: "אני רוצה ל...",
    nameAr: "أريد أن...",
    emoji: "🙋",
    phrases: [
      { english: "I want to go", hebrew: "אני רוצה ללכת", arabic: "أريد أن أذهب", category: "i_want", emoji: "🚶" },
      { english: "I want to eat", hebrew: "אני רוצה לאכול", arabic: "أريد أن آكل", category: "i_want", emoji: "🍽️" },
      { english: "I want to sleep", hebrew: "אני רוצה לישון", arabic: "أريد أن أنام", category: "i_want", emoji: "😴" },
      { english: "I want to drink", hebrew: "אני רוצה לשתות", arabic: "أريد أن أشرب", category: "i_want", emoji: "🥤" },
      { english: "I want to play", hebrew: "אני רוצה לשחק", arabic: "أريد أن ألعب", category: "i_want", emoji: "🎮" },
      { english: "I want to learn", hebrew: "אני רוצה ללמוד", arabic: "أريد أن أتعلم", category: "i_want", emoji: "📚" },
      { english: "I want to read", hebrew: "אני רוצה לקרוא", arabic: "أريد أن أقرأ", category: "i_want", emoji: "📖" },
      { english: "I want to work", hebrew: "אני רוצה לעבוד", arabic: "أريد أن أعمل", category: "i_want", emoji: "💼" },
      { english: "I want to travel", hebrew: "אני רוצה לטייל", arabic: "أريد أن أسافر", category: "i_want", emoji: "✈️" },
      { english: "I want to draw", hebrew: "אני רוצה לצייר", arabic: "أريد أن أرسم", category: "i_want", emoji: "🎨" },
    ],
  },
  {
    id: "questions",
    nameEn: "Common Questions",
    nameHe: "שאלות נפוצות",
    nameAr: "أسئلة شائعة",
    emoji: "❓",
    phrases: [
      { english: "Are you sure?", hebrew: "אתה בטוח?", arabic: "هل أنت متأكد؟", category: "questions", emoji: "🤔" },
      { english: "Are you ready?", hebrew: "אתה מוכן?", arabic: "هل أنت جاهز؟", category: "questions", emoji: "✅" },
      { english: "Are you good?", hebrew: "אתה בסדר?", arabic: "هل أنت بخير؟", category: "questions", emoji: "👍" },
      { english: "Are you serious?", hebrew: "אתה רציני?", arabic: "هل أنت جاد؟", category: "questions", emoji: "😐" },
      { english: "Are you sick?", hebrew: "אתה חולה?", arabic: "هل أنت مريض؟", category: "questions", emoji: "🤒" },
      { english: "Are you busy?", hebrew: "אתה עסוק?", arabic: "هل أنت مشغول؟", category: "questions", emoji: "💼" },
      { english: "Are you tired?", hebrew: "אתה עייף?", arabic: "هل أنت متعب؟", category: "questions", emoji: "😴" },
      { english: "What is your name?", hebrew: "מה שמך?", arabic: "ما اسمك؟", category: "questions", emoji: "🏷️" },
      { english: "How old are you?", hebrew: "בן כמה אתה?", arabic: "كم عمرك؟", category: "questions", emoji: "🎂" },
      { english: "Where do you live?", hebrew: "איפה אתה גר?", arabic: "أين تسكن؟", category: "questions", emoji: "🏠" },
      { english: "How was your day?", hebrew: "איך היה היום שלך?", arabic: "كيف كان يومك؟", category: "questions", emoji: "📅" },
      { english: "What do you do?", hebrew: "מה אתה עושה?", arabic: "ماذا تفعل؟", category: "questions", emoji: "🤷" },
      { english: "What do you want?", hebrew: "מה אתה רוצה?", arabic: "ماذا تريد؟", category: "questions", emoji: "💭" },
    ],
  },
  {
    id: "daily_expressions",
    nameEn: "Daily Expressions",
    nameHe: "ביטויים יומיומיים",
    nameAr: "تعابير يومية",
    emoji: "💬",
    phrases: [
      { english: "Good morning", hebrew: "בוקר טוב", arabic: "صباح الخير", category: "daily_expressions", emoji: "🌅" },
      { english: "Good night", hebrew: "לילה טוב", arabic: "تصبح على خير", category: "daily_expressions", emoji: "🌙" },
      { english: "Thank you", hebrew: "תודה", arabic: "شكراً", category: "daily_expressions", emoji: "🙏" },
      { english: "You're welcome", hebrew: "בבקשה", arabic: "عفواً", category: "daily_expressions", emoji: "😊" },
      { english: "Excuse me", hebrew: "סליחה", arabic: "عفواً", category: "daily_expressions", emoji: "🙇" },
      { english: "I'm sorry", hebrew: "אני מצטער", arabic: "أنا آسف", category: "daily_expressions", emoji: "😔" },
      { english: "See you later", hebrew: "נתראה אחר כך", arabic: "أراك لاحقاً", category: "daily_expressions", emoji: "👋" },
      { english: "Have a nice day", hebrew: "יום נעים", arabic: "يوماً سعيداً", category: "daily_expressions", emoji: "☀️" },
      { english: "Let's eat", hebrew: "בואו נאכל", arabic: "هيا نأكل", category: "daily_expressions", emoji: "🍽️" },
      { english: "Dinner is ready", hebrew: "ארוחת הערב מוכנה", arabic: "العشاء جاهز", category: "daily_expressions", emoji: "🍲" },
      { english: "I love you", hebrew: "אני אוהב אותך", arabic: "أحبك", category: "daily_expressions", emoji: "❤️" },
      { english: "Happy birthday", hebrew: "יום הולדת שמח", arabic: "عيد ميلاد سعيد", category: "daily_expressions", emoji: "🎂" },
    ],
  },
  {
    id: "feelings_states",
    nameEn: "How I Feel",
    nameHe: "איך אני מרגיש",
    nameAr: "كيف أشعر",
    emoji: "😊",
    phrases: [
      { english: "I am hungry", hebrew: "אני רעב", arabic: "أنا جائع", category: "feelings_states", emoji: "🍔" },
      { english: "I am thirsty", hebrew: "אני צמא", arabic: "أنا عطشان", category: "feelings_states", emoji: "💧" },
      { english: "I am tired", hebrew: "אני עייף", arabic: "أنا متعب", category: "feelings_states", emoji: "😴" },
      { english: "I am happy", hebrew: "אני שמח", arabic: "أنا سعيد", category: "feelings_states", emoji: "😊" },
      { english: "I am sad", hebrew: "אני עצוב", arabic: "أنا حزين", category: "feelings_states", emoji: "😢" },
      { english: "I feel good", hebrew: "אני מרגיש טוב", arabic: "أشعر بخير", category: "feelings_states", emoji: "👍" },
      { english: "I feel excited", hebrew: "אני מתרגש", arabic: "أشعر بالحماس", category: "feelings_states", emoji: "🤩" },
      { english: "I feel bored", hebrew: "אני משועמם", arabic: "أشعر بالملل", category: "feelings_states", emoji: "😑" },
      { english: "I feel scared", hebrew: "אני מפחד", arabic: "أشعر بالخوف", category: "feelings_states", emoji: "😨" },
      { english: "I feel brave", hebrew: "אני מרגיש אמיץ", arabic: "أشعر بالشجاعة", category: "feelings_states", emoji: "💪" },
      { english: "I feel you", hebrew: "אני מבין אותך", arabic: "أشعر بك", category: "feelings_states", emoji: "🤝" },
      { english: "I miss you", hebrew: "אני מתגעגע אליך", arabic: "أفتقدك", category: "feelings_states", emoji: "💔" },
      { english: "I need help", hebrew: "אני צריך עזרה", arabic: "أحتاج مساعدة", category: "feelings_states", emoji: "🆘" },
      { english: "I am proud of you", hebrew: "אני גאה בך", arabic: "أنا فخور بك", category: "feelings_states", emoji: "🌟" },
    ],
  },
  {
    id: "dont_be",
    nameEn: "Don't Be...",
    nameHe: "אל תהיה...",
    nameAr: "لا تكن...",
    emoji: "🚫",
    phrases: [
      { english: "Don't be shy", hebrew: "אל תתבייש", arabic: "لا تكن خجولاً", category: "dont_be", emoji: "😳" },
      { english: "Don't be afraid", hebrew: "אל תפחד", arabic: "لا تكن خائفاً", category: "dont_be", emoji: "😨" },
      { english: "Don't be selfish", hebrew: "אל תהיה אנוכי", arabic: "لا تكن أنانياً", category: "dont_be", emoji: "🙅" },
      { english: "Don't be greedy", hebrew: "אל תהיה חמדן", arabic: "لا تكن طماعاً", category: "dont_be", emoji: "🤑" },
      { english: "Don't be silly", hebrew: "אל תהיה מטופש", arabic: "لا تكن سخيفاً", category: "dont_be", emoji: "🤪" },
      { english: "Don't be hasty", hebrew: "אל תמהר", arabic: "لا تكن متسرعاً", category: "dont_be", emoji: "⏳" },
      { english: "Don't be lazy", hebrew: "אל תהיה עצלן", arabic: "لا تكن كسولاً", category: "dont_be", emoji: "😪" },
      { english: "Don't be late", hebrew: "אל תאחר", arabic: "لا تتأخر", category: "dont_be", emoji: "⏰" },
    ],
  },
  {
    id: "why_questions",
    nameEn: "Why Do You...?",
    nameHe: "למה אתה...?",
    nameAr: "لماذا أنت...؟",
    emoji: "🤷",
    phrases: [
      { english: "Why do you cry?", hebrew: "למה אתה בוכה?", arabic: "لماذا تبكي؟", category: "why_questions", emoji: "😢" },
      { english: "Why do you ask?", hebrew: "למה אתה שואל?", arabic: "لماذا تسأل؟", category: "why_questions", emoji: "❓" },
      { english: "Why do you hide?", hebrew: "למה אתה מסתתר?", arabic: "لماذا تختبئ؟", category: "why_questions", emoji: "🙈" },
      { english: "Why do you leave?", hebrew: "למה אתה עוזב?", arabic: "لماذا ترحل؟", category: "why_questions", emoji: "🚶" },
      { english: "Why do you run?", hebrew: "למה אתה רץ?", arabic: "لماذا تركض؟", category: "why_questions", emoji: "🏃" },
      { english: "Why do you care?", hebrew: "למה אכפת לך?", arabic: "لماذا تهتم؟", category: "why_questions", emoji: "💗" },
      { english: "Why do you worry?", hebrew: "למה אתה דואג?", arabic: "لماذا تقلق؟", category: "why_questions", emoji: "😟" },
      { english: "Why do you smile?", hebrew: "למה אתה מחייך?", arabic: "لماذا تبتسم؟", category: "why_questions", emoji: "😊" },
    ],
  },
  {
    id: "common_phrases",
    nameEn: "Useful Phrases",
    nameHe: "ביטויים שימושיים",
    nameAr: "عبارات مفيدة",
    emoji: "💡",
    phrases: [
      { english: "By the way", hebrew: "אגב", arabic: "بالمناسبة", category: "common_phrases", emoji: "💬" },
      { english: "By chance", hebrew: "במקרה", arabic: "بالصدفة", category: "common_phrases", emoji: "🎲" },
      { english: "Of course", hebrew: "כמובן", arabic: "بالطبع", category: "common_phrases", emoji: "✅" },
      { english: "Never mind", hebrew: "לא משנה", arabic: "لا يهم", category: "common_phrases", emoji: "🤷" },
      { english: "Take your time", hebrew: "קח את הזמן", arabic: "خذ وقتك", category: "common_phrases", emoji: "⏰" },
      { english: "As you like", hebrew: "כמו שאתה רוצה", arabic: "كما تريد", category: "common_phrases", emoji: "👌" },
      { english: "Time is over", hebrew: "הזמן נגמר", arabic: "انتهى الوقت", category: "common_phrases", emoji: "⏳" },
      { english: "Try again", hebrew: "נסה שוב", arabic: "حاول مرة أخرى", category: "common_phrases", emoji: "🔄" },
      { english: "I support you", hebrew: "אני תומך בך", arabic: "أنا أدعمك", category: "common_phrases", emoji: "💪" },
      { english: "I believe in you", hebrew: "אני מאמין בך", arabic: "أنا أؤمن بك", category: "common_phrases", emoji: "🌟" },
      { english: "Well done", hebrew: "כל הכבוד", arabic: "أحسنت", category: "common_phrases", emoji: "👏" },
      { english: "Not bad", hebrew: "לא רע", arabic: "ليس سيئاً", category: "common_phrases", emoji: "👍" },
    ],
  },
  {
    id: "idioms",
    nameEn: "Fun Idioms",
    nameHe: "ביטויים ומשלים",
    nameAr: "أمثال وتعابير",
    emoji: "🎯",
    phrases: [
      { english: "Step by step", hebrew: "צעד אחר צעד", arabic: "خطوة بخطوة", category: "idioms", emoji: "👣" },
      { english: "Live and learn", hebrew: "חיים ולומדים", arabic: "عش وتعلم", category: "idioms", emoji: "📚" },
      { english: "Wait and see", hebrew: "חכה ותראה", arabic: "انتظر وسترى", category: "idioms", emoji: "👀" },
      { english: "Back and forth", hebrew: "הלוך ושוב", arabic: "ذهاباً وإياباً", category: "idioms", emoji: "↔️" },
      { english: "Sooner or later", hebrew: "במוקדם או במאוחר", arabic: "عاجلاً أم آجلاً", category: "idioms", emoji: "⏰" },
      { english: "Better late than never", hebrew: "מוטב מאוחר מאשר אף פעם", arabic: "أفضل متأخر من أبداً", category: "idioms", emoji: "🏃" },
      { english: "Practice makes perfect", hebrew: "תרגול עושה מושלם", arabic: "التمرين يصنع الكمال", category: "idioms", emoji: "💎" },
      { english: "Easy come easy go", hebrew: "בא בקלות הולך בקלות", arabic: "ما يأتي بسهولة يذهب بسهولة", category: "idioms", emoji: "🍃" },
      { english: "Actions speak louder", hebrew: "מעשים מדברים חזק יותר", arabic: "الأفعال أبلغ من الأقوال", category: "idioms", emoji: "📢" },
      { english: "Never give up", hebrew: "לעולם אל תוותר", arabic: "لا تستسلم أبداً", category: "idioms", emoji: "💪" },
    ],
  },
  {
    id: "polite_phrases",
    nameEn: "Being Polite",
    nameHe: "ביטויי נימוס",
    nameAr: "عبارات مهذبة",
    emoji: "🎩",
    phrases: [
      { english: "Please", hebrew: "בבקשה", arabic: "من فضلك", category: "polite_phrases", emoji: "🙏" },
      { english: "May I help you?", hebrew: "אפשר לעזור לך?", arabic: "هل يمكنني مساعدتك؟", category: "polite_phrases", emoji: "🤝" },
      { english: "Nice to meet you", hebrew: "נעים להכיר", arabic: "سعدت بلقائك", category: "polite_phrases", emoji: "🤗" },
      { english: "How are you?", hebrew: "מה שלומך?", arabic: "كيف حالك؟", category: "polite_phrases", emoji: "💬" },
      { english: "I am fine", hebrew: "אני בסדר", arabic: "أنا بخير", category: "polite_phrases", emoji: "😊" },
      { english: "Can I have...?", hebrew: "?...אפשר בבקשה", arabic: "هل يمكنني الحصول على...؟", category: "polite_phrases", emoji: "🙋" },
      { english: "Behave yourself", hebrew: "התנהג יפה", arabic: "احترم نفسك", category: "polite_phrases", emoji: "👔" },
      { english: "After you", hebrew: "אחריך", arabic: "تفضل قبلي", category: "polite_phrases", emoji: "🚪" },
    ],
  },
  {
    id: "at_the_airport",
    nameEn: "At The Airport",
    nameHe: "בשדה התעופה",
    nameAr: "في المطار",
    emoji: "✈️",
    phrases: [
      { english: "Boarding pass", hebrew: "כרטיס עלייה", arabic: "بطاقة صعود الطائرة", category: "at_the_airport", emoji: "🎫" },
      { english: "Passport", hebrew: "דרכון", arabic: "جواز سفر", category: "at_the_airport", emoji: "📕" },
      { english: "Departure board", hebrew: "לוח טיסות", arabic: "لوحة المغادرة", category: "at_the_airport", emoji: "📋" },
      { english: "Gate", hebrew: "שער", arabic: "بوابة", category: "at_the_airport", emoji: "🚪" },
      { english: "Suitcase", hebrew: "מזוודה", arabic: "حقيبة سفر", category: "at_the_airport", emoji: "🧳" },
      { english: "Backpack", hebrew: "תרמיל", arabic: "حقيبة ظهر", category: "at_the_airport", emoji: "🎒" },
      { english: "Check-in counter", hebrew: "דלפק צ'ק-אין", arabic: "مكتب تسجيل الوصول", category: "at_the_airport", emoji: "🛂" },
      { english: "Luggage trolley", hebrew: "עגלת מזוודות", arabic: "عربة أمتعة", category: "at_the_airport", emoji: "🛒" },
    ],
  },
];

/** Get all phrases flattened */
export const getAllPhrases = (): Phrase[] =>
  phraseGroups.flatMap(g => g.phrases);

/** Get phrase group name by language */
export const getPhraseGroupName = (group: PhraseGroup, lang: Language) =>
  lang === "he" ? group.nameHe : lang === "ar" ? group.nameAr : group.nameEn;

/** Get phrase translation */
export const getPhraseTranslation = (phrase: Phrase, lang: Language) =>
  lang === "he" ? phrase.hebrew : lang === "ar" ? phrase.arabic : phrase.english;
