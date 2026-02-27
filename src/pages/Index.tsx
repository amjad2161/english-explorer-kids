import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useLanguage } from "@/lib/i18n";
import { getCurrentLevel, getTotalEarnedStars, levels, getLevelProgress } from "@/lib/levels";
import { getUnlockedAchievements } from "@/lib/achievements";
import { getXP, getLevel, getDailyChallenge } from "@/lib/xp";
import { playClickSound } from "@/lib/sounds";
import CinematicBackground from "@/components/CinematicBackground";
import PremiumGameCard from "@/components/PremiumGameCard";
import AnimatedSection from "@/components/AnimatedSection";
import Card3D from "@/components/Card3D";
import DailyChallengeCard from "@/components/DailyChallengeCard";
import WordOfTheDay from "@/components/WordOfTheDay";
import { getSmartRecommendations, getMotivationalMessage, Recommendation } from "@/lib/recommendations";
import Interactive3DMascot from "@/components/Interactive3DMascot";
import { Zap, Trophy, ArrowRight, Map, Star, BookOpen, Gamepad2, Sparkles } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
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

/* ─── Cinematic typing effect ─── */
const TypingText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 50);
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

/* ─── Hero burst particles ─── */
const HeroBurst = ({ show }: { show: boolean }) => {
  if (!show) return null;
  const particles = Array.from({ length: 20 }, (_, i) => ({
    angle: (i * 360) / 20,
    distance: 50 + Math.random() * 100,
    size: 3 + Math.random() * 5,
    color: ["hsl(var(--primary))", "hsl(var(--sunshine))", "hsl(var(--candy))", "hsl(var(--sky))", "hsl(var(--accent))"][i % 5],
    delay: Math.random() * 0.2,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ width: p.size, height: p.size, background: p.color, boxShadow: `0 0 ${p.size * 2}px ${p.color}` }}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [1, 1, 0],
            scale: [0, 1.8, 0.3],
            x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
            y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
          }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 + p.delay }}
        />
      ))}
    </div>
  );
};

/* ─── Premium stat card ─── */
const StatCard = ({ icon, value, label, delay }: { icon: React.ReactNode; value: string | number; label: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ type: "spring", stiffness: 200, damping: 18, delay }}
    whileHover={{ y: -4, scale: 1.04 }}
    whileTap={{ scale: 0.96 }}
    className="bg-card rounded-2xl p-3.5 sm:p-4 text-center border border-border hover:border-primary/20 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-[border-color] duration-300 cursor-default relative overflow-hidden group"
  >
    {/* Hover glow */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      style={{ background: "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.06), transparent 70%)" }}
    />
    <div className="flex justify-center mb-1.5 relative">{icon}</div>
    <p className="font-display font-extrabold text-xl sm:text-2xl leading-none relative">{value}</p>
    <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold mt-0.5 relative">{label}</p>
  </motion.div>
);

