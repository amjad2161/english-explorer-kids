import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { useState, useEffect, useCallback, useRef, memo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OwlMood =
  | "idle"
  | "wave"
  | "celebrate"
  | "surprised"
  | "sad"
  | "thinking"
  | "teaching"
  | "pointing"
  | "dancing"
  | "sleeping"
  | "cheering"
  | "confused"
  | "reading"
  | "encouraging";

interface AnimatedOwlProps {
  mood?: OwlMood;
  size?: "sm" | "md" | "lg" | number;
  onClick?: () => void;
  showSpeechBubble?: string;
  autoSpeak?: boolean;
  enableEyeTracking?: boolean;
  enableIdleMicroAnimations?: boolean;
  enableParticleEffects?: boolean;
  pointDirection?: "left" | "right";
  className?: string;
  reducedMotion?: boolean;
  onMoodChange?: (mood: OwlMood) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const sizeMap: Record<string, number> = { sm: 120, md: 180, lg: 260 };

const speechByMood: Record<string, string[]> = {
  idle: ["🤔", "✨", "📚", "👋"],
  celebrate: ["🎉", "⭐", "🏆", "💪"],
  surprised: ["😮", "❗", "👏", "✅"],
  sad: ["💙", "🔄", "📖", "😊"],
  wave: ["👋", "🌟", "😄", "🎈"],
  thinking: ["🤔", "💭", "🧠", "📖"],
  teaching: ["📚", "✏️", "🎓", "💡"],
  pointing: ["👉", "⬅️", "➡️", "📍"],
  dancing: ["🎵", "💃", "🕺", "🎶"],
  sleeping: ["😴", "💤", "🌙", "⭐"],
  cheering: ["🎉", "🏆", "⭐", "💪"],
  confused: ["❓", "🤷", "💭", "🌀"],
  reading: ["📖", "📚", "🔍", "✏️"],
  encouraging: ["👍", "💪", "🌟", "✨"],
};

// ─── Helper sub-components ────────────────────────────────────────────────────

const Sparkle = memo(({ delay, dim }: { delay: number; dim: number }) => {
  const angle = Math.random() * 360;
  const dist = dim * 0.35 + Math.random() * dim * 0.2;
  const x = Math.cos((angle * Math.PI) / 180) * dist;
  const y = Math.sin((angle * Math.PI) / 180) * dist;
  const emojis = ["✨", "⭐", "🌟", "💫", "🎊"];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  return (
    <motion.span
      className="absolute pointer-events-none z-30 select-none"
      style={{ left: "50%", top: "40%", fontSize: Math.max(8, dim / 14) }}
      initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 1, 0], x, y: y - 10, scale: [0, 1.2, 1, 0.5], rotate: [0, 180] }}
      transition={{ duration: 1.3, delay, ease: "easeOut" }}
    >
      {emoji}
    </motion.span>
  );
});
Sparkle.displayName = "Sparkle";

const ZzzParticle = memo(({ index, dim }: { index: number; dim: number }) => (
  <motion.span
    className="absolute pointer-events-none z-30 select-none font-bold"
    style={{ right: "8%", top: "8%", fontSize: Math.max(8, dim / 15 + index * 2), color: "#94a3b8" }}
    animate={{
      opacity: [0, 1, 0.8, 0],
      x: [0, 8 + index * 5, 14 + index * 8],
      y: [0, -12 - index * 8, -22 - index * 14],
    }}
    transition={{ duration: 2.5, delay: index * 0.9, repeat: Infinity, ease: "easeOut" }}
  >
    {"Z".repeat(index + 1)}
  </motion.span>
));
ZzzParticle.displayName = "ZzzParticle";

const TYPEWRITER_CHAR_DELAY_MS = 55;

// Typewriter effect for speech bubble text
const TypewriterText = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    const chars = [...text];
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(chars.slice(0, i).join(""));
      if (i >= chars.length) clearInterval(id);
    }, TYPEWRITER_CHAR_DELAY_MS);
    return () => clearInterval(id);
  }, [text]);
  return <>{displayed}</>;
};

