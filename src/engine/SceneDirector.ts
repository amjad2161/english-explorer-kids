import { create } from "zustand";

// ---------------------------------------------------------------------------
// Scene Director — controls camera, lighting, and active stage
// ---------------------------------------------------------------------------

export type StageId = "forest" | "classroom" | "snowMountain" | "jungle";

export type CameraPreset = "close" | "medium" | "wide";

export interface LightingRig {
  keyIntensity: number;
  keyColor: string;
  fillIntensity: number;
  fillColor: string;
  rimIntensity: number;
  rimColor: string;
  ambientIntensity: number;
  ambientColor: string;
}

const LIGHTING_RIGS: Record<StageId, LightingRig> = {
  forest: {
    keyIntensity: 1.2, keyColor: "#ffe8c0",
    fillIntensity: 0.4, fillColor: "#9dd6a0",
    rimIntensity: 0.6, rimColor: "#ffd700",
    ambientIntensity: 0.35, ambientColor: "#e8f5e9",
  },
  classroom: {
    keyIntensity: 1.0, keyColor: "#fff5e6",
    fillIntensity: 0.5, fillColor: "#e3d5ca",
    rimIntensity: 0.3, rimColor: "#ffecd2",
    ambientIntensity: 0.5, ambientColor: "#fff8f0",
  },
  snowMountain: {
    keyIntensity: 1.4, keyColor: "#e8f0ff",
    fillIntensity: 0.3, fillColor: "#b0c4de",
    rimIntensity: 0.8, rimColor: "#ffffff",
    ambientIntensity: 0.45, ambientColor: "#f0f4ff",
  },
  jungle: {
    keyIntensity: 0.9, keyColor: "#ffe0a0",
    fillIntensity: 0.5, fillColor: "#66bb6a",
    rimIntensity: 0.4, rimColor: "#ff8a65",
    ambientIntensity: 0.3, ambientColor: "#c8e6c9",
  },
};

const CAMERA_POSITIONS: Record<CameraPreset, [number, number, number]> = {
  close: [0, 1.5, 4],
  medium: [0, 2.5, 8],
  wide: [0, 4, 14],
};

const ROUTE_TO_STAGE: Record<string, StageId> = {
  "/": "forest",
  "/levels": "classroom",
  "/alphabet": "classroom",
  "/words": "classroom",
  "/quiz": "classroom",
  "/abc-animals": "jungle",
  "/animal-match": "jungle",
  "/memory": "forest",
  "/spelling": "classroom",
  "/scramble": "classroom",
  "/hangman": "snowMountain",
  "/pattern": "snowMountain",
  "/story": "forest",
  "/achievements": "forest",
  "/stats": "classroom",
  "/settings": "classroom",
  "/report": "classroom",
  "/parent": "classroom",
};

interface SceneDirectorState {
  activeStage: StageId;
  previousStage: StageId | null;
  cameraPreset: CameraPreset;
  cameraPosition: [number, number, number];
  lighting: LightingRig;
  isTransitioning: boolean;
  transitionProgress: number;

  setStageForRoute: (path: string) => void;
  setCameraPreset: (p: CameraPreset) => void;
  setTransitioning: (v: boolean) => void;
  setTransitionProgress: (v: number) => void;
}

export const useSceneDirector = create<SceneDirectorState>((set, get) => ({
  activeStage: "forest",
  previousStage: null,
  cameraPreset: "medium",
  cameraPosition: CAMERA_POSITIONS.medium,
  lighting: LIGHTING_RIGS.forest,
  isTransitioning: false,
  transitionProgress: 0,

  setStageForRoute: (path) => {
    const stage = ROUTE_TO_STAGE[path] || "forest";
    const current = get().activeStage;
    if (stage === current) return;
    set({
      previousStage: current,
      activeStage: stage,
      lighting: LIGHTING_RIGS[stage],
      isTransitioning: true,
      transitionProgress: 0,
    });
    // Auto-complete transition
    setTimeout(() => set({ isTransitioning: false, transitionProgress: 1 }), 800);
  },

  setCameraPreset: (p) => set({
    cameraPreset: p,
    cameraPosition: CAMERA_POSITIONS[p],
  }),

  setTransitioning: (v) => set({ isTransitioning: v }),
  setTransitionProgress: (v) => set({ transitionProgress: v }),
}));

export { LIGHTING_RIGS, CAMERA_POSITIONS, ROUTE_TO_STAGE };
