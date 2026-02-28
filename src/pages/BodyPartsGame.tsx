import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { speakEnglish, playCorrectSound, playWrongSound, playClickSound, playVictoryFanfare, startBgMusic, stopBgMusic } from "@/lib/sounds";
import { useRewardsPipeline } from "@/hooks/useRewardsPipeline";
import GameSceneShell from "@/components/GameSceneShell";
import StarRating from "@/components/StarRating";
import { Volume2, RotateCcw, Trophy, Sparkles } from "lucide-react";
import { getWordTranslation, WordCard } from "@/data/learningData";
import { useAgeAdaptive } from "@/hooks/useAgeAdaptive";

/* ─── Body part hotspot definitions with positions on the SVG child figure ─── */
interface BodyHotspot {
  id: string;
  english: string;
  hebrew: string;
  arabic: string;
  emoji: string;
  /** Position as % of the figure container */
  x: number;
  y: number;
  /** Hotspot radius */
  r: number;
}

const bodyHotspots: BodyHotspot[] = [
  { id: "hair", english: "Hair", hebrew: "שיער", arabic: "شعر", emoji: "💇", x: 50, y: 5, r: 14 },
  { id: "forehead", english: "Forehead", hebrew: "מצח", arabic: "جبهة", emoji: "🤔", x: 50, y: 10, r: 10 },
  { id: "eyebrow", english: "Eyebrow", hebrew: "גבה", arabic: "حاجب", emoji: "🤨", x: 43, y: 13.5, r: 5 },
  { id: "eye", english: "Eye", hebrew: "עין", arabic: "عين", emoji: "👁️", x: 43, y: 16, r: 5 },
  { id: "ear", english: "Ear", hebrew: "אוזן", arabic: "أذن", emoji: "👂", x: 35, y: 17, r: 6 },
  { id: "nose", english: "Nose", hebrew: "אף", arabic: "أنف", emoji: "👃", x: 50, y: 19, r: 5 },
  { id: "cheek", english: "Cheek", hebrew: "לחי", arabic: "خد", emoji: "😊", x: 57, y: 20, r: 5 },
  { id: "mouth", english: "Mouth", hebrew: "פה", arabic: "فم", emoji: "👄", x: 50, y: 24, r: 5 },
  { id: "lips", english: "Lips", hebrew: "שפתיים", arabic: "شفاه", emoji: "👄", x: 50, y: 23.5, r: 4 },
  { id: "chin", english: "Chin", hebrew: "סנטר", arabic: "ذقن", emoji: "😶", x: 50, y: 27, r: 5 },
  { id: "neck", english: "Neck", hebrew: "צוואר", arabic: "رقبة", emoji: "🧣", x: 50, y: 31, r: 6 },
  { id: "shoulder", english: "Shoulder", hebrew: "כתף", arabic: "كتف", emoji: "💪", x: 32, y: 36, r: 7 },
  { id: "chest", english: "Chest", hebrew: "חזה", arabic: "صدر", emoji: "🫁", x: 50, y: 40, r: 8 },
  { id: "arm", english: "Arm", hebrew: "זרוע", arabic: "ذراع", emoji: "💪", x: 26, y: 45, r: 7 },
  { id: "elbow", english: "Elbow", hebrew: "מרפק", arabic: "كوع", emoji: "💪", x: 23, y: 50, r: 6 },
  { id: "wrist", english: "Wrist", hebrew: "פרק כף יד", arabic: "معصم", emoji: "⌚", x: 20, y: 56, r: 5 },
  { id: "hand", english: "Hand", hebrew: "יד", arabic: "يد", emoji: "✋", x: 18, y: 60, r: 7 },
  { id: "finger", english: "Finger", hebrew: "אצבע", arabic: "إصبع", emoji: "☝️", x: 16, y: 64, r: 5 },
  { id: "thumb", english: "Thumb", hebrew: "אגודל", arabic: "إبهام", emoji: "👍", x: 22, y: 63, r: 5 },
  { id: "stomach", english: "Stomach", hebrew: "בטן", arabic: "بطن", emoji: "🤰", x: 50, y: 50, r: 8 },
  { id: "leg", english: "Leg", hebrew: "רגל", arabic: "ساق", emoji: "🦵", x: 42, y: 68, r: 8 },
  { id: "knee", english: "Knee", hebrew: "ברך", arabic: "ركبة", emoji: "🦵", x: 42, y: 75, r: 6 },
  { id: "ankle", english: "Ankle", hebrew: "קרסול", arabic: "كاحل", emoji: "🦶", x: 42, y: 88, r: 5 },
  { id: "foot", english: "Foot", hebrew: "כף רגל", arabic: "قدم", emoji: "🦶", x: 40, y: 94, r: 7 },
  { id: "toes", english: "Toes", hebrew: "אצבעות רגל", arabic: "أصابع القدم", emoji: "🦶", x: 37, y: 97, r: 5 },
];

