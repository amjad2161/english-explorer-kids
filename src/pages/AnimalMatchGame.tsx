import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useLanguage } from "@/lib/i18n";
import { playClickSound } from "@/lib/sounds";
import { dispatchCharacterEvent } from "@/lib/characterStore";
import { addXP } from "@/lib/xp";
import ClassroomBackground from "@/components/ClassroomBackground";
import BackToLevels from "@/components/BackToLevels";
import Interactive3DMascot from "@/components/Interactive3DMascot";
import AnimatedSection from "@/components/AnimatedSection";
import GameShell from "@/components/GameShell";
import Confetti from "@/components/Confetti";
import { Star, RotateCcw, Sparkles, ArrowRight } from "lucide-react";

/* ─── Animal pairs ─── */
const allPairs = [
  { letter: "A", animal: "Alligator", emoji: "🐊" },
  { letter: "B", animal: "Bear", emoji: "🐻" },
  { letter: "C", animal: "Cat", emoji: "🐱" },
  { letter: "D", animal: "Dog", emoji: "🐶" },
  { letter: "E", animal: "Elephant", emoji: "🐘" },
  { letter: "F", animal: "Fox", emoji: "🦊" },
  { letter: "G", animal: "Giraffe", emoji: "🦒" },
  { letter: "H", animal: "Hippo", emoji: "🦛" },
  { letter: "I", animal: "Iguana", emoji: "🦎" },
  { letter: "J", animal: "Jaguar", emoji: "🐆" },
  { letter: "K", animal: "Kangaroo", emoji: "🦘" },
  { letter: "L", animal: "Lion", emoji: "🦁" },
  { letter: "M", animal: "Monkey", emoji: "🐒" },
  { letter: "N", animal: "Newt", emoji: "🦎" },
  { letter: "O", animal: "Owl", emoji: "🦉" },
  { letter: "P", animal: "Penguin", emoji: "🐧" },
  { letter: "Q", animal: "Quail", emoji: "🐦" },
  { letter: "R", animal: "Rabbit", emoji: "🐰" },
  { letter: "S", animal: "Snake", emoji: "🐍" },
  { letter: "T", animal: "Tiger", emoji: "🐯" },
  { letter: "U", animal: "Unicorn", emoji: "🦄" },
  { letter: "V", animal: "Vulture", emoji: "🦅" },
  { letter: "W", animal: "Whale", emoji: "🐋" },
  { letter: "X", animal: "X-ray Fish", emoji: "🐠" },
  { letter: "Y", animal: "Yak", emoji: "🐂" },
  { letter: "Z", animal: "Zebra", emoji: "🦓" },
];

