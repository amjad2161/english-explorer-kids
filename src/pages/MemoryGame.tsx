import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { wordCategories, getCategoryName } from "@/data/learningData";
import { playCorrectSound, playWrongSound, playClickSound, playStarSound, playVictoryFanfare, speakEnglish, playFlipSound, playMatchSound } from "@/lib/sounds";
import { addQuizScore } from "@/lib/progress";
import { saveStageProgress } from "@/lib/levels";
import { trackGamePlayed } from "@/lib/statsTracker";
import { updateDailyProgress } from "@/lib/xp";
import StarRating from "@/components/StarRating";
import Confetti from "@/components/Confetti";
import XPReward from "@/components/XPReward";
import { ArrowRight, RotateCcw, Timer, Layers } from "lucide-react";
import BackToLevels from "@/components/BackToLevels";

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
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);
  const [lastMatchWord, setLastMatchWord] = useState<string | null>(null);

  const startGame = useCallback((catIndex: number) => {
    playClickSound();
    setSelectedCategory(catIndex);
    const allCatWords = [...wordCategories[catIndex].words];
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
    setCards(gameCards); setFlipped([]); setMatched([]); setMoves(0); setGameComplete(false); setLastMatchWord(null);
  }, []);

  const handleCardClick = useCallback((cardId: string) => {
    if (isChecking || flipped.includes(cardId) || matched.includes(cardId)) return;
    playFlipSound();
    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);
    
    if (newFlipped.length === 2) {
      setIsChecking(true);
      setMoves((m) => m + 1);
      const card1 = cards.find((c) => c.id === newFlipped[0])!;
      const card2 = cards.find((c) => c.id === newFlipped[1])!;
      if (card1.matchId === card2.matchId && card1.type !== card2.type) {
        setTimeout(() => {
          playMatchSound();
          speakEnglish(card1.matchId);
          setLastMatchWord(card1.matchId);
          setTimeout(() => setLastMatchWord(null), 1500);
          const newMatched = [...matched, newFlipped[0], newFlipped[1]];
          setMatched(newMatched); setFlipped([]); setIsChecking(false);
          if (newMatched.length === cards.length) {
            const currentMoves = moves + 1;
            const stars = currentMoves < 8 ? 3 : currentMoves < 12 ? 2 : 1;
            addQuizScore(stars);
            if (stageId) saveStageProgress(stageId, stars);
            playVictoryFanfare(); setShowConfetti(true); setGameComplete(true);
            setXpAmount(stars * 15 + 10);
            setShowXP(true);
            trackGamePlayed("memory", cards.length / 2, 0, stars * 15 + 10);
            updateDailyProgress("memory");
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
    grass: "from-grass to-grass/70", candy: "from-candy to-candy/70", sky: "from-sky to-sky/70",
    sunshine: "from-primary to-sunshine", lavender: "from-lavender to-lavender/70",
  };

  return (
    <div className="min-h-screen relative" dir={dir}>
      <Confetti show={showConfetti} />
      <XPReward amount={xpAmount} show={showXP} gameType="memory" onComplete={() => setShowXP(false)} />
      
      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">
        <BackToLevels />

        {/* Match word announcement */}
        <AnimatePresence>
          {lastMatchWord && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-accent/90 text-accent-foreground font-display font-bold text-lg px-6 py-2 rounded-full shadow-xl backdrop-blur-sm"
            >
              ✅ {lastMatchWord}!
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <span className="text-5xl mb-3 block">🧩</span>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">{t("memory.title")}</h1>
          <p className="text-muted-foreground font-body">{t("memory.subtitle")}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedCategory === null ? (
            <motion.div key="cat-select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {wordCategories.map((cat, index) => (
                <motion.button key={cat.nameEn}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => startGame(index)}
                  className="card-kid text-center group"
                >
                  <div className={`bg-gradient-to-br ${categoryGradients[cat.color] || "from-primary to-sunshine"} w-20 h-20 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg`}>
                    <span className="text-4xl">{cat.emoji}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold">{getCategoryName(cat, lang)}</h3>
                  <p className="text-sm text-muted-foreground">{cat.nameEn}</p>
                </motion.button>
              ))}
            </motion.div>
          ) : gameComplete ? (
            <motion.div key="complete"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="card-kid text-center max-w-md mx-auto"
            >
              <span className="text-7xl block mb-4">🏆</span>
              <h2 className="font-display text-3xl font-bold mb-3 text-gradient">{t("memory.congrats")}</h2>
              <div className="mb-4"><StarRating earned={getStars()} total={3} size={36} /></div>
              <div className="flex justify-center gap-4 mb-4">
                <div className="bg-muted/50 rounded-xl px-4 py-2 flex items-center gap-2">
                  <Timer className="w-4 h-4 text-muted-foreground" />
                  <span className="font-display font-bold">{moves}</span>
                </div>
                <div className="bg-accent/10 rounded-xl px-4 py-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-accent" />
                  <span className="font-display font-bold">{cards.length / 2}</span>
                </div>
              </div>
              <p className="text-muted-foreground font-body mb-6">
                {moves < 8 ? t("memory.perfectMemory") : moves < 12 ? t("memory.veryGood") : t("memory.keepPracticing")}
              </p>
              <div className="flex gap-3 justify-center">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => startGame(selectedCategory)}
                  className="btn-kid gradient-primary text-primary-foreground flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />{t("memory.playAgain")}
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setSelectedCategory(null); setGameComplete(false); }}
                  className="btn-kid bg-muted text-foreground flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />{t("memory.otherCategory")}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <motion.button onClick={() => setSelectedCategory(null)}
                  className="flex items-center gap-2 font-display font-semibold text-primary hover:text-primary/80 transition-colors"
                  whileHover={{ x: dir === "rtl" ? -3 : 3 }}>
                  <ArrowRight className="w-4 h-4" />{t("memory.back")}
                </motion.button>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 font-display font-semibold text-sm bg-muted/60 px-3 py-1.5 rounded-full">
                    <Timer className="w-3.5 h-3.5 text-muted-foreground" />
                    {moves} {t("memory.moves")}
                  </div>
                  <div className="flex items-center gap-1.5 font-display font-semibold text-sm bg-accent/15 px-3 py-1.5 rounded-full">
                    <Layers className="w-3.5 h-3.5 text-accent" />
                    {matched.length / 2}/{cards.length / 2} {t("memory.pairs")}
                  </div>
                </div>
              </div>
              
              {/* Memory card grid */}
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
                {cards.map((card) => {
                  const isFlipped = flipped.includes(card.id);
                  const isMatched = matched.includes(card.id);
                  const isRevealed = isFlipped || isMatched;
                  
                  return (
                    <div key={card.id} className="aspect-square perspective-1000">
                      <motion.button
                        onClick={() => handleCardClick(card.id)}
                        className="w-full h-full relative"
                        style={{ transformStyle: "preserve-3d" }}
                        animate={{ rotateY: isRevealed ? 0 : 180 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        whileHover={!isRevealed ? { scale: 1.04 } : {}}
                        whileTap={!isRevealed ? { scale: 0.96 } : {}}
                        disabled={isMatched}
                      >
                        {/* Front face */}
                        <div className={`absolute inset-0 rounded-2xl flex flex-col items-center justify-center font-display font-bold text-lg backface-hidden border-2 ${
                          isMatched
                            ? "bg-accent/15 border-accent/40 shadow-lg"
                            : "bg-card border-primary/30 shadow-md"
                        }`}>
                          {card.type === "emoji" ? (
                            <span className="text-4xl md:text-5xl">{card.content}</span>
                          ) : (
                            <span className="text-foreground text-base md:text-xl px-2">{card.content}</span>
                          )}
                          {isMatched && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1.5 start-1.5 text-sm">⭐</motion.span>
                          )}
                        </div>
                        
                        {/* Back face */}
                        <div
                          className="absolute inset-0 rounded-2xl flex items-center justify-center backface-hidden bg-gradient-to-br from-primary to-primary/80 border-2 border-primary/30 shadow-lg cursor-pointer"
                          style={{ transform: "rotateY(180deg)" }}
                        >
                          <span className="text-3xl text-white/90">❓</span>
                        </div>
                      </motion.button>
                    </div>
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
