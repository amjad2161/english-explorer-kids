import { ReactNode, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { dispatchCharacterEvent } from "@/lib/characterStore";
import { playClickSound } from "@/lib/sounds";
import { getLevel, getXP } from "@/lib/xp";
import Interactive3DMascot from "@/components/Interactive3DMascot";
import UserAvatar from "@/components/UserAvatar";
import StarRating from "@/components/StarRating";
import Confetti from "@/components/Confetti";
import ComboBurst from "@/components/ComboBurst";
import XPReward from "@/components/XPReward";
import StreakCounter from "@/components/StreakCounter";
import ScorePopup, { useScorePopups } from "@/components/ScorePopup";
import FloatingParticles from "@/components/FloatingParticles";
import ClassroomBackground from "@/components/ClassroomBackground";
import GameEntrance from "@/components/GameEntrance";
import { ArrowLeft, Pause, Play, Lightbulb, X, Zap, Target, Trophy } from "lucide-react";
import { RewardsPipelineState } from "@/hooks/useRewardsPipeline";
import { useState, useCallback, lazy, Suspense } from "react";

const DiegeticHUD3D = lazy(() => import("@/components/DiegeticHUD3D"));

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GameSceneShellProps {
  /** Game title */
  title: string;
  /** Emoji icon */
  emoji: string;
  /** Game type for tracking */
  gameType: string;
  /** Progress 0-100 */
  progress?: number;
  /** Total rounds for display */
  totalRounds?: number;
  /** Current round */
  currentRound?: number;
  /** Rewards pipeline state */
  rewards?: RewardsPipelineState;
  /** Called to dismiss XP overlay */
  onDismissXP?: () => void;
  /** Called when player requests a hint */
  onHint?: () => string | null;
  /** Custom back path */
  backPath?: string;
  /** Owl mood override */
  owlMood?: "idle" | "celebrate" | "sad" | "surprised";
  /** Owl speech bubble */
  owlSpeech?: string;
  /** Game content */
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// Pause Dialog (lightweight)
// ---------------------------------------------------------------------------

const PauseOverlay = ({
  onResume,
  onQuit,
}: {
  onResume: () => void;
  onQuit: () => void;
}) => {
  const { t, dir } = useLanguage();
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: "hsl(var(--background) / 0.85)",
        backdropFilter: "blur(12px)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      dir={dir}
    >
      <motion.div
        className="bg-card border border-border rounded-3xl p-8 w-72 shadow-xl text-center"
        initial={{ scale: 0.7, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.7, y: 40 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        <span className="text-5xl mb-4 block">⏸️</span>
        <h2 className="font-display font-bold text-2xl mb-6 text-foreground">
          {t("game.paused") || "Paused"}
        </h2>
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={onResume}
            className="btn-kid w-full gradient-primary text-primary-foreground flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            {t("game.resume") || "Resume"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={onQuit}
            className="btn-glow w-full text-foreground flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            {t("game.quit") || "Quit"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Character Corner (bottom-left)
// ---------------------------------------------------------------------------

const CharacterCorner = ({
  mood,
  speech,
  streak,
  bestStreak,
}: {
  mood: "idle" | "celebrate" | "sad" | "surprised";
  speech?: string;
  streak: number;
  bestStreak: number;
}) => (
  <div className="fixed bottom-4 start-4 z-30 flex items-end gap-2 pointer-events-none">
    <motion.div
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
      className="pointer-events-auto"
    >
      <Interactive3DMascot mood={mood} size="md" showSpeechBubble={speech} />
    </motion.div>
    {streak > 0 && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="mb-2 pointer-events-auto"
      >
        <StreakCounter streak={streak} bestStreak={bestStreak} />
      </motion.div>
    )}
  </div>
);

// ---------------------------------------------------------------------------
// Cinematic HUD Strip (top)
// ---------------------------------------------------------------------------

const CinematicHUD = ({
  title,
  emoji,
  score,
  progress,
  currentRound,
  totalRounds,
  onBack,
  onPause,
  onHint,
  dir,
}: {
  title: string;
  emoji: string;
  score: number;
  progress: number;
  currentRound?: number;
  totalRounds?: number;
  onBack: () => void;
  onPause: () => void;
  onHint?: () => void;
  dir: string;
}) => {
  const xpState = getXP();
  const level = getLevel(xpState.totalXP);

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="sticky top-0 z-40 flex items-center gap-2 px-3 py-2.5"
        style={{
          background: "hsl(var(--background) / 0.88)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid hsl(var(--border) / 0.5)",
        }}
      >
        {/* Back */}
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-xl flex items-center justify-center bg-muted/60 border border-border"
          aria-label="Back"
        >
          <ArrowLeft
            className={`w-4 h-4 text-foreground ${dir === "rtl" ? "rotate-180" : ""}`}
          />
        </motion.button>

        {/* Title + round counter */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-lg">{emoji}</span>
          <h1 className="font-display font-bold text-sm text-foreground truncate">
            {title}
          </h1>
          {currentRound != null && totalRounds != null && (
            <span className="text-xs text-muted-foreground font-display bg-muted/40 px-2 py-0.5 rounded-full border border-border shrink-0">
              {currentRound}/{totalRounds}
            </span>
          )}
        </div>

        {/* Score pill */}
        <div
          className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-primary/25 shrink-0"
          style={{ background: "hsl(var(--primary) / 0.08)" }}
        >
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="font-display font-bold text-xs text-primary">
            {score}
          </span>
        </div>

        {/* Level badge */}
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-full border border-accent/20 shrink-0"
          style={{ background: "hsl(var(--accent) / 0.08)" }}
        >
          <span className="text-xs">{level.title.split(" ")[0]}</span>
          <span className="font-display font-bold text-[10px] text-accent">
            Lv{level.level}
          </span>
        </div>

        {/* Hint */}
        {onHint && (
          <motion.button
            onClick={onHint}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sunshine border border-sunshine/20"
            style={{ background: "hsl(var(--sunshine) / 0.1)" }}
            aria-label="Hint"
          >
            <Lightbulb className="w-4 h-4" />
          </motion.button>
        )}

        {/* Pause */}
        <motion.button
          onClick={onPause}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-xl flex items-center justify-center bg-muted/60 border border-border"
          aria-label="Pause"
        >
          <Pause className="w-4 h-4 text-foreground" />
        </motion.button>
      </motion.header>

      {/* Cinematic progress bar */}
      <div className="h-1.5 relative overflow-hidden" style={{ background: "hsl(var(--muted) / 0.3)" }}>
        <motion.div
          className="h-full relative overflow-hidden"
          style={{
            background:
              "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--sunshine)))",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
            }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
          />
        </motion.div>
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// GameSceneShell
// ---------------------------------------------------------------------------

/**
 * GameSceneShell — cinematic game wrapper providing:
 * - Cinematic HUD (score, level, progress, round counter)
 * - Character corner with mood-reactive mascot + streak
 * - Integrated rewards overlays (XP, confetti, combo)
 * - Pause/quit flow
 * - Background + particles
 *
 * Usage:
 * ```tsx
 * const rewards = useRewardsPipeline();
 * <GameSceneShell title="Spelling Bee" emoji="🐝" gameType="spelling" rewards={rewards} progress={50}>
 *   <GameContent />
 * </GameSceneShell>
 * ```
 */
const GameSceneShell = forwardRef<HTMLDivElement, GameSceneShellProps>(
  (
    {
      title,
      emoji,
      gameType,
      progress = 0,
      totalRounds,
      currentRound,
      rewards,
      onDismissXP,
      onHint,
      backPath = "/levels",
      owlMood = "idle",
      owlSpeech,
      children,
    },
    ref
  ) => {
    const navigate = useNavigate();
    const { dir } = useLanguage();
    const [paused, setPaused] = useState(false);
    const [hintText, setHintText] = useState<string | null>(null);

    const derivedMood: "idle" | "celebrate" | "sad" | "surprised" =
      rewards.isComplete
        ? "celebrate"
        : rewards.streak >= 3
        ? "surprised"
        : owlMood;

    const handleBack = useCallback(() => {
      playClickSound();
      navigate(backPath);
    }, [navigate, backPath]);

    const handlePause = useCallback(() => {
      playClickSound();
      setPaused(true);
      dispatchCharacterEvent({ type: "think" });
    }, []);

    const handleResume = useCallback(() => {
      setPaused(false);
      dispatchCharacterEvent({ type: "wave", payload: { duration: 1500 } });
    }, []);

    const handleQuit = useCallback(() => {
      dispatchCharacterEvent({ type: "wave" });
      navigate(backPath);
    }, [navigate, backPath]);

    const handleHint = useCallback(() => {
      if (!onHint) return;
      const hint = onHint();
      if (!hint) return;
      setHintText(hint);
      dispatchCharacterEvent({
        type: "hint",
        payload: { message: hint, duration: 3000 },
      });
      setTimeout(() => setHintText(null), 3000);
    }, [onHint]);

    return (
      <div ref={ref} className="min-h-screen flex flex-col relative" dir={dir}>
        {/* Background layers */}
        <ClassroomBackground />
        <FloatingParticles count={6} />

        {/* Entrance animation */}
        <GameEntrance title={title} emoji={emoji} />

        {/* Reward overlays */}
        <Confetti show={rewards.showConfetti} />
        <ComboBurst combo={rewards.combo} show={rewards.showCombo} />
        <XPReward
          amount={rewards.xpEarned}
          show={rewards.showXP}
          gameType={gameType}
          onComplete={onDismissXP}
        />

        {/* HUD */}
        <CinematicHUD
          title={title}
          emoji={emoji}
          score={rewards.score}
          progress={progress}
          currentRound={currentRound}
          totalRounds={totalRounds}
          onBack={handleBack}
          onPause={handlePause}
          onHint={onHint ? handleHint : undefined}
          dir={dir}
        />

        {/* Diegetic 3D HUD — live rewards */}
        <Suspense fallback={null}>
          <DiegeticHUD3D
            score={rewards.score}
            starsEarned={rewards.starsEarned}
            energy={Math.min(rewards.streak * 20, 100)}
            visible={!rewards.isComplete && !paused}
          />
        </Suspense>

        {/* Game content */}
        <main className="flex-1 relative z-10">{children}</main>

        {/* Character corner */}
        <CharacterCorner
          mood={derivedMood}
          speech={owlSpeech || (hintText ? `💡 ${hintText}` : undefined)}
          streak={rewards.streak}
          bestStreak={rewards.bestStreak}
        />

        {/* Achievement toasts */}
        <AnimatePresence>
          {rewards.newAchievements.map((ach, i) => (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, x: 60, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ delay: i * 0.4 }}
              className="fixed bottom-4 end-4 z-50 bg-card/95 backdrop-blur-xl rounded-2xl px-5 py-3 shadow-xl border border-accent/30 flex items-center gap-3"
              style={{ marginBottom: i * 60 }}
            >
              <span className="text-2xl">{ach.emoji}</span>
              <div>
                <p className="font-display font-bold text-sm text-foreground">
                  🏆 Achievement!
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {ach.tier} • {ach.id.replace(/_/g, " ")}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Hint popup */}
        <AnimatePresence>
          {hintText && (
            <motion.div
              className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl shadow-lg max-w-xs text-center"
              style={{
                background: "hsl(var(--card))",
                border: "2px solid hsl(var(--sunshine) / 0.4)",
              }}
              initial={{ opacity: 0, y: 20, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
            >
              <span className="font-display text-sm font-bold text-foreground">
                💡 {hintText}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pause overlay */}
        <AnimatePresence>
          {paused && (
            <PauseOverlay onResume={handleResume} onQuit={handleQuit} />
          )}
        </AnimatePresence>

        {/* Level up overlay */}
        <AnimatePresence>
          {rewards.leveledUp && rewards.isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
              className="fixed top-1/3 left-1/2 -translate-x-1/2 z-[70] pointer-events-none"
            >
              <div
                className="bg-card/95 backdrop-blur-xl rounded-3xl px-8 py-5 border border-accent/40 text-center"
                style={{
                  boxShadow:
                    "0 0 60px hsl(var(--accent) / 0.3), 0 20px 40px hsl(var(--background) / 0.5)",
                }}
              >
                <motion.span
                  className="text-5xl block mb-2"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 1.5 }}
                >
                  🎉
                </motion.span>
                <p className="font-display font-extrabold text-2xl text-gradient">
                  LEVEL UP!
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {getLevel(getXP().totalXP).title}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

GameSceneShell.displayName = "GameSceneShell";

export default GameSceneShell;
