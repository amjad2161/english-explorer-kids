/**
 * Grammar & Language Structure Learning Data
 * Provides structured lessons for tenses, sentence building, and language rules
 */

import { Language } from "@/lib/i18n";

export interface GrammarExample {
  english: string;
  hebrew: string;
  arabic: string;
}

export interface GrammarRule {
  id: string;
  formula: string; // e.g. "Subject + Verb + Object"
  examples: GrammarExample[];
}

export interface GrammarLesson {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  emoji: string;
  level: number; // 1=beginner, 2=elementary, 3=intermediate, 4=advanced
  rules: GrammarRule[];
  quiz: GrammarQuizItem[];
}

export interface GrammarQuizItem {
  type: "fill-blank" | "choose-correct" | "reorder" | "match-tense";
  question: Record<Language, string>;
  /** For fill-blank: sentence with ___ */
  sentence?: string;
  options: string[];
  correctIndex: number;
  /** For reorder: correct word order */
  correctOrder?: string[];
  explanation: Record<Language, string>;
}

export interface CurriculumLevel {
  id: string;
  level: number;
  title: Record<Language, string>;
  description: Record<Language, string>;
  emoji: string;
  color: string;
  modules: CurriculumModule[];
}

export interface CurriculumModule {
  id: string;
  title: Record<Language, string>;
  type: "vocabulary" | "grammar" | "game" | "practice";
  /** Route path or topic index */
  path: string;
  emoji: string;
  description: Record<Language, string>;
}

// ─── Grammar Lessons ───

