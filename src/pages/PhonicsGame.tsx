import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, ChevronLeft, ChevronRight, CheckCircle2, Star } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { alphabet, getWordLocal } from "@/data/learningData";
import { speakEnglish, playCorrectSound, playLetterPopSound } from "@/lib/sounds";
import { addCompletedLetter, getProgress } from "@/lib/progress";
import { dispatchCharacterEvent } from "@/lib/characterStore";
import CharacterProxy from "@/components/character/CharacterProxy";
import GameShell from "@/components/GameShell";

// ─── Colors cycling through cards ────────────────────────────────────────────

const CARD_COLORS = [
  { bg: "bg-sky-100",    border: "border-sky-300",    text: "text-sky-700",    active: "bg-sky-400"    },
  { bg: "bg-rose-100",   border: "border-rose-300",   text: "text-rose-700",   active: "bg-rose-400"   },
  { bg: "bg-emerald-100",border: "border-emerald-300",text: "text-emerald-700",active: "bg-emerald-400"},
  { bg: "bg-violet-100", border: "border-violet-300", text: "text-violet-700", active: "bg-violet-400" },
  { bg: "bg-amber-100",  border: "border-amber-300",  text: "text-amber-700",  active: "bg-amber-400"  },
  { bg: "bg-fuchsia-100",border: "border-fuchsia-300",text: "text-fuchsia-700",active: "bg-fuchsia-400"},
  { bg: "bg-cyan-100",   border: "border-cyan-300",   text: "text-cyan-700",   active: "bg-cyan-400"   },
];

// Phoneme tips per letter (A-Z)
const PHONEME_TIPS: Record<string, { sound: string; example: string }> = {
  A: { sound: "/æ/", example: "🍎 Apple" },
  B: { sound: "/b/", example: "⚽ Ball" },
  C: { sound: "/k/", example: "🐱 Cat" },
  D: { sound: "/d/", example: "🐶 Dog" },
  E: { sound: "/ɛ/", example: "🥚 Egg" },
  F: { sound: "/f/", example: "🐟 Fish" },
  G: { sound: "/ɡ/", example: "🍇 Grape" },
  H: { sound: "/h/", example: "🎩 Hat" },
  I: { sound: "/aɪ/", example: "🧊 Ice" },
  J: { sound: "/dʒ/", example: "🧃 Juice" },
  K: { sound: "/k/", example: "🪁 Kite" },
  L: { sound: "/l/", example: "🦁 Lion" },
  M: { sound: "/m/", example: "🌙 Moon" },
  N: { sound: "/n/", example: "🪹 Nest" },
  O: { sound: "/ɒ/", example: "🍊 Orange" },
  P: { sound: "/p/", example: "🖊️ Pen" },
  Q: { sound: "/kw/", example: "👑 Queen" },
  R: { sound: "/r/", example: "🌧️ Rain" },
  S: { sound: "/s/", example: "☀️ Sun" },
  T: { sound: "/t/", example: "🌳 Tree" },
  U: { sound: "/ʌ/", example: "☂️ Umbrella" },
  V: { sound: "/v/", example: "🎻 Violin" },
  W: { sound: "/w/", example: "💧 Water" },
  X: { sound: "/z/", example: "🎵 Xylophone" },
  Y: { sound: "/j/", example: "💛 Yellow" },
  Z: { sound: "/z/", example: "🦓 Zebra" },
};

// ─── Trace boxes component ────────────────────────────────────────────────────

interface TraceBoxesProps {
  targetLetter: string;
  onAllCorrect: () => void;
}

