import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { ArrowLeft, ArrowRight } from "lucide-react";

const BackToLevels = () => {
  const [searchParams] = useSearchParams();
  const stageId = searchParams.get("stage");
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  if (!stageId) return null;

  return (
    <motion.button
      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate("/levels")}
      className="mb-4 flex items-center gap-2 font-display font-bold text-sm text-primary hover:text-primary/80 transition-colors bg-primary/10 rounded-full px-4 py-2"
    >
      {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
      {t("nav.backToLevels")}
    </motion.button>
  );
};

export default BackToLevels;
