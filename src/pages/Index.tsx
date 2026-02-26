import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useLanguage } from "@/lib/i18n";
import { getCurrentLevel, getTotalEarnedStars, levels, getLevelProgress } from "@/lib/levels";
import { getUnlockedAchievements } from "@/lib/achievements";
import mascotImg from "@/assets/mascot.png";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 200 } },
};

const Index = () => {
  const navigate = useNavigate();
  const { t, dir, lang } = useLanguage();
  const [totalStars, setTotalStars] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [badgeCount, setBadgeCount] = useState(0);

  useEffect(() => {
    setTotalStars(getTotalEarnedStars());
    setCurrentLevel(getCurrentLevel());
    setBadgeCount(getUnlockedAchievements().length);
  }, []);

  const level = levels[currentLevel - 1];
  const levelProgress = getLevelProgress(level);
  const nextLevel = levels[currentLevel] || null;
  const funFactIndex = useMemo(() => Math.floor(Math.random() * 5) + 1, []);

  const quickAccessCards = [
    { title: t("quick.alphabet"), emoji: "🔤", path: "/alphabet", gradient: "from-blue-400 to-cyan-400" },
    { title: t("quick.words"), emoji: "📝", path: "/words", gradient: "from-emerald-400 to-green-500" },
    { title: t("quick.match"), emoji: "🧩", path: "/memory", gradient: "from-purple-400 to-violet-500" },
    { title: t("quick.quiz"), emoji: "🎯", path: "/quiz", gradient: "from-orange-400 to-red-400" },
    { title: t("quick.spelling"), emoji: "🐝", path: "/spelling", gradient: "from-yellow-400 to-amber-500" },
    { title: t("quick.scramble"), emoji: "🔀", path: "/scramble", gradient: "from-pink-400 to-rose-500" },
    { title: t("quick.hangman"), emoji: "🎭", path: "/hangman", gradient: "from-indigo-400 to-blue-500" },
  ];

  return (
    <div className="min-h-screen relative" dir={dir}>
      <div className="bg-particles" />
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-5xl mx-auto px-4 py-8 relative z-10">
        {/* Hero */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: "var(--gradient-hero)", filter: "blur(25px)", opacity: 0.2 }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.img
              src={mascotImg} alt="Owl mascot"
              className="w-28 h-28 relative z-10 drop-shadow-xl"
              animate={{ y: [0, -10, 0], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient mb-3">{t("app.subtitle")}</h1>
          <p className="text-lg text-muted-foreground font-body max-w-md mx-auto">{t("app.description")}</p>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={itemVariants} className="flex justify-center gap-3 mb-6 flex-wrap">
          <motion.div whileHover={{ scale: 1.05 }} className="card-glass flex items-center gap-2 px-5 py-3 rounded-2xl">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="font-display font-bold text-lg leading-tight">{totalStars}</p>
              <p className="text-xs text-muted-foreground">{t("home.stars")}</p>
            </div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="card-glass flex items-center gap-2 px-5 py-3 rounded-2xl">
            <span className="text-2xl">🏅</span>
            <div>
              <p className="font-display font-bold text-lg leading-tight">{badgeCount}</p>
              <p className="text-xs text-muted-foreground">{lang === "he" ? "הישגים" : lang === "ar" ? "إنجازات" : "Badges"}</p>
            </div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="card-glass flex items-center gap-2 px-5 py-3 rounded-2xl">
            <span className="text-2xl">{level.emoji}</span>
            <div>
              <p className="font-display font-bold text-lg leading-tight">{t("home.level")} {level.id}</p>
              <p className="text-xs text-muted-foreground">{t(`level.${level.id}`)}</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Current Level Card */}
        <motion.div variants={itemVariants} whileHover={{ y: -4 }} onClick={() => navigate("/levels")}
          className="card-kid cursor-pointer max-w-lg mx-auto mb-8 relative overflow-hidden group">
          <div className={`absolute inset-0 ${level.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
          <div className="relative flex items-center gap-4">
            <motion.div
              className={`w-16 h-16 rounded-2xl ${level.gradient} flex items-center justify-center text-3xl shrink-0 shadow-lg`}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              {level.emoji}
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-display font-semibold mb-0.5">{t("home.currentLevel")}</p>
              <h2 className="font-display text-lg font-bold truncate">{t("home.level")} {level.id}: {t(`level.${level.id}`)}</h2>
              <div className="progress-bar h-3 mt-2">
                <div className="progress-bar-fill" style={{ width: `${(levelProgress.completed / levelProgress.total) * 100}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {levelProgress.completed}/{levelProgress.total} {t("home.stagesCompleted")}
                {nextLevel && ` • ${Math.max(0, nextLevel.starsToUnlock - totalStars)} ${t("home.moreToNext")}`}
              </p>
            </div>
            <motion.div animate={{ x: [0, -4, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-primary text-xl">◀</motion.div>
          </div>
        </motion.div>

        {/* Quick Access */}
        <motion.div variants={itemVariants} className="mb-8">
          <h3 className="font-display text-lg font-bold mb-4 text-center">{t("home.freePlay")}</h3>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
            {quickAccessCards.map((card, i) => (
              <motion.button
                key={card.path}
                whileHover={{ y: -6, scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => navigate(card.path)}
                className="card-kid text-center py-4 relative overflow-hidden group"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05, type: "spring" }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <motion.span
                  className="text-3xl block mb-2 relative z-10"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                >
                  {card.emoji}
                </motion.span>
                <span className="font-display text-xs font-bold relative z-10">{card.title}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="text-center mb-8 flex gap-3 justify-center flex-wrap">
          <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/levels")} className="btn-kid gradient-primary text-primary-foreground text-lg px-8 py-4">
            {t("home.myJourney")}
          </motion.button>
          <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/achievements")} className="btn-kid bg-card text-foreground text-lg px-6 py-4 border border-border">
            🏅 {lang === "he" ? "הישגים" : lang === "ar" ? "إنجازات" : "Badges"}
          </motion.button>
        </motion.div>

        {/* Fun Fact */}
        <motion.div variants={itemVariants} className="card-kid text-center max-w-lg mx-auto relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sunshine/5 to-primary/5" />
          <motion.div className="text-4xl mb-3 relative z-10" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>💡</motion.div>
          <h3 className="font-display text-lg font-bold mb-2 relative z-10">{t("home.didYouKnow")}</h3>
          <p className="text-muted-foreground font-body text-sm relative z-10">{t(`home.funFact${funFactIndex}`)}</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
