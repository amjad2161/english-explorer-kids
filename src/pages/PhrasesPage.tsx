import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { phraseGroups, getPhraseGroupName, getPhraseTranslation, Phrase, PhraseGroup } from "@/data/phrasesData";
import { speakEnglish, speakHebrew, speakArabic, playClickSound, playCorrectSound } from "@/lib/sounds";
import { Volume2, ChevronLeft, ChevronRight, RotateCcw, Shuffle } from "lucide-react";
import GameShell from "@/components/GameShell";

const PhrasesPage = () => {
  const { lang, t, dir } = useLanguage();
  const [selectedGroup, setSelectedGroup] = useState<PhraseGroup | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [shuffledPhrases, setShuffledPhrases] = useState<Phrase[]>([]);

  const phrases = useMemo(() => {
    if (!selectedGroup) return [];
    if (shuffled) return shuffledPhrases;
    return selectedGroup.phrases;
  }, [selectedGroup, shuffled, shuffledPhrases]);

  const currentPhrase = phrases[cardIndex] || null;

  const speakPhrase = useCallback((phrase: Phrase, targetLang?: string) => {
    const speakLang = targetLang || "en";
    if (speakLang === "en") speakEnglish(phrase.english);
    else if (speakLang === "he") speakHebrew(phrase.hebrew);
    else if (speakLang === "ar") speakArabic(phrase.arabic);
  }, []);

  const handleFlip = useCallback(() => {
    playClickSound();
    setFlipped(f => !f);
  }, []);

  const handleNext = useCallback(() => {
    if (cardIndex < phrases.length - 1) {
      playClickSound();
      setCardIndex(i => i + 1);
      setFlipped(false);
    }
  }, [cardIndex, phrases.length]);

  const handlePrev = useCallback(() => {
    if (cardIndex > 0) {
      playClickSound();
      setCardIndex(i => i - 1);
      setFlipped(false);
    }
  }, [cardIndex]);

  const handleShuffle = useCallback(() => {
    if (!selectedGroup) return;
    playCorrectSound();
    const arr = [...selectedGroup.phrases].sort(() => Math.random() - 0.5);
    setShuffledPhrases(arr);
    setShuffled(true);
    setCardIndex(0);
    setFlipped(false);
  }, [selectedGroup]);

  const handleReset = useCallback(() => {
    playClickSound();
    setShuffled(false);
    setCardIndex(0);
    setFlipped(false);
  }, []);

  const handleSelectGroup = useCallback((group: PhraseGroup) => {
    playClickSound();
    setSelectedGroup(group);
    setCardIndex(0);
    setFlipped(false);
    setShuffled(false);
  }, []);

  const handleBack = useCallback(() => {
    playClickSound();
    setSelectedGroup(null);
  }, []);

  // Category grid view
  if (!selectedGroup) {
    return (
      <GameShell title={lang === "he" ? "תרגול ביטויים" : lang === "ar" ? "تمرين العبارات" : "Phrases Practice"} emoji="💬" backPath="/">
        <div className="max-w-4xl mx-auto px-4 py-8" dir={dir}>
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-center mb-2"
            style={{ color: "hsl(var(--chalk))" }}
          >
            {lang === "he" ? "בחר קטגוריה" : lang === "ar" ? "اختر فئة" : "Choose a Category"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8 text-sm"
            style={{ color: "hsl(var(--chalk) / 0.6)" }}
          >
            {lang === "he" ? "למד ביטויים שימושיים באנגלית" : lang === "ar" ? "تعلّم عبارات مفيدة بالإنجليزية" : "Learn useful English phrases & expressions"}
          </motion.p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {phraseGroups.map((group, i) => (
              <motion.button
                key={group.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelectGroup(group)}
                className="relative rounded-2xl p-5 text-center transition-all overflow-hidden group"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--board) / 0.8), hsl(var(--board) / 0.6))",
                  border: "2px solid hsl(var(--grass) / 0.2)",
                  boxShadow: "0 4px 20px hsl(var(--board) / 0.3)",
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "radial-gradient(circle at center, hsl(var(--grass) / 0.1), transparent 70%)" }}
                />
                <div className="text-4xl mb-3">{group.emoji}</div>
                <div className="font-bold text-sm" style={{ color: "hsl(var(--chalk))" }}>
                  {getPhraseGroupName(group, lang)}
                </div>
                <div className="text-xs mt-1" style={{ color: "hsl(var(--chalk) / 0.5)" }}>
                  {group.phrases.length} {lang === "he" ? "ביטויים" : lang === "ar" ? "عبارات" : "phrases"}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </GameShell>
    );
  }

  // Flashcard view
  return (
    <GameShell title={getPhraseGroupName(selectedGroup, lang)} emoji={selectedGroup.emoji} backPath="/phrases">
      <div className="max-w-2xl mx-auto px-4 py-6" dir={dir}>
        {/* Back + controls bar */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{
              color: "hsl(var(--chalk))",
              background: "hsl(var(--board) / 0.5)",
              border: "1px solid hsl(var(--grass) / 0.2)",
            }}
          >
            <ChevronLeft size={16} />
            {lang === "he" ? "חזור" : lang === "ar" ? "رجوع" : "Back"}
          </motion.button>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShuffle}
              className="p-2 rounded-xl"
              style={{
                background: "hsl(var(--sky) / 0.15)",
                color: "hsl(var(--sky))",
                border: "1px solid hsl(var(--sky) / 0.3)",
              }}
              title="Shuffle"
            >
              <Shuffle size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleReset}
              className="p-2 rounded-xl"
              style={{
                background: "hsl(var(--sunshine) / 0.15)",
                color: "hsl(var(--sunshine))",
                border: "1px solid hsl(var(--sunshine) / 0.3)",
              }}
              title="Reset"
            >
              <RotateCcw size={18} />
            </motion.button>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="flex-1 h-2 rounded-full overflow-hidden"
            style={{ background: "hsl(var(--board) / 0.5)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: "var(--gradient-grass)" }}
              animate={{ width: `${((cardIndex + 1) / phrases.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 200 }}
            />
          </div>
          <span className="text-sm font-bold" style={{ color: "hsl(var(--chalk) / 0.7)" }}>
            {cardIndex + 1}/{phrases.length}
          </span>
        </div>

        {/* Flashcard */}
        {currentPhrase && (
          <div className="perspective-1000 mb-8" style={{ perspective: "1000px" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${cardIndex}-${flipped}`}
                initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                onClick={handleFlip}
                className="cursor-pointer rounded-3xl p-8 min-h-[260px] flex flex-col items-center justify-center text-center relative select-none"
                style={{
                  background: flipped
                    ? "linear-gradient(135deg, hsl(var(--sky) / 0.15), hsl(var(--lavender) / 0.1))"
                    : "linear-gradient(135deg, hsl(var(--grass) / 0.15), hsl(var(--sky) / 0.08))",
                  border: `2px solid ${flipped ? "hsl(var(--sky) / 0.3)" : "hsl(var(--grass) / 0.3)"}`,
                  boxShadow: `0 8px 32px ${flipped ? "hsl(var(--sky) / 0.15)" : "hsl(var(--grass) / 0.15)"}`,
                }}
              >
                {/* Category emoji */}
                <div className="text-5xl mb-4">{currentPhrase.emoji}</div>

                {!flipped ? (
                  <>
                    {/* English side */}
                    <h3
                      className="text-2xl sm:text-3xl font-extrabold mb-3"
                      style={{ color: "hsl(var(--chalk))", fontFamily: "'Baloo 2', cursive" }}
                    >
                      {currentPhrase.english}
                    </h3>
                    <p className="text-sm" style={{ color: "hsl(var(--chalk) / 0.5)" }}>
                      {lang === "he" ? "לחץ לתרגום" : lang === "ar" ? "انقر للترجمة" : "Tap to translate"}
                    </p>
                  </>
                ) : (
                  <>
                    {/* Translation side */}
                    <h3
                      className="text-2xl sm:text-3xl font-extrabold mb-2"
                      style={{ color: "hsl(var(--sky))", fontFamily: "'Baloo 2', cursive" }}
                    >
                      {getPhraseTranslation(currentPhrase, lang)}
                    </h3>
                    <p
                      className="text-lg mb-1"
                      style={{ color: "hsl(var(--chalk) / 0.7)" }}
                    >
                      {currentPhrase.english}
                    </p>
                    {/* Show all translations */}
                    <div className="mt-3 flex flex-col gap-1 text-sm" style={{ color: "hsl(var(--chalk) / 0.5)" }}>
                      {lang !== "he" && <span dir="rtl">🇮🇱 {currentPhrase.hebrew}</span>}
                      {lang !== "ar" && <span dir="rtl">🇸🇦 {currentPhrase.arabic}</span>}
                      {lang !== "en" && <span>🇬🇧 {currentPhrase.english}</span>}
                    </div>
                  </>
                )}

                {/* Flip indicator */}
                <div
                  className="absolute bottom-3 right-3 text-xs px-2 py-1 rounded-lg"
                  style={{
                    background: "hsl(var(--board) / 0.3)",
                    color: "hsl(var(--chalk) / 0.4)",
                  }}
                >
                  {flipped ? "🔄" : "👆"}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrev}
            disabled={cardIndex === 0}
            className="w-14 h-14 rounded-2xl flex items-center justify-center disabled:opacity-30"
            style={{
              background: "hsl(var(--board) / 0.5)",
              border: "2px solid hsl(var(--grass) / 0.2)",
              color: "hsl(var(--chalk))",
            }}
          >
            <ChevronLeft size={24} />
          </motion.button>

          {/* Speak button */}
          {currentPhrase && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                speakPhrase(currentPhrase, flipped ? lang : "en");
              }}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: "var(--gradient-grass)",
                color: "hsl(var(--primary-foreground))",
                boxShadow: "0 4px 20px hsl(var(--grass) / 0.3)",
              }}
            >
              <Volume2 size={28} />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNext}
            disabled={cardIndex >= phrases.length - 1}
            className="w-14 h-14 rounded-2xl flex items-center justify-center disabled:opacity-30"
            style={{
              background: "hsl(var(--board) / 0.5)",
              border: "2px solid hsl(var(--grass) / 0.2)",
              color: "hsl(var(--chalk))",
            }}
          >
            <ChevronRight size={24} />
          </motion.button>
        </div>

        {/* Completion message */}
        {cardIndex === phrases.length - 1 && flipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center p-4 rounded-2xl"
            style={{
              background: "hsl(var(--grass) / 0.1)",
              border: "2px solid hsl(var(--grass) / 0.3)",
            }}
          >
            <p className="text-lg font-bold" style={{ color: "hsl(var(--grass))" }}>
              🎉 {lang === "he" ? "כל הכבוד! סיימת את כל הביטויים!" : lang === "ar" ? "أحسنت! أتممت جميع العبارات!" : "Well done! You completed all phrases!"}
            </p>
          </motion.div>
        )}
      </div>
    </GameShell>
  );
};

export default PhrasesPage;
