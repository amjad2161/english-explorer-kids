import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { wordCategories, getCategoryName } from "@/data/learningData";
import { playClickSound } from "@/lib/sounds";
import GameShell from "@/components/GameShell";

const gameModes = [
  { id: "quiz", label: "Quiz", labelHe: "חידון", labelAr: "اختبار", emoji: "🎯", path: "/quiz" },
  { id: "spelling", label: "Spelling", labelHe: "איות", labelAr: "تهجئة", emoji: "🐝", path: "/spelling" },
  { id: "scramble", label: "Scramble", labelHe: "ערבוב", labelAr: "خلط", emoji: "🔀", path: "/scramble" },
  { id: "hangman", label: "Hangman", labelHe: "איש תלוי", labelAr: "لعبة الشنق", emoji: "🎭", path: "/hangman" },
  { id: "memory", label: "Memory", labelHe: "זיכרון", labelAr: "ذاكرة", emoji: "🧩", path: "/memory" },
];

const colorMap: Record<string, string> = {
  grass: "var(--gradient-grass)",
  candy: "var(--gradient-candy)",
  sky: "var(--gradient-sky)",
  sunshine: "var(--gradient-warm)",
  lavender: "var(--gradient-lavender)",
};

const TopicGamesPage = () => {
  const navigate = useNavigate();
  const { lang, dir } = useLanguage();
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);

  const getGameLabel = (g: typeof gameModes[0]) =>
    lang === "he" ? g.labelHe : lang === "ar" ? g.labelAr : g.label;

  const handleSelectTopic = useCallback((index: number) => {
    playClickSound();
    setSelectedTopic(index);
  }, []);

  const handleSelectGame = useCallback((game: typeof gameModes[0]) => {
    if (selectedTopic === null) return;
    playClickSound();
    // Memory uses category index directly via startGame, route with topic param
    navigate(`${game.path}?topic=${selectedTopic}`);
  }, [selectedTopic, navigate]);

  const handleBack = useCallback(() => {
    playClickSound();
    setSelectedTopic(null);
  }, []);

  return (
    <GameShell
      title={lang === "he" ? "נושאים ומשחקים" : lang === "ar" ? "مواضيع وألعاب" : "Topics & Games"}
      emoji="🎮"
      backPath="/"
    >
      <div className="max-w-5xl mx-auto px-4 py-6" dir={dir}>
        <AnimatePresence mode="wait">
          {selectedTopic === null ? (
            /* ─── Topic Grid ─── */
            <motion.div
              key="topics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-center mb-2"
                style={{ color: "hsl(var(--chalk))" }}
              >
                {lang === "he" ? "בחר נושא ללמוד" : lang === "ar" ? "اختر موضوعاً للتعلم" : "Pick a Topic to Practice"}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-8 text-sm"
                style={{ color: "hsl(var(--chalk) / 0.5)" }}
              >
                {lang === "he"
                  ? "כל נושא זמין ב-5 משחקים שונים!"
                  : lang === "ar"
                    ? "كل موضوع متاح في 5 ألعاب مختلفة!"
                    : "Every topic is available in 5 different games!"}
              </motion.p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {wordCategories.map((cat, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{ scale: 1.06, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectTopic(i)}
                    className="rounded-2xl p-4 text-center relative overflow-hidden group"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--board) / 0.8), hsl(var(--board) / 0.6))",
                      border: "2px solid hsl(var(--grass) / 0.15)",
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: colorMap[cat.color] || colorMap.grass, opacity: 0 }}
                    />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300"
                      style={{ background: colorMap[cat.color] || colorMap.grass }}
                    />
                    <div className="relative z-10">
                      <div className="text-3xl mb-2">{cat.emoji}</div>
                      <div className="font-bold text-sm" style={{ color: "hsl(var(--chalk))" }}>
                        {getCategoryName(cat, lang)}
                      </div>
                      <div className="text-xs mt-1" style={{ color: "hsl(var(--chalk) / 0.4)" }}>
                        {cat.words.length} {lang === "he" ? "מילים" : lang === "ar" ? "كلمات" : "words"}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* ─── Game Mode Picker ─── */
            <motion.div
              key="games"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Header with topic info */}
              <div className="text-center mb-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBack}
                  className="mb-4 px-4 py-2 rounded-xl text-sm"
                  style={{
                    color: "hsl(var(--chalk))",
                    background: "hsl(var(--board) / 0.5)",
                    border: "1px solid hsl(var(--grass) / 0.2)",
                  }}
                >
                  ← {lang === "he" ? "חזור לנושאים" : lang === "ar" ? "رجوع للمواضيع" : "Back to Topics"}
                </motion.button>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="text-6xl mb-3"
                >
                  {wordCategories[selectedTopic].emoji}
                </motion.div>
                <h2 className="text-2xl font-bold" style={{ color: "hsl(var(--chalk))" }}>
                  {getCategoryName(wordCategories[selectedTopic], lang)}
                </h2>
                <p className="text-sm mt-1" style={{ color: "hsl(var(--chalk) / 0.5)" }}>
                  {wordCategories[selectedTopic].words.length} {lang === "he" ? "מילים" : lang === "ar" ? "كلمات" : "words"} •{" "}
                  {lang === "he" ? "בחר סגנון משחק" : lang === "ar" ? "اختر نمط اللعبة" : "Choose a game mode"}
                </p>
              </div>

              {/* Game mode cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {gameModes.map((game, i) => (
                  <motion.button
                    key={game.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectGame(game)}
                    className="rounded-2xl p-6 text-center relative overflow-hidden group"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--board) / 0.9), hsl(var(--board) / 0.7))",
                      border: "2px solid hsl(var(--grass) / 0.2)",
                      boxShadow: "0 6px 24px hsl(var(--board) / 0.3)",
                    }}
                  >
                    {/* Hover gradient */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-[0.12] transition-opacity duration-300 rounded-2xl"
                      style={{ background: "var(--gradient-hero)" }}
                    />
                    <div className="relative z-10">
                      <div className="text-5xl mb-3">{game.emoji}</div>
                      <h3 className="text-lg font-bold" style={{ color: "hsl(var(--chalk))" }}>
                        {getGameLabel(game)}
                      </h3>
                      <p className="text-xs mt-2" style={{ color: "hsl(var(--chalk) / 0.4)" }}>
                        {game.id === "quiz" && (lang === "he" ? "ענה על שאלות רב-ברירה" : lang === "ar" ? "أجب على أسئلة الاختيار" : "Answer multiple choice questions")}
                        {game.id === "spelling" && (lang === "he" ? "אית מילים אות אחר אות" : lang === "ar" ? "تهجئة الكلمات حرف بحرف" : "Spell words letter by letter")}
                        {game.id === "scramble" && (lang === "he" ? "סדר מחדש אותיות מעורבלות" : lang === "ar" ? "رتب الحروف المبعثرة" : "Unscramble mixed-up letters")}
                        {game.id === "hangman" && (lang === "he" ? "נחש את המילה לפני שנגמרות הניסיונות" : lang === "ar" ? "خمن الكلمة قبل نفاد المحاولات" : "Guess the word before running out of tries")}
                        {game.id === "memory" && (lang === "he" ? "התאם זוגות של מילים ואימוג׳ים" : lang === "ar" ? "طابق أزواج الكلمات والرموز" : "Match word and emoji pairs")}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Word preview */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 p-4 rounded-2xl max-w-3xl mx-auto"
                style={{
                  background: "hsl(var(--board) / 0.3)",
                  border: "1px solid hsl(var(--grass) / 0.1)",
                }}
              >
                <p className="text-xs text-center mb-3" style={{ color: "hsl(var(--chalk) / 0.4)" }}>
                  {lang === "he" ? "דוגמאות מילים בנושא" : lang === "ar" ? "أمثلة كلمات في الموضوع" : "Sample words in this topic"}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {wordCategories[selectedTopic].words.slice(0, 12).map((w, i) => (
                    <motion.span
                      key={w.english}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.04 }}
                      className="px-3 py-1.5 rounded-xl text-sm"
                      style={{
                        background: "hsl(var(--board) / 0.5)",
                        color: "hsl(var(--chalk) / 0.8)",
                        border: "1px solid hsl(var(--grass) / 0.15)",
                      }}
                    >
                      {w.emoji} {w.english}
                    </motion.span>
                  ))}
                  {wordCategories[selectedTopic].words.length > 12 && (
                    <span className="px-3 py-1.5 text-sm" style={{ color: "hsl(var(--chalk) / 0.3)" }}>
                      +{wordCategories[selectedTopic].words.length - 12}
                    </span>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  );
};

export default TopicGamesPage;
