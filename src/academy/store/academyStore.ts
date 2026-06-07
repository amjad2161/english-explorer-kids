import { create } from "zustand";
import type {
  CharacterId,
  InteractionId,
  ProgressMetric,
  TimelineMode,
  WorldId,
} from "../types";
import { getBeatAtTime } from "../cinema/masterScript";

interface AcademyState {
  elapsedSec: number;
  playing: boolean;
  mode: TimelineMode;
  activeWorld: WorldId;
  activeInteraction: InteractionId | null;
  interactionComplete: Set<InteractionId>;
  visibleCharacters: CharacterId[];
  empathyWarmth: number;
  heartBpm: number;
  finaleLocksOpen: number;
  medalEarned: boolean;
  reducedMotion: boolean;
  webglSupported: boolean;
  lastMetric: ProgressMetric | null;

  setPlaying: (v: boolean) => void;
  tick: (deltaSec: number) => void;
  seek: (sec: number) => void;
  enterInteraction: (id: InteractionId) => void;
  completeInteraction: (id: InteractionId, metric: ProgressMetric) => void;
  setEmpathyWarmth: (v: number) => void;
  setHeartBpm: (v: number) => void;
  openFinaleLock: () => void;
  awardMedal: () => void;
  setReducedMotion: (v: boolean) => void;
  setWebglSupported: (v: boolean) => void;
}

const applyBeat = (sec: number) => {
  const beat = getBeatAtTime(sec);
  return {
    activeWorld: beat.world,
    visibleCharacters: beat.characters,
    activeInteraction: beat.interaction ?? null,
    mode: beat.interaction ? ("interactive" as TimelineMode) : ("cinematic" as TimelineMode),
  };
};

export const useAcademyStore = create<AcademyState>((set, get) => ({
  elapsedSec: 0,
  playing: true,
  mode: "cinematic",
  activeWorld: "hub",
  activeInteraction: null,
  interactionComplete: new Set(),
  visibleCharacters: ["cosmo", "adam", "sara"],
  empathyWarmth: 0.35,
  heartBpm: 80,
  finaleLocksOpen: 0,
  medalEarned: false,
  reducedMotion: typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  webglSupported: true,
  lastMetric: null,

  setPlaying: (v) => set({ playing: v }),

  tick: (deltaSec) => {
    const { playing, mode, elapsedSec, activeInteraction, interactionComplete } = get();
    if (!playing || mode === "interactive") return;
    const next = Math.min(elapsedSec + deltaSec, 3600);
    const beat = getBeatAtTime(next);
    if (beat.interaction && !interactionComplete.has(beat.interaction)) {
      set({ elapsedSec: beat.startSec, ...applyBeat(beat.startSec), mode: "interactive", activeInteraction: beat.interaction });
      return;
    }
    set({ elapsedSec: next, ...applyBeat(next) });
  },

  seek: (sec) => set({ elapsedSec: sec, ...applyBeat(sec) }),

  enterInteraction: (id) => set({ mode: "interactive", activeInteraction: id, playing: false }),

  completeInteraction: (id, metric) => {
    const done = new Set(get().interactionComplete);
    done.add(id);
    set({
      interactionComplete: done,
      lastMetric: metric,
      mode: "cinematic",
      activeInteraction: null,
      playing: true,
    });
  },

  setEmpathyWarmth: (v) => set({ empathyWarmth: v }),
  setHeartBpm: (v) => set({ heartBpm: v }),
  openFinaleLock: () => set((s) => ({ finaleLocksOpen: Math.min(3, s.finaleLocksOpen + 1) })),
  awardMedal: () => set({ medalEarned: true }),
  setReducedMotion: (v) => set({ reducedMotion: v }),
  setWebglSupported: (v) => set({ webglSupported: v }),
}));
