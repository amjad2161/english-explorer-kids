import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useLanguage } from "@/lib/i18n";
import { getCurrentLevel, getTotalEarnedStars, levels, getLevelProgress } from "@/lib/levels";
import { getUnlockedAchievements } from "@/lib/achievements";
import { getXP, getLevel, getDailyChallenge } from "@/lib/xp";
import { playClickSound } from "@/lib/sounds";
import MagicalLibraryBackground from "@/components/MagicalLibraryBackground";
import PremiumGameCard from "@/components/PremiumGameCard";
import AnimatedSection from "@/components/AnimatedSection";
import Card3D from "@/components/Card3D";
import DailyChallengeCard from "@/components/DailyChallengeCard";
import WordOfTheDay from "@/components/WordOfTheDay";
import { getSmartRecommendations, getMotivationalMessage, Recommendation } from "@/lib/recommendations";
import { useAgeAdaptive } from "@/hooks/useAgeAdaptive";
import { Zap, Trophy, ArrowRight, Map, Star, Sparkles, BookOpen, Shield } from "lucide-react";

/* ─── Animation variants ─── */
const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.6 } },
};

const item = {
  hidden: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

/* ─── Floating magical runes around the title ─── */
const RUNES = ["ᚠ", "ᚡ", "ᚢ", "ᚣ", "ᚤ", "ᚥ", "ᚦ", "ᚧ", "✦", "◆", "⟡"];

const FloatingRune = ({ index }: { index: number }) => {
  const angle = (index / RUNES.length) * Math.PI * 2;
  const radius = 130 + (index % 3) * 30;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius * 0.5;

  return (
    <motion.span
      className="absolute text-xs font-bold pointer-events-none select-none"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        color: `hsl(var(--library-gold) / ${0.15 + (index % 4) * 0.08})`,
        textShadow: `0 0 8px hsl(var(--library-glow) / 0.3)`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0.1, 0.35, 0.1],
        scale: [0.8, 1.1, 0.8],
        y: [0, -8, 0],
        rotate: [0, 15, -15, 0],
      }}
      transition={{
        duration: 6 + index * 0.7,
        repeat: Infinity,
        delay: index * 0.4,
        ease: "easeInOut",
      }}
    >
      {RUNES[index]}
    </motion.span>
  );
};

/* ─── Book-opening cinematic entrance ─── */
const BookOpenEntrance = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "hsl(20 30% 4%)" }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.8, delay: 1.4 }}
    >
      {/* Central light burst */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 10,
          height: 10,
          background: "radial-gradient(circle, hsl(var(--library-gold)), hsl(var(--library-gold-dim)), transparent)",
        }}
        animate={{
          width: [10, 800],
          height: [10, 800],
          opacity: [1, 0.6, 0],
        }}
        transition={{ duration: 1.6, ease: "easeOut", delay: 0.3 }}
      />

      {/* Book spine lines */}
      <motion.div
        className="absolute w-px h-32"
        style={{ background: `linear-gradient(180deg, transparent, hsl(var(--library-gold)), transparent)` }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: [0, 1, 1], opacity: [0, 1, 0] }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Left page */}
      <motion.div
        className="absolute w-40 h-52 rounded-sm origin-right"
        style={{
          background: `linear-gradient(90deg, hsl(35 30% 85%), hsl(35 20% 75%))`,
          boxShadow: "inset -4px 0 8px hsl(25 30% 20% / 0.2)",
          right: "50%",
        }}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: -80 }}
        transition={{ duration: 1, ease: [0.33, 1, 0.68, 1], delay: 0.2 }}
      />
      {/* Right page */}
      <motion.div
        className="absolute w-40 h-52 rounded-sm origin-left"
        style={{
          background: `linear-gradient(-90deg, hsl(35 30% 85%), hsl(35 20% 75%))`,
          boxShadow: "inset 4px 0 8px hsl(25 30% 20% / 0.2)",
          left: "50%",
        }}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: 80 }}
        transition={{ duration: 1, ease: [0.33, 1, 0.68, 1], delay: 0.2 }}
      />

      {/* Title reveal */}
      <motion.span
        className="relative font-display font-extrabold text-2xl sm:text-3xl"
        style={{
          background: "var(--gradient-gold)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.7, 1, 1, 1.05] }}
        transition={{ duration: 1.8, times: [0, 0.3, 0.7, 1], delay: 0.4 }}
      >
        ✦
      </motion.span>
    </motion.div>
  );
};

