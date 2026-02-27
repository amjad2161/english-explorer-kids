import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import ClassroomBackground from "@/components/ClassroomBackground";
import FloatingParticles from "@/components/FloatingParticles";

const floatingLetters = ["A", "B", "C", "?", "!", "Z", "X", "Y"];

const NotFound = () => {
  const navigate = useNavigate();
  const { lang, dir } = useLanguage();

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden" dir={dir}>
      <ClassroomBackground />
      <FloatingParticles count={10} />

      {/* Floating scattered letters */}
      {floatingLetters.map((letter, i) => (
        <motion.span
          key={i}
          className="absolute font-display font-extrabold text-primary/10 pointer-events-none select-none"
          style={{
            fontSize: `${40 + Math.random() * 60}px`,
            left: `${5 + (i / floatingLetters.length) * 90}%`,
            top: `${10 + Math.random() * 70}%`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, i % 2 === 0 ? 15 : -15, 0],
            opacity: [0.07, 0.15, 0.07],
          }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          {letter}
        </motion.span>
      ))}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="text-center relative z-10 px-4 max-w-md"
      >
        {/* Premium card container */}
        <div className="card-kid relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-candy/5 via-transparent to-sky/5 pointer-events-none" />
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
          />

          <div className="relative z-10">
            {/* Owl mascot with enhanced animation */}
            <motion.div
              className="text-8xl mb-2"
              animate={{
                rotate: [0, -10, 10, -10, 0],
                y: [0, -12, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              🦉
            </motion.div>

            {/* Sparkle dots around the owl */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-sunshine/60"
                style={{
                  left: `${50 + Math.cos((i / 6) * Math.PI * 2) * 30}%`,
                  top: `${20 + Math.sin((i / 6) * Math.PI * 2) * 15}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0],
                }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, repeatDelay: 1 }}
              />
            ))}

            {/* 404 title with aurora gradient */}
            <motion.h1
              className="text-7xl font-display font-extrabold mb-3"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--candy)), hsl(var(--sky)))",
                backgroundSize: "300% 300%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              404
            </motion.h1>

            <p className="text-lg font-display font-semibold text-muted-foreground mb-2">
              {lang === "he" ? "אופס! הדף לא נמצא" : lang === "ar" ? "عفواً! الصفحة غير موجودة" : "Oops! Page not found"}
            </p>
            <p className="text-sm font-body text-muted-foreground/70 mb-6">
              {lang === "he"
                ? "נראה שהדף הזה הלך לטייל... בוא נחזור הביתה! 🏡"
                : lang === "ar"
                ? "يبدو أن هذه الصفحة ذهبت في نزهة... لنعد للرئيسية! 🏡"
                : "Looks like this page went on an adventure... Let's go home! 🏡"}
            </p>

            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="btn-kid gradient-primary text-primary-foreground text-lg px-8 py-4 shadow-lg"
            >
              {lang === "he" ? "🏠 חזרה הביתה" : lang === "ar" ? "🏠 العودة للرئيسية" : "🏠 Go Home"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
