import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Volume2, VolumeX, Music, Music2 } from "lucide-react";
import { Language } from "@/lib/i18n";
import Interactive3DMascot from "@/components/Interactive3DMascot";
import {
  isSoundEnabled, setSoundEnabled,
  isMusicEnabled, setMusicEnabled,
  playWelcomeChime, playSelectSound, playClickSound,
  startBgMusic, stopBgMusic,
} from "@/lib/sounds";

const ONBOARDING_KEY = "english-fun-onboarded";

export const hasCompletedOnboarding = (): boolean => {
  return localStorage.getItem(ONBOARDING_KEY) === "true";
};

const markOnboarded = () => {
  localStorage.setItem(ONBOARDING_KEY, "true");
};

const languages: { code: Language; flag: string; name: string; subtitle: string; gradient: string }[] = [
  { code: "ar", flag: "🇸🇦", name: "العربية", subtitle: "تعلم الإنجليزية بالعربية", gradient: "linear-gradient(135deg, hsl(var(--grass)), hsl(var(--grass) / 0.7))" },
  { code: "he", flag: "🇮🇱", name: "עברית", subtitle: "למד אנגלית בעברית", gradient: "linear-gradient(135deg, hsl(var(--sky)), hsl(var(--sky) / 0.7))" },
  { code: "en", flag: "🇬🇧", name: "English", subtitle: "Learn English in English", gradient: "var(--gradient-hero)" },
];

interface WelcomeScreenProps {
  onComplete: (lang: Language) => void;
}

/* ───── Cinematic light streaks ───── */
const LightStreak = ({ delay, angle, length }: { delay: number; angle: number; length: number }) => (
  <motion.div
    className="absolute left-1/2 top-1/2 origin-left pointer-events-none"
    style={{
      width: length,
      height: 1,
      background: `linear-gradient(90deg, transparent, hsl(var(--primary) / 0.15), transparent)`,
      transform: `rotate(${angle}deg)`,
      filter: "blur(1px)",
    }}
    initial={{ opacity: 0, scaleX: 0 }}
    animate={{ opacity: [0, 0.6, 0], scaleX: [0, 1, 0.5] }}
    transition={{ duration: 3, delay, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
  />
);

/* ───── Floating sparkle ───── */
const Sparkle = ({ delay, x, y }: { delay: number; x: string; y: string }) => (
  <motion.div
    className="absolute w-1 h-1 rounded-full bg-primary/30 pointer-events-none"
    style={{ left: x, top: y, boxShadow: "0 0 6px hsl(var(--primary) / 0.3)" }}
    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5], y: [0, -30, -60] }}
    transition={{ duration: 3, delay, repeat: Infinity, repeatDelay: Math.random() * 3 }}
  />
);

