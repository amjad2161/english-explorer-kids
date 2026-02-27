import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { Coffee, X } from "lucide-react";

const SESSION_KEY = "english-fun-session-start";
const BREAK_INTERVAL_MS = 20 * 60 * 1000; // 20 minutes

const BreakReminder = () => {
  const [show, setShow] = useState(false);
  const { lang } = useLanguage();
  const t = (texts: Record<string, string>) => texts[lang] || texts.en;

  const checkBreak = useCallback(() => {
    const start = localStorage.getItem(SESSION_KEY);
    if (!start) {
      localStorage.setItem(SESSION_KEY, Date.now().toString());
      return;
    }
    const elapsed = Date.now() - parseInt(start);
    if (elapsed >= BREAK_INTERVAL_MS) {
      setShow(true);
    }
  }, []);

  useEffect(() => {
    // Set session start if not set
    if (!localStorage.getItem(SESSION_KEY)) {
      localStorage.setItem(SESSION_KEY, Date.now().toString());
    }
    const interval = setInterval(checkBreak, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkBreak]);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(SESSION_KEY, Date.now().toString()); // Reset timer
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={dismiss}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            className="card-kid max-w-sm w-full text-center relative"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={dismiss} className="absolute top-3 end-3 w-6 h-6 rounded-full bg-muted/60 flex items-center justify-center">
              <X className="w-3 h-3" />
            </button>
            <motion.div
              className="text-6xl mb-4"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ☕
            </motion.div>
            <h3 className="font-display font-bold text-xl mb-2">
              {t({ he: "הגיע הזמן להפסקה!", ar: "حان وقت الاستراحة!", en: "Time for a Break!" })}
            </h3>
            <p className="text-sm text-muted-foreground font-body mb-4">
              {t({
                he: "שיחקת כבר 20 דקות! 🎮 קח הפסקה קצרה, שתה מים, וחזור חזק יותר! 💪",
                ar: "لقد لعبت 20 دقيقة! 🎮 خذ استراحة قصيرة، اشرب ماء، وعد أقوى! 💪",
                en: "You've been playing for 20 minutes! 🎮 Take a short break, drink water, and come back stronger! 💪",
              })}
            </p>
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={dismiss}
                className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground font-display font-bold text-sm flex items-center justify-center gap-2"
              >
                <Coffee className="w-4 h-4" />
                {t({ he: "הבנתי! 👍", ar: "فهمت! 👍", en: "Got it! 👍" })}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BreakReminder;
