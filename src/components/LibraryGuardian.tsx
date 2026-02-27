import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import foxGuardian from "@/assets/fox-guardian.png";

/**
 * LibraryGuardian — Interactive Pixar-style fox character
 * Uses AI-generated 3D character image instead of SVG.
 */

const TIPS = [
  { he: "האות 'E' היא הנפוצה ביותר באנגלית! 📊", ar: "حرف 'E' هو الأكثر استخداماً في الإنجليزية! 📊", en: "The letter 'E' is the most common in English! 📊" },
  { he: "המילה 'set' היא המילה עם הכי הרבה משמעויות — יותר מ-430! 🤯", ar: "كلمة 'set' لديها أكثر المعاني — أكثر من 430! 🤯", en: "'Set' has the most meanings — over 430! 🤯" },
  { he: "כל משפט באנגלית חייב פועל! 💡", ar: "كل جملة إنجليزية تحتاج فعل! 💡", en: "Every English sentence needs a verb! 💡" },
  { he: "המילה 'I' תמיד נכתבת באות גדולה! ✨", ar: "كلمة 'I' تُكتب دائماً بحرف كبير! ✨", en: "'I' is always capitalized! ✨" },
  { he: "יש 26 אותיות באלפבית — 5 תנועות ו-21 עיצורים 🔤", ar: "هناك 26 حرفاً — 5 حروف متحركة و21 ساكنة 🔤", en: "26 letters — 5 vowels and 21 consonants 🔤" },
  { he: "המילה הקצרה ביותר שהיא גם משפט שלם: 'Go!' 🏃", ar: "أقصر كلمة تشكل جملة كاملة: 'Go!' 🏃", en: "Shortest complete sentence: 'Go!' 🏃" },
  { he: "התנועות הן: A, E, I, O, U — זכור אותן! 🌟", ar: "حروف العلة: A, E, I, O, U — تذكرها! 🌟", en: "Vowels: A, E, I, O, U — remember them! 🌟" },
  { he: "'Q' כמעט תמיד מגיעה עם 'U' — כמו queen! 👑", ar: "'Q' دائماً تأتي مع 'U' — مثل queen! 👑", en: "'Q' almost always comes with 'U' — like queen! 👑" },
  { he: "תרגול של 10 דקות ביום עושה פלאים! 💪", ar: "تمرين 10 دقائق يومياً يصنع المعجزات! 💪", en: "10 minutes of practice daily works wonders! 💪" },
  { he: "כשאתה קורא באנגלית, נסה לדמיין את הסיפור! 📖", ar: "عندما تقرأ بالإنجليزية، تخيل القصة! 📖", en: "When reading English, try to picture the story! 📖" },
  { he: "יש יותר ממיליארד דוברי אנגלית בעולם! 🌍", ar: "أكثر من مليار شخص يتحدثون الإنجليزية! 🌍", en: "Over 1 billion people speak English! 🌍" },
  { he: "המילה 'alphabet' מגיעה מ-Alpha ו-Beta ביוונית! 🇬🇷", ar: "كلمة 'alphabet' من Alpha و Beta اليونانية! 🇬🇷", en: "'Alphabet' comes from Greek Alpha + Beta! 🇬🇷" },
];

const LibraryGuardian = () => {
  const [showBubble, setShowBubble] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [bouncing, setBouncing] = useState(false);

  const lang = (() => {
    const stored = localStorage.getItem("app-lang");
    return (stored === "he" || stored === "ar" || stored === "en") ? stored : "ar";
  })();

  const handleClick = useCallback(() => {
    if (showBubble) {
      setShowBubble(false);
      return;
    }
    setTipIndex(Math.floor(Math.random() * TIPS.length));
    setShowBubble(true);
    setBouncing(true);
    setTimeout(() => setBouncing(false), 600);
  }, [showBubble]);

  useEffect(() => {
    if (!showBubble) return;
    const t = setTimeout(() => setShowBubble(false), 6000);
    return () => clearTimeout(t);
  }, [showBubble, tipIndex]);

  const tip = TIPS[tipIndex];

  return (
    <motion.div
      className="absolute select-none"
      style={{
        bottom: "2%",
        right: "2%",
        width: 160,
        height: 200,
        zIndex: 2,
        cursor: "pointer",
        pointerEvents: "auto",
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.8, delay: 1.5, ease: "easeOut" }}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Speech Bubble */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            className="absolute font-body text-xs sm:text-sm leading-relaxed"
            style={{
              bottom: "100%",
              right: 0,
              width: 200,
              marginBottom: 10,
              zIndex: 10,
            }}
            initial={{ opacity: 0, scale: 0.5, y: 20, originX: 0.8, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div
              className="rounded-2xl p-3 relative border"
              style={{
                background: "hsl(var(--library-bg) / 0.92)",
                borderColor: "hsl(var(--library-gold) / 0.3)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 8px 32px hsl(20 30% 5% / 0.5), 0 0 16px hsl(var(--library-glow) / 0.15)",
                color: "hsl(var(--library-text-bright))",
                direction: lang === "en" ? "ltr" : "rtl",
                textAlign: lang === "en" ? "left" : "right",
              }}
            >
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <motion.div
                  className="w-1/3 h-full skew-x-12"
                  style={{ background: "linear-gradient(90deg, transparent, hsl(var(--library-gold) / 0.06), transparent)" }}
                  animate={{ x: ["-100%", "400%"] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }}
                />
              </div>
              <motion.p
                className="relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                {tip[lang]}
              </motion.p>
              <div
                className="absolute"
                style={{
                  bottom: -7,
                  right: 20,
                  width: 14,
                  height: 14,
                  background: "hsl(var(--library-bg) / 0.92)",
                  borderRight: "1px solid hsl(var(--library-gold) / 0.3)",
                  borderBottom: "1px solid hsl(var(--library-gold) / 0.3)",
                  transform: "rotate(45deg)",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 180, height: 140, left: -10, bottom: -15,
          background: "radial-gradient(ellipse, hsl(25 70% 50% / 0.15), transparent 70%)",
          filter: "blur(20px)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Fox image */}
      <motion.img
        src={foxGuardian}
        alt="Fox Guardian"
        draggable={false}
        className="w-full h-full object-contain select-none pointer-events-none relative z-10"
        style={{
          filter: "drop-shadow(0 8px 20px hsl(20 40% 8% / 0.6))",
          WebkitMaskImage: "radial-gradient(ellipse 48% 50% at 50% 48%, black 50%, rgba(0,0,0,0.8) 65%, rgba(0,0,0,0.3) 80%, transparent 92%)",
          maskImage: "radial-gradient(ellipse 48% 50% at 50% 48%, black 50%, rgba(0,0,0,0.8) 65%, rgba(0,0,0,0.3) 80%, transparent 92%)",
        }}
        animate={bouncing ? { y: [0, -8, 0], rotate: [0, -3, 2, 0] } : { y: [0, -3, 0] }}
        transition={bouncing ? { duration: 0.5, ease: "easeOut" } : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

export default LibraryGuardian;
