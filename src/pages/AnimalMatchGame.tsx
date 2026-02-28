import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useLanguage } from "@/lib/i18n";
import { playClickSound, playAnimalSound, playMatchSound, speakEnglish, type AnimalSoundType } from "@/lib/sounds";
import { animalImages } from "@/assets/animals";
import { dispatchCharacterEvent } from "@/lib/characterStore";
import { useRewardsPipeline } from "@/hooks/useRewardsPipeline";
import GameSceneShell from "@/components/GameSceneShell";
import StarRating from "@/components/StarRating";
import { RotateCcw } from "lucide-react";

/* ─── Animal pairs ─── */
const allPairs: { letter: string; animal: string; emoji: string; soundKey: AnimalSoundType }[] = [
  { letter: "A", animal: "Alligator", emoji: "🐊", soundKey: "alligator" },
  { letter: "B", animal: "Bear", emoji: "🐻", soundKey: "bear" },
  { letter: "C", animal: "Cat", emoji: "🐱", soundKey: "cat" },
  { letter: "D", animal: "Dog", emoji: "🐶", soundKey: "dog" },
  { letter: "E", animal: "Elephant", emoji: "🐘", soundKey: "elephant" },
  { letter: "F", animal: "Fox", emoji: "🦊", soundKey: "fox" },
  { letter: "G", animal: "Giraffe", emoji: "🦒", soundKey: "giraffe" },
  { letter: "H", animal: "Hippo", emoji: "🦛", soundKey: "hippo" },
  { letter: "I", animal: "Iguana", emoji: "🦎", soundKey: "iguana" },
  { letter: "J", animal: "Jaguar", emoji: "🐆", soundKey: "jaguar" },
  { letter: "K", animal: "Kangaroo", emoji: "🦘", soundKey: "kangaroo" },
  { letter: "L", animal: "Lion", emoji: "🦁", soundKey: "lion" },
  { letter: "M", animal: "Monkey", emoji: "🐒", soundKey: "monkey" },
  { letter: "N", animal: "Newt", emoji: "🦎", soundKey: "newt" },
  { letter: "O", animal: "Owl", emoji: "🦉", soundKey: "owl" },
  { letter: "P", animal: "Penguin", emoji: "🐧", soundKey: "penguin" },
  { letter: "Q", animal: "Quail", emoji: "🐦", soundKey: "quail" },
  { letter: "R", animal: "Rabbit", emoji: "🐰", soundKey: "rabbit" },
  { letter: "S", animal: "Snake", emoji: "🐍", soundKey: "snake" },
  { letter: "T", animal: "Tiger", emoji: "🐯", soundKey: "tiger" },
  { letter: "U", animal: "Unicorn", emoji: "🦄", soundKey: "unicorn" },
  { letter: "V", animal: "Vulture", emoji: "🦅", soundKey: "vulture" },
  { letter: "W", animal: "Whale", emoji: "🐋", soundKey: "whale" },
  { letter: "X", animal: "X-ray Fish", emoji: "🐠", soundKey: "xrayfish" },
  { letter: "Y", animal: "Yak", emoji: "🐂", soundKey: "yak" },
  { letter: "Z", animal: "Zebra", emoji: "🦓", soundKey: "zebra" },
];

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const AnimalMatchGame = () => {
  const { lang } = useLanguage();
  const rewards = useRewardsPipeline();
  const [round, setRound] = useState(0);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<string | null>(null);

  const currentPairs = useMemo(() => shuffle(allPairs).slice(0, 8), [round]);
  const shuffledLetters = useMemo(() => shuffle(currentPairs.map(p => p.letter)), [currentPairs]);
  const shuffledAnimals = useMemo(() => shuffle(currentPairs.map(p => ({ letter: p.letter, animal: p.animal, emoji: p.emoji, soundKey: p.soundKey }))), [currentPairs]);

  useEffect(() => {
    dispatchCharacterEvent({ type: "wave", payload: { message: lang === "he" ? "!חברו בין האות לחיה 🐾" : lang === "ar" ? "!طابقوا الحرف مع الحيوان 🐾" : "Match the letter to the animal! 🐾" } });
  }, [lang]);

  const handleLetterClick = useCallback((letter: string) => {
    if (matchedPairs.has(letter)) return;
    playClickSound();
    setSelectedLetter(letter);
    setWrongPair(null);
  }, [matchedPairs]);

  const handleAnimalClick = useCallback((letter: string) => {
    if (!selectedLetter || matchedPairs.has(letter)) return;
    playClickSound();

    if (selectedLetter === letter) {
      const matchedAnimal = currentPairs.find(p => p.letter === letter);
      if (matchedAnimal) {
        playAnimalSound(matchedAnimal.soundKey);
        setTimeout(() => speakEnglish(`${matchedAnimal.letter} is for ${matchedAnimal.animal}`), 400);
      }
      playMatchSound();
      const newMatched = new Set(matchedPairs);
      newMatched.add(letter);
      setMatchedPairs(newMatched);
      setSelectedLetter(null);
      rewards.fireEvent({ type: "correct", points: 10 });

      if (newMatched.size === currentPairs.length) {
        setTimeout(() => {
          rewards.completeGame({
            gameType: "animal-match",
            stageId: null,
            correct: currentPairs.length,
            wrong: 0,
            totalRounds: currentPairs.length,
          });
        }, 600);
      }
    } else {
      setWrongPair(letter);
      rewards.fireEvent({ type: "wrong" });
      setTimeout(() => { setWrongPair(null); setSelectedLetter(null); }, 800);
    }
  }, [selectedLetter, matchedPairs, currentPairs, rewards]);

  const nextRound = useCallback(() => {
    setRound(r => r + 1);
    setMatchedPairs(new Set());
    setSelectedLetter(null);
    rewards.reset();
    playClickSound();
  }, [rewards]);

  const progress = (matchedPairs.size / currentPairs.length) * 100;

  return (
    <GameSceneShell
      title={lang === "he" ? "התאמת חיות" : "Animal Match"}
      emoji="🐾"
      gameType="animal-match"
      rewards={rewards}
      onDismissXP={rewards.dismissXP}
      progress={progress}
      currentRound={matchedPairs.size}
      totalRounds={currentPairs.length}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 relative z-10">
        <AnimatePresence mode="popLayout">
          {!rewards.isComplete ? (
            <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
              {/* Letters column */}
              <div className="space-y-2">
                <p className="text-center font-display font-bold text-sm text-muted-foreground mb-2">
                  {lang === "he" ? "אותיות" : "Letters"}
                </p>
                {shuffledLetters.map((letter) => {
                  const isMatched = matchedPairs.has(letter);
                  const isSelected = selectedLetter === letter;
                  return (
                    <motion.button key={letter}
                      whileHover={!isMatched ? { scale: 1.04 } : {}}
                      whileTap={!isMatched ? { scale: 0.96 } : {}}
                      onClick={() => handleLetterClick(letter)}
                      disabled={isMatched}
                      className={`w-full py-3 rounded-xl font-display font-extrabold text-2xl transition-all ${isMatched ? "opacity-40" : ""}`}
                      style={{
                        background: isSelected ? "hsl(var(--primary) / 0.15)" : "hsl(var(--card) / 0.9)",
                        border: `2px solid ${isSelected ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
                        color: isSelected ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                      }}>
                      {letter}
                    </motion.button>
                  );
                })}
              </div>

              {/* Animals column */}
              <div className="space-y-2">
                <p className="text-center font-display font-bold text-sm text-muted-foreground mb-2">
                  {lang === "he" ? "חיות" : "Animals"}
                </p>
                {shuffledAnimals.map((a) => {
                  const isMatched = matchedPairs.has(a.letter);
                  const isWrong = wrongPair === a.letter;
                  return (
                    <motion.button key={a.letter}
                      whileHover={!isMatched ? { scale: 1.04 } : {}}
                      whileTap={!isMatched ? { scale: 0.96 } : {}}
                      onClick={() => handleAnimalClick(a.letter)}
                      disabled={isMatched || !selectedLetter}
                      animate={isWrong ? { x: [0, -8, 8, -4, 4, 0] } : {}}
                      transition={isWrong ? { duration: 0.4 } : {}}
                      className={`w-full py-2.5 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-all ${isMatched ? "opacity-40" : ""}`}
                      style={{
                        background: isWrong ? "hsl(var(--destructive) / 0.12)" : isMatched ? "hsl(var(--primary) / 0.08)" : "hsl(var(--card) / 0.9)",
                        border: `2px solid ${isWrong ? "hsl(var(--destructive) / 0.5)" : "hsl(var(--border))"}`,
                        color: "hsl(var(--foreground))",
                      }}>
                      <img src={animalImages[a.soundKey]} alt={a.animal} className="w-8 h-8 rounded-full object-cover" />
                      <span>{a.animal}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-md mx-auto rounded-2xl p-8"
              style={{ background: "hsl(var(--card) / 0.95)", border: "2px solid hsl(var(--primary) / 0.2)", boxShadow: "0 8px 30px hsl(var(--primary) / 0.1)" }}>
              <motion.div className="text-6xl mb-3" animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: 2 }}>🎉</motion.div>
              <h2 className="font-display font-extrabold text-2xl text-gradient mb-2">
                {lang === "he" ? "!כל הכבוד" : lang === "ar" ? "!أحسنت" : "Amazing!"}
              </h2>
              <div className="my-4"><StarRating earned={rewards.starsEarned} total={5} size={32} /></div>
              <p className="text-muted-foreground font-display text-sm mb-4">
                {lang === "he" ? `!צברת ${rewards.xpEarned} XP` : lang === "ar" ? `!حصلت على ${rewards.xpEarned} XP` : `You earned ${rewards.xpEarned} XP!`}
              </p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={nextRound}
                className="btn-kid inline-flex items-center gap-2 gradient-primary text-primary-foreground text-sm">
                <RotateCcw className="w-4 h-4" />
                {lang === "he" ? "סיבוב נוסף" : lang === "ar" ? "جولة أخرى" : "Play Again"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameSceneShell>
  );
};

export default AnimalMatchGame;
