import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Star } from "lucide-react";
import { getTotalEarnedStars } from "@/lib/levels";
import { useLanguage } from "@/lib/i18n";
import { useState, useEffect } from "react";

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang, setLang } = useLanguage();
  const [stars, setStars] = useState(0);

  const navItems = [
    { path: "/", label: t("nav.home") },
    { path: "/levels", label: t("nav.levels") },
    { path: "/alphabet", label: t("nav.alphabet") },
    { path: "/words", label: t("nav.words") },
    { path: "/memory", label: t("nav.memory") },
    { path: "/quiz", label: t("nav.quiz") },
    { path: "/spelling", label: t("nav.spelling") },
    { path: "/scramble", label: t("nav.scramble") },
    { path: "/hangman", label: t("nav.hangman") },
  ];

  useEffect(() => {
    setStars(getTotalEarnedStars());
  }, [location]);

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="sticky top-0 z-50 backdrop-blur-md bg-card/80 border-b border-border"
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-3xl">🦉</span>
          <h1 className="text-xl font-display font-bold text-gradient">
            English Fun
          </h1>
        </motion.div>

        <nav className="flex items-center gap-1 overflow-x-auto max-w-[50vw] scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-2 py-1.5 rounded-xl font-display text-xs font-semibold transition-colors whitespace-nowrap ${
                  isActive
                    ? "gradient-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
              </motion.button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLang(lang === "he" ? "ar" : "he")}
            className="flex items-center gap-1 bg-muted px-3 py-1.5 rounded-full font-display text-xs font-bold transition-colors hover:bg-muted/80"
          >
            <span>{lang === "he" ? "🇮🇱" : "🇸🇦"}</span>
            <span>{lang === "he" ? "عربي" : "עברית"}</span>
          </motion.button>

          <motion.div
            className="flex items-center gap-1 bg-sunshine/20 px-3 py-1.5 rounded-full"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Star className="w-5 h-5 star-earned fill-current" />
            <span className="font-display font-bold text-sunshine-foreground">
              {stars}
            </span>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default AppHeader;