const gameCards = [
  { titleKey: "quick.alphabet", emoji: "🔤", path: "/alphabet", color: "bg-sky/10 dark:bg-sky/15" },
  { titleKey: "quick.words", emoji: "📝", path: "/words", color: "bg-grass/10 dark:bg-grass/15" },
  { titleKey: "quick.match", emoji: "🧩", path: "/memory", color: "bg-lavender/10 dark:bg-lavender/15" },
  { titleKey: "quick.quiz", emoji: "🎯", path: "/quiz", color: "bg-accent/10 dark:bg-accent/15" },
  { titleKey: "quick.spelling", emoji: "🐝", path: "/spelling", color: "bg-sunshine/10 dark:bg-sunshine/15" },
  { titleKey: "quick.scramble", emoji: "🔀", path: "/scramble", color: "bg-candy/10 dark:bg-candy/15" },
  { titleKey: "quick.hangman", emoji: "🎭", path: "/hangman", color: "bg-sky/10 dark:bg-sky/15" },
];

/* ─── Ornate divider ─── */
const OrnateDivider = () => (
  <div className="flex items-center justify-center gap-3 my-6 sm:my-8 opacity-40">
    <div className="h-px flex-1 max-w-16 bg-gradient-to-r from-transparent to-primary/40" />
    <motion.div
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="text-primary/60 text-xs"
    >
      ✦
    </motion.div>
    <div className="h-px flex-1 max-w-16 bg-gradient-to-l from-transparent to-primary/40" />
  </div>
);

