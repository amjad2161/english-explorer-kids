/**
 * Character Store
 * Manages the persistent character state across the entire application.
 * Uses React context for global state management.
 *
 * Character actions: idle, talk, react_positive, react_negative,
 * celebrate, point, think, wave
 */

import { createContext, useContext } from "react";

export type CharacterAction =
  | "idle"
  | "talk"
  | "react_positive"
  | "react_negative"
  | "celebrate"
  | "point"
  | "think"
  | "wave";

export type CharacterMood = "neutral" | "happy" | "encouraging" | "thinking" | "celebrating";

export interface CharacterState {
  /** Currently active character ID */
  characterId: string;
  /** Current animation action */
  action: CharacterAction;
  /** Current mood affects expression */
  mood: CharacterMood;
  /** Current speech text (empty = not speaking) */
  speech: string;
  /** Whether character is visible */
  visible: boolean;
  /** Whether character asset is loaded */
  loaded: boolean;
  /** Accessibility: reduced motion preference */
  reduceMotion: boolean;
}

export interface CharacterActions {
  setAction: (action: CharacterAction) => void;
  setMood: (mood: CharacterMood) => void;
  setSpeech: (text: string) => void;
  setVisible: (visible: boolean) => void;
  setLoaded: (loaded: boolean) => void;
  reset: () => void;
}

export type CharacterStore = CharacterState & CharacterActions;

export const defaultCharacterState: CharacterState = {
  characterId: "default-mascot",
  action: "idle",
  mood: "neutral",
  speech: "",
  visible: true,
  loaded: false,
  reduceMotion: false,
};

export const CharacterContext = createContext<CharacterStore | null>(null);

export function useCharacter(): CharacterStore {
  const ctx = useContext(CharacterContext);
  if (!ctx) {
    throw new Error("useCharacter must be used within a CharacterProvider");
  }
  return ctx;
}
