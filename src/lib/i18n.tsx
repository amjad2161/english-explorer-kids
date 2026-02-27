import React, { createContext, useContext, useState } from "react";

export type Language = "he" | "ar" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
  dir: "rtl" | "ltr";
  nativeName: string;
  speechLang: string;
}

const translations: Record<string, Record<Language, string>> = {
  // App
  "app.title": { he: "English Fun", ar: "English Fun", en: "English Fun" },
  "app.subtitle": { he: "!בואו נלמד אנגלית", ar: "!هيا نتعلم الإنجليزية", en: "Let's learn English!" },
  "app.description": { he: "למידה כיפית ואינטראקטיבית של יסודות השפה האנגלית 🌟", ar: "تعلم ممتع وتفاعلي لأساسيات اللغة الإنجليزية 🌟", en: "Fun and interactive English language learning 🌟" },

  // Navigation
  "nav.home": { he: "🏠 בית", ar: "🏠 الرئيسية", en: "🏠 Home" },
  "nav.levels": { he: "🗺️ רמות", ar: "🗺️ المستويات", en: "🗺️ Levels" },
  "nav.alphabet": { he: "🔤 אלפבית", ar: "🔤 الأبجدية", en: "🔤 ABC" },
  "nav.words": { he: "📝 מילים", ar: "📝 كلمات", en: "📝 Words" },
  "nav.memory": { he: "🧩 התאמה", ar: "🧩 تطابق", en: "🧩 Match" },
  "nav.quiz": { he: "🎯 חידון", ar: "🎯 اختبار", en: "🎯 Quiz" },
  "nav.backToLevels": { he: "חזרה לרמות", ar: "العودة للمستويات", en: "Back to Levels" },

  // Home
  "home.myProgress": { he: "ההתקדמות שלי", ar: "تقدمي", en: "My Progress" },
  "home.stars": { he: "כוכבים", ar: "نجوم", en: "Stars" },
  "home.currentLevel": { he: "הרמה הנוכחית", ar: "المستوى الحالي", en: "Current Level" },
  "home.level": { he: "רמה", ar: "مستوى", en: "Level" },
  "home.stagesCompleted": { he: "שלבים", ar: "مراحل", en: "Stages" },
  "home.moreToNext": { he: "לרמה הבאה", ar: "للمستوى التالي", en: "to next level" },
  "home.freePlay": { he: "תרגול חופשי", ar: "تمرين حر", en: "Free Play" },
  "home.myJourney": { he: "🗺️ מסע הלמידה שלי", ar: "🗺️ رحلة التعلم", en: "🗺️ My Learning Journey" },
  "home.didYouKnow": { he: "?הידעת", ar: "هل تعلم؟", en: "Did you know?" },
  "home.funFact": { he: "השפה האנגלית היא השפה הנפוצה ביותר בעולם! יותר ממיליארד אנשים מדברים אנגלית ברחבי העולם 🌍", ar: "اللغة الإنجليزية هي اللغة الأكثر انتشاراً في العالم! أكثر من مليار شخص يتحدثون الإنجليزية حول العالم 🌍", en: "English is the most widely spoken language in the world! Over a billion people speak English globally 🌍" },

  // Quick access
  "quick.alphabet": { he: "אלפבית", ar: "أبجدية", en: "ABC" },
  "quick.words": { he: "מילים", ar: "كلمات", en: "Words" },
  "quick.match": { he: "התאמה", ar: "تطابق", en: "Match" },
  "quick.quiz": { he: "חידון", ar: "اختبار", en: "Quiz" },

  // Alphabet
  "alphabet.title": { he: "🔤 האלפבית האנגלי", ar: "🔤 الأبجدية الإنجليزية", en: "🔤 The English Alphabet" },
  "alphabet.subtitle": { he: "לחץ על אות כדי לשמוע איך היא נשמעת!", ar: "اضغط على حرف لسماع نطقه!", en: "Click a letter to hear how it sounds!" },
  "alphabet.listenLetter": { he: "שמע אות", ar: "اسمع الحرف", en: "Listen" },
  "alphabet.learned": { he: "⭐ למדתי!", ar: "⭐ تعلمت!", en: "⭐ Learned!" },

  // Words
  "words.title": { he: "📝 מילים ראשונות", ar: "📝 الكلمات الأولى", en: "📝 First Words" },
  "words.subtitle": { he: "בחר קטגוריה ולמד מילים חדשות!", ar: "اختر فئة وتعلم كلمات جديدة!", en: "Pick a category and learn new words!" },
  "words.backToCategories": { he: "חזרה לקטגוריות", ar: "العودة للفئات", en: "Back to categories" },
  "words.tapToReveal": { he: "לחץ לגלות! 👆", ar: "اضغط لاكتشاف! 👆", en: "Tap to reveal! 👆" },
  "words.listen": { he: "השמע", ar: "استمع", en: "Listen" },
  "words.iLearned": { he: "⭐ למדתי", ar: "⭐ تعلمت", en: "⭐ Learned" },
  "words.numWords": { he: "מילים", ar: "كلمات", en: "words" },

  // Quiz
  "quiz.title": { he: "🎯 חידון כיף", ar: "🎯 اختبار ممتع", en: "🎯 Fun Quiz" },
  "quiz.subtitle": { he: "בדוק כמה למדת!", ar: "اختبر كم تعلمت!", en: "Test what you've learned!" },
  "quiz.question": { he: "שאלה", ar: "سؤال", en: "Question" },
  "quiz.outOf": { he: "מתוך", ar: "من", en: "of" },
  "quiz.correct": { he: "!🎉 מעולה! נכון", ar: "!🎉 ممتاز! صحيح", en: "🎉 Awesome! Correct!" },
  "quiz.wrong": { he: "😊 לא נורא, ננסה שוב", ar: "😊 لا بأس، نحاول مرة أخرى", en: "😊 No worries, try again!" },
  "quiz.finished": { he: "!סיימת את החידון", ar: "!أنهيت الاختبار", en: "Quiz Complete!" },
  "quiz.correctAnswers": { he: "תשובות נכונות", ar: "إجابات صحيحة", en: "correct answers" },
  "quiz.amazing": { he: "!מדהים! אתה כוכב אמיתי ⭐", ar: "!مذهل! أنت نجم حقيقي ⭐", en: "Amazing! You're a real star ⭐!" },
  "quiz.wellDone": { he: "!כל הכבוד! המשך כך 👏", ar: "!أحسنت! واصل هكذا 👏", en: "Well done! Keep it up 👏!" },
  "quiz.keepTrying": { he: "!לא נורא, תרגול עושה מושלם 💪", ar: "!لا بأس، التمرين يصنع الكمال 💪", en: "Don't give up, practice makes perfect 💪!" },
  "quiz.playAgain": { he: "🔄 שחק שוב", ar: "🔄 العب مرة أخرى", en: "🔄 Play Again" },

  // Memory
  "memory.title": { he: "🧩 משחק התאמה", ar: "🧩 لعبة التطابق", en: "🧩 Matching Game" },
  "memory.subtitle": { he: "מצא את הזוגות - התאם מילה באנגלית לתמונה!", ar: "ابحث عن الأزواج - طابق الكلمة الإنجليزية مع الصورة!", en: "Find the pairs - match English words to pictures!" },
  "memory.moves": { he: "מהלכים", ar: "حركات", en: "moves" },
  "memory.pairs": { he: "זוגות", ar: "أزواج", en: "pairs" },
  "memory.congrats": { he: "!כל הכבוד", ar: "!أحسنت", en: "Congrats!" },
  "memory.finishedIn": { he: "סיימת ב-", ar: "أنهيت في ", en: "Finished in " },
  "memory.movesWord": { he: "מהלכים!", ar: "حركات!", en: "moves!" },
  "memory.perfectMemory": { he: "!מדהים! זיכרון מושלם 🧠", ar: "!مذهل! ذاكرة مثالية 🧠", en: "Amazing! Perfect memory 🧠!" },
  "memory.veryGood": { he: "!יפה מאוד 👏", ar: "!جيد جداً 👏", en: "Very good 👏!" },
  "memory.keepPracticing": { he: "!כל הכבוד, המשך לתרגל 💪", ar: "!أحسنت، واصل التمرين 💪", en: "Great job, keep practicing 💪!" },
  "memory.playAgain": { he: "שחק שוב", ar: "العب مرة أخرى", en: "Play Again" },
  "memory.otherCategory": { he: "קטגוריה אחרת", ar: "فئة أخرى", en: "Other Category" },
  "memory.back": { he: "חזרה", ar: "رجوع", en: "Back" },

  // Levels
  "levels.title": { he: "🗺️ מסע הלמידה", ar: "🗺️ رحلة التعلم", en: "🗺️ Learning Journey" },
  "levels.subtitle": { he: "השלם שלבים כדי לפתוח רמות חדשות!", ar: "أكمل المراحل لفتح مستويات جديدة!", en: "Complete stages to unlock new levels!" },
  "levels.stagesCompleted": { he: "שלבים הושלמו", ar: "مراحل مكتملة", en: "stages completed" },
  "levels.needStars": { he: "צריך", ar: "يحتاج", en: "Need" },
  "levels.toUnlock": { he: "לפתיחה", ar: "لفتح", en: "to unlock" },
  "levels.collectMore": { he: "אסוף", ar: "اجمع", en: "Collect" },
  "levels.moreStarsToUnlock": { he: "כוכבים נוספים כדי לפתוח!", ar: "نجوم إضافية لفتح!", en: "more stars to unlock!" },

  // Categories
  "cat.animals": { he: "חיות", ar: "حيوانات", en: "Animals" },
  "cat.colors": { he: "צבעים", ar: "ألوان", en: "Colors" },
  "cat.numbers": { he: "מספרים", ar: "أرقام", en: "Numbers" },
  "cat.fruits": { he: "פירות וירקות", ar: "فواكه وخضروات", en: "Fruits & Veggies" },
  "cat.body": { he: "חלקי גוף", ar: "أجزاء الجسم", en: "Body Parts" },
  "cat.family": { he: "משפחה ואנשים", ar: "عائلة وناس", en: "Family & People" },
  "cat.school": { he: "בית ספר", ar: "مدرسة", en: "School" },
  "cat.food": { he: "אוכל ומשקאות", ar: "طعام ومشروبات", en: "Food & Drinks" },
  "cat.clothes": { he: "בגדים", ar: "ملابس", en: "Clothes" },
  "cat.nature": { he: "טבע ומזג אוויר", ar: "طبيعة وطقس", en: "Nature & Weather" },
  "cat.home": { he: "בית וחדרים", ar: "بيت وغرف", en: "Home & Rooms" },
  "cat.vehicles": { he: "רכבים ותחבורה", ar: "مركبات ومواصلات", en: "Vehicles" },
  "cat.feelings": { he: "רגשות ותחושות", ar: "مشاعر وأحاسيس", en: "Feelings" },
  "cat.time": { he: "זמן ועונות", ar: "وقت وفصول", en: "Time & Seasons" },
  "cat.sports": { he: "ספורט ומשחקים", ar: "رياضة وألعاب", en: "Sports & Games" },
  "cat.actions": { he: "פעולות יומיומיות", ar: "أفعال يومية", en: "Daily Actions" },
  "cat.places": { he: "מקומות", ar: "أماكن", en: "Places" },

  // Level names
  "level.1": { he: "צעדים ראשונים", ar: "الخطوات الأولى", en: "First Steps" },
  "level.2": { he: "מתקדמים!", ar: "!نتقدم", en: "Moving Forward!" },
  "level.3": { he: "חוקר מילים", ar: "مستكشف الكلمات", en: "Word Explorer" },
  "level.4": { he: "אלוף אנגלית!", ar: "!بطل الإنجليزية", en: "English Champion!" },

  // Navigation - new games
  "nav.spelling": { he: "🐝 איות", ar: "🐝 تهجئة", en: "🐝 Spelling" },
  "nav.scramble": { he: "🔀 בלבול", ar: "🔀 خلط", en: "🔀 Scramble" },
  "nav.hangman": { he: "🎭 ניחוש", ar: "🎭 تخمين", en: "🎭 Guess" },

  // Spelling Bee
  "spelling.title": { he: "🐝 מרוץ האיות", ar: "🐝 سباق التهجئة", en: "🐝 Spelling Bee" },
  "spelling.subtitle": { he: "שמע את המילה וסדר את האותיות!", ar: "اسمع الكلمة ورتّب الحروف!", en: "Listen and arrange the letters!" },
  "spelling.listen": { he: "שמע שוב", ar: "اسمع مرة أخرى", en: "Listen again" },
  "spelling.finished": { he: "!סיימת את המרוץ", ar: "!أنهيت السباق", en: "Race Complete!" },
  "spelling.points": { he: "נקודות", ar: "نقاط", en: "points" },
  "spelling.bestStreak": { he: "רצף שיא", ar: "أفضل سلسلة", en: "Best streak" },

  // Word Scramble
  "scramble.title": { he: "🔀 מילים מבולבלות", ar: "🔀 كلمات مخلوطة", en: "🔀 Word Scramble" },
  "scramble.subtitle": { he: "פענח את המילה המבולבלת!", ar: "فك شفرة الكلمة المخلوطة!", en: "Unscramble the mixed-up word!" },
  "scramble.reshuffle": { he: "ערבב", ar: "اخلط", en: "Shuffle" },
  "scramble.hint": { he: "רמז", ar: "تلميح", en: "Hint" },
  "scramble.check": { he: "בדוק", ar: "تحقق", en: "Check" },

  // Hangman
  "hangman.title": { he: "🎭 נחש את המילה", ar: "🎭 خمّن الكلمة", en: "🎭 Guess the Word" },
  "hangman.subtitle": { he: "בחר אותיות וגלה את המילה הנסתרת!", ar: "اختر حروف واكتشف الكلمة المخفية!", en: "Pick letters and discover the hidden word!" },
  "hangman.lost": { he: "לא נורא, ננסה שוב", ar: "لا بأس، نحاول مرة أخرى", en: "No worries, let's try again!" },

  // Quick access - new
  "quick.spelling": { he: "איות", ar: "تهجئة", en: "Spelling" },
  "quick.scramble": { he: "בלבול", ar: "خلط", en: "Scramble" },
  "quick.hangman": { he: "ניחוש", ar: "تخمين", en: "Guess" },
  "quick.pattern": { he: "דפוסים", ar: "أنماط", en: "Patterns" },

  // Fun facts
  "home.funFact1": { he: "השפה האנגלית היא השפה הנפוצה ביותר בעולם! יותר ממיליארד אנשים מדברים אנגלית ברחבי העולם 🌍", ar: "اللغة الإنجليزية هي اللغة الأكثر انتشاراً في العالم! أكثر من مليار شخص يتحدثون الإنجليزية حول العالم 🌍", en: "English is the most widely spoken language in the world! Over a billion people speak English globally 🌍" },
  "home.funFact2": { he: "המילה הארוכה ביותר באנגלית בלי חזרה על אות היא 'uncopyrightable' 📝", ar: "أطول كلمة إنجليزية بدون تكرار حرف هي 'uncopyrightable' 📝", en: "The longest English word without repeating a letter is 'uncopyrightable' 📝" },
  "home.funFact3": { he: "האות E היא האות הנפוצה ביותר באנגלית! 📊", ar: "حرف E هو الحرف الأكثر استخداماً في الإنجليزية! 📊", en: "The letter E is the most common letter in English! 📊" },
  "home.funFact4": { he: "יש יותר מ-170,000 מילים בשפה האנגלית! 📚", ar: "يوجد أكثر من 170,000 كلمة في اللغة الإنجليزية! 📚", en: "There are over 170,000 words in the English language! 📚" },
  "home.funFact5": { he: "המילה 'set' באנגלית היא המילה עם הכי הרבה משמעויות - יותר מ-430! 🤯", ar: "كلمة 'set' هي الكلمة الإنجليزية التي لديها أكثر المعاني - أكثر من 430! 🤯", en: "The word 'set' has the most meanings in English - over 430! 🤯" },

  // Language selector
  "lang.chooseLanguage": { he: "בחר שפה", ar: "اختر لغة", en: "Choose Language" },

  // GameShell
  "game.quit": { he: "צא מהמשחק", ar: "اخرج من اللعبة", en: "Quit Game" },
  "game.pause": { he: "השהה", ar: "إيقاف مؤقت", en: "Pause" },
  "game.resume": { he: "המשך", ar: "استئناف", en: "Resume" },
  "game.hint": { he: "רמז", ar: "تلميح", en: "Hint" },
  "game.paused": { he: "מושהה", ar: "متوقف مؤقتاً", en: "Paused" },
  "game.quitTitle": { he: "לעזוב את המשחק?", ar: "هل تريد مغادرة اللعبة؟", en: "Leave the game?" },
  "game.quitBody": { he: "ההתקדמות שלך בסשן הזה עלולה ללכת לאיבוד.", ar: "قد تضيع تقدمك في هذه الجلسة.", en: "Your progress in this session may be lost." },
  "game.stay": { he: "הישאר", ar: "ابقَ", en: "Stay" },

  // Story Engine
  "story.title": { he: "📖 סיפורים אינטראקטיביים", ar: "📖 قصص تفاعلية", en: "📖 Interactive Stories" },
  "story.subtitle": { he: "למד אנגלית דרך סיפורים כיפיים!", ar: "تعلم الإنجليزية من خلال قصص ممتعة!", en: "Learn English through fun stories!" },
  "story.scene": { he: "סצנה", ar: "مشهد", en: "Scene" },
  "story.activity": { he: "פעילות", ar: "نشاط", en: "Activity" },
  "story.correct": { he: "!כן! מצוין", ar: "!نعم! ممتاز", en: "Yes! Excellent!" },
  "story.wrong": { he: "נסה שוב", ar: "حاول مرة أخرى", en: "Try Again" },
  "story.next": { he: "הבא", ar: "التالي", en: "Next" },
  "story.finish": { he: "סיים", ar: "إنهاء", en: "Finish" },
  "story.reward": { he: "סיימת את הסיפור!", ar: "أنهيت القصة!", en: "You finished the story!" },

  // Learning Path
  "path.warmUp": { he: "חימום", ar: "إحماء", en: "Warm-up" },
  "path.teach": { he: "הוראה", ar: "تعليم", en: "Teach" },
  "path.guidedPractice": { he: "תרגול מודרך", ar: "ممارسة موجهة", en: "Guided Practice" },
  "path.game": { he: "משחק", ar: "لعبة", en: "Game" },
  "path.story": { he: "סיפור", ar: "قصة", en: "Story" },
  "path.review": { he: "חזרה", ar: "مراجعة", en: "Review" },
  "path.reward": { he: "פרס", ar: "جائزة", en: "Reward" },
  "path.dailyPlan": { he: "תכנית היומית שלי", ar: "خطتي اليومية", en: "My Daily Plan" },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem("app-lang") as Language) || "ar";
  });

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem("app-lang", l);
  };

  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  const isRTL = lang !== "en";

  const value: LanguageContextType = {
    lang,
    setLang,
    t,
    isRTL,
    dir: isRTL ? "rtl" : "ltr",
    nativeName: lang === "he" ? "עברית" : lang === "ar" ? "العربية" : "English",
    speechLang: lang === "he" ? "he-IL" : lang === "ar" ? "ar-SA" : "en-US",
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
