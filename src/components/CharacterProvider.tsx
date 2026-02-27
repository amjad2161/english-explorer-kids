/**
 * Character Provider
 * Wraps the app at root level to provide persistent character state.
 * Manages character state and exposes dispatch for events.
 */

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  CharacterContext,
  defaultCharacterState,
  type CharacterAction,
  type CharacterMood,
  type CharacterStore,
} from "@/lib/characterStore";
import {
  createCharacterDispatch,
  type DispatchCharacterEvent,
} from "@/lib/characterEvents";

interface CharacterProviderProps {
  children: React.ReactNode;
}

// Context for the dispatch function (separate to avoid unnecessary re-renders)
const CharacterDispatchContext = React.createContext<DispatchCharacterEvent | null>(null);

export function useCharacterDispatch(): DispatchCharacterEvent {
  const ctx = React.useContext(CharacterDispatchContext);
  if (!ctx) {
    throw new Error("useCharacterDispatch must be used within CharacterProvider");
  }
  return ctx;
}

export function CharacterProvider({ children }: CharacterProviderProps) {
  const [action, setAction] = useState<CharacterAction>(defaultCharacterState.action);
  const [mood, setMood] = useState<CharacterMood>(defaultCharacterState.mood);
  const [speech, setSpeech] = useState(defaultCharacterState.speech);
  const [visible, setVisible] = useState(defaultCharacterState.visible);
  const [loaded, setLoaded] = useState(defaultCharacterState.loaded);

  const reduceMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const reset = useCallback(() => {
    setAction("idle");
    setMood("neutral");
    setSpeech("");
  }, []);

  const store: CharacterStore = useMemo(
    () => ({
      characterId: defaultCharacterState.characterId,
      action,
      mood,
      speech,
      visible,
      loaded,
      reduceMotion,
      setAction,
      setMood,
      setSpeech,
      setVisible,
      setLoaded,
      reset,
    }),
    [action, mood, speech, visible, loaded, reduceMotion, reset],
  );

  const dispatch = useMemo(
    () => createCharacterDispatch(setAction, setMood, setSpeech),
    [],
  );

  // Log missing character assets in development
  useEffect(() => {
    if (!loaded && visible) {
      console.error("MISSING_CHARACTER_ASSET: No 3D character asset loaded.");
    }
  }, [loaded, visible]);

  return (
    <CharacterContext.Provider value={store}>
      <CharacterDispatchContext.Provider value={dispatch}>
        {children}
      </CharacterDispatchContext.Provider>
    </CharacterContext.Provider>
  );
}
