import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, forwardRef } from "react";
import { Volume2, VolumeX, Music, Music2, ChevronRight } from "lucide-react";
import { Language } from "@/lib/i18n";
import Interactive3DMascot from "@/components/Interactive3DMascot";
import {
  isSoundEnabled, setSoundEnabled,
  isMusicEnabled, setMusicEnabled,
  playWelcomeChime, playSelectSound, playClickSound,
  startBgMusic, stopBgMusic,
} from "@/lib/sounds";
import { AGE_GROUPS, AVATAR_OPTIONS, saveProfile, getAgeGroup } from "@/lib/ageProfile";

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
      width: length, height: 1,
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
const Sparkle = forwardRef<HTMLDivElement, { delay: number; x: string; y: string }>(({ delay, x, y }, ref) => (
  <motion.div
    ref={ref}
    className="absolute w-1 h-1 rounded-full bg-primary/30 pointer-events-none"
    style={{ left: x, top: y, boxShadow: "0 0 6px hsl(var(--primary) / 0.3)" }}
    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5], y: [0, -30, -60] }}
    transition={{ duration: 3, delay, repeat: Infinity, repeatDelay: Math.random() * 3 }}
  />
));
Sparkle.displayName = "Sparkle";

const WelcomeScreen = ({ onComplete }: WelcomeScreenProps) => {
  const [soundOn, setSoundOn] = useState(isSoundEnabled);
  const [musicOn, setMusicOn] = useState(isMusicEnabled);
  const [step, setStep] = useState<"lang" | "age" | "avatar">("lang");
  const [selectedLang, setSelectedLang] = useState<Language | null>(null);
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState("🦉");
  const [name, setName] = useState("");

  useEffect(() => {
    playWelcomeChime();
    if (isMusicEnabled()) startBgMusic();
    return () => { stopBgMusic(); };
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

  const handleLangSelect = (lang: Language) => {
    playSelectSound();
    setSelectedLang(lang);
    setStep("age");
  };

  const handleAgeSelect = (age: number) => {
    playClickSound();
    setSelectedAge(age);
    setStep("avatar");
  };

  const handleComplete = () => {
    if (!selectedLang || selectedAge === null) return;
    playSelectSound();
    stopBgMusic();
    
    saveProfile({
      name: name || "Learner",
      age: selectedAge,
      ageGroup: getAgeGroup(selectedAge),
      avatar: selectedAvatar,
      createdAt: new Date().toISOString(),
    });
    
    markOnboarded();
    onComplete(selectedLang);
  };

  const t = (texts: Record<string, string>) => {
    if (selectedLang) return texts[selectedLang] || texts.en;
    return texts.en;
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center relative overflow-hidden">
      {/* ── Layered background ── */}
      <div className="absolute inset-0" style={{ background: "hsl(var(--background))" }} />
      <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}
        style={{ background: `radial-gradient(ellipse 80% 60% at 50% 30%, hsl(var(--primary) / 0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 20% 80%, hsl(var(--sky) / 0.05) 0%, transparent 50%), radial-gradient(ellipse 50% 60% at 85% 60%, hsl(var(--candy) / 0.04) 0%, transparent 50%)` }}
      />

      {/* Light streaks */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <LightStreak key={angle} angle={angle} length={300 + Math.random() * 200} delay={i * 0.4} />
      ))}

      {/* Sparkles */}
      {Array.from({ length: 12 }, (_, i) => (
        <Sparkle key={i} delay={i * 0.5} x={`${10 + Math.random() * 80}%`} y={`${10 + Math.random() * 80}%`} />
      ))}

      {/* Sound/Music toggles */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="fixed top-4 end-4 z-20 flex gap-2" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleSound}
          className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xl border transition-colors ${soundOn ? "bg-primary/15 border-primary/30 text-primary" : "bg-muted/60 border-border/50 text-muted-foreground"}`}>
          {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </motion.button>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleMusic}
          className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xl border transition-colors ${musicOn ? "bg-accent/15 border-accent/30 text-accent" : "bg-muted/60 border-border/50 text-muted-foreground"}`}>
          {musicOn ? <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: Infinity }}><Music className="w-5 h-5" /></motion.div> : <Music2 className="w-5 h-5" />}
        </motion.button>
      </motion.div>

      {/* ── Main content ── */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.15 }}
        className="max-w-md w-full text-center relative z-10 px-4"
      >
        {/* Owl mascot */}
        <motion.div className="relative mx-auto mb-4 flex justify-center"
          initial={{ y: -80, opacity: 0, scale: 0.4 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.3 }}>
          <motion.div className="absolute w-[200%] h-[120%] -left-[50%] -top-[10%] pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 60%, hsl(var(--primary) / 0.08), transparent 55%)", filter: "blur(20px)" }}
            animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity }} />
          <Interactive3DMascot mood={step === "avatar" ? "celebrate" : "wave"} size="lg" />
        </motion.div>

        {/* Title */}
        <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }}
          className="text-5xl md:text-7xl font-display font-extrabold mb-3"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--candy)), hsl(var(--sunshine)))", backgroundSize: "300% 300%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "aurora 6s ease-in-out infinite" }}>
          English Fun
        </motion.h1>

        <AnimatePresence mode="wait">
          {/* ── STEP 1: LANGUAGE ── */}
          {step === "lang" && (
            <motion.div key="lang" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <p className="text-muted-foreground font-body text-lg mb-1">🌟 Learn English the fun way! 🌟</p>
              <p className="text-muted-foreground/60 font-body text-sm mb-8">اختر لغتك • בחר שפה • Choose your language</p>

              <div className="space-y-3">
                {languages.map((lang, i) => (
                  <motion.button key={lang.code}
                    initial={{ x: i % 2 === 0 ? -60 : 60, opacity: 0, scale: 0.8 }}
                    animate={{ x: 0, opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.15, type: "spring", stiffness: 180, damping: 16 }}
                    whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }}
                    onClick={() => handleLangSelect(lang.code)}
                    className="w-full card-kid flex items-center gap-4 px-6 py-5 text-start group relative overflow-hidden">
                    <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.05), transparent)" }} />
                    <motion.div className="w-14 h-14 rounded-3xl flex items-center justify-center text-3xl shadow-lg shrink-0" style={{ background: lang.gradient }}
                      whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}>
                      {lang.flag}
                    </motion.div>
                    <div className="flex-1">
                      <p className="font-display text-xl font-bold text-foreground">{lang.name}</p>
                      <p className="font-body text-sm text-muted-foreground">{lang.subtitle}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: AGE GROUP ── */}
          {step === "age" && (
            <motion.div key="age" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <p className="text-muted-foreground font-body text-lg mb-6">
                {t({ he: "בחר את קבוצת הגיל שלך", ar: "اختر فئتك العمرية", en: "Select your age group" })}
              </p>

              <div className="grid grid-cols-2 gap-3">
                {AGE_GROUPS.map((group, i) => (
                  <motion.button key={group.id}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.1, type: "spring", stiffness: 200, damping: 18 }}
                    whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}
                    onClick={() => handleAgeSelect(group.id === "toddler" ? 3 : group.id === "child" ? 6 : group.id === "preteen" ? 10 : 13)}
                    className="card-kid p-4 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.06), transparent 70%)" }} />
                    <motion.span className="text-4xl block mb-2 relative" whileHover={{ scale: 1.2 }}>{group.emoji}</motion.span>
                    <p className="font-display font-bold text-sm relative">{group.label[selectedLang || "en"]}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 relative">{group.description[selectedLang || "en"]}</p>
                  </motion.button>
                ))}
              </div>

              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                onClick={() => setStep("lang")}
                className="mt-4 text-sm text-muted-foreground font-display hover:text-primary transition-colors">
                ← {t({ he: "חזרה", ar: "رجوع", en: "Back" })}
              </motion.button>
            </motion.div>
          )}

          {/* ── STEP 3: AVATAR & NAME ── */}
          {step === "avatar" && (
            <motion.div key="avatar" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <p className="text-muted-foreground font-body text-lg mb-4">
                {t({ he: "בחר את הדמות שלך", ar: "اختر شخصيتك", en: "Choose your character" })}
              </p>

              {/* Avatar grid */}
              <div className="grid grid-cols-4 gap-2 mb-5">
                {AVATAR_OPTIONS.map((avatar, i) => (
                  <motion.button key={avatar}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 + i * 0.03, type: "spring", stiffness: 300, damping: 18 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => { playClickSound(); setSelectedAvatar(avatar); }}
                    className={`h-14 rounded-xl flex items-center justify-center text-2xl transition-all ${
                      selectedAvatar === avatar
                        ? "bg-primary/15 border-2 border-primary shadow-md scale-110"
                        : "bg-muted/30 border-2 border-transparent hover:bg-muted/50"
                    }`}>
                    {avatar}
                  </motion.button>
                ))}
              </div>

              {/* Name input */}
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t({ he: "השם שלך (אופציונלי)", ar: "اسمك (اختياري)", en: "Your name (optional)" })}
                className="w-full text-center text-lg font-display font-bold px-4 py-3 rounded-xl border-2 border-border bg-card focus:border-primary focus:outline-none transition-colors mb-5"
                maxLength={20}
              />

              {/* Start button */}
              <motion.button
                whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.96 }}
                onClick={handleComplete}
                className="w-full py-4 rounded-xl font-display font-bold text-lg text-primary-foreground shadow-[var(--shadow-button)] relative overflow-hidden"
                style={{ background: "var(--gradient-hero)" }}>
                <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                  animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2, repeat: Infinity }} />
                <span className="relative">
                  {t({ he: "!יאללה נתחיל 🚀", ar: "!هيّا نبدأ 🚀", en: "Let's Start! 🚀" })}
                </span>
              </motion.button>

              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                onClick={() => setStep("age")}
                className="mt-3 text-sm text-muted-foreground font-display hover:text-primary transition-colors">
                ← {t({ he: "חזרה", ar: "رجوع", en: "Back" })}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="flex justify-center gap-2 mt-8">
          {["lang", "age", "avatar"].map((s, i) => (
            <motion.div key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === s ? "w-8 bg-primary" : i < ["lang", "age", "avatar"].indexOf(step) ? "w-4 bg-primary/40" : "w-4 bg-muted"
              }`}
              layoutId={`step-${i}`}
            />
          ))}
        </motion.div>

        {/* Game icons */}
        {step === "lang" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
            className="mt-6 flex justify-center gap-4">
            {[
              { emoji: "🔤", color: "bg-sky/15" },
              { emoji: "🎯", color: "bg-primary/15" },
              { emoji: "🧩", color: "bg-accent/15" },
              { emoji: "🐝", color: "bg-sunshine/15" },
              { emoji: "🎭", color: "bg-candy/15" },
            ].map((item, i) => (
              <motion.div key={item.emoji}
                initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 250, damping: 12, delay: 1.7 + i * 0.1 }}
                className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center text-2xl backdrop-blur-sm`}
                style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" }}>
                <motion.span animate={{ y: [0, -6, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}>
                  {item.emoji}
                </motion.span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
