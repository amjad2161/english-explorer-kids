import { create } from "zustand";

// ---------------------------------------------------------------------------
// Quality Tiers — controls rendering fidelity across the cinematic engine
// ---------------------------------------------------------------------------

export type QualityTier = "low" | "med" | "high";

interface QualitySettings {
  shadows: boolean;
  shadowMapSize: number;
  postprocessing: boolean;
  particleCount: number;
  textureSize: number;
  antialias: boolean;
  dpr: [number, number];
  envMapIntensity: number;
}

const TIER_PRESETS: Record<QualityTier, QualitySettings> = {
  low: {
    shadows: false,
    shadowMapSize: 512,
    postprocessing: false,
    particleCount: 20,
    textureSize: 256,
    antialias: false,
    dpr: [1, 1],
    envMapIntensity: 0.3,
  },
  med: {
    shadows: true,
    shadowMapSize: 1024,
    postprocessing: false,
    particleCount: 60,
    textureSize: 512,
    antialias: true,
    dpr: [1, 1.5],
    envMapIntensity: 0.6,
  },
  high: {
    shadows: true,
    shadowMapSize: 2048,
    postprocessing: true,
    particleCount: 120,
    textureSize: 1024,
    antialias: true,
    dpr: [1, 2],
    envMapIntensity: 1.0,
  },
};

interface QualityStore {
  tier: QualityTier;
  settings: QualitySettings;
  setTier: (t: QualityTier) => void;
  reduceMotion: boolean;
  setReduceMotion: (v: boolean) => void;
}

const detectTier = (): QualityTier => {
  if (typeof navigator === "undefined") return "med";
  const cores = navigator.hardwareConcurrency || 2;
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;
  if (cores <= 2 || mem <= 2) return "low";
  if (cores >= 8 && mem >= 8) return "high";
  return "med";
};

const STORAGE_KEY = "english-fun-quality";

const loadTier = (): QualityTier => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "low" || saved === "med" || saved === "high") return saved;
  } catch { /* intentional */ }
  return detectTier();
};

export const useQualityStore = create<QualityStore>((set) => {
  const initial = loadTier();
  return {
    tier: initial,
    settings: TIER_PRESETS[initial],
    setTier: (t) => {
      localStorage.setItem(STORAGE_KEY, t);
      set({ tier: t, settings: TIER_PRESETS[t] });
    },
    reduceMotion: typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
    setReduceMotion: (v) => set({ reduceMotion: v }),
  };
});
