import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface StarRatingProps {
  earned: number;
  total: number;
  size?: number;
}

const StarRating = ({ earned, total, size = 24 }: StarRatingProps) => {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <motion.div
          key={i}
          initial={i < earned ? { scale: 0, rotate: -180 } : {}}
          animate={i < earned ? { scale: 1, rotate: 0 } : {}}
          transition={{ delay: i * 0.12, type: "spring", stiffness: 300 }}
          whileHover={{ scale: 1.2, y: -2 }}
          className="relative"
        >
          {/* Glow effect for earned stars */}
          {i < earned && (
            <motion.div
              className="absolute inset-0 rounded-full blur-sm"
              style={{
                background: "hsl(var(--sunshine) / 0.3)",
                width: size + 4,
                height: size + 4,
                margin: -2,
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            />
          )}
          <Star
            size={size}
            className={`transition-all relative z-10 ${
              i < earned
                ? "star-earned fill-current drop-shadow-md"
                : "star-empty"
            }`}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default StarRating;
