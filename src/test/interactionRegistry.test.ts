import { describe, it, expect } from "vitest";
import { getInteractionMeta, getPrimarySkill } from "@/academy/registries/interactionRegistry";

describe("interactionRegistry", () => {
  it("maps every interaction to a game id and skills", () => {
    const ids = [
      "room-sort",
      "kitchen-safety",
      "street-crossing",
      "citrus-fractions",
      "pixel-path",
      "heart-pulse",
      "science-garden",
      "animal-habitats",
      "rhythm-repeat",
      "empathy-choice",
      "word-constellation",
      "final-locks",
    ] as const;

    for (const id of ids) {
      const meta = getInteractionMeta(id);
      expect(meta.gameId).toBeTruthy();
      expect(meta.skills.length).toBeGreaterThan(0);
      expect(getPrimarySkill(id)).toBe(meta.skills[0]);
    }
  });

  it("links pixel-path to pixel-path game definition when present", () => {
    const meta = getInteractionMeta("pixel-path");
    expect(meta.gameId).toBe("pixel-path");
  });
});
