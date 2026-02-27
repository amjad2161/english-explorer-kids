import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { Heart, BookOpen, Pencil, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Interactive3DMascot from "@/components/Interactive3DMascot";

const ChalkDoodle = ({ children, x, y, delay = 0 }: { children: React.ReactNode; x: string; y: string; delay?: number }) => (
  <motion.span
    className="absolute pointer-events-none select-none text-lg opacity-[0.08]"
    style={{ left: x, top: y, color: "hsl(var(--chalk))" }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 0.08, scale: 1, rotate: [0, 5, -5, 0] }}
    transition={{ delay, duration: 3, repeat: Infinity, repeatType: "reverse" }}
  >
    {children}
  </motion.span>
);

const AppFooter = () => {
  const { lang, dir } = useLanguage();
  const year = new Date().getFullYear();

  const t = (texts: Record<string, string>) => texts[lang] || texts.en;

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      className="relative mt-20 overflow-hidden"
      dir={dir}
    >
      {/* Chalkboard background with wooden frame */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, hsl(var(--board)) 0%, hsl(160 22% 18%) 50%, hsl(var(--board)) 100%)",
        }}
      />

      {/* Chalk dust texture dots */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.035,
          backgroundImage: `
            radial-gradient(circle at 15% 25%, hsl(var(--chalk)) 1px, transparent 1px),
            radial-gradient(circle at 45% 75%, hsl(var(--chalk)) 0.8px, transparent 0.8px),
            radial-gradient(circle at 75% 35%, hsl(var(--chalk)) 0.6px, transparent 0.6px),
            radial-gradient(circle at 85% 85%, hsl(var(--chalk)) 1px, transparent 1px),
            radial-gradient(circle at 55% 15%, hsl(var(--chalk)) 0.5px, transparent 0.5px)
          `,
          backgroundSize: "120px 80px, 90px 110px, 70px 90px, 100px 60px, 80px 100px",
        }}
      />

      {/* Top wooden chalk tray */}
      <div className="absolute top-0 left-0 right-0">
        <div
          className="h-[6px]"
          style={{
            background: "linear-gradient(180deg, hsl(30 40% 35%), hsl(30 35% 28%), hsl(30 40% 32%))",
            boxShadow: "0 2px 6px hsl(0 0% 0% / 0.3)",
          }}
        />
        <div
          className="h-[2px]"
          style={{
            background: "linear-gradient(90deg, transparent 5%, hsl(var(--grass) / 0.25) 30%, hsl(var(--primary) / 0.4) 50%, hsl(var(--grass) / 0.25) 70%, transparent 95%)",
          }}
        />
      </div>

      {/* Chalk doodles scattered around */}
      <ChalkDoodle x="8%" y="20%" delay={0}>ABC</ChalkDoodle>
      <ChalkDoodle x="88%" y="30%" delay={1}>✏️</ChalkDoodle>
      <ChalkDoodle x="12%" y="70%" delay={0.5}>⭐</ChalkDoodle>
      <ChalkDoodle x="82%" y="75%" delay={1.5}>📖</ChalkDoodle>
      <ChalkDoodle x="5%" y="45%" delay={2}>123</ChalkDoodle>
      <ChalkDoodle x="92%" y="55%" delay={0.8}>A+</ChalkDoodle>

      <div className="max-w-5xl mx-auto px-4 pt-12 pb-10 relative">
        <div className="flex flex-col items-center gap-6">
          {/* Owl + Logo */}
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative">
              <Interactive3DMascot mood="idle" size={48} enableEyeTracking={false} enableParticleEffects={false} />
              {/* Tiny chalk circle */}
              <div
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
                style={{
                  background: "hsl(var(--grass))",
                  border: "2px solid hsl(var(--board))",
                }}
              />
            </div>
            <div>
              <span
                className="font-display font-extrabold text-xl block"
                style={{
                  color: "hsl(var(--chalk))",
                  textShadow: "0 1px 4px hsl(0 0% 0% / 0.35), 0 0 12px hsl(var(--grass) / 0.1)",
                }}
              >
                English Fun
              </span>
              <span
                className="font-display text-[10px] font-semibold tracking-wider uppercase block"
                style={{ color: "hsl(var(--grass) / 0.5)" }}
              >
                {t({ he: "למידה חכמה", ar: "تعلم ذكي", en: "Smart Learning" })}
              </span>
            </div>
          </motion.div>

          {/* Tagline */}
          <p
            className="text-sm font-body text-center max-w-sm leading-relaxed"
            style={{ color: "hsl(var(--chalk) / 0.55)" }}
          >
            {t({
              he: "לומדים אנגלית בכיף! 🎓 פלטפורמה חינוכית אינטראקטיבית לילדים",
              ar: "تعلم الإنجليزية بمرح! 🎓 منصة تعليمية تفاعلية للأطفال",
              en: "Learning English is Fun! 🎓 Interactive educational platform for kids",
            })}
          </p>

          {/* Fun quick-links row */}
          <div className="flex items-center gap-4">
            {[
              { icon: <BookOpen className="w-4 h-4" />, label: t({ he: "מילים", ar: "كلمات", en: "Words" }), to: "/words" },
              { icon: <Pencil className="w-4 h-4" />, label: t({ he: "חידון", ar: "اختبار", en: "Quiz" }), to: "/quiz" },
              { icon: <Star className="w-4 h-4" />, label: t({ he: "הישגים", ar: "إنجازات", en: "Badges" }), to: "/achievements" },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{
                  scale: 1.08,
                  borderColor: "hsl(var(--grass) / 0.3)",
                  color: "hsl(var(--grass))",
                }}
                style={{
                  color: "hsl(var(--chalk) / 0.45)",
                }}
              >
                <Link
                  to={item.to}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-display text-[11px] font-semibold no-underline"
                  style={{
                    color: "inherit",
                    border: "1px solid hsl(var(--chalk) / 0.1)",
                    background: "hsl(var(--chalk) / 0.04)",
                  }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Chalk-drawn divider */}
          <div className="flex items-center gap-4 w-full max-w-xs">
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--chalk) / 0.15), transparent)" }} />
            <motion.span
              style={{ color: "hsl(var(--grass) / 0.4)" }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="text-xs"
            >
              ✦
            </motion.span>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--chalk) / 0.15), transparent)" }} />
          </div>

          {/* Copyright */}
          <div className="flex flex-col items-center gap-2">
            <p
              className="text-sm font-display font-semibold flex items-center gap-2 flex-wrap justify-center"
              style={{ color: "hsl(var(--chalk) / 0.4)" }}
            >
              © {year} English Fun •
              <span className="inline-flex items-center gap-1.5">
                {t({ he: "נבנה עם", ar: "صُنع بـ", en: "Built with" })}
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Heart className="w-3.5 h-3.5 text-candy fill-candy" />
                </motion.span>
                {t({ he: "ע״י", ar: "بواسطة", en: "by" })}
              </span>
            </p>
            <p
              className="text-base font-display font-bold"
              style={{
                color: "hsl(var(--chalk) / 0.65)",
                textShadow: "0 0 8px hsl(var(--grass) / 0.1)",
              }}
            >
              {t({ he: "אמג׳ד מוברשם", ar: "أمجد مبَرشَم", en: "Amjad Mobarsham" })}
            </p>
            <p className="text-[10px] font-body" style={{ color: "hsl(var(--chalk) / 0.25)" }}>
              {t({
                he: "כל הזכויות שמורות",
                ar: "جميع الحقوق محفوظة",
                en: "All rights reserved",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom wooden edge */}
      <div
        className="h-[4px]"
        style={{
          background: "linear-gradient(180deg, hsl(30 35% 28%), hsl(30 40% 22%))",
        }}
      />
    </motion.footer>
  );
};

export default AppFooter;
