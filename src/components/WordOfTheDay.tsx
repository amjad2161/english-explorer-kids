import { useMemo } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { wordCategories } from "@/data/learningData";

const WordOfTheDay = () => {
  const { lang, dir } = useLanguage();
  const t = (texts: Record<string, string>) => texts[lang] || texts.en;

  const word = useMemo(() => {
    // Deterministic pick based on date
    const today = new Date().toISOString().slice(0, 10);
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = ((hash << 5) - hash) + today.charCodeAt(i);
      hash |= 0;
    }
    const allWords = wordCategories.flatMap(c => c.words);
    return allWords[Math.abs(hash) % allWords.length];
  }, []);

  const speakWord = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word.english);
    u.lang = "en-US";
    u.rate = 0.75;
    u.pitch = 1.3;
    window.speechSynthesis.speak(u);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="card-glass rounded-2xl p-4 cursor-pointer"
      onClick={speakWord}
      dir={dir}
    >
      <div className="flex items-center gap-3">
        <motion.span
          className="text-4xl"
          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {word.emoji}
        </motion.span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground font-display font-semibold mb-0.5">
            {t({ he: "🌟 מילה של היום", ar: "🌟 كلمة اليوم", en: "🌟 Word of the Day" })}
          </p>
          <p className="font-display font-bold text-lg leading-tight">{word.english}</p>
          <p className="text-sm text-muted-foreground font-body">
            {lang === "he" ? word.hebrew : lang === "ar" ? word.arabic : word.hebrew}
          </p>
        </div>
        <motion.div
          className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
          whileTap={{ scale: 0.85 }}
        >
          🔊
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WordOfTheDay;
