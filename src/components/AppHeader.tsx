import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Star, Globe, Trophy, RotateCcw, Volume2, VolumeX, Music, Music2, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { getTotalEarnedStars } from "@/lib/levels";
import { getUnlockedAchievements } from "@/lib/achievements";
import { getXP, getLevel } from "@/lib/xp";
import { useLanguage, Language } from "@/lib/i18n";
import { useState, useEffect, useRef, useCallback } from "react";
import owlPixar from "@/assets/owl-pixar.png";
import { getProfile } from "@/lib/ageProfile";
import UserAvatar from "@/components/UserAvatar";
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

/* ─── Chalk dust particle system ─── */
const ChalkDustBurst = ({ active }: { active: boolean }) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number; dx: number; dy: number; color: string }>>([]);

  useEffect(() => {
    if (!active) return;
    const colors = [
      "hsl(var(--chalk))",
      "hsl(var(--grass) / 0.7)",
      "hsl(var(--sunshine) / 0.6)",
      "hsl(var(--sky) / 0.5)",
    ];
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: 20 + Math.random() * 60,
      y: 10 + Math.random() * 30,
      size: 2 + Math.random() * 4,
      opacity: 0.4 + Math.random() * 0.5,
      dx: (Math.random() - 0.5) * 40,
      dy: -10 - Math.random() * 25,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(newParticles);
    const t = setTimeout(() => setParticles([]), 900);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <AnimatePresence>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none z-30"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: p.color,
            filter: "blur(0.5px)",
          }}
          initial={{ opacity: p.opacity, scale: 1, x: 0, y: 0 }}
          animate={{
            opacity: 0,
            scale: 0.3,
            x: p.dx,
            y: p.dy,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 + Math.random() * 0.3, ease: "easeOut" }}
        />
      ))}
    </AnimatePresence>
  );
};

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
  const [logoHovered, setLogoHovered] = useState(false);
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
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      {/* Disney-quality gradient header background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, hsl(245 40% 12%) 0%, hsl(250 38% 14%) 85%, hsl(248 36% 12% / 0.97) 100%)",
          backdropFilter: "blur(20px) saturate(1.6)",
        }}
      />
      {/* Magic star dust texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle, hsl(262 80% 72%) 0.6px, transparent 0.6px),
            radial-gradient(circle, hsl(44 100% 68%) 0.4px, transparent 0.4px)
          `,
          backgroundSize: "48px 32px, 72px 56px",
          backgroundPosition: "0 0, 24px 16px",
        }}
      />
      {/* Magic aurora shimmer bottom strip */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2.5px]"
        style={{
          background: "linear-gradient(90deg, hsl(262 80% 65% / 0.4), hsl(338 80% 68% / 0.7), hsl(44 100% 62% / 0.7), hsl(199 80% 65% / 0.5), hsl(262 80% 65% / 0.4))",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />

      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between relative" dir={dir}>
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2.5 cursor-pointer relative"
          onClick={() => navigate("/")}
          onHoverStart={() => setLogoHovered(true)}
          onHoverEnd={() => setLogoHovered(false)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
        >
          <ChalkDustBurst active={logoHovered} />
          <div className="relative">
            <motion.img
              src={owlPixar}
              alt="English Fun"
              className="w-8 h-8 object-contain rounded-full"
              style={{
                boxShadow: "0 0 12px hsl(262 80% 68% / 0.35), 0 0 4px hsl(262 80% 68% / 0.5)",
                border: "2px solid hsl(262 60% 70% / 0.3)",
              }}
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Magic sparkle decoration */}
            <motion.div
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
              style={{
                background: "linear-gradient(135deg, hsl(44 100% 68%), hsl(32 95% 62%))",
                boxShadow: "0 0 6px hsl(44 100% 68% / 0.6)",
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <div className="hidden sm:block">
            <h1
              className="text-lg font-display font-extrabold leading-tight"
              style={{
                background: "linear-gradient(135deg, hsl(262 70% 78%), hsl(338 75% 78%), hsl(44 100% 72%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              English Fun
            </h1>
            {/* Mini XP bar */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-display font-semibold" style={{ color: "hsl(262 50% 72% / 0.65)" }}>
                {xpLevel.title.split(" ")[0]}
              </span>
              <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(262 40% 55% / 0.15)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, hsl(262 80% 65%), hsl(338 80% 68%), hsl(44 100% 62%))",
                  }}
                  animate={{ width: `${Math.min((xpLevel.current / xpLevel.needed) * 100, 100)}%` }}
                  transition={{ duration: 0.9 }}
                />
              </div>
              <span className="text-[10px] font-display" style={{ color: "hsl(262 50% 72% / 0.45)" }}>{xpTotal}</span>
            </div>
          </div>
        </motion.div>

        {/* Nav — Disney-quality buttons */}
        <nav className="flex items-center gap-0.5 overflow-x-auto max-w-[55vw] sm:max-w-[50vw] scrollbar-hide px-1" role="navigation" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.button
                key={item.path}
                onClick={() => { playClickSound(); navigate(item.path); }}
                className={`px-2 sm:px-3 py-1.5 rounded-full font-display text-xs font-semibold whitespace-nowrap relative transition-all`}
                style={
                  isActive
                    ? {
                        background: "hsl(262 65% 62% / 0.22)",
                        color: "hsl(262 60% 84%)",
                        border: "1.5px solid hsl(262 65% 65% / 0.35)",
                        boxShadow: "0 0 12px hsl(262 65% 65% / 0.15)",
                      }
                    : {
                        color: "hsl(225 25% 75% / 0.65)",
                      }
                }
                whileHover={{
                  scale: 1.08,
                  y: -1,
                  color: "hsl(225 25% 90%)",
                }}
                whileTap={{ scale: 0.92 }}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="sm:hidden text-sm">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-1/2 w-1.5 h-1.5 rounded-full"
                    style={{
                      marginLeft: "-3px",
                      background: "linear-gradient(135deg, hsl(262 80% 70%), hsl(338 80% 70%))",
                      boxShadow: "0 0 6px hsl(262 80% 70% / 0.5)",
                    }}
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
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "hsl(262 50% 60% / 0.12)" }}
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
                {theme === "dark" ? <Sun className="w-4 h-4 text-sunshine" /> : <Moon className="w-4 h-4" style={{ color: "hsl(262 60% 78%)" }} />}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Sound & Music */}
          <motion.button
            whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
            onClick={toggleSound}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: soundOn ? "hsl(152 65% 48% / 0.18)" : "hsl(262 50% 60% / 0.08)",
              color: soundOn ? "hsl(152 65% 62%)" : "hsl(225 25% 65% / 0.5)",
            }}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
            onClick={toggleMusic}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: musicOn ? "hsl(199 80% 52% / 0.18)" : "hsl(262 50% 60% / 0.08)",
              color: musicOn ? "hsl(199 80% 68%)" : "hsl(225 25% 65% / 0.5)",
            }}
          >
            {musicOn ? <Music className="w-4 h-4" /> : <Music2 className="w-4 h-4" />}
          </motion.button>

          {/* Language */}
          <div className="relative" ref={menuRef}>
            <motion.button
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              onClick={() => setLangMenuOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-full font-display text-xs font-bold transition-colors"
              style={{
                background: "hsl(262 50% 60% / 0.12)",
                color: "hsl(262 60% 80%)",
              }}
            >
              <span>{currentLang.flag}</span>
              <Globe className="w-3.5 h-3.5" />
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
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full"
              style={{ background: "hsl(338 80% 65% / 0.15)", color: "hsl(338 75% 72%)" }}
              initial={{ scale: 0 }} animate={{ scale: 1 }}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="font-display font-bold text-xs">{badges}</span>
            </motion.button>
          )}

          {/* Profile avatar */}
          {profile && (
            <UserAvatar
              size="xs"
              showOwl
              onClick={() => navigate("/parent")}
            />
          )}

          {/* Stars */}
          <motion.div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
            style={{
              background: "hsl(44 100% 62% / 0.15)",
              border: "1px solid hsl(44 100% 62% / 0.2)",
            }}
            whileHover={{ scale: 1.08 }}
          >
            <Star className="w-4 h-4 star-earned fill-current" />
            <span className="font-display font-bold text-xs" style={{ color: "hsl(44 100% 68%)" }}>{stars}</span>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default AppHeader;
