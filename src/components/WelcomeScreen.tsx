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

const languages: { code: Language; flag: string; name: string; subtitle: string; color: string }[] = [
  { code: "ar", flag: "🇸🇦", name: "العربية", subtitle: "تعلم الإنجليزية بالعربية", color: "var(--gradient-grass)" },
  { code: "he", flag: "🇮🇱", name: "עברית", subtitle: "למד אנגלית בעברית", color: "var(--gradient-sky)" },
  { code: "en", flag: "🇬🇧", name: "English", subtitle: "Learn English in English", color: "var(--gradient-hero)" },
];

interface WelcomeScreenProps {
  onComplete: (lang: Language) => void;
}

const FloatingShape = ({ delay, x, y, size, color }: { delay: number; x: string; y: string; size: number; color: string }) => (
  <motion.div
    className="absolute opacity-[0.06]"
    style={{ 
      left: x, top: y, width: size, height: size, background: color,
      borderRadius: "40% 60% 55% 45% / 50% 40% 60% 50%",
    }}
    animate={{ 
      y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.15, 1],
      borderRadius: [
        "40% 60% 55% 45% / 50% 40% 60% 50%",
        "55% 45% 40% 60% / 45% 55% 45% 55%",
        "40% 60% 55% 45% / 50% 40% 60% 50%",
      ],
    }}
    transition={{ duration: 8 + delay, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

const WelcomeScreen = ({ onComplete }: WelcomeScreenProps) => {
  const [soundOn, setSoundOn] = useState(isSoundEnabled);
  const [musicOn, setMusicOn] = useState(isMusicEnabled);

  useEffect(() => {
    playWelcomeChime();
    if (isMusicEnabled()) startBgMusic();
    return () => stopBgMusic();
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
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute inset-0" style={{ background: "var(--gradient-mesh)" }} />
      <FloatingShape delay={0} x="10%" y="20%" size={250} color="hsl(25, 95%, 55%)" />
      <FloatingShape delay={2} x="70%" y="10%" size={200} color="hsl(195, 85%, 55%)" />
      <FloatingShape delay={4} x="80%" y="70%" size={220} color="hsl(145, 65%, 48%)" />
      <FloatingShape delay={1} x="20%" y="75%" size={160} color="hsl(330, 85%, 60%)" />
      <FloatingShape delay={3} x="50%" y="50%" size={140} color="hsl(270, 70%, 65%)" />

      {/* Sound/Music toggles */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
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

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="max-w-md w-full text-center relative z-10 px-4"
      >
        {/* SVG Owl mascot - no image, no white box */}
        <div className="relative mx-auto mb-6 flex justify-center">
          <Interactive3DMascot mood="wave" size="lg" />
        </div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
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
          transition={{ delay: 0.3 }}
          className="text-muted-foreground font-body text-lg mb-1"
        >
          🌟 Learn English the fun way! 🌟
        </motion.p>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground/60 font-body text-sm mb-8"
        >
          اختر لغتك • בחר שפה • Choose your language
        </motion.p>

        {/* Language buttons */}
        <div className="space-y-3">
          {languages.map((lang, i) => (
            <motion.button
              key={lang.code}
              initial={{ x: i % 2 === 0 ? -40 : 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.12, type: "spring" as const, stiffness: 200 }}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(lang.code)}
              className="w-full card-kid flex items-center gap-4 px-6 py-5 text-start group"
            >
              <motion.div
                className="w-14 h-14 rounded-3xl flex items-center justify-center text-3xl shadow-lg"
                style={{ background: lang.color }}
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

        {/* Animated game icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
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
              className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center text-2xl backdrop-blur-sm`}
              animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
              style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" }}
            >
              {item.emoji}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
