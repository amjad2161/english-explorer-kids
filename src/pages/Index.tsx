import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useLanguage } from "@/lib/i18n";
import { getCurrentLevel, getTotalEarnedStars, levels, getLevelProgress } from "@/lib/levels";
import { getUnlockedAchievements } from "@/lib/achievements";
import { getXP, getLevel, getDailyChallenge } from "@/lib/xp";
import { playClickSound } from "@/lib/sounds";
import ClassroomBackground from "@/components/ClassroomBackground";
import PremiumGameCard from "@/components/PremiumGameCard";
import AnimatedSection from "@/components/AnimatedSection";
import Card3D from "@/components/Card3D";
import DailyChallengeCard from "@/components/DailyChallengeCard";
import WordOfTheDay from "@/components/WordOfTheDay";
import Interactive3DMascot from "@/components/Interactive3DMascot";
import { getSmartRecommendations, getMotivationalMessage, Recommendation } from "@/lib/recommendations";
import { useAgeAdaptive } from "@/hooks/useAgeAdaptive";
import { Zap, Trophy, ArrowRight, Map, Star, Sparkles, BookOpen, Shield } from "lucide-react";
import UserAvatar, { CompanionAvatars } from "@/components/UserAvatar";
import AITeacherVideo from "@/components/AITeacherVideo";

/* ─── Animation variants ─── */
const container = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

/* ─── Simple entrance — fade + scale with owl ─── */
const SimpleEntrance = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onComplete, 1000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
      style={{ background: "hsl(var(--background))" }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.05 }}
      >
        <Interactive3DMascot mood="celebrate" size="lg" />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="font-display font-extrabold text-3xl sm:text-4xl text-gradient"
      >
        English Fun ✨
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="font-display text-sm text-muted-foreground"
      >
        Let's learn together!
      </motion.p>
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
  { titleKey: "quick.pattern", emoji: "🧩", path: "/pattern", color: "bg-lavender/10 dark:bg-lavender/15" },
  { titleKey: "quick.abcAnimals", emoji: "🎵", path: "/abc-animals", color: "bg-grass/10 dark:bg-grass/15" },
  { titleKey: "quick.animalMatch", emoji: "🐾", path: "/animal-match", color: "bg-sunshine/10 dark:bg-sunshine/15" },
];

/* ─── Notebook-style lined card wrapper ─── */
const NotebookCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`relative rounded-2xl overflow-hidden ${className}`}
    style={{
      background: "hsl(var(--card) / 0.95)",
      border: "2px solid hsl(var(--border))",
      boxShadow: "var(--shadow-card)",
    }}
  >
    {/* Red margin line */}
    <div
      className="absolute top-0 bottom-0 w-[2px]"
      style={{
        left: "2rem",
        background: "hsl(0 65% 55% / 0.2)",
      }}
    />
    {/* Horizontal ruled lines */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, hsl(var(--border) / 0.35) 27px, hsl(var(--border) / 0.35) 28px)",
        backgroundPositionY: "12px",
      }}
    />
    {/* Spiral binding holes */}
    <div className="absolute top-0 bottom-0 left-1 flex flex-col items-center gap-6 pt-4 pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="w-3 h-3 rounded-full border-2 shrink-0"
          style={{
            borderColor: "hsl(var(--muted-foreground) / 0.2)",
            background: "hsl(var(--background) / 0.5)",
          }}
        />
      ))}
    </div>
    <div className="relative z-10 p-5 sm:p-6 ps-12">
      {children}
    </div>
  </div>
);

