import { useRef, useEffect, useState, useCallback, forwardRef } from "react";
import { motion, useSpring, useScroll, useTransform, AnimatePresence } from "framer-motion";
import ErrorBoundary from "@/components/ErrorBoundary";
import professorOwl from "@/assets/professor-owl.png";
import type { CharacterMood } from "@/lib/characterStore";
import { useCharacterStore } from "@/lib/characterStore";
import { playOwlSpeechSound } from "@/lib/sounds";
import OwlBodyAnimations from "./OwlBodyAnimations";
import type { Language } from "@/lib/i18n";

const getLang = (): Language => (localStorage.getItem("app-lang") as Language) || "en";


interface CharacterCanvasProps {
  mood: CharacterMood;
  animationKey: number;
  width: number;
  height: number;
  debugOrbit?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Show speech bubble; if true reads from store, or pass a string */
  speechBubble?: string | boolean;
}

// Feather particles that float off during celebrations
const Feather = forwardRef<HTMLDivElement, { index: number; mood: CharacterMood }>(({ index, mood }, ref) => {
  const side = index % 2 === 0 ? -1 : 1;
  const delay = index * 0.12;
  const isCelebrate = mood === "celebrate";

  return (
    <motion.div
      ref={ref}
      className="absolute pointer-events-none"
      style={{
        width: 6 + Math.random() * 4,
        height: 12 + Math.random() * 8,
        borderRadius: "50% 50% 50% 0",
        background: `hsl(${30 + index * 8}, ${50 + index * 5}%, ${45 + index * 4}%)`,
        bottom: "30%",
        left: "50%",
        transformOrigin: "center bottom",
      }}
      initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0 }}
      animate={
        isCelebrate
          ? {
              opacity: [0, 0.9, 0.7, 0],
              x: [0, side * (30 + Math.random() * 50)],
              y: [0, -(40 + Math.random() * 60)],
              rotate: [0, side * (180 + Math.random() * 180)],
              scale: [0, 1.2, 0.8, 0.3],
            }
          : {
              opacity: [0, 0.4, 0],
              x: [0, side * (8 + Math.random() * 12)],
              y: [0, -(10 + Math.random() * 15)],
              rotate: [0, side * 30],
              scale: [0, 0.7, 0],
            }
      }
      transition={{
        duration: isCelebrate ? 1.2 : 2.5,
        delay: isCelebrate ? delay : delay + Math.random() * 3,
        repeat: isCelebrate ? 2 : Infinity,
        repeatDelay: isCelebrate ? 0.3 : 2 + Math.random() * 4,
        ease: "easeOut",
      }}
    />
  );
});
Feather.displayName = "Feather";

// Sparkle effect for celebrations
const CharacterSparkle = forwardRef<HTMLSpanElement, { index: number }>(({ index }, ref) => {
  const emojis = ["✨", "⭐", "🌟", "💫"];
  return (
    <motion.span
      ref={ref}
      className="absolute pointer-events-none text-sm"
      style={{ left: "50%", top: "30%" }}
      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0.5],
        x: [(index - 1.5) * 20, (index - 1.5) * 55],
        y: [0, -(30 + index * 20)],
      }}
      transition={{ duration: 0.8, delay: 0.2 + index * 0.15, repeat: 3, repeatDelay: 0.5 }}
    >
      {emojis[index % emojis.length]}
    </motion.span>
  );
});
CharacterSparkle.displayName = "CharacterSparkle";