type GamePhase = "playing" | "complete";

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const AnimalMatchGame = () => {
  const { dir, lang } = useLanguage();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("playing");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<string | null>(null);

  // Pick 8 random pairs per round
  const currentPairs = useMemo(() => shuffle(allPairs).slice(0, 8), [round]);
  const shuffledLetters = useMemo(() => shuffle(currentPairs.map(p => p.letter)), [currentPairs]);
  const shuffledAnimals = useMemo(() => shuffle(currentPairs.map(p => ({ letter: p.letter, animal: p.animal, emoji: p.emoji }))), [currentPairs]);

  useEffect(() => {
    dispatchCharacterEvent({ type: "wave", payload: { message: lang === "he" ? "!חברו בין האות לחיה" : "Match the letter to the animal! 🐾" } });
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
      // Correct match
      const newMatched = new Set(matchedPairs);
      newMatched.add(letter);
      setMatchedPairs(newMatched);
      setScore(s => s + 10 + streak * 5);
      setStreak(s => s + 1);
      setSelectedLetter(null);
      dispatchCharacterEvent({ type: "correct", payload: { duration: 1500 } });

      if (newMatched.size === currentPairs.length) {
        setTimeout(() => {
          setPhase("complete");
          addXP(50 + score);
          dispatchCharacterEvent({ type: "celebrate", payload: { message: lang === "he" ? "!מושלם" : "Perfect! 🎉" } });
        }, 600);
      }
    } else {
      // Wrong match
      setWrongPair(letter);
      setStreak(0);
      dispatchCharacterEvent({ type: "wrong", payload: { duration: 1500 } });
      setTimeout(() => { setWrongPair(null); setSelectedLetter(null); }, 800);
    }
  }, [selectedLetter, matchedPairs, currentPairs.length, streak, score, lang]);

  const nextRound = useCallback(() => {
    setRound(r => r + 1);
    setPhase("playing");
    setMatchedPairs(new Set());
    setSelectedLetter(null);
    setScore(0);
    setStreak(0);
    playClickSound();
  }, []);

  const totalMatched = matchedPairs.size;

  return (
    <div className="min-h-screen relative" dir={dir}>
      <ClassroomBackground />
      {phase === "complete" && <Confetti show={true} />}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10">
        <BackToLevels />

        <AnimatedSection className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Interactive3DMascot mood={phase === "complete" ? "celebrate" : "idle"} size="sm" />
            <div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-gradient">
                {lang === "he" ? "התאמת חיות" : lang === "ar" ? "مطابقة الحيوانات" : "Animal Match"} 🐾
              </h1>
              <p className="font-display text-xs text-muted-foreground">
                {lang === "he" ? "חברו בין האות לחיה שמתחילה בה" : "Match each letter to its animal!"}
              </p>
            </div>
          </div>

          {/* Score bar */}
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ background: "hsl(var(--primary) / 0.1)" }}>
              <Star className="w-4 h-4 text-primary" />
              <span className="font-display font-bold text-sm text-primary">{score}</span>
            </div>
            <div className="font-display text-xs text-muted-foreground">
              {totalMatched}/{currentPairs.length} {lang === "he" ? "התאמות" : "matches"}
            </div>
            {streak > 1 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-2 py-0.5 rounded-full text-xs font-display font-bold"
                style={{ background: "hsl(var(--accent) / 0.15)", color: "hsl(var(--accent))" }}
              >
                🔥 x{streak}
              </motion.div>
            )}
          </div>
        </AnimatedSection>

        <AnimatePresence mode="wait">
          {phase === "playing" ? (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto"
            >
              {/* Letters column */}
              <div className="space-y-2">
                <p className="text-center font-display font-bold text-sm text-muted-foreground mb-2">
                  {lang === "he" ? "אותיות" : "Letters"}
                </p>
                {shuffledLetters.map((letter) => {
                  const isMatched = matchedPairs.has(letter);
                  const isSelected = selectedLetter === letter;
                  return (
                    <motion.button
                      key={letter}
                      whileHover={!isMatched ? { scale: 1.04 } : {}}
                      whileTap={!isMatched ? { scale: 0.96 } : {}}
                      onClick={() => handleLetterClick(letter)}
                      disabled={isMatched}
                      className={`w-full py-3 rounded-xl font-display font-extrabold text-2xl transition-all ${isMatched ? "opacity-40" : ""}`}
                      style={{
                        background: isSelected
                          ? "hsl(var(--primary) / 0.15)"
                          : "hsl(var(--card) / 0.9)",
                        border: `2px solid ${isSelected ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
                        color: isSelected ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                      }}
                    >
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
                    <motion.button
                      key={a.letter}
                      whileHover={!isMatched ? { scale: 1.04 } : {}}
                      whileTap={!isMatched ? { scale: 0.96 } : {}}
                      onClick={() => handleAnimalClick(a.letter)}
                      disabled={isMatched || !selectedLetter}
                      animate={isWrong ? { x: [0, -8, 8, -4, 4, 0] } : {}}
                      transition={isWrong ? { duration: 0.4 } : {}}
                      className={`w-full py-2.5 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-all ${isMatched ? "opacity-40" : ""}`}
                      style={{
                        background: isWrong
                          ? "hsl(var(--destructive) / 0.12)"
                          : isMatched
                          ? "hsl(var(--primary) / 0.08)"
                          : "hsl(var(--card) / 0.9)",
                        border: `2px solid ${isWrong ? "hsl(var(--destructive) / 0.5)" : "hsl(var(--border))"}`,
                        color: "hsl(var(--foreground))",
                      }}
                    >
                      <span className="text-2xl">{a.emoji}</span>
                      <span>{a.animal}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-md mx-auto rounded-2xl p-8"
              style={{
                background: "hsl(var(--card) / 0.95)",
                border: "2px solid hsl(var(--primary) / 0.2)",
                boxShadow: "0 8px 30px hsl(var(--primary) / 0.1)",
              }}
            >
              <motion.div
                className="text-6xl mb-3"
                animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: 2 }}
              >
                🎉
              </motion.div>
              <h2 className="font-display font-extrabold text-2xl text-gradient mb-2">
                {lang === "he" ? "!כל הכבוד" : "Amazing!"}
              </h2>
              <p className="text-muted-foreground font-display text-sm mb-4">
                {lang === "he" ? `!צברת ${score} נקודות` : `You scored ${score} points!`}
              </p>
              <div className="flex justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextRound}
                  className="btn-kid inline-flex items-center gap-2 gradient-primary text-primary-foreground text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  {lang === "he" ? "סיבוב נוסף" : "Play Again"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnimalMatchGame;