export const grammarLessons: GrammarLesson[] = [
  // LEVEL 1: Absolute Basics
  {
    id: "to-be-present",
    title: { en: "To Be (am/is/are)", he: "הפועל To Be (הווה)", ar: "فعل To Be (المضارع)" },
    description: { en: "Learn when to use am, is, and are", he: "למד מתי להשתמש ב-am, is, are", ar: "تعلم متى تستخدم am, is, are" },
    emoji: "🔤",
    level: 1,
    rules: [
      {
        id: "to-be-1",
        formula: "I + am | He/She/It + is | You/We/They + are",
        examples: [
          { english: "I am happy.", hebrew: "אני שמח.", arabic: "أنا سعيد." },
          { english: "She is a teacher.", hebrew: "היא מורה.", arabic: "هي معلمة." },
          { english: "They are friends.", hebrew: "הם חברים.", arabic: "هم أصدقاء." },
          { english: "It is big.", hebrew: "זה גדול.", arabic: "هذا كبير." },
          { english: "We are students.", hebrew: "אנחנו תלמידים.", arabic: "نحن طلاب." },
        ],
      },
    ],
    quiz: [
      {
        type: "fill-blank",
        question: { en: "Choose the correct word:", he: "בחר את המילה הנכונה:", ar: "اختر الكلمة الصحيحة:" },
        sentence: "I ___ a student.",
        options: ["am", "is", "are", "be"],
        correctIndex: 0,
        explanation: { en: "We use 'am' with 'I'.", he: "משתמשים ב-am עם I.", ar: "نستخدم am مع I." },
      },
      {
        type: "fill-blank",
        question: { en: "Choose the correct word:", he: "בחר את המילה הנכונה:", ar: "اختر الكلمة الصحيحة:" },
        sentence: "She ___ happy.",
        options: ["am", "is", "are", "be"],
        correctIndex: 1,
        explanation: { en: "We use 'is' with he/she/it.", he: "משתמשים ב-is עם he/she/it.", ar: "نستخدم is مع he/she/it." },
      },
      {
        type: "fill-blank",
        question: { en: "Choose the correct word:", he: "בחר את המילה הנכונה:", ar: "اختر الكلمة الصحيحة:" },
        sentence: "They ___ at school.",
        options: ["am", "is", "are", "be"],
        correctIndex: 2,
        explanation: { en: "We use 'are' with they/we/you.", he: "משתמשים ב-are עם they/we/you.", ar: "نستخدم are مع they/we/you." },
      },
      {
        type: "choose-correct",
        question: { en: "Which sentence is correct?", he: "איזה משפט נכון?", ar: "أي جملة صحيحة?" },
        options: ["I is happy.", "I am happy.", "I are happy.", "I be happy."],
        correctIndex: 1,
        explanation: { en: "I + am is the correct form.", he: "I + am הוא הצירוף הנכון.", ar: "I + am هو الشكل الصحيح." },
      },
    ],
  },
  {
    id: "simple-present",
    title: { en: "Simple Present", he: "הווה פשוט", ar: "المضارع البسيط" },
    description: { en: "Talk about habits and daily routines", he: "דבר על הרגלים ושגרה יומית", ar: "تحدث عن العادات والروتين اليومي" },
    emoji: "🔁",
    level: 1,
    rules: [
      {
        id: "simple-present-1",
        formula: "I/You/We/They + verb | He/She/It + verb+s",
        examples: [
          { english: "I eat breakfast every day.", hebrew: "אני אוכל ארוחת בוקר כל יום.", arabic: "أنا آكل الفطور كل يوم." },
          { english: "She plays soccer.", hebrew: "היא משחקת כדורגל.", arabic: "هي تلعب كرة القدم." },
          { english: "They go to school.", hebrew: "הם הולכים לבית הספר.", arabic: "هم يذهبون إلى المدرسة." },
          { english: "He reads books.", hebrew: "הוא קורא ספרים.", arabic: "هو يقرأ كتباً." },
        ],
      },
    ],
    quiz: [
      {
        type: "fill-blank",
        question: { en: "Choose the correct form:", he: "בחר את הצורה הנכונה:", ar: "اختر الشكل الصحيح:" },
        sentence: "She ___ to school every day.",
        options: ["go", "goes", "going", "gone"],
        correctIndex: 1,
        explanation: { en: "With he/she/it we add 's' to the verb.", he: "עם he/she/it מוסיפים s לפועל.", ar: "مع he/she/it نضيف s للفعل." },
      },
      {
        type: "fill-blank",
        question: { en: "Choose the correct form:", he: "בחר את הצורה הנכונה:", ar: "اختر الشكل الصحيح:" },
        sentence: "They ___ soccer after school.",
        options: ["plays", "play", "playing", "played"],
        correctIndex: 1,
        explanation: { en: "With they/we/I, use the base form.", he: "עם they/we/I, משתמשים בצורת הבסיס.", ar: "مع they/we/I نستخدم الشكل الأساسي." },
      },
      {
        type: "choose-correct",
        question: { en: "Which is correct?", he: "מה נכון?", ar: "أيهما صحيح?" },
        options: ["He drink milk.", "He drinks milk.", "He drinking milk.", "He drinked milk."],
        correctIndex: 1,
        explanation: { en: "He + verb+s for present simple.", he: "He + פועל+s בהווה פשוט.", ar: "He + فعل+s في المضارع البسيط." },
      },
    ],
  },
  {
    id: "present-continuous",
    title: { en: "Present Continuous", he: "הווה ממושך", ar: "المضارع المستمر" },
    description: { en: "Talk about what's happening right now", he: "דבר על מה שקורה עכשיו", ar: "تحدث عما يحدث الآن" },
    emoji: "⏳",
    level: 2,
    rules: [
      {
        id: "present-cont-1",
        formula: "Subject + am/is/are + verb-ing",
        examples: [
          { english: "I am eating lunch.", hebrew: "אני אוכל ארוחת צהריים.", arabic: "أنا آكل الغداء." },
          { english: "She is reading a book.", hebrew: "היא קוראת ספר.", arabic: "هي تقرأ كتاباً." },
          { english: "They are playing outside.", hebrew: "הם משחקים בחוץ.", arabic: "هم يلعبون في الخارج." },
          { english: "The dog is running.", hebrew: "הכלב רץ.", arabic: "الكلب يركض." },
        ],
      },
    ],
    quiz: [
      {
        type: "fill-blank",
        question: { en: "Choose the correct form:", he: "בחר את הצורה הנכונה:", ar: "اختر الشكل الصحيح:" },
        sentence: "I ___ watching TV now.",
        options: ["is", "am", "are", "be"],
        correctIndex: 1,
        explanation: { en: "I + am + verb-ing for present continuous.", he: "I + am + פועל-ing בהווה ממושך.", ar: "I + am + فعل-ing في المضارع المستمر." },
      },
      {
        type: "fill-blank",
        question: { en: "Choose the correct form:", he: "בחר את הצורה הנכונה:", ar: "اختر الشكل الصحيح:" },
        sentence: "She is ___ a song.",
        options: ["sing", "sings", "singing", "sang"],
        correctIndex: 2,
        explanation: { en: "is/am/are + verb-ing", he: "is/am/are + פועל-ing", ar: "is/am/are + فعل-ing" },
      },
      {
        type: "choose-correct",
        question: { en: "Which sentence means 'happening now'?", he: "איזה משפט אומר 'קורה עכשיו'?", ar: "أي جملة تعني 'يحدث الآن'?" },
        options: ["She reads a book.", "She is reading a book.", "She read a book.", "She will read a book."],
        correctIndex: 1,
        explanation: { en: "Present continuous (is + verb-ing) = happening now.", he: "הווה ממושך (is + פועל-ing) = קורה עכשיו.", ar: "المضارع المستمر (is + فعل-ing) = يحدث الآن." },
      },
    ],
  },
  {
    id: "simple-past",
    title: { en: "Simple Past", he: "עבר פשוט", ar: "الماضي البسيط" },
    description: { en: "Talk about things that already happened", he: "דבר על דברים שכבר קרו", ar: "تحدث عن أشياء حدثت بالفعل" },
    emoji: "⏪",
    level: 2,
    rules: [
      {
        id: "past-1",
        formula: "Subject + verb+ed (regular) | Subject + irregular past",
        examples: [
          { english: "I played soccer yesterday.", hebrew: "שיחקתי כדורגל אתמול.", arabic: "لعبت كرة القدم أمس." },
          { english: "She walked to school.", hebrew: "היא הלכה לבית הספר.", arabic: "هي مشت إلى المدرسة." },
          { english: "He ate an apple.", hebrew: "הוא אכל תפוח.", arabic: "هو أكل تفاحة." },
          { english: "They went to the park.", hebrew: "הם הלכו לפארק.", arabic: "هم ذهبوا إلى الحديقة." },
          { english: "We saw a movie.", hebrew: "ראינו סרט.", arabic: "شاهدنا فيلماً." },
        ],
      },
    ],
    quiz: [
      {
        type: "fill-blank",
        question: { en: "Choose the past tense:", he: "בחר בצורת העבר:", ar: "اختر صيغة الماضي:" },
        sentence: "I ___ to school yesterday.",
        options: ["walk", "walks", "walked", "walking"],
        correctIndex: 2,
        explanation: { en: "Regular past: add -ed to the verb.", he: "עבר רגיל: מוסיפים ed לפועל.", ar: "الماضي المنتظم: أضف ed للفعل." },
      },
      {
        type: "fill-blank",
        question: { en: "Choose the past tense:", he: "בחר בצורת העבר:", ar: "اختر صيغة الماضي:" },
        sentence: "She ___ an apple.",
        options: ["eat", "eats", "ate", "eating"],
        correctIndex: 2,
        explanation: { en: "'Ate' is the irregular past of 'eat'.", he: "'Ate' הוא העבר הלא רגיל של 'eat'.", ar: "'Ate' هو الماضي الشاذ لـ 'eat'." },
      },
      {
        type: "choose-correct",
        question: { en: "Which sentence is in the past?", he: "איזה משפט בעבר?", ar: "أي جملة في الماضي?" },
        options: ["I play soccer.", "I am playing soccer.", "I played soccer.", "I will play soccer."],
        correctIndex: 2,
        explanation: { en: "Played (verb+ed) = past tense.", he: "Played (פועל+ed) = זמן עבר.", ar: "Played (فعل+ed) = زمن الماضي." },
      },
    ],
  },
  {
    id: "simple-future",
    title: { en: "Simple Future (will)", he: "עתיד פשוט (will)", ar: "المستقبل البسيط (will)" },
    description: { en: "Talk about things that will happen", he: "דבר על דברים שיקרו בעתיד", ar: "تحدث عن أشياء ستحدث" },
    emoji: "🔮",
    level: 2,
    rules: [
      {
        id: "future-1",
        formula: "Subject + will + verb (base form)",
        examples: [
          { english: "I will eat dinner later.", hebrew: "אני אוכל ארוחת ערב מאוחר יותר.", arabic: "سآكل العشاء لاحقاً." },
          { english: "She will go to school tomorrow.", hebrew: "היא תלך לבית ספר מחר.", arabic: "ستذهب إلى المدرسة غداً." },
          { english: "They will play soccer.", hebrew: "הם ישחקו כדורגל.", arabic: "سيلعبون كرة القدم." },
          { english: "It will rain tomorrow.", hebrew: "מחר ירד גשם.", arabic: "ستمطر غداً." },
        ],
      },
    ],
    quiz: [
      {
        type: "fill-blank",
        question: { en: "Choose the correct form:", he: "בחר את הצורה הנכונה:", ar: "اختر الشكل الصحيح:" },
        sentence: "I will ___ to the park tomorrow.",
        options: ["goes", "went", "going", "go"],
        correctIndex: 3,
        explanation: { en: "After 'will', use the base form of the verb.", he: "אחרי will משתמשים בצורת הבסיס של הפועל.", ar: "بعد will نستخدم الشكل الأساسي للفعل." },
      },
      {
        type: "choose-correct",
        question: { en: "Which sentence talks about the future?", he: "איזה משפט מדבר על העתיד?", ar: "أي جملة تتحدث عن المستقبل?" },
        options: ["I ate pizza.", "I eat pizza.", "I will eat pizza.", "I am eating pizza."],
        correctIndex: 2,
        explanation: { en: "'Will + verb' = future tense.", he: "'Will + פועל' = זמן עתיד.", ar: "'Will + فعل' = زمن المستقبل." },
      },
    ],
  },
  {
    id: "sentence-building",
    title: { en: "Building Sentences", he: "בניית משפטים", ar: "بناء الجمل" },
    description: { en: "Learn the basic order of English sentences", he: "למד את הסדר הבסיסי של משפטים באנגלית", ar: "تعلم الترتيب الأساسي للجمل الإنجليزية" },
    emoji: "🏗️",
    level: 1,
    rules: [
      {
        id: "svo-1",
        formula: "Subject + Verb + Object (SVO)",
        examples: [
          { english: "I eat apples.", hebrew: "אני אוכל תפוחים.", arabic: "أنا آكل تفاحاً." },
          { english: "She reads books.", hebrew: "היא קוראת ספרים.", arabic: "هي تقرأ كتباً." },
          { english: "The cat drinks milk.", hebrew: "החתול שותה חלב.", arabic: "القطة تشرب الحليب." },
        ],
      },
      {
        id: "svo-2",
        formula: "Subject + Verb + Adjective",
        examples: [
          { english: "The sun is bright.", hebrew: "השמש בהירה.", arabic: "الشمس ساطعة." },
          { english: "He is tall.", hebrew: "הוא גבוה.", arabic: "هو طويل." },
        ],
      },
      {
        id: "svo-3",
        formula: "Subject + Verb + Place",
        examples: [
          { english: "I go to school.", hebrew: "אני הולך לבית ספר.", arabic: "أنا أذهب إلى المدرسة." },
          { english: "She lives in a house.", hebrew: "היא גרה בבית.", arabic: "هي تعيش في بيت." },
        ],
      },
    ],
    quiz: [
      {
        type: "reorder",
        question: { en: "Put the words in the correct order:", he: "סדר את המילים בסדר הנכון:", ar: "رتب الكلمات بالترتيب الصحيح:" },
        options: ["apples", "eat", "I"],
        correctOrder: ["I", "eat", "apples"],
        correctIndex: 0,
        explanation: { en: "English sentences: Subject + Verb + Object.", he: "משפטים באנגלית: נושא + פועל + מושא.", ar: "الجمل الإنجليزية: فاعل + فعل + مفعول به." },
      },
      {
        type: "reorder",
        question: { en: "Put the words in the correct order:", he: "סדר את המילים בסדר הנכון:", ar: "رتب الكلمات بالترتيب الصحيح:" },
        options: ["books", "reads", "She"],
        correctOrder: ["She", "reads", "books"],
        correctIndex: 0,
        explanation: { en: "She (subject) + reads (verb) + books (object).", he: "She (נושא) + reads (פועל) + books (מושא).", ar: "She (فاعل) + reads (فعل) + books (مفعول به)." },
      },
    ],
  },
  {
    id: "negation",
    title: { en: "Negative Sentences", he: "משפטי שלילה", ar: "الجمل المنفية" },
    description: { en: "Learn to say 'not' and 'don't'", he: "למד לומר 'לא' ו-'don't'", ar: "تعلم أن تقول 'لا' و'don't'" },
    emoji: "🚫",
    level: 2,
    rules: [
      {
        id: "neg-1",
        formula: "Subject + do/does + not + verb | Subject + am/is/are + not",
        examples: [
          { english: "I do not like spiders.", hebrew: "אני לא אוהב עכבישים.", arabic: "أنا لا أحب العناكب." },
          { english: "She does not eat meat.", hebrew: "היא לא אוכלת בשר.", arabic: "هي لا تأكل اللحم." },
          { english: "I don't know.", hebrew: "אני לא יודע.", arabic: "أنا لا أعرف." },
          { english: "He isn't here.", hebrew: "הוא לא כאן.", arabic: "هو ليس هنا." },
          { english: "They aren't ready.", hebrew: "הם לא מוכנים.", arabic: "هم ليسوا جاهزين." },
        ],
      },
    ],
    quiz: [
      {
        type: "fill-blank",
        question: { en: "Make it negative:", he: "הפוך לשלילה:", ar: "اجعلها سلبية:" },
        sentence: "I ___ like snakes.",
        options: ["don't", "doesn't", "isn't", "aren't"],
        correctIndex: 0,
        explanation: { en: "I + don't + verb for negative.", he: "I + don't + פועל לשלילה.", ar: "I + don't + فعل للنفي." },
      },
      {
        type: "fill-blank",
        question: { en: "Make it negative:", he: "הפוך לשלילה:", ar: "اجعلها سلبية:" },
        sentence: "She ___ eat fish.",
        options: ["don't", "doesn't", "isn't", "aren't"],
        correctIndex: 1,
        explanation: { en: "She + doesn't + verb.", he: "She + doesn't + פועל.", ar: "She + doesn't + فعل." },
      },
    ],
  },
  {
    id: "questions",
    title: { en: "Asking Questions", he: "שאילת שאלות", ar: "طرح الأسئلة" },
    description: { en: "Learn to form questions in English", he: "למד ליצור שאלות באנגלית", ar: "تعلم تكوين الأسئلة بالإنجليزية" },
    emoji: "❓",
    level: 3,
    rules: [
      {
        id: "q-1",
        formula: "Do/Does + Subject + verb? | Am/Is/Are + Subject + ...?",
        examples: [
          { english: "Do you like ice cream?", hebrew: "אתה אוהב גלידה?", arabic: "هل تحب الآيس كريم?" },
          { english: "Does she play piano?", hebrew: "היא מנגנת בפסנתר?", arabic: "هل تعزف البيانو?" },
          { english: "Is he at home?", hebrew: "הוא בבית?", arabic: "هل هو في البيت?" },
          { english: "Are they coming?", hebrew: "הם באים?", arabic: "هل هم قادمون?" },
        ],
      },
      {
        id: "q-2",
        formula: "What/Where/When/Who/Why/How + auxiliary + Subject + verb?",
        examples: [
          { english: "What do you want?", hebrew: "מה אתה רוצה?", arabic: "ماذا تريد?" },
          { english: "Where does she live?", hebrew: "איפה היא גרה?", arabic: "أين تعيش?" },
          { english: "When do they eat lunch?", hebrew: "מתי הם אוכלים צהריים?", arabic: "متى يأكلون الغداء?" },
          { english: "How are you?", hebrew: "מה שלומך?", arabic: "كيف حالك?" },
        ],
      },
    ],
    quiz: [
      {
        type: "choose-correct",
        question: { en: "Which is a correct question?", he: "מה שאלה נכונה?", ar: "أي سؤال صحيح?" },
        options: ["You like pizza?", "Do you like pizza?", "Like you pizza?", "Pizza you like?"],
        correctIndex: 1,
        explanation: { en: "Do + subject + verb for questions.", he: "Do + נושא + פועל לשאלות.", ar: "Do + فاعل + فعل للأسئلة." },
      },
      {
        type: "fill-blank",
        question: { en: "Complete the question:", he: "השלם את השאלה:", ar: "أكمل السؤال:" },
        sentence: "___ she like chocolate?",
        options: ["Do", "Does", "Is", "Are"],
        correctIndex: 1,
        explanation: { en: "Does + she/he/it + verb.", he: "Does + she/he/it + פועל.", ar: "Does + she/he/it + فعل." },
      },
    ],
  },
  {
    id: "comparisons",
    title: { en: "Comparisons", he: "השוואות", ar: "المقارنات" },
    description: { en: "Learn to compare things: bigger, smaller, the best", he: "למד להשוות דברים: יותר גדול, יותר קטן, הכי טוב", ar: "تعلم المقارنة: أكبر، أصغر، الأفضل" },
    emoji: "⚖️",
    level: 3,
    rules: [
      {
        id: "comp-1",
        formula: "Short adjective: adj+er | Long adjective: more + adj",
        examples: [
          { english: "The elephant is bigger than the cat.", hebrew: "הפיל יותר גדול מהחתול.", arabic: "الفيل أكبر من القطة." },
          { english: "She is taller than me.", hebrew: "היא יותר גבוהה ממני.", arabic: "هي أطول مني." },
          { english: "This book is more interesting.", hebrew: "הספר הזה יותר מעניין.", arabic: "هذا الكتاب أكثر إثارة." },
        ],
      },
      {
        id: "comp-2",
        formula: "the + adj+est | the most + adj",
        examples: [
          { english: "The whale is the biggest animal.", hebrew: "הלוויתן הוא החיה הכי גדולה.", arabic: "الحوت أكبر حيوان." },
          { english: "She is the smartest in class.", hebrew: "היא הכי חכמה בכיתה.", arabic: "هي الأذكى في الصف." },
        ],
      },
    ],
    quiz: [
      {
        type: "fill-blank",
        question: { en: "Complete:", he: "השלם:", ar: "أكمل:" },
        sentence: "The elephant is ___ than the dog.",
        options: ["big", "bigger", "biggest", "more big"],
        correctIndex: 1,
        explanation: { en: "Short adjectives: add -er for comparison.", he: "שמות תואר קצרים: מוסיפים er להשוואה.", ar: "الصفات القصيرة: نضيف er للمقارنة." },
      },
    ],
  },
  {
    id: "modal-verbs",
    title: { en: "Can, Must, Should", he: "Can, Must, Should", ar: "Can, Must, Should" },
    description: { en: "Express ability, obligation, and advice", he: "בטא יכולת, חובה ועצה", ar: "عبّر عن القدرة والالتزام والنصيحة" },
    emoji: "💪",
    level: 3,
    rules: [
      {
        id: "modal-1",
        formula: "Subject + can/must/should + verb (base form)",
        examples: [
          { english: "I can swim.", hebrew: "אני יכול לשחות.", arabic: "أستطيع السباحة." },
          { english: "You must listen.", hebrew: "אתה חייב להקשיב.", arabic: "يجب أن تستمع." },
          { english: "She should study.", hebrew: "היא צריכה ללמוד.", arabic: "يجب أن تدرس." },
          { english: "He can't fly.", hebrew: "הוא לא יכול לעוף.", arabic: "لا يستطيع الطيران." },
        ],
      },
    ],
    quiz: [
      {
        type: "fill-blank",
        question: { en: "Choose the correct word:", he: "בחר את המילה הנכונה:", ar: "اختر الكلمة الصحيحة:" },
        sentence: "Fish ___ swim.",
        options: ["can", "must", "should", "will"],
        correctIndex: 0,
        explanation: { en: "Can = ability (fish have the ability to swim).", he: "Can = יכולת (לדגים יש יכולת לשחות).", ar: "Can = القدرة (الأسماك تستطيع السباحة)." },
      },
    ],
  },
];

