import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { DailyChallenge as DailyChallengeType, claimDailyReward } from "@/lib/xp";
import { playClickSound, playVictoryFanfare, playStarSound } from "@/lib/sounds";
import { Zap, Gift, ChevronRight, Clock, Sparkles } from "lucide-react";
import Confetti from "@/components/Confetti";
import XPReward from "@/components/XPReward";

interface Props {
  challenge: DailyChallengeType;
  onUpdate?: () => void;
}

const DailyChallengeCard = ({ challenge, onUpdate }: Props) => {
  const navigate = useNavigate();
  const { lang, dir } = useLanguage();
  const [showConfetti, setShowConfetti] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);
  const [claimed, setClaimed] = useState(challenge.claimed);

  const t = (texts: Record<string, string>) => texts[lang] || texts.en;
  const progress = Math.min(challenge.progress / challenge.target, 1);
  const isComplete = challenge.progress >= challenge.target;

  const handleClaim = () => {
    if (!isComplete || claimed) return;
    playVictoryFanfare();
    const reward = claimDailyReward();
    if (reward > 0) {
      setXpAmount(reward);
      setShowXP(true);
      setShowConfetti(true);
      setClaimed(true);
      setTimeout(() => setShowConfetti(false), 100);
      onUpdate?.();
    }
  };

  const handleGo = () => {
    playClickSound();
    navigate(challenge.path);
  };

  // Calculate time remaining until midnight
  const now = new Date();
  const midnight = new Date(now);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  const hoursLeft = Math.floor((midnight.getTime() - now.getTime()) / 3600000);
  const minutesLeft = Math.floor(((midnight.getTime() - now.getTime()) % 3600000) / 60000);

  return (
    <>
      <Confetti show={showConfetti} />
      <XPReward amount={xpAmount} show={showXP} gameType="daily" onComplete={() => setShowXP(false)} />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="card-kid relative overflow-hidden group"
        dir={dir}
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isComplete
              ? "linear-gradient(135deg, hsl(var(--accent) / 0.08), hsl(var(--sunshine) / 0.08))"
              : "linear-gradient(135deg, hsl(var(--primary) / 0.05), hsl(var(--sunshine) / 0.05))",
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        {/* Sparkle particles for completed challenge */}
        <AnimatePresence>
          {isComplete && !claimed && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-sunshine"
                  style={{
                    left: `${15 + i * 15}%`,
                    top: `${20 + (i % 3) * 25}%`,
                  }}
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.3, 0.8],
                  }}
                  transition={{
                    duration: 1.5 + i * 0.3,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        <div className="relative z-10">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-sunshine flex items-center justify-center text-xl shadow-md"
                animate={isComplete && !claimed
                  ? { rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] }
                  : { rotate: [0, 3, -3, 0] }
                }
                transition={{ duration: isComplete ? 1.5 : 4, repeat: Infinity }}
              >
                {challenge.emoji}
              </motion.div>
              <div>
                <h3 className="font-display font-bold text-base leading-tight">
                  {t(challenge.title)}
                </h3>
                <p className="text-xs text-muted-foreground font-body">
                  {t({ he: "אתגר יומי", ar: "تحدي يومي", en: "Daily Challenge" })}
                </p>
              </div>
            </div>

            {/* Timer / Reward badge */}
            <div className="flex items-center gap-2">
              {!isComplete && (
                <div className="flex items-center gap-1 text-muted-foreground text-xs font-display bg-muted/40 rounded-full px-2.5 py-1">
                  <Clock className="w-3 h-3" />
                  <span>{hoursLeft}h {minutesLeft}m</span>
                </div>
              )}
              <motion.div
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-display font-bold ${
                  claimed
                    ? "bg-accent/15 text-accent"
                    : isComplete
                    ? "bg-sunshine/20 text-sunshine-foreground animate-glow-pulse"
                    : "bg-primary/10 text-primary"
                }`}
                animate={isComplete && !claimed ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <Zap className="w-3 h-3" />
                <span>+{challenge.xpReward} XP</span>
              </motion.div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground font-body mb-3">
            {t(challenge.description)}
          </p>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-display font-semibold text-muted-foreground">
                {t({ he: "התקדמות", ar: "التقدم", en: "Progress" })}
              </span>
              <span className="text-xs font-display font-bold">
                {challenge.progress}/{challenge.target}
              </span>
            </div>
            <div className="progress-bar h-4 relative">
              <motion.div
                className="h-full rounded-full relative overflow-hidden"
                style={{
                  background: isComplete
                    ? "linear-gradient(90deg, hsl(var(--accent)), hsl(var(--grass)))"
                    : "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--sunshine)))",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              >
                {/* Shimmer */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
              </motion.div>

              {/* Step indicators */}
              <div className="absolute inset-0 flex items-center justify-evenly px-1">
                {Array.from({ length: challenge.target }, (_, i) => (
                  <motion.div
                    key={i}
                    className={`w-2 h-2 rounded-full z-10 ${
                      i < challenge.progress ? "bg-white/80" : "bg-foreground/10"
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Action button */}
          <AnimatePresence mode="wait">
            {claimed ? (
              <motion.div
                key="claimed"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent/10 text-accent font-display font-bold text-sm"
              >
                <Sparkles className="w-4 h-4" />
                {t({ he: "הושלם! 🎉", ar: "مكتمل! 🎉", en: "Completed! 🎉" })}
              </motion.div>
            ) : isComplete ? (
              <motion.button
                key="claim"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleClaim}
                className="w-full py-3 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 text-primary-foreground shadow-lg relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--grass)))",
                }}
              >
                <Gift className="w-4 h-4" />
                {t({ he: `קבל ${challenge.xpReward} XP! 🎁`, ar: `اجمع ${challenge.xpReward} XP! 🎁`, en: `Claim ${challenge.xpReward} XP! 🎁` })}
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.button>
            ) : (
              <motion.button
                key="go"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleGo}
                className="w-full py-3 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 gradient-primary text-primary-foreground shadow-md relative overflow-hidden"
              >
                {t({ he: "בוא נשחק!", ar: "هيا نلعب!", en: "Let's Go!" })}
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
};

export default DailyChallengeCard;
