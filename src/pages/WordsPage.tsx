import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { wordCategories, WordCard, getCategoryName, getWordTranslation } from "@/data/learningData";
import { speakEnglish, playClickSound, playStarSound } from "@/lib/sounds";
import { addCompletedWord } from "@/lib/progress";
import { saveStageProgress, levels } from "@/lib/levels";
import Confetti from "@/components/Confetti";
import ClassroomBackground from "@/components/ClassroomBackground";
import FloatingParticles from "@/components/FloatingParticles";
import XPReward from "@/components/XPReward";
import { Volume2, ArrowRight, BookOpen, Sparkles } from "lucide-react";
import BackToLevels from "@/components/BackToLevels";
import Interactive3DMascot from "@/components/Interactive3DMascot";

const categoryGradients: Record<string, string> = {
  grass: "from-grass to-grass/70", candy: "from-candy to-candy/70", sky: "from-sky to-sky/70",
  sunshine: "from-primary to-sunshine", lavender: "from-lavender to-lavender/70",
};
const categoryBgs: Record<string, string> = {
  grass: "bg-grass/8", candy: "bg-candy/8", sky: "bg-sky/8",
  sunshine: "bg-sunshine/8", lavender: "bg-lavender/8",
};
const categoryCardOverlays: Record<string, string> = {
  grass: "from-grass/5", candy: "from-candy/5", sky: "from-sky/5",
  sunshine: "from-sunshine/5", lavender: "from-lavender/5",
};

