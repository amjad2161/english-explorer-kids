import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Achievement, achievementNames, achievementDescs, tierColors } from "@/lib/achievements";
import { useLanguage } from "@/lib/i18n";
import { playStarSound, playVictoryFanfare } from "@/lib/sounds";
import Confetti from "./Confetti";

interface AchievementToastProps {
  achievement: Achievement | null;
  onDone: () => void;
}

const isRareTier = (tier: string) => tier === "gold" || tier === "diamond";

const RareParticleRing = ({ tier }: { tier: string }) => {
  const color = tier === "diamond" ? "hsl(195, 85%, 55%)" : "hsl(45, 100%, 55%)";
  return (
    <>
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * 360;
        const rad = (angle * Math.PI) / 180;
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full pointer-events-none"
            style={{ background: color, left: "50%", top: "50%", boxShadow: `0 0 8px ${color}` }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: [0, Math.cos(rad) * 120, Math.cos(rad) * 160],
              y: [0, Math.sin(rad) * 120, Math.sin(rad) * 160],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{ duration: 1.8, delay: 0.2 + i * 0.06, ease: "easeOut" }}
          />
        );
      })}
    </>
  );
};

const ShimmerOverlay = ({ tier }: { tier: string }) => {
  const colors = tier === "diamond"
    ? "from-transparent via-cyan-300/30 to-transparent"
    : "from-transparent via-yellow-300/30 to-transparent";
  return (
    <motion.div
      className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${colors} pointer-events-none`}
      initial={{ x: "-100%" }}
      animate={{ x: "200%" }}
      transition={{ duration: 1.5, repeat: 2, ease: "easeInOut", delay: 0.5 }}
    />
  );
};

const AchievementToast = ({ achievement, onDone }: AchievementToastProps) => {
  const { lang } = useLanguage();
  const [showConfetti, setShowConfetti] = useState(false);
  const rare = achievement ? isRareTier(achievement.tier) : false;

  useEffect(() => {
    if (achievement) {
      if (rare) {
        playVictoryFanfare();
        setShowConfetti(true);
        const confettiTimer = setTimeout(() => setShowConfetti(false), 3500);
        const doneTimer = setTimeout(onDone, 6000);
        return () => { clearTimeout(confettiTimer); clearTimeout(doneTimer); };
      } else {
        playStarSound();
        const timer = setTimeout(onDone, 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [achievement, onDone, rare]);

  const tierBg: Record<string, string> = {
    bronze: "border-amber-500/50 shadow-amber-500/20",
    silver: "border-slate-400/50 shadow-slate-400/20",
    gold: "border-yellow-400/60 shadow-yellow-500/40",
    diamond: "border-cyan-400/60 shadow-cyan-400/40",
  };

  const tierGlow: Record<string, string> = {
    gold: "0 0 40px hsl(45, 100%, 55%, 0.4), 0 0 80px hsl(45, 100%, 55%, 0.15)",
    diamond: "0 0 40px hsl(195, 85%, 55%, 0.4), 0 0 80px hsl(195, 85%, 55%, 0.15)",
  };

  return (
    <AnimatePresence>
      {achievement && (
        <>
          {/* Fullscreen overlay for rare achievements */}
          {rare && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99] bg-black/40 backdrop-blur-sm pointer-events-none"
            />
          )}

          <Confetti show={showConfetti} />

          <motion.div
            initial={{ y: rare ? 0 : -120, opacity: 0, scale: rare ? 0.3 : 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: rare ? 50 : -120, opacity: 0, scale: rare ? 0.5 : 0.8 }}
            transition={rare
              ? { type: "spring", stiffness: 180, damping: 14 }
              : { type: "spring", stiffness: 300, damping: 22 }}
            className={`fixed z-[100] ${rare
              ? "inset-0 flex items-center justify-center"
              : "top-20 left-1/2 -translate-x-1/2"}`}
          >
            <motion.div
              className={`relative overflow-hidden ${rare ? "max-w-sm w-full mx-4 p-8 rounded-3xl" : "px-6 py-4 rounded-2xl"} flex ${rare ? "flex-col items-center text-center" : "items-center"} gap-4 border-2 ${tierBg[achievement.tier]} bg-card/95 backdrop-blur-xl shadow-2xl`}
              style={rare ? { boxShadow: tierGlow[achievement.tier] } : {}}
              animate={rare ? { boxShadow: [
                tierGlow[achievement.tier] || "",
                (achievement.tier === "diamond"
                  ? "0 0 60px hsl(195, 85%, 55%, 0.6), 0 0 120px hsl(195, 85%, 55%, 0.2)"
                  : "0 0 60px hsl(45, 100%, 55%, 0.6), 0 0 120px hsl(45, 100%, 55%, 0.2)"),
                tierGlow[achievement.tier] || "",
              ]} : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* Shimmer effect for rare */}
              {rare && <ShimmerOverlay tier={achievement.tier} />}

              {/* Particle ring for rare */}
              {rare && <RareParticleRing tier={achievement.tier} />}

              {/* Badge icon */}
              <motion.div
                animate={rare
                  ? { rotate: [0, 360], scale: [1, 1.4, 1] }
                  : { rotate: [0, 360], scale: [1, 1.3, 1] }}
                transition={rare
                  ? { duration: 2, ease: "easeInOut" }
                  : { duration: 1.2 }}
                className={`${rare ? "w-24 h-24 rounded-3xl text-5xl" : "w-16 h-16 rounded-2xl text-3xl"} bg-gradient-to-br ${tierColors[achievement.tier]} flex items-center justify-center shadow-lg relative z-10`}
              >
                {achievement.emoji}
              </motion.div>

              <div className="relative z-10">
                {/* Tier label for rare */}
                {rare && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className={`inline-block px-3 py-1 rounded-full text-xs font-display font-bold mb-2 ${
                      achievement.tier === "diamond"
                        ? "bg-cyan-400/20 text-cyan-600"
                        : "bg-yellow-400/20 text-yellow-600"
                    }`}
                  >
                    {achievement.tier === "diamond" ? "💎 DIAMOND" : "🥇 GOLD"}
                  </motion.div>
                )}

                <motion.p
                  initial={{ x: rare ? 0 : -10, y: rare ? 20 : 0, opacity: 0 }}
                  animate={{ x: 0, y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs font-display font-semibold text-muted-foreground mb-0.5"
                >
                  {rare
                    ? (lang === "he" ? "🎉 הישג נדיר נפתח!" : lang === "ar" ? "🎉 إنجاز نادر!" : "🎉 Rare Achievement Unlocked!")
                    : (lang === "he" ? "🏅 הישג חדש!" : lang === "ar" ? "🏅 إنجاز جديد!" : "🏅 New Achievement!")}
                </motion.p>
                <motion.p
                  initial={{ x: rare ? 0 : -10, y: rare ? 20 : 0, opacity: 0 }}
                  animate={{ x: 0, y: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className={`font-display font-bold text-foreground ${rare ? "text-2xl" : "text-xl"}`}
                >
                  {achievementNames[achievement.id]?.[lang] || achievement.id}
                </motion.p>
                {rare && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-sm text-muted-foreground font-body mt-1"
                  >
                    {achievementDescs[achievement.id]?.[lang] || ""}
                  </motion.p>
                )}
              </div>

              {/* Sparkle effects */}
              {[...Array(rare ? 16 : 6)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute ${rare ? "text-lg" : "text-sm"} pointer-events-none`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.2, 0],
                    x: (Math.random() - 0.5) * (rare ? 200 : 100),
                    y: (Math.random() - 0.5) * (rare ? 200 : 60),
                  }}
                  transition={{ duration: 2, delay: 0.3 + i * 0.1, repeat: rare ? 2 : 1 }}
                  style={{ left: "50%", top: "50%" }}
                >
                  {rare ? (["✨", "⭐", "💫", "🌟"][i % 4]) : "✨"}
                </motion.div>
              ))}

              {/* Tap to dismiss for rare */}
              {rare && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  onClick={onDone}
                  className="relative z-10 mt-4 btn-kid gradient-primary text-primary-foreground px-6"
                >
                  {lang === "he" ? "מדהים! 🎉" : lang === "ar" ? "رائع! 🎉" : "Awesome! 🎉"}
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AchievementToast;
