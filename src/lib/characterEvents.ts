/**
 * Character Event Bridge
 * Provides a unified API for dispatching character events from anywhere in the app.
 * Game events, navigation events, and learning events all flow through here
 * and are mapped to character reactions.
 */

import type { CharacterAction, CharacterMood } from "./characterStore";

export type CharacterEventType =
  | "correct_answer"
  | "wrong_answer"
  | "level_up"
  | "hint_requested"
  | "game_start"
  | "game_end"
  | "navigation"
  | "idle_timeout"
  | "achievement_unlocked"
  | "streak_milestone"
  | "story_beat"
  | "encouragement";

export interface CharacterEvent {
  type: CharacterEventType;
  payload?: Record<string, unknown>;
}

export interface CharacterReaction {
  action: CharacterAction;
  mood: CharacterMood;
  speech?: string;
  duration?: number;
}

/**
 * Maps application events to character reactions.
 * Returns the appropriate character animation and mood for each event type.
 */
export function mapEventToReaction(event: CharacterEvent): CharacterReaction {
  switch (event.type) {
    case "correct_answer":
      return {
        action: "react_positive",
        mood: "happy",
        speech: "",
        duration: 1500,
      };
    case "wrong_answer":
      return {
        action: "react_negative",
        mood: "encouraging",
        speech: "",
        duration: 2000,
      };
    case "level_up":
      return {
        action: "celebrate",
        mood: "celebrating",
        speech: "",
        duration: 3000,
      };
    case "hint_requested":
      return {
        action: "think",
        mood: "thinking",
        speech: "",
        duration: 2000,
      };
    case "game_start":
      return {
        action: "wave",
        mood: "happy",
        speech: "",
        duration: 1500,
      };
    case "game_end":
      return {
        action: "celebrate",
        mood: "celebrating",
        speech: "",
        duration: 2500,
      };
    case "navigation":
      return {
        action: "wave",
        mood: "neutral",
        speech: "",
        duration: 1000,
      };
    case "idle_timeout":
      return {
        action: "wave",
        mood: "encouraging",
        speech: "",
        duration: 2000,
      };
    case "achievement_unlocked":
      return {
        action: "celebrate",
        mood: "celebrating",
        speech: "",
        duration: 3000,
      };
    case "streak_milestone":
      return {
        action: "celebrate",
        mood: "happy",
        speech: "",
        duration: 2000,
      };
    case "story_beat":
      return {
        action: "talk",
        mood: "neutral",
        speech: "",
        duration: 2000,
      };
    case "encouragement":
      return {
        action: "point",
        mood: "encouraging",
        speech: "",
        duration: 1500,
      };
    default:
      return {
        action: "idle",
        mood: "neutral",
        duration: 0,
      };
  }
}

/** Typed event dispatcher factory. Use with CharacterProvider. */
export type DispatchCharacterEvent = (event: CharacterEvent) => void;

/**
 * Creates a dispatch function bound to character store actions.
 * This is the unified API: dispatchCharacterEvent({ type, payload }) from anywhere.
 */
export function createCharacterDispatch(
  setAction: (a: CharacterAction) => void,
  setMood: (m: CharacterMood) => void,
  setSpeech: (s: string) => void,
): DispatchCharacterEvent {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (event: CharacterEvent) => {
    const reaction = mapEventToReaction(event);

    // Clear any pending idle reset
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    setAction(reaction.action);
    setMood(reaction.mood);
    if (reaction.speech) {
      setSpeech(reaction.speech);
    }

    // Auto-return to idle after duration
    if (reaction.duration && reaction.duration > 0) {
      timeoutId = setTimeout(() => {
        setAction("idle");
        setMood("neutral");
        setSpeech("");
        timeoutId = null;
      }, reaction.duration);
    }
  };
}
