import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("pwa-install-dismissed") === "true");
  const { lang } = useLanguage();

  useEffect(() => {
    if (dismissed) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 5000); // Show after 5s
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  const t = (texts: Record<string, string>) => texts[lang] || texts.en;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring" as const, stiffness: 200, damping: 25 }}
          className="fixed bottom-4 left-4 right-4 z-[90] max-w-md mx-auto"
        >
          <div className="card-kid relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-sunshine/5 pointer-events-none" />
            <button
              onClick={handleDismiss}
              className="absolute top-3 end-3 w-6 h-6 rounded-full bg-muted/60 flex items-center justify-center z-10"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="relative z-10 flex items-center gap-4">
              <motion.div
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-sunshine flex items-center justify-center text-3xl shadow-lg shrink-0"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🦉
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-sm mb-0.5">
                  {t({ he: "התקן את English Fun!", ar: "ثبّت English Fun!", en: "Install English Fun!" })}
                </h3>
                <p className="text-xs text-muted-foreground font-body mb-2">
                  {t({ he: "שחק גם בלי אינטרנט! 🚀", ar: "العب حتى بدون إنترنت! 🚀", en: "Play even offline! 🚀" })}
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleInstall}
                  className="flex items-center gap-1.5 gradient-primary text-primary-foreground rounded-xl px-4 py-1.5 font-display font-bold text-xs shadow-md"
                >
                  <Download className="w-3 h-3" />
                  {t({ he: "התקן עכשיו", ar: "ثبّت الآن", en: "Install Now" })}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
