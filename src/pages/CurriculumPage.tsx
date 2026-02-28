import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { curriculumLevels, CurriculumLevel, CurriculumModule } from "@/data/grammarData";
import { playClickSound } from "@/lib/sounds";
import GameSceneShell from "@/components/GameSceneShell";
import { ChevronDown, ChevronRight, BookOpen, Gamepad2, GraduationCap, Pencil } from "lucide-react";

const typeIcons: Record<string, React.ReactNode> = {
  vocabulary: <BookOpen size={14} />,
  grammar: <GraduationCap size={14} />,
  game: <Gamepad2 size={14} />,
  practice: <Pencil size={14} />,
};

const typeColors: Record<string, string> = {
  vocabulary: "grass",
  grammar: "sky",
  game: "candy",
  practice: "sunshine",
};

const CurriculumPage = () => {
  const { lang, dir } = useLanguage();
  const navigate = useNavigate();
  const [expandedLevel, setExpandedLevel] = useState<string>("level-1");

  const t = useCallback((obj: Record<string, string>) => obj[lang] || obj.en, [lang]);

  const toggleLevel = useCallback((id: string) => {
    playClickSound();
    setExpandedLevel(prev => prev === id ? "" : id);
  }, []);

  const goToModule = useCallback((mod: CurriculumModule) => {
    playClickSound();
    navigate(mod.path);
  }, [navigate]);

  return (
    <GameSceneShell
      title={lang === "he" ? "מסלול הלמידה" : lang === "ar" ? "مسار التعلم" : "Learning Path"}
      emoji="🗺️"
      gameType="curriculum"
    >
      <div className="max-w-3xl mx-auto px-4 py-6" dir={dir}>
        <p className="text-center text-sm mb-6" style={{ color: "hsl(var(--chalk) / 0.6)" }}>
          {lang === "he"
            ? "למד אנגלית צעד אחר צעד – מאותיות ועד משפטים מורכבים"
            : lang === "ar"
              ? "تعلم الإنجليزية خطوة بخطوة – من الحروف إلى الجمل المعقدة"
              : "Learn English step by step – from letters to complex sentences"}
        </p>

        {/* Visual path connector */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute top-0 bottom-0 hidden sm:block" style={{
            [dir === "rtl" ? "right" : "left"]: "28px",
            width: "3px",
            background: "linear-gradient(to bottom, hsl(var(--grass) / 0.3), hsl(var(--sky) / 0.3), hsl(var(--candy) / 0.3), hsl(var(--sunshine) / 0.3))",
            borderRadius: "99px",
          }} />

          <div className="space-y-4">
            {curriculumLevels.map((level, levelIdx) => {
              const isExpanded = expandedLevel === level.id;
              return (
                <motion.div
                  key={level.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: levelIdx * 0.1 }}
                  className="relative"
                >
                  {/* Level badge circle */}
                  <div className="hidden sm:flex absolute top-4 items-center justify-center w-[22px] h-[22px] rounded-full z-10"
                    style={{
                      [dir === "rtl" ? "right" : "left"]: "18px",
                      background: `hsl(var(--${level.color}) / 0.3)`,
                      border: `2px solid hsl(var(--${level.color}) / 0.6)`,
                    }}
                  >
                    <span className="text-xs font-bold" style={{ color: `hsl(var(--${level.color}))` }}>{level.level}</span>
                  </div>

                  {/* Level card */}
                  <div className={`${dir === "rtl" ? "sm:mr-16" : "sm:ml-16"}`}>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => toggleLevel(level.id)}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all"
                      style={{
                        background: isExpanded
                          ? `linear-gradient(135deg, hsl(var(--${level.color}) / 0.15), hsl(var(--${level.color}) / 0.05))`
                          : "hsl(var(--board) / 0.3)",
                        border: isExpanded
                          ? `2px solid hsl(var(--${level.color}) / 0.3)`
                          : "1px solid hsl(var(--chalk) / 0.08)",
                      }}
                    >
                      <span className="text-3xl">{level.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm" style={{ color: "hsl(var(--chalk))" }}>{t(level.title)}</h3>
                        <p className="text-xs mt-0.5" style={{ color: "hsl(var(--chalk) / 0.5)" }}>{t(level.description)}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "hsl(var(--board) / 0.4)", color: "hsl(var(--chalk) / 0.5)" }}>
                            {level.modules.length} {lang === "he" ? "שיעורים" : lang === "ar" ? "دروس" : "lessons"}
                          </span>
                        </div>
                      </div>
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                        <ChevronDown size={18} style={{ color: "hsl(var(--chalk) / 0.3)" }} />
                      </motion.div>
                    </motion.button>

                    {/* Modules */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 space-y-1.5 px-2"
                      >
                        {level.modules.map((mod, i) => {
                          const color = typeColors[mod.type] || "sky";
                          return (
                            <motion.button
                              key={mod.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              whileHover={{ x: 4, scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => goToModule(mod)}
                              className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                              style={{
                                background: "hsl(var(--board) / 0.2)",
                                border: "1px solid hsl(var(--chalk) / 0.06)",
                              }}
                            >
                              <span className="text-xl">{mod.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-xs" style={{ color: "hsl(var(--chalk) / 0.9)" }}>{t(mod.title)}</h4>
                                  <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full" style={{
                                    background: `hsl(var(--${color}) / 0.12)`,
                                    color: `hsl(var(--${color}))`,
                                  }}>
                                    {typeIcons[mod.type]}
                                    {mod.type === "vocabulary" ? (lang === "he" ? "אוצר מילים" : lang === "ar" ? "مفردات" : "Vocab")
                                      : mod.type === "grammar" ? (lang === "he" ? "דקדוק" : lang === "ar" ? "قواعد" : "Grammar")
                                        : mod.type === "game" ? (lang === "he" ? "משחק" : lang === "ar" ? "لعبة" : "Game")
                                          : (lang === "he" ? "תרגול" : lang === "ar" ? "تدريب" : "Practice")}
                                  </span>
                                </div>
                                <p className="text-[11px] mt-0.5" style={{ color: "hsl(var(--chalk) / 0.4)" }}>{t(mod.description)}</p>
                              </div>
                              <ChevronRight size={14} style={{ color: "hsl(var(--chalk) / 0.2)" }} />
                            </motion.button>
                          );
                        })}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </GameSceneShell>
  );
};

export default CurriculumPage;
