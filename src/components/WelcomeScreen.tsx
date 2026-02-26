import { motion } from "framer-motion";
import { Language } from "@/lib/i18n";
import mascotImg from "@/assets/mascot.png";

const ONBOARDING_KEY = "english-fun-onboarded";

export const hasCompletedOnboarding = (): boolean => {
  return localStorage.getItem(ONBOARDING_KEY) === "true";
};

const markOnboarded = () => {
  localStorage.setItem(ONBOARDING_KEY, "true");
};

const languages: { code: Language; flag: string; name: string; subtitle: string; gradient: string }[] = [
  { code: "ar", flag: "🇸🇦", name: "العربية", subtitle: "تعلم الإنجليزية بالعربية", gradient: "from-emerald-400 to-teal-500" },
  { code: "he", flag: "🇮🇱", name: "עברית", subtitle: "למד אנגלית בעברית", gradient: "from-blue-400 to-indigo-500" },
  { code: "en", flag: "🇬🇧", name: "English", subtitle: "Learn English in English", gradient: "from-rose-400 to-orange-500" },
];

interface WelcomeScreenProps {
  onComplete: (lang: Language) => void;
}

const FloatingShape = ({ delay, x, y, size, color }: { delay: number; x: string; y: string; size: number; color: string }) => (
  <motion.div
    className="absolute rounded-full opacity-10"
    style={{ left: x, top: y, width: size, height: size, background: color }}
    animate={{
      y: [0, -30, 0],
      x: [0, 15, 0],
      scale: [1, 1.15, 1],
      rotate: [0, 180, 360],
    }}
    transition={{ duration: 8 + delay, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

const WelcomeScreen = ({ onComplete }: WelcomeScreenProps) => {
  const handleSelect = (lang: Language) => {
    markOnboarded();
    onComplete(lang);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <FloatingShape delay={0} x="10%" y="20%" size={200} color="hsl(25, 95%, 55%)" />
      <FloatingShape delay={2} x="70%" y="10%" size={150} color="hsl(195, 85%, 55%)" />
      <FloatingShape delay={4} x="80%" y="70%" size={180} color="hsl(145, 65%, 48%)" />
      <FloatingShape delay={1} x="20%" y="75%" size={120} color="hsl(330, 85%, 60%)" />
      <FloatingShape delay={3} x="50%" y="50%" size={100} color="hsl(270, 70%, 65%)" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="max-w-md w-full text-center relative z-10 px-4"
      >
        {/* Glowing ring behind mascot */}
        <div className="relative mx-auto w-36 h-36 mb-6">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: "var(--gradient-hero)", filter: "blur(20px)", opacity: 0.3 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.img
            src={mascotImg}
            alt="Owl mascot"
            className="w-32 h-32 mx-auto relative z-10 drop-shadow-2xl"
            animate={{ y: [0, -12, 0], rotate: [0, 3, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Title with shimmer */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-6xl font-display font-bold text-gradient mb-3 drop-shadow-sm"
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
          className="text-muted-foreground/70 font-body text-sm mb-8"
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
              transition={{ delay: 0.5 + i * 0.12, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(lang.code)}
              className="w-full card-kid flex items-center gap-4 px-6 py-5 text-start group"
            >
              <motion.div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${lang.gradient} flex items-center justify-center text-3xl shadow-lg`}
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
            { emoji: "🔤", color: "bg-sky/20" },
            { emoji: "🎯", color: "bg-primary/20" },
            { emoji: "🧩", color: "bg-grass/20" },
            { emoji: "🐝", color: "bg-sunshine/20" },
            { emoji: "🎭", color: "bg-candy/20" },
          ].map((item, i) => (
            <motion.div
              key={item.emoji}
              className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center text-2xl`}
              animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
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
