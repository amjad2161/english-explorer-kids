import type { SceneBeat } from "../types";

/** 90-scene master timeline — 60 minutes @ 60fps narrative beats */
export const MASTER_DURATION_SEC = 3600;

const cam = (
  position: [number, number, number],
  lookAt: [number, number, number],
  duration = 8,
): SceneBeat["camera"] => ({ position, lookAt, duration, fov: 45 });

export const masterScript: SceneBeat[] = [
  // Act 1 — Morning routine (0–12 min)
  { id: 1, act: 1, world: "hub", startSec: 0, endSec: 75, titleKey: "academy.scene.1", narrationKey: "academy.narration.1", camera: cam([0, 18, 28], [0, 2, 0], 12), characters: ["cosmo", "adam", "sara"] },
  { id: 2, act: 1, world: "hub", startSec: 75, endSec: 130, titleKey: "academy.scene.2", narrationKey: "academy.narration.2", camera: cam([6, 4, 10], [0, 1, 0], 10), characters: ["adam", "pixel"] },
  { id: 3, act: 1, world: "hub", startSec: 130, endSec: 130, titleKey: "academy.scene.3", narrationKey: "academy.narration.3", camera: cam([2, 3, 6], [0, 1, 0], 8), characters: ["adam", "sara"], interaction: "room-sort" },
  { id: 4, act: 1, world: "hub", startSec: 200, endSec: 300, titleKey: "academy.scene.4", narrationKey: "academy.narration.4", camera: cam([-4, 3, 8], [0, 1, 0], 10), characters: ["adam", "amal"] },
  { id: 5, act: 1, world: "hub", startSec: 300, endSec: 300, titleKey: "academy.scene.5", narrationKey: "academy.narration.5", camera: cam([-2, 2.5, 5], [0, 1, 0], 8), characters: ["adam"], interaction: "kitchen-safety" },
  { id: 6, act: 1, world: "hub", startSec: 420, endSec: 552, titleKey: "academy.scene.6", narrationKey: "academy.narration.6", camera: cam([0, 5, 14], [0, 0, 0], 12), characters: ["adam", "sara", "cosmo"] },
  { id: 7, act: 1, world: "hub", startSec: 552, endSec: 552, titleKey: "academy.scene.7", narrationKey: "academy.narration.7", camera: cam([8, 2, 6], [0, 1, 0], 8), characters: ["adam", "sara"], interaction: "street-crossing" },
  { id: 8, act: 1, world: "hub", startSec: 650, endSec: 720, titleKey: "academy.scene.8", narrationKey: "academy.narration.8", camera: cam([-8, 6, 12], [0, 2, 0], 10), characters: ["cosmo", "pixel"] },
  { id: 9, act: 1, world: "citrus", startSec: 720, endSec: 850, titleKey: "academy.scene.9", narrationKey: "academy.narration.9", camera: cam([-14, 5, 4], [-14, 1, -6], 12), characters: ["adam", "sara", "hadar"] },
  { id: 10, act: 1, world: "citrus", startSec: 850, endSec: 850, titleKey: "academy.scene.10", narrationKey: "academy.narration.10", camera: cam([-14, 3, -2], [-14, 1, -6], 8), characters: ["hadar", "adam"], interaction: "citrus-fractions" },

  // Act 2 — Citrus & logic (12–26 min)
  ...Array.from({ length: 20 }, (_, i) => {
    const id = 11 + i;
    const start = 850 + i * 42;
    const world = id <= 18 ? "citrus" : "logic";
    const chars: SceneBeat["characters"] =
      id <= 18 ? ["hadar", "adam", "sara"] : ["pixel", "cosmo", "adam"];
    const interaction = id === 20 ? ("pixel-path" as const) : undefined;
    return {
      id,
      act: 2 as const,
      world,
      startSec: start,
      endSec: interaction ? start : start + 40,
      titleKey: `academy.scene.${id}`,
      narrationKey: `academy.narration.${id}`,
      camera: cam(
        world === "citrus" ? [-14, 4 + (i % 3), -4 + i * 0.2] : [14, 4, -4],
        world === "citrus" ? [-14, 1, -6] : [14, 1, -6],
        8,
      ),
      characters: chars,
      interaction,
    };
  }),

  // Act 3 — Body & nature (26–42 min)
  ...Array.from({ length: 30 }, (_, i) => {
    const id = 31 + i;
    const start = 1560 + i * 32;
    const worlds = ["anatomy", "science", "animals"] as const;
    const world = worlds[Math.floor(i / 10)] ?? "anatomy";
    let interaction: SceneBeat["interaction"];
    if (id === 36) interaction = "heart-pulse";
    if (id === 45) interaction = "science-garden";
    if (id === 52) interaction = "animal-habitats";
    const chars: SceneBeat["characters"] =
      world === "animals" ? ["leo", "adam", "sara"] : ["pixel", "adam", "sara"];
    return {
      id,
      act: 3 as const,
      world,
      startSec: start,
      endSec: interaction ? start : start + 30,
      titleKey: `academy.scene.${id}`,
      narrationKey: `academy.narration.${id}`,
      camera: cam(
        world === "anatomy" ? [-10, 5, 12] : world === "science" ? [10, 5, 12] : [-18, 4, 10],
        [world === "anatomy" ? -10 : world === "science" ? 10 : -18, 1, world === "animals" ? 8 : 10],
        7,
      ),
      characters: chars,
      interaction,
    };
  }),

  // Act 4 — Music, feelings, language (42–53 min)
  ...Array.from({ length: 20 }, (_, i) => {
    const id = 61 + i;
    const start = 2520 + i * 33;
    const worlds = ["music", "feelings", "language"] as const;
    const world = worlds[Math.floor(i / 7)] ?? "music";
    let interaction: SceneBeat["interaction"];
    if (id === 63) interaction = "rhythm-repeat";
    if (id === 68) interaction = "empathy-choice";
    if (id === 72) interaction = "word-constellation";
    const chars: SceneBeat["characters"] =
      world === "music"
        ? ["cosmo", "amal", "adam"]
        : world === "feelings"
          ? ["sara", "adam", "oz"]
          : ["adam", "sara", "amal"];
    return {
      id,
      act: 4 as const,
      world,
      startSec: start,
      endSec: interaction ? start : start + 32,
      titleKey: `academy.scene.${id}`,
      narrationKey: `academy.narration.${id}`,
      camera: cam(
        world === "music" ? [18, 5, 10] : world === "feelings" ? [0, 6, -10] : [0, 8, 16],
        [world === "music" ? 18 : 0, 1, world === "language" ? 14 : -8],
        7,
      ),
      characters: chars,
      interaction,
    };
  }),

  // Act 5 — Finale (53–60 min)
  ...Array.from({ length: 10 }, (_, i) => {
    const id = 81 + i;
    const start = 3180 + i * 42;
    const interaction = id === 84 ? ("final-locks" as const) : undefined;
    return {
      id,
      act: 5 as const,
      world: "finale" as const,
      startSec: start,
      endSec: interaction ? start : start + 40,
      titleKey: `academy.scene.${id}`,
      narrationKey: `academy.narration.${id}`,
      camera: cam([0, 10 + i * 0.5, 20 - i], [0, 4, 0], 10),
      characters: ["adam", "sara", "cosmo", "pixel", "leo", "hadar", "amal"] as SceneBeat["characters"],
      interaction,
    };
  }),
];

export function getBeatAtTime(sec: number): SceneBeat {
  const beat = [...masterScript].reverse().find((b) => sec >= b.startSec);
  return beat ?? masterScript[0];
}

export function getInteractionBeat(id: SceneBeat["interaction"]): SceneBeat | undefined {
  return masterScript.find((b) => b.interaction === id);
}
