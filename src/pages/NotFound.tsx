import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";

const NotFound = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <div className="bg-particles" />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="text-center relative z-10 px-4"
      >
        <motion.div
          className="text-8xl mb-4"
          animate={{ rotate: [0, -10, 10, -10, 0], y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          🦉
        </motion.div>
        <h1 className="text-6xl font-display font-bold text-gradient mb-4">404</h1>
        <p className="text-xl font-display text-muted-foreground mb-6">
          {lang === "he" ? "אופס! הדף לא נמצא" : lang === "ar" ? "عفواً! الصفحة غير موجودة" : "Oops! Page not found"}
        </p>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className="btn-kid gradient-primary text-primary-foreground text-lg px-8 py-4"
        >
          {lang === "he" ? "🏠 חזרה הביתה" : lang === "ar" ? "🏠 العودة للرئيسية" : "🏠 Go Home"}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default NotFound;
