import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { alphabet, getLocal, getWordLocal } from "@/data/learningData";
import { speakEnglish, playClickSound, playStarSound } from "@/lib/sounds";
import { addCompletedLetter } from "@/lib/progress";
import { saveStageProgress } from "@/lib/levels";
import StarRating from "@/components/StarRating";
import Confetti from "@/components/Confetti";
import { ChevronRight, ChevronLeft, Volume2 } from "lucide-react";

const letterColors = [
  "bg-sky-light text-sky",
  "bg-candy-light text-candy",
  "bg-grass-light text-grass",
  "bg-lavender-light text-lavender",
  "bg-sunshine-light text-sunshine",
];

const AlphabetPage = () => {
  const [searchParams] = useSearchParams();
  const stageId = searchParams.get("stage");
  const { t, lang } = useLanguage();
  const [selectedLetter, setSelectedLetter] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [learnedLetters, setLearnedLetters] = useState<string[]>([]);

  const handleLetterClick = (index: number) => {
    playClickSound();
    setSelectedLetter(index);
    setTimeout(() => speakEnglish(alphabet[index].letter), 300);
  };

  const handleLearnLetter = () => {
    if (selectedLetter === null) return;
    const letter = alphabet[selectedLetter];
    speakEnglish(`${letter.letter} is for ${letter.word}`);
    if (!learnedLetters.includes(letter.letter)) {
      const newLearned = [...learnedLetters, letter.letter];
      setLearnedLetters(newLearned);
      addCompletedLetter(letter.letter);
      playStarSound();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
      if (stageId) saveStageProgress(stageId, Math.min(newLearned.length, 5));
    }
  };

  const navigateLetter = (direction: number) => {
    if (selectedLetter === null) return;
    const next = selectedLetter + direction;
    if (next >= 0 && next < alphabet.length) handleLetterClick(next);
  };

  return (
    <div className="min-h-screen" dir="rtl">
      <Confetti show={showConfetti} />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">{t("alphabet.title")}</h1>
          <p className="text-muted-foreground font-body">{t("alphabet.subtitle")}</p>
          <div className="mt-3"><StarRating earned={learnedLetters.length} total={26} size={18} /></div>
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedLetter !== null && (
            <motion.div key={selectedLetter} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }} transition={{ type: "spring", stiffness: 300 }}
              className="card-kid max-w-md mx-auto mb-8 text-center">
              <div className="flex items-center justify-between mb-4">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => navigateLetter(1)} className="p-2 rounded-full bg-muted"
                  disabled={selectedLetter >= alphabet.length - 1}>
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
                <motion.div className="text-8xl font-display font-bold text-gradient"
                  animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5 }}>
                  {alphabet[selectedLetter].letter}
                </motion.div>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => navigateLetter(-1)} className="p-2 rounded-full bg-muted"
                  disabled={selectedLetter <= 0}>
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
              </div>
              <p className="text-xl font-display text-muted-foreground mb-2">
                {getLocal(alphabet[selectedLetter], lang)}
              </p>
              <div className="bg-muted rounded-2xl p-4 mb-4">
                <span className="text-5xl mb-2 block">{alphabet[selectedLetter].emoji}</span>
                <p className="font-display text-2xl font-bold">{alphabet[selectedLetter].word}</p>
                <p className="text-muted-foreground font-body">{getWordLocal(alphabet[selectedLetter], lang)}</p>
              </div>
              <div className="flex gap-3 justify-center">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => speakEnglish(alphabet[selectedLetter].letter)}
                  className="btn-kid gradient-sky text-secondary-foreground flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />{t("alphabet.listenLetter")}
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleLearnLetter}
                  className="btn-kid gradient-primary text-primary-foreground flex items-center gap-2">
                  {t("alphabet.learned")}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-3">
          {alphabet.map((item, index) => {
            const isLearned = learnedLetters.includes(item.letter);
            const isSelected = selectedLetter === index;
            const colorClass = letterColors[index % letterColors.length];
            return (
              <motion.button key={item.letter}
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.03, type: "spring" }}
                whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                onClick={() => handleLetterClick(index)}
                className={`letter-card aspect-square text-2xl font-bold relative ${colorClass} ${isSelected ? "ring-4 ring-primary ring-offset-2" : ""}`}>
                {item.letter}
                {isLearned && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 text-sm">⭐</motion.span>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default AlphabetPage;
