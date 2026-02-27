import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CharacterProxy from "@/components/character/CharacterProxy";
import Confetti from "@/components/Confetti";
import { useLanguage } from "@/lib/i18n";
import { dispatchCharacterEvent } from "@/lib/characterStore";
import { speakEnglish, playCorrectSound, playVictoryFanfare, playClickSound } from "@/lib/sounds";
import { updateDailyProgress } from "@/lib/xp";
import { useNavigate } from "react-router-dom";

// ─── TPR Commands ───────────────────────────────────────────────────────────
const TPR_COMMANDS = [
  { id: "tpr1",  command: "Clap your hands!",    emoji: "👏", animation: "clap",       color: "#FF6B6B" },
  { id: "tpr2",  command: "Touch your head!",    emoji: "👆", animation: "touch_head", color: "#4ECDC4" },
  { id: "tpr3",  command: "Jump!",               emoji: "🦘", animation: "jump",       color: "#45B7D1" },
  { id: "tpr4",  command: "Stand up!",           emoji: "⬆️", animation: "stand",      color: "#96CEB4" },
  { id: "tpr5",  command: "Sit down!",           emoji: "⬇️", animation: "sit",        color: "#FFEAA7" },
  { id: "tpr6",  command: "Wave hello!",         emoji: "👋", animation: "wave",       color: "#DDA0DD" },
  { id: "tpr7",  command: "Touch your nose!",    emoji: "👃", animation: "touch_nose", color: "#98D8C8" },
  { id: "tpr8",  command: "Spin around!",        emoji: "🌀", animation: "spin",       color: "#F7DC6F" },
  { id: "tpr9",  command: "Touch your ears!",    emoji: "👂", animation: "touch_ears", color: "#AED6F1" },
  { id: "tpr10", command: "Open your mouth!",    emoji: "😮", animation: "open_mouth", color: "#FAD7A0" },
  { id: "tpr11", command: "Touch your feet!",    emoji: "🦶", animation: "touch_feet", color: "#A9CCE3" },
  { id: "tpr12", command: "Big smile!",          emoji: "😄", animation: "smile",      color: "#F9E79F" },
] as const;

type SpeedKey = "slow" | "normal" | "fast";
const SPEED_MS: Record<SpeedKey, number> = { slow: 6000, normal: 4000, fast: 2500 };
const SPEED_LABELS: Record<SpeedKey, string> = { slow: "🐢 Slow", normal: "🏃 Normal", fast: "🐇 Fast" };

// Translation map for command text (Hebrew & Arabic)
const CMD_TRANSLATIONS: Record<string, { he: string; ar: string }> = {
  "Clap your hands!":  { he: "מחא כפיים!", ar: "صفق بيديك!" },
  "Touch your head!":  { he: "גע בראש שלך!", ar: "المس رأسك!" },
  "Jump!":             { he: "קפוץ!", ar: "اقفز!" },
  "Stand up!":         { he: "קום!", ar: "قف!" },
  "Sit down!":         { he: "שב!", ar: "اجلس!" },
  "Wave hello!":       { he: "נפנף שלום!", ar: "لوّح بالتحية!" },
  "Touch your nose!":  { he: "גע באף שלך!", ar: "المس أنفك!" },
  "Spin around!":      { he: "הסתובב!", ar: "دُر حول نفسك!" },
  "Touch your ears!":  { he: "גע באוזניים שלך!", ar: "المس أذنيك!" },
  "Open your mouth!":  { he: "פתח פה!", ar: "افتح فمك!" },
  "Touch your feet!":  { he: "גע ברגליים שלך!", ar: "المس قدميك!" },
  "Big smile!":        { he: "חיוך גדול!", ar: "ابتسامة كبيرة!" },
};