function TraceBoxes({ targetLetter, onAllCorrect }: TraceBoxesProps) {
  const [values, setValues] = useState(["", "", ""]);
  const [correct, setCorrect] = useState([false, false, false]);

  const handleChange = (i: number, val: string) => {
    const ch = val.slice(-1).toUpperCase();
    const newValues = [...values];
    newValues[i] = ch;
    setValues(newValues);

    const newCorrect = [...correct];
    if (ch === targetLetter.toUpperCase()) {
      newCorrect[i] = true;
      playCorrectSound();
      dispatchCharacterEvent({ type: "correct" });
    } else {
      newCorrect[i] = false;
    }
    setCorrect(newCorrect);

    if (newCorrect.every(Boolean)) {
      onAllCorrect();
    }
  };

  // Reset on letter change
  useEffect(() => {
    setValues(["", "", ""]);
    setCorrect([false, false, false]);
  }, [targetLetter]);

  return (
    <div className="flex gap-3 justify-center my-3">
      {[0, 1, 2].map((i) => (
        <motion.input
          key={i}
          animate={correct[i] ? { scale: [1, 1.2, 1], backgroundColor: ["#fff", "#bbf7d0", "#fff"] } : {}}
          type="text"
          maxLength={1}
          value={values[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          className={`w-14 h-14 text-center text-2xl font-extrabold rounded-xl border-2 border-dashed outline-none transition-colors
            ${correct[i] ? "border-emerald-400 text-emerald-600 bg-emerald-50" : "border-gray-300 text-gray-700 bg-white"}
            focus:border-indigo-400`}
          placeholder={targetLetter.toLowerCase()}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PhonicsGame() {
  const navigate = useNavigate();
  const { lang, dir } = useLanguage();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [learnedLetters, setLearnedLetters] = useState<string[]>(
    () => getProgress().completedLetters
  );
  const [traceComplete, setTraceComplete] = useState(false);

  const selectedLetter = selectedIndex !== null ? alphabet[selectedIndex] : null;
  const tip = selectedLetter ? PHONEME_TIPS[selectedLetter.letter] : null;

  // Labels
  const hearLabel   = { he: "🔊 שמע!", ar: "🔊 اسمع!", en: "🔊 Hear it!" }[lang];
  const traceLabel  = { he: "🔤 עקוב", ar: "🔤 تتبع", en: "🔤 Trace it" }[lang];
  const markLabel   = { he: "✅ סמן כנלמד", ar: "✅ علّم كمتعلَّم", en: "✅ Mark as Learned" }[lang];
  const progressLabel = { he: "אותיות נלמדו", ar: "حروف تعلمتها", en: "letters learned" }[lang];
  const backLabel   = { he: "← חזור לרשימה", ar: "← عودة للقائمة", en: "← Back to Grid" }[lang];

  const handleLetterClick = useCallback((index: number) => {
    playLetterPopSound(index % 12);
    setSelectedIndex(index);
    setTraceComplete(false);
    setTimeout(() => speakEnglish(alphabet[index].letter), 250);
  }, []);

  const handleHear = () => {
    if (!selectedLetter) return;
    speakEnglish(selectedLetter.word);
    setTimeout(() => speakEnglish(`${selectedLetter.letter} is for ${selectedLetter.word}`), 900);
  };

  const handleMarkLearned = () => {
    if (!selectedLetter) return;
    const updated = addCompletedLetter(selectedLetter.letter);
    setLearnedLetters([...updated.completedLetters]);
    dispatchCharacterEvent({ type: "celebrate" });
    window.dispatchEvent(new CustomEvent("celebrate"));
  };

  const handlePrev = () => {
    if (selectedIndex === null) return;
    const next = (selectedIndex - 1 + alphabet.length) % alphabet.length;
    handleLetterClick(next);
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    const next = (selectedIndex + 1) % alphabet.length;
    handleLetterClick(next);
  };

  const isLearned = (letter: string) => learnedLetters.includes(letter);

  return (
    <GameShell
      title="🔤 Phonics"
      totalSteps={26}
      currentStep={learnedLetters.length}
      characterMood={selectedIndex !== null ? "wave" : "idle"}
      onQuit={() => navigate(-1)}
    >
      <div dir={dir} className="pb-10 max-w-2xl mx-auto px-3">

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex justify-between text-sm font-semibold text-gray-600 mb-1">
            <span>
              {learnedLetters.length} / 26 {progressLabel}
            </span>
            <span className="flex items-center gap-1 text-amber-500">
              <Star size={14} fill="currentColor" />
              {learnedLetters.length}
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-400 to-sky-400 rounded-full"
              animate={{ width: `${(learnedLetters.length / 26) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Letter Detail View */}
        <AnimatePresence mode="wait">
          {selectedLetter && (
            <motion.div
              key={selectedLetter.letter}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.25 }}
              className="mb-6 bg-white rounded-3xl shadow-xl overflow-hidden border border-indigo-100"
            >
              {/* Top bar */}
              <div className="bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-3 flex items-center justify-between">
                <button onClick={handlePrev} className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition">
                  <ChevronLeft size={20} />
                </button>
                <motion.span
                  key={selectedLetter.letter}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="text-6xl font-extrabold text-white drop-shadow-lg"
                >
                  {selectedLetter.letter}
                </motion.span>
                <button onClick={handleNext} className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition">
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Word + emoji + translation */}
                <div className="text-center">
                  <span className="text-5xl">{selectedLetter.emoji}</span>
                  <p className="text-2xl font-extrabold text-gray-800 mt-1">{selectedLetter.word}</p>
                  <p className="text-lg text-indigo-500 font-semibold">
                    {getWordLocal(selectedLetter, lang)}
                  </p>
                </div>

                {/* Hear button */}
                <button
                  onClick={handleHear}
                  className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-bold py-3 rounded-2xl text-base transition-all shadow"
                >
                  <Volume2 size={20} />
                  {hearLabel}
                </button>

                {/* Trace boxes */}
                <div>
                  <p className="text-center text-sm font-semibold text-gray-500 mb-1">{traceLabel}</p>
                  <TraceBoxes
                    targetLetter={selectedLetter.letter}
                    onAllCorrect={() => setTraceComplete(true)}
                  />
                  <AnimatePresence>
                    {traceComplete && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-center text-emerald-600 font-bold text-sm"
                      >
                        🎉 {selectedLetter.letter} {selectedLetter.letter} {selectedLetter.letter} — Perfect!
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mark as learned */}
                <button
                  onClick={handleMarkLearned}
                  disabled={isLearned(selectedLetter.letter)}
                  className={`w-full flex items-center justify-center gap-2 font-bold py-3 rounded-2xl text-base transition-all shadow
                    ${isLearned(selectedLetter.letter)
                      ? "bg-emerald-100 text-emerald-600 cursor-default"
                      : "bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white"}`}
                >
                  <CheckCircle2 size={20} />
                  {isLearned(selectedLetter.letter)
                    ? `✅ ${{ he: "נלמד!", ar: "تعلمت!", en: "Learned!" }[lang]}`
                    : markLabel}
                </button>

                {/* Phonics tip speech bubble */}
                {tip && (
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-3">
                    <div className="shrink-0 w-12">
                      <CharacterProxy mood="think" size="sm" />
                    </div>
                    <div className="text-sm text-amber-800 font-medium leading-snug">
                      <span className="font-extrabold text-amber-600">{selectedLetter.letter}</span>
                      {" "}{
                        { he: "נשמע כמו", ar: "يُنطق", en: "says" }[lang]
                      }{" "}
                      <span className="font-extrabold text-amber-700">{tip.sound}</span>
                      {" "}
                      {lang === "en" ? "like in" : lang === "he" ? "כמו ב-" : "كما في"}{" "}
                      {tip.example}
                    </div>
                  </div>
                )}

                {/* Back link */}
                <button
                  onClick={() => setSelectedIndex(null)}
                  className="w-full text-indigo-400 hover:text-indigo-600 text-sm font-semibold py-1 transition-colors"
                >
                  {backLabel}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Letter Grid */}
        <div className="grid grid-cols-5 gap-2">
          {alphabet.map((item, index) => {
            const color = CARD_COLORS[index % CARD_COLORS.length];
            const learned = isLearned(item.letter);
            return (
              <motion.button
                key={item.letter}
                whileTap={{ scale: 0.88 }}
                whileHover={{ scale: 1.06 }}
                onClick={() => handleLetterClick(index)}
                className={`relative flex flex-col items-center justify-center rounded-2xl p-2 border-2 transition-all
                  ${learned
                    ? "bg-emerald-100 border-emerald-400"
                    : `${color.bg} ${color.border}`}
                  ${selectedIndex === index ? "ring-2 ring-indigo-400 ring-offset-1" : ""}`}
                style={{ minHeight: 72 }}
              >
                <span className={`text-2xl font-extrabold ${learned ? "text-emerald-600" : color.text}`}>
                  {item.letter}
                </span>
                <span className="text-lg">{item.emoji}</span>
                {learned && (
                  <span className="absolute top-0.5 right-0.5 text-emerald-500 text-xs">
                    ✓
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
}
