import { describe, expect, it } from "vitest";
import { buildGameResult } from "@/academy/interactions/shared/gameTypes";

describe("buildGameResult", () => {
  it("clamps accuracy and computes elapsed seconds", () => {
    const startedAt = Date.now() - 5000;
    const result = buildGameResult(startedAt, 1.5, 120, { ok: true });
    expect(result.accuracy).toBe(1);
    expect(result.score).toBe(120);
    expect(result.progress).toBe(1);
    expect(result.timeSpentSec).toBeGreaterThanOrEqual(5);
    expect(result.metadata).toEqual({ ok: true });
  });
});