// ─── Curriculum Levels (Structured Learning Path) ───

export const curriculumLevels: CurriculumLevel[] = [
  {
    id: "level-1",
    level: 1,
    title: { en: "🌱 Seedling - The Basics", he: "🌱 נבט - יסודות", ar: "🌱 بذرة - الأساسيات" },
    description: { en: "Letters, first words, and basic greetings", he: "אותיות, מילים ראשונות וברכות בסיסיות", ar: "حروف، كلمات أولى وتحيات أساسية" },
    emoji: "🌱",
    color: "grass",
    modules: [
      { id: "c1-1", title: { en: "The Alphabet A-Z", he: "האלפבית A-Z", ar: "الأبجدية A-Z" }, type: "vocabulary", path: "/alphabet", emoji: "🔤", description: { en: "Learn all 26 letters", he: "למד את כל 26 האותיות", ar: "تعلم جميع الـ26 حرف" } },
      { id: "c1-2", title: { en: "Basic Phrases", he: "ביטויים בסיסיים", ar: "عبارات أساسية" }, type: "vocabulary", path: "/topics?topic=25", emoji: "💬", description: { en: "Hello, goodbye, please, thank you", he: "שלום, להתראות, בבקשה, תודה", ar: "مرحباً، وداعاً، من فضلك، شكراً" } },
      { id: "c1-3", title: { en: "Colors", he: "צבעים", ar: "ألوان" }, type: "vocabulary", path: "/topics?topic=1", emoji: "🎨", description: { en: "Learn the basic colors", he: "למד את הצבעים הבסיסיים", ar: "تعلم الألوان الأساسية" } },
      { id: "c1-4", title: { en: "Numbers 1-20", he: "מספרים 1-20", ar: "أرقام 1-20" }, type: "vocabulary", path: "/topics?topic=2", emoji: "🔢", description: { en: "Count from one to twenty", he: "ספור מאחד עד עשרים", ar: "عد من واحد إلى عشرين" } },
      { id: "c1-5", title: { en: "Pronouns (I, You, He...)", he: "כינויים (I, You, He...)", ar: "ضمائر (I, You, He...)" }, type: "vocabulary", path: "/topics?topic=26", emoji: "🫵", description: { en: "Learn basic pronouns", he: "למד כינויי גוף בסיסיים", ar: "تعلم الضمائر الأساسية" } },
      { id: "c1-6", title: { en: "To Be (am/is/are)", he: "הפועל To Be", ar: "فعل To Be" }, type: "grammar", path: "/grammar?lesson=to-be-present", emoji: "🔤", description: { en: "I am, She is, They are", he: "I am, She is, They are", ar: "I am, She is, They are" } },
      { id: "c1-7", title: { en: "Memory Game - Colors", he: "משחק זיכרון - צבעים", ar: "لعبة ذاكرة - ألوان" }, type: "game", path: "/memory?topic=1", emoji: "🧩", description: { en: "Match colors to practice", he: "התאם צבעים לתרגול", ar: "طابق الألوان للتدريب" } },
    ],
  },
  {
    id: "level-2",
    level: 2,
    title: { en: "🌿 Sprout - First Words", he: "🌿 נצר - מילים ראשונות", ar: "🌿 نبتة - كلمات أولى" },
    description: { en: "Animals, food, family, and everyday objects", he: "חיות, אוכל, משפחה וחפצים יומיומיים", ar: "حيوانات، طعام، عائلة وأغراض يومية" },
    emoji: "🌿",
    color: "grass",
    modules: [
      { id: "c2-1", title: { en: "Animals", he: "חיות", ar: "حيوانات" }, type: "vocabulary", path: "/topics?topic=0", emoji: "🐾", description: { en: "Cat, dog, bird and more", he: "חתול, כלב, ציפור ועוד", ar: "قطة، كلب، طائر والمزيد" } },
      { id: "c2-2", title: { en: "Food & Drinks", he: "אוכל ומשקאות", ar: "طعام ومشروبات" }, type: "vocabulary", path: "/topics?topic=7", emoji: "🍕", description: { en: "Pizza, milk, bread...", he: "פיצה, חלב, לחם...", ar: "بيتزا، حليب، خبز..." } },
      { id: "c2-3", title: { en: "Family & People", he: "משפחה ואנשים", ar: "عائلة وناس" }, type: "vocabulary", path: "/topics?topic=5", emoji: "👨‍👩‍👧", description: { en: "Mother, father, sister...", he: "אמא, אבא, אחות...", ar: "أم، أب، أخت..." } },
      { id: "c2-4", title: { en: "Everyday Objects", he: "חפצים יומיומיים", ar: "أغراض يومية" }, type: "vocabulary", path: "/topics?topic=24", emoji: "🧸", description: { en: "Toothbrush, soap, umbrella...", he: "מברשת שיניים, סבון, מטרייה...", ar: "فرشاة أسنان، صابون، مظلة..." } },
      { id: "c2-5", title: { en: "Body Parts", he: "חלקי גוף", ar: "أجزاء الجسم" }, type: "vocabulary", path: "/body-parts", emoji: "🦵", description: { en: "Interactive body game", he: "משחק גוף אינטראקטיבי", ar: "لعبة الجسم التفاعلية" } },
      { id: "c2-6", title: { en: "Building Sentences", he: "בניית משפטים", ar: "بناء الجمل" }, type: "grammar", path: "/grammar?lesson=sentence-building", emoji: "🏗️", description: { en: "Subject + Verb + Object", he: "נושא + פועל + מושא", ar: "فاعل + فعل + مفعول به" } },
      { id: "c2-7", title: { en: "Quiz - Level 2", he: "חידון - רמה 2", ar: "اختبار - مستوى 2" }, type: "game", path: "/quiz", emoji: "🎯", description: { en: "Test your knowledge", he: "בדוק את הידע שלך", ar: "اختبر معرفتك" } },
    ],
  },
  {
    id: "level-3",
    level: 3,
    title: { en: "🌳 Sapling - Daily Life", he: "🌳 שתיל - חיי יום יום", ar: "🌳 شتلة - الحياة اليومية" },
    description: { en: "Actions, time, clothes, home, and present tense", he: "פעולות, זמן, בגדים, בית והווה", ar: "أفعال، وقت، ملابس، بيت والمضارع" },
    emoji: "🌳",
    color: "sky",
    modules: [
      { id: "c3-1", title: { en: "Daily Actions", he: "פעולות יומיומיות", ar: "أفعال يومية" }, type: "vocabulary", path: "/topics?topic=13", emoji: "🏃", description: { en: "Eat, sleep, walk, read...", he: "לאכול, לישון, ללכת, לקרוא...", ar: "يأكل، ينام، يمشي، يقرأ..." } },
      { id: "c3-2", title: { en: "Verbs", he: "פעלים", ar: "أفعال" }, type: "vocabulary", path: "/topics?topic=18", emoji: "🏃", description: { en: "40+ essential verbs", he: "40+ פעלים חיוניים", ar: "40+ فعل أساسي" } },
      { id: "c3-3", title: { en: "Time & Days", he: "זמן וימים", ar: "وقت وأيام" }, type: "vocabulary", path: "/topics?topic=12", emoji: "🕐", description: { en: "Morning, night, Monday...", he: "בוקר, לילה, יום שני...", ar: "صباح، ليل، الاثنين..." } },
      { id: "c3-4", title: { en: "Clothes", he: "בגדים", ar: "ملابس" }, type: "vocabulary", path: "/topics?topic=8", emoji: "👕", description: { en: "Shirt, pants, shoes...", he: "חולצה, מכנסיים, נעליים...", ar: "قميص، بنطال، أحذية..." } },
      { id: "c3-5", title: { en: "Home & Rooms", he: "בית וחדרים", ar: "بيت وغرف" }, type: "vocabulary", path: "/topics?topic=10", emoji: "🏠", description: { en: "Door, bed, kitchen...", he: "דלת, מיטה, מטבח...", ar: "باب، سرير، مطبخ..." } },
      { id: "c3-6", title: { en: "Simple Present Tense", he: "הווה פשוט", ar: "المضارع البسيط" }, type: "grammar", path: "/grammar?lesson=simple-present", emoji: "🔁", description: { en: "I eat, She plays, They go", he: "I eat, She plays, They go", ar: "I eat, She plays, They go" } },
      { id: "c3-7", title: { en: "Spelling Bee", he: "מרוץ האיות", ar: "سباق التهجئة" }, type: "game", path: "/spelling", emoji: "🐝", description: { en: "Spell the words correctly", he: "אייט את המילים נכון", ar: "تهجى الكلمات بشكل صحيح" } },
    ],
  },
  {
    id: "level-4",
    level: 4,
    title: { en: "🌲 Tree - Connecting Ideas", he: "🌲 עץ - חיבור רעיונות", ar: "🌲 شجرة - ربط الأفكار" },
    description: { en: "Connectors, prepositions, feelings, and past tense", he: "מילות חיבור, מילות יחס, רגשות ועבר", ar: "كلمات ربط، حروف جر، مشاعر والماضي" },
    emoji: "🌲",
    color: "candy",
    modules: [
      { id: "c4-1", title: { en: "Feelings & Emotions", he: "רגשות ותחושות", ar: "مشاعر وأحاسيس" }, type: "vocabulary", path: "/topics?topic=11", emoji: "😊", description: { en: "Happy, sad, angry, excited...", he: "שמח, עצוב, כועס, נרגש...", ar: "سعيد، حزين، غاضب، متحمس..." } },
      { id: "c4-2", title: { en: "Connectors", he: "מילות חיבור", ar: "كلمات ربط" }, type: "vocabulary", path: "/topics?topic=22", emoji: "🔗", description: { en: "And, but, because, so...", he: "ו, אבל, כי, אז...", ar: "و، لكن، لأن، لذلك..." } },
      { id: "c4-3", title: { en: "Prepositions", he: "מילות מיקום", ar: "حروف الجر" }, type: "vocabulary", path: "/topics?topic=21", emoji: "📍", description: { en: "Under, over, between...", he: "מתחת, מעל, בין...", ar: "تحت، فوق، بين..." } },
      { id: "c4-4", title: { en: "Question Words", he: "מילות שאלה", ar: "كلمات استفهام" }, type: "vocabulary", path: "/topics?topic=23", emoji: "❓", description: { en: "What, where, when, why...", he: "מה, איפה, מתי, למה...", ar: "ماذا، أين، متى، لماذا..." } },
      { id: "c4-5", title: { en: "Opposites", he: "הפכים", ar: "أضداد" }, type: "vocabulary", path: "/topics?topic=20", emoji: "↔️", description: { en: "Big/small, hot/cold...", he: "גדול/קטן, חם/קר...", ar: "كبير/صغير، حار/بارد..." } },
      { id: "c4-6", title: { en: "Past Tense", he: "זמן עבר", ar: "زمن الماضي" }, type: "grammar", path: "/grammar?lesson=simple-past", emoji: "⏪", description: { en: "I played, She ate, They went", he: "I played, She ate, They went", ar: "I played, She ate, They went" } },
      { id: "c4-7", title: { en: "Negative Sentences", he: "משפטי שלילה", ar: "الجمل المنفية" }, type: "grammar", path: "/grammar?lesson=negation", emoji: "🚫", description: { en: "I don't, She doesn't", he: "I don't, She doesn't", ar: "I don't, She doesn't" } },
      { id: "c4-8", title: { en: "Hangman Game", he: "נחש את המילה", ar: "خمّن الكلمة" }, type: "game", path: "/hangman", emoji: "🎭", description: { en: "Guess the hidden word", he: "נחש את המילה הנסתרת", ar: "خمّن الكلمة المخفية" } },
    ],
  },
  {
    id: "level-5",
    level: 5,
    title: { en: "🏔️ Mountain - Advanced", he: "🏔️ הר - מתקדם", ar: "🏔️ جبل - متقدم" },
    description: { en: "Future tense, questions, comparisons, and complex topics", he: "עתיד, שאלות, השוואות ונושאים מורכבים", ar: "المستقبل، أسئلة، مقارنات ومواضيع معقدة" },
    emoji: "🏔️",
    color: "sunshine",
    modules: [
      { id: "c5-1", title: { en: "Present Continuous", he: "הווה ממושך", ar: "المضارع المستمر" }, type: "grammar", path: "/grammar?lesson=present-continuous", emoji: "⏳", description: { en: "I am eating, She is running", he: "I am eating, She is running", ar: "I am eating, She is running" } },
      { id: "c5-2", title: { en: "Future Tense", he: "זמן עתיד", ar: "زمن المستقبل" }, type: "grammar", path: "/grammar?lesson=simple-future", emoji: "🔮", description: { en: "I will go, They will play", he: "I will go, They will play", ar: "I will go, They will play" } },
      { id: "c5-3", title: { en: "Asking Questions", he: "שאילת שאלות", ar: "طرح الأسئلة" }, type: "grammar", path: "/grammar?lesson=questions", emoji: "❓", description: { en: "Do you...? Where is...?", he: "Do you...? Where is...?", ar: "Do you...? Where is...?" } },
      { id: "c5-4", title: { en: "Comparisons", he: "השוואות", ar: "المقارنات" }, type: "grammar", path: "/grammar?lesson=comparisons", emoji: "⚖️", description: { en: "Bigger, the biggest, more...", he: "יותר גדול, הכי גדול, יותר...", ar: "أكبر، الأكبر، أكثر..." } },
      { id: "c5-5", title: { en: "Can, Must, Should", he: "Can, Must, Should", ar: "Can, Must, Should" }, type: "grammar", path: "/grammar?lesson=modal-verbs", emoji: "💪", description: { en: "Express ability and obligation", he: "בטא יכולת וחובה", ar: "عبّر عن القدرة والالتزام" } },
      { id: "c5-6", title: { en: "Science Words", he: "מילות מדע", ar: "كلمات علمية" }, type: "vocabulary", path: "/topics?topic=15", emoji: "🔬", description: { en: "Advanced vocabulary", he: "אוצר מילים מתקדם", ar: "مفردات متقدمة" } },
      { id: "c5-7", title: { en: "Travel", he: "נסיעות", ar: "سفر" }, type: "vocabulary", path: "/topics?topic=17", emoji: "✈️", description: { en: "Passport, hotel, airport...", he: "דרכון, מלון, שדה תעופה...", ar: "جواز سفر، فندق، مطار..." } },
      { id: "c5-8", title: { en: "Word Scramble", he: "מילים מבולבלות", ar: "كلمات مخلوطة" }, type: "game", path: "/scramble", emoji: "🔀", description: { en: "Unscramble advanced words", he: "פענח מילים מתקדמות", ar: "فك شفرة كلمات متقدمة" } },
      { id: "c5-9", title: { en: "Story Time", he: "שעת סיפור", ar: "وقت القصة" }, type: "practice", path: "/story", emoji: "📖", description: { en: "Interactive stories in English", he: "סיפורים אינטראקטיביים באנגלית", ar: "قصص تفاعلية بالإنجليزية" } },
    ],
  },
];

export const getLessonById = (id: string) => grammarLessons.find(l => l.id === id);
