import { useState, useEffect, useRef, useCallback } from "react";
import { playOwlSpeechSound } from "@/lib/sounds";

/**
 * Hebrew encouragement lines by mood context.
 * Returns a speech bubble string that auto-clears after a delay.
 */

const LINES: Record<string, string[]> = {
  correct: [
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
  combo: [
    "רצף מטורף! 🔥🔥",
    "בלתי ניתן לעצירה! 💥",
    "סופר סטאר! ⭐⭐",
    "אין עליך! 🌈",
    "קומבו ענק! 🎆",
  ],
  wrong: [
    "לא נורא, ננסה שוב! 💙",
    "קרוב! בפעם הבאה 😊",
    "טעויות זה בסדר! 📖",
    "אל תוותר! 💪",
    "ממשיכים קדימה! 🌟",
    "עוד קצת ותצליח! ✨",
  ],
  celebrate: [
    "סיימת בהצלחה! 🎊",
    "איזה כיף! סיום מושלם! 🥳",
    "גאה בך מאוד! 🏅",
    "אלופי! 🌟🌟🌟",
    "שיעור מוצלח! 🎓",
  ],
  idle: [
    "בוא נלמד! 📚",
    "אני כאן בשבילך! 🦉",
    "מוכנים? 🌟",
    "יאללה! ✨",
  ],
};

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

type OwlMood = "idle" | "celebrate" | "sad" | "surprised";

export function useOwlEncouragement() {
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
        showSpeech(pick(LINES.combo));
        playOwlSpeechSound('combo');
      } else {
        showSpeech(pick(LINES.correct));
        playOwlSpeechSound('correct');
      }
    } else if (mood === "sad") {
      showSpeech(pick(LINES.wrong));
      playOwlSpeechSound('wrong');
    } else if (mood === "celebrate") {
      showSpeech(pick(LINES.celebrate), 3000);
      playOwlSpeechSound('celebrate');
    }
  }, [showSpeech]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { speech, triggerByMood, showSpeech };
}
