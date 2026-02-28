import { motion, AnimatePresence } from "framer-motion";
import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { playEraserSound } from "@/lib/sounds";

interface EraserContextType {
  navigateWithEraser: (to: string | number) => void;
}

const EraserContext = createContext<EraserContextType>({ navigateWithEraser: () => {} });

export const useEraserTransition = () => useContext(EraserContext);

/** The visual overlay — eraser sweeps across, chalk dust flies */
const EraserOverlay = ({ active, onDone }: { active: boolean; onDone: () => void }) => (
  <AnimatePresence>
    {active && (
      <motion.div
        className="fixed inset-0 z-[9999] pointer-events-none"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        {/* Chalk dust cloud that follows the eraser */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 120% 100% at 50% 50%, hsl(var(--chalk) / 0.06), transparent 70%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0.4, 0] }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {/* Main eraser wipe — a thick bar that sweeps left-to-right */}
        <motion.div
          className="absolute top-0 bottom-0"
          style={{
            width: "35%",
            background: `linear-gradient(90deg, 
              transparent 0%, 
              hsl(var(--board) / 0.3) 15%,
              hsl(var(--board) / 0.85) 35%,
              hsl(var(--board) / 0.95) 50%,
              hsl(var(--board) / 0.85) 65%,
              hsl(var(--board) / 0.3) 85%,
              transparent 100%
            )`,
          }}
          initial={{ x: "-40%" }}
          animate={{ x: "140vw" }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
          onAnimationComplete={onDone}
        />

        {/* Eraser block — the actual "duster" shape riding the wave */}
        <motion.div
          className="absolute"
          style={{
            top: "38%",
            width: 100,
            height: 44,
            borderRadius: 8,
            background: "linear-gradient(180deg, hsl(30 25% 75%), hsl(30 20% 60%), hsl(30 25% 50%))",
            boxShadow: "0 4px 16px hsl(0 0% 0% / 0.3), inset 0 1px 0 hsl(30 30% 85%)",
            border: "1px solid hsl(30 20% 45%)",
          }}
          initial={{ x: "-120px", rotate: -3 }}
          animate={{ x: "105vw", rotate: [-3, 2, -1, 3, -2, 1] }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Felt pad on bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[10px] rounded-b-md"
            style={{
              background: "linear-gradient(180deg, hsl(0 0% 40%), hsl(0 0% 25%))",
            }}
          />
          {/* Label on eraser */}
          <div
            className="absolute inset-0 flex items-center justify-center text-[9px] font-display font-bold tracking-widest uppercase"
            style={{ color: "hsl(30 20% 40%)", paddingBottom: 8 }}
          >
            ERASER
          </div>
        </motion.div>

        {/* Chalk dust particles flying off */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3 + Math.random() * 5,
              height: 3 + Math.random() * 5,
              top: `${25 + Math.random() * 50}%`,
              background: `hsl(var(--chalk) / ${0.15 + Math.random() * 0.25})`,
            }}
            initial={{ x: "-10px", opacity: 0 }}
            animate={{
              x: `${20 + i * 8}vw`,
              y: [0, -20 - Math.random() * 40, 30 + Math.random() * 20],
              opacity: [0, 0.7, 0],
              scale: [0.5, 1.2, 0.3],
            }}
            transition={{
              duration: 0.7 + Math.random() * 0.5,
              delay: 0.1 + i * 0.05,
              ease: "easeOut",
            }}
          />
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

/** Provider — wrap inside BrowserRouter */
export const EraserTransitionProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [active, setActive] = useState(false);

  const navigateWithEraser = useCallback((to: string | number) => {
    setActive(true);
    playEraserSound(900);
    // Navigate immediately — the eraser overlay plays on top as a visual effect
    if (typeof to === "number") navigate(to as number);
    else navigate(to);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [navigate]);

  const handleDone = useCallback(() => {
    setActive(false);
  }, []);

  return (
    <EraserContext.Provider value={{ navigateWithEraser }}>
      {children}
      <EraserOverlay active={active} onDone={handleDone} />
    </EraserContext.Provider>
  );
};
