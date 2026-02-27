import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, Home } from "lucide-react";
import { useEraserTransition } from "@/components/ChalkEraserTransition";

const BackToLevels = () => {
  const [searchParams] = useSearchParams();
  const stageId = searchParams.get("stage");
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const { navigateWithEraser } = useEraserTransition();

  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <motion.div
      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="mb-4 flex items-center gap-2"
    >
      {/* Back button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigateWithEraser(-1)}
        className="flex items-center gap-1.5 font-display font-bold text-sm text-primary hover:text-primary/80 transition-colors bg-primary/10 rounded-full px-3 py-2"
        aria-label="Go back"
      >
        <ArrowIcon className="w-4 h-4" />
        <span className="hidden sm:inline">{isRTL ? "חזרה" : "Back"}</span>
      </motion.button>

      {/* Home button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigateWithEraser("/")}
        className="flex items-center gap-1.5 font-display font-bold text-sm text-muted-foreground hover:text-foreground transition-colors bg-muted/40 rounded-full px-3 py-2"
        aria-label="Go home"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">{isRTL ? "בית" : "Home"}</span>
      </motion.button>

      {/* Levels button if from a stage */}
      {stageId && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigateWithEraser("/levels")}
          className="flex items-center gap-1.5 font-display font-bold text-sm text-accent hover:text-accent/80 transition-colors bg-accent/10 rounded-full px-3 py-2"
        >
          🗺️ <span className="hidden sm:inline">{t("nav.backToLevels")}</span>
        </motion.button>
      )}
    </motion.div>
  );
};

export default BackToLevels;
