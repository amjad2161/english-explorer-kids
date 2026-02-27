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
      {/* Flowing wave top border */}
      <div className="absolute top-0 left-0 right-0 h-px">
        <motion.div
          className="w-full h-[2px]"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.3), hsl(var(--candy) / 0.25), hsl(var(--lavender) / 0.2), transparent)",
            backgroundSize: "200% 100%",
          }}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col items-center gap-5">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <motion.img
              src={owlPixar}
              alt="English Fun Owl"
              className="w-10 h-10 object-contain"
              style={{ }}
              animate={{ y: [0, -4, 0], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="font-display font-extrabold text-xl text-gradient">
              English Fun
            </span>
          </motion.div>

          {/* Tagline */}
          <p className="text-sm text-muted-foreground font-body text-center max-w-md leading-relaxed">
            {t({
              he: "לומדים אנגלית בכיף! 🎓 פלטפורמה חינוכית אינטראקטיבית לילדים",
              ar: "تعلم الإنجليزية بمرح! 🎓 منصة تعليمية تفاعلية للأطفال",
              en: "Learning English is Fun! 🎓 Interactive educational platform for kids",
            })}
          </p>

          {/* Organic divider */}
          <motion.div 
            className="w-32 h-1 rounded-full"
            style={{ background: "var(--gradient-hero)" }}
            animate={{ scaleX: [0.8, 1, 0.8], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          {/* Copyright */}
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-sm text-muted-foreground font-display font-semibold flex items-center gap-2">
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
            <p className="text-base font-display font-bold text-foreground/80">
              {t({ he: "אמג׳ד מוברשם", ar: "أمجد مبَرشَم", en: "Amjad Mobarsham" })}
            </p>
            <p className="text-xs text-muted-foreground/60 font-body">
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
