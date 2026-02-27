import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { Sparkles } from "lucide-react";

const AITeacherVideo = () => {
  const { lang, dir } = useLanguage();

  const title =
    lang === "he" ? "למד עם מורה ה-AI שלך" :
    lang === "ar" ? "تعلّم مع معلمك الذكي" :
    "Learn with Your AI Teacher";

  const subtitle =
    lang === "he" ? "מורה אינטראקטיבי מופעל על ידי בינה מלאכותית" :
    lang === "ar" ? "مدرس تفاعلي مدعوم بالذكاء الاصطناعي" :
    "An interactive AI-powered English teacher, just for you";

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-2xl mx-auto mb-8 sm:mb-10"
      dir={dir}
    >
      {/* Section header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-display font-bold text-sm text-primary">AI Teacher</span>
        </div>
        <h2 className="font-display font-extrabold text-xl sm:text-2xl text-gradient leading-tight">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground font-body mt-1 max-w-xs mx-auto">
          {subtitle}
        </p>
      </div>

      {/* Video card */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "hsl(var(--card))",
          border: "2px solid hsl(var(--border))",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Decorative gradient header bar */}
        <div
          className="h-1.5 w-full"
          style={{ background: "var(--gradient-hero)" }}
        />

        {/* Responsive 16:9 iframe wrapper */}
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src="https://app.heygen.com/embeds/82664060939f4243a30fb8ff4ef07d06"
            title="HeyGen AI Teacher"
            frameBorder="0"
            allow="encrypted-media; fullscreen;"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            loading="lazy"
          />
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-center gap-1.5 px-4 py-2.5"
          style={{ borderTop: "1px solid hsl(var(--border) / 0.5)" }}
        >
          <span className="text-xs text-muted-foreground font-display">
            {lang === "he" ? "מופעל על ידי" : lang === "ar" ? "مدعوم من" : "Powered by"}
          </span>
          <span className="text-xs font-display font-bold text-primary">HeyGen AI</span>
          <span className="text-xs">🤖</span>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default AITeacherVideo;