const Index = () => {
  const navigate = useNavigate();
  const { t, dir, lang } = useLanguage();
  const [totalStars, setTotalStars] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [badgeCount, setBadgeCount] = useState(0);
  const [xpState, setXpState] = useState(getXP());
  const [dailyChallenge, setDailyChallenge] = useState(getDailyChallenge());
  const [mascotMood, setMascotMood] = useState<"idle" | "wave" | "celebrate" | "surprised">("idle");
  const [speechBubble, setSpeechBubble] = useState<string | undefined>();
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
    const t1 = setTimeout(() => {
      setMascotMood("wave");
      const greetings = {
        he: "!שלום 👋",
        ar: "!مرحباً 👋",
        en: "Hello! 👋",
      };
      setSpeechBubble(greetings[lang] || greetings.en);
    }, 800);
    const t2 = setTimeout(() => { setMascotMood("idle"); setSpeechBubble(undefined); }, 3000);
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

  const handleMascotClick = () => {
    playClickSound();
    setMascotMood("celebrate");
    const celebrations = {
      he: "!יאללה 🎉",
      ar: "!هيّا 🎉",
      en: "Let's go! 🎉",
    };
    setSpeechBubble(celebrations[lang] || celebrations.en);
    setTimeout(() => { setMascotMood("idle"); setSpeechBubble(undefined); }, 2000);
  };

  const xpPercent = Math.min((xpLevel.current / xpLevel.needed) * 100, 100);
  const levelPercent = (levelProgress.completed / levelProgress.total) * 100;

  return (
    <div className="min-h-screen relative" dir={dir}>
      <CinematicBackground />

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10"
      >
        {/* ── CINEMATIC HERO ── */}
        <motion.section variants={item} className="text-center mb-8 sm:mb-12 relative">
          <HeroBurst show={heroReady} />

          <motion.div
            initial={{ scale: 0.2, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 16, delay: 0.1 }}
            className="inline-block mb-3 relative z-10"
          >
            <Interactive3DMascot
              mood={mascotMood}
              size="lg"
              onClick={handleMascotClick}
              showSpeechBubble={speechBubble}
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold mb-2 text-gradient leading-tight"
          >
            <TypingText text={t("app.subtitle")} delay={600} />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="text-base sm:text-lg text-muted-foreground font-body max-w-md mx-auto"
          >
            {t("app.description")} <span className="inline-block">🌟</span>
          </motion.p>
        </motion.section>

        {/* ── STATS ROW (Premium cards) ── */}
        <motion.section variants={item} className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-6 sm:mb-8 max-w-lg mx-auto">
          <StatCard
            icon={<Star className="w-5 h-5 text-sunshine fill-sunshine" />}
            value={totalStars}
            label={t("home.stars")}
            delay={0.3}
          />
          <StatCard
            icon={<Trophy className="w-5 h-5 text-accent" />}
            value={badgeCount}
            label={lang === "he" ? "הישגים" : lang === "ar" ? "إنجازات" : "Badges"}
            delay={0.4}
          />
          <StatCard
            icon={<Zap className="w-5 h-5 text-primary" />}
            value={`${xpState.totalXP}`}
            label="XP"
            delay={0.5}
          />
        </motion.section>

        {/* ── XP + LEVEL PROGRESS ── */}
        <AnimatedSection className="max-w-lg mx-auto mb-6 sm:mb-8 space-y-3" delay={0.1}>
          <div className="bg-card rounded-2xl p-4 border border-border shadow-[var(--shadow-card)] relative overflow-hidden">
            {/* Shimmer effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              <motion.div
                className="w-1/3 h-full bg-gradient-to-r from-transparent via-primary/[0.03] to-transparent skew-x-12"
                animate={{ x: ["-100%", "400%"] }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
              />
            </div>

            <div className="flex items-center justify-between mb-2 relative">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-md"
                  style={{ background: "var(--gradient-hero)" }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {xpLevel.title.split(" ")[0]}
                </motion.div>
                <span className="font-display font-bold text-sm">
                  {lang === "he" ? "רמה" : lang === "ar" ? "المستوى" : "Level"} {xpLevel.level}
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-display font-semibold">
                {xpLevel.current}/{xpLevel.needed} XP
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-muted overflow-hidden relative">
              <motion.div
                className="h-full rounded-full relative overflow-hidden"
                style={{ background: "var(--gradient-hero)" }}
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
                />
              </motion.div>
            </div>
          </div>

          {xpState.streak > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 px-3.5 py-2 bg-accent/8 dark:bg-accent/12 rounded-xl w-fit border border-accent/10"
            >
              <span className="text-sm">🔥</span>
              <span className="font-display font-bold text-xs text-accent">
                {xpState.streak} {lang === "he" ? "ימים ברצף" : lang === "ar" ? "أيام متتالية" : "day streak"}
              </span>
            </motion.div>
          )}
        </AnimatedSection>

        {/* ── DAILY + WORD ── */}
        <AnimatedSection className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto mb-6 sm:mb-8" delay={0.15}>
          <DailyChallengeCard key={refreshKey} challenge={dailyChallenge} onUpdate={refreshStats} />
          <WordOfTheDay />
        </AnimatedSection>

        {/* ── MOTIVATION ── */}
        <AnimatedSection className="max-w-lg mx-auto mb-6 sm:mb-8" delay={0.1}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 justify-center py-3 px-5 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10 relative overflow-hidden"
          >
            <span className="text-xl relative">{motivation.emoji}</span>
            <span className="font-display font-bold text-sm text-foreground relative">{motivation.text}</span>
          </motion.div>
        </AnimatedSection>

        {/* ── CURRENT LEVEL (Premium Card) ── */}
        <AnimatedSection className="max-w-lg mx-auto mb-8 sm:mb-10" delay={0.15}>
          <Card3D onClick={() => { playClickSound(); navigate("/levels"); }}>
            <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:border-primary/25 transition-[border-color,box-shadow] duration-300 cursor-pointer group relative overflow-hidden">
              {/* Ambient glow */}
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.08), transparent 70%)" }}
              />

              <div className="flex items-center gap-3 sm:gap-4 relative">
                <motion.div
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-md"
                  style={{ background: "var(--gradient-hero)" }}
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  {level.emoji}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Map className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-display font-semibold">{t("home.currentLevel")}</p>
                  </div>
                  <h2 className="font-display text-base sm:text-lg font-bold truncate">
                    {t("home.level")} {level.id}: {t(`level.${level.id}`)}
                  </h2>
                  <div className="h-2.5 mt-2 rounded-full bg-muted overflow-hidden relative">
                    <motion.div
                      className="h-full rounded-full bg-primary relative overflow-hidden"
                      initial={{ width: 0 }}
                      animate={{ width: `${levelPercent}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
                      />
                    </motion.div>
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
        </AnimatedSection>

        {/* ── RECOMMENDATIONS ── */}
        {recommendations.length > 0 && (
          <AnimatedSection className="max-w-lg mx-auto mb-8 sm:mb-10" delay={0.1}>
            <h3 className="font-display text-sm font-bold mb-3 text-muted-foreground flex items-center gap-1.5 justify-center">
              <Sparkles className="w-4 h-4" />
              {lang === "he" ? "מומלץ עבורך" : lang === "ar" ? "مُوصى لك" : "Recommended for You"}
            </h3>
            <div className="space-y-2">
              {recommendations.map((rec, i) => (
                <motion.button
                  key={rec.reason}
                  initial={{ opacity: 0, x: dir === "rtl" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  onClick={() => { playClickSound(); navigate(rec.path); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/25 text-start transition-[border-color,box-shadow] duration-300 hover:shadow-[var(--shadow-card-hover)] group"
                >
                  <motion.span className="text-2xl" whileHover={{ scale: 1.2, rotate: [-5, 5, 0] }}>
                    {rec.emoji}
                  </motion.span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm">{rec.title[lang] || rec.title.en}</p>
                    <p className="text-xs text-muted-foreground truncate">{rec.description[lang] || rec.description.en}</p>
                  </div>
                  <ArrowRight className={`w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ${dir === "rtl" ? "rotate-180" : ""}`} />
                </motion.button>
              ))}
            </div>
          </AnimatedSection>
        )}

        {/* ── GAMES GRID (Premium Cards) ── */}
        <AnimatedSection className="mb-8 sm:mb-10" delay={0.1}>
          <h3 className="font-display text-lg sm:text-xl font-bold mb-5 text-center flex items-center gap-2 justify-center">
            <Gamepad2 className="w-5 h-5 text-primary" />
            {t("home.freePlay")}
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            {gameCards.map((card, i) => (
              <PremiumGameCard
                key={card.path}
                emoji={card.emoji}
                title={t(card.titleKey)}
                color={card.color}
                index={i}
                onClick={() => { playClickSound(); navigate(card.path); }}
              />
            ))}
          </div>
        </AnimatedSection>

        {/* ── CTA BUTTONS ── */}
        <AnimatedSection className="text-center mb-8 sm:mb-10 flex gap-2 sm:gap-3 justify-center flex-wrap" delay={0.1}>
          <motion.button
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { playClickSound(); navigate("/levels"); }}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display font-bold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-button-hover)] transition-shadow duration-300"
          >
            <Map className="w-4 h-4 sm:w-5 sm:h-5" />
            {t("home.myJourney")}
            <ArrowRight className={`w-4 h-4 ${dir === "rtl" ? "rotate-180" : ""}`} />
          </motion.button>

          {[
            { path: "/achievements", icon: <Trophy className="w-4 h-4" />, label: lang === "he" ? "הישגים" : lang === "ar" ? "إنجازات" : "Badges" },
            { path: "/report", icon: "📋", label: lang === "he" ? "דוח" : lang === "ar" ? "تقرير" : "Report" },
            { path: "/settings", icon: "⚙️", label: lang === "he" ? "הגדרות" : lang === "ar" ? "إعدادات" : "Settings" },
          ].map(btn => (
            <motion.button
              key={btn.path}
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { playClickSound(); navigate(btn.path); }}
              className="inline-flex items-center gap-1.5 bg-card text-foreground font-display font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-border hover:border-primary/25 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-[border-color,box-shadow] duration-300"
            >
              {typeof btn.icon === "string" ? <span>{btn.icon}</span> : btn.icon}
              {btn.label}
            </motion.button>
          ))}
        </AnimatedSection>

        {/* ── FUN FACT ── */}
        <AnimatedSection className="max-w-lg mx-auto" delay={0.1}>
          <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-[var(--shadow-card)] text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{
              background: "radial-gradient(circle at 50% 0%, hsl(var(--sunshine) / 0.04), transparent 60%)"
            }} />
            <span className="text-3xl sm:text-4xl block mb-2 relative">💡</span>
            <h3 className="font-display text-base sm:text-lg font-bold mb-1.5 relative">{t("home.didYouKnow")}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed relative">{t(`home.funFact${funFactIndex}`)}</p>
          </div>
        </AnimatedSection>

        <div className="h-6 sm:h-8" />
      </motion.div>
    </div>
  );
};

export default Index;
