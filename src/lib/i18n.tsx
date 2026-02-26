import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "he" | "ar";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
  dir: "rtl";
  nativeName: string;
  speechLang: string;
}

const translations: Record<string, Record<Language, string>> = {
  // App
  "app.title": { he: "English Fun", ar: "English Fun" },
  "app.subtitle": { he: "!בואו נלמד אנגלית", ar: "!هيا نتعلم الإنجليزية" },
  "app.description": { he: "למידה כיפית ואינטראקטיבית של יסודות השפה האנגלית 🌟", ar: "تعلم ممتع وتفاعلي لأساسيات اللغة الإنجليزية 🌟" },

  // Navigation
  "nav.home": { he: "🏠 בית", ar: "🏠 الرئيسية" },
  "nav.levels": { he: "🗺️ רמות", ar: "🗺️ المستويات" },
  "nav.alphabet": { he: "🔤 אלפבית", ar: "🔤 الأبجدية" },
  "nav.words": { he: "📝 מילים", ar: "📝 كلمات" },
  "nav.memory": { he: "🧩 התאמה", ar: "🧩 تطابق" },
  "nav.quiz": { he: "🎯 חידון", ar: "🎯 اختبار" },

  // Home
  "home.myProgress": { he: "ההתקדמות שלי", ar: "تقدمي" },
  "home.stars": { he: "כוכבים", ar: "نجوم" },
  "home.currentLevel": { he: "הרמה הנוכחית", ar: "المستوى الحالي" },
  "home.level": { he: "רמה", ar: "مستوى" },
  "home.stagesCompleted": { he: "שלבים", ar: "مراحل" },
  "home.moreToNext": { he: "לרמה הבאה", ar: "للمستوى التالي" },
  "home.freePlay": { he: "תרגול חופשי", ar: "تمرين حر" },
  "home.myJourney": { he: "🗺️ מסע הלמידה שלי", ar: "🗺️ رحلة التعلم" },
  "home.didYouKnow": { he: "?הידעת", ar: "هل تعلم؟" },
  "home.funFact": { he: "השפה האנגלית היא השפה הנפוצה ביותר בעולם! יותר ממיליארד אנשים מדברים אנגלית ברחבי העולם 🌍", ar: "اللغة الإنجليزية هي اللغة الأكثر انتشاراً في العالم! أكثر من مليار شخص يتحدثون الإنجليزية حول العالم 🌍" },

  // Quick access
  "quick.alphabet": { he: "אלפבית", ar: "أبجدية" },
  "quick.words": { he: "מילים", ar: "كلمات" },
  "quick.match": { he: "התאמה", ar: "تطابق" },
  "quick.quiz": { he: "חידון", ar: "اختبار" },

  // Alphabet
  "alphabet.title": { he: "🔤 האלפבית האנגלי", ar: "🔤 الأبجدية الإنجليزية" },
  "alphabet.subtitle": { he: "לחץ על אות כדי לשמוע איך היא נשמעת!", ar: "اضغط على حرف لسماع نطقه!" },
  "alphabet.listenLetter": { he: "שמע אות", ar: "اسمع الحرف" },
  "alphabet.learned": { he: "⭐ למדתי!", ar: "⭐ تعلمت!" },

  // Words
  "words.title": { he: "📝 מילים ראשונות", ar: "📝 الكلمات الأولى" },
  "words.subtitle": { he: "בחר קטגוריה ולמד מילים חדשות!", ar: "اختر فئة وتعلم كلمات جديدة!" },
  "words.backToCategories": { he: "חזרה לקטגוריות", ar: "العودة للفئات" },
  "words.tapToReveal": { he: "לחץ לגלות! 👆", ar: "اضغط لاكتشاف! 👆" },
  "words.listen": { he: "השמע", ar: "استمع" },
  "words.iLearned": { he: "⭐ למדתי", ar: "⭐ تعلمت" },
  "words.numWords": { he: "מילים", ar: "كلمات" },

  // Quiz
  "quiz.title": { he: "🎯 חידון כיף", ar: "🎯 اختبار ممتع" },
  "quiz.subtitle": { he: "בדוק כמה למדת!", ar: "اختبر كم تعلمت!" },
  "quiz.question": { he: "שאלה", ar: "سؤال" },
  "quiz.outOf": { he: "מתוך", ar: "من" },
  "quiz.correct": { he: "!🎉 מעולה! נכון", ar: "!🎉 ممتاز! صحيح" },
  "quiz.wrong": { he: "😊 לא נורא, ננסה שוב", ar: "😊 لا بأس، نحاول مرة أخرى" },
  "quiz.finished": { he: "!סיימת את החידון", ar: "!أنهيت الاختبار" },
  "quiz.correctAnswers": { he: "תשובות נכונות", ar: "إجابات صحيحة" },
  "quiz.amazing": { he: "!מדהים! אתה כוכב אמיתי ⭐", ar: "!مذهل! أنت نجم حقيقي ⭐" },
  "quiz.wellDone": { he: "!כל הכבוד! המשך כך 👏", ar: "!أحسنت! واصل هكذا 👏" },
  "quiz.keepTrying": { he: "!לא נורא, תרגול עושה מושלם 💪", ar: "!لا بأس، التمرين يصنع الكمال 💪" },
  "quiz.playAgain": { he: "🔄 שחק שוב", ar: "🔄 العب مرة أخرى" },

  // Memory
  "memory.title": { he: "🧩 משחק התאמה", ar: "🧩 لعبة التطابق" },
  "memory.subtitle": { he: "מצא את הזוגות - התאם מילה באנגלית לתמונה!", ar: "ابحث عن الأزواج - طابق الكلمة الإنجليزية مع الصورة!" },
  "memory.moves": { he: "מהלכים", ar: "حركات" },
  "memory.pairs": { he: "זוגות", ar: "أزواج" },
  "memory.congrats": { he: "!כל הכבוד", ar: "!أحسنت" },
  "memory.finishedIn": { he: "סיימת ב-", ar: "أنهيت في " },
  "memory.movesWord": { he: "מהלכים!", ar: "حركات!" },
  "memory.perfectMemory": { he: "!מדהים! זיכרון מושלם 🧠", ar: "!مذهل! ذاكرة مثالية 🧠" },
  "memory.veryGood": { he: "!יפה מאוד 👏", ar: "!جيد جداً 👏" },
  "memory.keepPracticing": { he: "!כל הכבוד, המשך לתרגל 💪", ar: "!أحسنت، واصل التمرين 💪" },
  "memory.playAgain": { he: "שחק שוב", ar: "العب مرة أخرى" },
  "memory.otherCategory": { he: "קטגוריה אחרת", ar: "فئة أخرى" },
  "memory.back": { he: "חזרה", ar: "رجوع" },

  // Levels
  "levels.title": { he: "🗺️ מסע הלמידה", ar: "🗺️ رحلة التعلم" },
  "levels.subtitle": { he: "השלם שלבים כדי לפתוח רמות חדשות!", ar: "أكمل المراحل لفتح مستويات جديدة!" },
  "levels.stagesCompleted": { he: "שלבים הושלמו", ar: "مراحل مكتملة" },
  "levels.needStars": { he: "צריך", ar: "يحتاج" },
  "levels.toUnlock": { he: "לפתיחה", ar: "لفتح" },
  "levels.collectMore": { he: "אסוף", ar: "اجمع" },
  "levels.moreStarsToUnlock": { he: "כוכבים נוספים כדי לפתוח!", ar: "نجوم إضافية لفتح!" },

  // Categories
  "cat.animals": { he: "חיות", ar: "حيوانات" },
  "cat.colors": { he: "צבעים", ar: "ألوان" },
  "cat.numbers": { he: "מספרים", ar: "أرقام" },
  "cat.fruits": { he: "פירות וירקות", ar: "فواكه وخضروات" },
  "cat.body": { he: "חלקי גוף", ar: "أجزاء الجسم" },
  "cat.family": { he: "משפחה ואנשים", ar: "عائلة وناس" },
  "cat.school": { he: "בית ספר", ar: "مدرسة" },
  "cat.food": { he: "אוכל ומשקאות", ar: "طعام ومشروبات" },
  "cat.clothes": { he: "בגדים", ar: "ملابس" },
  "cat.nature": { he: "טבע ומזג אוויר", ar: "طبيعة وطقس" },
  "cat.home": { he: "בית וחדרים", ar: "بيت وغرف" },
  "cat.vehicles": { he: "רכבים ותחבורה", ar: "مركبات ومواصلات" },
  "cat.feelings": { he: "רגשות ותחושות", ar: "مشاعر وأحاسيس" },
  "cat.time": { he: "זמן ועונות", ar: "وقت وفصول" },
  "cat.sports": { he: "ספורט ומשחקים", ar: "رياضة وألعاب" },
  "cat.actions": { he: "פעולות יומיומיות", ar: "أفعال يومية" },
  "cat.places": { he: "מקומות", ar: "أماكن" },

  // Level names
  "level.1": { he: "צעדים ראשונים", ar: "الخطوات الأولى" },
  "level.2": { he: "מתקדמים!", ar: "!نتقدم" },
  "level.3": { he: "חוקר מילים", ar: "مستكشف الكلمات" },
  "level.4": { he: "אלוף אנגלית!", ar: "!بطل الإنجليزية" },

  // Navigation - new games
  "nav.spelling": { he: "🐝 איות", ar: "🐝 تهجئة" },
  "nav.scramble": { he: "🔀 בלבול", ar: "🔀 خلط" },
  "nav.hangman": { he: "🎭 ניחוש", ar: "🎭 تخمين" },

  // Spelling Bee
  "spelling.title": { he: "🐝 מרוץ האיות", ar: "🐝 سباق التهجئة" },
  "spelling.subtitle": { he: "שמע את המילה וסדר את האותיות!", ar: "اسمع الكلمة ورتّب الحروف!" },
  "spelling.listen": { he: "שמע שוב", ar: "اسمع مرة أخرى" },
  "spelling.finished": { he: "!סיימת את המרוץ", ar: "!أنهيت السباق" },
  "spelling.points": { he: "נקודות", ar: "نقاط" },
  "spelling.bestStreak": { he: "רצף שיא", ar: "أفضل سلسلة" },

  // Word Scramble
  "scramble.title": { he: "🔀 מילים מבולבלות", ar: "🔀 كلمات مخلوطة" },
  "scramble.subtitle": { he: "פענח את המילה המבולבלת!", ar: "فك شفرة الكلمة المخلوطة!" },
  "scramble.reshuffle": { he: "ערבב", ar: "اخلط" },
  "scramble.hint": { he: "רמז", ar: "تلميح" },
  "scramble.check": { he: "בדוק", ar: "تحقق" },

  // Hangman
  "hangman.title": { he: "🎭 נחש את המילה", ar: "🎭 خمّن الكلمة" },
  "hangman.subtitle": { he: "בחר אותיות וגלה את המילה הנסתרת!", ar: "اختر حروف واكتشف الكلمة المخفية!" },
  "hangman.lost": { he: "לא נורא, ננסה שוב", ar: "لا بأس، نحاول مرة أخرى" },

  // Quick access - new
  "quick.spelling": { he: "איות", ar: "تهجئة" },
  "quick.scramble": { he: "בלבול", ar: "خلط" },
  "quick.hangman": { he: "ניחוש", ar: "تخمين" },

  // Fun facts
  "home.funFact1": { he: "השפה האנגלית היא השפה הנפוצה ביותר בעולם! יותר ממיליארד אנשים מדברים אנגלית ברחבי העולם 🌍", ar: "اللغة الإنجليزية هي اللغة الأكثر انتشاراً في العالم! أكثر من مليار شخص يتحدثون الإنجليزية حول العالم 🌍" },
  "home.funFact2": { he: "המילה הארוכה ביותר באנגלית בלי חזרה על אות היא 'uncopyrightable' 📝", ar: "أطول كلمة إنجليزية بدون تكرار حرف هي 'uncopyrightable' 📝" },
  "home.funFact3": { he: "האות E היא האות הנפוצה ביותר באנגלית! 📊", ar: "حرف E هو الحرف الأكثر استخداماً في الإنجليزية! 📊" },
  "home.funFact4": { he: "יש יותר מ-170,000 מילים בשפה האנגלית! 📚", ar: "يوجد أكثر من 170,000 كلمة في اللغة الإنجليزية! 📚" },
  "home.funFact5": { he: "המילה 'set' באנגלית היא המילה עם הכי הרבה משמעויות - יותר מ-430! 🤯", ar: "كلمة 'set' هي الكلمة الإنجليزية التي لديها أكثر المعاني - أكثر من 430! 🤯" },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem("app-lang") as Language) || "he";
  });

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem("app-lang", l);
  };

  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  const value: LanguageContextType = {
    lang,
    setLang,
    t,
    isRTL: true,
    dir: "rtl",
    nativeName: lang === "he" ? "עברית" : "العربية",
    speechLang: lang === "he" ? "he-IL" : "ar-SA",
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
