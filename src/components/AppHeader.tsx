import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Star, Globe } from "lucide-react";
import { getTotalEarnedStars } from "@/lib/levels";
import { useLanguage, Language } from "@/lib/i18n";
import { useState, useEffect, useRef } from "react";

const langOptions: { code: Language; flag: string; name: string }[] = [
  { code: "ar", flag: "🇸🇦", name: "العربية" },
  { code: "he", flag: "🇮🇱", name: "עברית" },
  { code: "en", flag: "🇬🇧", name: "English" },
];

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang, setLang, dir } = useLanguage();
  const [stars, setStars] = useState(0);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentLang = langOptions.find(l => l.code === lang)!;

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="sticky top-0 z-50 backdrop-blur-md bg-card/80 border-b border-border"
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between" dir={dir}>
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
          <div className="relative" ref={menuRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLangMenuOpen(prev => !prev)}
              className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full font-display text-xs font-bold transition-colors hover:bg-muted/80"
            >
              <span>{currentLang.flag}</span>
              <span>{currentLang.name}</span>
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            </motion.button>

            <AnimatePresence>
              {langMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 end-0 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 min-w-[140px]"
                >
                  {langOptions.map((opt) => (
                    <motion.button
                      key={opt.code}
                      whileHover={{ backgroundColor: "hsl(var(--muted))" }}
                      onClick={() => {
                        setLang(opt.code);
                        setLangMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 w-full px-4 py-2.5 font-display text-sm font-semibold transition-colors ${
                        lang === opt.code ? "bg-primary/10 text-primary" : "text-foreground"
                      }`}
                    >
                      <span className="text-lg">{opt.flag}</span>
                      <span>{opt.name}</span>
                      {lang === opt.code && <span className="ms-auto">✓</span>}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
