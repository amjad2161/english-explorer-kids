// Smart recommendation engine based on user performance
import { getProgress } from "@/lib/progress";
import { getXP } from "@/lib/xp";
import { getStatsHistory } from "@/lib/statsTracker";
import { getTotalEarnedStars, levels, getLevelProgress } from "@/lib/levels";
import { Language } from "@/lib/i18n";

export interface Recommendation {
  emoji: string;
  title: Record<string, string>;
  description: Record<string, string>;
  path: string;
  priority: number; // Higher = more important
  reason: string;
}

export const getSmartRecommendations = (lang: Language): Recommendation[] => {
  const progress = getProgress();
  const xp = getXP();
  const stats = getStatsHistory();
  const stars = getTotalEarnedStars();
  const recs: Recommendation[] = [];

  // 1. Haven't learned alphabet yet
  if (progress.completedLetters.length < 13) {
    recs.push({
      emoji: "🔤",
      title: { he: "למד אותיות!", ar: "تعلم الحروف!", en: "Learn Letters!" },
      description: {
        he: `למדת רק ${progress.completedLetters.length}/26 אותיות. בוא נמשיך!`,
        ar: `تعلمت فقط ${progress.completedLetters.length}/26 حرف. هيا نكمل!`,
        en: `Only ${progress.completedLetters.length}/26 letters learned. Let's continue!`,
      },
      path: "/alphabet",
      priority: 10,
      reason: "low_letters",
    });
  }

  // 2. Low word count
  if (progress.completedWords.length < 20) {
    recs.push({
      emoji: "📚",
      title: { he: "הרחב אוצר מילים!", ar: "وسّع مفرداتك!", en: "Expand Vocabulary!" },
      description: {
        he: "תרגול מילים חדשות ישפר את הדיוק שלך בחידונים",
        ar: "تعلم كلمات جديدة سيحسن دقتك في الاختبارات",
        en: "Learning new words will improve your quiz accuracy",
      },
      path: "/words",
      priority: 8,
      reason: "low_words",
    });
  }

  // 3. Low accuracy - need more practice
  const totalAnswers = stats.totalCorrectAnswers + stats.totalWrongAnswers;
  if (totalAnswers > 5) {
    const accuracy = stats.totalCorrectAnswers / totalAnswers;
    if (accuracy < 0.6) {
      recs.push({
        emoji: "🎯",
        title: { he: "שפר דיוק!", ar: "حسّن الدقة!", en: "Improve Accuracy!" },
        description: {
          he: "נסה חידונים נוספים כדי לחזק את מה שלמדת",
          ar: "جرب المزيد من الاختبارات لتعزيز ما تعلمته",
          en: "Try more quizzes to strengthen what you've learned",
        },
        path: "/quiz",
        priority: 9,
        reason: "low_accuracy",
      });
    }
  }

  // 4. No games played today
  const today = new Date().toISOString().slice(0, 10);
  const todayStats = stats.days.find(d => d.date === today);
  if (!todayStats || todayStats.gamesPlayed === 0) {
    recs.push({
      emoji: "🔥",
      title: { he: "שמור על הרצף!", ar: "حافظ على السلسلة!", en: "Keep Your Streak!" },
      description: {
        he: "שחק משחק היום כדי לא לאבד את הרצף שלך",
        ar: "العب لعبة اليوم حتى لا تفقد سلسلتك",
        en: "Play a game today to maintain your streak",
      },
      path: "/quiz",
      priority: 7,
      reason: "no_games_today",
    });
  }

  // 5. Haven't tried certain game types
  const gameTypeBreakdown: Record<string, number> = {};
  stats.days.forEach(d => {
    Object.entries(d.gameBreakdown).forEach(([type, count]) => {
      gameTypeBreakdown[type] = (gameTypeBreakdown[type] || 0) + count;
    });
  });

  const gameTypes = [
    { type: "spelling", emoji: "🐝", path: "/spelling",
      title: { he: "נסה מרוץ איות!", ar: "جرب سباق التهجئة!", en: "Try Spelling Bee!" } },
    { type: "scramble", emoji: "🔀", path: "/scramble",
      title: { he: "נסה מילים מבולבלות!", ar: "جرب الكلمات المخلوطة!", en: "Try Word Scramble!" } },
    { type: "hangman", emoji: "🎭", path: "/hangman",
      title: { he: "נסה ניחוש מילים!", ar: "جرب تخمين الكلمات!", en: "Try Hangman!" } },
    { type: "memory", emoji: "🧩", path: "/memory",
      title: { he: "נסה משחק זיכרון!", ar: "جرب لعبة الذاكرة!", en: "Try Memory Game!" } },
  ];

  for (const game of gameTypes) {
    if (!gameTypeBreakdown[game.type] || gameTypeBreakdown[game.type] === 0) {
      recs.push({
        emoji: game.emoji,
        title: game.title,
        description: {
          he: "מגוון משחקים עוזר ללמוד טוב יותר!",
          ar: "تنوع الألعاب يساعد على التعلم بشكل أفضل!",
          en: "Game variety helps you learn better!",
        },
        path: game.path,
        priority: 5,
        reason: `untried_${game.type}`,
      });
    }
  }

  // 6. Level progress stalled
  for (const level of levels) {
    const lp = getLevelProgress(level);
    if (lp.completed > 0 && lp.completed < lp.total) {
      recs.push({
        emoji: level.emoji,
        title: {
          he: `השלם רמה ${level.id}!`,
          ar: `أكمل المستوى ${level.id}!`,
          en: `Complete Level ${level.id}!`,
        },
        description: {
          he: `נשארו עוד ${lp.total - lp.completed} שלבים`,
          ar: `باقي ${lp.total - lp.completed} مراحل`,
          en: `${lp.total - lp.completed} stages remaining`,
        },
        path: "/levels",
        priority: 6,
        reason: "incomplete_level",
      });
      break;
    }
  }

  // Sort by priority (highest first)
  return recs.sort((a, b) => b.priority - a.priority).slice(0, 3);
};

