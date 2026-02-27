/**
 * Interactive3DMascot — backward-compatible wrapper over CharacterProxy.
 *
 * All existing game code imports this component unchanged.
 * The previous implementation used <img> which violated the ABSOLUTE CONSTRAINT
 * "No <img> for characters". This wrapper delegates to CharacterProxy (SVG-based,
 * no <img> element) and also dispatches to CharacterStore so the persistent
 * CharacterStage at the app root stays in sync.
 */
import { useEffect, useCallback } from "react";
import CharacterProxy from "@/components/character/CharacterProxy";
import { dispatchCharacterEvent } from "@/lib/characterStore";
import type { CharacterMood } from "@/lib/characterStore";

export interface Interactive3DMascotProps {
  mood?: "idle" | "wave" | "celebrate" | "surprised" | "sad";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  showSpeechBubble?: string;
  /** @deprecated autoSpeak is a no-op; kept for API compatibility */
  autoSpeak?: boolean;
}

const MOOD_TO_EVENT: Record<string, "idle" | "celebrate" | "wave" | "celebrate"> = {
  celebrate: "celebrate",
  wave: "wave",
  surprised: "correct",
};

const Interactive3DMascot = ({
  mood = "idle",
  size = "md",
  onClick,
  showSpeechBubble,
}: Interactive3DMascotProps) => {
  // Keep the global character stage in sync with the local mascot mood
  useEffect(() => {
    const eventType = MOOD_TO_EVENT[mood];
    if (eventType) {
      dispatchCharacterEvent({ type: eventType });
    }
  }, [mood]);

  const handleClick = useCallback(() => {
    dispatchCharacterEvent({ type: "wave" });
    onClick?.();
  }, [onClick]);

  return (
    <CharacterProxy
      mood={mood as CharacterMood}
      size={size}
      speech={showSpeechBubble ?? null}
      onClick={handleClick}
    />
  );
};

export default Interactive3DMascot;
