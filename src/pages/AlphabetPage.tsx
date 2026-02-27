import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { alphabet, getLocal, getWordLocal } from "@/data/learningData";
import { speakEnglish, playClickSound, playStarSound, playLetterPopSound } from "@/lib/sounds";
import { addCompletedLetter } from "@/lib/progress";
import { saveStageProgress } from "@/lib/levels";
import StarRating from "@/components/StarRating";
import Confetti from "@/components/Confetti";
import BackToLevels from "@/components/BackToLevels";
import PhoneticGuide from "@/components/PhoneticGuide";
import Card3D from "@/components/Card3D";
import XPReward from "@/components/XPReward";
import Interactive3DMascot from "@/components/Interactive3DMascot";
import { ChevronRight, ChevronLeft, Volume2, BookOpen, Sparkles } from "lucide-react";

const letterGradients = [
  { bg: "from-sky to-sky/70", light: "bg-sky/10", text: "text-sky" },
  { bg: "from-candy to-candy/70", light: "bg-candy/10", text: "text-candy" },
  { bg: "from-grass to-grass/70", light: "bg-grass/10", text: "text-grass" },
  { bg: "from-lavender to-lavender/70", light: "bg-lavender/10", text: "text-lavender" },
  { bg: "from-primary to-sunshine", light: "bg-sunshine/10", text: "text-primary" },
];

const AlphabetPage = () => {
  const [searchParams] = useSearchParams();
  const stageId = searchParams.get("stage");
  const { t, lang, dir } = useLanguage();
  const [selectedLetter, setSelectedLetter] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);
  const [showPhonetics, setShowPhonetics] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);
  const [learnedLetters, setLearnedLetters] = useState<string[]>(() => {
    try {
      const p = JSON.parse(localStorage.getItem("english-learning-progress") || "{}");
      return p.completedLetters || [];
    } catch { return []; }
  });

  const handleLetterClick = (index: number) => {
    playLetterPopSound(index % 12);
    setSelectedLetter(index);
    setShowPhonetics(false);
    setTimeout(() => speakEnglish(alphabet[index].letter), 300);
    detailRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
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
      setXpAmount(15);
      setShowXP(true);
      if (stageId) saveStageProgress(stageId, Math.min(newLearned.length, 5));
    }
  };

  const navigateLetter = (direction: number) => {
    if (selectedLetter === null) return;
    const next = selectedLetter + direction;
    if (next >= 0 && next < alphabet.length) handleLetterClick(next);
  };

  const colorSet = selectedLetter !== null ? letterGradients[selectedLetter % letterGradients.length] : letterGradients[0];

  return (
    <div className="min-h-screen relative" dir={dir}>
      <Confetti show={showConfetti} />
      <XPReward amount={xpAmount} show={showXP} onComplete={() => setShowXP(false)} />
      
      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">
        <BackToLevels />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <Interactive3DMascot mood="idle" size="sm" />
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="font-display font-bold text-sm text-primary">
              {learnedLetters.length}/26
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">
            {t("alphabet.title")}
          </h1>
          <p className="text-muted-foreground font-body mb-3">{t("alphabet.subtitle")}</p>
          
          <div className="flex justify-center">
            <StarRating earned={learnedLetters.length} total={26} size={18} />
          </div>
        </motion.div>

        {/* ── SELECTED LETTER DETAIL ── */}
        <AnimatePresence mode="wait">
          {selectedLetter !== null && (
            <motion.div
              ref={detailRef}
              key={selectedLetter}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="max-w-md mx-auto mb-8"
            >
              <Card3D intensity={8}>
                <div className="card-kid text-center">
                  {/* Navigation arrows + letter */}
                  <div className="flex items-center justify-between mb-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => navigateLetter(dir === "rtl" ? 1 : -1)}
                      className="p-2.5 rounded-xl bg-muted/60 hover:bg-muted transition-colors disabled:opacity-30"
                      disabled={selectedLetter <= 0}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                    
                    <div className="relative">
                      <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${colorSet.bg} flex items-center justify-center shadow-xl relative`}>
                        <motion.span
                          className="text-7xl font-display font-extrabold text-white drop-shadow-lg"
                          key={selectedLetter}
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {alphabet[selectedLetter].letter}
                        </motion.span>
                        
                        {learnedLetters.includes(alphabet[selectedLetter].letter) && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 text-2xl">⭐</motion.div>
                        )}
                      </div>
                      
                      <p className="text-xl font-display font-bold text-muted-foreground mt-2">
                        {alphabet[selectedLetter].letter.toLowerCase()} • {getLocal(alphabet[selectedLetter], lang)}
                      </p>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => navigateLetter(dir === "rtl" ? -1 : 1)}
                      className="p-2.5 rounded-xl bg-muted/60 hover:bg-muted transition-colors disabled:opacity-30"
                      disabled={selectedLetter >= alphabet.length - 1}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Word example */}
                  <motion.div
                    className={`${colorSet.light} rounded-2xl p-5 mb-4`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    <span className="text-6xl mb-2 block">{alphabet[selectedLetter].emoji}</span>
                    <p className="font-display text-2xl font-bold mb-0.5">
                      <span className={colorSet.text}>{alphabet[selectedLetter].letter}</span>
                      {alphabet[selectedLetter].word.slice(1)}
                    </p>
                    <p className="text-muted-foreground font-body text-sm">
                      {getWordLocal(alphabet[selectedLetter], lang)}
                    </p>
                  </motion.div>

                  {/* Phonetics toggle */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowPhonetics(!showPhonetics)}
                    className="w-full flex items-center justify-center gap-2 text-sm font-display font-semibold text-primary/70 hover:text-primary mb-3 py-2 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    {lang === "he" ? "מדריך הגייה" : lang === "ar" ? "دليل النطق" : "Pronunciation Guide"}
                    <motion.span animate={{ rotate: showPhonetics ? 180 : 0 }} className="text-xs">▼</motion.span>
                  </motion.button>

                  <AnimatePresence>
                    {showPhonetics && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-4"
                      >
                        <PhoneticGuide letter={alphabet[selectedLetter].letter} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action buttons */}
                  <div className="flex gap-3 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => speakEnglish(alphabet[selectedLetter].letter)}
                      className="btn-kid gradient-sky text-secondary-foreground flex items-center gap-2"
                    >
                      <Volume2 className="w-4 h-4" />
                      {t("alphabet.listenLetter")}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleLearnLetter}
                      className="btn-kid gradient-primary text-primary-foreground flex items-center gap-2"
                    >
                      {t("alphabet.learned")}
                    </motion.button>
                  </div>
                </div>
              </Card3D>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── LETTER GRID ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-3"
        >
          {alphabet.map((item, index) => {
            const isLearned = learnedLetters.includes(item.letter);
            const isSelected = selectedLetter === index;
            const color = letterGradients[index % letterGradients.length];
            
            return (
              <motion.button
                key={item.letter}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02, duration: 0.3 }}
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleLetterClick(index)}
                className={`letter-card aspect-square text-2xl font-bold relative overflow-hidden ${color.light} ${color.text} ${
                  isSelected ? "ring-4 ring-primary ring-offset-2 shadow-xl" : ""
                }`}
              >
                <span className="relative z-10">{item.letter}</span>
                
                {isLearned && (
                  <span className="absolute -top-1 -right-1 text-sm z-20">⭐</span>
                )}
                
                <span className="absolute bottom-0.5 right-1 text-[10px] opacity-50">
                  {item.emoji}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default AlphabetPage;
