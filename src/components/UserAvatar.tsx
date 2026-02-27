import { motion } from "framer-motion";
import { getProfile } from "@/lib/ageProfile";
import owlPixar from "@/assets/owl-pixar.png";

interface UserAvatarProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showName?: boolean;
  showOwl?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeConfig = {
  xs: { container: 28, emoji: "text-sm", ring: 1.5, glow: 6 },
  sm: { container: 36, emoji: "text-lg", ring: 2, glow: 10 },
  md: { container: 52, emoji: "text-2xl", ring: 2.5, glow: 14 },
  lg: { container: 72, emoji: "text-4xl", ring: 3, glow: 20 },
  xl: { container: 96, emoji: "text-5xl", ring: 3.5, glow: 28 },
};

const UserAvatar = ({ size = "md", showName = false, showOwl = false, className = "", onClick }: UserAvatarProps) => {
  const profile = getProfile();
  const avatar = profile?.avatar || "🦉";
  const name = profile?.name || "";
  const config = sizeConfig[size];

  return (
    <motion.div
      className={`flex flex-col items-center gap-1.5 ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.08 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
    >
      <div className="relative">
        {/* Main avatar circle */}
        <motion.div
          className="rounded-full flex items-center justify-center relative overflow-hidden"
          style={{
            width: config.container,
            height: config.container,
            background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--accent) / 0.15))",
            border: `${config.ring}px solid hsl(var(--primary) / 0.4)`,
            boxShadow: `0 0 ${config.glow}px hsl(var(--primary) / 0.2), inset 0 1px 4px hsl(var(--primary) / 0.1)`,
          }}
          animate={{
            boxShadow: [
              `0 0 ${config.glow}px hsl(var(--primary) / 0.2)`,
              `0 0 ${config.glow * 1.5}px hsl(var(--primary) / 0.35)`,
              `0 0 ${config.glow}px hsl(var(--primary) / 0.2)`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className={`${config.emoji} select-none`}>{avatar}</span>
        </motion.div>

        {/* Owl companion badge — small owl icon next to avatar */}
        {showOwl && (
          <motion.div
            className="absolute -bottom-1 -right-1 rounded-full overflow-hidden"
            style={{
              width: config.container * 0.42,
              height: config.container * 0.42,
              border: `${config.ring}px solid hsl(var(--background))`,
              background: "hsl(var(--card))",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
          >
            <img
              src={owlPixar}
              alt="Owl companion"
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </div>

      {/* Name label */}
      {showName && name && (
        <motion.p
          className="font-display font-bold text-xs text-foreground truncate max-w-[120px]"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {name}
        </motion.p>
      )}
    </motion.div>
  );
};

/* ─── Companion avatars row — fox, bookworm, mouse ─── */
export type CompanionMood = "idle" | "celebrate" | "sad" | "surprised";

interface CompanionAvatarsProps {
  size?: "xs" | "sm";
  className?: string;
  mood?: CompanionMood;
}

const moodAnimations: Record<CompanionMood, Record<string, number[]>> = {
  idle: { y: [0, -2, 0], rotate: [0, 0, 0], scale: [1, 1, 1] },
  celebrate: { y: [0, -8, 0, -5, 0], rotate: [0, -10, 10, -5, 0], scale: [1, 1.2, 0.95, 1.1, 1] },
  sad: { y: [0, 2, 0], rotate: [0, -3, 0], scale: [1, 0.92, 1] },
  surprised: { y: [0, -6, 0], rotate: [0, 5, -5, 0], scale: [1, 1.15, 1] },
};

const moodTransitions: Record<CompanionMood, object> = {
  idle: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  celebrate: { duration: 0.8, repeat: 3, ease: "easeOut" },
  sad: { duration: 2, repeat: 2, ease: "easeInOut" },
  surprised: { duration: 0.5, repeat: 1, ease: [0.34, 1.56, 0.64, 1] },
};

export const CompanionAvatars = ({ size = "xs", className = "", mood = "idle" }: CompanionAvatarsProps) => {
  const companions = [
    { emoji: "🦊", color: "--accent" },
    { emoji: "🐛", color: "--grass" },
    { emoji: "🐭", color: "--sky" },
  ];
  const dim = size === "xs" ? 24 : 30;

  return (
    <div className={`flex items-center -space-x-2 ${className}`}>
      {companions.map((c, i) => (
        <motion.div
          key={`${i}-${mood}`}
          className="rounded-full flex items-center justify-center"
          style={{
            width: dim,
            height: dim,
            background: mood === "celebrate"
              ? `hsl(var(${c.color}) / 0.3)`
              : `hsl(var(${c.color}) / 0.15)`,
            border: mood === "celebrate"
              ? `1.5px solid hsl(var(${c.color}) / 0.5)`
              : `1.5px solid hsl(var(--border))`,
            fontSize: size === "xs" ? 12 : 15,
            zIndex: 3 - i,
            transition: "background 0.3s, border-color 0.3s",
          }}
          initial={{ opacity: 0, x: -10 }}
          animate={{
            opacity: 1,
            x: 0,
            ...moodAnimations[mood],
          }}
          transition={{
            ...moodTransitions[mood],
            delay: i * 0.08,
          }}
          whileHover={{ scale: 1.2, zIndex: 10 }}
        >
          {c.emoji}
        </motion.div>
      ))}
    </div>
  );
};

export default UserAvatar;
