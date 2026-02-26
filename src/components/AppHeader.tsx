import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Star, Globe, Trophy, RotateCcw } from "lucide-react";
import { getTotalEarnedStars } from "@/lib/levels";
import { getUnlockedAchievements } from "@/lib/achievements";
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
  const [badges, setBadges] = useState(0);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { path: "/", label: t("nav.home"), icon: "🏠" },
    { path: "/levels", label: t("nav.levels"), icon: "🗺️" },
    { path: "/alphabet", label: t("nav.alphabet"), icon: "🔤" },
    { path: "/words", label: t("nav.words"), icon: "📝" },
    { path: "/memory", label: t("nav.memory"), icon: "🧩" },
    { path: "/quiz", label: t("nav.quiz"), icon: "🎯" },
    { path: "/spelling", label: t("nav.spelling"), icon: "🐝" },
    { path: "/scramble", label: t("nav.scramble"), icon: "🔀" },
    { path: "/hangman", label: t("nav.hangman"), icon: "🎭" },
    { path: "/achievements", label: "🏅", icon: "🏅" },
  ];

  useEffect(() => {
    setStars(getTotalEarnedStars());
    setBadges(getUnlockedAchievements().length);
  }, [location]);

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
      className="sticky top-0 z-50 backdrop-blur-xl bg-card/70 border-b border-border/50"
    >
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between" dir={dir}>
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span
            className="text-3xl"
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            🦉
          </motion.span>
          <h1 className="text-xl font-display font-bold text-gradient hidden sm:block">
            English Fun
          </h1>
        </motion.div>

        {/* Nav */}
        <nav className="flex items-center gap-0.5 overflow-x-auto max-w-[55vw] scrollbar-hide px-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-2.5 py-1.5 rounded-xl font-display text-xs font-semibold transition-all whitespace-nowrap relative ${
                  isActive
                    ? "gradient-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                layout
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-1/2 w-1.5 h-1.5 rounded-full bg-primary"
                    style={{ marginLeft: "-3px" }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {/* Language Switcher */}
          <div className="relative" ref={menuRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLangMenuOpen(prev => !prev)}
              className="flex items-center gap-1.5 bg-muted/60 backdrop-blur-sm px-2.5 py-1.5 rounded-full font-display text-xs font-bold transition-colors hover:bg-muted"
            >
              <span>{currentLang.flag}</span>
              <span className="hidden sm:inline">{currentLang.name}</span>
              <Globe className="w-3 h-3 text-muted-foreground" />
            </motion.button>

            <AnimatePresence>
              {langMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 end-0 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-xl overflow-hidden z-50 min-w-[150px]"
                >
                  {langOptions.map((opt) => (
                    <motion.button
                      key={opt.code}
                      whileHover={{ x: 4 }}
                      onClick={() => { setLang(opt.code); setLangMenuOpen(false); }}
                      className={`flex items-center gap-2.5 w-full px-4 py-3 font-display text-sm font-semibold transition-colors ${
                        lang === opt.code ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <span className="text-lg">{opt.flag}</span>
                      <span>{opt.name}</span>
                      {lang === opt.code && <span className="ms-auto text-primary">✓</span>}
                    </motion.button>
                  ))}
                  <div className="border-t border-border my-1" />
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      localStorage.removeItem("english-fun-onboarded");
                      setLangMenuOpen(false);
                      window.location.reload();
                    }}
                    className="flex items-center gap-2.5 w-full px-4 py-3 font-display text-sm font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{lang === "he" ? "מסך פתיחה" : lang === "ar" ? "شاشة الترحيب" : "Welcome Screen"}</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Badges count */}
          {badges > 0 && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/achievements")}
              className="flex items-center gap-1 bg-candy/10 px-2 py-1.5 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <Trophy className="w-4 h-4 text-candy" />
              <span className="font-display font-bold text-xs text-candy">{badges}</span>
            </motion.button>
          )}

          {/* Stars */}
          <motion.div
            className="flex items-center gap-1 bg-sunshine/15 px-2.5 py-1.5 rounded-full"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Star className="w-4 h-4 star-earned fill-current" />
            <span className="font-display font-bold text-xs text-sunshine-foreground">
              {stars}
            </span>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default AppHeader;
