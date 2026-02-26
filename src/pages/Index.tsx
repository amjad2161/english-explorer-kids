import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProgress } from "@/lib/progress";
import { getCurrentLevel, getTotalEarnedStars, levels, getLevelProgress } from "@/lib/levels";
import mascotImg from "@/assets/mascot.png";
import alphabetImg from "@/assets/alphabet-hero.png";
import wordsImg from "@/assets/words-hero.png";
import quizImg from "@/assets/quiz-hero.png";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 200 } },
};

const quickAccessCards = [
  { title: "אלפבית", emoji: "🔤", path: "/alphabet", gradient: "gradient-sky" },
  { title: "מילים", emoji: "📝", path: "/words", gradient: "gradient-grass" },
  { title: "התאמה", emoji: "🧩", path: "/memory", gradient: "gradient-lavender" },
  { title: "חידון", emoji: "🎯", path: "/quiz", gradient: "gradient-candy" },
];

const Index = () => {
  const navigate = useNavigate();
  const [totalStars, setTotalStars] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);

  useEffect(() => {
    setTotalStars(getTotalEarnedStars());
    setCurrentLevel(getCurrentLevel());
  }, []);

  const level = levels[currentLevel - 1];
  const levelProgress = getLevelProgress(level);
  const nextLevel = levels[currentLevel] || null;

  return (
    <div className="min-h-screen" dir="rtl">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-4 py-8"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.img
            src={mascotImg}
            alt="Owl mascot"
            className="w-28 h-28 mx-auto mb-4 drop-shadow-lg"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient mb-3">
            !בואו נלמד אנגלית
          </h1>
          <p className="text-lg text-muted-foreground font-body max-w-md mx-auto">
            למידה כיפית ואינטראקטיבית של יסודות השפה האנגלית 🌟
          </p>
        </motion.div>

        {/* Current Level Card */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4 }}
          onClick={() => navigate("/levels")}
          className="card-kid cursor-pointer max-w-lg mx-auto mb-8 relative overflow-hidden"
        >
          <div className={`absolute inset-0 ${level.gradient} opacity-10`} />
          <div className="relative flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl ${level.gradient} flex items-center justify-center text-3xl shrink-0`}>
              {level.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-display font-semibold mb-0.5">
                הרמה הנוכחית
              </p>
              <h2 className="font-display text-lg font-bold truncate">
                רמה {level.id}: {level.name}
              </h2>
              <div className="progress-bar h-2.5 mt-2">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${(levelProgress.completed / levelProgress.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {levelProgress.completed}/{levelProgress.total} שלבים • ⭐ {totalStars} כוכבים
                {nextLevel && ` • עוד ${Math.max(0, nextLevel.starsToUnlock - totalStars)} לרמה הבאה`}
              </p>
            </div>
            <motion.div
              animate={{ x: [0, -4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-primary text-xl"
            >
              ◀
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Access */}
        <motion.div variants={itemVariants} className="mb-8">
          <h3 className="font-display text-lg font-bold mb-3 text-center">תרגול חופשי</h3>
          <div className="grid grid-cols-4 gap-3">
            {quickAccessCards.map((card) => (
              <motion.button
                key={card.path}
                whileHover={{ y: -5, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(card.path)}
                className="card-kid text-center py-4"
              >
                <span className="text-3xl block mb-2">{card.emoji}</span>
                <span className="font-display text-sm font-bold">{card.title}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Levels Journey Button */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/levels")}
            className="btn-kid gradient-primary text-primary-foreground text-lg px-8 py-4"
          >
            🗺️ מסע הלמידה שלי
          </motion.button>
        </motion.div>

        {/* Fun Facts */}
        <motion.div
          variants={itemVariants}
          className="card-kid text-center max-w-lg mx-auto"
        >
          <motion.div
            className="text-4xl mb-3"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            💡
          </motion.div>
          <h3 className="font-display text-lg font-bold mb-2">?הידעת</h3>
          <p className="text-muted-foreground font-body text-sm">
            השפה האנגלית היא השפה הנפוצה ביותר בעולם! יותר ממיליארד אנשים מדברים אנגלית ברחבי העולם 🌍
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
