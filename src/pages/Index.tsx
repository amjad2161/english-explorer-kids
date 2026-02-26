import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { getCurrentLevel, getTotalEarnedStars, levels, getLevelProgress } from "@/lib/levels";
import mascotImg from "@/assets/mascot.png";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 200 } },
};

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [totalStars, setTotalStars] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);

  useEffect(() => {
    setTotalStars(getTotalEarnedStars());
    setCurrentLevel(getCurrentLevel());
  }, []);

  const level = levels[currentLevel - 1];
  const levelProgress = getLevelProgress(level);
  const nextLevel = levels[currentLevel] || null;

  const quickAccessCards = [
    { title: t("quick.alphabet"), emoji: "🔤", path: "/alphabet" },
    { title: t("quick.words"), emoji: "📝", path: "/words" },
    { title: t("quick.match"), emoji: "🧩", path: "/memory" },
    { title: t("quick.quiz"), emoji: "🎯", path: "/quiz" },
  ];

  return (
    <div className="min-h-screen" dir="rtl">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.img
            src={mascotImg} alt="Owl mascot"
            className="w-28 h-28 mx-auto mb-4 drop-shadow-lg"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient mb-3">{t("app.subtitle")}</h1>
          <p className="text-lg text-muted-foreground font-body max-w-md mx-auto">{t("app.description")}</p>
        </motion.div>

        {/* Current Level */}
        <motion.div variants={itemVariants} whileHover={{ y: -4 }} onClick={() => navigate("/levels")}
          className="card-kid cursor-pointer max-w-lg mx-auto mb-8 relative overflow-hidden">
          <div className={`absolute inset-0 ${level.gradient} opacity-10`} />
          <div className="relative flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl ${level.gradient} flex items-center justify-center text-3xl shrink-0`}>{level.emoji}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-display font-semibold mb-0.5">{t("home.currentLevel")}</p>
              <h2 className="font-display text-lg font-bold truncate">{t("home.level")} {level.id}: {t(`level.${level.id}`)}</h2>
              <div className="progress-bar h-2.5 mt-2">
                <div className="progress-bar-fill" style={{ width: `${(levelProgress.completed / levelProgress.total) * 100}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {levelProgress.completed}/{levelProgress.total} {t("home.stagesCompleted")} • ⭐ {totalStars} {t("home.stars")}
                {nextLevel && ` • ${Math.max(0, nextLevel.starsToUnlock - totalStars)} ${t("home.moreToNext")}`}
              </p>
            </div>
            <motion.div animate={{ x: [0, -4, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-primary text-xl">◀</motion.div>
          </div>
        </motion.div>

        {/* Quick Access */}
        <motion.div variants={itemVariants} className="mb-8">
          <h3 className="font-display text-lg font-bold mb-3 text-center">{t("home.freePlay")}</h3>
          <div className="grid grid-cols-4 gap-3">
            {quickAccessCards.map((card) => (
              <motion.button key={card.path} whileHover={{ y: -5, scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate(card.path)} className="card-kid text-center py-4">
                <span className="text-3xl block mb-2">{card.emoji}</span>
                <span className="font-display text-sm font-bold">{card.title}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/levels")} className="btn-kid gradient-primary text-primary-foreground text-lg px-8 py-4">
            {t("home.myJourney")}
          </motion.button>
        </motion.div>

        <motion.div variants={itemVariants} className="card-kid text-center max-w-lg mx-auto">
          <motion.div className="text-4xl mb-3" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>💡</motion.div>
          <h3 className="font-display text-lg font-bold mb-2">{t("home.didYouKnow")}</h3>
          <p className="text-muted-foreground font-body text-sm">{t("home.funFact")}</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
