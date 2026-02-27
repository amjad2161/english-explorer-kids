import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useLanguage } from "@/lib/i18n";
import { getCurrentLevel, getTotalEarnedStars, levels, getLevelProgress } from "@/lib/levels";
import { getUnlockedAchievements } from "@/lib/achievements";
import { getXP, getLevel, getDailyChallenge } from "@/lib/xp";
import { playClickSound } from "@/lib/sounds";
import FloatingParticles from "@/components/FloatingParticles";
import Card3D from "@/components/Card3D";
import DailyChallengeCard from "@/components/DailyChallengeCard";
import WordOfTheDay from "@/components/WordOfTheDay";
import { getSmartRecommendations, getMotivationalMessage, Recommendation } from "@/lib/recommendations";
import Interactive3DMascot from "@/components/Interactive3DMascot";
import { Sparkles, Zap, Trophy, ArrowRight, Map } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.97 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 140, damping: 18 } },
};

const floatVariants = {
  hidden: { y: 25, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100, damping: 15 } },
};

const quickAccessCards = [
  { titleKey: "quick.alphabet", emoji: "🔤", path: "/alphabet", color: "195, 85%, 55%", gradient: "from-sky/20 to-secondary/10" },
  { titleKey: "quick.words", emoji: "📝", path: "/words", color: "145, 65%, 48%", gradient: "from-grass/20 to-accent/10" },
  { titleKey: "quick.match", emoji: "🧩", path: "/memory", color: "270, 70%, 65%", gradient: "from-lavender/20 to-candy/10" },
  { titleKey: "quick.quiz", emoji: "🎯", path: "/quiz", color: "25, 95%, 55%", gradient: "from-primary/20 to-sunshine/10" },
  { titleKey: "quick.spelling", emoji: "🐝", path: "/spelling", color: "45, 100%, 60%", gradient: "from-sunshine/20 to-primary/10" },
  { titleKey: "quick.scramble", emoji: "🔀", path: "/scramble", color: "330, 85%, 60%", gradient: "from-candy/20 to-lavender/10" },
  { titleKey: "quick.hangman", emoji: "🎭", path: "/hangman", color: "195, 85%, 55%", gradient: "from-sky/20 to-grass/10" },
];

