import { motion } from "framer-motion";
import { useMemo, useRef } from "react";
import { useLanguage } from "@/lib/i18n";
import { getProgress } from "@/lib/progress";
import { getXP, getLevel } from "@/lib/xp";
import { getStatsHistory, getLastNDays, getWeeklySummary } from "@/lib/statsTracker";
import { getTotalEarnedStars, levels, getLevelProgress } from "@/lib/levels";
import { getUnlockedAchievements, achievementNames } from "@/lib/achievements";
import FloatingParticles from "@/components/FloatingParticles";
import ClassroomBackground from "@/components/ClassroomBackground";
import Interactive3DMascot from "@/components/Interactive3DMascot";
import BackToLevels from "@/components/BackToLevels";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, PieChart, Pie, Cell,
} from "recharts";
import { Printer, Download, Share2, Trophy, Star, Zap, BookOpen, Target, Brain } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 200, damping: 22 } },
};

const COLORS = [
  "hsl(25, 95%, 55%)", "hsl(195, 85%, 55%)", "hsl(145, 65%, 48%)",
  "hsl(330, 85%, 60%)", "hsl(270, 70%, 65%)", "hsl(45, 100%, 60%)",
  "hsl(0, 84%, 60%)",
];

const ProgressReport = () => {
  const { lang, dir } = useLanguage();
  const reportRef = useRef<HTMLDivElement>(null);
  const t = (texts: Record<string, string>) => texts[lang] || texts.en;

  const progress = useMemo(() => getProgress(), []);
  const xpState = useMemo(() => getXP(), []);
  const level = useMemo(() => getLevel(xpState.totalXP), [xpState]);
  const stats = useMemo(() => getStatsHistory(), []);
  const weekly = useMemo(() => getWeeklySummary(), []);
  const totalStars = useMemo(() => getTotalEarnedStars(), []);
  const achievements = useMemo(() => getUnlockedAchievements(), []);
  const today = new Date().toLocaleDateString(lang === "he" ? "he-IL" : lang === "ar" ? "ar-SA" : "en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  // Skills radar data
  const skillsData = useMemo(() => {
    const gameTypes = ["alphabet", "words", "quiz", "memory", "spelling", "scramble", "hangman", "pattern"];
    const labels: Record<string, Record<string, string>> = {
      alphabet: { he: "אלפבית", ar: "أبجدية", en: "ABC" },
      words: { he: "מילים", ar: "كلمات", en: "Words" },
      quiz: { he: "חידון", ar: "اختبار", en: "Quiz" },
      memory: { he: "זיכרון", ar: "ذاكرة", en: "Memory" },
      spelling: { he: "איות", ar: "تهجئة", en: "Spelling" },
      scramble: { he: "בלבול", ar: "خلط", en: "Scramble" },
      hangman: { he: "ניחוש", ar: "تخمين", en: "Hangman" },
      pattern: { he: "דפוסים", ar: "أنماط", en: "Patterns" },
    };

    const breakdown: Record<string, number> = {};
    stats.days.forEach(d => {
      Object.entries(d.gameBreakdown).forEach(([type, count]) => {
        breakdown[type] = (breakdown[type] || 0) + count;
      });
    });

    const maxVal = Math.max(...Object.values(breakdown), 1);
    return gameTypes.map(type => ({
      subject: labels[type]?.[lang] || type,
      value: Math.round(((breakdown[type] || 0) / maxVal) * 100),
      fullMark: 100,
    }));
  }, [stats, lang]);

  // Weekly activity
  const weeklyData = useMemo(() => {
    const dayNames: Record<string, string[]> = {
      he: ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"],
      ar: ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"],
      en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    };
    return getLastNDays(7).map(d => {
      const date = new Date(d.date);
      return {
        name: dayNames[lang][date.getDay()],
        xp: d.xpEarned,
        games: d.gamesPlayed,
      };
    });
  }, [lang]);

  // Level breakdown
  const levelData = useMemo(() => levels.map((lvl, i) => {
    const lp = getLevelProgress(lvl);
    return {
      name: `${t({ he: "רמה", ar: "مستوى", en: "Lv" })} ${lvl.id}`,
      value: lp.completed,
      total: lp.total,
      color: COLORS[i % COLORS.length],
    };
  }), [lang]);

  const accuracy = stats.totalCorrectAnswers + stats.totalWrongAnswers > 0
    ? Math.round((stats.totalCorrectAnswers / (stats.totalCorrectAnswers + stats.totalWrongAnswers)) * 100)
    : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const text = t({
      he: `🦉 English Fun - דוח התקדמות\n⭐ ${totalStars} כוכבים | 🏅 רמה ${level.level} | 📚 ${progress.completedWords.length} מילים`,
      ar: `🦉 English Fun - تقرير التقدم\n⭐ ${totalStars} نجوم | 🏅 مستوى ${level.level} | 📚 ${progress.completedWords.length} كلمات`,
      en: `🦉 English Fun - Progress Report\n⭐ ${totalStars} stars | 🏅 Level ${level.level} | 📚 ${progress.completedWords.length} words`,
    });
    if (navigator.share) {
      await navigator.share({ title: "English Fun Progress", text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="min-h-screen relative" dir={dir}>
      <ClassroomBackground />
      
      <motion.div
        ref={reportRef}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto px-4 py-8 relative z-10"
      >
        <BackToLevels />
        <div className="text-center mb-4"><Interactive3DMascot mood="idle" size="sm" /></div>
        {/* Header with actions */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient">
              {t({ he: "📋 דוח התקדמות", ar: "📋 تقرير التقدم", en: "📋 Progress Report" })}
            </h1>
            <p className="text-sm text-muted-foreground font-body mt-1">{today}</p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrint}
              className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center hover:bg-primary/15 transition-colors"
              title={t({ he: "הדפסה", ar: "طباعة", en: "Print" })}
            >
              <Printer className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center hover:bg-primary/15 transition-colors"
              title={t({ he: "שיתוף", ar: "مشاركة", en: "Share" })}
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* Student Profile Card */}
        <motion.div variants={itemVariants} className="card-kid mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-sunshine/5 pointer-events-none" />
          <div className="relative flex items-center gap-5">
            <motion.div
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-sunshine flex items-center justify-center text-4xl shadow-lg"
              animate={{ rotate: [0, 3, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              {level.title.split(" ")[0]}
            </motion.div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold">{level.title.split(" ").slice(1).join(" ")}</h2>
              <p className="text-muted-foreground text-sm font-display">
                {t({ he: `רמה ${level.level}`, ar: `مستوى ${level.level}`, en: `Level ${level.level}` })} • {xpState.totalXP} XP
              </p>
              <div className="progress-bar h-3 mt-2">
                <motion.div
                  className="progress-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${(level.current / level.needed) * 100}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: <Star className="w-5 h-5" />, value: totalStars, label: t({ he: "כוכבים", ar: "نجوم", en: "Stars" }), color: "bg-sunshine/15 text-sunshine-foreground" },
            { icon: <Zap className="w-5 h-5" />, value: xpState.totalXP, label: "XP", color: "bg-primary/10 text-primary" },
            { icon: <BookOpen className="w-5 h-5" />, value: progress.completedWords.length, label: t({ he: "מילים", ar: "كلمات", en: "Words" }), color: "bg-accent/10 text-accent" },
            { icon: <Target className="w-5 h-5" />, value: `${accuracy}%`, label: t({ he: "דיוק", ar: "دقة", en: "Accuracy" }), color: "bg-sky/10 text-sky" },
            { icon: <Brain className="w-5 h-5" />, value: `${progress.completedLetters.length}/26`, label: t({ he: "אותיות", ar: "حروف", en: "Letters" }), color: "bg-lavender/10 text-lavender" },
            { icon: <Trophy className="w-5 h-5" />, value: achievements.length, label: t({ he: "הישגים", ar: "إنجازات", en: "Badges" }), color: "bg-candy/10 text-candy" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05, type: "spring" }}
              className="card-kid text-center p-4"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                {stat.icon}
              </div>
              <p className="font-display text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Skills Radar */}
        <motion.div variants={itemVariants} className="card-kid mb-6">
          <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-lavender" />
            {t({ he: "מפת כישורים", ar: "خريطة المهارات", en: "Skills Map" })}
          </h3>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillsData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Radar
                  name="Skills"
                  dataKey="value"
                  stroke="hsl(25, 95%, 55%)"
                  fill="hsl(25, 95%, 55%)"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Weekly Activity */}
        <motion.div variants={itemVariants} className="card-kid mb-6">
          <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            {t({ he: "פעילות שבועית", ar: "النشاط الأسبوعي", en: "Weekly Activity" })}
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-primary">{weekly.totalXP}</p>
              <p className="text-xs text-muted-foreground">XP</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-accent">{weekly.activeDays}/7</p>
              <p className="text-xs text-muted-foreground">{t({ he: "ימים פעילים", ar: "أيام نشطة", en: "Active Days" })}</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-sky">{weekly.avgAccuracy}%</p>
              <p className="text-xs text-muted-foreground">{t({ he: "דיוק", ar: "دقة", en: "Accuracy" })}</p>
            </div>
          </div>
          <div className="h-44" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={11} tickLine={false} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={11} tickLine={false} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontFamily: "var(--font-display)",
                  }}
                />
                <Bar dataKey="xp" fill="hsl(25, 95%, 55%)" radius={[6, 6, 0, 0]} name="XP" />
                <Bar dataKey="games" fill="hsl(195, 85%, 55%)" radius={[6, 6, 0, 0]} name={t({ he: "משחקים", ar: "ألعاب", en: "Games" })} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Level Progress */}
        <motion.div variants={itemVariants} className="card-kid mb-6">
          <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-sunshine-foreground" />
            {t({ he: "התקדמות ברמות", ar: "تقدم المستويات", en: "Level Progress" })}
          </h3>
          <div className="space-y-3">
            {levelData.map((lvl, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span className="font-display font-bold text-sm flex items-center gap-2">
                    {levels[i].emoji} {lvl.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{lvl.value}/{lvl.total}</span>
                </div>
                <div className="progress-bar h-2.5">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: lvl.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${lvl.total > 0 ? (lvl.value / lvl.total) * 100 : 0}%` }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.15 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <motion.div variants={itemVariants} className="card-kid mb-6">
            <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
              🏅 {t({ he: "הישגים שנפתחו", ar: "الإنجازات المفتوحة", en: "Unlocked Achievements" })}
            </h3>
            <div className="flex flex-wrap gap-2">
              {achievements.map(a => {
                const name = achievementNames[a.id];
                return (
                  <motion.div
                    key={a.id}
                    whileHover={{ scale: 1.05 }}
                    className="bg-muted/30 rounded-xl px-3 py-2 flex items-center gap-2"
                  >
                    <span className="text-lg">🏅</span>
                    <span className="font-display font-semibold text-xs">
                      {name ? name[lang] || name.en : a.id}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        <motion.div variants={itemVariants} className="card-kid relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 pointer-events-none" />
          <h3 className="font-display text-lg font-bold mb-3 flex items-center gap-2 relative z-10">
            💡 {t({ he: "המלצות", ar: "توصيات", en: "Recommendations" })}
          </h3>
          <div className="space-y-2 relative z-10">
            {progress.completedLetters.length < 26 && (
              <p className="text-sm font-body text-muted-foreground flex items-center gap-2">
                <span>🔤</span>
                {t({
                  he: `למד עוד ${26 - progress.completedLetters.length} אותיות כדי להשלים את האלפבית!`,
                  ar: `تعلم ${26 - progress.completedLetters.length} حرف إضافي لإكمال الأبجدية!`,
                  en: `Learn ${26 - progress.completedLetters.length} more letters to complete the alphabet!`,
                })}
              </p>
            )}
            {accuracy < 80 && accuracy > 0 && (
              <p className="text-sm font-body text-muted-foreground flex items-center gap-2">
                <span>🎯</span>
                {t({
                  he: "נסה לחזור על חידונים כדי לשפר את הדיוק שלך!",
                  ar: "حاول إعادة الاختبارات لتحسين دقتك!",
                  en: "Try retaking quizzes to improve your accuracy!",
                })}
              </p>
            )}
            {weekly.activeDays < 5 && (
              <p className="text-sm font-body text-muted-foreground flex items-center gap-2">
                <span>🔥</span>
                {t({
                  he: "נסה לשחק כל יום כדי לבנות רצף!",
                  ar: "حاول اللعب كل يوم لبناء سلسلة!",
                  en: "Try playing every day to build a streak!",
                })}
              </p>
            )}
            {progress.completedWords.length < 50 && (
              <p className="text-sm font-body text-muted-foreground flex items-center gap-2">
                <span>📚</span>
                {t({
                  he: `למד עוד ${50 - progress.completedWords.length} מילים להגיע ל-50!`,
                  ar: `تعلم ${50 - progress.completedWords.length} كلمة إضافية للوصول إلى 50!`,
                  en: `Learn ${50 - progress.completedWords.length} more words to reach 50!`,
                })}
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProgressReport;
