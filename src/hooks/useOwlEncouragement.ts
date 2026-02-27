import { useState, useEffect, useRef, useCallback } from "react";
import { playOwlSpeechSound } from "@/lib/sounds";
import type { Language } from "@/lib/i18n";

/**
 * Multilingual encouragement lines by mood context.
 * Returns a speech bubble string that auto-clears after a delay.
 */

const LINES: Record<string, Record<Language, string[]>> = {
  correct: {
    he: [
      "כל הכבוד! 🎉",
      "מדהים! 🌟",
      "יופי של תשובה! ✨",
      "נכון מאוד! 💪",
      "אלוף/ה! 🏆",
      "וואו, מצוין! ⭐",
      "תותח! 🚀",
      "בול פגיעה! 🎯",
      "ממשיכים! 🔥",
      "איזה חכם/ה! 🧠",
    ],
    ar: [
      "أحسنت! 🎉",
      "رائع! 🌟",
      "إجابة ممتازة! ✨",
      "صحيح تماماً! 💪",
      "بطل/ة! 🏆",
      "واو، ممتاز! ⭐",
      "مدهش! 🚀",
      "إصابة مباشرة! 🎯",
      "نكمل! 🔥",
      "يا ذكي/ة! 🧠",
    ],
    en: [
      "Great job! 🎉",
      "Amazing! 🌟",
      "Wonderful answer! ✨",
      "That's right! 💪",
      "Champion! 🏆",
      "Wow, excellent! ⭐",
      "Superstar! 🚀",
      "Bullseye! 🎯",
      "Keep going! 🔥",
      "So smart! 🧠",
    ],
  },
  combo: {
    he: [
      "רצף מטורף! 🔥🔥",
      "בלתי ניתן לעצירה! 💥",
      "סופר סטאר! ⭐⭐",
      "אין עליך! 🌈",
      "קומבו ענק! 🎆",
    ],
    ar: [
      "سلسلة رهيبة! 🔥🔥",
      "لا يمكن إيقافك! 💥",
      "سوبر ستار! ⭐⭐",
      "لا مثيل لك! 🌈",
      "كومبو ضخم! 🎆",
    ],
    en: [
      "Crazy streak! 🔥🔥",
      "Unstoppable! 💥",
      "Super star! ⭐⭐",
      "You're the best! 🌈",
      "Mega combo! 🎆",
    ],
  },
  wrong: {
    he: [
      "לא נורא, ננסה שוב! 💙",
      "קרוב! בפעם הבאה 😊",
      "טעויות זה בסדר! 📖",
      "אל תוותר! 💪",
      "ממשיכים קדימה! 🌟",
      "עוד קצת ותצליח! ✨",
    ],
    ar: [
      "لا بأس، نحاول مرة أخرى! 💙",
      "قريب! في المرة القادمة 😊",
      "الأخطاء عادية! 📖",
      "لا تستسلم! 💪",
      "نكمل للأمام! 🌟",
      "قريب من النجاح! ✨",
    ],
    en: [
      "No worries, try again! 💙",
      "So close! Next time 😊",
      "Mistakes are OK! 📖",
      "Don't give up! 💪",
      "Keep going! 🌟",
      "Almost there! ✨",
    ],
  },
  celebrate: {
    he: [
      "סיימת בהצלחה! 🎊",
      "איזה כיף! סיום מושלם! 🥳",
      "גאה בך מאוד! 🏅",
      "אלופי! 🌟🌟🌟",
      "שיעור מוצלח! 🎓",
    ],
    ar: [
      "أنهيت بنجاح! 🎊",
      "يا فرحة! إنهاء مثالي! 🥳",
      "فخور/ة بك جداً! 🏅",
      "بطل/ة! 🌟🌟🌟",
      "درس ناجح! 🎓",
    ],
    en: [
      "You did it! 🎊",
      "Yay! Perfect finish! 🥳",
      "So proud of you! 🏅",
      "Champion! 🌟🌟🌟",
      "Lesson complete! 🎓",
    ],
  },
  idle: {
    he: [
      "בוא נלמד! 📚",
      "אני כאן בשבילך! 🦉",
      "מוכנים? 🌟",
      "יאללה! ✨",
    ],
    ar: [
      "هيا نتعلم! 📚",
      "أنا هنا من أجلك! 🦉",
      "مستعدين؟ 🌟",
      "يلا! ✨",
    ],
    en: [
      "Let's learn! 📚",
      "I'm here for you! 🦉",
      "Ready? 🌟",
      "Let's go! ✨",
    ],
  },
};

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

type OwlMood = "idle" | "celebrate" | "sad" | "surprised";

export function useOwlEncouragement(lang: Language = "he") {
  const [speech, setSpeech] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastMoodRef = useRef<string>("");

  const showSpeech = useCallback((text: string, duration = 2200) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSpeech(text);
    timerRef.current = setTimeout(() => setSpeech(null), duration);
  }, []);

  const triggerByMood = useCallback((mood: OwlMood, streak?: number) => {
    const key = `${mood}-${Date.now()}`;
    if (lastMoodRef.current === key) return;
    lastMoodRef.current = key;

    if (mood === "surprised") {
      if (streak && streak >= 3) {
        showSpeech(pick(LINES.combo[lang]));
        playOwlSpeechSound('combo');
      } else {
        showSpeech(pick(LINES.correct[lang]));
        playOwlSpeechSound('correct');
      }
    } else if (mood === "sad") {
      showSpeech(pick(LINES.wrong[lang]));
      playOwlSpeechSound('wrong');
    } else if (mood === "celebrate") {
      showSpeech(pick(LINES.celebrate[lang]), 3000);
      playOwlSpeechSound('celebrate');
    }
  }, [showSpeech, lang]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { speech, triggerByMood, showSpeech };
}
