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
import { Zap, Trophy, ArrowRight, Map, Star, BookOpen, Gamepad2 } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const item = {
  hidden: { y: 14, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

const gameCards = [
  { titleKey: "quick.alphabet", emoji: "🔤", path: "/alphabet", color: "bg-sky/10 dark:bg-sky/15", iconColor: "text-sky" },
  { titleKey: "quick.words", emoji: "📝", path: "/words", color: "bg-grass/10 dark:bg-grass/15", iconColor: "text-grass" },
  { titleKey: "quick.match", emoji: "🧩", path: "/memory", color: "bg-lavender/10 dark:bg-lavender/15", iconColor: "text-lavender" },
  { titleKey: "quick.quiz", emoji: "🎯", path: "/quiz", color: "bg-accent/10 dark:bg-accent/15", iconColor: "text-accent" },
  { titleKey: "quick.spelling", emoji: "🐝", path: "/spelling", color: "bg-sunshine/10 dark:bg-sunshine/15", iconColor: "text-sunshine" },
  { titleKey: "quick.scramble", emoji: "🔀", path: "/scramble", color: "bg-candy/10 dark:bg-candy/15", iconColor: "text-candy" },
  { titleKey: "quick.hangman", emoji: "🎭", path: "/hangman", color: "bg-sky/10 dark:bg-sky/15", iconColor: "text-sky" },
];

const TypingText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 55);
    return () => clearInterval(interval);
  }, [text, started]);

  return (
    <span>
      {displayed}
      {started && displayed.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-[3px] h-[1em] bg-primary align-middle ms-0.5 rounded-full"
        />
      )}
    </span>
  );
};

