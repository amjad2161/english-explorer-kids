/**
 * ParentalGate — simple math challenge gate for parental controls.
 * COPPA/GDPR-K compliant: no dark patterns, clearly labeled.
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface ParentalGateProps {
  isOpen: boolean;
  onPass: () => void;
  onCancel: () => void;
}

const generateChallenge = () => {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 2;
  return { a, b, answer: a + b };
};

const ParentalGate = ({ isOpen, onPass, onCancel }: ParentalGateProps) => {
  const { t, dir } = useLanguage();
  const [challenge, setChallenge] = useState(generateChallenge);
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);

  const handleCheck = useCallback(() => {
    if (parseInt(input, 10) === challenge.answer) {
      onPass();
      setInput("");
      setChallenge(generateChallenge());
    } else {
      setShake(true);
      setInput("");
      setTimeout(() => setShake(false), 600);
      setChallenge(generateChallenge());
    }
  }, [input, challenge.answer, onPass]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
          dir={dir}
        >
          <motion.div
            initial={{ scale: 0.85, y: 20 }}
            animate={shake ? { x: [-8, 8, -8, 8, 0] } : { scale: 1, y: 0 }}
            transition={shake ? { duration: 0.4 } : { type: "spring", stiffness: 260, damping: 20 }}
            className="bg-card rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-border"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {t("parental.title") || "Parental Check"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("parental.subtitle") || "Grown-ups only — solve to continue"}
                </p>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="ms-auto p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                aria-label="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Math challenge */}
            <div className="text-center my-6">
              <p className="text-sm text-muted-foreground mb-3">
                {t("parental.solve") || "What is:"}
              </p>
              <p className="text-4xl font-extrabold text-foreground">
                {challenge.a} + {challenge.b} = ?
              </p>
            </div>

            {/* Input */}
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background text-foreground text-center text-2xl font-bold focus:outline-none focus:border-primary"
              placeholder="?"
              autoFocus
            />

            {/* Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors"
              >
                {t("parental.cancel") || "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleCheck}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
              >
                {t("parental.check") || "Check ✓"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ParentalGate;
