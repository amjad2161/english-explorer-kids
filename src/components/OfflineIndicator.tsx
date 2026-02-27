import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { Wifi, WifiOff } from "lucide-react";

const OfflineIndicator = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);
  const { lang } = useLanguage();

  useEffect(() => {
    const goOnline = () => { setOnline(true); setShowBanner(true); setTimeout(() => setShowBanner(false), 3000); };
    const goOffline = () => { setOnline(false); setShowBanner(true); };
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline); };
  }, []);

  const t = (texts: Record<string, string>) => texts[lang] || texts.en;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 py-2 px-4 text-sm font-display font-bold ${
            online
              ? "bg-accent text-accent-foreground"
              : "bg-destructive text-destructive-foreground"
          }`}
        >
          {online ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          {online
            ? t({ he: "חזרת לאינטרנט! 🎉", ar: "عدت للإنترنت! 🎉", en: "Back online! 🎉" })
            : t({ he: "אין חיבור לאינטרנט - ניתן להמשיך לשחק! 📴", ar: "لا يوجد اتصال - يمكنك الاستمرار! 📴", en: "No internet - you can keep playing! 📴" })}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
