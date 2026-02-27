import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import {
  loadProfile,
  getDefaultProfile,
  generateDailyPlan,
  updateSkillLevel,
  saveProfile,
  type LearnerProfile,
  type DailyPlan,
  type SkillArea,
  type LearningGoal,
  type AgeGroup,
} from "@/lib/learningPath";
import {
  Brain,
  BookOpen,
  Mic,
  Pencil,
  Ear,
  Trophy,
  Star,
  ChevronRight,
  Zap,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const AGE_GROUPS: { label: string; value: AgeGroup; age: number }[] = [
  { label: "0-3 🍼", value: "0-3", age: 2 },
  { label: "4-6 🌱", value: "4-6", age: 5 },
  { label: "7-10 📚", value: "7-10", age: 8 },
  { label: "11-14 🚀", value: "11-14", age: 12 },
];

const GOALS: { key: LearningGoal; emoji: string }[] = [
  { key: "phonics", emoji: "🔤" },
  { key: "vocabulary", emoji: "📖" },
  { key: "grammar", emoji: "✏️" },
  { key: "listening", emoji: "👂" },
  { key: "speaking", emoji: "🗣️" },
];

const SKILL_ICONS: Record<SkillArea, React.ReactNode> = {
  phonics: <BookOpen size={16} />,
  vocabulary: <Brain size={16} />,
  grammar: <Pencil size={16} />,
  listening: <Ear size={16} />,
  speaking: <Mic size={16} />,
  reading: <BookOpen size={16} />,
  writing: <Pencil size={16} />,
};

const SKILL_COLORS: Record<SkillArea, string> = {
  phonics: "bg-sky-400",
  vocabulary: "bg-violet-400",
  grammar: "bg-emerald-400",
  listening: "bg-amber-400",
  speaking: "bg-rose-400",
  reading: "bg-cyan-400",
  writing: "bg-fuchsia-400",
};

const STEP_ICONS: Record<string, string> = {
  warm_up: "🌅",
  teach: "💡",
  guided_practice: "✏️",
  game: "🎮",
  story: "📖",
  review: "🔄",
  reward: "🏆",
};

const AGE_KEY = "learning-path-age";

// ─── Circular progress ring ───────────────────────────────────────────────────

const CircleRing = ({ value }: { value: number }) => {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width={96} height={96} className="rotate-[-90deg]">
      <circle cx={48} cy={48} r={r} stroke="#e5e7eb" strokeWidth={8} fill="none" />
      <motion.circle
        cx={48}
        cy={48}
        r={r}
        stroke="url(#ringGrad)"
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LearningPathPage() {
  const navigate = useNavigate();
  const { lang, dir, t } = useLanguage();

  // Age group
  const [selectedAge, setSelectedAge] = useState<AgeGroup>(() => {
    return (localStorage.getItem(AGE_KEY) as AgeGroup) ?? "4-6";
  });

  // Learner profile
  const [profile, setProfile] = useState<LearnerProfile>(() => {
    const stored = loadProfile();
    if (stored) return stored;
    const ag = AGE_GROUPS.find((a) => a.value === ((localStorage.getItem(AGE_KEY) as AgeGroup) ?? "4-6"))!;
    return getDefaultProfile(ag.age, lang);
  });

  // Daily plan
  const [goal, setGoal] = useState<LearningGoal>("vocabulary");
  const [plan, setPlan] = useState<DailyPlan>(() =>
    generateDailyPlan(profile, "vocabulary")
  );

  // Re-generate plan when goal or profile changes
  const regeneratePlan = useCallback(
    (p: LearnerProfile, g: LearningGoal) => {
      setPlan(generateDailyPlan(p, g));
    },
    []
  );

  const handleAgeSelect = (ag: { value: AgeGroup; age: number }) => {
    setSelectedAge(ag.value);
    localStorage.setItem(AGE_KEY, ag.value);
    const newProfile = getDefaultProfile(ag.age, lang);
    setProfile(newProfile);
    saveProfile(newProfile);
    regeneratePlan(newProfile, goal);
  };

  const handleGoalChange = (g: LearningGoal) => {
    setGoal(g);
    regeneratePlan(profile, g);
  };

  // Skill names in current language
  const skillLabel = (skill: SkillArea): string => {
    const map: Record<SkillArea, Record<string, string>> = {
      phonics:     { he: "פוניקה", ar: "الصوتيات", en: "Phonics" },
      vocabulary:  { he: "אוצר מילים", ar: "مفردات", en: "Vocabulary" },
      grammar:     { he: "דקדוק", ar: "قواعد", en: "Grammar" },
      listening:   { he: "האזנה", ar: "استماع", en: "Listening" },
      speaking:    { he: "דיבור", ar: "تحدث", en: "Speaking" },
      reading:     { he: "קריאה", ar: "قراءة", en: "Reading" },
      writing:     { he: "כתיבה", ar: "كتابة", en: "Writing" },
    };
    return map[skill][lang] ?? map[skill]["en"];
  };

  const goalLabel = (g: LearningGoal): string => skillLabel(g as SkillArea);

  const pageTitle = { he: "מסע הלמידה שלי", ar: "رحلة تعلمي", en: "My Learning Journey" }[lang] ?? "My Learning Journey";
  const todayLabel = { he: "תוכנית היום", ar: "خطة اليوم", en: "Today's Plan" }[lang];
  const skillsLabel = { he: "רמות מיומנות", ar: "مستويات المهارة", en: "Skill Levels" }[lang];
  const overallLabel = { he: "רמה כללית", ar: "المستوى العام", en: "Overall Level" }[lang];
  const startLabel = { he: "התחל ←", ar: "ابدأ ←", en: "Start →" }[lang];
  const goalTabLabel = { he: "מטרה", ar: "الهدف", en: "Goal" }[lang];
  const minLabel = { he: "ד׳", ar: "د", en: "min" }[lang];

  const skills: SkillArea[] = ["phonics", "vocabulary", "grammar", "listening", "speaking", "reading", "writing"];

  return (
    <div dir={dir} className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-white pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-500 pt-8 pb-12 px-4 text-center shadow-lg">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-extrabold text-white drop-shadow mb-1"
        >
          🗺️ {pageTitle}
        </motion.h1>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-6 space-y-5">

        {/* Age selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-md p-4"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {AGE_GROUPS.map((ag) => (
              <motion.button
                key={ag.value}
                whileTap={{ scale: 0.93 }}
                onClick={() => handleAgeSelect(ag)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  selectedAge === ag.value
                    ? "bg-violet-500 text-white shadow-md scale-105"
                    : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                }`}
              >
                {ag.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Overall Level ring + skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-md p-5"
        >
          <div className="flex items-center gap-5 mb-4">
            {/* Circular ring */}
            <div className="relative flex-shrink-0 flex items-center justify-center w-24 h-24">
              <CircleRing value={profile.overallLevel} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-violet-600 leading-none">
                  {profile.overallLevel}
                </span>
                <span className="text-xs text-gray-400">{overallLabel}</span>
              </div>
            </div>
            {/* Skill bars */}
            <div className="flex-1 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                {skillsLabel}
              </p>
              {skills.map((skill) => (
                <div key={skill} className="flex items-center gap-2">
                  <span className="text-gray-400 w-4">{SKILL_ICONS[skill]}</span>
                  <span className="text-xs text-gray-600 w-16 shrink-0">{skillLabel(skill)}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${profile.skillLevels[skill]}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${SKILL_COLORS[skill]}`}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-7 text-right">
                    {profile.skillLevels[skill]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Goal selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl shadow-md p-4"
        >
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {goalTabLabel}
          </p>
          <div className="flex gap-2 flex-wrap justify-center">
            {GOALS.map(({ key, emoji }) => (
              <motion.button
                key={key}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleGoalChange(key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                  goal === key
                    ? "bg-indigo-500 text-white shadow"
                    : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                }`}
              >
                <span>{emoji}</span>
                <span>{goalLabel(key)}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Today's Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-md p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-1">
              <Zap size={18} className="text-amber-400" />
              {todayLabel}
            </h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              ~{plan.estimatedMinutes} {minLabel}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={goal}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              {plan.steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-100"
                >
                  <span className="text-2xl w-9 text-center flex-shrink-0">
                    {STEP_ICONS[step.type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {step.label[lang] ?? step.label["en"]}
                    </p>
                    <span className="text-xs text-indigo-400">
                      {step.durationMin} {minLabel}
                    </span>
                  </div>
                  {step.route ? (
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => navigate(step.route!)}
                      className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex-shrink-0"
                    >
                      {startLabel}
                      <ChevronRight size={14} />
                    </motion.button>
                  ) : (
                    <span className="w-16" />
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
}