type GameMode = "explore" | "quiz";

/* ─── SVG Child Figure ─── */
const ChildFigure = ({ 
  highlightedPart, 
  correctParts,
  wrongPart,
  onPartClick,
  mode,
  targetPart,
}: { 
  highlightedPart: string | null;
  correctParts: Set<string>;
  wrongPart: string | null;
  onPartClick: (part: BodyHotspot) => void;
  mode: GameMode;
  targetPart: string | null;
}) => {
  return (
    <div className="relative w-full max-w-[280px] mx-auto" style={{ aspectRatio: "1/2" }}>
      {/* SVG Child body */}
      <svg viewBox="0 0 200 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Hair */}
        <ellipse cx="100" cy="38" rx="38" ry="20" fill="hsl(30, 50%, 30%)" />
        <ellipse cx="100" cy="30" rx="32" ry="18" fill="hsl(30, 50%, 35%)" />
        
        {/* Head */}
        <ellipse cx="100" cy="60" rx="32" ry="35" fill="hsl(35, 60%, 75%)" />
        
        {/* Face details */}
        {/* Eyes */}
        <ellipse cx="87" cy="58" rx="6" ry="7" fill="white" />
        <ellipse cx="113" cy="58" rx="6" ry="7" fill="white" />
        <circle cx="88" cy="59" r="3.5" fill="hsl(200, 60%, 35%)" />
        <circle cx="114" cy="59" r="3.5" fill="hsl(200, 60%, 35%)" />
        <circle cx="89" cy="58" r="1.5" fill="white" />
        <circle cx="115" cy="58" r="1.5" fill="white" />
        
        {/* Eyebrows */}
        <path d="M 79 50 Q 87 46 95 50" fill="none" stroke="hsl(30, 40%, 30%)" strokeWidth="2" strokeLinecap="round" />
        <path d="M 105 50 Q 113 46 121 50" fill="none" stroke="hsl(30, 40%, 30%)" strokeWidth="2" strokeLinecap="round" />
        
        {/* Nose */}
        <path d="M 100 64 Q 96 72 100 74 Q 104 72 100 64" fill="hsl(35, 55%, 68%)" />
        
        {/* Mouth - smile */}
        <path d="M 90 80 Q 100 90 110 80" fill="none" stroke="hsl(0, 60%, 55%)" strokeWidth="2.5" strokeLinecap="round" />
        
        {/* Ears */}
        <ellipse cx="67" cy="62" rx="7" ry="10" fill="hsl(35, 55%, 70%)" />
        <ellipse cx="133" cy="62" rx="7" ry="10" fill="hsl(35, 55%, 70%)" />
        
        {/* Neck */}
        <rect x="90" y="92" width="20" height="20" rx="4" fill="hsl(35, 60%, 75%)" />
        
        {/* T-shirt body */}
        <path d="M 55 115 Q 55 108 70 105 L 90 110 L 110 110 L 130 105 Q 145 108 145 115 L 148 200 Q 148 210 100 210 Q 52 210 55 200 Z" 
          fill="hsl(210, 70%, 55%)" />
        {/* T-shirt collar */}
        <path d="M 85 108 Q 100 118 115 108" fill="none" stroke="hsl(210, 60%, 45%)" strokeWidth="2" />
        {/* T-shirt design - star */}
        <text x="100" y="165" textAnchor="middle" fontSize="28" fill="hsl(45, 100%, 65%)">⭐</text>
        
        {/* Arms */}
        {/* Left arm */}
        <path d="M 55 115 Q 40 140 35 175 Q 32 190 28 200 Q 25 210 30 215"
          fill="none" stroke="hsl(35, 60%, 75%)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
        {/* Left hand */}
        <circle cx="30" cy="220" r="12" fill="hsl(35, 60%, 75%)" />
        {/* Left fingers */}
        <circle cx="22" cy="230" r="4" fill="hsl(35, 60%, 73%)" />
        <circle cx="28" cy="233" r="4" fill="hsl(35, 60%, 73%)" />
        <circle cx="34" cy="232" r="4" fill="hsl(35, 60%, 73%)" />
        <circle cx="38" cy="228" r="3.5" fill="hsl(35, 60%, 73%)" />
        <circle cx="20" cy="218" r="4" fill="hsl(35, 60%, 73%)" /> {/* Thumb */}
        
        {/* Right arm */}
        <path d="M 145 115 Q 160 140 165 175 Q 168 190 172 200 Q 175 210 170 215"
          fill="none" stroke="hsl(35, 60%, 75%)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
        {/* Right hand */}
        <circle cx="170" cy="220" r="12" fill="hsl(35, 60%, 75%)" />
        
        {/* Shorts */}
        <path d="M 65 200 L 55 270 Q 58 275 100 275 Q 85 275 80 260 L 100 210 L 120 260 Q 115 275 100 275 Q 142 275 145 270 L 135 200 Z"
          fill="hsl(25, 80%, 55%)" />
        
        {/* Left leg */}
        <path d="M 72 270 Q 70 310 72 340 Q 73 360 75 370"
          fill="none" stroke="hsl(35, 60%, 75%)" strokeWidth="22" strokeLinecap="round" />
        {/* Right leg */}
        <path d="M 128 270 Q 130 310 128 340 Q 127 360 125 370"
          fill="none" stroke="hsl(35, 60%, 75%)" strokeWidth="22" strokeLinecap="round" />
        
        {/* Left shoe */}
        <ellipse cx="70" cy="380" rx="18" ry="10" fill="hsl(0, 70%, 50%)" />
        <ellipse cx="64" cy="378" rx="8" ry="5" fill="hsl(0, 60%, 60%)" />
        
        {/* Right shoe */}
        <ellipse cx="130" cy="380" rx="18" ry="10" fill="hsl(0, 70%, 50%)" />
        <ellipse cx="136" cy="378" rx="8" ry="5" fill="hsl(0, 60%, 60%)" />
      </svg>
      
      {/* Clickable hotspots overlay */}
      {bodyHotspots.map((part) => {
        const isHighlighted = highlightedPart === part.id;
        const isCorrect = correctParts.has(part.id);
        const isWrong = wrongPart === part.id;
        const isTarget = mode === "quiz" && targetPart === part.id;
        
        return (
          <motion.button
            key={part.id}
            className="absolute rounded-full flex items-center justify-center"
            style={{
              left: `${part.x}%`,
              top: `${part.y / 2}%`,
              width: `${part.r * 2}%`,
              height: `${part.r}%`,
              transform: "translate(-50%, -50%)",
              background: isCorrect
                ? "hsl(var(--grass) / 0.4)"
                : isWrong
                  ? "hsl(var(--destructive) / 0.4)"
                  : isHighlighted
                    ? "hsl(var(--sky) / 0.4)"
                    : mode === "explore"
                      ? "hsl(var(--chalk) / 0.08)"
                      : "hsl(var(--chalk) / 0.05)",
              border: isCorrect
                ? "2px solid hsl(var(--grass) / 0.6)"
                : isWrong
                  ? "2px solid hsl(var(--destructive) / 0.6)"
                  : isHighlighted
                    ? "2px solid hsl(var(--sky) / 0.6)"
                    : "1.5px dashed hsl(var(--chalk) / 0.15)",
              zIndex: isHighlighted || isCorrect || isWrong ? 20 : 10,
            }}
            whileHover={{ scale: 1.2, background: "hsl(var(--sky) / 0.3)" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onPartClick(part)}
            animate={isWrong ? { x: [0, -5, 5, -5, 0] } : isCorrect ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.4 }}
          />
        );
      })}
    </div>
  );
};

