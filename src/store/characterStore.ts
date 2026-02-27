import { create } from "zustand";

export type CharacterAnimation = "idle" | "wave" | "celebrate" | "walk" | "jump";

interface CharacterState {
  animation: CharacterAnimation;
  visible: boolean;
  characterFile: string;
  setAnimation: (animation: CharacterAnimation) => void;
  setVisible: (visible: boolean) => void;
  setCharacterFile: (file: string) => void;
}

export const useCharacterStore = create<CharacterState>((set) => ({
  animation: "idle",
  visible: true,
  characterFile: "default.glb",
  setAnimation: (animation) => set({ animation }),
  setVisible: (visible) => set({ visible }),
  setCharacterFile: (characterFile) => set({ characterFile }),
}));