const WelcomeScreen = ({ onComplete }: WelcomeScreenProps) => {
  const [soundOn, setSoundOn] = useState(isSoundEnabled);
  const [musicOn, setMusicOn] = useState(isMusicEnabled);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    playWelcomeChime();
    if (isMusicEnabled()) startBgMusic();
    const timer = setTimeout(() => setEntered(true), 300);
    return () => { stopBgMusic(); clearTimeout(timer); };
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playClickSound();
  };

  const toggleMusic = () => {
    const next = !musicOn;
    setMusicOn(next);
    setMusicEnabled(next);
    if (next) startBgMusic(); else stopBgMusic();
  };

  const handleSelect = (lang: Language) => {
    playSelectSound();
    stopBgMusic();
    markOnboarded();
    onComplete(lang);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center relative overflow-hidden">
      {/* ── Layered background ── */}
      <div className="absolute inset-0" style={{ background: "hsl(var(--background))" }} />
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 30%, hsl(var(--primary) / 0.06) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 20% 80%, hsl(var(--sky) / 0.05) 0%, transparent 50%),
            radial-gradient(ellipse 50% 60% at 85% 60%, hsl(var(--candy) / 0.04) 0%, transparent 50%)
          `,
        }}
      />

      {/* Light streaks */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <LightStreak key={angle} angle={angle} length={300 + Math.random() * 200} delay={i * 0.4} />
      ))}

      {/* Floating sparkles */}
      {Array.from({ length: 15 }, (_, i) => (
        <Sparkle key={i} delay={i * 0.5} x={`${10 + Math.random() * 80}%`} y={`${10 + Math.random() * 80}%`} />
      ))}

      {/* Sound/Music toggles */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="fixed top-4 end-4 z-20 flex gap-2"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSound}
          className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xl border transition-colors ${
            soundOn
              ? "bg-primary/15 border-primary/30 text-primary"
              : "bg-muted/60 border-border/50 text-muted-foreground"
          }`}
        >
          {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMusic}
          className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xl border transition-colors ${
            musicOn
              ? "bg-accent/15 border-accent/30 text-accent"
              : "bg-muted/60 border-border/50 text-muted-foreground"
          }`}
        >
          {musicOn ? (
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: Infinity }}>
              <Music className="w-5 h-5" />
            </motion.div>
          ) : (
            <Music2 className="w-5 h-5" />
          )}
        </motion.button>
      </motion.div>

      {/* ── Main content ── */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.15 }}
        className="max-w-md w-full text-center relative z-10 px-4"
      >
        {/* Owl mascot with cinematic entrance */}
        <motion.div
          className="relative mx-auto mb-4 flex justify-center"
          initial={{ y: -80, opacity: 0, scale: 0.4 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }}
        >
          {/* Spotlight glow */}
          <motion.div
            className="absolute w-[200%] h-[120%] -left-[50%] -top-[10%] pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 60%, hsl(var(--primary) / 0.08), transparent 55%)",
              filter: "blur(20px)",
            }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <Interactive3DMascot mood="wave" size="lg" />
        </motion.div>

        {/* Title with staggered letter animation */}
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-display font-extrabold mb-3"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--candy)), hsl(var(--lavender)))",
            backgroundSize: "300% 300%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "aurora 6s ease-in-out infinite",
          }}
        >
          English Fun
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-muted-foreground font-body text-lg mb-1"
        >
          🌟 Learn English the fun way! 🌟
        </motion.p>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-muted-foreground/60 font-body text-sm mb-8"
        >
          اختر لغتك • בחר שפה • Choose your language
        </motion.p>

        {/* Language buttons with staggered spring entrance */}
        <div className="space-y-3">
          {languages.map((lang, i) => (
            <motion.button
              key={lang.code}
              initial={{ x: i % 2 === 0 ? -60 : 60, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              transition={{
                delay: 1.0 + i * 0.15,
                type: "spring",
                stiffness: 180,
                damping: 16,
              }}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(lang.code)}
              className="w-full card-kid flex items-center gap-4 px-6 py-5 text-start group relative overflow-hidden"
            >
              {/* Hover shimmer effect */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.05), transparent)",
                }}
              />
              <motion.div
                className="w-14 h-14 rounded-3xl flex items-center justify-center text-3xl shadow-lg shrink-0"
                style={{ background: lang.gradient }}
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                {lang.flag}
              </motion.div>
              <div className="flex-1">
                <p className="font-display text-xl font-bold text-foreground">{lang.name}</p>
                <p className="font-body text-sm text-muted-foreground">{lang.subtitle}</p>
              </div>
              <motion.span
                className="text-xl text-muted-foreground group-hover:text-primary transition-colors"
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              >
                →
              </motion.span>
            </motion.button>
          ))}
        </div>

        {/* Animated game icons with bounce-in */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="mt-10 flex justify-center gap-4"
        >
          {[
            { emoji: "🔤", color: "bg-sky/15" },
            { emoji: "🎯", color: "bg-primary/15" },
            { emoji: "🧩", color: "bg-accent/15" },
            { emoji: "🐝", color: "bg-sunshine/15" },
            { emoji: "🎭", color: "bg-candy/15" },
          ].map((item, i) => (
            <motion.div
              key={item.emoji}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 250,
                damping: 12,
                delay: 1.7 + i * 0.1,
              }}
              className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center text-2xl backdrop-blur-sm`}
              style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" }}
            >
              <motion.span
                animate={{ y: [0, -6, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
              >
                {item.emoji}
              </motion.span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