const Index = () => {
  const navigate = useNavigate();
  const { t, dir, lang } = useLanguage();
  const [totalStars, setTotalStars] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [badgeCount, setBadgeCount] = useState(0);
  const [xpState, setXpState] = useState(getXP());
  const [dailyChallenge, setDailyChallenge] = useState(getDailyChallenge());
  const [mascotMood, setMascotMood] = useState<"idle" | "wave" | "celebrate">("idle");
  const [refreshKey, setRefreshKey] = useState(0);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [motivation, setMotivation] = useState(getMotivationalMessage(lang));

  useEffect(() => {
    setTotalStars(getTotalEarnedStars());
    setCurrentLevel(getCurrentLevel());
    setBadgeCount(getUnlockedAchievements().length);
    setXpState(getXP());
    setDailyChallenge(getDailyChallenge());
    setRecommendations(getSmartRecommendations(lang));
    setMotivation(getMotivationalMessage(lang));
    
    const t1 = setTimeout(() => setMascotMood("wave"), 800);
    const t2 = setTimeout(() => setMascotMood("idle"), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [lang]);

  const level = levels[currentLevel - 1];
  const levelProgress = getLevelProgress(level);
  const nextLevel = levels[currentLevel] || null;
  const xpLevel = getLevel(xpState.totalXP);
  const funFactIndex = useMemo(() => Math.floor(Math.random() * 5) + 1, []);

  const refreshStats = useCallback(() => {
    setXpState(getXP());
    setDailyChallenge(getDailyChallenge());
    setRefreshKey(k => k + 1);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" dir={dir}>
      <FloatingParticles count={20} />
      
      {/* Cinematic aurora blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 1000, height: 1000,
            background: "radial-gradient(ellipse, hsl(var(--primary) / 0.08), hsl(var(--candy) / 0.04), transparent 60%)",
            top: "-30%", right: "-25%",
            borderRadius: "40% 60% 55% 45% / 50% 40% 60% 50%",
          }}
          animate={{ 
            scale: [1, 1.25, 1], 
            x: [0, 80, 0],
            borderRadius: [
              "40% 60% 55% 45% / 50% 40% 60% 50%",
              "55% 45% 40% 60% / 45% 55% 45% 55%",
              "40% 60% 55% 45% / 50% 40% 60% 50%",
            ]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 800, height: 800,
            background: "radial-gradient(ellipse, hsl(var(--lavender) / 0.06), hsl(var(--accent) / 0.04), transparent 60%)",
            bottom: "-20%", left: "-18%",
            borderRadius: "55% 45% 40% 60% / 45% 55% 45% 55%",
          }}
          animate={{ 
            scale: [1, 1.18, 1], 
            y: [0, -50, 0],
            borderRadius: [
              "55% 45% 40% 60% / 45% 55% 45% 55%",
              "40% 60% 55% 45% / 50% 40% 60% 50%",
              "55% 45% 40% 60% / 45% 55% 45% 55%",
            ]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: -6 }}
        />
        {/* Third aurora blob */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 600, height: 600,
            background: "radial-gradient(ellipse, hsl(var(--sunshine) / 0.04), hsl(var(--grass) / 0.03), transparent 60%)",
            top: "40%", left: "50%",
            borderRadius: "45% 55% 60% 40% / 55% 45% 55% 45%",
          }}
          animate={{ 
            scale: [1, 1.15, 0.95, 1], 
            x: [-30, 30, -30],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: -10 }}
        />
      </div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-4 py-8 relative z-10"
      >
        {/* ══════════════════════════════════════ */}
        {/* ── HERO SECTION ── */}
        {/* ══════════════════════════════════════ */}
        <motion.div variants={itemVariants} className="text-center mb-10 relative">
          {/* Mascot with cinematic glow */}
          <div className="relative inline-block mb-4">
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, hsl(var(--primary) / 0.1), hsl(var(--candy) / 0.05), transparent 55%)",
                width: "250%", height: "250%", left: "-75%", top: "-75%",
                filter: "blur(50px)",
              }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
            <Interactive3DMascot
              mood={mascotMood}
              size="lg"
              onClick={() => {
                playClickSound();
                setMascotMood("celebrate");
                setTimeout(() => setMascotMood("idle"), 2000);
              }}
            />
            {/* Speech bubble */}
            <AnimatePresence>
              {mascotMood === "wave" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0, x: 40, y: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 55, y: -35 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute top-0 end-0 bg-card/90 backdrop-blur-2xl rounded-3xl px-5 py-2.5 shadow-xl border border-primary/15 z-20"
                  style={{ borderRadius: "1.5rem 1.5rem 1.5rem 0.5rem" }}
                >
                  <span className="font-display font-bold text-sm">
                    {lang === "he" ? "!שלום" : lang === "ar" ? "!مرحبًا" : "Hi there!"} 👋
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-extrabold mb-3 leading-tight tracking-tight"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--candy)), hsl(var(--lavender)), hsl(var(--secondary)))",
              backgroundSize: "300% 300%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "aurora 5s ease-in-out infinite",
              filter: "drop-shadow(0 4px 30px hsl(var(--primary) / 0.15))",
            }}
          >
            {t("app.subtitle")}
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-muted-foreground font-body max-w-lg mx-auto leading-relaxed"
            variants={itemVariants}
          >
            🌟 {t("app.description")} 🌟
          </motion.p>
        </motion.div>

        {/* ══════════════════════════════════════ */}
        {/* ── XP LEVEL BAR ── */}
        {/* ══════════════════════════════════════ */}
        <motion.div variants={floatVariants} className="max-w-xl mx-auto mb-8">
          <div className="card-glass rounded-3xl p-5 relative overflow-hidden">
            <motion.div 
              className="absolute inset-0 opacity-[0.04]" 
              style={{ 
                background: "var(--gradient-btn-glow)",
                backgroundSize: "300% 300%",
                animation: "gradient-slide 6s linear infinite",
              }}
            />
            <div className="relative flex items-center gap-4 mb-3">
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg relative overflow-hidden"
                style={{ background: "var(--gradient-hero)" }}
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {xpLevel.title.split(" ")[0]}
                <div className="absolute inset-0 bg-white/15 animate-shimmer" />
              </motion.div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <span className="font-display font-bold text-base">
                    {lang === "he" ? "רמה" : lang === "ar" ? "المستوى" : "Level"} {xpLevel.level}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm text-muted-foreground font-display font-bold">
                      {xpState.totalXP} XP
                    </span>
                  </div>
                </div>
                <div className="h-4 mt-2 rounded-full overflow-hidden bg-muted/30 relative">
                  <motion.div
                    className="h-full rounded-full relative"
                    style={{
                      background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--candy)), hsl(var(--lavender)))",
                      backgroundSize: "200% 100%",
                      animation: "aurora 4s ease-in-out infinite",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((xpLevel.current / xpLevel.needed) * 100, 100)}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  >
                    <div className="absolute inset-0 animate-shimmer" />
                  </motion.div>
                </div>
              </div>
            </div>
            {xpState.streak > 0 && (
              <motion.div
                className="flex items-center gap-2 bg-primary/8 dark:bg-primary/12 rounded-full px-4 py-1.5 w-fit"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <motion.span 
                  className="text-base"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  🔥
                </motion.span>
                <span className="font-display font-bold text-sm text-primary">
                  {xpState.streak} {lang === "he" ? "ימים" : lang === "ar" ? "أيام" : "days"}
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════ */}
        {/* ── STATS ROW ── */}
        {/* ══════════════════════════════════════ */}
        <motion.div variants={floatVariants} className="flex justify-center gap-3 sm:gap-4 mb-8 flex-wrap">
          {[
            { emoji: "⭐", value: totalStars, label: t("home.stars"), gradient: "from-sunshine/20 via-primary/10 to-sunshine/5" },
            { emoji: "🏅", value: badgeCount, label: lang === "he" ? "הישגים" : lang === "ar" ? "إنجازات" : "Badges", gradient: "from-candy/20 via-lavender/10 to-candy/5" },
            { emoji: level.emoji, value: `${t("home.level")} ${level.id}`, label: t(`level.${level.id}`), gradient: "from-primary/20 via-candy/10 to-primary/5" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.12, y: -8, rotate: i === 1 ? 3 : -3 }}
              className={`card-glass flex items-center gap-3 px-5 sm:px-6 py-4 rounded-3xl bg-gradient-to-br ${stat.gradient} cursor-default border-primary/5`}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <motion.span
                className="text-2xl sm:text-3xl"
                style={{ filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.15))" }}
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.15, 1],
                }}
                transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.5 }}
              >
                {stat.emoji}
              </motion.span>
              <div>
                <p className="font-display font-extrabold text-lg sm:text-xl leading-tight">{stat.value}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground font-semibold">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ══════════════════════════════════════ */}
        {/* ── DAILY CHALLENGE + WORD OF DAY ── */}
        {/* ══════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
          <motion.div variants={floatVariants}>
            <DailyChallengeCard key={refreshKey} challenge={dailyChallenge} onUpdate={refreshStats} />
          </motion.div>
          <motion.div variants={floatVariants}>
            <WordOfTheDay />
          </motion.div>
        </div>

        {/* ══════════════════════════════════════ */}
        {/* ── MOTIVATIONAL MESSAGE ── */}
        {/* ══════════════════════════════════════ */}
        <motion.div variants={floatVariants} className="max-w-xl mx-auto mb-8">
          <motion.div 
            className="flex items-center gap-3 justify-center py-3.5 px-6 rounded-full relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--candy) / 0.06), hsl(var(--lavender) / 0.04))",
              border: "1px solid hsl(var(--primary) / 0.1)",
            }}
          >
            <motion.div 
              className="absolute inset-0"
              style={{
                background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.05), transparent)",
                backgroundSize: "200% 100%",
              }}
              animate={{ backgroundPosition: ["0% 50%", "200% 50%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.span 
              className="text-2xl relative z-10"
              style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.15))" }}
              animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {motivation.emoji}
            </motion.span>
            <span className="font-display font-bold text-sm sm:text-base relative z-10">{motivation.text}</span>
          </motion.div>
        </motion.div>

        {/* ══════════════════════════════════════ */}
        {/* ── SMART RECOMMENDATIONS ── */}
        {/* ══════════════════════════════════════ */}
        {recommendations.length > 0 && (
          <motion.div variants={floatVariants} className="max-w-xl mx-auto mb-8">
            <h3 className="font-display text-base font-bold mb-3 text-center text-muted-foreground">
              <span className="section-title mx-auto">
                {lang === "he" ? "💡 מומלץ עבורך" : lang === "ar" ? "💡 مُوصى لك" : "💡 Recommended for You"}
              </span>
            </h3>
            <div className="space-y-2.5">
              {recommendations.map((rec, i) => (
                <motion.button
                  key={rec.reason}
                  whileHover={{ scale: 1.02, x: dir === "rtl" ? -6 : 6 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { playClickSound(); navigate(rec.path); }}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl card-glass hover:border-primary/20 text-start group"
                  initial={{ opacity: 0, x: dir === "rtl" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                >
                  <motion.span 
                    className="text-2xl"
                    style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.15))" }}
                    whileHover={{ scale: 1.3, rotate: 15 }}
                  >
                    {rec.emoji}
                  </motion.span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm">{rec.title[lang] || rec.title.en}</p>
                    <p className="text-xs text-muted-foreground font-body truncate">{rec.description[lang] || rec.description.en}</p>
                  </div>
                  <motion.span 
                    className="text-muted-foreground text-sm group-hover:text-primary transition-colors"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {dir === "rtl" ? "◀" : "▶"}
                  </motion.span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════ */}
        {/* ── CURRENT LEVEL CARD ── */}
        {/* ══════════════════════════════════════ */}
        <motion.div variants={floatVariants} className="max-w-xl mx-auto mb-10">
          <Card3D
            onClick={() => { playClickSound(); navigate("/levels"); }}
            className="group"
          >
            <div className="card-kid relative overflow-hidden">
              <motion.div 
                className="absolute inset-0 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity" 
                style={{ 
                  background: "var(--gradient-btn-glow)",
                  backgroundSize: "300% 300%",
                  animation: "gradient-slide 6s linear infinite",
                }}
              />
              <div className="relative flex items-center gap-4">
                <motion.div
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-3xl flex items-center justify-center text-3xl shrink-0 shadow-lg relative overflow-hidden"
                  style={{ background: "var(--gradient-hero)" }}
                  animate={{ rotate: [0, 4, -4, 0], scale: [1, 1.06, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  {level.emoji}
                  <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Map className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-display font-semibold">{t("home.currentLevel")}</p>
                  </div>
                  <h2 className="font-display text-lg sm:text-xl font-bold truncate">{t("home.level")} {level.id}: {t(`level.${level.id}`)}</h2>
                  <div className="progress-bar h-3 mt-2.5">
                    <motion.div
                      className="progress-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${(levelProgress.completed / levelProgress.total) * 100}%` }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.8 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 font-display">
                    {levelProgress.completed}/{levelProgress.total} {t("home.stagesCompleted")}
                    {nextLevel && ` • ${Math.max(0, nextLevel.starsToUnlock - totalStars)} ${t("home.moreToNext")}`}
                  </p>
                </div>
                <motion.span
                  className="text-primary text-xl"
                  animate={{ x: [0, -6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {dir === "rtl" ? "◀" : "▶"}
                </motion.span>
              </div>
            </div>
          </Card3D>
        </motion.div>

        {/* ══════════════════════════════════════ */}
        {/* ── QUICK ACCESS GAMES ── */}
        {/* ══════════════════════════════════════ */}
        <motion.div variants={floatVariants} className="mb-10">
          <h3 className="font-display text-xl sm:text-2xl font-bold mb-6 text-center">
            <span className="section-title mx-auto">
              <Sparkles className="w-5 h-5 inline-block text-primary me-2" />
              {t("home.freePlay")}
            </span>
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            {quickAccessCards.map((card, i) => (
              <motion.button
                key={card.path}
                whileHover={{ y: -10, scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => { playClickSound(); navigate(card.path); }}
                className={`game-card-3d group relative overflow-hidden rounded-3xl p-4 sm:p-5 text-center bg-gradient-to-br ${card.gradient}`}
                initial={{ scale: 0, opacity: 0, rotate: -5 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ delay: 0.3 + i * 0.06, type: "spring", stiffness: 200 }}
              >
                {/* Radial glow background */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
                  style={{ background: `radial-gradient(circle at 50% 30%, hsl(${card.color} / 0.25), transparent 65%)` }}
                />
                <div className="relative z-10">
                  <motion.span
                    className="text-4xl sm:text-5xl block mb-2"
                    style={{ filter: "drop-shadow(0 5px 12px rgba(0,0,0,0.2))" }}
                    whileHover={{ scale: 1.3, rotate: [0, -15, 15, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    {card.emoji}
                  </motion.span>
                  <span className="font-display text-xs sm:text-sm font-bold block leading-tight">{t(card.titleKey)}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════ */}
        {/* ── ACTION BUTTONS ── */}
        {/* ══════════════════════════════════════ */}
        <motion.div variants={floatVariants} className="text-center mb-10 flex gap-3 justify-center flex-wrap">
          {/* Primary CTA - animated glow border */}
          <motion.button
            whileHover={{ scale: 1.06, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playClickSound(); navigate("/levels"); }}
            className="btn-kid gradient-primary text-primary-foreground text-base sm:text-lg px-10 sm:px-14 py-4 sm:py-5 shadow-xl"
          >
            <span className="relative z-10 flex items-center gap-2.5">
              <Map className="w-5 h-5" />
              {t("home.myJourney")}
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </span>
          </motion.button>
          
          {/* Secondary buttons with glow effect */}
          <motion.button
            whileHover={{ scale: 1.06, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playClickSound(); navigate("/achievements"); }}
            className="btn-glow"
          >
            <span>
              <Trophy className="w-4 h-4" />
              {lang === "he" ? "הישגים" : lang === "ar" ? "إنجازات" : "Badges"}
            </span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.06, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playClickSound(); navigate("/report"); }}
            className="btn-kid bg-card/80 backdrop-blur-sm text-foreground text-sm px-6 py-3.5 border border-border/40 shadow-lg"
          >
            <span className="relative z-10 flex items-center gap-2">
              📋 {lang === "he" ? "דוח התקדמות" : lang === "ar" ? "تقرير التقدم" : "Report"}
            </span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.06, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playClickSound(); navigate("/settings"); }}
            className="btn-kid bg-card/80 backdrop-blur-sm text-foreground text-sm px-6 py-3.5 border border-border/40 shadow-lg"
          >
            <span className="relative z-10 flex items-center gap-2">
              ⚙️ {lang === "he" ? "הגדרות" : lang === "ar" ? "إعدادات" : "Settings"}
            </span>
          </motion.button>
        </motion.div>

        {/* ══════════════════════════════════════ */}
        {/* ── FUN FACT ── */}
        {/* ══════════════════════════════════════ */}
        <motion.div variants={floatVariants} className="max-w-xl mx-auto">
          <Card3D intensity={8}>
            <div className="card-kid text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sunshine/5 via-transparent to-primary/5 dark:from-sunshine/3 dark:to-primary/3" />
              <motion.div
                className="text-5xl sm:text-6xl mb-4 relative z-10"
                style={{ filter: "drop-shadow(0 5px 15px rgba(0,0,0,0.2))" }}
                animate={{ rotate: [0, 8, -8, 0], y: [0, -8, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                💡
              </motion.div>
              <h3 className="font-display text-lg sm:text-xl font-bold mb-2 relative z-10">{t("home.didYouKnow")}</h3>
              <p className="text-muted-foreground font-body text-sm sm:text-base relative z-10 leading-relaxed">{t(`home.funFact${funFactIndex}`)}</p>
            </div>
          </Card3D>
        </motion.div>

        <div className="h-8" />
      </motion.div>
    </div>
  );
};

export default Index;
