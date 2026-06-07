import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushQueue, getAcademyProgressSnapshot, recordProgress } from "@/academy/progress/progressAdapter";

describe("progressAdapter", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("navigator", { onLine: true });
  });

  it("records progress and persists snapshot", () => {
    const metric = recordProgress("pixel-path", "sequencing", {
      accuracy: 0.9,
      score: 90,
      timeSpentSec: 12,
      progress: 1,
    });

    expect(metric.score).toBe(90);
    const snapshot = getAcademyProgressSnapshot();
    expect(snapshot["pixel-path"]?.score).toBe(90);
  });

  it("keeps queue empty after immediate online sync", async () => {
    recordProgress("finale-locks", "problem_solving", {
      accuracy: 1,
      score: 100,
      timeSpentSec: 5,
    });

    const result = await flushQueue();
    expect(result.pending).toBe(0);
    expect(getAcademyProgressSnapshot()["finale-locks"]?.score).toBe(100);
  });

  it("defers flush while offline", async () => {
    vi.stubGlobal("navigator", { onLine: false });
    localStorage.setItem("kidgenius.offlineProgressQueue", JSON.stringify([
      {
        gameId: "pixel-path",
        skill: "sequencing",
        metric: { accuracy: 0.8, score: 80, timeSpentSec: 10, progress: 1, difficulty: "growing" },
        timestamp: 999,
      },
    ]));

    const result = await flushQueue();
    expect(result.flushed).toBe(0);
    expect(result.pending).toBe(1);
  });
});
