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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.97 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 180, damping: 20 } },
};

const quickAccessCards = [
  { titleKey: "quick.alphabet", emoji: "🔤", path: "/alphabet", color: "195, 85%, 55%", glow: "--secondary" },
  { titleKey: "quick.words", emoji: "📝", path: "/words", color: "145, 65%, 48%", glow: "--accent" },
  { titleKey: "quick.match", emoji: "🧩", path: "/memory", color: "270, 70%, 65%", glow: "--lavender" },
  { titleKey: "quick.quiz", emoji: "🎯", path: "/quiz", color: "25, 95%, 55%", glow: "--primary" },
  { titleKey: "quick.spelling", emoji: "🐝", path: "/spelling", color: "45, 100%, 60%", glow: "--sunshine" },
  { titleKey: "quick.scramble", emoji: "🔀", path: "/scramble", color: "330, 85%, 60%", glow: "--candy" },
  { titleKey: "quick.hangman", emoji: "🎭", path: "/hangman", color: "195, 85%, 55%", glow: "--sky" },
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
      
      {/* Aurora background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full opacity-[0.04] dark:opacity-[0.06]"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary)), transparent 60%)",
            top: "-20%", right: "-15%",
          }}
          animate={{ scale: [1, 1.3, 1], x: [0, 80, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.03] dark:opacity-[0.05]"
          style={{
            background: "radial-gradient(circle, hsl(var(--candy)), transparent 60%)",
            bottom: "-10%", left: "-10%",
          }}
          animate={{ scale: [1, 1.2, 1], y: [0, -60, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: -8 }}
        />
      </div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-4 py-6 relative z-10"
      >
        {/* ── HERO SECTION ── */}
        <motion.div variants={itemVariants} className="text-center mb-8 relative">
          <div className="relative inline-block mb-4">
            <Interactive3DMascot
              mood={mascotMood}
              size="md"
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
                  animate={{ opacity: 1, scale: 1, x: 50, y: -30 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute top-0 end-0 bg-card/95 backdrop-blur-xl rounded-2xl px-4 py-2 shadow-xl border border-border/50 z-20"
                >
                  <span className="font-display font-bold text-sm">
                    {lang === "he" ? "!שלום" : lang === "ar" ? "!مرحبًا" : "Hi there!"}
                  </span>
                  <div className="absolute bottom-0 start-0 w-3 h-3 bg-card/95 rotate-45 translate-y-1.5 -translate-x-1" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold mb-3 leading-tight"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--sunshine)), hsl(var(--candy)))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {t("app.subtitle")}
          </motion.h1>
          <motion.p
            className="text-base sm:text-lg md:text-xl text-muted-foreground font-body max-w-lg mx-auto"
            variants={itemVariants}
          >
            {t("app.description")}
          </motion.p>
        </motion.div>

        {/* ── XP LEVEL BAR ── */}
        <motion.div variants={itemVariants} className="max-w-lg mx-auto mb-6">
          <div className="card-glass rounded-2xl p-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{ background: "var(--gradient-hero)" }} />
            <div className="relative flex items-center gap-3 mb-2">
              <motion.span
                className="text-3xl"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {xpLevel.title.split(" ")[0]}
              </motion.span>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <span className="font-display font-bold text-sm">
                    {lang === "he" ? "רמה" : lang === "ar" ? "المستوى" : "Level"} {xpLevel.level}
                  </span>
                  <span className="text-xs text-muted-foreground font-display">
                    {xpState.totalXP} XP
                  </span>
                </div>
                <div className="xp-bar h-3 mt-1 rounded-full overflow-hidden bg-muted/50">
                  <motion.div
                    className="h-full rounded-full relative"
                    style={{
                      background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--sunshine)), hsl(var(--candy)))",
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
              <div className="flex gap-3 mt-2">
                <motion.div
                  className="flex items-center gap-1.5 bg-primary/10 dark:bg-primary/15 rounded-full px-3 py-1"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-sm">🔥</span>
                  <span className="font-display font-bold text-xs text-primary">{xpState.streak} {lang === "he" ? "ימים" : lang === "ar" ? "أيام" : "days"}</span>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── DAILY CHALLENGE ── */}
        <motion.div variants={itemVariants} className="max-w-lg mx-auto mb-6">
          <DailyChallengeCard key={refreshKey} challenge={dailyChallenge} onUpdate={refreshStats} />
        </motion.div>

        {/* ── WORD OF THE DAY ── */}
        <motion.div variants={itemVariants} className="max-w-lg mx-auto mb-6">
          <WordOfTheDay />
        </motion.div>

        {/* ── MOTIVATIONAL MESSAGE ── */}
        <motion.div variants={itemVariants} className="max-w-lg mx-auto mb-4">
          <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground font-display">
            <span className="text-lg">{motivation.emoji}</span>
            <span className="font-semibold">{motivation.text}</span>
          </div>
        </motion.div>

        {/* ── SMART RECOMMENDATIONS ── */}
        {recommendations.length > 0 && (
          <motion.div variants={itemVariants} className="max-w-lg mx-auto mb-6">
            <h3 className="font-display text-sm font-bold mb-2 text-center text-muted-foreground">
              {lang === "he" ? "💡 מומלץ עבורך" : lang === "ar" ? "💡 مُوصى لك" : "💡 Recommended for You"}
            </h3>
            <div className="space-y-2">
              {recommendations.map((rec, i) => (
                <motion.button
                  key={rec.reason}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { playClickSound(); navigate(rec.path); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors text-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <span className="text-xl">{rec.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm">{rec.title[lang] || rec.title.en}</p>
                    <p className="text-xs text-muted-foreground font-body truncate">{rec.description[lang] || rec.description.en}</p>
                  </div>
                  <span className="text-muted-foreground text-sm">{dir === "rtl" ? "◀" : "▶"}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── STATS ROW ── */}
        <motion.div variants={itemVariants} className="flex justify-center gap-2 sm:gap-3 mb-6 flex-wrap">
          {[
            { emoji: "⭐", value: totalStars, label: t("home.stars"), gradient: "from-sunshine/10 to-sunshine/5" },
            { emoji: "🏅", value: badgeCount, label: lang === "he" ? "הישגים" : lang === "ar" ? "إنجازات" : "Badges", gradient: "from-candy/10 to-candy/5" },
            { emoji: level.emoji, value: `${t("home.level")} ${level.id}`, label: t(`level.${level.id}`), gradient: "from-primary/10 to-primary/5" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.08, y: -4 }}
              className={`card-glass flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-br ${stat.gradient} cursor-default`}
            >
              <motion.span
                className="text-xl sm:text-2xl"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
              >
                {stat.emoji}
              </motion.span>
              <div>
                <p className="font-display font-bold text-base sm:text-lg leading-tight">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── CURRENT LEVEL CARD ── */}
        <motion.div variants={itemVariants} className="max-w-lg mx-auto mb-8">
          <Card3D
            onClick={() => { playClickSound(); navigate("/levels"); }}
            className="group"
          >
            <div className="card-kid relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity" style={{ background: "var(--gradient-hero)" }} />
              <div className="relative flex items-center gap-4">
                <motion.div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-lg relative overflow-hidden"
                  style={{ background: "var(--gradient-hero)" }}
                  animate={{ rotate: [0, 3, -3, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  {level.emoji}
                  <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-display font-semibold mb-0.5">{t("home.currentLevel")}</p>
                  <h2 className="font-display text-base sm:text-lg font-bold truncate">{t("home.level")} {level.id}: {t(`level.${level.id}`)}</h2>
                  <div className="progress-bar h-2.5 sm:h-3 mt-2">
                    <motion.div
                      className="progress-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${(levelProgress.completed / levelProgress.total) * 100}%` }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.8 }}
                    />
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5">
                    {levelProgress.completed}/{levelProgress.total} {t("home.stagesCompleted")}
                    {nextLevel && ` • ${Math.max(0, nextLevel.starsToUnlock - totalStars)} ${t("home.moreToNext")}`}
                  </p>
                </div>
                <motion.span
                  className="text-primary text-lg sm:text-xl"
                  animate={{ x: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {dir === "rtl" ? "◀" : "▶"}
                </motion.span>
              </div>
            </div>
          </Card3D>
        </motion.div>

        {/* ── QUICK ACCESS GAMES ── */}
        <motion.div variants={itemVariants} className="mb-8">
          <h3 className="font-display text-lg sm:text-xl font-bold mb-4 text-center">{t("home.freePlay")}</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
            {quickAccessCards.map((card, i) => (
              <motion.button
                key={card.path}
                whileHover={{ y: -6, scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => { playClickSound(); navigate(card.path); }}
                className="game-card-3d group relative overflow-hidden rounded-2xl p-3 sm:p-4 text-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.06, type: "spring", stiffness: 220 }}
              >
                {/* Background glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-[0.15] dark:group-hover:opacity-[0.2] transition-opacity duration-300 rounded-2xl"
                  style={{ background: `radial-gradient(circle at 50% 40%, hsl(${card.color}), transparent 70%)` }}
                />
                <div className="relative z-10">
                  <motion.span
                    className="text-3xl sm:text-4xl block mb-1.5 drop-shadow-md"
                    whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    {card.emoji}
                  </motion.span>
                  <span className="font-display text-[10px] sm:text-xs font-bold block leading-tight">{t(card.titleKey)}</span>
                </div>
                {/* Bottom shine */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, transparent, hsl(${card.color}), transparent)` }}
                />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── ACTION BUTTONS ── */}
        <motion.div variants={itemVariants} className="text-center mb-8 flex gap-3 justify-center flex-wrap">
          <motion.button
            whileHover={{ scale: 1.06, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playClickSound(); navigate("/levels"); }}
            className="btn-kid gradient-primary text-primary-foreground text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 shadow-xl"
          >
            <span className="relative z-10 flex items-center gap-2">
              🗺️ {t("home.myJourney")}
            </span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.06, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playClickSound(); navigate("/achievements"); }}
            className="btn-kid bg-card text-foreground text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 border border-border shadow-lg"
          >
            🏅 {lang === "he" ? "הישגים" : lang === "ar" ? "إنجازات" : "Badges"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.06, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playClickSound(); navigate("/report"); }}
            className="btn-kid bg-card text-foreground text-sm px-5 py-3 border border-border shadow-lg"
          >
            📋 {lang === "he" ? "דוח התקדמות" : lang === "ar" ? "تقرير التقدم" : "Report"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.06, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playClickSound(); navigate("/settings"); }}
            className="btn-kid bg-card text-foreground text-sm px-5 py-3 border border-border shadow-lg"
          >
            ⚙️ {lang === "he" ? "הגדרות" : lang === "ar" ? "إعدادات" : "Settings"}
          </motion.button>
        </motion.div>

        {/* ── FUN FACT ── */}
        <motion.div variants={itemVariants} className="max-w-lg mx-auto">
          <Card3D intensity={8}>
            <div className="card-kid text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sunshine/5 to-primary/5 dark:from-sunshine/3 dark:to-primary/3" />
              <motion.div
                className="text-4xl sm:text-5xl mb-3 relative z-10"
                animate={{ rotate: [0, 5, -5, 0], y: [0, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                💡
              </motion.div>
              <h3 className="font-display text-base sm:text-lg font-bold mb-2 relative z-10">{t("home.didYouKnow")}</h3>
              <p className="text-muted-foreground font-body text-xs sm:text-sm relative z-10 leading-relaxed">{t(`home.funFact${funFactIndex}`)}</p>
            </div>
          </Card3D>
        </motion.div>

        <div className="h-6" />
      </motion.div>
    </div>
  );
};

export default Index;
