import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import {
  ACTIVITIES,
  generateSessionPlan,
  getProgressOverview,
  getActivityProgress,
  getAgeBucket,
  type LearningActivity,
  type SessionActivity,
} from "@/lib/learningPath";
import { getPerformanceSummary } from "@/lib/adaptiveDifficulty";
import { playClickSound, playStarSound } from "@/lib/sounds";
import ClassroomBackground from "@/components/ClassroomBackground";
import FloatingParticles from "@/components/FloatingParticles";
import Interactive3DMascot from "@/components/Interactive3DMascot";
import BackToLevels from "@/components/BackToLevels";
import {
  Rocket,
  BookOpen,
  Brain,
  CheckCircle,
  Lock,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Play,
  Clock,
  Star,
  ChevronRight,
  Zap,
  Target,
} from "lucide-react";

/* ─── helpers ─── */
const reasonLabel = (reason: string, t: (k: Record<string, string>) => string) => {
  switch (reason) {
    case "new": return t({ he: "חדש!", ar: "جديد!", en: "New!" });
    case "review": return t({ he: "חזרה", ar: "مراجعة", en: "Review" });
    case "remediation": return t({ he: "תרגול חוזר", ar: "تمرين إضافي", en: "Extra Practice" });
    default: return "";
  }
};
const reasonColor = (reason: string) => {
  switch (reason) {
    case "new": return "bg-accent/15 text-accent-foreground border-accent/30";
    case "review": return "bg-sky/15 text-sky-foreground border-sky/30";
    case "remediation": return "bg-candy/15 text-candy-foreground border-candy/30";
    default: return "bg-muted text-muted-foreground";
  }
};
const reasonIcon = (reason: string) => {
  switch (reason) {
    case "new": return <Sparkles className="w-3 h-3" />;
    case "review": return <RefreshCw className="w-3 h-3" />;
    case "remediation": return <AlertTriangle className="w-3 h-3" />;
    default: return null;
  }
};

const statusIcon = (act: LearningActivity) => {
  const p = getActivityProgress(act.id);
  if (!p) return null;
  if (p.correctRate >= act.masteryThreshold && p.attempts >= 2)
    return <CheckCircle className="w-4 h-4 text-accent" />;
  return <Star className="w-4 h-4 text-sunshine" />;
};