// Encouragement lines by mood
const encouragementsI18n: Record<string, Record<Language, string[]>> = {
  idle: {
    he: ["🌟 !בוא נלמד", "📚 מוכנים?", "!יאללה 🚀"],
    ar: ["🌟 !هيا نتعلم", "📚 مستعدين؟", "!يلا 🚀"],
    en: ["🌟 Let's learn!", "📚 Ready?", "Let's go! 🚀"],
  },
  celebrate: {
    he: ["!כל הכבוד 🎉", "!מדהים ⭐", "!אלוף 🏆"],
    ar: ["!أحسنت 🎉", "!رائع ⭐", "!بطل 🏆"],
    en: ["Great job! 🎉", "Amazing! ⭐", "Champion! 🏆"],
  },
  sad: {
    he: ["!לא נורא, ננסה שוב 💪", "!אתה יכול 🙌"],
    ar: ["!لا بأس، نحاول مرة أخرى 💪", "!تقدر 🙌"],
    en: ["No worries, try again! 💪", "You can do it! 🙌"],
  },
  wave: {
    he: ["!שלום 👋", "!היי 😊"],
    ar: ["!مرحبا 👋", "!أهلاً 😊"],
    en: ["Hello! 👋", "Hi there! 😊"],
  },
  think: {
    he: ["...חושב 🤔", "...רגע"],
    ar: ["...أفكر 🤔", "...لحظة"],
    en: ["Thinking... 🤔", "Hmm... 🧐"],
  },
  talk: {
    he: ["!שימו לב 👂", "!הקשיבו"],
    ar: ["!انتبهوا 👂", "!اسمعوا"],
    en: ["Pay attention! 👂", "Listen! 🔊"],
  },
  point: {
    he: ["!תסתכלו פה 👉", "!פה"],
    ar: ["!انظروا هنا 👉", "!هنا"],
    en: ["Look here! 👆", "Right here! 👉"],
  },
  surprised: {
    he: ["!וואו 😮", "!מדהים"],
    ar: ["!واو 😮", "!مذهل"],
    en: ["Wow! 😮", "Amazing! 🤩"],
  },
};

const getEncouragements = (mood: string): string[] => {
  const lang = getLang();
  const lines = encouragementsI18n[mood]?.[lang] || encouragementsI18n[mood]?.en || encouragementsI18n.idle[lang];
  return lines;
};

const clickTipsI18n: Record<Language, string[]> = {
  he: [
    "💡 ידעת? האות E היא הנפוצה ביותר באנגלית!",
    "🎯 טיפ: תרגול יומי של 5 דקות עדיף על שעה פעם בשבוע!",
    "🌟 !אתה מדהים, תמשיך ככה",
    "🦉 !אני פרופסור ינשוף ואני כאן לעזור לך",
    "💪 כל טעות היא הזדמנות ללמוד משהו חדש!",
    "🧠 !המוח שלך כמו שריר — ככל שמתרגלים, הוא נהיה חזק יותר",
    "🏆 !כל כוכב שאתה אוסף מראה כמה למדת",
  ],
  ar: [
    "💡 هل تعلم؟ الحرف E هو الأكثر شيوعاً في الإنجليزية!",
    "🎯 نصيحة: تمرين 5 دقائق يومياً أفضل من ساعة في الأسبوع!",
    "🌟 !أنت رائع، واصل هكذا",
    "🦉 !أنا البروفيسور بومة وأنا هنا لمساعدتك",
    "💪 كل خطأ فرصة لتعلم شيء جديد!",
    "🧠 !عقلك مثل العضلة — كلما تمرنت أصبح أقوى",
    "🏆 !كل نجمة تجمعها تظهر كم تعلمت",
  ],
  en: [
    "💡 Did you know? The letter E is the most common in English!",
    "🎯 Tip: 5 minutes daily beats 1 hour weekly!",
    "🌟 You're amazing, keep going!",
    "📖 Did you know? 'Set' has the most definitions in English!",
    "🦉 I'm Professor Owl and I'm here to help!",
    "💪 Every mistake is a chance to learn something new!",
    "🧠 Your brain is like a muscle — practice makes it stronger!",
    "🎵 Try singing the ABC song — it helps!",
    "🐝 Spelling Bee tip: Break big words into small parts!",
    "🌈 English has 26 letters — you can learn them all!",
    "🏆 Every star you collect shows how much you've learned!",
  ],
};

const getClickTips = (): string[] => clickTipsI18n[getLang()] || clickTipsI18n.en;