export default function TPRPage() {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [autoPlay, setAutoPlay] = useState(false);
  const [speed, setSpeed] = useState<SpeedKey>("normal");
  const [countdown, setCountdown] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [finished, setFinished] = useState(false);
  const [emojiKey, setEmojiKey] = useState(0); // remount to re-trigger emoji animation

  const autoPlayRef = useRef(autoPlay);
  const speedRef = useRef(speed);
  autoPlayRef.current = autoPlay;
  speedRef.current = speed;

  const current = TPR_COMMANDS[currentIdx];

  // Speak + dispatch when command changes
  useEffect(() => {
    speakEnglish(current.command);
    dispatchCharacterEvent({ type: "wave" });
    setEmojiKey((k) => k + 1);
  }, [currentIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-play countdown
  useEffect(() => {
    if (!autoPlay) { setCountdown(0); return; }
    const ms = SPEED_MS[speed];
    setCountdown(ms / 1000);
    const step = 100;
    let remaining = ms;
    const interval = setInterval(() => {
      remaining -= step;
      setCountdown(Math.ceil(remaining / 1000));
      if (remaining <= 0) {
        clearInterval(interval);
        if (autoPlayRef.current) goNext();
      }
    }, step);
    return () => clearInterval(interval);
  }, [autoPlay, currentIdx, speed]); // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = useCallback(() => {
    setCurrentIdx((prev) => {
      const next = (prev + 1) % TPR_COMMANDS.length;
      return next;
    });
  }, []);

  const goPrev = () => {
    playClickSound();
    setCurrentIdx((prev) => (prev - 1 + TPR_COMMANDS.length) % TPR_COMMANDS.length);
  };

  const handleNext = () => {
    playClickSound();
    goNext();
  };

  const handleHear = () => {
    speakEnglish(current.command);
  };

  const handleDone = () => {
    playCorrectSound();
    dispatchCharacterEvent({ type: "correct" });
    updateDailyProgress("tpr");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
    const newDone = new Set(done);
    newDone.add(current.id);
    setDone(newDone);
    if (newDone.size === TPR_COMMANDS.length) {
      playVictoryFanfare();
      dispatchCharacterEvent({ type: "celebrate" });
      setFinished(true);
    }
  };

  const getTranslation = (cmd: string) => {
    if (lang === "en") return cmd;
    return CMD_TRANSLATIONS[cmd]?.[lang] ?? cmd;
  };

  // Progress dots
  const ProgressDots = () => (
    <div className="flex gap-2 justify-center flex-wrap max-w-xs mx-auto">
      {TPR_COMMANDS.map((c, i) => (
        <motion.div
          key={c.id}
          animate={{ scale: i === currentIdx ? 1.4 : 1 }}
          className={`w-4 h-4 rounded-full transition-colors duration-300 ${
            done.has(c.id) ? "bg-green-400" : i === currentIdx ? "bg-white" : "bg-white/40"
          }`}
        />
      ))}
    </div>
  );

  // Countdown ring
  const CountdownRing = ({ seconds, total }: { seconds: number; total: number }) => {
    const r = 22;
    const circ = 2 * Math.PI * r;
    const progress = total > 0 ? (seconds / total) * circ : 0;
    return (
      <svg width="60" height="60" className="rotate-[-90deg]">
        <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="5" />
        <circle cx="30" cy="30" r={r} fill="none" stroke="white" strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={circ - progress}
          style={{ transition: "stroke-dashoffset 0.1s linear" }}
        />
      </svg>
    );
  };

  // ─── Finished Screen ────────────────────────────────────────────────────
  if (finished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-gradient-to-br from-pink-100 to-yellow-100">
        <Confetti show={true} />
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="text-8xl">🎉</motion.div>
        <h2 className="text-3xl font-bold text-pink-600 text-center">Amazing! You did all 12 commands!</h2>
        <div className="flex gap-4 mt-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { setDone(new Set()); setFinished(false); setCurrentIdx(0); }}
            className="bg-pink-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg text-xl min-h-[80px]"
          >
            🔄 Play Again
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="bg-gray-300 text-gray-700 font-bold py-4 px-8 rounded-2xl shadow-lg text-xl min-h-[80px]"
          >
            🏠 Home
          </motion.button>
        </div>
      </div>
    );
  }

  const totalSecs = SPEED_MS[speed] / 1000;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: current.color }}>
      <Confetti show={showConfetti} />

      {/* Top bar */}
      <div className="flex items-center justify-between p-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/")}
          className="bg-white/30 text-white font-bold py-2 px-4 rounded-xl text-sm min-h-[44px]"
        >
          ← Home
        </motion.button>
        <ProgressDots />
        <div className="w-20" /> {/* spacer */}
      </div>

      {/* Main card */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-4 gap-4">
        {/* Emoji */}
        <AnimatePresence mode="wait">
          <motion.div
            key={emojiKey}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            style={{ fontSize: 160, lineHeight: 1 }}
            className="select-none"
          >
            {current.emoji}
          </motion.div>
        </AnimatePresence>

        {/* Command text */}
        <motion.h1
          key={current.id + "-text"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold text-white text-center drop-shadow-lg"
        >
          {current.command}
        </motion.h1>

        {/* Translation */}
        {lang !== "en" && (
          <motion.p
            key={current.id + "-trans"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl text-white/90 text-center font-semibold"
          >
            {getTranslation(current.command)}
          </motion.p>
        )}

        {/* Character corner */}
        <div className="absolute bottom-32 right-4 opacity-80 pointer-events-none">
          <CharacterProxy mood="wave" size="sm" />
        </div>

        {/* Done button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleDone}
          className="bg-white text-green-600 font-extrabold py-5 px-10 rounded-3xl shadow-xl text-2xl min-h-[80px] mt-2"
          style={{ color: current.color }}
        >
          {done.has(current.id) ? "✅ Done!" : "👍 I Did It!"}
        </motion.button>
      </div>

      {/* Bottom controls */}
      <div className="bg-black/20 p-4 flex flex-col gap-3">
        {/* Speed + auto-play */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Speed selector */}
          <div className="flex gap-1">
            {(["slow", "normal", "fast"] as SpeedKey[]).map((s) => (
              <button
                key={s}
                onClick={() => { playClickSound(); setSpeed(s); }}
                className={`py-2 px-3 rounded-xl font-bold text-sm min-h-[44px] ${
                  speed === s ? "bg-white text-gray-800" : "bg-white/30 text-white"
                }`}
              >
                {SPEED_LABELS[s]}
              </button>
            ))}
          </div>
          {/* Auto-play toggle */}
          <button
            onClick={() => { playClickSound(); setAutoPlay((v) => !v); }}
            className={`py-2 px-4 rounded-xl font-bold text-sm min-h-[44px] flex items-center gap-2 ${
              autoPlay ? "bg-white text-gray-800" : "bg-white/30 text-white"
            }`}
          >
            {autoPlay ? (
              <>
                <CountdownRing seconds={countdown} total={totalSecs} />
                <span>Auto: ON</span>
              </>
            ) : (
              <span>⏸ Auto: OFF</span>
            )}
          </button>
        </div>

        {/* Navigation + hear */}
        <div className="flex gap-3 justify-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={goPrev}
            className="bg-white/30 text-white font-bold py-3 px-6 rounded-2xl text-xl min-h-[60px]"
          >
            ← Prev
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleHear}
            className="bg-white/50 text-white font-bold py-3 px-6 rounded-2xl text-xl min-h-[60px]"
          >
            🔊 Hear it!
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleNext}
            className="bg-white/30 text-white font-bold py-3 px-6 rounded-2xl text-xl min-h-[60px]"
          >
            Next →
          </motion.button>
        </div>
      </div>
    </div>
  );
}