const WordsPage = () => {
  const [searchParams] = useSearchParams();
  const stageId = searchParams.get("stage");
  const { t, lang, dir } = useLanguage();

  const stageConfig = useMemo(() => {
    if (!stageId) return null;
    for (const level of levels) {
      for (const stage of level.stages) {
        if (stage.id === stageId) return stage;
      }
    }
    return null;
  }, [stageId]);

  const filteredCategories = useMemo(() => {
    if (stageConfig?.categoryIndices) {
      return stageConfig.categoryIndices.map(i => ({ index: i, cat: wordCategories[i] })).filter(x => x.cat);
    }
    return wordCategories.map((cat, index) => ({ index, cat }));
  }, [stageConfig]);

  const autoSelected = filteredCategories.length === 1;
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const activeCategory = autoSelected ? filteredCategories[0].index : selectedCategory;

  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [learnedWords, setLearnedWords] = useState<Set<string>>(() => {
    try {
      const p = JSON.parse(localStorage.getItem("english-learning-progress") || "{}");
      return new Set(p.completedWords || []);
    } catch { return new Set(); }
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);

  const handleCardFlip = (word: WordCard) => {
    playClickSound();
    const key = word.english;
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); speakEnglish(word.english); }
      return next;
    });
  };

  const handleLearnWord = (word: WordCard) => {
    if (!learnedWords.has(word.english)) {
      const newLearned = new Set(learnedWords).add(word.english);
      setLearnedWords(newLearned);
      addCompletedWord(word.english);
      playStarSound();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
      setXpAmount(10);
      setShowXP(true);
      if (stageId) saveStageProgress(stageId, Math.min(newLearned.size, 4));
    }
  };

  return (
    <div className="min-h-screen relative" dir={dir}>
      <ClassroomBackground />
      <FloatingParticles count={8} />
      <Confetti show={showConfetti} />
      <XPReward amount={xpAmount} show={showXP} gameType="words" onComplete={() => setShowXP(false)} />
      
      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">
        <BackToLevels />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <Interactive3DMascot mood="idle" size="sm" />
          <span className="text-5xl mb-3 block">📝</span>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">{t("words.title")}</h1>
          <p className="text-muted-foreground font-body">{t("words.subtitle")}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeCategory === null ? (
            <motion.div key="categories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredCategories.map(({ index, cat }, i) => {
                const catLearned = cat.words.filter(w => learnedWords.has(w.english)).length;
                return (
                  <motion.button key={cat.nameEn}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    whileHover={{ y: -6, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { playClickSound(); setSelectedCategory(index); }}
                    className="card-kid text-center group relative overflow-hidden"
                  >
                    {/* Premium gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${categoryCardOverlays[cat.color] || "from-primary/5"} to-transparent pointer-events-none opacity-60`} />
                    <div className={`bg-gradient-to-br ${categoryGradients[cat.color]} w-20 h-20 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg`}>
                      <span className="text-4xl">{cat.emoji}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold">{getCategoryName(cat, lang)}</h3>
                    <p className="text-sm text-muted-foreground">{cat.nameEn}</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <BookOpen className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{catLearned}/{cat.words.length}</p>
                    </div>
                    {catLearned > 0 && (
                      <div className="mt-2 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-accent"
                          initial={{ width: 0 }}
                          animate={{ width: `${(catLearned / cat.words.length) * 100}%` }}
                          transition={{ duration: 0.6, delay: i * 0.05 + 0.2 }}
                        />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div key="words" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {!autoSelected && (
                <motion.button onClick={() => { setSelectedCategory(null); setFlippedCards(new Set()); }}
                  className="flex items-center gap-2 mb-6 font-display font-semibold text-primary hover:text-primary/80 transition-colors"
                  whileHover={{ x: dir === "rtl" ? -3 : 3 }}>
                  <ArrowRight className="w-4 h-4" />{t("words.backToCategories")}
                </motion.button>
              )}
              <div className="text-center mb-6">
                <span className="text-5xl mb-2 block">{wordCategories[activeCategory].emoji}</span>
                <h2 className="font-display text-2xl font-bold">{getCategoryName(wordCategories[activeCategory], lang)}</h2>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-display text-muted-foreground">
                    {wordCategories[activeCategory].words.filter(w => learnedWords.has(w.english)).length}/{wordCategories[activeCategory].words.length}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {wordCategories[activeCategory].words.map((word, index) => {
                  const isFlipped = flippedCards.has(word.english);
                  const isLearned = learnedWords.has(word.english);
                  const colorClass = categoryBgs[wordCategories[activeCategory].color];
                  return (
                    <motion.div key={word.english}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.3 }}>
                      <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => handleCardFlip(word)}
                        className={`card-kid cursor-pointer text-center relative overflow-hidden ${colorClass} ${
                          isLearned ? "border-2 border-accent/30 shadow-md shadow-accent/10" : ""
                        }`}>
                        {/* Premium gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
                        {isLearned && (
                          <motion.span
                            className="absolute top-2 start-2 text-lg"
                            animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            ⭐
                          </motion.span>
                        )}
                        <span className="text-5xl mb-3 block">{word.emoji}</span>
                        <AnimatePresence mode="wait">
                          {isFlipped ? (
                            <motion.div key="english" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                              <p className="font-display text-2xl font-bold mb-1">{word.english}</p>
                              <p className="text-sm text-muted-foreground">{getWordTranslation(word, lang)}</p>
                              <div className="flex gap-2 mt-3 justify-center">
                                <motion.button whileTap={{ scale: 0.9 }}
                                  onClick={(e) => { e.stopPropagation(); speakEnglish(word.english); }}
                                  className="btn-kid gradient-sky text-secondary-foreground text-xs px-3 py-2 flex items-center gap-1">
                                  <Volume2 className="w-3 h-3" />{t("words.listen")}
                                </motion.button>
                                <motion.button whileTap={{ scale: 0.9 }}
                                  onClick={(e) => { e.stopPropagation(); handleLearnWord(word); }}
                                  className="btn-kid gradient-primary text-primary-foreground text-xs px-3 py-2">
                                  {t("words.iLearned")}
                                </motion.button>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div key="native" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                              <p className="font-display text-xl font-bold">{getWordTranslation(word, lang)}</p>
                              <p className="text-xs text-muted-foreground mt-1">{t("words.tapToReveal")}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WordsPage;