/* ─── Chalkboard section card ─── */
const ChalkSection = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`relative rounded-2xl overflow-hidden ${className}`}
    style={{
      background: "linear-gradient(135deg, hsl(var(--board)) 0%, hsl(160 22% 18%) 100%)",
      border: "3px solid hsl(30 35% 30%)",
      boxShadow: "inset 0 2px 12px hsl(0 0% 0% / 0.2), 0 4px 16px hsl(0 0% 0% / 0.15)",
    }}
  >
    {/* Chalk dust */}
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.04]"
      style={{
        backgroundImage: `radial-gradient(circle at 25% 35%, hsl(var(--chalk)) 1px, transparent 1px),
          radial-gradient(circle at 65% 70%, hsl(var(--chalk)) 0.6px, transparent 0.6px),
          radial-gradient(circle at 80% 25%, hsl(var(--chalk)) 0.8px, transparent 0.8px)`,
        backgroundSize: "80px 60px, 60px 80px, 70px 50px",
      }}
    />
    <div className="relative z-10 p-5 sm:p-6">
      {children}
    </div>
  </div>
);

/* ─── Chalk text helper ─── */
const ChalkText = ({ children, className = "", size = "base" }: { children: React.ReactNode; className?: string; size?: string }) => (
  <span
    className={`font-display font-bold ${className}`}
    style={{
      color: "hsl(var(--chalk))",
      textShadow: "0 1px 3px hsl(0 0% 0% / 0.3)",
    }}
  >
    {children}
  </span>
);

