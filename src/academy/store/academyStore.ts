import { create } from "zustand";
import type {
  CharacterId,
  InteractionId,
  ProgressMetric,
  TimelineMode,
  WorldId,
} from "../types";
import { getBeatAtTime, getInteractionBeat, masterScript } from "../cinema/masterScript";
import {
  clearAcademySession,
  loadAcademySession,
  saveAcademySession,
} from "./sessionPersistence";

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
  sessionActive: boolean;
  showStartOverlay: boolean;

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
  startSession: (fresh?: boolean) => void;
  resumeSession: () => void;
  resetSession: () => void;
  hydrateFromStorage: () => void;
}

const applyBeat = (sec: number) => {
  const beat = getBeatAtTime(sec);
  return {
    activeWorld: beat.world,
    visibleCharacters: beat.characters,
    activeInteraction: null as InteractionId | null,
    mode: "cinematic" as TimelineMode,
  };
};

function resumeSecAfterInteraction(id: InteractionId): number {
  const idx = masterScript.findIndex((b) => b.interaction === id);
  if (idx >= 0 && idx < masterScript.length - 1) {
    return masterScript[idx + 1].startSec;
  }
  const beat = getInteractionBeat(id);
  return beat ? beat.startSec + 60 : 0;
}

function persist(state: AcademyState) {
  if (!state.sessionActive) return;
  saveAcademySession({
    elapsedSec: state.elapsedSec,
    interactionComplete: [...state.interactionComplete],
    empathyWarmth: state.empathyWarmth,
    heartBpm: state.heartBpm,
    finaleLocksOpen: state.finaleLocksOpen,
    medalEarned: state.medalEarned,
    sessionActive: true,
    updatedAt: Date.now(),
  });
}

const saved = typeof window !== "undefined" ? loadAcademySession() : null;
const hasSavedSession = Boolean(saved?.sessionActive && saved.elapsedSec > 0);

export const useAcademyStore = create<AcademyState>((set, get) => ({
  elapsedSec: 0,
  playing: false,
  mode: "cinematic",
  activeWorld: "hub",
  activeInteraction: null,
  interactionComplete: new Set(saved?.interactionComplete ?? []),
  visibleCharacters: ["cosmo", "adam", "sara"],
  empathyWarmth: saved?.empathyWarmth ?? 0.35,
  heartBpm: saved?.heartBpm ?? 80,
  finaleLocksOpen: saved?.finaleLocksOpen ?? 0,
  medalEarned: saved?.medalEarned ?? false,
  reducedMotion:
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  webglSupported: true,
  lastMetric: null,
  sessionActive: false,
  showStartOverlay: true,

  setPlaying: (v) => {
    set({ playing: v });
    persist(get());
  },

  tick: (deltaSec) => {
    const { playing, mode, elapsedSec, interactionComplete, activeInteraction } = get();
    if (!playing || mode === "interactive" || activeInteraction) return;

    const next = Math.min(elapsedSec + deltaSec, 3600);
    const beat = getBeatAtTime(next);

    if (beat.interaction && !interactionComplete.has(beat.interaction) && next >= beat.startSec) {
      set({
        elapsedSec: beat.startSec,
        ...applyBeat(beat.startSec),
        playing: false,
        activeInteraction: null,
      });
      persist(get());
      return;
    }

    set({ elapsedSec: next, ...applyBeat(next) });
    persist(get());
  },

  seek: (sec) => {
    set({ elapsedSec: sec, ...applyBeat(sec), activeInteraction: null });
    persist(get());
  },

  enterInteraction: (id) => {
    set({ mode: "interactive", activeInteraction: id, playing: false });
    persist(get());
  },

  completeInteraction: (id, metric) => {
    const done = new Set(get().interactionComplete);
    done.add(id);
    const resumeSec = resumeSecAfterInteraction(id);
    set({
      interactionComplete: done,
      lastMetric: metric,
      mode: "cinematic",
      activeInteraction: null,
      playing: true,
      elapsedSec: resumeSec,
      ...applyBeat(resumeSec),
    });
    persist(get());
  },

  setEmpathyWarmth: (v) => {
    set({ empathyWarmth: v });
    persist(get());
  },
  setHeartBpm: (v) => {
    set({ heartBpm: v });
    persist(get());
  },
  openFinaleLock: () => {
    set((s) => ({ finaleLocksOpen: Math.min(3, s.finaleLocksOpen + 1) }));
    persist(get());
  },
  awardMedal: () => {
    set({ medalEarned: true });
    persist(get());
  },
  setReducedMotion: (v) => set({ reducedMotion: v }),
  setWebglSupported: (v) => set({ webglSupported: v }),

  startSession: (fresh = true) => {
    if (fresh) {
      clearAcademySession();
      set({
        elapsedSec: 0,
        playing: true,
        mode: "cinematic",
        activeInteraction: null,
        interactionComplete: new Set(),
        empathyWarmth: 0.35,
        heartBpm: 80,
        finaleLocksOpen: 0,
        medalEarned: false,
        sessionActive: true,
        showStartOverlay: false,
        ...applyBeat(0),
      });
    } else {
      set({ playing: true, sessionActive: true, showStartOverlay: false });
    }
    persist(get());
  },

  resumeSession: () => {
    const session = loadAcademySession();
    if (!session) {
      get().startSession(true);
      return;
    }
    set({
      elapsedSec: session.elapsedSec,
      interactionComplete: new Set(session.interactionComplete),
      empathyWarmth: session.empathyWarmth,
      heartBpm: session.heartBpm,
      finaleLocksOpen: session.finaleLocksOpen,
      medalEarned: session.medalEarned,
      sessionActive: true,
      showStartOverlay: false,
      playing: true,
      activeInteraction: null,
      mode: "cinematic",
      ...applyBeat(session.elapsedSec),
    });
    persist(get());
  },

  resetSession: () => {
    clearAcademySession();
    set({
      elapsedSec: 0,
      playing: false,
      mode: "cinematic",
      activeInteraction: null,
      interactionComplete: new Set(),
      empathyWarmth: 0.35,
      heartBpm: 80,
      finaleLocksOpen: 0,
      medalEarned: false,
      sessionActive: false,
      showStartOverlay: true,
      ...applyBeat(0),
    });
  },

  hydrateFromStorage: () => {
    set({ showStartOverlay: !hasSavedSession });
  },
}));
