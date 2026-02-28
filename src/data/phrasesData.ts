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
  | "at_the_airport"
  | "at_school"
  | "at_restaurant"
  | "at_doctor"
  | "shopping"
  | "giving_directions"
  | "making_plans"
  | "describing_people"
  | "weather_talk"
  | "phone_calls"
  | "emergencies";

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

export const phraseGroupsExtended: PhraseGroup[] = [
  {
    id: "at_school",
    nameEn: "At School",
    nameHe: "בבית הספר",
    nameAr: "في المدرسة",
    emoji: "🏫",
    phrases: [
      { english: "May I go to the bathroom?", hebrew: "אפשר ללכת לשירותים?", arabic: "هل يمكنني الذهاب إلى الحمام؟", category: "at_school", emoji: "🚻" },
      { english: "I don't understand", hebrew: "אני לא מבין", arabic: "لا أفهم", category: "at_school", emoji: "😕" },
      { english: "Can you repeat that?", hebrew: "אתה יכול לחזור על זה?", arabic: "هل يمكنك تكرار ذلك؟", category: "at_school", emoji: "🔁" },
      { english: "What page are we on?", hebrew: "באיזה עמוד אנחנו?", arabic: "في أي صفحة نحن؟", category: "at_school", emoji: "📖" },
      { english: "I finished my work", hebrew: "סיימתי את העבודה", arabic: "أنهيت عملي", category: "at_school", emoji: "✅" },
      { english: "The homework is hard", hebrew: "שיעורי הבית קשים", arabic: "الواجب المنزلي صعب", category: "at_school", emoji: "😓" },
      { english: "I forgot my book", hebrew: "שכחתי את הספר", arabic: "نسيت كتابي", category: "at_school", emoji: "📚" },
      { english: "What is the answer?", hebrew: "מה התשובה?", arabic: "ما هو الجواب؟", category: "at_school", emoji: "❓" },
      { english: "I have a question", hebrew: "יש לי שאלה", arabic: "عندي سؤال", category: "at_school", emoji: "✋" },
      { english: "Class is over", hebrew: "השיעור נגמר", arabic: "انتهى الدرس", category: "at_school", emoji: "🔔" },
      { english: "Open your books", hebrew: "פתחו את הספרים", arabic: "افتحوا كتبكم", category: "at_school", emoji: "📖" },
      { english: "Pay attention please", hebrew: "שימו לב בבקשה", arabic: "انتبهوا من فضلكم", category: "at_school", emoji: "👀" },
    ],
  },
  {
    id: "at_restaurant",
    nameEn: "At The Restaurant",
    nameHe: "במסעדה",
    nameAr: "في المطعم",
    emoji: "🍴",
    phrases: [
      { english: "Table for two please", hebrew: "שולחן לשניים בבקשה", arabic: "طاولة لاثنين من فضلك", category: "at_restaurant", emoji: "🪑" },
      { english: "Can I see the menu?", hebrew: "אפשר לראות את התפריט?", arabic: "هل يمكنني رؤية القائمة؟", category: "at_restaurant", emoji: "📋" },
      { english: "I would like to order", hebrew: "אני רוצה להזמין", arabic: "أريد أن أطلب", category: "at_restaurant", emoji: "🍽️" },
      { english: "The bill please", hebrew: "חשבון בבקשה", arabic: "الفاتورة من فضلك", category: "at_restaurant", emoji: "🧾" },
      { english: "It was delicious", hebrew: "זה היה טעים", arabic: "كان لذيذاً", category: "at_restaurant", emoji: "😋" },
      { english: "Can I have water?", hebrew: "אפשר מים?", arabic: "هل يمكنني الحصول على ماء؟", category: "at_restaurant", emoji: "💧" },
      { english: "I am allergic to nuts", hebrew: "יש לי אלרגיה לאגוזים", arabic: "لدي حساسية من المكسرات", category: "at_restaurant", emoji: "🥜" },
      { english: "Is this spicy?", hebrew: "זה חריף?", arabic: "هل هذا حار؟", category: "at_restaurant", emoji: "🌶️" },
      { english: "I want something sweet", hebrew: "אני רוצה משהו מתוק", arabic: "أريد شيئاً حلواً", category: "at_restaurant", emoji: "🍰" },
      { english: "Where is the bathroom?", hebrew: "איפה השירותים?", arabic: "أين الحمام؟", category: "at_restaurant", emoji: "🚻" },
    ],
  },
  {
    id: "at_doctor",
    nameEn: "At The Doctor",
    nameHe: "אצל הרופא",
    nameAr: "عند الطبيب",
    emoji: "🏥",
    phrases: [
      { english: "I feel sick", hebrew: "אני מרגיש חולה", arabic: "أشعر بالمرض", category: "at_doctor", emoji: "🤒" },
      { english: "I have a headache", hebrew: "כואב לי הראש", arabic: "عندي صداع", category: "at_doctor", emoji: "🤕" },
      { english: "My stomach hurts", hebrew: "כואבת לי הבטן", arabic: "بطني يؤلمني", category: "at_doctor", emoji: "🤢" },
      { english: "I have a fever", hebrew: "יש לי חום", arabic: "عندي حمى", category: "at_doctor", emoji: "🌡️" },
      { english: "I need medicine", hebrew: "אני צריך תרופה", arabic: "أحتاج دواء", category: "at_doctor", emoji: "💊" },
      { english: "Take a deep breath", hebrew: "קח נשימה עמוקה", arabic: "خذ نفساً عميقاً", category: "at_doctor", emoji: "🫁" },
      { english: "I broke my arm", hebrew: "שברתי את היד", arabic: "كسرت ذراعي", category: "at_doctor", emoji: "🤕" },
      { english: "I feel dizzy", hebrew: "אני מרגיש סחרחורת", arabic: "أشعر بالدوار", category: "at_doctor", emoji: "😵" },
      { english: "I am getting better", hebrew: "אני מרגיש יותר טוב", arabic: "أنا أتحسن", category: "at_doctor", emoji: "💪" },
      { english: "Get well soon", hebrew: "החלמה מהירה", arabic: "شفاك الله", category: "at_doctor", emoji: "🌺" },
    ],
  },
  {
    id: "shopping",
    nameEn: "Shopping",
    nameHe: "קניות",
    nameAr: "تسوق",
    emoji: "🛒",
    phrases: [
      { english: "How much does this cost?", hebrew: "כמה זה עולה?", arabic: "كم سعر هذا؟", category: "shopping", emoji: "💰" },
      { english: "Do you have this in blue?", hebrew: "יש לכם את זה בכחול?", arabic: "هل لديكم هذا باللون الأزرق؟", category: "shopping", emoji: "🔵" },
      { english: "Can I try this on?", hebrew: "אפשר למדוד?", arabic: "هل يمكنني تجربته؟", category: "shopping", emoji: "👕" },
      { english: "It is too expensive", hebrew: "זה יקר מדי", arabic: "هذا غالي جداً", category: "shopping", emoji: "💸" },
      { english: "I will take it", hebrew: "אני אקח את זה", arabic: "سآخذه", category: "shopping", emoji: "🛍️" },
      { english: "Do you accept cards?", hebrew: "אתם מקבלים כרטיס?", arabic: "هل تقبلون البطاقات؟", category: "shopping", emoji: "💳" },
      { english: "Where is the exit?", hebrew: "איפה היציאה?", arabic: "أين المخرج؟", category: "shopping", emoji: "🚪" },
      { english: "Is there a discount?", hebrew: "יש הנחה?", arabic: "هل يوجد خصم؟", category: "shopping", emoji: "🏷️" },
      { english: "I am just looking", hebrew: "אני רק מסתכל", arabic: "أنا فقط أتفرج", category: "shopping", emoji: "👀" },
      { english: "Can I return this?", hebrew: "אפשר להחזיר את זה?", arabic: "هل يمكنني إرجاع هذا؟", category: "shopping", emoji: "🔄" },
    ],
  },
  {
    id: "giving_directions",
    nameEn: "Giving Directions",
    nameHe: "מתן הוראות דרך",
    nameAr: "إعطاء الاتجاهات",
    emoji: "🧭",
    phrases: [
      { english: "Turn left", hebrew: "פנה שמאלה", arabic: "اتجه يساراً", category: "giving_directions", emoji: "⬅️" },
      { english: "Turn right", hebrew: "פנה ימינה", arabic: "اتجه يميناً", category: "giving_directions", emoji: "➡️" },
      { english: "Go straight", hebrew: "לך ישר", arabic: "سِر للأمام", category: "giving_directions", emoji: "⬆️" },
      { english: "It is on the left", hebrew: "זה בצד שמאל", arabic: "إنه على اليسار", category: "giving_directions", emoji: "👈" },
      { english: "It is on the right", hebrew: "זה בצד ימין", arabic: "إنه على اليمين", category: "giving_directions", emoji: "👉" },
      { english: "It is near here", hebrew: "זה קרוב מכאן", arabic: "إنه قريب من هنا", category: "giving_directions", emoji: "📍" },
      { english: "It is far away", hebrew: "זה רחוק", arabic: "إنه بعيد", category: "giving_directions", emoji: "🌍" },
      { english: "Cross the street", hebrew: "חצה את הרחוב", arabic: "اعبر الشارع", category: "giving_directions", emoji: "🚶" },
      { english: "Take the bus", hebrew: "קח את האוטובוס", arabic: "خذ الحافلة", category: "giving_directions", emoji: "🚌" },
      { english: "You are lost", hebrew: "אתה אבוד", arabic: "أنت ضائع", category: "giving_directions", emoji: "😵" },
    ],
  },
  {
    id: "making_plans",
    nameEn: "Making Plans",
    nameHe: "תכנון תוכניות",
    nameAr: "وضع خطط",
    emoji: "📅",
    phrases: [
      { english: "What are you doing today?", hebrew: "מה אתה עושה היום?", arabic: "ماذا تفعل اليوم؟", category: "making_plans", emoji: "📌" },
      { english: "Let's meet tomorrow", hebrew: "בוא ניפגש מחר", arabic: "لنلتقِ غداً", category: "making_plans", emoji: "🤝" },
      { english: "Are you free on Friday?", hebrew: "אתה פנוי ביום שישי?", arabic: "هل أنت متفرغ يوم الجمعة؟", category: "making_plans", emoji: "📅" },
      { english: "I am busy right now", hebrew: "אני עסוק עכשיו", arabic: "أنا مشغول الآن", category: "making_plans", emoji: "⏰" },
      { english: "Let's go together", hebrew: "בוא נלך ביחד", arabic: "لنذهب معاً", category: "making_plans", emoji: "👫" },
      { english: "What time shall we meet?", hebrew: "באיזו שעה ניפגש?", arabic: "في أي ساعة نلتقي؟", category: "making_plans", emoji: "🕐" },
      { english: "I will be there at five", hebrew: "אני אהיה שם בחמש", arabic: "سأكون هناك في الخامسة", category: "making_plans", emoji: "5️⃣" },
      { english: "Sounds good to me", hebrew: "נשמע לי טוב", arabic: "يبدو جيداً لي", category: "making_plans", emoji: "👍" },
      { english: "I can't make it", hebrew: "אני לא יכול", arabic: "لا أستطيع الحضور", category: "making_plans", emoji: "😔" },
      { english: "Maybe next time", hebrew: "אולי בפעם הבאה", arabic: "ربما في المرة القادمة", category: "making_plans", emoji: "🔜" },
      { english: "That sounds fun", hebrew: "זה נשמע כיף", arabic: "هذا يبدو ممتعاً", category: "making_plans", emoji: "🎉" },
      { english: "I look forward to it", hebrew: "אני מחכה לזה", arabic: "أتطلع لذلك", category: "making_plans", emoji: "🤩" },
    ],
  },
  {
    id: "describing_people",
    nameEn: "Describing People",
    nameHe: "תיאור אנשים",
    nameAr: "وصف الأشخاص",
    emoji: "👤",
    phrases: [
      { english: "She is tall", hebrew: "היא גבוהה", arabic: "هي طويلة", category: "describing_people", emoji: "📏" },
      { english: "He is short", hebrew: "הוא נמוך", arabic: "هو قصير", category: "describing_people", emoji: "📐" },
      { english: "She has brown hair", hebrew: "יש לה שיער חום", arabic: "لديها شعر بني", category: "describing_people", emoji: "👩‍🦰" },
      { english: "He is wearing glasses", hebrew: "הוא עם משקפיים", arabic: "هو يرتدي نظارات", category: "describing_people", emoji: "👓" },
      { english: "She is very smart", hebrew: "היא מאוד חכמה", arabic: "هي ذكية جداً", category: "describing_people", emoji: "🧠" },
      { english: "He is funny", hebrew: "הוא מצחיק", arabic: "هو مضحك", category: "describing_people", emoji: "😂" },
      { english: "She is kind", hebrew: "היא נחמדה", arabic: "هي لطيفة", category: "describing_people", emoji: "💗" },
      { english: "He looks like his dad", hebrew: "הוא דומה לאבא", arabic: "هو يشبه أباه", category: "describing_people", emoji: "👨‍👦" },
      { english: "She is very strong", hebrew: "היא מאוד חזקה", arabic: "هي قوية جداً", category: "describing_people", emoji: "💪" },
      { english: "He is a good friend", hebrew: "הוא חבר טוב", arabic: "هو صديق جيد", category: "describing_people", emoji: "🤝" },
    ],
  },
  {
    id: "weather_talk",
    nameEn: "Talking About Weather",
    nameHe: "מדברים על מזג האוויר",
    nameAr: "التحدث عن الطقس",
    emoji: "🌤️",
    phrases: [
      { english: "It is sunny today", hebrew: "היום שמשי", arabic: "اليوم مشمس", category: "weather_talk", emoji: "☀️" },
      { english: "It is raining", hebrew: "יורד גשם", arabic: "إنها تمطر", category: "weather_talk", emoji: "🌧️" },
      { english: "It is very cold", hebrew: "מאוד קר", arabic: "الجو بارد جداً", category: "weather_talk", emoji: "🥶" },
      { english: "It is hot today", hebrew: "חם היום", arabic: "الجو حار اليوم", category: "weather_talk", emoji: "🥵" },
      { english: "There is snow outside", hebrew: "יש שלג בחוץ", arabic: "هناك ثلج في الخارج", category: "weather_talk", emoji: "❄️" },
      { english: "The wind is strong", hebrew: "הרוח חזקה", arabic: "الرياح قوية", category: "weather_talk", emoji: "💨" },
      { english: "I need an umbrella", hebrew: "אני צריך מטרייה", arabic: "أحتاج مظلة", category: "weather_talk", emoji: "☂️" },
      { english: "Look at the rainbow", hebrew: "תראה את הקשת", arabic: "انظر إلى قوس قزح", category: "weather_talk", emoji: "🌈" },
      { english: "The sky is cloudy", hebrew: "השמיים מעוננים", arabic: "السماء غائمة", category: "weather_talk", emoji: "☁️" },
      { english: "Beautiful weather today", hebrew: "מזג אוויר יפה היום", arabic: "طقس جميل اليوم", category: "weather_talk", emoji: "🌤️" },
    ],
  },
  {
    id: "phone_calls",
    nameEn: "On The Phone",
    nameHe: "בטלפון",
    nameAr: "على الهاتف",
    emoji: "📞",
    phrases: [
      { english: "Hello, who is this?", hebrew: "שלום, מי מדבר?", arabic: "مرحباً، من المتحدث؟", category: "phone_calls", emoji: "📱" },
      { english: "Can I speak to...?", hebrew: "אפשר לדבר עם...?", arabic: "هل يمكنني التحدث مع...؟", category: "phone_calls", emoji: "🗣️" },
      { english: "Hold on a moment", hebrew: "רגע אחד", arabic: "انتظر لحظة", category: "phone_calls", emoji: "✋" },
      { english: "I will call you back", hebrew: "אני אחזור אליך", arabic: "سأتصل بك لاحقاً", category: "phone_calls", emoji: "📞" },
      { english: "The line is busy", hebrew: "הקו תפוס", arabic: "الخط مشغول", category: "phone_calls", emoji: "📵" },
      { english: "I can't hear you", hebrew: "אני לא שומע אותך", arabic: "لا أسمعك", category: "phone_calls", emoji: "🔇" },
      { english: "Please leave a message", hebrew: "בבקשה השאר הודעה", arabic: "من فضلك اترك رسالة", category: "phone_calls", emoji: "💬" },
      { english: "I will text you", hebrew: "אני אשלח לך הודעה", arabic: "سأرسل لك رسالة", category: "phone_calls", emoji: "📲" },
      { english: "Wrong number", hebrew: "מספר לא נכון", arabic: "رقم خاطئ", category: "phone_calls", emoji: "❌" },
      { english: "Talk to you later", hebrew: "נדבר אחר כך", arabic: "نتكلم لاحقاً", category: "phone_calls", emoji: "👋" },
    ],
  },
  {
    id: "emergencies",
    nameEn: "Emergencies",
    nameHe: "מקרי חירום",
    nameAr: "حالات طوارئ",
    emoji: "🚨",
    phrases: [
      { english: "Help me!", hebrew: "עזרו לי!", arabic: "ساعدوني!", category: "emergencies", emoji: "🆘" },
      { english: "Call the police", hebrew: "תתקשרו למשטרה", arabic: "اتصلوا بالشرطة", category: "emergencies", emoji: "👮" },
      { english: "I need an ambulance", hebrew: "אני צריך אמבולנס", arabic: "أحتاج سيارة إسعاف", category: "emergencies", emoji: "🚑" },
      { english: "There is a fire", hebrew: "יש שריפה", arabic: "هناك حريق", category: "emergencies", emoji: "🔥" },
      { english: "Where is the hospital?", hebrew: "איפה בית החולים?", arabic: "أين المستشفى؟", category: "emergencies", emoji: "🏥" },
      { english: "I lost my passport", hebrew: "איבדתי את הדרכון", arabic: "فقدت جواز سفري", category: "emergencies", emoji: "📕" },
      { english: "Be careful!", hebrew: "תיזהר!", arabic: "كن حذراً!", category: "emergencies", emoji: "⚠️" },
      { english: "Stay calm", hebrew: "תישאר רגוע", arabic: "ابقَ هادئاً", category: "emergencies", emoji: "🧘" },
      { english: "Are you okay?", hebrew: "אתה בסדר?", arabic: "هل أنت بخير؟", category: "emergencies", emoji: "💙" },
      { english: "Call for help", hebrew: "קרא לעזרה", arabic: "اطلب المساعدة", category: "emergencies", emoji: "📢" },
    ],
  },
];

// Merge base + extended
phraseGroups.push(...phraseGroupsExtended);

/** Get all phrases flattened */
export const getAllPhrases = (): Phrase[] =>
  phraseGroups.flatMap(g => g.phrases);

/** Get phrase group name by language */
export const getPhraseGroupName = (group: PhraseGroup, lang: Language) =>
  lang === "he" ? group.nameHe : lang === "ar" ? group.nameAr : group.nameEn;

/** Get phrase translation */
export const getPhraseTranslation = (phrase: Phrase, lang: Language) =>
  lang === "he" ? phrase.hebrew : lang === "ar" ? phrase.arabic : phrase.english;
