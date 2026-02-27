import { create } from "zustand";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CharacterMood =
  | "idle"
  | "talk"
  | "react"
  | "celebrate"
  | "point"
  | "think"
  | "wave"
  | "surprised"
  | "sad";

export type CharacterEventType =
  | "idle"
  | "talk"
  | "correct"
  | "wrong"
  | "level-up"
  | "hint"
  | "navigate"
  | "celebrate"
  | "wave"
  | "think"
  | "point";

export interface CharacterEvent {
  type: CharacterEventType;
  payload?: {
    message?: string;
    duration?: number;
  };
}

interface CharacterState {
  mood: CharacterMood;
  speechBubble: string | null;
  /** Increment to re-trigger the same mood animation */
  animationKey: number;
  dispatch: (event: CharacterEvent) => void;
}

// ---------------------------------------------------------------------------
// Mood mapping from event type
// ---------------------------------------------------------------------------

const eventToMood: Record<CharacterEventType, CharacterMood> = {
  idle: "idle",
  talk: "talk",
  correct: "celebrate",
  wrong: "sad",
  "level-up": "celebrate",
  hint: "point",
  navigate: "wave",
  celebrate: "celebrate",
  wave: "wave",
  think: "think",
  point: "point",
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCharacterStore = create<CharacterState>((set, get) => ({
  mood: "idle",
  speechBubble: null,
  animationKey: 0,

  dispatch: (event: CharacterEvent) => {
    const mood = eventToMood[event.type] ?? "idle";
    const speechBubble = event.payload?.message ?? null;
    const duration = event.payload?.duration ?? (mood === "idle" ? 0 : 3000);

    set((s) => ({ mood, speechBubble, animationKey: s.animationKey + 1 }));

    // Auto-return to idle after duration
    if (mood !== "idle" && duration > 0) {
      setTimeout(() => {
        // Only reset if nobody else changed the mood in the meantime
        if (get().mood === mood) {
          set({ mood: "idle", speechBubble: null });
        }
      }, duration);
    }
  },
}));

// ---------------------------------------------------------------------------
// Public API usable from pages / games
// ---------------------------------------------------------------------------

/**
 * Dispatch a character event from anywhere in the app.
 *
 * @example
 *   dispatchCharacterEvent({ type: "correct" });
 *   dispatchCharacterEvent({ type: "hint", payload: { message: "Try letter A!" } });
 */
export const dispatchCharacterEvent = (event: CharacterEvent): void => {
  useCharacterStore.getState().dispatch(event);
};
