import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Star, Globe, Trophy, RotateCcw, Volume2, VolumeX, Music, Music2, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { getTotalEarnedStars } from "@/lib/levels";
import { getUnlockedAchievements } from "@/lib/achievements";
import { getXP, getLevel } from "@/lib/xp";
import { useLanguage, Language } from "@/lib/i18n";
import { useState, useEffect, useRef } from "react";
import owlPixar from "@/assets/owl-pixar.png";
import { getProfile } from "@/lib/ageProfile";
import {
  isSoundEnabled, setSoundEnabled,
  isMusicEnabled, setMusicEnabled,
  playClickSound, startBgMusic, stopBgMusic,
} from "@/lib/sounds";

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
  const [soundOn, setSoundOn] = useState(isSoundEnabled);
  const [musicOn, setMusicOn] = useState(isMusicEnabled);
  const [xpLevel, setXpLevel] = useState(getLevel(getXP().totalXP));
  const [xpTotal, setXpTotal] = useState(getXP().totalXP);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const profile = getProfile();

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

  const navItems = [
    { path: "/", label: t("nav.home"), icon: "🏠", mobileOnly: false },
    { path: "/levels", label: t("nav.levels"), icon: "🗺️", mobileOnly: false },
    { path: "/alphabet", label: t("nav.alphabet"), icon: "🔤", mobileOnly: false },
    { path: "/words", label: t("nav.words"), icon: "📝", mobileOnly: false },
    { path: "/memory", label: t("nav.memory"), icon: "🧩", mobileOnly: false },
    { path: "/quiz", label: t("nav.quiz"), icon: "🎯", mobileOnly: false },
    { path: "/spelling", label: t("nav.spelling"), icon: "🐝", mobileOnly: true },
    { path: "/scramble", label: t("nav.scramble"), icon: "🔀", mobileOnly: true },
    { path: "/hangman", label: t("nav.hangman"), icon: "🎭", mobileOnly: true },
    { path: "/achievements", label: "🏅", icon: "🏅", mobileOnly: true },
    { path: "/stats", label: "📊", icon: "📊", mobileOnly: true },
    { path: "/report", label: "📋", icon: "📋", mobileOnly: true },
    { path: "/settings", label: "⚙️", icon: "⚙️", mobileOnly: true },
  ];

  useEffect(() => {
    setStars(getTotalEarnedStars());
    setBadges(getUnlockedAchievements().length);
    const xp = getXP();
    setXpTotal(xp.totalXP);
    setXpLevel(getLevel(xp.totalXP));
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
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-card/80 dark:bg-card/70 border-b border-border"
      style={{
        boxShadow: "0 1px 4px hsl(var(--foreground) / 0.04)",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >

      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between" dir={dir}>
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img src={owlPixar} alt="English Fun" className="w-8 h-8 object-contain rounded-full" />
          <div className="hidden sm:block">
            <h1 className="text-lg font-display font-extrabold text-gradient leading-tight">
              English Fun
            </h1>
            {/* Mini XP bar */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-display font-semibold text-muted-foreground">
                {xpLevel.title.split(" ")[0]}
              </span>
              <div className="w-16 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ 
                    background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--candy)))",
                  }}
                  animate={{ width: `${Math.min((xpLevel.current / xpLevel.needed) * 100, 100)}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <span className="text-[10px] font-display text-muted-foreground">{xpTotal}</span>
            </div>
          </div>
        </motion.div>

        {/* Nav */}
        <nav className="flex items-center gap-0.5 overflow-x-auto max-w-[55vw] sm:max-w-[50vw] scrollbar-hide px-1" role="navigation" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.button
                key={item.path}
                onClick={() => { playClickSound(); navigate(item.path); }}
                className={`px-2 sm:px-3 py-1.5 rounded-full font-display text-xs font-semibold whitespace-nowrap relative transition-all ${
                  isActive
                    ? "gradient-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
                whileHover={{ scale: 1.08, y: -1 }}
                whileTap={{ scale: 0.92 }}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="sm:hidden text-sm">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-1/2 w-1.5 h-1.5 rounded-full bg-primary-foreground"
                    style={{ marginLeft: "-3px" }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.15, rotate: 20 }}
            whileTap={{ scale: 0.85 }}
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-muted/40 text-foreground hover:bg-primary/10"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ y: -12, opacity: 0, rotate: -90 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 12, opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-sunshine" /> : <Moon className="w-4 h-4" />}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Sound & Music */}
          <motion.button
            whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
            onClick={toggleSound}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              soundOn ? "bg-primary/12 text-primary" : "bg-muted/40 text-muted-foreground"
            }`}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
            onClick={toggleMusic}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              musicOn ? "bg-accent/12 text-accent" : "bg-muted/40 text-muted-foreground"
            }`}
          >
            {musicOn ? <Music className="w-4 h-4" /> : <Music2 className="w-4 h-4" />}
          </motion.button>

          {/* Language */}
          <div className="relative" ref={menuRef}>
            <motion.button
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              onClick={() => setLangMenuOpen(prev => !prev)}
              className="flex items-center gap-1.5 bg-muted/40 backdrop-blur-sm px-2.5 py-2 rounded-full font-display text-xs font-bold transition-colors hover:bg-muted/60"
            >
              <span>{currentLang.flag}</span>
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            </motion.button>

            <AnimatePresence>
              {langMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, type: "spring" }}
                  className="absolute top-full mt-2 end-0 bg-card/95 backdrop-blur-2xl border border-border/30 rounded-3xl shadow-2xl overflow-hidden z-50 min-w-[160px]"
                >
                  {langOptions.map((opt) => (
                    <motion.button
                      key={opt.code}
                      whileHover={{ x: dir === "rtl" ? -4 : 4, backgroundColor: "hsl(var(--muted) / 0.4)" }}
                      onClick={() => { setLang(opt.code); setLangMenuOpen(false); }}
                      className={`flex items-center gap-3 w-full px-5 py-3.5 font-display text-sm font-semibold transition-colors ${
                        lang === opt.code ? "bg-primary/10 text-primary" : "text-foreground"
                      }`}
                    >
                      <span className="text-lg">{opt.flag}</span>
                      <span>{opt.name}</span>
                      {lang === opt.code && <span className="ms-auto text-primary">✓</span>}
                    </motion.button>
                  ))}
                  <div className="border-t border-border/20 mx-3" />
                  <motion.button
                    whileHover={{ x: dir === "rtl" ? -4 : 4 }}
                    onClick={() => {
                      localStorage.removeItem("english-fun-onboarded");
                      setLangMenuOpen(false);
                      window.location.reload();
                    }}
                    className="flex items-center gap-3 w-full px-5 py-3.5 font-display text-sm font-semibold text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{lang === "he" ? "מסך פתיחה" : lang === "ar" ? "شاشة الترحيب" : "Welcome Screen"}</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Badges */}
          {badges > 0 && (
            <motion.button
              whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
              onClick={() => navigate("/achievements")}
              className="flex items-center gap-1 bg-candy/10 px-2.5 py-1.5 rounded-full"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
            >
              <Trophy className="w-3.5 h-3.5 text-candy" />
              <span className="font-display font-bold text-xs text-candy">{badges}</span>
            </motion.button>
          )}

          {/* Profile avatar */}
          {profile && (
            <motion.button
              whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
              onClick={() => navigate("/parent")}
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg border-2 border-primary/25 hover:border-primary/50 transition-colors"
              style={{ background: "hsl(var(--primary) / 0.08)" }}
              title={profile.name}
            >
              {profile.avatar}
            </motion.button>
          )}

          {/* Stars */}
          <motion.div
            className="flex items-center gap-1.5 bg-sunshine/12 px-2.5 py-1.5 rounded-full"
            whileHover={{ scale: 1.08 }}
          >
            <Star className="w-4 h-4 star-earned fill-current" />
            <span className="font-display font-bold text-xs text-sunshine-foreground">{stars}</span>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default AppHeader;
