import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProgress } from "@/lib/progress";
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

const lessonCards = [
  {
    title: "האלפבית",
    titleEn: "Alphabet",
    description: "למד את כל 26 האותיות באנגלית!",
    path: "/alphabet",
    image: alphabetImg,
    gradient: "gradient-sky",
    emoji: "🔤",
  },
  {
    title: "מילים ראשונות",
    titleEn: "First Words",
    description: "למד מילים בסיסיות בנושאים שונים",
    path: "/words",
    image: wordsImg,
    gradient: "gradient-grass",
    emoji: "📝",
  },
  {
    title: "משחק התאמה",
    titleEn: "Memory Match",
    description: "התאם מילים באנגלית לתמונות!",
    path: "/memory",
    image: quizImg,
    gradient: "gradient-lavender",
    emoji: "🧩",
  },
  {
    title: "חידון כיף",
    titleEn: "Fun Quiz",
    description: "בדוק את מה שלמדת במשחק שאלות!",
    path: "/quiz",
    image: quizImg,
    gradient: "gradient-candy",
    emoji: "🎯",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(getProgress());

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const totalProgress =
    progress.completedLetters.length + progress.completedWords.length;

  return (
    <div className="min-h-screen" dir="rtl">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-4 py-8"
      >
        {/* Hero Section */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-10"
        >
          <motion.img
            src={mascotImg}
            alt="Owl mascot"
            className="w-32 h-32 mx-auto mb-4 drop-shadow-lg"
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

        {/* Progress Bar */}
        {totalProgress > 0 && (
          <motion.div variants={itemVariants} className="mb-8 max-w-md mx-auto">
            <div className="flex justify-between mb-2">
              <span className="font-display font-semibold text-sm">ההתקדמות שלי</span>
              <span className="font-display font-semibold text-sm text-primary">
                ⭐ {progress.totalStars} כוכבים
              </span>
            </div>
            <div className="progress-bar h-4">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min((totalProgress / 50) * 100, 100)}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* Lesson Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {lessonCards.map((card, index) => (
            <motion.div
              key={card.path}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(card.path)}
              className="card-kid cursor-pointer overflow-hidden group"
            >
              <div className={`${card.gradient} rounded-2xl p-4 mb-4 flex items-center justify-center`}>
                <motion.img
                  src={card.image}
                  alt={card.titleEn}
                  className="w-36 h-36 object-contain drop-shadow-lg"
                  whileHover={{ rotate: [0, -3, 3, 0] }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="text-center">
                <h3 className="font-display text-xl font-bold mb-1">
                  {card.emoji} {card.title}
                </h3>
                <p className="text-sm text-muted-foreground font-body">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

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
