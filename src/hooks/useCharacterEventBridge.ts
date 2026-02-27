/**
 * useCharacterEventBridge — convenience hook for wiring game events to
 * the CharacterStore. Provides typed helpers for common game scenarios.
 */
import { useCallback } from "react";
import { dispatchCharacterEvent } from "@/lib/characterStore";
import type { CharacterEvent } from "@/lib/characterStore";

export interface CharacterEventBridge {
  onCorrectAnswer: (message?: string) => void;
  onWrongAnswer: (message?: string) => void;
  onLevelComplete: () => void;
  onHint: (hint?: string) => void;
  onGameStart: () => void;
  onGameEnd: () => void;
  dispatch: (event: CharacterEvent) => void;
}

export const useCharacterEventBridge = (): CharacterEventBridge => {
  const onCorrectAnswer = useCallback((message?: string) => {
    dispatchCharacterEvent({ type: "correct", payload: message ? { message } : undefined });
  }, []);

  const onWrongAnswer = useCallback((message?: string) => {
    dispatchCharacterEvent({ type: "wrong", payload: message ? { message } : undefined });
  }, []);

  const onLevelComplete = useCallback(() => {
    dispatchCharacterEvent({ type: "level_up" });
  }, []);

  const onHint = useCallback((hint?: string) => {
    dispatchCharacterEvent({ type: "hint", payload: hint ? { message: hint } : undefined });
  }, []);

  const onGameStart = useCallback(() => {
    dispatchCharacterEvent({ type: "wave" });
  }, []);

  const onGameEnd = useCallback(() => {
    dispatchCharacterEvent({ type: "celebrate" });
  }, []);

  return { onCorrectAnswer, onWrongAnswer, onLevelComplete, onHint, onGameStart, onGameEnd, dispatch: dispatchCharacterEvent };
};