const LearningPathsPage = () => {
  const navigate = useNavigate();
  const { lang, dir } = useLanguage();
  const t = (texts: Record<string, string>) => texts[lang] || texts.en;

  const [tab, setTab] = useState<"recommended" | "all">("recommended");

  const ageBucket = useMemo(() => getAgeBucket(), []);
  const session = useMemo(() => generateSessionPlan(undefined, 6), []);
  const overview = useMemo(() => getProgressOverview(), []);
  const perf = useMemo(() => getPerformanceSummary(), []);

  const allActivities = useMemo(() => {
    return ACTIVITIES.filter((a) => a.ageBuckets.includes(ageBucket));
  }, [ageBucket]);

  const handleGo = (path: string) => {
    playClickSound();
    navigate(path);
  };

  const masteredCount = overview.mastered.length;
  const totalCount = allActivities.length;
  const progressPct = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen relative" dir={dir}>
      <ClassroomBackground />
      <FloatingParticles count={6} />

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <BackToLevels />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Interactive3DMascot mood="idle" size="sm" />
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">
            {t({ he: "🗺️ מסלולי למידה", ar: "🗺️ مسارات التعلم", en: "🗺️ Learning Paths" })}
          </h1>
          <p className="text-muted-foreground font-body">
            {t({
              he: "סדר מומלץ של נושאים ומשחקים בדיוק בשבילך",
              ar: "ترتيب مقترح للمواضيع والألعاب المناسبة لك",
              en: "A recommended order of topics and games just for you",
            })}
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="card-kid text-center p-3">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-4 h-4 text-primary" />
              <span className="font-display font-bold text-lg">{perf.overallAccuracy}%</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{t({ he: "דיוק", ar: "دقة", en: "Accuracy" })}</p>
          </div>
          <div className="card-kid text-center p-3">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span className="font-display font-bold text-lg">{masteredCount}/{totalCount}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{t({ he: "הושלמו", ar: "مكتملة", en: "Mastered" })}</p>
          </div>
          <div className="card-kid text-center p-3">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-sunshine" />
              <span className="font-display font-bold text-lg">{perf.totalSessions}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{t({ he: "שיעורים", ar: "جلسات", en: "Sessions" })}</p>
          </div>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-display font-semibold text-muted-foreground">
              {t({ he: "התקדמות כללית", ar: "التقدم العام", en: "Overall Progress" })}
            </span>
            <span className="text-xs font-display font-bold text-primary">{progressPct}%</span>
          </div>
          <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6">
          {(["recommended", "all"] as const).map((key) => (
            <motion.button
              key={key}
              whileTap={{ scale: 0.95 }}
              onClick={() => { playClickSound(); setTab(key); }}
              className={`flex-1 py-2.5 rounded-xl font-display font-semibold text-sm transition-colors ${
                tab === key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card/80 text-muted-foreground hover:bg-card"
              }`}
            >
              {key === "recommended"
                ? t({ he: "🚀 מומלץ עכשיו", ar: "🚀 موصى به الآن", en: "🚀 Recommended" })
                : t({ he: "📋 כל הנושאים", ar: "📋 جميع المواضيع", en: "📋 All Topics" })}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "recommended" ? (
            <motion.div
              key="recommended"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Session plan */}
              <div className="mb-4 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                <h2 className="font-display font-bold text-lg">
                  {t({ he: "המסלול שלך להיום", ar: "مسارك لليوم", en: "Your Path for Today" })}
                </h2>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-display">
                  ~{session.estimatedMinutes} {t({ he: "דק'", ar: "دق", en: "min" })}
                </span>
              </div>

              {session.activities.length === 0 ? (
                <div className="card-kid text-center py-8">
                  <span className="text-5xl mb-3 block">🎉</span>
                  <p className="font-display font-bold text-lg mb-1">
                    {t({ he: "סיימת הכל!", ar: "أنجزت كل شيء!", en: "All done!" })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t({ he: "חזור מחר לחזרות", ar: "عد غداً للمراجعة", en: "Come back tomorrow for reviews" })}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {session.activities.map((sa, i) => (
                    <SessionCard
                      key={sa.activity.id}
                      sa={sa}
                      index={i}
                      total={session.activities.length}
                      t={t}
                      lang={lang}
                      onGo={() => handleGo(sa.activity.path)}
                    />
                  ))}
                </div>
              )}

              {/* Weak areas */}
              {overview.remediation.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-candy" />
                    <h2 className="font-display font-bold text-lg">
                      {t({ he: "תחומים לחיזוק", ar: "مجالات للتحسين", en: "Areas to Improve" })}
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {overview.remediation.map((act) => (
                      <motion.button
                        key={act.id}
                        whileHover={{ y: -3, scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleGo(act.path)}
                        className="card-kid text-start p-3 border-candy/20"
                      >
                        <span className="text-2xl">{act.emoji}</span>
                        <p className="font-display font-semibold text-sm mt-1">{act.title[lang]}</p>
                        <p className="text-[10px] text-muted-foreground">{act.description[lang]}</p>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="all"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Full activity map grouped by type */}
              <AllActivitiesMap
                activities={allActivities}
                t={t}
                lang={lang}
                onGo={handleGo}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ─── Session Card ─── */
const SessionCard = ({
  sa,
  index,
  total,
  t,
  lang,
  onGo,
}: {
  sa: SessionActivity;
  index: number;
  total: number;
  t: (k: Record<string, string>) => string;
  lang: string;
  onGo: () => void;
}) => {
  const act = sa.activity;
  const progress = getActivityProgress(act.id);
  const pct = progress ? Math.round(progress.correctRate * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      className="relative"
    >
      {/* Connector line */}
      {index < total - 1 && (
        <div className="absolute start-6 top-full w-0.5 h-3 bg-primary/20 z-0" />
      )}

      <motion.button
        whileHover={{ y: -3, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={onGo}
        className="card-kid w-full text-start relative overflow-hidden"
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          {/* Step number */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-display font-bold text-sm shrink-0 shadow-md">
            {index + 1}
          </div>

          {/* Icon */}
          <span className="text-3xl shrink-0">{act.emoji}</span>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-display font-bold text-sm truncate">{act.title[lang as keyof typeof act.title]}</p>
              {statusIcon(act)}
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-1">{act.description[lang as keyof typeof act.description]}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 text-[10px] font-display font-semibold px-1.5 py-0.5 rounded-full border ${reasonColor(sa.reason)}`}>
                {reasonIcon(sa.reason)}
                {reasonLabel(sa.reason, t)}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Clock className="w-2.5 h-2.5" />
                {act.estimatedMinutes}{t({ he: " דק'", ar: " دق", en: "m" })}
              </span>
              {progress && (
                <span className="text-[10px] text-muted-foreground">
                  {pct}% {t({ he: "דיוק", ar: "دقة", en: "acc" })}
                </span>
              )}
            </div>
          </div>

          {/* Go arrow */}
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Play className="w-3.5 h-3.5 text-primary" />
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
};

/* ─── All Activities Map ─── */
const AllActivitiesMap = ({
  activities,
  t,
  lang,
  onGo,
}: {
  activities: LearningActivity[];
  t: (k: Record<string, string>) => string;
  lang: string;
  onGo: (path: string) => void;
}) => {
  const groups = useMemo(() => {
    const map = new Map<string, LearningActivity[]>();
    const typeLabels: Record<string, Record<string, string>> = {
      alphabet: { he: "🔤 אלפבית", ar: "🔤 الأبجدية", en: "🔤 Alphabet" },
      words: { he: "📝 אוצר מילים", ar: "📝 مفردات", en: "📝 Vocabulary" },
      quiz: { he: "🎯 חידונים", ar: "🎯 اختبارات", en: "🎯 Quizzes" },
      memory: { he: "🧩 משחקי זיכרון", ar: "🧩 ألعاب الذاكرة", en: "🧩 Memory Games" },
      spelling: { he: "🐝 איות", ar: "🐝 تهجئة", en: "🐝 Spelling" },
      scramble: { he: "🔀 מילים מבולבלות", ar: "🔀 كلمات مخلوطة", en: "🔀 Scramble" },
      hangman: { he: "🎭 ניחוש", ar: "🎭 تخمين", en: "🎭 Hangman" },
      pattern: { he: "🧩 דפוסים", ar: "🧩 أنماط", en: "🧩 Patterns" },
      story: { he: "📖 סיפורים", ar: "📖 قصص", en: "📖 Stories" },
    };
    for (const act of activities) {
      const key = act.type;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(act);
    }
    return Array.from(map.entries()).map(([type, acts]) => ({
      type,
      label: typeLabels[type] || { en: type },
      activities: acts,
    }));
  }, [activities]);

  return (
    <div className="space-y-6">
      {groups.map((group, gi) => (
        <motion.div
          key={group.type}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.06 }}
        >
          <h3 className="font-display font-bold text-base mb-2 flex items-center gap-2">
            {group.label[lang] || group.label.en}
            <span className="text-xs text-muted-foreground font-normal">
              ({group.activities.length})
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {group.activities.map((act, i) => {
              const progress = getActivityProgress(act.id);
              const mastered = progress && progress.correctRate >= act.masteryThreshold && progress.attempts >= 2;
              const started = !!progress;

              return (
                <motion.button
                  key={act.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.06 + i * 0.04 }}
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { playClickSound(); onGo(act.path); }}
                  className={`card-kid text-start p-3 flex items-center gap-3 ${
                    mastered ? "border-accent/30 bg-accent/5" : ""
                  }`}
                >
                  <span className="text-2xl shrink-0">{act.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-display font-semibold text-sm truncate">
                        {act.title[lang as keyof typeof act.title]}
                      </p>
                      {mastered && <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0" />}
                      {started && !mastered && <Star className="w-3.5 h-3.5 text-sunshine shrink-0" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {act.description[lang as keyof typeof act.description]}
                    </p>
                    {progress && (
                      <div className="h-1 bg-muted/50 rounded-full overflow-hidden mt-1.5">
                        <div
                          className={`h-full rounded-full ${mastered ? "bg-accent" : "bg-primary/60"}`}
                          style={{ width: `${Math.round(progress.correctRate * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default LearningPathsPage;
