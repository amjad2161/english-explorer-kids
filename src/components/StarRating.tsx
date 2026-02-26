import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface StarRatingProps {
  earned: number;
  total: number;
  size?: number;
}

const StarRating = ({ earned, total, size = 24 }: StarRatingProps) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }, (_, i) => (
        <motion.div
          key={i}
          initial={i < earned ? { scale: 0, rotate: -180 } : {}}
          animate={i < earned ? { scale: 1, rotate: 0 } : {}}
          transition={{ delay: i * 0.15, type: "spring", stiffness: 300 }}
        >
          <Star
            size={size}
            className={`${
              i < earned
                ? "star-earned fill-current"
                : "star-empty"
            }`}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default StarRating;
