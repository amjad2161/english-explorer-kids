export type AcademyLanguage = "en" | "he" | "ar";

export type WorldId =
  | "hub"
  | "citrus"
  | "logic"
  | "anatomy"
  | "science"
  | "animals"
  | "music"
  | "feelings"
  | "language"
  | "finale";

export type CharacterId =
  | "adam"
  | "sara"
  | "cosmo"
  | "pixel"
  | "leo"
  | "hadar"
  | "oz"
  | "silverOwl"
  | "blackOwl"
  | "desertChild"
  | "maia"
  | "amal";

export type CognitiveSkill =
  | "classification"
  | "pattern_recognition"
  | "sequencing"
  | "cause_effect"
  | "spatial_reasoning"
  | "working_memory"
  | "attention"
  | "problem_solving"
  | "strategy"
  | "pre_coding"
  | "decision_making"
  | "creativity"
  | "emotional_reasoning"
  | "safety_awareness"
  | "daily_independence";

export type DifficultyLevel = "intro" | "growing" | "mastery";

export type InteractionId =
  | "room-sort"
  | "kitchen-safety"
  | "street-crossing"
  | "citrus-fractions"
  | "pixel-path"
  | "heart-pulse"
  | "science-garden"
  | "animal-habitats"
  | "rhythm-repeat"
  | "empathy-choice"
  | "word-constellation"
  | "final-locks";

export type TimelineMode = "cinematic" | "interactive" | "paused";

export interface CameraKeyframe {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov?: number;
  duration: number;
}

export interface SceneBeat {
  id: number;
  act: 1 | 2 | 3 | 4 | 5;
  world: WorldId;
  startSec: number;
  endSec: number;
  titleKey: string;
  narrationKey: string;
  camera: CameraKeyframe;
  characters: CharacterId[];
  interaction?: InteractionId;
}

export interface ProgressMetric {
  accuracy: number;
  score: number;
  timeSpentSec: number;
  progress: number;
  difficulty: DifficultyLevel;
  metadata?: Record<string, string | number | boolean>;
}

export interface GameDefinition {
  id: string;
  worldId: WorldId;
  titleKey: string;
  learningGoals: string[];
  cognitiveSkills: CognitiveSkill[];
  ageRange: [number, number];
  fallbackMode: "responsive-html" | "webgl-scene" | "asset-slot";
}