// Spring easing for surprised bounce-back animation
const SURPRISED_BOUNCE_EASING: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

const OWL_DEFS_ID = "owl-mascot-defs";

// ─── Main Component ───────────────────────────────────────────────────────────

const Interactive3DMascot = memo(
  ({
    mood = "idle",
    size = "md",
    onClick,
    showSpeechBubble,
    autoSpeak = false,
    enableEyeTracking = true,
    enableIdleMicroAnimations = true,
    enableParticleEffects = true,
    pointDirection = "right",
    className = "",
    reducedMotion,
    onMoodChange,
  }: AnimatedOwlProps) => {
    const dim = typeof size === "number" ? size : (sizeMap[size] ?? 180);
    const containerRef = useRef<HTMLButtonElement>(null);
    const prevMoodRef = useRef(mood);

    const [isBlinking, setIsBlinking] = useState(false);
    const [autoSpeech, setAutoSpeech] = useState<string | null>(null);
    const [showParticles, setShowParticles] = useState(false);
    const [tapKey, setTapKey] = useState(0);

    // Spring-based smooth pupil tracking
    const rawPupilX = useMotionValue(0);
    const rawPupilY = useMotionValue(0);
    const pupilX = useSpring(rawPupilX, { stiffness: 80, damping: 20 });
    const pupilY = useSpring(rawPupilY, { stiffness: 80, damping: 20 });

    // Reduced motion detection
    const systemRM =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const noMotion = reducedMotion ?? systemRM;

    // Notify parent on mood change
    useEffect(() => {
      if (mood !== prevMoodRef.current) {
        onMoodChange?.(mood);
        prevMoodRef.current = mood;
      }
    }, [mood, onMoodChange]);

    // Blink scheduler (randomized interval, 2–5 s)
    useEffect(() => {
      if (noMotion || mood === "sleeping") return;
      let timeoutId: ReturnType<typeof setTimeout>;
      const schedule = () => {
        const delay = mood === "surprised" ? 5000 : 2000 + Math.random() * 3000;
        timeoutId = setTimeout(() => {
          setIsBlinking(true);
          setTimeout(() => {
            setIsBlinking(false);
            schedule();
          }, 150);
        }, delay);
      };
      schedule();
      return () => clearTimeout(timeoutId);
    }, [mood, noMotion]);

    // Trigger particles on energetic mood transitions
    useEffect(() => {
      if (!enableParticleEffects || noMotion) return;
      if (["celebrate", "cheering", "surprised"].includes(mood)) {
        setShowParticles(true);
        const t = setTimeout(() => setShowParticles(false), 1600);
        return () => clearTimeout(t);
      }
    }, [mood, enableParticleEffects, noMotion]);

    // Auto-speech
    useEffect(() => {
      if (!autoSpeak || showSpeechBubble) return;
      const lines = speechByMood[mood] ?? speechByMood.idle;
      const show = () => {
        setAutoSpeech(lines[Math.floor(Math.random() * lines.length)]);
        setTimeout(() => setAutoSpeech(null), 2200);
      };
      const id = setInterval(show, 9000 + Math.random() * 5000);
      return () => clearInterval(id);
    }, [mood, autoSpeak, showSpeechBubble]);

    // Global mouse listener for eye tracking
    useEffect(() => {
      if (!enableEyeTracking || noMotion || mood === "sleeping") return;
      const handleMove = (e: MouseEvent) => {
        if (!containerRef.current) return;
        const r = containerRef.current.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width * 0.55);
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height * 0.55);
        rawPupilX.set(Math.max(-1, Math.min(1, dx)) * 2.5);
        rawPupilY.set(Math.max(-1, Math.min(1, dy)) * 2);
      };
      window.addEventListener("mousemove", handleMove, { passive: true });
      return () => window.removeEventListener("mousemove", handleMove);
    }, [enableEyeTracking, noMotion, mood, rawPupilX, rawPupilY]);

    // Override pupil position for mood-driven look directions
    useEffect(() => {
      if (mood === "thinking") {
        rawPupilX.set(-1.2);
        rawPupilY.set(-1.5);
      } else if (mood === "reading") {
        rawPupilX.set(0);
        rawPupilY.set(1.8);
      } else if (mood === "sleeping") {
        rawPupilX.set(0);
        rawPupilY.set(0);
      } else if (!enableEyeTracking) {
        rawPupilX.set(0);
        rawPupilY.set(0);
      }
    }, [mood, enableEyeTracking, rawPupilX, rawPupilY]);

    const handleTap = useCallback(() => {
      setTapKey((k) => k + 1);
      const lines = speechByMood[mood] ?? speechByMood.idle;
      setAutoSpeech(lines[Math.floor(Math.random() * lines.length)]);
      setTimeout(() => setAutoSpeech(null), 1800);
      onClick?.();
    }, [mood, onClick]);

    // ─── Expression helpers ───────────────────────────────────────────────────

    const eyeScaleY =
      mood === "sleeping"
        ? 0.07
        : isBlinking
        ? 0.07
        : mood === "sad"
        ? 0.75
        : mood === "encouraging"
        ? 0.88
        : mood === "surprised"
        ? 1.08
        : 1;

    const leftBrowY =
      mood === "surprised" ? -3 :
      mood === "confused"  ? -3 :
      mood === "thinking"  ? -1.5 :
      mood === "sad"       ? 1 : 0;

    const rightBrowY =
      mood === "surprised" ? -3 :
      mood === "confused"  ? 1.5 :
      mood === "sad"       ? 1 : 0;

    const beakOpen = [
      "celebrate", "surprised", "wave", "teaching",
      "cheering", "encouraging", "confused",
    ].includes(mood);

    // ─── Animation configs ────────────────────────────────────────────────────

    type AV = number | number[];
    interface A { y?: AV; x?: AV; rotate?: AV; scale?: AV; scaleY?: AV }

    const bodyAnimMap: Record<OwlMood, A> = {
      idle:        enableIdleMicroAnimations ? { y: [0, -3, 0], scaleY: [1, 1.01, 1] } : {},
      wave:        { y: [0, -8, 0, -6, 0], rotate: [0, -4, 4, -2, 0] },
      celebrate:   { y: [0, -14, 2, -10, 0] },
      surprised:   { y: [0, -12, 0], x: [0, -2, 2, 0] },
      sad:         { y: [0, 2, 0], scaleY: [1, 0.97, 1] },
      thinking:    { rotate: [0, -2, 0] },
      teaching:    { scaleY: [1, 1.015, 1] },
      pointing:    { rotate: [0, pointDirection === "left" ? 3 : -3, 0] },
      dancing:     { x: [0, -6, 6, -4, 4, 0], rotate: [0, -5, 5, -3, 3, 0] },
      sleeping:    { scaleY: [1, 1.008, 1] },
      cheering:    { y: [0, -10, 2, -7, 0] },
      confused:    { rotate: [0, -8, 8, -5, 0] },
      reading:     { y: [0, 1, 0] },
      encouraging: { y: [0, -4, 0], scale: [1, 1.018, 1] },
    };

    const bodyDur: Record<OwlMood, number> = {
      idle: 3.5, wave: 1.8, celebrate: 1.2, surprised: 0.6, sad: 4,
      thinking: 2.5, teaching: 2.5, pointing: 2.5, dancing: 0.8,
      sleeping: 5, cheering: 0.9, confused: 1.5, reading: 3, encouraging: 2,
    };

    const bodyAnim = noMotion ? {} : bodyAnimMap[mood] ?? {};
    const bodyTrans = noMotion ? {} : {
      duration: bodyDur[mood] ?? 3.5,
      repeat: mood === "surprised" ? 0 : Infinity,
      ease: mood === "surprised" ? SURPRISED_BOUNCE_EASING : ("easeInOut" as const),
    };

    // Right wing (pivot at top-left = "0% 0%" of fill-box)
    const rWingMap: Record<OwlMood, A> = {
      idle:        { rotate: [0, -3, 0] },
      wave:        { rotate: [0, -55, -40, -60, -42] },
      celebrate:   { rotate: [0, -40, -20, -45, 0] },
      surprised:   { rotate: [0, -28, 0] },
      sad:         { rotate: [0, 10, 0] },
      thinking:    { rotate: [-18, -22, -18] },
      teaching:    { rotate: [-52, -48, -52] },
      pointing:    { rotate: [pointDirection === "right" ? -62 : -3, pointDirection === "right" ? -58 : -5, pointDirection === "right" ? -62 : -3] },
      dancing:     { rotate: [0, -25, 5, -30, 0] },
      sleeping:    { rotate: [0, 8, 0] },
      cheering:    { rotate: [0, -50, -30, -52] },
      confused:    { rotate: [0, -18, 0] },
      reading:     { rotate: [5, 0, 5] },
      encouraging: { rotate: [-32, -24, -32] },
    };

    const rWingDur: Record<OwlMood, number> = {
      idle: 3.5, wave: 0.7, celebrate: 0.8, surprised: 0.5, sad: 4,
      thinking: 2, teaching: 2, pointing: 2, dancing: 0.8,
      sleeping: 5, cheering: 0.5, confused: 1.5, reading: 3, encouraging: 1.5,
    };

    const rWingAnim = noMotion ? {} : rWingMap[mood] ?? {};
    const rWingTrans = noMotion ? {} : { duration: rWingDur[mood] ?? 3.5, repeat: Infinity, ease: "easeInOut" as const };

    // Left wing (pivot at top-right = "100% 0%" of fill-box)
    const lWingMap: Record<OwlMood, A> = {
      idle:        { rotate: [0, 3, 0] },
      wave:        { rotate: [0, 5, 0] },
      celebrate:   { rotate: [0, 40, 20, 45, 0] },
      surprised:   { rotate: [0, 28, 0] },
      sad:         { rotate: [0, -10, 0] },
      thinking:    { rotate: [0, 4, 0] },
      teaching:    { rotate: [0, 4, 0] },
      pointing:    { rotate: [pointDirection === "left" ? 62 : 3, pointDirection === "left" ? 58 : 5, pointDirection === "left" ? 62 : 3] },
      dancing:     { rotate: [0, 25, -5, 30, 0] },
      sleeping:    { rotate: [0, -8, 0] },
      cheering:    { rotate: [0, 50, 30, 52] },
      confused:    { rotate: [0, 18, 0] },
      reading:     { rotate: [-5, 0, -5] },
      encouraging: { rotate: [0, 6, 0] },
    };

    const lWingAnim = noMotion ? {} : lWingMap[mood] ?? {};
    const lWingTrans = noMotion ? {} : { duration: rWingDur[mood] ?? 3.5, repeat: Infinity, ease: "easeInOut" as const };

    // Head tilt (confused / sleeping)
    const headTiltAnim = noMotion ? {} :
      mood === "confused" ? { rotate: [0, -10, 10, -8, 0] } :
      mood === "sleeping" ? { rotate: [0, 6, 0] } : {};
    const headTiltTrans = noMotion ? {} : {
      duration: mood === "confused" ? 1.5 : 5, repeat: Infinity, ease: "easeInOut" as const,
    };

    // Cap wobble
    const capAnim = noMotion ? {} :
      mood === "celebrate" || mood === "cheering" ? { y: [0, -3, 0], rotate: [0, -5, 5, -3, 0] } :
      mood === "sleeping"                         ? { rotate: [0, 8, 0] } :
      mood === "wave"                             ? { rotate: [0, -3, 0] } :
      { rotate: [0, -1, 1, 0] };
    const capTrans = noMotion ? {} : {
      duration: mood === "celebrate" || mood === "cheering" ? 1.2 : mood === "sleeping" ? 5 : 3,
      repeat: Infinity, ease: "easeInOut" as const,
    };

    // Tassel swing
    const tasselAnim = noMotion ? {} :
      mood === "celebrate" || mood === "cheering" ? { rotate: [0, -25, 25, -18, 18, 0] } :
      mood === "dancing"                          ? { rotate: [0, -20, 20, -15, 0] } :
      mood === "sleeping"                         ? { rotate: [30] } :
      { rotate: [0, -8, 8, 0] };
    const tasselTrans = noMotion ? {} : {
      duration: mood === "celebrate" || mood === "cheering" ? 0.8 : mood === "sleeping" ? 0 : 3,
      repeat: mood === "sleeping" ? 0 : Infinity, ease: "easeInOut" as const,
    };

    // Glow colour
    const glowColor =
      mood === "celebrate" || mood === "cheering" ? "hsl(45 95% 58% / 0.25)" :
      mood === "surprised"                        ? "hsl(262 83% 58% / 0.2)" :
      mood === "sad"                              ? "hsl(215 16% 47% / 0.1)" :
      "hsl(262 83% 58% / 0.1)";

    const bubbleText = showSpeechBubble || autoSpeech;

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
      <motion.button
        ref={containerRef}
        type="button"
        onClick={handleTap}
        className={`relative inline-flex items-center justify-center p-0 border-0 bg-transparent cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full ${className}`}
        style={{ width: dim, height: dim }}
        whileTap={{ scale: [1, 0.88, 1.06, 0.98, 1], transition: { duration: 0.4 } } as object}
        aria-label="Interactive Owl Mascot"
        tabIndex={0}
      >
        {/* Ambient glow */}
        <motion.div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: dim * 0.65,
            height: dim * 0.35,
            bottom: "2%",
            left: "17.5%",
            background: `radial-gradient(ellipse, ${glowColor}, transparent 70%)`,
            filter: "blur(10px)",
            zIndex: 0,
          }}
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* ── SVG Owl ─────────────────────────────────────────────────────── */}
        <svg
          viewBox="0 0 100 118"
          style={{ width: dim, height: dim, overflow: "visible", willChange: "transform", position: "relative", zIndex: 1 }}
          role="img"
          aria-hidden="true"
        >
          <defs id={OWL_DEFS_ID}>
            <radialGradient id="owlBodyGrad" cx="50%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#C1802E" />
              <stop offset="100%" stopColor="#8B5A1A" />
            </radialGradient>
            <radialGradient id="owlChestGrad" cx="50%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FFF4DE" />
              <stop offset="100%" stopColor="#E8C98A" />
            </radialGradient>
            <radialGradient id="owlEyeGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFC040" />
              <stop offset="100%" stopColor="#E07000" />
            </radialGradient>
            <radialGradient id="owlWingGrad" cx="40%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#A07820" />
              <stop offset="100%" stopColor="#7A5810" />
            </radialGradient>
          </defs>

          {/* ── Whole-owl body group (bounce / sway) ──── */}
          <motion.g
            animate={bodyAnim}
            transition={bodyTrans}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            {/* Body */}
            <ellipse cx="50" cy="81" rx="20" ry="22" fill="url(#owlBodyGrad)" />
            {/* Chest */}
            <ellipse cx="50" cy="84" rx="12" ry="17" fill="url(#owlChestGrad)" />
            {/* Subtle feather lines on chest */}
            <path d="M43,76 Q50,74 57,76" stroke="#D4A974" strokeWidth="0.7" fill="none" strokeLinecap="round" />
            <path d="M41,82 Q50,80 59,82" stroke="#D4A974" strokeWidth="0.7" fill="none" strokeLinecap="round" />
            <path d="M42,88 Q50,86 58,88" stroke="#D4A974" strokeWidth="0.7" fill="none" strokeLinecap="round" />
            <path d="M44,94 Q50,92 56,94" stroke="#D4A974" strokeWidth="0.7" fill="none" strokeLinecap="round" />

            {/* ── LEFT WING (pivot top-right corner) ── */}
            <motion.g
              animate={lWingAnim}
              transition={lWingTrans}
              style={{ transformBox: "fill-box", transformOrigin: "100% 0%" }}
            >
              <path d="M30,64 Q17,70 15,83 Q13,98 25,104 Q33,108 35,97 Q37,86 35,72 Z" fill="url(#owlWingGrad)" />
              <path d="M22,75 Q23,86 25,95" stroke="#6B500F" strokeWidth="0.8" fill="none" strokeLinecap="round" />
              <path d="M28,70 Q29,81 29,92" stroke="#6B500F" strokeWidth="0.8" fill="none" strokeLinecap="round" />
            </motion.g>

            {/* ── RIGHT WING (pivot top-left corner) ── */}
            <motion.g
              animate={rWingAnim}
              transition={rWingTrans}
              style={{ transformBox: "fill-box", transformOrigin: "0% 0%" }}
            >
              <path d="M70,64 Q83,70 85,83 Q87,98 75,104 Q67,108 65,97 Q63,86 65,72 Z" fill="url(#owlWingGrad)" />
              <path d="M78,75 Q77,86 75,95" stroke="#6B500F" strokeWidth="0.8" fill="none" strokeLinecap="round" />
              <path d="M72,70 Q71,81 71,92" stroke="#6B500F" strokeWidth="0.8" fill="none" strokeLinecap="round" />
            </motion.g>

            {/* ── HEAD ── */}
            <circle cx="50" cy="36" r="22" fill="url(#owlBodyGrad)" />
            {/* Ear tufts */}
            <path d="M34,17 Q30,9 38,14 Z" fill="#8B6014" />
            <path d="M66,17 Q70,9 62,14 Z" fill="#8B6014" />

            {/* ── FACE GROUP (head-tilt for confused/sleeping) ── */}
            <motion.g
              animate={headTiltAnim}
              transition={headTiltTrans}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            >
              {/* Eyebrows */}
              <motion.path
                d="M31,26 Q35,22 42,25"
                stroke="#5C3D11" strokeWidth="2.5" fill="none" strokeLinecap="round"
                animate={{ y: leftBrowY }}
                transition={{ duration: 0.3 }}
              />
              <motion.path
                d="M58,25 Q65,22 69,26"
                stroke="#5C3D11" strokeWidth="2.5" fill="none" strokeLinecap="round"
                animate={{ y: rightBrowY }}
                transition={{ duration: 0.3 }}
              />

              {/* ── LEFT EYE ── */}
              <motion.g
                animate={{ scaleY: eyeScaleY }}
                transition={{ duration: 0.12, ease: "easeInOut" }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              >
                <circle cx="40" cy="34" r="9.5" fill="url(#owlEyeGrad)" />
                <circle cx="40" cy="34" r="7.5" fill="#FFF8F0" />
                <motion.circle cx="40" cy="34" r="4"   fill="#1a1a1a" style={{ x: pupilX, y: pupilY }} />
                <motion.circle cx="42.5" cy="32" r="1.5" fill="white"  style={{ x: pupilX, y: pupilY }} />
                <motion.circle cx="38.5" cy="36.5" r="0.8" fill="rgba(255,255,255,0.55)" style={{ x: pupilX, y: pupilY }} />
              </motion.g>

              {/* ── RIGHT EYE ── */}
              <motion.g
                animate={{ scaleY: eyeScaleY }}
                transition={{ duration: 0.12, ease: "easeInOut" }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              >
                <circle cx="60" cy="34" r="9.5" fill="url(#owlEyeGrad)" />
                <circle cx="60" cy="34" r="7.5" fill="#FFF8F0" />
                <motion.circle cx="60" cy="34" r="4"   fill="#1a1a1a" style={{ x: pupilX, y: pupilY }} />
                <motion.circle cx="62.5" cy="32" r="1.5" fill="white"  style={{ x: pupilX, y: pupilY }} />
                <motion.circle cx="58.5" cy="36.5" r="0.8" fill="rgba(255,255,255,0.55)" style={{ x: pupilX, y: pupilY }} />
              </motion.g>

              {/* Beak */}
              {beakOpen ? (
                <path d="M46,45 Q50,54 54,45 Q52,48 50,49 Q48,48 46,45 Z" fill="#C17A2B" />
              ) : (
                <path d="M46,45 Q50,51 54,45 Q52,46 50,47 Q48,46 46,45 Z" fill="#C17A2B" />
              )}
            </motion.g>

            {/* ── GRADUATION CAP ── */}
            <motion.g
              animate={capAnim}
              transition={capTrans}
              style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}
            >
              <polygon points="50,2 26,15 74,15" fill="#1a1a1a" />
              <rect x="24" y="14" width="52" height="5" rx="2" fill="#222" />
              <circle cx="50" cy="5" r="2" fill="#FFD700" />
              <line x1="50" y1="5" x2="74" y2="16" stroke="#FFD700" strokeWidth="0.8" />
              {/* Tassel */}
              <motion.g
                animate={tasselAnim}
                transition={tasselTrans}
                style={{ transformBox: "fill-box", transformOrigin: "0% 0%" }}
              >
                <path d="M74,16 C76,20 75,26 72,32" stroke="#FFD700" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <circle cx="71" cy="33" r="3.5" fill="#FFD700" />
                <path d="M69,34 Q68,38 67,36 M71,35 Q71,39 70,37 M73,34 Q74,38 72,37" stroke="#FFD700" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              </motion.g>
            </motion.g>

            {/* Feet */}
            <path d="M42,102 L37,113 M42,102 L40,115 M42,102 L46,113"
              stroke="#C17A2B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M58,102 L54,113 M58,102 L60,115 M58,102 L63,113"
              stroke="#C17A2B" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          </motion.g>
        </svg>

        {/* Sleeping ZZZs */}
        <AnimatePresence>
          {mood === "sleeping" && (
            <>
              {[0, 1, 2].map((i) => (
                <ZzzParticle key={i} index={i} dim={dim} />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Celebration sparkles */}
        <AnimatePresence>
          {showParticles && enableParticleEffects && (
            <>
              {Array.from({ length: 7 }).map((_, i) => (
                <Sparkle key={`spark-${tapKey}-${i}`} delay={i * 0.12} dim={dim} />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Mood indicator ring */}
        {mood !== "idle" && (
          <motion.div
            key={`ring-${mood}`}
            className="absolute inset-0 rounded-full pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.35, 1.6] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              border: `2px solid ${
                mood === "celebrate" || mood === "cheering"
                  ? "hsl(45 95% 58% / 0.5)"
                  : mood === "surprised"
                  ? "hsl(262 83% 58% / 0.5)"
                  : mood === "sad"
                  ? "hsl(215 16% 47% / 0.4)"
                  : "hsl(262 83% 58% / 0.4)"
              }`,
            }}
          />
        )}

        {/* Speech bubble */}
        <AnimatePresence>
          {bubbleText && (
            <motion.div
              key={`bubble-${bubbleText}`}
              initial={{ opacity: 0, y: 10, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 350, damping: 18 }}
              className="absolute -top-2 left-1/2 -translate-x-1/2 bg-card border border-border rounded-2xl px-3 py-1.5 shadow-lg z-30 whitespace-nowrap max-w-[200px]"
              style={{ fontSize: Math.max(12, dim / 14) }}
            >
              <span className="font-display font-bold text-foreground">
                <TypewriterText text={bubbleText} />
              </span>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-r border-b border-border rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }
);

Interactive3DMascot.displayName = "Interactive3DMascot";

export default Interactive3DMascot;
