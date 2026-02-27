import { motion } from "framer-motion";

/**
 * ChalkWriteText — SVG-based chalk writing animation.
 * Each letter is drawn stroke-by-stroke with a chalk texture effect.
 */

interface Props {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  fontSize?: number;
}

const ChalkWriteText = ({ text, className = "", delay = 0, duration = 1.2, fontSize = 48 }: Props) => {
  const letterDelay = duration / Math.max(text.length, 1);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Chalk dust particles */}
      {text.split("").map((_, i) => (
        <motion.span
          key={`dust-${i}`}
          className="absolute w-1 h-1 rounded-full pointer-events-none"
          style={{
            background: "hsl(var(--foreground) / 0.3)",
            left: `${(i / text.length) * 80 + 10}%`,
            top: "60%",
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0],
            y: [0, -8 - Math.random() * 12],
            x: [(Math.random() - 0.5) * 10],
          }}
          transition={{
            duration: 0.4,
            delay: delay + i * letterDelay + 0.05,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Letters with chalk write-in effect */}
      <span className="flex items-center" style={{ gap: fontSize * 0.02 }}>
        {text.split("").map((char, i) => (
          <motion.span
            key={i}
            className="inline-block font-display font-extrabold relative"
            style={{
              fontSize,
              textShadow: "0 0 8px hsl(var(--foreground) / 0.15), 1px 1px 0 hsl(var(--foreground) / 0.05)",
              // Chalk texture via filter
              filter: "url(#chalk-texture)",
            }}
            initial={{
              opacity: 0,
              scale: 0.3,
              y: 12,
              rotate: -8 + Math.random() * 16,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              rotate: 0,
            }}
            transition={{
              duration: 0.15,
              delay: delay + i * letterDelay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </span>

      {/* SVG chalk texture filter */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="chalk-texture">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="1.5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default ChalkWriteText;
