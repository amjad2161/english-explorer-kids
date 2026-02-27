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
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

const quickAccessCards = [
  { titleKey: "quick.alphabet", emoji: "🔤", path: "/alphabet", accent: "var(--sky)" },
  { titleKey: "quick.words", emoji: "📝", path: "/words", accent: "var(--grass)" },
  { titleKey: "quick.match", emoji: "🧩", path: "/memory", accent: "var(--lavender)" },
  { titleKey: "quick.quiz", emoji: "🎯", path: "/quiz", accent: "var(--primary)" },
  { titleKey: "quick.spelling", emoji: "🐝", path: "/spelling", accent: "var(--sunshine)" },
  { titleKey: "quick.scramble", emoji: "🔀", path: "/scramble", accent: "var(--candy)" },
  { titleKey: "quick.hangman", emoji: "🎭", path: "/hangman", accent: "var(--sky)" },
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
      <FloatingParticles count={14} />
      
      {/* Soft ambient background — no jarring movement */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute rounded-full"
          style={{
            width: 900, height: 900,
            background: "radial-gradient(ellipse, hsl(var(--primary) / 0.06), transparent 65%)",
            top: "-25%", right: "-20%",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 700, height: 700,
            background: "radial-gradient(ellipse, hsl(var(--lavender) / 0.05), transparent 65%)",
            bottom: "-15%", left: "-15%",
          }}
        />
      </div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-4 py-8 relative z-10"
      >
        {/* ── HERO ── */}
        <motion.div variants={itemVariants} className="text-center mb-10 relative">
          <div className="relative inline-block mb-4">
            <Interactive3DMascot
              mood={mascotMood}
              size="lg"
              onClick={() => {
                playClickSound();
                setMascotMood("celebrate");
                setTimeout(() => setMascotMood("idle"), 2000);
              }}
            />
            <AnimatePresence>
              {mascotMood === "wave" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 40, y: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 55, y: -35 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-0 end-0 bg-card/90 backdrop-blur-xl rounded-2xl px-4 py-2 shadow-lg border border-primary/10 z-20"
                >
                  <span className="font-display font-bold text-sm">
                    {lang === "he" ? "!שלום" : lang === "ar" ? "!مرحبًا" : "Hi there!"} 👋
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl font-display font-extrabold mb-3 leading-tight tracking-tight"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--candy)), hsl(var(--lavender)))",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "aurora 8s ease-in-out infinite",
            }}
          >
            {t("app.subtitle")}
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg text-muted-foreground font-body max-w-lg mx-auto">
            🌟 {t("app.description")} 🌟
          </motion.p>
        </motion.div>

        {/* ── XP BAR ── */}
        <motion.div variants={itemVariants} className="max-w-xl mx-auto mb-8">
          <div className="bg-card/70 backdrop-blur-md rounded-2xl p-5 border border-border/50 shadow-sm">
            <div className="flex items-center gap-4 mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md"
                style={{ background: "var(--gradient-hero)" }}
              >
                {xpLevel.title.split(" ")[0]}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <span className="font-display font-bold text-sm">
                    {lang === "he" ? "רמה" : lang === "ar" ? "المستوى" : "Level"} {xpLevel.level}
                  </span>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm text-muted-foreground font-display font-semibold">
                      {xpState.totalXP} XP
                    </span>
                  </div>
                </div>
                <div className="h-3 mt-2 rounded-full overflow-hidden bg-muted/30">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--candy)))",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((xpLevel.current / xpLevel.needed) * 100, 100)}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                  />
                </div>
              </div>
            </div>
            {xpState.streak > 0 && (
              <div className="flex items-center gap-2 bg-primary/8 rounded-full px-3 py-1 w-fit">
                <span className="text-sm">🔥</span>
                <span className="font-display font-bold text-xs text-primary">
                  {xpState.streak} {lang === "he" ? "ימים" : lang === "ar" ? "أيام" : "days"}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── STATS ── */}
        <motion.div variants={itemVariants} className="flex justify-center gap-3 mb-8 flex-wrap">
          {[
            { emoji: "⭐", value: totalStars, label: t("home.stars") },
            { emoji: "🏅", value: badgeCount, label: lang === "he" ? "הישגים" : lang === "ar" ? "إنجازات" : "Badges" },
            { emoji: level.emoji, value: `${t("home.level")} ${level.id}`, label: t(`level.${level.id}`) },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="bg-card/70 backdrop-blur-md flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-border/50 shadow-sm cursor-default"
            >
              <span className="text-2xl">{stat.emoji}</span>
              <div>
                <p className="font-display font-bold text-lg leading-tight">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground font-semibold">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── DAILY + WORD ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
          <motion.div variants={itemVariants}>
            <DailyChallengeCard key={refreshKey} challenge={dailyChallenge} onUpdate={refreshStats} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <WordOfTheDay />
          </motion.div>
        </div>

        {/* ── MOTIVATION ── */}
        <motion.div variants={itemVariants} className="max-w-xl mx-auto mb-8">
          <div 
            className="flex items-center gap-3 justify-center py-3 px-5 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary) / 0.06), hsl(var(--candy) / 0.04))",
              border: "1px solid hsl(var(--primary) / 0.08)",
            }}
          >
            <span className="text-xl">{motivation.emoji}</span>
            <span className="font-display font-bold text-sm">{motivation.text}</span>
          </div>
        </motion.div>

        {/* ── RECOMMENDATIONS ── */}
        {recommendations.length > 0 && (
          <motion.div variants={itemVariants} className="max-w-xl mx-auto mb-8">
            <h3 className="font-display text-sm font-bold mb-3 text-center text-muted-foreground">
              💡 {lang === "he" ? "מומלץ עבורך" : lang === "ar" ? "مُوصى لك" : "Recommended for You"}
            </h3>
            <div className="space-y-2">
              {recommendations.map((rec) => (
                <motion.button
                  key={rec.reason}
                  whileHover={{ x: dir === "rtl" ? -4 : 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { playClickSound(); navigate(rec.path); }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-card/70 backdrop-blur-md border border-border/50 hover:border-primary/20 text-start transition-colors"
                >
                  <span className="text-2xl">{rec.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm">{rec.title[lang] || rec.title.en}</p>
                    <p className="text-xs text-muted-foreground truncate">{rec.description[lang] || rec.description.en}</p>
                  </div>
                  <span className="text-muted-foreground text-xs">{dir === "rtl" ? "◀" : "▶"}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── CURRENT LEVEL ── */}
        <motion.div variants={itemVariants} className="max-w-xl mx-auto mb-10">
          <Card3D onClick={() => { playClickSound(); navigate("/levels"); }} className="group">
            <div className="bg-card/70 backdrop-blur-md rounded-2xl p-5 border border-border/50 shadow-sm hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-md"
                  style={{ background: "var(--gradient-hero)" }}
                >
                  {level.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Map className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-display font-semibold">{t("home.currentLevel")}</p>
                  </div>
                  <h2 className="font-display text-lg font-bold truncate">{t("home.level")} {level.id}: {t(`level.${level.id}`)}</h2>
                  <div className="h-2.5 mt-2 rounded-full overflow-hidden bg-muted/30">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${(levelProgress.completed / levelProgress.total) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 font-display">
                    {levelProgress.completed}/{levelProgress.total} {t("home.stagesCompleted")}
                    {nextLevel && ` • ${Math.max(0, nextLevel.starsToUnlock - totalStars)} ${t("home.moreToNext")}`}
                  </p>
                </div>
                <span className="text-muted-foreground text-sm">{dir === "rtl" ? "◀" : "▶"}</span>
              </div>
            </div>
          </Card3D>
        </motion.div>

        {/* ── QUICK ACCESS GAMES ── */}
        <motion.div variants={itemVariants} className="mb-10">
          <h3 className="font-display text-xl font-bold mb-5 text-center">
            <Sparkles className="w-4 h-4 inline-block text-primary me-1.5" />
            {t("home.freePlay")}
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {quickAccessCards.map((card, i) => (
              <motion.button
                key={card.path}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { playClickSound(); navigate(card.path); }}
                className="bg-card/70 backdrop-blur-md border border-border/50 hover:border-primary/20 rounded-2xl p-4 text-center transition-colors shadow-sm group"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.04, duration: 0.4 }}
              >
                <span className="text-3xl sm:text-4xl block mb-2 group-hover:scale-110 transition-transform duration-200">
                  {card.emoji}
                </span>
                <span className="font-display text-xs font-bold block leading-tight">{t(card.titleKey)}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── ACTION BUTTONS ── */}
        <motion.div variants={itemVariants} className="text-center mb-10 flex gap-3 justify-center flex-wrap">
          <motion.button
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { playClickSound(); navigate("/levels"); }}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display font-bold text-base px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <Map className="w-5 h-5" />
            {t("home.myJourney")}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { playClickSound(); navigate("/achievements"); }}
            className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm text-foreground font-display font-bold text-sm px-6 py-3.5 rounded-xl border border-border/50 shadow-sm hover:border-primary/20 transition-colors"
          >
            <Trophy className="w-4 h-4" />
            {lang === "he" ? "הישגים" : lang === "ar" ? "إنجازات" : "Badges"}
          </motion.button>
          <motion.button
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { playClickSound(); navigate("/report"); }}
            className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm text-foreground font-display font-bold text-sm px-6 py-3.5 rounded-xl border border-border/50 shadow-sm hover:border-primary/20 transition-colors"
          >
            📋 {lang === "he" ? "דוח התקדמות" : lang === "ar" ? "تقرير التقدم" : "Report"}
          </motion.button>
          <motion.button
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { playClickSound(); navigate("/settings"); }}
            className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm text-foreground font-display font-bold text-sm px-6 py-3.5 rounded-xl border border-border/50 shadow-sm hover:border-primary/20 transition-colors"
          >
            ⚙️ {lang === "he" ? "הגדרות" : lang === "ar" ? "إعدادات" : "Settings"}
          </motion.button>
        </motion.div>

        {/* ── FUN FACT ── */}
        <motion.div variants={itemVariants} className="max-w-xl mx-auto">
          <Card3D intensity={6}>
            <div className="bg-card/70 backdrop-blur-md rounded-2xl p-6 border border-border/50 shadow-sm text-center">
              <span className="text-4xl block mb-3">💡</span>
              <h3 className="font-display text-lg font-bold mb-2">{t("home.didYouKnow")}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t(`home.funFact${funFactIndex}`)}</p>
            </div>
          </Card3D>
        </motion.div>

        <div className="h-8" />
      </motion.div>
    </div>
  );
};

export default Index;