const CharacterCanvas = ({
  mood,
  animationKey,
  width,
  height,
  className,
  style,
  speechBubble,
}: CharacterCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [featherKey, setFeatherKey] = useState(0);
  const storeSpeech = useCharacterStore((s) => s.speechBubble);
  const [autoText, setAutoText] = useState<string | null>(null);
  const lastTipIndex = useRef(-1);

  // Click handler — show random tip
  const handleOwlClick = useCallback(() => {
    const tips = getClickTips();
    let idx: number;
    do {
      idx = Math.floor(Math.random() * tips.length);
    } while (idx === lastTipIndex.current && tips.length > 1);
    lastTipIndex.current = idx;
    setAutoText(tips[idx]);
    const timer = setTimeout(() => setAutoText(null), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Parallax on scroll — subtle vertical shift
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 600], [0, -18]);
  const parallaxRotate = useTransform(scrollY, [0, 600], [0, -3]);
  const smoothParallaxY = useSpring(parallaxY, { stiffness: 80, damping: 20 });
  const smoothParallaxRotate = useSpring(parallaxRotate, { stiffness: 80, damping: 20 });

  // Reset feathers on mood change & show auto encouragement
  useEffect(() => {
    setFeatherKey((k) => k + 1);
    // Auto-show encouragement on mood change (if no explicit bubble)
    if (!speechBubble && !storeSpeech && mood !== "idle") {
      const lines = getEncouragements(mood);
      const line = lines[Math.floor(Math.random() * lines.length)];
      setAutoText(line);
      const timer = setTimeout(() => setAutoText(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [mood, animationKey]);

  // Mood-based animation variants
  const getMoodAnimation = (): import("framer-motion").TargetAndTransition => {
    const ease = "easeInOut" as const;
    const easeOut = "easeOut" as const;
    switch (mood) {
      case "celebrate":
        return {
          y: [0, -12, 0, -8, 0],
          rotate: [0, -5, 5, -3, 0],
          scale: [1, 1.08, 0.96, 1.04, 1],
          transition: { duration: 0.8, repeat: Infinity, repeatDelay: 0.2, ease },
        };
      case "wave":
        return {
          rotate: [0, -8, 8, -5, 0],
          y: [0, -3, 0],
          transition: { duration: 1.2, repeat: Infinity, ease },
        };
      case "sad":
        return {
          y: [0, 3, 0],
          rotate: [0, -2, 0],
          scale: [1, 0.97, 1],
          transition: { duration: 2, repeat: Infinity, ease },
        };
      case "think":
        return {
          rotate: [0, 5, 3, 5, 0],
          y: [0, -2, 0],
          transition: { duration: 2.5, repeat: Infinity, ease },
        };
      case "point":
        return {
          x: [0, -5, -5, 0],
          rotate: [0, -3, -3, 0],
          transition: { duration: 1.5, repeat: Infinity, ease },
        };
      case "surprised":
        return {
          scale: [1, 1.1, 1.05, 1.1, 1],
          y: [0, -8, 0],
          transition: { duration: 0.6, repeat: 2, ease: easeOut },
        };
      case "talk":
        return {
          y: [0, -2, 0, -1, 0],
          rotate: [0, -1, 1, -1, 0],
          transition: { duration: 0.6, repeat: Infinity, ease },
        };
      default: // idle
        return {
          y: [0, -4, 0],
          rotate: [0, -0.5, 0.5, 0],
          transition: { duration: 3, repeat: Infinity, ease },
        };
    }
  };

  // Shadow animation based on mood
  const getShadowAnimation = () => {
    if (mood === "celebrate") {
      return {
        scaleX: [1, 1.2, 0.8, 1.1, 1],
        opacity: [0.3, 0.15, 0.35, 0.2, 0.3],
        transition: { duration: 0.8, repeat: Infinity, repeatDelay: 0.2 },
      };
    }
    return {
      scaleX: [1, 1.05, 1],
      opacity: [0.25, 0.2, 0.25],
      transition: { duration: 3, repeat: Infinity },
    };
  };

  // Resolve bubble text: explicit prop > store > auto
  const bubbleText = typeof speechBubble === "string"
    ? speechBubble
    : speechBubble === true
      ? storeSpeech
      : storeSpeech || autoText;

  // Play owl speech sound when bubble appears
  const prevBubbleRef = useRef<string | null>(null);
  useEffect(() => {
    if (bubbleText && bubbleText !== prevBubbleRef.current) {
      const moodMap: Record<string, "correct" | "wrong" | "celebrate" | "idle" | "think" | "surprised" | "wave"> = {
        celebrate: "celebrate",
        sad: "wrong",
        surprised: "surprised",
        wave: "wave",
        talk: "correct",
        think: "think",
        point: "correct",
      };
      playOwlSpeechSound(moodMap[mood] || "idle");
    }
    prevBubbleRef.current = bubbleText;
  }, [bubbleText, mood]);

  return (
    <ErrorBoundary>
      <div
        ref={containerRef}
        style={{ width, height, ...style, cursor: "pointer" }}
        className={`relative ${className || ""}`}
        onClick={handleOwlClick}
        role="button"
        tabIndex={0}
        aria-label="Click the owl for a tip"
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleOwlClick(); }}
      >

        {/* Main owl image with mood + parallax animation */}
        <motion.div
          className="absolute inset-0"
          style={{ y: smoothParallaxY, rotate: smoothParallaxRotate }}
        >
          <motion.img
            src={professorOwl}
            alt=""
            draggable={false}
            className="w-full h-full object-contain select-none"
            style={{
              filter: mood === "sad" 
                ? "saturate(0.7) brightness(0.9)" 
                : mood === "celebrate" 
                  ? "saturate(1.2) brightness(1.05)" 
                  : "saturate(1) brightness(1)",
            }}
            animate={getMoodAnimation()}
          />
        </motion.div>

        {/* Body animations overlay (wings, head, feathers, blink, breathing) */}
        <OwlBodyAnimations mood={mood} width={width} />

        {/* Ground shadow */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{
            width: width * 0.6,
            height: width * 0.08,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(0,0,0,0.25) 0%, transparent 70%)",
          }}
          animate={getShadowAnimation()}
        />

        {/* Feather particles */}
        <AnimatePresence>
          <div key={featherKey}>
            {Array.from({ length: mood === "celebrate" ? 10 : 5 }).map((_, i) => (
              <Feather key={`f-${i}`} index={i} mood={mood} />
            ))}
          </div>
        </AnimatePresence>

        {/* Celebration sparkles */}
        {mood === "celebrate" && (
          <div key={`sparkle-${animationKey}`}>
            {Array.from({ length: 4 }).map((_, i) => (
              <CharacterSparkle key={`s-${i}`} index={i} />
            ))}
          </div>
        )}

        {/* Breathing glow effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            background: "radial-gradient(circle at 50% 40%, hsl(var(--primary) / 0.08), transparent 60%)",
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [0.95, 1.02, 0.95],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" as const }}
        />

        {/* Speech Bubble */}
        <AnimatePresence>
          {bubbleText && width >= 48 && (
            <motion.div
              key={bubbleText}
              className="absolute z-20 pointer-events-none"
              style={{
                bottom: "85%",
                left: "50%",
                transform: "translateX(-50%)",
                minWidth: Math.max(width * 1.2, 80),
                maxWidth: Math.max(width * 2.5, 160),
              }}
              initial={{ opacity: 0, y: 8, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div
                className="relative rounded-xl px-3 py-1.5 text-center shadow-lg"
                style={{
                  background: "hsl(var(--card))",
                  border: "2px solid hsl(var(--primary) / 0.3)",
                  fontSize: Math.max(Math.min(width * 0.14, 14), 10),
                  lineHeight: 1.4,
                  color: "hsl(var(--card-foreground))",
                }}
              >
                {bubbleText}
                {/* Triangle pointer */}
                <div
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    bottom: -7,
                    width: 0,
                    height: 0,
                    borderLeft: "7px solid transparent",
                    borderRight: "7px solid transparent",
                    borderTop: "7px solid hsl(var(--primary) / 0.3)",
                  }}
                />
                <div
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    bottom: -5,
                    width: 0,
                    height: 0,
                    borderLeft: "6px solid transparent",
                    borderRight: "6px solid transparent",
                    borderTop: "6px solid hsl(var(--card))",
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};

export default CharacterCanvas;
