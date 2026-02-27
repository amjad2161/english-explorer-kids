import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { Heart } from "lucide-react";

const AppFooter = () => {
  const { lang, dir } = useLanguage();
  const year = new Date().getFullYear();

  const t = (texts: Record<string, string>) => texts[lang] || texts.en;

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      className="relative mt-16 border-t border-border/30"
      dir={dir}
    >
      {/* Gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <motion.span
              className="text-2xl"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              🦉
            </motion.span>
            <span className="font-display font-bold text-lg text-gradient">
              English Fun
            </span>
          </motion.div>

          {/* Tagline */}
          <p className="text-sm text-muted-foreground font-body text-center max-w-md">
            {t({
              he: "לומדים אנגלית בכיף! 🎓 פלטפורמה חינוכית אינטראקטיבית לילדים",
              ar: "تعلم الإنجليزية بمرح! 🎓 منصة تعليمية تفاعلية للأطفال",
              en: "Learning English is Fun! 🎓 Interactive educational platform for kids",
            })}
          </p>

          {/* Divider */}
          <div className="w-24 h-0.5 rounded-full bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

          {/* Copyright */}
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm text-muted-foreground font-display font-semibold flex items-center gap-1.5">
              © {year} English Fun •
              <span className="inline-flex items-center gap-1">
                {t({ he: "נבנה עם", ar: "صُنع بـ", en: "Built with" })}
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Heart className="w-3.5 h-3.5 text-candy fill-candy" />
                </motion.span>
              </span>
            </p>
            <p className="text-xs text-muted-foreground/70 font-body">
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
