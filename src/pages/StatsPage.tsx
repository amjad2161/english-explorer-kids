import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useLanguage } from "@/lib/i18n";
import { getProgress } from "@/lib/progress";
import { getXP, getLevel } from "@/lib/xp";
import { getStatsHistory, getLastNDays, getWeeklySummary } from "@/lib/statsTracker";
import { getTotalEarnedStars } from "@/lib/levels";
import { getUnlockedAchievements } from "@/lib/achievements";
import FloatingParticles from "@/components/FloatingParticles";
import StreakCalendar from "@/components/StreakCalendar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";
import { Trophy, Zap, BookOpen, Star, Flame, Target, Clock, TrendingUp, Award } from "lucide-react";

const dayNames: Record<string, string[]> = {
  he: ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"],
  ar: ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

const CHART_COLORS = [
  "hsl(25, 95%, 55%)", "hsl(195, 85%, 55%)", "hsl(145, 65%, 48%)",
  "hsl(330, 85%, 60%)", "hsl(270, 70%, 65%)", "hsl(45, 100%, 60%)",
];

const gameTypeLabels: Record<string, Record<string, string>> = {
  quiz: { he: "חידון", ar: "اختبار", en: "Quiz" },
  spelling: { he: "איות", ar: "تهجئة", en: "Spelling" },
  scramble: { he: "בלבול", ar: "خلط", en: "Scramble" },
  hangman: { he: "ניחוש", ar: "تخمين", en: "Hangman" },
  memory: { he: "זיכרון", ar: "ذاكرة", en: "Memory" },
  words: { he: "מילים", ar: "كلمات", en: "Words" },
  alphabet: { he: "אלפבית", ar: "أبجدية", en: "Alphabet" },
};

const StatsPage = () => {
  const { lang, dir } = useLanguage();
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(7);

  const t = (texts: Record<string, string>) => texts[lang] || texts.en;

  const progress = useMemo(() => getProgress(), []);
  const xpState = useMemo(() => getXP(), []);
  const level = useMemo(() => getLevel(xpState.totalXP), [xpState]);
  const stats = useMemo(() => getStatsHistory(), []);
  const weekly = useMemo(() => getWeeklySummary(), []);
  const totalStars = useMemo(() => getTotalEarnedStars(), []);
  const achievements = useMemo(() => getUnlockedAchievements(), []);

  // Chart data
  const dailyData = useMemo(() => {
    const days = getLastNDays(timeRange);
    return days.map(d => {
      const date = new Date(d.date);
      const dayName = dayNames[lang][date.getDay()];
      const shortDate = `${date.getDate()}/${date.getMonth() + 1}`;
      return {
        name: timeRange <= 7 ? dayName : shortDate,
        xp: d.xpEarned,
        games: d.gamesPlayed,
        correct: d.correctAnswers,
        words: d.wordsLearned,
      };
    });
  }, [timeRange, lang]);

  // Game breakdown for pie chart
  const gameBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    stats.days.forEach(d => {
      Object.entries(d.gameBreakdown).forEach(([type, count]) => {
        breakdown[type] = (breakdown[type] || 0) + count;
      });
    });
    return Object.entries(breakdown).map(([type, count], i) => ({
      name: gameTypeLabels[type]?.[lang] || type,
      value: count,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [stats, lang]);

  const accuracy = stats.totalCorrectAnswers + stats.totalWrongAnswers > 0
    ? Math.round((stats.totalCorrectAnswers / (stats.totalCorrectAnswers + stats.totalWrongAnswers)) * 100)
    : 0;

  return (
    <div className="min-h-screen relative" dir={dir}>
      <FloatingParticles count={8} />
      
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">
            {t({ he: "📊 הסטטיסטיקות שלי", ar: "📊 إحصائياتي", en: "📊 My Stats" })}
          </h1>
          <p className="text-muted-foreground font-body">
            {t({ he: "עקוב אחרי ההתקדמות שלך!", ar: "تتبع تقدمك!", en: "Track your progress!" })}
          </p>
        </motion.div>

        {/* Level card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="card-kid mb-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-sunshine/5 pointer-events-none" />
          <div className="flex items-center gap-5 relative z-10">
            <motion.div
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-sunshine flex items-center justify-center text-4xl shadow-lg"
              animate={{ rotate: [0, 3, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              {level.title.split(" ")[0]}
            </motion.div>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold">{level.title.split(" ").slice(1).join(" ")}</h2>
              <p className="text-muted-foreground text-sm font-body mb-2">
                {t({ he: `רמה ${level.level}`, ar: `مستوى ${level.level}`, en: `Level ${level.level}` })} • {xpState.totalXP} XP
              </p>
              <div className="progress-bar h-3">
                <motion.div
                  className="progress-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${(level.current / level.needed) * 100}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-display">
                {level.current}/{level.needed} XP {t({ he: "לרמה הבאה", ar: "للمستوى التالي", en: "to next level" })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: <Zap className="w-5 h-5" />, value: xpState.totalXP, label: t({ he: "XP כולל", ar: "XP إجمالي", en: "Total XP" }), color: "bg-primary/10 text-primary" },
            { icon: <Star className="w-5 h-5" />, value: totalStars, label: t({ he: "כוכבים", ar: "نجوم", en: "Stars" }), color: "bg-sunshine/15 text-sunshine-foreground" },
            { icon: <Trophy className="w-5 h-5" />, value: achievements.length, label: t({ he: "הישגים", ar: "إنجازات", en: "Achievements" }), color: "bg-accent/10 text-accent" },
            { icon: <Flame className="w-5 h-5" />, value: stats.longestDayStreak, label: t({ he: "רצף שיא (ימים)", ar: "أطول سلسلة (أيام)", en: "Best Streak (days)" }), color: "bg-candy/10 text-candy" },
            { icon: <Target className="w-5 h-5" />, value: `${accuracy}%`, label: t({ he: "דיוק", ar: "دقة", en: "Accuracy" }), color: "bg-accent/10 text-accent" },
            { icon: <BookOpen className="w-5 h-5" />, value: progress.completedWords.length, label: t({ he: "מילים נלמדו", ar: "كلمات تعلمتها", en: "Words Learned" }), color: "bg-sky/10 text-sky" },
            { icon: <TrendingUp className="w-5 h-5" />, value: stats.totalGamesPlayed, label: t({ he: "משחקים שוחקו", ar: "ألعاب لُعبت", en: "Games Played" }), color: "bg-lavender/10 text-lavender" },
            { icon: <Award className="w-5 h-5" />, value: `${progress.completedLetters.length}/26`, label: t({ he: "אותיות נלמדו", ar: "حروف تعلمتها", en: "Letters Learned" }), color: "bg-grass/10 text-grass" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 + i * 0.05, type: "spring" }}
              className="card-kid text-center"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                {stat.icon}
              </div>
              <p className="font-display text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-body">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Weekly summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-kid mb-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-sky/3 to-accent/3 pointer-events-none" />
          <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
            <Clock className="w-5 h-5 text-primary" />
            {t({ he: "סיכום שבועי", ar: "ملخص أسبوعي", en: "Weekly Summary" })}
          </h3>
          <div className="grid grid-cols-3 gap-4 relative z-10">
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-primary">{weekly.totalXP}</p>
              <p className="text-xs text-muted-foreground">XP</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-accent">{weekly.activeDays}/7</p>
              <p className="text-xs text-muted-foreground">{t({ he: "ימים פעילים", ar: "أيام نشطة", en: "Active Days" })}</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-sky">{weekly.avgAccuracy}%</p>
              <p className="text-xs text-muted-foreground">{t({ he: "דיוק", ar: "دقة", en: "Accuracy" })}</p>
            </div>
          </div>
        </motion.div>

        {/* Time range selector */}
        <div className="flex justify-center gap-2 mb-4">
          {([7, 14, 30] as const).map(range => (
            <motion.button
              key={range}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-xl font-display font-bold text-sm transition-all ${
                timeRange === range
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {range} {t({ he: "ימים", ar: "أيام", en: "Days" })}
            </motion.button>
          ))}
        </div>

        {/* XP Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-kid mb-6"
        >
          <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            {t({ he: "XP יומי", ar: "XP يومي", en: "Daily XP" })}
          </h3>
          <div className="h-52" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(25, 95%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(25, 95%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={12} tickLine={false} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontFamily: "var(--font-display)",
                  }}
                />
                <Area
                  type="monotone" dataKey="xp" stroke="hsl(25, 95%, 55%)" strokeWidth={2.5}
                  fill="url(#xpGradient)" name="XP"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Games & Correct Answers chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-kid mb-6"
        >
          <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-accent" />
            {t({ he: "משחקים ותשובות נכונות", ar: "ألعاب وإجابات صحيحة", en: "Games & Correct Answers" })}
          </h3>
          <div className="h-52" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={12} tickLine={false} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontFamily: "var(--font-display)",
                  }}
                />
                <Bar dataKey="games" fill="hsl(195, 85%, 55%)" radius={[6, 6, 0, 0]} name={t({ he: "משחקים", ar: "ألعاب", en: "Games" })} />
                <Bar dataKey="correct" fill="hsl(145, 65%, 48%)" radius={[6, 6, 0, 0]} name={t({ he: "נכונות", ar: "صحيحة", en: "Correct" })} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Game breakdown pie */}
        {gameBreakdown.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card-kid mb-6"
          >
            <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-lavender" />
              {t({ he: "פילוח משחקים", ar: "توزيع الألعاب", en: "Game Breakdown" })}
            </h3>
            <div className="flex items-center gap-6 flex-col md:flex-row">
              <div className="h-48 w-48 mx-auto" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gameBreakdown}
                      cx="50%" cy="50%"
                      innerRadius={40} outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {gameBreakdown.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        fontFamily: "var(--font-display)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                {gameBreakdown.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-display font-semibold">{item.name}</span>
                    <span className="text-xs text-muted-foreground">({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Streak Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="card-kid mb-6"
        >
          <StreakCalendar days={28} />
        </motion.div>

        {/* Milestones / achievements progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card-kid relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-sunshine/3 to-candy/3 pointer-events-none" />
          <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
            <Trophy className="w-5 h-5 text-sunshine-foreground" />
            {t({ he: "אבני דרך", ar: "معالم", en: "Milestones" })}
          </h3>
          <div className="space-y-4 relative z-10">
            {[
              { label: t({ he: "למד את כל האותיות", ar: "تعلم كل الحروف", en: "Learn all letters" }), current: progress.completedLetters.length, target: 26, emoji: "🔤" },
              { label: t({ he: "למד 50 מילים", ar: "تعلم 50 كلمة", en: "Learn 50 words" }), current: Math.min(progress.completedWords.length, 50), target: 50, emoji: "📚" },
              { label: t({ he: "אסוף 100 כוכבים", ar: "اجمع 100 نجمة", en: "Collect 100 stars" }), current: Math.min(totalStars, 100), target: 100, emoji: "⭐" },
              { label: t({ he: "הגע ל-1000 XP", ar: "وصول إلى 1000 XP", en: "Reach 1000 XP" }), current: Math.min(xpState.totalXP, 1000), target: 1000, emoji: "💎" },
              { label: t({ he: "שחק 7 ימים ברצף", ar: "العب 7 أيام متتالية", en: "7 day streak" }), current: Math.min(stats.longestDayStreak, 7), target: 7, emoji: "🔥" },
            ].map((milestone, i) => {
              const pct = Math.min((milestone.current / milestone.target) * 100, 100);
              const complete = pct >= 100;
              return (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 + i * 0.08 }}
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-xl">{milestone.emoji}</span>
                    <span className={`font-display font-semibold text-sm flex-1 ${complete ? "text-accent" : ""}`}>
                      {milestone.label}
                    </span>
                    <span className="font-display font-bold text-sm text-muted-foreground">
                      {milestone.current}/{milestone.target}
                      {complete && " ✅"}
                    </span>
                  </div>
                  <div className="progress-bar h-2.5">
                    <motion.div
                      className={`h-full rounded-full ${complete ? "bg-accent" : "bg-primary"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: 0.8 + i * 0.08 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StatsPage;
