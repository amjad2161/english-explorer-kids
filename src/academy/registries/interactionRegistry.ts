import type { CognitiveSkill, InteractionId } from "../types";
import { gameRegistry } from "./gameRegistry";
import type { GameDefinition } from "../types";

const INTERACTION_META: Record<
  InteractionId,
  { gameId: string; skills: CognitiveSkill[] }
> = {
  "room-sort": { gameId: "academy-plaza", skills: ["classification", "spatial_reasoning"] },
  "kitchen-safety": { gameId: "academy-plaza", skills: ["safety_awareness", "decision_making"] },
  "street-crossing": { gameId: "academy-plaza", skills: ["safety_awareness", "attention"] },
  "citrus-fractions": { gameId: "citrus-quality-sort", skills: ["classification", "problem_solving"] },
  "pixel-path": { gameId: "pixel-path", skills: ["pre_coding", "sequencing"] },
  "heart-pulse": { gameId: "anatomy-friendly-explorer", skills: ["cause_effect", "attention"] },
  "science-garden": { gameId: "science-garden-grow", skills: ["cause_effect", "sequencing"] },
  "animal-habitats": { gameId: "animal-habitat-sort", skills: ["classification", "decision_making"] },
  "rhythm-repeat": { gameId: "rhythm-fruit-stage", skills: ["pattern_recognition", "working_memory"] },
  "empathy-choice": { gameId: "feelings-empathy", skills: ["emotional_reasoning", "decision_making"] },
  "word-constellation": { gameId: "language-constellation", skills: ["sequencing", "working_memory"] },
  "final-locks": { gameId: "finale-locks", skills: ["problem_solving", "strategy"] },
};

export function getInteractionMeta(id: InteractionId): {
  gameId: string;
  skills: CognitiveSkill[];
  definition: GameDefinition | undefined;
} {
  const meta = INTERACTION_META[id];
  return {
    ...meta,
    definition: gameRegistry.find((g) => g.id === meta.gameId),
  };
}

export function getPrimarySkill(id: InteractionId): CognitiveSkill {
  return INTERACTION_META[id].skills[0];
}
