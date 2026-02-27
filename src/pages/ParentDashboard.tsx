import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { getXP, getLevel } from "@/lib/xp";
import { getTotalEarnedStars } from "@/lib/levels";
import { getUnlockedAchievements } from "@/lib/achievements";
import { getProfile, getWeeklyStats, getSessions } from "@/lib/ageProfile";
import FloatingParticles from "@/components/FloatingParticles";
import ClassroomBackground from "@/components/ClassroomBackground";
import Interactive3DMascot from "@/components/Interactive3DMascot";
import {
  Shield, BarChart3, Clock, Gamepad2, BookOpen, Star,
  Trophy, Zap, TrendingUp, Calendar, Lock,
} from "lucide-react";

const ParentDashboard = () => {
  const { lang, dir } = useLanguage();
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const t = (texts: Record<string, string>) => texts[lang] || texts.en;
  const profile = getProfile();
  const xp = getXP();
  const level = getLevel(xp.totalXP);
  const totalStars = getTotalEarnedStars();
  const badges = getUnlockedAchievements();
  const weeklyStats = getWeeklyStats();
  const sessions = getSessions();

  // Simple PIN gate (default: 1234 if no PIN set)
  const handlePinSubmit = () => {
    const correctPin = profile?.parentPin || "1234";
    if (pin === correctPin) {
      setUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPin("");
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center relative" dir={dir}>
        <ClassroomBackground />
        <FloatingParticles count={8} />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="card-kid max-w-sm w-full mx-4 text-center relative z-10 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-lavender/5 pointer-events-none" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
          />
          <motion.div
            className="relative z-10"
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Shield className="w-16 h-16 mx-auto mb-4 text-primary drop-shadow-lg" />
          </motion.div>
          <h1 className="text-2xl font-display font-bold mb-2">
            {t({ he: "פינת ההורים", ar: "ركن الوالدين", en: "Parent Zone" })}
          </h1>
          <p className="text-sm text-muted-foreground font-body mb-6">
            {t({
              he: "הזן קוד PIN כדי לצפות בהתקדמות (ברירת מחדל: 1234)",
              ar: "أدخل رمز PIN لعرض التقدم (الافتراضي: 1234)",
              en: "Enter PIN to view progress (default: 1234)",
            })}
          </p>

          <div className="flex justify-center gap-2 mb-4">
            {[0, 1, 2, 3].map(i => (
              <motion.div
                key={i}
                className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-display font-bold transition-colors ${
                  pin.length > i
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/30"
                }`}
                animate={pinError && pin.length === 0 ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                {pin[i] ? "●" : ""}
              </motion.div>
            ))}
          </div>

          {pinError && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-destructive text-sm font-display font-bold mb-3"
            >
              {t({ he: "קוד שגוי", ar: "رمز خاطئ", en: "Wrong PIN" })}
            </motion.p>
          )}

          {/* Number pad */}
          <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "⌫"].map((num, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (num === "⌫") setPin(p => p.slice(0, -1));
                  else if (num !== null && pin.length < 4) {
                    const newPin = pin + num;
                    setPin(newPin);
                    if (newPin.length === 4) {
                      setTimeout(() => {
                        const correctPin = profile?.parentPin || "1234";
                        if (newPin === correctPin) {
                          setUnlocked(true);
                        } else {
                          setPinError(true);
                          setPin("");
                        }
                      }, 200);
                    }
                  }
                }}
                disabled={num === null}
                className={`h-12 rounded-xl font-display font-bold text-lg transition-colors ${
                  num === null ? "invisible" :
                  "bg-muted/30 hover:bg-muted/50 active:bg-primary/15"
                }`}
              >
                {num !== null ? num : ""}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Last 7 days activity
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const daySessions = sessions.filter(s => s.date.slice(0, 10) === dateStr);
    return {
      day: d.toLocaleDateString(lang === "he" ? "he-IL" : lang === "ar" ? "ar-SA" : "en-US", { weekday: "short" }),
      minutes: daySessions.reduce((sum, s) => sum + s.duration, 0),
      games: daySessions.reduce((sum, s) => sum + s.gamesPlayed.length, 0),
      active: daySessions.length > 0,
    };
  });

  const maxMinutes = Math.max(...last7Days.map(d => d.minutes), 1);

  return (
    <div className="min-h-screen relative" dir={dir}>
      <ClassroomBackground />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto px-4 py-8 relative z-10"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <Interactive3DMascot mood="idle" size="sm" />
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">
            {t({ he: "דשבורד הורים", ar: "لوحة الوالدين", en: "Parent Dashboard" })}
          </h1>
          <p className="text-muted-foreground font-body">
            {t({ he: "מעקב התקדמות ותובנות למידה", ar: "تتبع التقدم ورؤى التعلم", en: "Progress tracking & learning insights" })}
          </p>
        </motion.div>

        {/* Learner Profile Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="card-kid mb-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-sunshine/5 pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl shadow-lg">
              {profile?.avatar || "🦉"}
            </div>
            <div className="flex-1">
              <h2 className="font-display font-bold text-lg">{profile?.name || t({ he: "לומד", ar: "متعلم", en: "Learner" })}</h2>
              <p className="text-sm text-muted-foreground font-display">
                {profile?.age ? `${t({ he: "גיל", ar: "العمر", en: "Age" })} ${profile.age}` : ""} • {level.title} • {xp.totalXP} XP
              </p>
            </div>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          {[
            { icon: <Zap className="w-5 h-5 text-primary" />, value: xp.totalXP, label: "Total XP", gradient: "from-primary/8 to-primary/3" },
            { icon: <Star className="w-5 h-5 text-sunshine fill-sunshine" />, value: totalStars, label: t({ he: "כוכבים", ar: "نجوم", en: "Stars" }), gradient: "from-sunshine/10 to-sunshine/3" },
            { icon: <Trophy className="w-5 h-5 text-accent" />, value: badges.length, label: t({ he: "הישגים", ar: "إنجازات", en: "Badges" }), gradient: "from-accent/8 to-accent/3" },
            { icon: <TrendingUp className="w-5 h-5 text-grass" />, value: xp.streak, label: t({ he: "רצף", ar: "سلسلة", en: "Streak" }), gradient: "from-grass/8 to-grass/3" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.06, type: "spring", stiffness: 250 }}
              whileHover={{ scale: 1.04, y: -2 }}
              className={`bg-card/90 backdrop-blur-sm rounded-2xl p-3 text-center border border-border/50 shadow-md relative overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} pointer-events-none`} />
              <div className="flex justify-center mb-1 relative z-10">{stat.icon}</div>
              <p className="font-display font-extrabold text-xl relative z-10">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-semibold relative z-10">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Weekly Activity Chart */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card-kid mb-6"
        >
          <h3 className="font-display font-bold text-base mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            {t({ he: "פעילות שבועית", ar: "النشاط الأسبوعي", en: "Weekly Activity" })}
          </h3>

          {/* Weekly summary */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-sky/8 backdrop-blur-sm rounded-xl p-2.5 text-center border border-sky/10">
              <Clock className="w-4 h-4 mx-auto mb-1 text-sky" />
              <p className="font-display font-bold text-sm">{weeklyStats.totalMinutes}m</p>
              <p className="text-[10px] text-muted-foreground">{t({ he: "זמן למידה", ar: "وقت التعلم", en: "Study time" })}</p>
            </div>
            <div className="bg-candy/8 backdrop-blur-sm rounded-xl p-2.5 text-center border border-candy/10">
              <Gamepad2 className="w-4 h-4 mx-auto mb-1 text-candy" />
              <p className="font-display font-bold text-sm">{weeklyStats.totalGames}</p>
              <p className="text-[10px] text-muted-foreground">{t({ he: "משחקים", ar: "ألعاب", en: "Games" })}</p>
            </div>
            <div className="bg-grass/8 backdrop-blur-sm rounded-xl p-2.5 text-center border border-grass/10">
              <Calendar className="w-4 h-4 mx-auto mb-1 text-grass" />
              <p className="font-display font-bold text-sm">{weeklyStats.daysActive}/7</p>
              <p className="text-[10px] text-muted-foreground">{t({ he: "ימים פעילים", ar: "أيام نشطة", en: "Active days" })}</p>
            </div>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-2 h-32">
            {last7Days.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  className="w-full rounded-t-lg relative overflow-hidden"
                  style={{
                    background: day.active
                      ? "var(--gradient-hero)"
                      : "hsl(var(--muted))",
                    minHeight: 4,
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max((day.minutes / maxMinutes) * 100, 5)}%` }}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.05, ease: "easeOut" }}
                >
                  {day.active && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    />
                  )}
                </motion.div>
                <span className="text-[10px] text-muted-foreground font-display">{day.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Learning Insights */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="card-kid mb-6"
        >
          <h3 className="font-display font-bold text-base mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-lavender" />
            {t({ he: "תובנות למידה", ar: "رؤى التعلم", en: "Learning Insights" })}
          </h3>
          <div className="space-y-3">
            {[
              {
                emoji: "📊",
                title: t({ he: "התקדמות כללית", ar: "التقدم العام", en: "Overall Progress" }),
                desc: t({
                  he: `${level.title} - רמה ${level.level}. צבר ${xp.totalXP} נקודות XP ו-${totalStars} כוכבים.`,
                  ar: `${level.title} - مستوى ${level.level}. جمع ${xp.totalXP} نقطة XP و ${totalStars} نجوم.`,
                  en: `${level.title} - Level ${level.level}. Earned ${xp.totalXP} XP and ${totalStars} stars.`,
                }),
                gradient: "from-primary/5 to-sky/5",
              },
              {
                emoji: "🏅",
                title: t({ he: "הישגים", ar: "الإنجازات", en: "Achievements" }),
                desc: t({
                  he: `פתח ${badges.length} מתוך 28 הישגים. ${badges.length < 10 ? "יש עוד המון מה לגלות!" : "התקדמות מצוינת!"}`,
                  ar: `فتح ${badges.length} من أصل 28 إنجازاً. ${badges.length < 10 ? "هناك الكثير لاكتشافه!" : "تقدم ممتاز!"}`,
                  en: `Unlocked ${badges.length} of 28 achievements. ${badges.length < 10 ? "Lots more to discover!" : "Excellent progress!"}`,
                }),
                gradient: "from-sunshine/5 to-candy/5",
              },
              {
                emoji: "🔥",
                title: t({ he: "עקביות", ar: "الاتساق", en: "Consistency" }),
                desc: xp.streak > 0
                  ? t({
                      he: `רצף נוכחי: ${xp.streak} ימים! ${xp.streak >= 7 ? "שיא מרשים!" : "ממשיכים!"}`,
                      ar: `السلسلة الحالية: ${xp.streak} أيام! ${xp.streak >= 7 ? "رقم مذهل!" : "استمر!"}`,
                      en: `Current streak: ${xp.streak} days! ${xp.streak >= 7 ? "Impressive!" : "Keep going!"}`,
                    })
                  : t({ he: "עדיין לא התחיל רצף. עודדו את הילד להיכנס כל יום!", ar: "لم تبدأ سلسلة بعد. شجعوا الطفل على الدخول يوميًا!", en: "No streak yet. Encourage daily practice!" }),
                gradient: "from-candy/5 to-lavender/5",
              },
            ].map((insight, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.01, x: dir === "rtl" ? -3 : 3 }}
                className={`flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br ${insight.gradient} border border-border/30`}
              >
                <span className="text-xl">{insight.emoji}</span>
                <div>
                  <p className="font-display font-bold text-sm">{insight.title}</p>
                  <p className="text-xs text-muted-foreground font-body leading-relaxed">{insight.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card-kid"
        >
          <h3 className="font-display font-bold text-base mb-3 flex items-center gap-2">
            💡 {t({ he: "טיפים להורים", ar: "نصائح للوالدين", en: "Tips for Parents" })}
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground font-body">
            <li className="flex items-start gap-2">
              <span>✅</span>
              {t({ he: "עודדו 15-20 דקות למידה ביום לתוצאות מיטביות", ar: "شجعوا 15-20 دقيقة تعلم يومياً للحصول على أفضل النتائج", en: "Encourage 15-20 minutes daily for best results" })}
            </li>
            <li className="flex items-start gap-2">
              <span>✅</span>
              {t({ he: "חגגו הישגים יחד עם הילד", ar: "احتفلوا بالإنجازات مع الطفل", en: "Celebrate achievements together" })}
            </li>
            <li className="flex items-start gap-2">
              <span>✅</span>
              {t({ he: "השתמשו במילה היומית בשיחות רגילות", ar: "استخدموا كلمة اليوم في المحادثات العادية", en: "Use the word of the day in daily conversations" })}
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ParentDashboard;
