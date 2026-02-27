import { useMemo } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { getLastNDays } from "@/lib/statsTracker";

interface Props {
  days?: number;
}

const StreakCalendar = ({ days = 28 }: Props) => {
  const { lang, dir } = useLanguage();
  const t = (texts: Record<string, string>) => texts[lang] || texts.en;

  const dayNames = {
    he: ["א", "ב", "ג", "ד", "ה", "ו", "ש"],
    ar: ["أ", "إ", "ث", "أ", "خ", "ج", "س"],
    en: ["S", "M", "T", "W", "T", "F", "S"],
  };

  const calendarData = useMemo(() => {
    const data = getLastNDays(days);
    return data.map(d => ({
      date: d.date,
      active: d.gamesPlayed > 0,
      xp: d.xpEarned,
      games: d.gamesPlayed,
      intensity: Math.min(d.xpEarned / 50, 1), // 0-1 based on XP earned
    }));
  }, [days]);

  return (
    <div dir={dir}>
      <h3 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
        📅 {t({ he: "לוח פעילות", ar: "تقويم النشاط", en: "Activity Calendar" })}
      </h3>
      
      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {(dayNames[lang as keyof typeof dayNames] || dayNames.en).map((name, i) => (
          <div key={i} className="text-center text-[10px] font-display font-semibold text-muted-foreground">
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Pad start to align with correct day of week */}
        {(() => {
          const firstDate = new Date(calendarData[0]?.date || Date.now());
          const padding = firstDate.getDay();
          return Array.from({ length: padding }, (_, i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ));
        })()}
        
        {calendarData.map((day, i) => {
          const date = new Date(day.date);
          const dayNum = date.getDate();
          const isToday = day.date === new Date().toISOString().slice(0, 10);
          
          return (
            <motion.div
              key={day.date}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.01 }}
              className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-display font-bold relative cursor-default transition-colors ${
                isToday
                  ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                  : ""
              } ${
                day.active
                  ? day.intensity > 0.7
                    ? "bg-primary/80 text-primary-foreground"
                    : day.intensity > 0.3
                    ? "bg-primary/40 text-foreground"
                    : "bg-primary/15 text-foreground"
                  : "bg-muted/30 text-muted-foreground"
              }`}
              title={`${day.date}: ${day.xp} XP, ${day.games} games`}
            >
              {dayNum}
              {day.active && (
                <motion.div
                  className="absolute -top-0.5 -end-0.5 w-1.5 h-1.5 rounded-full bg-accent"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-3">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-muted/30" />
          <span className="text-[10px] text-muted-foreground font-display">
            {t({ he: "לא פעיל", ar: "غير نشط", en: "Inactive" })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-primary/15" />
          <span className="text-[10px] text-muted-foreground font-display">
            {t({ he: "מעט", ar: "قليل", en: "Light" })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-primary/40" />
          <span className="text-[10px] text-muted-foreground font-display">
            {t({ he: "בינוני", ar: "متوسط", en: "Medium" })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-primary/80" />
          <span className="text-[10px] text-muted-foreground font-display">
            {t({ he: "חזק", ar: "قوي", en: "Strong" })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StreakCalendar;