const HeroBurst = ({ show }: { show: boolean }) => {
  if (!show) return null;
  const particles = Array.from({ length: 16 }, (_, i) => ({
    angle: (i * 360) / 16,
    distance: 60 + Math.random() * 80,
    size: 4 + Math.random() * 6,
    color: ["hsl(var(--primary))", "hsl(var(--sunshine))", "hsl(var(--candy))", "hsl(var(--sky))", "hsl(var(--accent))"][i % 5],
    delay: Math.random() * 0.15,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ width: p.size, height: p.size, background: p.color }}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [1, 1, 0],
            scale: [0, 1.5, 0.5],
            x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
            y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
          }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.4 + p.delay }}
        />
      ))}
    </div>
  );
};

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
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    setTotalStars(getTotalEarnedStars());
    setCurrentLevel(getCurrentLevel());
    setBadgeCount(getUnlockedAchievements().length);
    setXpState(getXP());
    setDailyChallenge(getDailyChallenge());
    setRecommendations(getSmartRecommendations(lang));
    setMotivation(getMotivationalMessage(lang));
    
    const t0 = setTimeout(() => setHeroReady(true), 200);
    const t1 = setTimeout(() => setMascotMood("wave"), 600);
    const t2 = setTimeout(() => setMascotMood("idle"), 2200);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
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

  const xpPercent = Math.min((xpLevel.current / xpLevel.needed) * 100, 100);
  const levelPercent = (levelProgress.completed / levelProgress.total) * 100;

  return (
    <div className="min-h-screen relative" dir={dir}>
      <FloatingParticles count={8} />
      
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10"
      >
        {/* ── HERO ── */}
        <motion.section variants={item} className="text-center mb-8 sm:mb-12 relative">
          <HeroBurst show={heroReady} />
          
          <motion.div
            initial={{ scale: 0.3, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.1 }}
            className="inline-block mb-3 relative z-10"
          >
            <Interactive3DMascot
              mood={mascotMood}
              size="lg"
              onClick={() => {
                playClickSound();
                setMascotMood("celebrate");
                setTimeout(() => setMascotMood("idle"), 2000);
              }}
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold mb-2 text-gradient leading-tight"
          >
            <TypingText text={t("app.subtitle")} delay={500} />
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="text-base sm:text-lg text-muted-foreground font-body max-w-md mx-auto"
          >
            {t("app.description")} <span className="inline-block">🌟</span>
          </motion.p>
        </motion.section>

        {/* ── STATS ROW ── */}
        <motion.section variants={item} className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8 max-w-lg mx-auto">
          {[
            { icon: <Star className="w-5 h-5 text-sunshine fill-sunshine" />, value: totalStars, label: t("home.stars") },
            { icon: <Trophy className="w-5 h-5 text-accent" />, value: badgeCount, label: lang === "he" ? "הישגים" : lang === "ar" ? "إنجازات" : "Badges" },
            { icon: <Zap className="w-5 h-5 text-primary" />, value: `${xpState.totalXP}`, label: "XP" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-card rounded-xl p-3 sm:p-4 text-center border border-border hover:border-primary/20 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-[border-color] duration-300 cursor-default"
            >
              <div className="flex justify-center mb-1.5">{stat.icon}</div>
              <p className="font-display font-extrabold text-xl sm:text-2xl leading-none">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* ── XP + LEVEL PROGRESS ── */}
        <motion.section variants={item} className="max-w-lg mx-auto mb-6 sm:mb-8 space-y-3">
          {/* XP Progress */}
          <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: "var(--gradient-hero)" }}>
                  {xpLevel.title.split(" ")[0]}
                </div>
                <span className="font-display font-bold text-sm">
                  {lang === "he" ? "רמה" : lang === "ar" ? "المستوى" : "Level"} {xpLevel.level}
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-display font-semibold">
                {xpLevel.current}/{xpLevel.needed} XP
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "var(--gradient-hero)" }}
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              />
            </div>
          </div>

          {/* Streak */}
          {xpState.streak > 0 && (
            <div className="flex items-center gap-2 px-3.5 py-2 bg-accent/8 dark:bg-accent/12 rounded-lg w-fit">
              <span className="text-sm">🔥</span>
              <span className="font-display font-bold text-xs text-accent">
                {xpState.streak} {lang === "he" ? "ימים ברצף" : lang === "ar" ? "أيام متتالية" : "day streak"}
              </span>
            </div>
          )}
        </motion.section>

        {/* ── DAILY + WORD ── */}
        <motion.section variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto mb-6 sm:mb-8">
          <DailyChallengeCard key={refreshKey} challenge={dailyChallenge} onUpdate={refreshStats} />
          <WordOfTheDay />
        </motion.section>

        {/* ── MOTIVATION ── */}
        <motion.section variants={item} className="max-w-lg mx-auto mb-6 sm:mb-8">
          <div className="flex items-center gap-3 justify-center py-3 px-5 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/10">
            <span className="text-xl">{motivation.emoji}</span>
            <span className="font-display font-bold text-sm text-foreground">{motivation.text}</span>
          </div>
        </motion.section>

        {/* ── CURRENT LEVEL ── */}
        <motion.section variants={item} className="max-w-lg mx-auto mb-8 sm:mb-10">
          <Card3D onClick={() => { playClickSound(); navigate("/levels"); }}>
            <div className="bg-card rounded-xl p-4 sm:p-5 border border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:border-primary/25 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-sm" style={{ background: "var(--gradient-hero)" }}>
                  {level.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Map className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-display font-semibold">{t("home.currentLevel")}</p>
                  </div>
                  <h2 className="font-display text-base sm:text-lg font-bold truncate">
                    {t("home.level")} {level.id}: {t(`level.${level.id}`)}
                  </h2>
                  <div className="h-2 mt-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${levelPercent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 font-display">
                    {levelProgress.completed}/{levelProgress.total} {t("home.stagesCompleted")}
                    {nextLevel && ` · ${Math.max(0, nextLevel.starsToUnlock - totalStars)} ${t("home.moreToNext")}`}
                  </p>
                </div>
                <ArrowRight className={`w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors ${dir === "rtl" ? "rotate-180" : ""}`} />
              </div>
            </div>
          </Card3D>
        </motion.section>

        {/* ── RECOMMENDATIONS ── */}
        {recommendations.length > 0 && (
          <motion.section variants={item} className="max-w-lg mx-auto mb-8 sm:mb-10">
            <h3 className="font-display text-sm font-bold mb-3 text-muted-foreground flex items-center gap-1.5 justify-center">
              <BookOpen className="w-4 h-4" />
              {lang === "he" ? "מומלץ עבורך" : lang === "ar" ? "مُوصى لك" : "Recommended for You"}
            </h3>
            <div className="space-y-2">
              {recommendations.map((rec) => (
                <button
                  key={rec.reason}
                  onClick={() => { playClickSound(); navigate(rec.path); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/25 text-start transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] group"
                >
                  <span className="text-2xl">{rec.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm">{rec.title[lang] || rec.title.en}</p>
                    <p className="text-xs text-muted-foreground truncate">{rec.description[lang] || rec.description.en}</p>
                  </div>
                  <ArrowRight className={`w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ${dir === "rtl" ? "rotate-180" : ""}`} />
                </button>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── GAMES GRID ── */}
        <motion.section variants={item} className="mb-8 sm:mb-10">
          <h3 className="font-display text-lg sm:text-xl font-bold mb-4 text-center flex items-center gap-2 justify-center">
            <Gamepad2 className="w-5 h-5 text-primary" />
            {t("home.freePlay")}
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
            {gameCards.map((card, i) => (
              <motion.button
                key={card.path}
                whileHover={{ y: -5, scale: 1.04 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => { playClickSound(); navigate(card.path); }}
                className={`${card.color} rounded-xl p-3 sm:p-4 text-center border border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] group`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.03, duration: 0.3 }}
              >
                <span className="text-2xl sm:text-3xl block mb-1 group-hover:scale-110 transition-transform duration-200">
                  {card.emoji}
                </span>
                <span className="font-display text-[10px] sm:text-xs font-bold block leading-tight">{t(card.titleKey)}</span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* ── CTA BUTTONS ── */}
        <motion.section variants={item} className="text-center mb-8 sm:mb-10 flex gap-2 sm:gap-3 justify-center flex-wrap">
          <button
            onClick={() => { playClickSound(); navigate("/levels"); }}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display font-bold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-button-hover)] hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200"
          >
            <Map className="w-4 h-4 sm:w-5 sm:h-5" />
            {t("home.myJourney")}
            <ArrowRight className={`w-4 h-4 ${dir === "rtl" ? "rotate-180" : ""}`} />
          </button>
          
          {[
            { path: "/achievements", icon: <Trophy className="w-4 h-4" />, label: lang === "he" ? "הישגים" : lang === "ar" ? "إنجازات" : "Badges" },
            { path: "/report", icon: "📋", label: lang === "he" ? "דוח" : lang === "ar" ? "تقرير" : "Report" },
            { path: "/settings", icon: "⚙️", label: lang === "he" ? "הגדרות" : lang === "ar" ? "إعدادات" : "Settings" },
          ].map(btn => (
            <button
              key={btn.path}
              onClick={() => { playClickSound(); navigate(btn.path); }}
              className="inline-flex items-center gap-1.5 bg-card text-foreground font-display font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-border hover:border-primary/25 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200"
            >
              {typeof btn.icon === "string" ? <span>{btn.icon}</span> : btn.icon}
              {btn.label}
            </button>
          ))}
        </motion.section>

        {/* ── FUN FACT ── */}
        <motion.section variants={item} className="max-w-lg mx-auto">
          <div className="bg-card rounded-xl p-5 sm:p-6 border border-border shadow-sm text-center">
            <span className="text-3xl sm:text-4xl block mb-2">💡</span>
            <h3 className="font-display text-base sm:text-lg font-bold mb-1.5">{t("home.didYouKnow")}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{t(`home.funFact${funFactIndex}`)}</p>
          </div>
        </motion.section>

        <div className="h-6 sm:h-8" />
      </motion.div>
    </div>
  );
};

export default Index;
