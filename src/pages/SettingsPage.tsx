import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage, Language } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import {
  isSoundEnabled, setSoundEnabled,
  isMusicEnabled, setMusicEnabled,
  startBgMusic, stopBgMusic,
} from "@/lib/sounds";
import ClassroomBackground from "@/components/ClassroomBackground";
import { getXP, getLevel } from "@/lib/xp";
import { getTotalEarnedStars } from "@/lib/levels";
import { getUnlockedAchievements } from "@/lib/achievements";
import { getProgress } from "@/lib/progress";
import FloatingParticles from "@/components/FloatingParticles";
import Interactive3DMascot from "@/components/Interactive3DMascot";
import BackToLevels from "@/components/BackToLevels";
import {
  Volume2, VolumeX, Music, Music2, Sun, Moon, Globe, RotateCcw,
  Trash2, Download, Shield, Info, ChevronRight, Sparkles, Users,
} from "lucide-react";
import { getProfile } from "@/lib/ageProfile";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 200, damping: 22 } },
};

const langOptions: { code: Language; flag: string; name: string; native: string }[] = [
  { code: "ar", flag: "🇸🇦", name: "Arabic", native: "العربية" },
  { code: "he", flag: "🇮🇱", name: "Hebrew", native: "עברית" },
  { code: "en", flag: "🇬🇧", name: "English", native: "English" },
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const { lang, setLang, dir } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [soundOn, setSoundOn] = useState(isSoundEnabled);
  const [musicOn, setMusicOn] = useState(isMusicEnabled);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const profile = getProfile();

  const t = (texts: Record<string, string>) => texts[lang] || texts.en;

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  const toggleMusic = () => {
    const next = !musicOn;
    setMusicOn(next);
    setMusicEnabled(next);
    if (next) startBgMusic(); else stopBgMusic();
  };

  const exportData = () => {
    const data = {
      progress: getProgress(),
      xp: getXP(),
      stars: getTotalEarnedStars(),
      achievements: getUnlockedAchievements(),
      exportDate: new Date().toISOString(),
      version: "1.0",
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `english-fun-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAllProgress = () => {
    const keys = Object.keys(localStorage).filter(k => 
      k.startsWith("english-") || k.startsWith("stage-") || 
      k.startsWith("achievements-") || k.startsWith("best-streak") ||
      k.startsWith("app-lang")
    );
    keys.forEach(k => localStorage.removeItem(k));
    setResetDone(true);
    setTimeout(() => window.location.reload(), 1500);
  };

  const xp = getXP();
  const level = getLevel(xp.totalXP);

  return (
    <div className="min-h-screen relative" dir={dir}>
      <ClassroomBackground />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto px-4 py-8 relative z-10"
      >
        <BackToLevels />
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <Interactive3DMascot mood="idle" size="sm" />
          <motion.span
            className="text-5xl block mb-3"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            ⚙️
          </motion.span>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">
            {t({ he: "הגדרות", ar: "الإعدادات", en: "Settings" })}
          </h1>
          <p className="text-muted-foreground font-body">
            {t({ he: "התאם את החוויה שלך", ar: "خصّص تجربتك", en: "Customize your experience" })}
          </p>
        </motion.div>

        {/* Profile Summary */}
        <motion.div variants={itemVariants} className="card-kid mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-sunshine/5 pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-sunshine flex items-center justify-center text-3xl shadow-lg"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {level.title.split(" ")[0]}
            </motion.div>
            <div className="flex-1">
              <h2 className="font-display font-bold text-lg">{level.title.split(" ").slice(1).join(" ")}</h2>
              <p className="text-sm text-muted-foreground font-display">
                {t({ he: `רמה ${level.level}`, ar: `مستوى ${level.level}`, en: `Level ${level.level}` })} • {xp.totalXP} XP • ⭐ {getTotalEarnedStars()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Language Section */}
        <motion.div variants={itemVariants} className="card-kid mb-4">
          <h3 className="font-display font-bold text-base mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            {t({ he: "שפה", ar: "اللغة", en: "Language" })}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {langOptions.map(opt => (
              <motion.button
                key={opt.code}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setLang(opt.code)}
                className={`p-3 rounded-xl text-center transition-all ${
                  lang === opt.code
                    ? "bg-primary/15 border-2 border-primary/40 shadow-md"
                    : "bg-muted/30 border-2 border-transparent hover:bg-muted/50"
                }`}
              >
                <span className="text-2xl block mb-1">{opt.flag}</span>
                <span className="font-display font-bold text-sm block">{opt.native}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div variants={itemVariants} className="card-kid mb-4">
          <h3 className="font-display font-bold text-base mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-lavender" />
            {t({ he: "מראה", ar: "المظهر", en: "Appearance" })}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon className="w-5 h-5 text-lavender" /> : <Sun className="w-5 h-5 text-sunshine-foreground" />}
              <span className="font-display font-semibold text-sm">
                {theme === "dark"
                  ? t({ he: "מצב כהה", ar: "الوضع الداكن", en: "Dark Mode" })
                  : t({ he: "מצב בהיר", ar: "الوضع الفاتح", en: "Light Mode" })}
              </span>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={`w-14 h-7 rounded-full relative transition-colors ${
                theme === "dark" ? "bg-lavender/30" : "bg-sunshine/30"
              }`}
            >
              <motion.div
                className={`w-5 h-5 rounded-full absolute top-1 shadow-md ${
                  theme === "dark" ? "bg-lavender" : "bg-sunshine-foreground"
                }`}
                animate={{ x: theme === "dark" ? 28 : 4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            </motion.button>
          </div>
        </motion.div>

        {/* Sound & Music */}
        <motion.div variants={itemVariants} className="card-kid mb-4">
          <h3 className="font-display font-bold text-base mb-4 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-sky" />
            {t({ he: "שמע ומוזיקה", ar: "الصوت والموسيقى", en: "Sound & Music" })}
          </h3>
          <div className="space-y-3">
            {/* Sound */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {soundOn ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
                <span className="font-display font-semibold text-sm">
                  {t({ he: "אפקטי קול", ar: "المؤثرات الصوتية", en: "Sound Effects" })}
                </span>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleSound}
                className={`w-14 h-7 rounded-full relative transition-colors ${
                  soundOn ? "bg-primary/30" : "bg-muted/50"
                }`}
              >
                <motion.div
                  className={`w-5 h-5 rounded-full absolute top-1 shadow-md ${
                    soundOn ? "bg-primary" : "bg-muted-foreground"
                  }`}
                  animate={{ x: soundOn ? 28 : 4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              </motion.button>
            </div>
            {/* Music */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {musicOn ? <Music className="w-4 h-4 text-accent" /> : <Music2 className="w-4 h-4 text-muted-foreground" />}
                <span className="font-display font-semibold text-sm">
                  {t({ he: "מוזיקת רקע", ar: "موسيقى الخلفية", en: "Background Music" })}
                </span>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleMusic}
                className={`w-14 h-7 rounded-full relative transition-colors ${
                  musicOn ? "bg-accent/30" : "bg-muted/50"
                }`}
              >
                <motion.div
                  className={`w-5 h-5 rounded-full absolute top-1 shadow-md ${
                    musicOn ? "bg-accent" : "bg-muted-foreground"
                  }`}
                  animate={{ x: musicOn ? 28 : 4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div variants={itemVariants} className="card-kid mb-4">
          <h3 className="font-display font-bold text-base mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            {t({ he: "ניהול נתונים", ar: "إدارة البيانات", en: "Data Management" })}
          </h3>
          <div className="space-y-2">
            <motion.button
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportData}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-sky" />
                <span className="font-display font-semibold text-sm">
                  {t({ he: "ייצוא נתונים (גיבוי)", ar: "تصدير البيانات (نسخ احتياطي)", en: "Export Data (Backup)" })}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-destructive/5 hover:bg-destructive/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-destructive" />
                <span className="font-display font-semibold text-sm text-destructive">
                  {t({ he: "איפוס כל ההתקדמות", ar: "إعادة تعيين كل التقدم", en: "Reset All Progress" })}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-destructive/50" />
            </motion.button>
          </div>
        </motion.div>

        {/* Parent Dashboard */}
        <motion.div variants={itemVariants} className="card-kid mb-4">
          <motion.button
            whileHover={{ scale: 1.01, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/parent")}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <div className="text-start">
                <span className="font-display font-bold text-sm block">
                  {t({ he: "דשבורד הורים", ar: "لوحة الوالدين", en: "Parent Dashboard" })}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {t({ he: "מעקב התקדמות ותובנות", ar: "تتبع التقدم والرؤى", en: "Track progress & insights" })}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-primary" />
          </motion.button>
        </motion.div>

        {/* About */}
        <motion.div variants={itemVariants} className="card-kid">
          <h3 className="font-display font-bold text-base mb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-muted-foreground" />
            {t({ he: "אודות", ar: "حول", en: "About" })}
          </h3>
          <div className="space-y-1 text-sm text-muted-foreground font-body">
            <p>English Fun v2.0</p>
            <p>{t({ he: "פלטפורמה חינוכית אינטראקטיבית ללימוד אנגלית", ar: "منصة تعليمية تفاعلية لتعلم الإنجليزية", en: "Interactive educational platform for learning English" })}</p>
            <p className="pt-1 text-xs flex items-center gap-1">
              {profile && <span>{profile.avatar}</span>}
              {profile?.name && <span className="font-display font-bold">{profile.name}</span>}
              {profile?.age && <span>• {t({ he: "גיל", ar: "العمر", en: "Age" })} {profile.age}</span>}
            </p>
            <p className="pt-2 text-xs">
              {t({ he: "נבנה עם ❤️ ע״י אמג׳ד מוברשם", ar: "صُنع بـ ❤️ بواسطة أمجد مبَرشَم", en: "Built with ❤️ by Amjad Mobarsham" })}
            </p>
          </div>
        </motion.div>

        {/* Reset Confirmation Modal */}
        <AnimatePresence>
          {showResetConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setShowResetConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="card-kid max-w-sm w-full text-center"
                onClick={e => e.stopPropagation()}
              >
                {resetDone ? (
                  <>
                    <motion.span
                      className="text-5xl block mb-3"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      ✅
                    </motion.span>
                    <p className="font-display font-bold text-lg">
                      {t({ he: "האיפוס הושלם!", ar: "تم إعادة التعيين!", en: "Reset Complete!" })}
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-5xl block mb-3">⚠️</span>
                    <h3 className="font-display font-bold text-lg mb-2">
                      {t({ he: "בטוח?", ar: "هل أنت متأكد؟", en: "Are you sure?" })}
                    </h3>
                    <p className="text-sm text-muted-foreground font-body mb-6">
                      {t({
                        he: "כל ההתקדמות, ההישגים והכוכבים יימחקו לצמיתות. לא ניתן לבטל פעולה זו.",
                        ar: "سيتم حذف كل التقدم والإنجازات والنجوم نهائياً. لا يمكن التراجع.",
                        en: "All progress, achievements, and stars will be permanently deleted. This cannot be undone.",
                      })}
                    </p>
                    <div className="flex gap-3">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowResetConfirm(false)}
                        className="flex-1 py-3 rounded-xl bg-muted font-display font-bold text-sm"
                      >
                        {t({ he: "ביטול", ar: "إلغاء", en: "Cancel" })}
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={resetAllProgress}
                        className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground font-display font-bold text-sm"
                      >
                        {t({ he: "אפס הכל", ar: "إعادة تعيين", en: "Reset All" })}
                      </motion.button>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
