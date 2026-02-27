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
import FloatingParticles from "@/components/FloatingParticles";
import Interactive3DMascot from "@/components/Interactive3DMascot";
import { ArrowRight, RotateCcw, Timer, Layers, Sparkles } from "lucide-react";
import BackToLevels from "@/components/BackToLevels";
import CinematicBackground from "@/components/CinematicBackground";
import GameEntrance from "@/components/GameEntrance";
import { useAgeAdaptive } from "@/hooks/useAgeAdaptive";

interface MemoryCard {
  id: string;
  content: string;
  type: "word" | "emoji";
  matchId: string;
}

const categoryGradients: Record<string, string> = {
  grass: "from-grass to-grass/70", candy: "from-candy to-candy/70", sky: "from-sky to-sky/70",
  sunshine: "from-primary to-sunshine", lavender: "from-lavender to-lavender/70",
};

const MemoryGame = () => {
  const [searchParams] = useSearchParams();
  const stageId = searchParams.get("stage");
  const { t, lang, dir } = useLanguage();
  const adaptive = useAgeAdaptive();
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
  const [owlMood, setOwlMood] = useState<"idle" | "celebrate" | "sad" | "surprised">("idle");

  const startGame = useCallback((catIndex: number) => {
    playClickSound();
    setSelectedCategory(catIndex);
    const allCatWords = [...wordCategories[catIndex].words];
    const pairCount = adaptive.memoryPairs;
    const filtered = allCatWords.filter(w => w.english.length <= adaptive.maxWordLength);
    const words = (filtered.length >= pairCount ? filtered : allCatWords).sort(() => Math.random() - 0.5).slice(0, pairCount);
    const gameCards: MemoryCard[] = [];
    words.forEach((w) => {
      gameCards.push({ id: `word-${w.english}`, content: w.english, type: "word", matchId: w.english });
      gameCards.push({ id: `emoji-${w.english}`, content: w.emoji, type: "emoji", matchId: w.english });
    });
    for (let i = gameCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
    }
    setCards(gameCards); setFlipped([]); setMatched([]); setMoves(0); setGameComplete(false); setLastMatchWord(null); setOwlMood("idle");
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
          setOwlMood("surprised");
          setTimeout(() => { setLastMatchWord(null); setOwlMood("idle"); }, 1500);
          const newMatched = [...matched, newFlipped[0], newFlipped[1]];
          setMatched(newMatched); setFlipped([]); setIsChecking(false);
          if (newMatched.length === cards.length) {
            const currentMoves = moves + 1;
            const stars = currentMoves < 8 ? 3 : currentMoves < 12 ? 2 : 1;
            addQuizScore(stars);
            if (stageId) saveStageProgress(stageId, stars);
            playVictoryFanfare(); setShowConfetti(true); setGameComplete(true);
            setOwlMood("celebrate");
            setXpAmount(stars * 15 + 10);
            setShowXP(true);
            trackGamePlayed("memory", cards.length / 2, 0, stars * 15 + 10);
            updateDailyProgress("memory");
            setTimeout(() => setShowConfetti(false), 100);
          }
        }, 500);
      } else {
        setTimeout(() => {
          playWrongSound();
          setOwlMood("sad");
          setFlipped([]); setIsChecking(false);
          setTimeout(() => setOwlMood("idle"), 1000);
        }, 800);
      }
    }
  }, [flipped, matched, cards, isChecking, moves, stageId]);

  const getStars = () => (moves < 8 ? 3 : moves < 12 ? 2 : 1);

  return (
    <div className="min-h-screen relative" dir={dir}>
      <GameEntrance title={t("quick.match")} emoji="🧩" />
      <CinematicBackground intensity={0.5} />
      <FloatingParticles count={8} />
      <Confetti show={showConfetti} />
      <XPReward amount={xpAmount} show={showXP} gameType="memory" onComplete={() => setShowXP(false)} />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10">
        <BackToLevels />

        {/* Match word toast */}
        <AnimatePresence>
          {lastMatchWord && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 font-display font-bold text-lg px-6 py-2.5 rounded-2xl border border-accent/30 backdrop-blur-md"
              style={{ background: "hsl(var(--accent) / 0.9)", color: "hsl(var(--accent-foreground))", boxShadow: "0 8px 32px hsl(var(--accent) / 0.3)" }}
            >
              ✅ {lastMatchWord}!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero header with owl */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <Interactive3DMascot mood={owlMood} size="sm" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-gradient mb-1">{t("memory.title")}</h1>
          <p className="text-muted-foreground font-body text-sm sm:text-base">{t("memory.subtitle")}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedCategory === null ? (
            /* ═══ Premium Category Selection ═══ */
            <motion.div key="cat-select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {wordCategories.map((cat, index) => (
                <motion.button key={cat.nameEn}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.35 }}
                  whileHover={{ y: -6, scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => startGame(index)}
                  className="card-glass rounded-2xl p-5 text-center group relative overflow-hidden"
                >
                  {/* Hover gradient */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.05), transparent 60%)" }}
                  />
                  <div className={`bg-gradient-to-br ${categoryGradients[cat.color] || "from-primary to-sunshine"} w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <motion.span
                      className="text-3xl sm:text-4xl"
                      whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {cat.emoji}
                    </motion.span>
                  </div>
                  <h3 className="font-display text-base sm:text-lg font-bold relative z-10">{getCategoryName(cat, lang)}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground relative z-10">{cat.nameEn}</p>
                </motion.button>
              ))}
            </motion.div>
          ) : gameComplete ? (
            /* ═══ Premium Results ═══ */
            <motion.div key="complete"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 18 }}
              className="card-glass rounded-3xl p-8 sm:p-10 text-center max-w-md mx-auto relative overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-15 blur-3xl" style={{ background: "var(--gradient-hero)" }} />
              </div>
              <div className="relative z-10">
                <Interactive3DMascot mood="celebrate" size="md" />
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold mb-4 text-gradient">{t("memory.congrats")}</h2>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }} className="mb-5">
                  <StarRating earned={getStars()} total={3} size={40} />
                </motion.div>
                <div className="flex justify-center gap-3 mb-5">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
                    className="bg-muted/40 border border-border rounded-xl px-4 py-2.5 flex items-center gap-2 backdrop-blur-sm">
                    <Timer className="w-4 h-4 text-muted-foreground" />
                    <span className="font-display font-bold text-lg">{moves}</span>
                    <span className="text-xs text-muted-foreground">{t("memory.moves")}</span>
                  </motion.div>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}
                    className="bg-accent/10 border border-accent/25 rounded-xl px-4 py-2.5 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-accent" />
                    <span className="font-display font-bold text-lg">{cards.length / 2}</span>
                    <span className="text-xs text-muted-foreground">{t("memory.pairs")}</span>
                  </motion.div>
                </div>
                <p className="text-muted-foreground font-body mb-7">
                  {moves < 8 ? t("memory.perfectMemory") : moves < 12 ? t("memory.veryGood") : t("memory.keepPracticing")}
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                    onClick={() => startGame(selectedCategory)}
                    className="btn-kid gradient-primary text-primary-foreground px-6 py-3 inline-flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />{t("memory.playAgain")}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { setSelectedCategory(null); setGameComplete(false); }}
                    className="btn-glow px-6 py-3 inline-flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />{t("memory.otherCategory")}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ═══ Premium Game Board ═══ */
            <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Game stats bar */}
              <div className="card-glass rounded-2xl p-3 mb-5 flex items-center justify-between">
                <motion.button onClick={() => setSelectedCategory(null)}
                  className="flex items-center gap-2 font-display font-semibold text-sm text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-lg border border-primary/15"
                  style={{ background: "hsl(var(--primary) / 0.06)" }}
                  whileHover={{ x: dir === "rtl" ? -3 : 3 }}>
                  <ArrowRight className={`w-3.5 h-3.5 ${dir === "rtl" ? "" : "rotate-180"}`} />{t("memory.back")}
                </motion.button>
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 font-display font-semibold text-sm bg-muted/40 px-3 py-1.5 rounded-full border border-border">
                    <Timer className="w-3.5 h-3.5 text-muted-foreground" />
                    {moves}
                  </div>
                  <div className="flex items-center gap-1.5 font-display font-semibold text-sm px-3 py-1.5 rounded-full border border-accent/20"
                    style={{ background: "hsl(var(--accent) / 0.1)" }}>
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    {matched.length / 2}/{cards.length / 2}
                  </div>
                </div>
              </div>

              {/* Cinematic progress mini bar */}
              <div className="h-2 rounded-full bg-muted/50 overflow-hidden mb-5 border border-border backdrop-blur-sm">
                <motion.div
                  className="h-full rounded-full relative overflow-hidden bg-accent"
                  animate={{ width: `${(matched.length / cards.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 animate-shimmer" />
                </motion.div>
              </div>
              
              {/* Premium memory card grid */}
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3 max-w-2xl mx-auto">
                {cards.map((card, i) => {
                  const isFlipped = flipped.includes(card.id);
                  const isMatched = matched.includes(card.id);
                  const isRevealed = isFlipped || isMatched;
                  
                  return (
                    <motion.div
                      key={card.id}
                      className="aspect-square perspective-1000"
                      initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.4, type: "spring" }}
                    >
                      <motion.button
                        onClick={() => handleCardClick(card.id)}
                        className="w-full h-full relative"
                        style={{ transformStyle: "preserve-3d" }}
                        animate={{ rotateY: isRevealed ? 0 : 180 }}
                        transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                        whileHover={!isRevealed ? { scale: 1.06, y: -4 } : {}}
                        whileTap={!isRevealed ? { scale: 0.95 } : {}}
                        disabled={isMatched}
                      >
                        {/* Front face */}
                        <div className={`absolute inset-0 rounded-2xl flex flex-col items-center justify-center font-display font-bold text-lg backface-hidden border-2 transition-all duration-300 ${
                          isMatched
                            ? "border-accent/40"
                            : "bg-card border-border/60"
                        }`}
                          style={isMatched ? {
                            background: "hsl(var(--accent) / 0.1)",
                            boxShadow: "0 0 24px hsl(var(--accent) / 0.12), var(--shadow-card)"
                          } : { boxShadow: "var(--shadow-card)" }}
                        >
                          {card.type === "emoji" ? (
                            <span className="text-3xl sm:text-4xl md:text-5xl">{card.content}</span>
                          ) : (
                            <span className="text-foreground text-sm sm:text-base md:text-xl px-2">{card.content}</span>
                          )}
                          {isMatched && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }} className="absolute top-1.5 start-1.5 text-sm">⭐</motion.span>
                          )}
                        </div>
                        
                        {/* Back face — premium gradient */}
                        <div
                          className="absolute inset-0 rounded-2xl flex items-center justify-center backface-hidden border-2 border-primary/25 cursor-pointer overflow-hidden"
                          style={{ transform: "rotateY(180deg)", background: "var(--gradient-hero)", boxShadow: "var(--shadow-card)" }}
                        >
                          <div className="absolute inset-0 animate-shimmer opacity-30" />
                          <span className="text-2xl sm:text-3xl drop-shadow-lg" style={{ color: "hsl(var(--primary-foreground))" }}>❓</span>
                        </div>
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