// Motivational messages based on context
export const getMotivationalMessage = (lang: Language): { emoji: string; text: string } => {
  const xp = getXP();
  const stats = getStatsHistory();
  const progress = getProgress();

  const messages: { emoji: string; text: Record<string, string>; condition: boolean }[] = [
    {
      emoji: "🔥",
      text: { he: `רצף של ${xp.streak} ימים! אתה על גלגל!`, ar: `سلسلة ${xp.streak} أيام! أنت مذهل!`, en: `${xp.streak} day streak! You're on a roll!` },
      condition: xp.streak >= 3,
    },
    {
      emoji: "🌟",
      text: { he: "יום חדש, הזדמנויות חדשות ללמוד!", ar: "يوم جديد، فرص جديدة للتعلم!", en: "New day, new chances to learn!" },
      condition: xp.dailyXP === 0,
    },
    {
      emoji: "💪",
      text: { he: "כל מילה שאתה לומד מקרבת אותך למטרה!", ar: "كل كلمة تتعلمها تقربك من الهدف!", en: "Every word you learn gets you closer to the goal!" },
      condition: progress.completedWords.length > 0 && progress.completedWords.length < 50,
    },
    {
      emoji: "🏆",
      text: { he: "אתה מתקדם מהר! כל הכבוד!", ar: "أنت تتقدم بسرعة! أحسنت!", en: "You're progressing fast! Amazing!" },
      condition: xp.totalXP > 100,
    },
    {
      emoji: "🎓",
      text: { he: "תרגול יומי הוא המפתח להצלחה!", ar: "التمرين اليومي هو مفتاح النجاح!", en: "Daily practice is the key to success!" },
      condition: true, // fallback
    },
  ];

  const applicable = messages.filter(m => m.condition);
  const msg = applicable[0] || messages[messages.length - 1];
  return { emoji: msg.emoji, text: msg.text[lang] || msg.text.en };
};