/* ─── Stat card — notebook style ─── */
const StatCard = ({
  icon, value, label, delay, accentColor,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  delay: number;
  accentColor: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24, scale: 0.88 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ type: "spring", stiffness: 180, damping: 18, delay }}
    whileHover={{ y: -5, scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="relative rounded-xl overflow-hidden text-center cursor-default group p-4"
    style={{
      background: "hsl(var(--card) / 0.95)",
      border: "2px solid hsl(var(--border))",
      boxShadow: "var(--shadow-card)",
    }}
  >
    {/* Mini notebook lines */}
    <div
      className="absolute inset-0 pointer-events-none opacity-30"
      style={{
        backgroundImage: "repeating-linear-gradient(transparent, transparent 19px, hsl(var(--border) / 0.4) 19px, hsl(var(--border) / 0.4) 20px)",
        backgroundPositionY: "8px",
      }}
    />
    <div className="relative z-10">
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="font-display font-extrabold text-2xl sm:text-3xl leading-none text-foreground">
        {value}
      </p>
      <p className="text-[10px] sm:text-xs font-display font-semibold mt-1 text-muted-foreground">
        {label}
      </p>
    </div>
  </motion.div>
);

/* ─── XP progress bar — chalkboard ─── */
const XPProgressBar = ({ current, needed, level, title, lang }: {
  current: number; needed: number; level: number; title: string; lang: string;
}) => {
  const percent = Math.min((current / needed) * 100, 100);
  return (
    <ChalkSection>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-md gradient-primary text-primary-foreground"
            whileHover={{ scale: 1.12, rotate: 8 }}
          >
            {title.split(" ")[0]}
          </motion.div>
          <ChalkText>
            {lang === "he" ? "רמה" : lang === "ar" ? "المستوى" : "Level"} {level}
          </ChalkText>
        </div>
        <span className="text-xs font-display font-semibold" style={{ color: "hsl(var(--chalk) / 0.6)" }}>
          {current}/{needed} XP
        </span>
      </div>

      <div className="h-3 rounded-full overflow-hidden" style={{ background: "hsl(var(--chalk) / 0.12)" }}>
        <motion.div
          className="h-full rounded-full gradient-primary relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
          />
        </motion.div>
      </div>
    </ChalkSection>
  );
};

/* ─── Divider — chalk tray ─── */
const ChalkDivider = () => (
  <div className="flex items-center justify-center gap-3 my-6 sm:my-8">
    <div
      className="h-[2px] flex-1 max-w-24"
      style={{ background: "linear-gradient(90deg, transparent, hsl(var(--border)), transparent)" }}
    />
    <motion.div
      className="flex gap-1"
      animate={{ rotate: [0, 5, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="w-6 h-2 rounded-sm" style={{ background: "hsl(var(--chalk) / 0.3)" }} />
      <div className="w-4 h-2 rounded-sm" style={{ background: "hsl(var(--grass) / 0.3)" }} />
      <div className="w-3 h-2 rounded-sm" style={{ background: "hsl(var(--sunshine) / 0.3)" }} />
    </motion.div>
    <div
      className="h-[2px] flex-1 max-w-24"
      style={{ background: "linear-gradient(90deg, transparent, hsl(var(--border)), transparent)" }}
    />
  </div>
);

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
  const [showEntrance, setShowEntrance] = useState<boolean>(false);
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
      <ClassroomBackground />

      {/* ═══ SIMPLE ENTRANCE (once per session) ═══ */}
      <AnimatePresence>
        {showEntrance && <SimpleEntrance onComplete={handleEntranceComplete} />}
      </AnimatePresence>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10"
      >
        {/* ═══ TITLE with mascot ═══ */}
        <motion.section variants={item} className="text-center mb-6 sm:mb-10">
          {/* Hero: Owl mascot + User Avatar side by side */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-3">
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 150, delay: 0.2 }}
            >
              <Interactive3DMascot mood="wave" size="md" />
            </motion.div>

            <motion.div
              className="flex flex-col items-center gap-1"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 150, delay: 0.4 }}
            >
              <UserAvatar size="lg" showName showOwl={false} />
              <CompanionAvatars size="xs" className="mt-1" />
            </motion.div>
          </div>

          <motion.h1
            className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-gradient leading-tight mb-2"
          >
            English Fun
          </motion.h1>

          <motion.p
            className="font-display text-sm sm:text-base text-muted-foreground max-w-md mx-auto"
          >
            {lang === "ar" ? "رحلة تعلّم الإنجليزية الممتعة" : lang === "he" ? "מסע כיפי ללימוד אנגלית" : "A Fun English Learning Journey"} ✨
          </motion.p>

          {adaptive.displayName && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="font-display text-xs mt-2 text-muted-foreground"
            >
              {adaptive.avatar}{" "}
              {lang === "he" ? `שלום ${adaptive.displayName}` : lang === "ar" ? `مرحباً ${adaptive.displayName}` : `Hello ${adaptive.displayName}`}
            </motion.p>
          )}
        </motion.section>

        {/* ═══ XP PROGRESS BAR — Chalkboard ═══ */}
        <motion.section variants={item} className="max-w-lg mx-auto mb-6 sm:mb-8">
          <XPProgressBar current={xpLevel.current} needed={xpLevel.needed} level={xpLevel.level} title={xpLevel.title} lang={lang} />
        </motion.section>

        {/* ═══ STAT CARDS — Notebook style ═══ */}
        <motion.section variants={item} className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-6 sm:mb-8 max-w-lg mx-auto">
          <StatCard
            icon={<Zap className="w-6 h-6 text-primary" />}
            value={xpState.totalXP}
            label="XP"
            delay={0.3}
            accentColor="primary"
          />
          <StatCard
            icon={<Shield className="w-6 h-6 text-accent" />}
            value={badgeCount}
            label={lang === "he" ? "הישגים" : lang === "ar" ? "إنجازات" : "Achievements"}
            delay={0.4}
            accentColor="accent"
          />
          <StatCard
            icon={<Star className="w-6 h-6 text-sunshine star-earned fill-current" />}
            value={totalStars}
            label={lang === "he" ? "כוכבים" : lang === "ar" ? "نجوم" : "Stars"}
            delay={0.5}
            accentColor="sunshine"
          />
        </motion.section>

        {/* ═══ STREAK ═══ */}
        {xpState.streak > 0 && (
          <motion.div variants={item} className="max-w-lg mx-auto mb-5 flex justify-center">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{
                background: "hsl(var(--accent) / 0.1)",
                border: "1.5px solid hsl(var(--accent) / 0.2)",
              }}
            >
              <span className="text-sm">🔥</span>
              <span className="font-display font-bold text-xs text-accent">
                {xpState.streak} {lang === "he" ? "ימים ברצף" : lang === "ar" ? "أيام متتالية" : "day streak"}
              </span>
            </div>
          </motion.div>
        )}

        <ChalkDivider />

        {/* ═══ DAILY + WORD OF THE DAY — Notebook card ═══ */}
        <AnimatedSection className="max-w-3xl mx-auto mb-6 sm:mb-8" delay={0.15}>
          <NotebookCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DailyChallengeCard key={refreshKey} challenge={dailyChallenge} onUpdate={refreshStats} />
              <WordOfTheDay />
            </div>
          </NotebookCard>
        </AnimatedSection>

        {/* ═══ MOTIVATION — Chalk style ═══ */}
        <AnimatedSection className="max-w-lg mx-auto mb-6 sm:mb-8" delay={0.1}>
          <ChalkSection className="text-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 justify-center"
            >
              <span className="text-xl">{motivation.emoji}</span>
              <ChalkText className="text-sm">
                {motivation.text}
              </ChalkText>
            </motion.div>
          </ChalkSection>
        </AnimatedSection>

        {/* ═══ CURRENT LEVEL — Notebook card ═══ */}
        <AnimatedSection className="max-w-lg mx-auto mb-8 sm:mb-10" delay={0.15}>
          <Card3D onClick={() => { playClickSound(); navigate("/levels"); }}>
            <NotebookCard className="cursor-pointer group">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-md gradient-primary"
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  {level.emoji}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Map className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-xs font-display font-semibold text-muted-foreground">{t("home.currentLevel")}</p>
                  </div>
                  <h2 className="font-display text-base sm:text-lg font-bold truncate text-foreground">
                    {t("home.level")} {level.id}: {t(`level.${level.id}`)}
                  </h2>
                  <div className="h-2.5 mt-2 rounded-full overflow-hidden bg-muted/50">
                    <motion.div
                      className="h-full rounded-full gradient-primary relative overflow-hidden"
                      initial={{ width: 0 }}
                      animate={{ width: `${levelPercent}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
                    >
                      <motion.div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }}
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
                      />
                    </motion.div>
                  </div>
                  <p className="text-xs mt-1.5 font-display text-muted-foreground">
                    {levelProgress.completed}/{levelProgress.total} {t("home.stagesCompleted")}
                    {nextLevel && ` · ${Math.max(0, nextLevel.starsToUnlock - totalStars)} ${t("home.moreToNext")}`}
                  </p>
                </div>
                <ArrowRight className={`w-5 h-5 text-muted-foreground ${dir === "rtl" ? "rotate-180" : ""}`} />
              </div>
            </NotebookCard>
          </Card3D>
        </AnimatedSection>

        {/* ═══ RECOMMENDATIONS — Notebook ═══ */}
        {recommendations.length > 0 && (
          <AnimatedSection className="max-w-lg mx-auto mb-8 sm:mb-10" delay={0.1}>
            <h3 className="font-display text-sm font-bold mb-3 flex items-center gap-1.5 justify-center text-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              {lang === "he" ? "מומלץ עבורך" : lang === "ar" ? "مُوصى لك" : "Recommended for You"}
            </h3>
            <NotebookCard>
              <div className="space-y-2">
                {recommendations.map((rec, i) => (
                  <motion.button
                    key={rec.reason}
                    initial={{ opacity: 0, x: dir === "rtl" ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    onClick={() => { playClickSound(); navigate(rec.path); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-start transition-all duration-300 group"
                    style={{
                      background: "hsl(var(--muted) / 0.3)",
                      border: "1px solid hsl(var(--border) / 0.5)",
                    }}
                  >
                    <motion.span className="text-2xl" whileHover={{ scale: 1.2, rotate: [-5, 5, 0] }}>
                      {rec.emoji}
                    </motion.span>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-sm text-foreground">{rec.title[lang] || rec.title.en}</p>
                      <p className="text-xs truncate text-muted-foreground">{rec.description[lang] || rec.description.en}</p>
                    </div>
                    <ArrowRight className={`w-4 h-4 shrink-0 text-muted-foreground ${dir === "rtl" ? "rotate-180" : ""}`} />
                  </motion.button>
                ))}
              </div>
            </NotebookCard>
          </AnimatedSection>
        )}

        <ChalkDivider />

        {/* ═══ GAME CARDS — Chalkboard header ═══ */}
        <AnimatedSection className="mb-8 sm:mb-10" delay={0.12}>
          <ChalkSection className="mb-5 text-center">
            <div className="flex items-center gap-2.5 justify-center">
              <BookOpen className="w-5 h-5" style={{ color: "hsl(var(--chalk) / 0.7)" }} />
              <ChalkText className="text-lg sm:text-xl">
                {lang === "ar" ? "الألعاب" : lang === "he" ? "משחקים" : "Games"}
              </ChalkText>
            </div>
          </ChalkSection>
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

        <ChalkDivider />

        {/* ═══ ABC ANIMALS VIDEO ═══ */}
        <AnimatedSection className="max-w-2xl mx-auto mb-6 sm:mb-8" delay={0.1}>
          <NotebookCard>
            <div className="text-center mb-3">
              <h3 className="font-display font-bold text-base sm:text-lg text-foreground flex items-center justify-center gap-2">
                🎵 {lang === "he" ? "שיר ABC עם חיות" : lang === "ar" ? "أغنية ABC مع الحيوانات" : "ABC Animals Song"}
              </h3>
              <p className="text-xs text-muted-foreground font-display">
                {lang === "he" ? "למדו את האלפבית עם חיות מהנות!" : "Learn the alphabet with fun animals!"}
              </p>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: "2px solid hsl(var(--primary) / 0.15)" }}>
              <video
                src="/videos/abc-animals-song.mp4"
                className="w-full aspect-video object-cover"
                controls
                playsInline
                poster=""
              />
            </div>
            <div className="flex justify-center mt-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { playClickSound(); navigate("/abc-animals"); }}
                className="btn-kid inline-flex items-center gap-2 text-xs gradient-primary text-primary-foreground"
              >
                🐾 {lang === "he" ? "לדף החיות המלא" : "Explore All Animals"}
                <ArrowRight className={`w-3 h-3 ${dir === "rtl" ? "rotate-180" : ""}`} />
              </motion.button>
            </div>
          </NotebookCard>
        </AnimatedSection>

        {/* ═══ AI TEACHER VIDEO ═══ */}
        <AnimatedSection delay={0.1}>
          <AITeacherVideo />
        </AnimatedSection>

        {/* ═══ CTA BUTTONS ═══ */}
        <AnimatedSection className="text-center mb-8 sm:mb-10 flex gap-2 sm:gap-3 justify-center flex-wrap" delay={0.1}>
          <motion.button
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { playClickSound(); navigate("/levels"); }}
            className="btn-kid inline-flex items-center gap-2 text-sm sm:text-base gradient-primary text-primary-foreground"
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
              className="btn-glow inline-flex items-center gap-1.5 text-xs sm:text-sm text-foreground"
            >
              {typeof btn.icon === "string" ? <span>{btn.icon}</span> : btn.icon}
              {btn.label}
            </motion.button>
          ))}
        </AnimatedSection>

        {/* ═══ FUN FACT — Notebook ═══ */}
        <AnimatedSection className="max-w-lg mx-auto" delay={0.1}>
          <NotebookCard>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-lg">💡</span>
                <p className="text-xs font-display font-bold text-primary">
                  {lang === "he" ? "הידעת?" : lang === "ar" ? "هل تعلم؟" : "Did you know?"}
                </p>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground font-display">
                {lang === "he"
                  ? "אנגלית היא השפה הנלמדת ביותר בעולם! 🌍"
                  : lang === "ar"
                  ? "الإنجليزية هي اللغة الأكثر تعلّماً في العالم! 🌍"
                  : "English is the most learned language in the world! 🌍"}
               </p>
            </div>
          </NotebookCard>
        </AnimatedSection>
      </motion.div>
    </div>
  );
};

export default Index;