/* ─── Main Game ─── */
const BodyPartsGame = () => {
  const { lang, dir } = useLanguage();
  const adaptive = useAgeAdaptive();
  const rewards = useRewardsPipeline();

  const [mode, setMode] = useState<GameMode>("explore");
  const [highlightedPart, setHighlightedPart] = useState<string | null>(null);
  const [selectedInfo, setSelectedInfo] = useState<BodyHotspot | null>(null);

  // Quiz state
  const [quizParts, setQuizParts] = useState<BodyHotspot[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [correctParts, setCorrectParts] = useState<Set<string>>(new Set());
  const [wrongPart, setWrongPart] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const TOTAL_ROUNDS = Math.min(12, bodyHotspots.length);

  useEffect(() => { startBgMusic(); return () => stopBgMusic(); }, []);

  const getTranslation = useCallback((part: BodyHotspot) => {
    return lang === "he" ? part.hebrew : lang === "ar" ? part.arabic : part.english;
  }, [lang]);

  // Explore mode: tap a part to learn its name
  const handleExploreClick = useCallback((part: BodyHotspot) => {
    playClickSound();
    setHighlightedPart(part.id);
    setSelectedInfo(part);
    speakEnglish(part.english);
  }, []);

  // Start quiz mode
  const startQuiz = useCallback(() => {
    playClickSound();
    const shuffled = [...bodyHotspots].sort(() => Math.random() - 0.5).slice(0, TOTAL_ROUNDS);
    setQuizParts(shuffled);
    setQuizIndex(0);
    setCorrectParts(new Set());
    setWrongPart(null);
    setScore(0);
    setIsFinished(false);
    setMode("quiz");
    setHighlightedPart(null);
    setSelectedInfo(null);
    rewards.reset();
    setTimeout(() => speakEnglish(shuffled[0].english), 600);
  }, [rewards, TOTAL_ROUNDS]);

  // Quiz mode: check if the clicked part is correct
  const handleQuizClick = useCallback((part: BodyHotspot) => {
    if (isFinished || !quizParts[quizIndex]) return;

    const target = quizParts[quizIndex];
    if (part.id === target.id) {
      playCorrectSound();
      setCorrectParts(prev => new Set(prev).add(part.id));
      setScore(s => s + 1);
      rewards.fireEvent({ type: "correct" });
      setWrongPart(null);

      setTimeout(() => {
        if (quizIndex + 1 >= quizParts.length) {
          setIsFinished(true);
          if (score + 1 >= TOTAL_ROUNDS * 0.7) playVictoryFanfare();
        } else {
          setQuizIndex(i => i + 1);
          setTimeout(() => speakEnglish(quizParts[quizIndex + 1].english), 400);
        }
      }, 800);
    } else {
      playWrongSound();
      setWrongPart(part.id);
      rewards.fireEvent({ type: "wrong" });
      setTimeout(() => setWrongPart(null), 600);
    }
  }, [quizParts, quizIndex, isFinished, score, rewards, TOTAL_ROUNDS]);

  const handlePartClick = mode === "explore" ? handleExploreClick : handleQuizClick;

  const currentTarget = mode === "quiz" && quizParts[quizIndex] ? quizParts[quizIndex] : null;

  const goExplore = useCallback(() => {
    playClickSound();
    setMode("explore");
    setIsFinished(false);
  }, []);

  const stars = isFinished ? (score >= TOTAL_ROUNDS * 0.9 ? 3 : score >= TOTAL_ROUNDS * 0.7 ? 2 : score >= TOTAL_ROUNDS * 0.4 ? 1 : 0) : 0;

  return (
    <GameSceneShell
      title={lang === "he" ? "איברי הגוף" : lang === "ar" ? "أجزاء الجسم" : "Body Parts"}
      emoji="🦵"
      gameType="body-parts"
      progress={mode === "quiz" ? (quizIndex / TOTAL_ROUNDS) * 100 : undefined}
      totalRounds={mode === "quiz" ? TOTAL_ROUNDS : undefined}
      currentRound={mode === "quiz" ? quizIndex + 1 : undefined}
      rewards={rewards}
    >
      <div className="max-w-4xl mx-auto px-4 py-4" dir={dir}>
        {/* Mode toggle & info bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goExplore}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                background: mode === "explore" ? "hsl(var(--grass) / 0.2)" : "hsl(var(--board) / 0.4)",
                color: mode === "explore" ? "hsl(var(--grass))" : "hsl(var(--chalk) / 0.6)",
                border: mode === "explore" ? "2px solid hsl(var(--grass) / 0.4)" : "1px solid hsl(var(--chalk) / 0.1)",
              }}
            >
              🔍 {lang === "he" ? "חקור" : lang === "ar" ? "استكشف" : "Explore"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startQuiz}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                background: mode === "quiz" ? "hsl(var(--sky) / 0.2)" : "hsl(var(--board) / 0.4)",
                color: mode === "quiz" ? "hsl(var(--sky))" : "hsl(var(--chalk) / 0.6)",
                border: mode === "quiz" ? "2px solid hsl(var(--sky) / 0.4)" : "1px solid hsl(var(--chalk) / 0.1)",
              }}
            >
              🎯 {lang === "he" ? "בחן אותי!" : lang === "ar" ? "اختبرني!" : "Quiz Me!"}
            </motion.button>
          </div>
          
          {mode === "quiz" && !isFinished && (
            <div className="text-sm font-bold" style={{ color: "hsl(var(--chalk) / 0.7)" }}>
              {score}/{TOTAL_ROUNDS} ✅
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Figure */}
          <div className="flex-1 w-full lg:w-auto">
            {/* Quiz prompt */}
            {mode === "quiz" && !isFinished && currentTarget && (
              <motion.div
                key={quizIndex}
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-4 p-3 rounded-2xl"
                style={{
                  background: "hsl(var(--sky) / 0.1)",
                  border: "2px solid hsl(var(--sky) / 0.3)",
                }}
              >
                <p className="text-sm" style={{ color: "hsl(var(--chalk) / 0.6)" }}>
                  {lang === "he" ? "הצבע על:" : lang === "ar" ? "أشر إلى:" : "Point to:"}
                </p>
                <div className="flex items-center justify-center gap-3 mt-1">
                  <span className="text-2xl">{currentTarget.emoji}</span>
                  <span className="text-xl font-extrabold" style={{ color: "hsl(var(--sky))", fontFamily: "'Baloo 2', cursive" }}>
                    {currentTarget.english}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => speakEnglish(currentTarget.english)}
                    className="p-1.5 rounded-full"
                    style={{ background: "hsl(var(--sky) / 0.2)" }}
                  >
                    <Volume2 size={16} style={{ color: "hsl(var(--sky))" }} />
                  </motion.button>
                </div>
                <p className="text-xs mt-1" style={{ color: "hsl(var(--chalk) / 0.4)" }}>
                  {getTranslation(currentTarget)}
                </p>
              </motion.div>
            )}

            <ChildFigure
              highlightedPart={highlightedPart}
              correctParts={correctParts}
              wrongPart={wrongPart}
              onPartClick={handlePartClick}
              mode={mode}
              targetPart={currentTarget?.id || null}
            />
          </div>

          {/* Info panel (explore mode) */}
          {mode === "explore" && (
            <div className="w-full lg:w-72 shrink-0">
              <AnimatePresence mode="wait">
                {selectedInfo ? (
                  <motion.div
                    key={selectedInfo.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="rounded-2xl p-5 text-center"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--sky) / 0.12), hsl(var(--grass) / 0.08))",
                      border: "2px solid hsl(var(--sky) / 0.2)",
                    }}
                  >
                    <div className="text-5xl mb-3">{selectedInfo.emoji}</div>
                    <h3 className="text-2xl font-extrabold mb-1" style={{ color: "hsl(var(--chalk))", fontFamily: "'Baloo 2', cursive" }}>
                      {selectedInfo.english}
                    </h3>
                    <div className="space-y-1 mt-3">
                      <p className="text-sm" style={{ color: "hsl(var(--chalk) / 0.7)" }} dir="rtl">🇮🇱 {selectedInfo.hebrew}</p>
                      <p className="text-sm" style={{ color: "hsl(var(--chalk) / 0.7)" }} dir="rtl">🇸🇦 {selectedInfo.arabic}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => speakEnglish(selectedInfo.english)}
                      className="mt-4 px-6 py-2 rounded-full flex items-center justify-center gap-2 mx-auto"
                      style={{
                        background: "var(--gradient-grass)",
                        color: "hsl(var(--primary-foreground))",
                        boxShadow: "0 4px 15px hsl(var(--grass) / 0.3)",
                      }}
                    >
                      <Volume2 size={18} />
                      {lang === "he" ? "השמע" : lang === "ar" ? "استمع" : "Listen"}
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-2xl p-5 text-center"
                    style={{
                      background: "hsl(var(--board) / 0.3)",
                      border: "2px dashed hsl(var(--chalk) / 0.1)",
                    }}
                  >
                    <div className="text-4xl mb-3">👆</div>
                    <p className="text-sm" style={{ color: "hsl(var(--chalk) / 0.5)" }}>
                      {lang === "he"
                        ? "לחץ על חלק גוף כדי ללמוד את שמו"
                        : lang === "ar"
                          ? "انقر على جزء من الجسم لتعلم اسمه"
                          : "Tap a body part to learn its name"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Body parts list */}
              <div className="mt-4 max-h-64 overflow-y-auto rounded-xl p-2 space-y-1"
                style={{ background: "hsl(var(--board) / 0.2)" }}
              >
                {bodyHotspots.map((part) => (
                  <motion.button
                    key={part.id}
                    whileHover={{ x: 4 }}
                    onClick={() => handleExploreClick(part)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-all text-sm"
                    style={{
                      background: highlightedPart === part.id ? "hsl(var(--sky) / 0.15)" : "transparent",
                      color: "hsl(var(--chalk) / 0.8)",
                    }}
                  >
                    <span>{part.emoji}</span>
                    <span className="font-medium">{part.english}</span>
                    <span className="ml-auto text-xs" style={{ color: "hsl(var(--chalk) / 0.4)" }}>
                      {getTranslation(part)}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Results panel (quiz finished) */}
          {mode === "quiz" && isFinished && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full lg:w-72 shrink-0 rounded-2xl p-6 text-center"
              style={{
                background: "linear-gradient(135deg, hsl(var(--grass) / 0.12), hsl(var(--sky) / 0.08))",
                border: "2px solid hsl(var(--grass) / 0.3)",
              }}
            >
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: "hsl(var(--chalk))" }}>
                {lang === "he" ? "כל הכבוד!" : lang === "ar" ? "أحسنت!" : "Well Done!"}
              </h3>
              <p className="text-3xl font-extrabold mb-2" style={{ color: "hsl(var(--grass))" }}>
                {score}/{TOTAL_ROUNDS}
              </p>
              <div className="mb-4">
                <StarRating earned={stars} total={3} />
              </div>
              <div className="flex flex-col gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startQuiz}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{
                    background: "var(--gradient-grass)",
                    color: "hsl(var(--primary-foreground))",
                  }}
                >
                  <RotateCcw size={16} />
                  {lang === "he" ? "שחק שוב" : lang === "ar" ? "العب مرة أخرى" : "Play Again"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goExplore}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm"
                  style={{
                    background: "hsl(var(--board) / 0.5)",
                    color: "hsl(var(--chalk))",
                    border: "1px solid hsl(var(--chalk) / 0.15)",
                  }}
                >
                  🔍 {lang === "he" ? "חזור לחקור" : lang === "ar" ? "عد للاستكشاف" : "Back to Explore"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </GameSceneShell>
  );
};

export default BodyPartsGame;
