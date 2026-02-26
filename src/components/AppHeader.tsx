import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Star } from "lucide-react";
import { getTotalEarnedStars } from "@/lib/levels";
import { useState, useEffect } from "react";

const navItems = [
  { path: "/", label: "🏠 בית", labelEn: "Home" },
  { path: "/levels", label: "🗺️ רמות", labelEn: "Levels" },
  { path: "/alphabet", label: "🔤 אלפבית", labelEn: "ABC" },
  { path: "/words", label: "📝 מילים", labelEn: "Words" },
  { path: "/memory", label: "🧩 התאמה", labelEn: "Match" },
  { path: "/quiz", label: "🎯 חידון", labelEn: "Quiz" },
];

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stars, setStars] = useState(0);

  useEffect(() => {
    setStars(getTotalEarnedStars());
  }, [location]);

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="sticky top-0 z-50 backdrop-blur-md bg-card/80 border-b border-border"
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-3xl">🦉</span>
          <h1 className="text-xl font-display font-bold text-gradient">
            English Fun
          </h1>
        </motion.div>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-3 py-2 rounded-xl font-display text-sm font-semibold transition-colors ${
                  isActive
                    ? "gradient-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
              </motion.button>
            );
          })}
        </nav>

        <motion.div
          className="flex items-center gap-1 bg-sunshine/20 px-3 py-1.5 rounded-full"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Star className="w-5 h-5 star-earned fill-current" />
          <span className="font-display font-bold text-sunshine-foreground">
            {stars}
          </span>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default AppHeader;
