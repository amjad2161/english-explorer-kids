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
import foxGuardian from "@/assets/fox-guardian.png";
import bookworm from "@/assets/bookworm.png";
import mouseLibrarian from "@/assets/mouse-librarian.png";

/* ─── Animation variants ─── */
const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.3 } },
};

const item = {
  hidden: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

/* ─── Simple entrance — Disney fade + scale with owl ─── */
const SimpleEntrance = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onComplete, 1800);
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
      {/* Background magic glow */}
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 70% 60% at 50% 40%, hsl(262 70% 65% / 0.08) 0%, transparent 60%)`,
      }} />
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
      >
        <Interactive3DMascot mood="celebrate" size="lg" />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="font-display font-extrabold text-3xl sm:text-4xl"
        style={{
          background: "linear-gradient(135deg, hsl(262 80% 65%), hsl(338 80% 68%), hsl(44 100% 62%))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        English Fun ✨
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
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
];

/* ─── Disney-quality Magic Card wrapper ─── */
const MagicCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`relative rounded-2xl overflow-hidden ${className}`}
    style={{
      background: "hsl(var(--card) / 0.97)",
      border: "1.5px solid hsl(262 50% 65% / 0.18)",
      boxShadow: "var(--shadow-card), inset 0 1px 0 rgba(255,255,255,0.8)",
    }}
  >
    {/* Gem-like top shine */}
    <div
      className="absolute top-0 left-0 right-0 h-px pointer-events-none"
      style={{
        background: "linear-gradient(90deg, transparent 10%, hsl(262 70% 80% / 0.6) 50%, transparent 90%)",
      }}
    />
    <div className="relative z-10 p-5 sm:p-6">
      {children}
    </div>
  </div>
);

/* ─── Disney-quality gradient section header ─── */
const MagicSection = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`relative rounded-2xl overflow-hidden ${className}`}
    style={{
      background: "linear-gradient(135deg, hsl(262 65% 20%) 0%, hsl(295 60% 20%) 50%, hsl(245 55% 22%) 100%)",
      border: "1.5px solid hsl(262 60% 45% / 0.25)",
      boxShadow: "0 4px 20px hsl(262 65% 30% / 0.15), inset 0 1px 0 hsl(262 80% 70% / 0.12)",
    }}
  >
    {/* Magic shimmer overlay */}
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.06]"
      style={{
        backgroundImage: `radial-gradient(circle at 20% 40%, hsl(44 100% 70%) 1px, transparent 1px),
          radial-gradient(circle at 65% 70%, hsl(262 80% 75%) 0.6px, transparent 0.6px),
          radial-gradient(circle at 85% 25%, hsl(338 80% 75%) 0.8px, transparent 0.8px)`,
        backgroundSize: "60px 45px, 80px 70px, 55px 60px",
      }}
    />
    <div className="relative z-10 p-5 sm:p-6">
      {children}
    </div>
  </div>
);

/* ─── Magic text helper ─── */
const MagicText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span
    className={`font-display font-bold ${className}`}
    style={{
      color: "hsl(262 60% 90%)",
      textShadow: "0 1px 3px hsl(262 60% 20% / 0.4)",
    }}
  >
    {children}
  </span>
);

/* ─── Stat card — Disney gem style ─── */
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
    whileHover={{ y: -6, scale: 1.06 }}
    whileTap={{ scale: 0.95 }}
    className="relative rounded-2xl overflow-hidden text-center cursor-default group p-4"
    style={{
      background: "hsl(var(--card) / 0.97)",
      border: "1.5px solid hsl(262 50% 65% / 0.18)",
      boxShadow: "var(--shadow-card)",
    }}
  >
    {/* Gem shine top */}
    <div
      className="absolute top-0 left-0 right-0 h-px pointer-events-none"
      style={{ background: "linear-gradient(90deg, transparent, hsl(262 70% 80% / 0.5), transparent)" }}
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

/* ─── XP progress bar — Disney magic style ─── */
const XPProgressBar = ({ current, needed, level, title, lang }: {
  current: number; needed: number; level: number; title: string; lang: string;
}) => {
  const percent = Math.min((current / needed) * 100, 100);
  return (
    <MagicSection>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-md"
            style={{
              background: "linear-gradient(135deg, hsl(262 80% 65%), hsl(338 80% 68%))",
              boxShadow: "0 4px 12px hsl(262 70% 55% / 0.3)",
            }}
            whileHover={{ scale: 1.12, rotate: 8 }}
          >
            {title.split(" ")[0]}
          </motion.div>
          <MagicText>
            {lang === "he" ? "רמה" : lang === "ar" ? "المستوى" : "Level"} {level}
          </MagicText>
        </div>
        <span className="text-xs font-display font-semibold" style={{ color: "hsl(262 50% 75% / 0.6)" }}>
          {current}/{needed} XP
        </span>
      </div>

      <div className="h-3 rounded-full overflow-hidden" style={{ background: "hsl(262 50% 55% / 0.12)" }}>
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{
            background: "linear-gradient(90deg, hsl(262 80% 65%), hsl(338 80% 68%), hsl(44 100% 62%))",
            backgroundSize: "200% 100%",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
          />
        </motion.div>
      </div>
    </MagicSection>
  );
};

/* ─── Divider — magic sparkle style ─── */
const MagicDivider = () => (
  <div className="flex items-center justify-center gap-3 my-6 sm:my-8">
    <div
      className="h-[1.5px] flex-1 max-w-24 rounded-full"
      style={{ background: "linear-gradient(90deg, transparent, hsl(262 50% 65% / 0.3), transparent)" }}
    />
    <motion.div
      className="flex gap-1"
      animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 0.98, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {["✨", "⭐", "✨"].map((s, i) => (
        <span key={i} className="text-sm" style={{ opacity: 0.5 }}>{s}</span>
      ))}
    </motion.div>
    <div
      className="h-[1.5px] flex-1 max-w-24 rounded-full"
      style={{ background: "linear-gradient(90deg, transparent, hsl(262 50% 65% / 0.3), transparent)" }}
    />
  </div>
);

/* ─── Character showcase row ─── */
const CharacterShowcase = () => {
  const characters = [
    { src: foxGuardian, name: "Fox", color: "hsl(32 95% 62%)" },
    { src: bookworm, name: "Bookworm", color: "hsl(152 65% 50%)" },
    { src: mouseLibrarian, name: "Mouse", color: "hsl(199 80% 55%)" },
  ];

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-4">
      {characters.map((char, i) => (
        <motion.div
          key={char.name}
          className="flex flex-col items-center gap-1.5"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.2 + i * 0.1 }}
          whileHover={{ scale: 1.1, y: -4 }}
        >
          <motion.div
            className="relative"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
          >
            {/* Glow ring */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${char.color}25, transparent 70%)`,
                filter: "blur(6px)",
                transform: "scale(1.4)",
              }}
            />
            <img
              src={char.src}
              alt={char.name}
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain relative z-10"
              style={{
                filter: `drop-shadow(0 4px 10px ${char.color}50)`,
              }}
            />
          </motion.div>
          <span
            className="text-[9px] font-display font-bold"
            style={{ color: char.color, opacity: 0.75 }}
          >
            {char.name}
          </span>
        </motion.div>
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

      {/* ═══ ENTRANCE (once per session) ═══ */}
      <AnimatePresence>
        {showEntrance && <SimpleEntrance onComplete={handleEntranceComplete} />}
      </AnimatePresence>

      <motion.div
        variants={container}
        initial="hidden"
        animate={showEntrance ? "hidden" : "visible"}
        className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10"
      >
        {/* ═══ TITLE with mascot + companions ═══ */}
        <motion.section variants={item} className="text-center mb-6 sm:mb-10">
          {/* Hero: Owl mascot + User Avatar side by side */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4">
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
            className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl leading-tight mb-2"
            style={{
              background: "linear-gradient(135deg, hsl(262 80% 62%), hsl(295 75% 65%), hsl(338 80% 68%), hsl(32 95% 62%))",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "aurora 5s ease-in-out infinite",
            }}
          >
            English Fun
          </motion.h1>

          <motion.p
            className="font-display text-sm sm:text-base text-muted-foreground max-w-md mx-auto"
          >
            {lang === "ar" ? "رحلة تعلّم الإنجليزية الممتعة" : lang === "he" ? "מסע כיפי ללימוד אנגלית" : "A Magical English Learning Journey"} ✨
          </motion.p>

          {/* Character showcase row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-4"
          >
            <CharacterShowcase />
          </motion.div>

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

        {/* ═══ XP PROGRESS BAR — Disney magic style ═══ */}
        <motion.section variants={item} className="max-w-lg mx-auto mb-6 sm:mb-8">
          <XPProgressBar current={xpLevel.current} needed={xpLevel.needed} level={xpLevel.level} title={xpLevel.title} lang={lang} />
        </motion.section>

        {/* ═══ STAT CARDS — Disney gem style ═══ */}
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
            <motion.div
              className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{
                background: "linear-gradient(135deg, hsl(32 95% 62% / 0.12), hsl(44 100% 62% / 0.08))",
                border: "1.5px solid hsl(44 100% 62% / 0.25)",
              }}
              whileHover={{ scale: 1.04 }}
            >
              <motion.span
                className="text-sm"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >🔥</motion.span>
              <span className="font-display font-bold text-xs" style={{ color: "hsl(32 95% 62%)" }}>
                {xpState.streak} {lang === "he" ? "ימים ברצף" : lang === "ar" ? "أيام متتالية" : "day streak"}
              </span>
            </motion.div>
          </motion.div>
        )}

        <MagicDivider />

        {/* ═══ DAILY + WORD OF THE DAY ═══ */}
        <AnimatedSection className="max-w-3xl mx-auto mb-6 sm:mb-8" delay={0.15}>
          <MagicCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DailyChallengeCard key={refreshKey} challenge={dailyChallenge} onUpdate={refreshStats} />
              <WordOfTheDay />
            </div>
          </MagicCard>
        </AnimatedSection>

        {/* ═══ MOTIVATION — Magic style ═══ */}
        <AnimatedSection className="max-w-lg mx-auto mb-6 sm:mb-8" delay={0.1}>
          <MagicSection className="text-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 justify-center"
            >
              <motion.span
                className="text-xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {motivation.emoji}
              </motion.span>
              <MagicText className="text-sm">
                {motivation.text}
              </MagicText>
            </motion.div>
          </MagicSection>
        </AnimatedSection>

        {/* ═══ CURRENT LEVEL ═══ */}
        <AnimatedSection className="max-w-lg mx-auto mb-8 sm:mb-10" delay={0.15}>
          <Card3D onClick={() => { playClickSound(); navigate("/levels"); }}>
            <MagicCard className="cursor-pointer group">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-md"
                  style={{
                    background: "linear-gradient(135deg, hsl(262 80% 65%), hsl(338 80% 68%))",
                    boxShadow: "0 4px 16px hsl(262 70% 55% / 0.3)",
                  }}
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
                      className="h-full rounded-full relative overflow-hidden"
                      style={{
                        background: "linear-gradient(90deg, hsl(262 80% 65%), hsl(338 80% 68%))",
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${levelPercent}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
                    >
                      <motion.div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }}
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
            </MagicCard>
          </Card3D>
        </AnimatedSection>

        {/* ═══ RECOMMENDATIONS ═══ */}
        {recommendations.length > 0 && (
          <AnimatedSection className="max-w-lg mx-auto mb-8 sm:mb-10" delay={0.1}>
            <h3 className="font-display text-sm font-bold mb-3 flex items-center gap-1.5 justify-center text-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              {lang === "he" ? "מומלץ עבורך" : lang === "ar" ? "مُوصى لك" : "Recommended for You"}
            </h3>
            <MagicCard>
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
                      background: "hsl(262 50% 65% / 0.05)",
                      border: "1px solid hsl(262 50% 65% / 0.12)",
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
            </MagicCard>
          </AnimatedSection>
        )}

        <MagicDivider />

        {/* ═══ GAME CARDS — Magic section header ═══ */}
        <AnimatedSection className="mb-8 sm:mb-10" delay={0.12}>
          <MagicSection className="mb-5 text-center">
            <div className="flex items-center gap-2.5 justify-center">
              <BookOpen className="w-5 h-5" style={{ color: "hsl(262 60% 80% / 0.75)" }} />
              <MagicText className="text-lg sm:text-xl">
                {lang === "ar" ? "الألعاب" : lang === "he" ? "משחקים" : "Games"}
              </MagicText>
              <motion.span
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >✨</motion.span>
            </div>
          </MagicSection>
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
            whileHover={{ y: -3, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { playClickSound(); navigate("/levels"); }}
            className="btn-kid inline-flex items-center gap-2 text-sm sm:text-base text-primary-foreground"
            style={{
              background: "linear-gradient(135deg, hsl(262 80% 60%), hsl(295 70% 62%), hsl(338 80% 65%))",
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
              className="btn-glow inline-flex items-center gap-1.5 text-xs sm:text-sm text-foreground"
            >
              {typeof btn.icon === "string" ? <span>{btn.icon}</span> : btn.icon}
              {btn.label}
            </motion.button>
          ))}
        </AnimatedSection>

        {/* ═══ FUN FACT ═══ */}
        <AnimatedSection className="max-w-lg mx-auto" delay={0.1}>
          <MagicCard>
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
          </MagicCard>
        </AnimatedSection>
      </motion.div>
    </div>
  );
};

export default Index;
