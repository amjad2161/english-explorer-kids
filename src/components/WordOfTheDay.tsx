import { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { wordCategories } from "@/data/learningData";
import { speakEnglish, playChalkWriteSound } from "@/lib/sounds";

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
    speakEnglish(word.english);
  };

  const hasPlayed = useRef(false);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="relative rounded-2xl p-4 cursor-pointer overflow-hidden bg-card/90 backdrop-blur-sm border border-primary/15 shadow-md"
      onClick={speakWord}
      dir={dir}
      onViewportEnter={() => {
        if (!hasPlayed.current) {
          hasPlayed.current = true;
          playChalkWriteSound(600);
        }
      }}
    >
      {/* Animated gradient border glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-sunshine/5 to-accent/8 pointer-events-none" />
      {/* Shimmer sweep */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none"
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
      />

      <div className="flex items-center gap-3 relative z-10">
        <motion.span
          className="text-4xl drop-shadow-sm"
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
          className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 shadow-sm"
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.1 }}
        >
          🔊
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WordOfTheDay;
