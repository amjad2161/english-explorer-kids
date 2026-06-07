import type { WorldId } from "../types";

export interface WorldDefinition {
  id: WorldId;
  titleKey: string;
  promptKey: string;
  hubPosition: [number, number, number];
  accentColor: string;
  ambientMusic: string;
  languages: ("en" | "he" | "ar")[];
  ageRange: [number, number];
}

export const worldRegistry: Record<WorldId, WorldDefinition> = {
  hub: {
    id: "hub",
    titleKey: "academy.world.hub",
    promptKey: "academy.prompt.hub",
    hubPosition: [0, 0, 0],
    accentColor: "#f5d76e",
    ambientMusic: "academy-hub",
    languages: ["en", "he", "ar"],
    ageRange: [4, 10],
  },
  citrus: {
    id: "citrus",
    titleKey: "academy.world.citrus",
    promptKey: "academy.prompt.citrus",
    hubPosition: [-14, 2, -6],
    accentColor: "#ff9f43",
    ambientMusic: "citrus-market",
    languages: ["en", "he", "ar"],
    ageRange: [4, 10],
  },
  logic: {
    id: "logic",
    titleKey: "academy.world.logic",
    promptKey: "academy.prompt.logic",
    hubPosition: [14, 2, -6],
    accentColor: "#54a0ff",
    ambientMusic: "logic-lab",
    languages: ["en", "he", "ar"],
    ageRange: [5, 10],
  },
  anatomy: {
    id: "anatomy",
    titleKey: "academy.world.anatomy",
    promptKey: "academy.prompt.anatomy",
    hubPosition: [-10, 3, 10],
    accentColor: "#ff6b9d",
    ambientMusic: "anatomy-explorer",
    languages: ["en", "he", "ar"],
    ageRange: [5, 10],
  },
  science: {
    id: "science",
    titleKey: "academy.world.science",
    promptKey: "academy.prompt.science",
    hubPosition: [10, 3, 10],
    accentColor: "#7bed9f",
    ambientMusic: "science-garden",
    languages: ["en", "he", "ar"],
    ageRange: [4, 10],
  },
  animals: {
    id: "animals",
    titleKey: "academy.world.animals",
    promptKey: "academy.prompt.animals",
    hubPosition: [-18, 1, 8],
    accentColor: "#2ed573",
    ambientMusic: "animals-kingdom",
    languages: ["en", "he", "ar"],
    ageRange: [4, 10],
  },
  music: {
    id: "music",
    titleKey: "academy.world.music",
    promptKey: "academy.prompt.music",
    hubPosition: [18, 1, 8],
    accentColor: "#a55eea",
    ambientMusic: "music-stage",
    languages: ["en", "he", "ar"],
    ageRange: [4, 10],
  },
  feelings: {
    id: "feelings",
    titleKey: "academy.world.feelings",
    promptKey: "academy.prompt.feelings",
    hubPosition: [0, 4, -14],
    accentColor: "#fd79a8",
    ambientMusic: "feelings-world",
    languages: ["en", "he", "ar"],
    ageRange: [4, 10],
  },
  language: {
    id: "language",
    titleKey: "academy.world.language",
    promptKey: "academy.prompt.language",
    hubPosition: [0, 6, 14],
    accentColor: "#00cec9",
    ambientMusic: "language-universe",
    languages: ["en", "he", "ar"],
    ageRange: [5, 10],
  },
  finale: {
    id: "finale",
    titleKey: "academy.world.finale",
    promptKey: "academy.prompt.finale",
    hubPosition: [0, 8, 0],
    accentColor: "#ffeaa7",
    ambientMusic: "academy-finale",
    languages: ["en", "he", "ar"],
    ageRange: [4, 10],
  },
};

export const worldOrder: WorldId[] = [
  "hub",
  "citrus",
  "logic",
  "anatomy",
  "science",
  "animals",
  "music",
  "feelings",
  "language",
  "finale",
];