/* ─── Stat card with library tokens ─── */
const MagicStatCard = ({
  icon, value, label, delay, glowHue,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  delay: number;
  glowHue: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24, scale: 0.88 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ type: "spring", stiffness: 180, damping: 18, delay }}
    whileHover={{ y: -5, scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="relative rounded-2xl p-4 sm:p-5 text-center cursor-default overflow-hidden group border"
    style={{
      background: `hsl(var(--library-bg) / 0.6)`,
      borderColor: `hsl(var(--library-border) / 0.3)`,
      boxShadow: `var(--shadow-library)`,
      backdropFilter: "blur(12px)",
    }}
  >
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
      style={{ background: `radial-gradient(circle, hsl(${glowHue} / 0.1), transparent 70%)` }}
    />
    <div className="flex justify-center mb-2 relative">{icon}</div>
    <p className="font-display font-extrabold text-2xl sm:text-3xl leading-none relative" style={{ color: `hsl(var(--library-text-bright))` }}>
      {value}
    </p>
    <p className="text-[10px] sm:text-xs font-display font-semibold mt-1 relative" style={{ color: `hsl(var(--library-text-dim))` }}>
      {label}
    </p>
  </motion.div>
);

/* ─── Cinematic XP progress bar ─── */
const XPProgressBar = ({ current, needed, level, title, lang }: {
  current: number; needed: number; level: number; title: string; lang: string;
}) => {
  const percent = Math.min((current / needed) * 100, 100);
  return (
    <div
      className="rounded-2xl p-4 relative overflow-hidden border"
      style={{
        background: `hsl(var(--library-bg) / 0.5)`,
        borderColor: `hsl(var(--library-border) / 0.25)`,
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Shimmer sweep */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        <motion.div
          className="w-1/3 h-full skew-x-12"
          style={{ background: `linear-gradient(90deg, transparent, hsl(var(--library-gold) / 0.04), transparent)` }}
          animate={{ x: ["-100%", "400%"] }}
          transition={{ duration: 5, repeat: Infinity, repeatDelay: 4 }}
        />
      </div>

      <div className="flex items-center justify-between mb-2.5 relative">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-lg"
            style={{
              background: "var(--gradient-gold-btn)",
              boxShadow: `var(--shadow-gold-glow)`,
            }}
            whileHover={{ scale: 1.12, rotate: 8 }}
          >
            {title.split(" ")[0]}
          </motion.div>
          <span className="font-display font-bold text-sm" style={{ color: `hsl(var(--library-text-bright) / 0.8)` }}>
            {lang === "he" ? "רמה" : lang === "ar" ? "المستوى" : "Level"} {level}
          </span>
        </div>
        <span className="text-xs font-display font-semibold" style={{ color: `hsl(var(--library-text-dim))` }}>
          {current}/{needed} XP
        </span>
      </div>

      <div className="h-3 rounded-full overflow-hidden relative" style={{ background: `hsl(var(--library-bg) / 0.6)` }}>
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{
            background: "var(--gradient-gold-bar)",
            boxShadow: `0 0 10px hsl(var(--library-glow) / 0.4)`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
          />
        </motion.div>
      </div>
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [motivation, setMotivation] = useState(getMotivationalMessage(lang));
  const [showEntrance, setShowEntrance] = useState(() => !sessionStorage.getItem("library-entered"));
  const adaptive = useAgeAdaptive();

  useEffect(() => {
    setTotalStars(getTotalEarnedStars());
    setCurrentLevel(getCurrentLevel());
    setBadgeCount(getUnlockedAchievements().length);
    setXpState(getXP());
    setDailyChallenge(getDailyChallenge());
    setRecommendations(getSmartRecommendations(lang));
    setMotivation(getMotivationalMessage(lang));
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

  const handleEntranceComplete = useCallback(() => {
    setShowEntrance(false);
    sessionStorage.setItem("library-entered", "1");
  }, []);

  const levelPercent = (levelProgress.completed / levelProgress.total) * 100;

  return (
    <div className="min-h-screen relative" dir={dir}>
      <MagicalLibraryBackground />

      {/* ═══ CINEMATIC BOOK-OPENING ENTRANCE (once per session) ═══ */}
      <AnimatePresence>
        {showEntrance && <BookOpenEntrance onComplete={handleEntranceComplete} />}
      </AnimatePresence>

      <motion.div
        variants={container}
        initial="hidden"
        animate={showEntrance ? "hidden" : "visible"}
        className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10"
      >
        {/* ═══ CINEMATIC TITLE with floating runes ═══ */}
        <motion.section variants={item} className="text-center mb-6 sm:mb-10 relative">
          {/* Floating magical runes */}
          <div className="absolute inset-0 pointer-events-none hidden sm:block">
            {RUNES.slice(0, 8).map((_, i) => (
              <FloatingRune key={i} index={i} />
            ))}
          </div>

          {/* Glow behind title */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-40 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(ellipse, hsl(var(--library-gold-dim) / 0.08), transparent 70%)`,
              filter: "blur(30px)",
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* 3D Art Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative font-display font-extrabold leading-tight mb-3"
          >
            <span
              className="block text-3xl sm:text-4xl md:text-5xl"
              style={{
                background: "var(--gradient-gold)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: `drop-shadow(0 2px 8px hsl(var(--library-gold-dim) / 0.4))`,
                textShadow: "none",
              }}
            >
              {lang === "ar" ? "أسطورة المخطوطة الكبرى" : lang === "he" ? "אגדת הספר הגדול" : "The Saga of the Grand Codex"}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="font-display text-sm sm:text-base max-w-md mx-auto"
            style={{ color: `hsl(var(--library-text))` }}
          >
            {lang === "ar" ? "رحلة تعلّم الإنجليزية السحرية" : lang === "he" ? "מסע קסום ללימוד אנגלית" : "A Magical English Learning Journey"} ✨
          </motion.p>

          {/* Personalized greeting */}
          {adaptive.displayName && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="font-display text-xs mt-2"
              style={{ color: `hsl(var(--library-text-dim))` }}
            >
              {adaptive.avatar}{" "}
              {lang === "he" ? `שלום ${adaptive.displayName}` : lang === "ar" ? `مرحباً ${adaptive.displayName}` : `Hello ${adaptive.displayName}`}
            </motion.p>
          )}
        </motion.section>

        {/* ═══ XP PROGRESS BAR ═══ */}
        <motion.section variants={item} className="max-w-lg mx-auto mb-6 sm:mb-8">
          <XPProgressBar current={xpLevel.current} needed={xpLevel.needed} level={xpLevel.level} title={xpLevel.title} lang={lang} />
        </motion.section>

        {/* ═══ STAT CARDS — XP, Achievements, Stars ═══ */}
        <motion.section variants={item} className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-6 sm:mb-8 max-w-lg mx-auto">
          <MagicStatCard
            icon={<Zap className="w-6 h-6" style={{ color: `hsl(var(--library-gold))` }} />}
            value={xpState.totalXP}
            label="XP"
            delay={0.3}
            glowHue="var(--library-gold)"
          />
          <MagicStatCard
            icon={<Shield className="w-6 h-6" style={{ color: `hsl(var(--library-warm))` }} />}
            value={badgeCount}
            label={lang === "he" ? "הישגים" : lang === "ar" ? "إنجازات" : "Achievements"}
            delay={0.4}
            glowHue="var(--library-warm)"
          />
          <MagicStatCard
            icon={<Star className="w-6 h-6" style={{ color: `hsl(var(--sunshine))` }} />}
            value={totalStars}
            label={lang === "he" ? "כוכבים" : lang === "ar" ? "نجوم" : "Stars"}
            delay={0.5}
            glowHue="var(--sunshine)"
          />
        </motion.section>

        {/* ═══ STREAK ═══ */}
        {xpState.streak > 0 && (
          <motion.div variants={item} className="max-w-lg mx-auto mb-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border"
              style={{
                background: `hsl(var(--library-bg) / 0.5)`,
                borderColor: `hsl(var(--library-border) / 0.3)`,
              }}
            >
              <span className="text-sm">🔥</span>
              <span className="font-display font-bold text-xs" style={{ color: `hsl(var(--library-amber))` }}>
                {xpState.streak} {lang === "he" ? "ימים ברצף" : lang === "ar" ? "أيام متتالية" : "day streak"}
              </span>
            </motion.div>
          </motion.div>
        )}

        <OrnateDivider />

        {/* ═══ DAILY + WORD OF THE DAY ═══ */}
        <AnimatedSection className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto mb-6 sm:mb-8" delay={0.15}>
          <DailyChallengeCard key={refreshKey} challenge={dailyChallenge} onUpdate={refreshStats} />
          <WordOfTheDay />
        </AnimatedSection>

        {/* ═══ MOTIVATION ═══ */}
        <AnimatedSection className="max-w-lg mx-auto mb-6 sm:mb-8" delay={0.1}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 justify-center py-3.5 px-5 rounded-2xl relative overflow-hidden border"
            style={{
              background: `hsl(var(--library-bg) / 0.45)`,
              borderColor: `hsl(var(--library-border) / 0.2)`,
              backdropFilter: "blur(8px)",
            }}
          >
            <span className="text-xl relative">{motivation.emoji}</span>
            <span className="font-display font-bold text-sm relative" style={{ color: `hsl(var(--library-text))` }}>
              {motivation.text}
            </span>
          </motion.div>
        </AnimatedSection>

        {/* ═══ CURRENT LEVEL — Ancient Scroll Card ═══ */}
        <AnimatedSection className="max-w-lg mx-auto mb-8 sm:mb-10" delay={0.15}>
          <Card3D onClick={() => { playClickSound(); navigate("/levels"); }}>
            <div
              className="rounded-2xl p-4 sm:p-5 cursor-pointer group relative overflow-hidden transition-all duration-300 border"
              style={{
                background: `hsl(var(--library-bg) / 0.55)`,
                borderColor: `hsl(var(--library-border) / 0.25)`,
                backdropFilter: "blur(12px)",
                boxShadow: `var(--shadow-library)`,
              }}
            >
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: `radial-gradient(circle, hsl(var(--library-gold-dim) / 0.12), transparent 70%)` }}
              />

              <div className="flex items-center gap-3 sm:gap-4 relative">
                <motion.div
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-lg"
                  style={{
                    background: "var(--gradient-gold-btn)",
                    boxShadow: `var(--shadow-gold-glow)`,
                  }}
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  {level.emoji}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Map className="w-3.5 h-3.5" style={{ color: `hsl(var(--library-text-dim))` }} />
                    <p className="text-xs font-display font-semibold" style={{ color: `hsl(var(--library-text-dim))` }}>{t("home.currentLevel")}</p>
                  </div>
                  <h2 className="font-display text-base sm:text-lg font-bold truncate" style={{ color: `hsl(var(--library-text-bright))` }}>
                    {t("home.level")} {level.id}: {t(`level.${level.id}`)}
                  </h2>
                  <div className="h-2.5 mt-2 rounded-full overflow-hidden relative" style={{ background: `hsl(var(--library-bg) / 0.6)` }}>
                    <motion.div
                      className="h-full rounded-full relative overflow-hidden"
                      style={{
                        background: "var(--gradient-gold-bar)",
                        boxShadow: `0 0 8px hsl(var(--library-glow) / 0.3)`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${levelPercent}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
                    >
                      <motion.div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }}
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
                      />
                    </motion.div>
                  </div>
                  <p className="text-xs mt-1.5 font-display" style={{ color: `hsl(var(--library-text-dim))` }}>
                    {levelProgress.completed}/{levelProgress.total} {t("home.stagesCompleted")}
                    {nextLevel && ` · ${Math.max(0, nextLevel.starsToUnlock - totalStars)} ${t("home.moreToNext")}`}
                  </p>
                </div>
                <ArrowRight className={`w-5 h-5 transition-colors ${dir === "rtl" ? "rotate-180" : ""}`} style={{ color: `hsl(var(--library-text-dim))` }} />
              </div>
            </div>
          </Card3D>
        </AnimatedSection>

        {/* ═══ RECOMMENDATIONS ═══ */}
        {recommendations.length > 0 && (
          <AnimatedSection className="max-w-lg mx-auto mb-8 sm:mb-10" delay={0.1}>
            <h3 className="font-display text-sm font-bold mb-3 flex items-center gap-1.5 justify-center" style={{ color: `hsl(var(--library-text))` }}>
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
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-start transition-all duration-300 group border"
                  style={{
                    background: `hsl(var(--library-bg) / 0.4)`,
                    borderColor: `hsl(var(--library-border) / 0.2)`,
                  }}
                >
                  <motion.span className="text-2xl" whileHover={{ scale: 1.2, rotate: [-5, 5, 0] }}>
                    {rec.emoji}
                  </motion.span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm" style={{ color: `hsl(var(--library-text-bright) / 0.85)` }}>{rec.title[lang] || rec.title.en}</p>
                    <p className="text-xs truncate" style={{ color: `hsl(var(--library-text-dim))` }}>{rec.description[lang] || rec.description.en}</p>
                  </div>
                  <ArrowRight className={`w-4 h-4 shrink-0 transition-colors ${dir === "rtl" ? "rotate-180" : ""}`} style={{ color: `hsl(var(--library-text-dim))` }} />
                </motion.button>
              ))}
            </div>
          </AnimatedSection>
        )}

        <OrnateDivider />

        {/* ═══ WORD GUARDIANS — "حراس الكلمات" ═══ */}
        <AnimatedSection className="mb-8 sm:mb-10" delay={0.12}>
          <h3 className="font-display text-lg sm:text-xl font-bold mb-5 text-center flex items-center gap-2.5 justify-center">
            <BookOpen className="w-5 h-5" style={{ color: `hsl(var(--library-gold))` }} />
            <span
              style={{
                background: "var(--gradient-gold)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {lang === "ar" ? "حُراس الكلمات" : lang === "he" ? "שומרי המילים" : "Word Guardians"}
            </span>
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

        {/* ═══ CTA BUTTONS ═══ */}
        <AnimatedSection className="text-center mb-8 sm:mb-10 flex gap-2 sm:gap-3 justify-center flex-wrap" delay={0.1}>
          <motion.button
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { playClickSound(); navigate("/levels"); }}
            className="inline-flex items-center gap-2 font-display font-bold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl transition-shadow duration-300"
            style={{
              background: "var(--gradient-gold-btn)",
              color: `hsl(var(--library-text-bright))`,
              boxShadow: `0 4px 16px hsl(var(--library-gold-dim) / 0.35), var(--shadow-gold-glow)`,
            }}
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
              className="inline-flex items-center gap-1.5 font-display font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all duration-300 border"
              style={{
                background: `hsl(var(--library-bg) / 0.5)`,
                color: `hsl(var(--library-text))`,
                borderColor: `hsl(var(--library-border) / 0.2)`,
              }}
            >
              {typeof btn.icon === "string" ? <span>{btn.icon}</span> : btn.icon}
              {btn.label}
            </motion.button>
          ))}
        </AnimatedSection>

        {/* ═══ FUN FACT ═══ */}
        <AnimatedSection className="max-w-lg mx-auto" delay={0.1}>
          <div
            className="rounded-2xl p-5 sm:p-6 text-center relative overflow-hidden border"
            style={{
              background: `hsl(var(--library-bg) / 0.45)`,
              borderColor: `hsl(var(--library-border) / 0.2)`,
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{
              background: `radial-gradient(circle at 50% 0%, hsl(var(--library-gold-dim) / 0.06), transparent 60%)`
            }} />
            <span className="text-3xl sm:text-4xl block mb-2 relative">💡</span>
            <h3 className="font-display text-base sm:text-lg font-bold mb-1.5 relative" style={{ color: `hsl(var(--library-text-bright) / 0.85)` }}>{t("home.didYouKnow")}</h3>
            <p className="text-sm leading-relaxed relative" style={{ color: `hsl(var(--library-text))` }}>{t(`home.funFact${funFactIndex}`)}</p>
          </div>
        </AnimatedSection>

        <div className="h-6 sm:h-8" />
      </motion.div>
    </div>
  );
};

export default Index;
