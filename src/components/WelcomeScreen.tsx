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

const languages: { code: Language; flag: string; name: string; subtitle: string }[] = [
  { code: "ar", flag: "🇸🇦", name: "العربية", subtitle: "تعلم الإنجليزية بالعربية" },
  { code: "he", flag: "🇮🇱", name: "עברית", subtitle: "למד אנגלית בעברית" },
  { code: "en", flag: "🇬🇧", name: "English", subtitle: "Learn English in English" },
];

interface WelcomeScreenProps {
  onComplete: (lang: Language) => void;
}

const WelcomeScreen = ({ onComplete }: WelcomeScreenProps) => {
  const handleSelect = (lang: Language) => {
    markOnboarded();
    onComplete(lang);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="max-w-md w-full text-center"
      >
        {/* Mascot */}
        <motion.img
          src={mascotImg}
          alt="Owl mascot"
          className="w-32 h-32 mx-auto mb-6 drop-shadow-xl"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-display font-bold text-gradient mb-3"
        >
          English Fun
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground font-body text-lg mb-2"
        >
          🌟 Learn English the fun way! 🌟
        </motion.p>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground font-body text-sm mb-8"
        >
          Choose your language to get started
        </motion.p>

        {/* Language buttons */}
        <div className="space-y-3">
          {languages.map((lang, i) => (
            <motion.button
              key={lang.code}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.03, x: 5 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(lang.code)}
              className="w-full card-kid flex items-center gap-4 px-6 py-4 text-start transition-shadow hover:shadow-lg"
            >
              <span className="text-4xl">{lang.flag}</span>
              <div className="flex-1">
                <p className="font-display text-xl font-bold text-foreground">{lang.name}</p>
                <p className="font-body text-sm text-muted-foreground">{lang.subtitle}</p>
              </div>
              <motion.span
                className="text-2xl"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              >
                →
              </motion.span>
            </motion.button>
          ))}
        </div>

        {/* Fun emojis */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-3xl flex justify-center gap-3"
        >
          {["🔤", "🎯", "🧩", "🐝", "🎭"].map((emoji, i) => (
            <motion.span
              key={emoji}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            >
              {emoji}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
