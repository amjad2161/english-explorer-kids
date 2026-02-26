import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { wordCategories, getCategoryName } from "@/data/learningData";
import { playCorrectSound, playWrongSound, playClickSound, playStarSound } from "@/lib/sounds";
import { addQuizScore } from "@/lib/progress";
import { saveStageProgress } from "@/lib/levels";
import StarRating from "@/components/StarRating";
import Confetti from "@/components/Confetti";
import { ArrowRight, RotateCcw } from "lucide-react";

interface MemoryCard {
  id: string;
  content: string;
  type: "word" | "emoji";
  matchId: string;
}

const MemoryGame = () => {
  const [searchParams] = useSearchParams();
  const stageId = searchParams.get("stage");
  const { t, lang, dir } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const startGame = useCallback((catIndex: number) => {
    playClickSound();
    setSelectedCategory(catIndex);
    const allCatWords = [...wordCategories[catIndex].words];
    // Shuffle and pick 6 random words from category each time
    const words = allCatWords.sort(() => Math.random() - 0.5).slice(0, 6);
    const gameCards: MemoryCard[] = [];
    words.forEach((w) => {
      gameCards.push({ id: `word-${w.english}`, content: w.english, type: "word", matchId: w.english });
      gameCards.push({ id: `emoji-${w.english}`, content: w.emoji, type: "emoji", matchId: w.english });
    });
    for (let i = gameCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
    }
    setCards(gameCards); setFlipped([]); setMatched([]); setMoves(0); setGameComplete(false);
  }, []);

  const handleCardClick = useCallback((cardId: string) => {
    if (isChecking || flipped.includes(cardId) || matched.includes(cardId)) return;
    playClickSound();
    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setIsChecking(true);
      setMoves((m) => m + 1);
      const card1 = cards.find((c) => c.id === newFlipped[0])!;
      const card2 = cards.find((c) => c.id === newFlipped[1])!;
      if (card1.matchId === card2.matchId && card1.type !== card2.type) {
        setTimeout(() => {
          playCorrectSound();
          const newMatched = [...matched, newFlipped[0], newFlipped[1]];
          setMatched(newMatched); setFlipped([]); setIsChecking(false);
          if (newMatched.length === cards.length) {
            const stars = moves < 8 ? 3 : moves < 12 ? 2 : 1;
            addQuizScore(stars);
            if (stageId) saveStageProgress(stageId, stars);
            playStarSound(); setShowConfetti(true); setGameComplete(true);
            setTimeout(() => setShowConfetti(false), 100);
          }
        }, 500);
      } else {
        setTimeout(() => { playWrongSound(); setFlipped([]); setIsChecking(false); }, 800);
      }
    }
  }, [flipped, matched, cards, isChecking, moves, stageId]);

  const getStars = () => (moves < 8 ? 3 : moves < 12 ? 2 : 1);

  const categoryGradients: Record<string, string> = {
    grass: "gradient-grass", candy: "gradient-candy", sky: "gradient-sky",
    sunshine: "gradient-primary", lavender: "gradient-lavender",
  };

  return (
    <div className="min-h-screen" dir={dir}>
      <Confetti show={showConfetti} />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">{t("memory.title")}</h1>
          <p className="text-muted-foreground font-body">{t("memory.subtitle")}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedCategory === null ? (
            <motion.div key="cat-select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {wordCategories.map((cat, index) => (
                <motion.button key={cat.nameEn}
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.07, type: "spring" }}
                  whileHover={{ y: -6, scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => startGame(index)} className="card-kid text-center">
                  <div className={`${categoryGradients[cat.color] || "gradient-primary"} w-20 h-20 rounded-2xl mx-auto mb-3 flex items-center justify-center`}>
                    <span className="text-4xl">{cat.emoji}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold">{getCategoryName(cat, lang)}</h3>
                  <p className="text-sm text-muted-foreground">{cat.nameEn}</p>
                </motion.button>
              ))}
            </motion.div>
          ) : gameComplete ? (
            <motion.div key="complete" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring" }} className="card-kid text-center max-w-md mx-auto">
              <motion.span className="text-7xl block mb-4" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: 3 }}>🏆</motion.span>
              <h2 className="font-display text-3xl font-bold mb-3">{t("memory.congrats")}</h2>
              <div className="mb-4"><StarRating earned={getStars()} total={3} size={36} /></div>
              <p className="font-display text-xl mb-2">{t("memory.finishedIn")}{moves} {t("memory.movesWord")}</p>
              <p className="text-muted-foreground font-body mb-6">
                {moves < 8 ? t("memory.perfectMemory") : moves < 12 ? t("memory.veryGood") : t("memory.keepPracticing")}
              </p>
              <div className="flex gap-3 justify-center">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => startGame(selectedCategory)}
                  className="btn-kid gradient-primary text-primary-foreground flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />{t("memory.playAgain")}
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { setSelectedCategory(null); setGameComplete(false); }}
                  className="btn-kid bg-muted text-foreground flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />{t("memory.otherCategory")}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="game" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="flex items-center justify-between mb-6">
                <motion.button onClick={() => setSelectedCategory(null)}
                  className="flex items-center gap-2 font-display font-semibold text-primary hover:text-primary/80 transition-colors" whileHover={{ x: 4 }}>
                  <ArrowRight className="w-4 h-4" />{t("memory.back")}
                </motion.button>
                <div className="flex items-center gap-4">
                  <span className="font-display font-semibold text-sm bg-muted px-3 py-1.5 rounded-full">🔄 {moves} {t("memory.moves")}</span>
                  <span className="font-display font-semibold text-sm bg-accent/20 text-accent-foreground px-3 py-1.5 rounded-full">
                    ✅ {matched.length / 2}/{cards.length / 2} {t("memory.pairs")}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
                {cards.map((card) => {
                  const isFlipped = flipped.includes(card.id);
                  const isMatched = matched.includes(card.id);
                  return (
                    <motion.div key={card.id}
                      initial={{ scale: 0, rotateY: 180 }} animate={{ scale: 1, rotateY: 0 }}
                      transition={{ type: "spring", delay: Math.random() * 0.3 }} className="aspect-square">
                      <motion.button onClick={() => handleCardClick(card.id)}
                        className={`w-full h-full rounded-2xl font-display font-bold text-lg transition-all duration-300 relative ${
                          isMatched ? "bg-accent/20 border-2 border-accent"
                          : isFlipped ? "bg-card border-2 border-primary"
                          : "gradient-primary cursor-pointer hover:shadow-lg"
                        }`}
                        whileHover={!isFlipped && !isMatched ? { scale: 1.05 } : {}}
                        whileTap={!isFlipped && !isMatched ? { scale: 0.95 } : {}}
                        disabled={isMatched}>
                        <AnimatePresence mode="wait">
                          {isFlipped || isMatched ? (
                            <motion.div key="front" initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }}
                              exit={{ rotateY: -90, opacity: 0 }} transition={{ duration: 0.2 }}
                              className="flex flex-col items-center justify-center h-full">
                              {card.type === "emoji" ? <span className="text-4xl md:text-5xl">{card.content}</span>
                                : <span className="text-foreground text-base md:text-xl px-1">{card.content}</span>}
                              {isMatched && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1 left-1 text-sm">⭐</motion.span>}
                            </motion.div>
                          ) : (
                            <motion.div key="back" initial={{ rotateY: -90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }}
                              exit={{ rotateY: 90, opacity: 0 }} transition={{ duration: 0.2 }}
                              className="flex items-center justify-center h-full text-primary-foreground">
                              <span className="text-3xl">❓</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
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

export default MemoryGame;
