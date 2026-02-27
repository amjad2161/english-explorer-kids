/**
 * CharacterStage — persistent character overlay mounted once at the App root.
 *
 * Reads from CharacterStore and renders CharacterProxy.
 * Position: fixed bottom-right corner, overlays all pages without remounting.
 */
import { useCharacterStore, dispatchCharacterEvent } from "@/lib/characterStore";
import CharacterProxy from "./CharacterProxy";
import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CharacterStageProps {
  /** Override size; defaults to "md" */
  size?: "sm" | "md" | "lg";
}

const CharacterStage = ({ size = "md" }: CharacterStageProps) => {
  const { mood, speech, isVisible } = useCharacterStore();

  const handleClick = useCallback(() => {
    dispatchCharacterEvent({ type: "wave" });
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 40 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="fixed bottom-4 end-4 z-50 pointer-events-auto"
          aria-live="polite"
          aria-label="Character companion"
        >
          <CharacterProxy mood={mood} size={size} speech={speech} onClick={handleClick} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CharacterStage;
