import { motion, AnimatePresence } from "framer-motion";
import { useLanguage, Language } from "@/lib/i18n";
import Confetti from "./Confetti";

interface Props {
  show: boolean;
  levelNumber: number;
  levelEmoji: string;
  totalStars: number;
  onClose: () => void;
}

const messages: Record<string, Record<Language, string>> = {
  title: { he: "🎉 כל הכבוד!", ar: "🎉 أحسنت!", en: "🎉 Well Done!" },
  completed: { he: "סיימת את הרמה!", ar: "أكملت المستوى!", en: "Level Complete!" },
  allStars: { he: "אספת את כל הכוכבים! ⭐", ar: "جمعت كل النجوم! ⭐", en: "You collected all the stars! ⭐" },
  champion: { he: "אתה אלוף אמיתי!", ar: "أنت بطل حقيقي!", en: "You're a real champion!" },
  continue: { he: "יאללה, קדימה! 🚀", ar: "يلا، نكمل! 🚀", en: "Let's go! 🚀" },
  level: { he: "רמה", ar: "مستوى", en: "Level" },
};

const LevelCompleteCelebration = ({ show, levelNumber, levelEmoji, totalStars, onClose }: Props) => {
  const { lang } = useLanguage();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
          onClick={onClose}
        >
          <Confetti show={show} />
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            onClick={(e) => e.stopPropagation()}
            className="card-kid max-w-sm mx-4 text-center relative overflow-hidden"
          >
            {/* Sparkle background */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-xl"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.2, 0],
                    x: [0, (Math.random() - 0.5) * 80],
                    y: [0, (Math.random() - 0.5) * 80],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.12,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </div>

            <div className="absolute inset-0 bg-gradient-to-br from-sunshine/5 to-primary/5 pointer-events-none" />

            {/* Trophy */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
              className="text-7xl mb-4 relative z-10"
            >
              🏆
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-display font-bold text-gradient mb-2 relative z-10"
            >
              {messages.title[lang]}
            </motion.h2>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="relative z-10">
              <p className="text-xl font-display mb-1">{messages.completed[lang]}</p>
              <div className="inline-flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full mb-3">
                <span className="text-2xl">{levelEmoji}</span>
                <span className="font-display font-bold text-lg">{messages.level[lang]} {levelNumber}</span>
              </div>
            </motion.div>

            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7, type: "spring" }} className="my-4 relative z-10">
              <div className="flex justify-center gap-1 mb-2">
                {[...Array(totalStars)].map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.8 + i * 0.1, type: "spring" }}
                    className="text-2xl"
                  >
                    ⭐
                  </motion.span>
                ))}
              </div>
              <p className="text-muted-foreground font-body text-sm">{messages.allStars[lang]}</p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-lg font-display font-semibold text-primary mb-4 relative z-10"
            >
              {messages.champion[lang]}
            </motion.p>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="btn-kid gradient-primary text-primary-foreground text-lg px-8 relative z-10"
            >
              {messages.continue[lang]}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelCompleteCelebration;
