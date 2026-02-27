/**
 * CharacterStore — Zustand store for the persistent character runtime.
 *
 * The character is mounted once at the App root and reacts to events from
 * any screen or game via dispatchCharacterEvent().
 */
import { create } from "zustand";

export type CharacterMood =
  | "idle"
  | "wave"
  | "celebrate"
  | "surprised"
  | "sad"
  | "think"
  | "point";

export type CharacterEventType =
  | "correct"
  | "wrong"
  | "level_up"
  | "hint"
  | "navigate"
  | "idle"
  | "celebrate"
  | "wave";

export interface CharacterEvent {
  type: CharacterEventType;
  payload?: {
    message?: string;
    word?: string;
  };
}

interface CharacterState {
  mood: CharacterMood;
  speech: string | null;
  isVisible: boolean;
  setMood: (mood: CharacterMood) => void;
  setSpeech: (text: string | null) => void;
  setVisible: (visible: boolean) => void;
  dispatch: (event: CharacterEvent) => void;
}

/** Maps game/app events to character moods and optional speech */
const EVENT_REACTIONS: Record<CharacterEventType, { mood: CharacterMood; speech?: string }> = {
  correct: { mood: "celebrate", speech: "🎉" },
  wrong: { mood: "sad", speech: "💙" },
  level_up: { mood: "celebrate", speech: "🏆" },
  hint: { mood: "point", speech: "💡" },
  navigate: { mood: "wave", speech: "👋" },
  idle: { mood: "idle" },
  celebrate: { mood: "celebrate", speech: "⭐" },
  wave: { mood: "wave", speech: "👋" },
};

export const useCharacterStore = create<CharacterState>((set) => ({
  mood: "idle",
  speech: null,
  isVisible: true,

  setMood: (mood) => set({ mood }),
  setSpeech: (speech) => set({ speech }),
  setVisible: (isVisible) => set({ isVisible }),

  dispatch: (event: CharacterEvent) => {
    const reaction = EVENT_REACTIONS[event.type] ?? EVENT_REACTIONS.idle;
    const speech = event.payload?.message ?? reaction.speech ?? null;
    set({ mood: reaction.mood, speech });
    // Auto-reset to idle after a moment
    setTimeout(() => set({ mood: "idle", speech: null }), 2500);
  },
}));

/**
 * Public API — call from any game or screen to trigger character reactions.
 * @example dispatchCharacterEvent({ type: "correct" })
 */
export const dispatchCharacterEvent = (event: CharacterEvent): void => {
  useCharacterStore.getState().dispatch(event);
};
