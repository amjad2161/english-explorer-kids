import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { Heart } from "lucide-react";
import owlPixar from "@/assets/owl-pixar.png";

const AppFooter = () => {
  const { lang, dir } = useLanguage();
  const year = new Date().getFullYear();

  const t = (texts: Record<string, string>) => texts[lang] || texts.en;

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      className="relative mt-20"
      dir={dir}
    >
      {/* Chalkboard footer background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(0deg, hsl(var(--board)) 0%, hsl(var(--board)) 90%, hsl(var(--board) / 0.95) 100%)",
        }}
      />
      {/* Chalk dust texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 40%, hsl(var(--chalk)) 1px, transparent 1px),
            radial-gradient(circle at 70% 60%, hsl(var(--chalk)) 0.5px, transparent 0.5px)`,
          backgroundSize: "80px 50px, 60px 70px",
        }}
      />
      {/* Top chalk tray strip */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background: "linear-gradient(90deg, hsl(var(--grass) / 0.3), hsl(var(--primary) / 0.5), hsl(var(--grass) / 0.3))",
        }}
      />
      {/* Chalk line decoration */}
      <div className="absolute top-4 left-[10%] right-[10%] h-px opacity-10"
        style={{ background: "hsl(var(--chalk))" }}
      />
      
      <div className="max-w-5xl mx-auto px-4 py-10 relative">
        <div className="flex flex-col items-center gap-5">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <motion.img
              src={owlPixar}
              alt="English Fun Owl"
              className="w-10 h-10 object-contain rounded-full ring-2 ring-grass/20"
              animate={{ y: [0, -4, 0], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <span
              className="font-display font-extrabold text-xl"
              style={{
                color: "hsl(var(--chalk))",
                textShadow: "0 1px 3px hsl(0 0% 0% / 0.3)",
              }}
            >
              English Fun
            </span>
          </motion.div>

          {/* Tagline - chalk style */}
          <p
            className="text-sm font-body text-center max-w-md leading-relaxed"
            style={{ color: "hsl(var(--chalk) / 0.6)" }}
          >
            {t({
              he: "לומדים אנגלית בכיף! 🎓 פלטפורמה חינוכית אינטראקטיבית לילדים",
              ar: "تعلم الإنجليزية بمرح! 🎓 منصة تعليمية تفاعلية للأطفال",
              en: "Learning English is Fun! 🎓 Interactive educational platform for kids",
            })}
          </p>

          {/* Chalk-drawn divider line */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-px" style={{ background: "hsl(var(--grass) / 0.3)" }} />
            <span style={{ color: "hsl(var(--grass) / 0.5)" }}>✦</span>
            <div className="w-8 h-px" style={{ background: "hsl(var(--grass) / 0.3)" }} />
          </div>

          {/* Copyright */}
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-sm font-display font-semibold flex items-center gap-2" style={{ color: "hsl(var(--chalk) / 0.5)" }}>
              © {year} English Fun •
              <span className="inline-flex items-center gap-1.5">
                {t({ he: "נבנה עם", ar: "صُنع بـ", en: "Built with" })}
                <motion.span
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Heart className="w-4 h-4 text-candy fill-candy" />
                </motion.span>
                {t({ he: "ע״י", ar: "بواسطة", en: "by" })}
              </span>
            </p>
            <p className="text-base font-display font-bold" style={{ color: "hsl(var(--chalk) / 0.7)" }}>
              {t({ he: "אמג׳ד מוברשם", ar: "أمجد مبَرشَم", en: "Amjad Mobarsham" })}
            </p>
            <p className="text-xs font-body" style={{ color: "hsl(var(--chalk) / 0.35)" }}>
              {t({
                he: "כל הזכויות שמורות",
                ar: "جميع الحقوق محفوظة",
                en: "All rights reserved",
              })}
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default AppFooter;
