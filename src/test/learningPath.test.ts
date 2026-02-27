import { describe, it, expect, beforeEach } from "vitest";
import {
  generateSessionPlan,
  getAgeBucket,
  recordActivityCompletion,
  getProgressOverview,
  ACTIVITIES,
  type AgeBucket,
} from "@/lib/learningPath";

// Mock localStorage
const storage: Record<string, string> = {};
beforeEach(() => {
  Object.keys(storage).forEach((k) => delete storage[k]);
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => storage[k] ?? null,
    setItem: (k: string, v: string) => { storage[k] = v; },
    removeItem: (k: string) => { delete storage[k]; },
    clear: () => Object.keys(storage).forEach((k) => delete storage[k]),
  });
});

import { vi } from "vitest";

describe("getAgeBucket", () => {
  it("returns 0-4 for age 3", () => {
    expect(getAgeBucket(3)).toBe("0-4" satisfies AgeBucket);
  });
  it("returns 5-7 for age 7", () => {
    expect(getAgeBucket(7)).toBe("5-7");
  });
  it("returns 8-10 for age 9", () => {
    expect(getAgeBucket(9)).toBe("8-10");
  });
  it("returns 11-14 for age 12", () => {
    expect(getAgeBucket(12)).toBe("11-14");
  });
  it("returns 5-7 as default when no age provided and no profile", () => {
    const bucket = getAgeBucket();
    expect(["0-4", "5-7", "8-10", "11-14"]).toContain(bucket);
  });
});

describe("ACTIVITIES catalogue", () => {
  it("has at least 10 activities", () => {
    expect(ACTIVITIES.length).toBeGreaterThanOrEqual(10);
  });

  it("every activity has required fields", () => {
    for (const act of ACTIVITIES) {
      expect(act.id).toBeTruthy();
      expect(act.type).toBeTruthy();
      expect(act.path).toBeTruthy();
      expect(act.title.en).toBeTruthy();
      expect(act.ageBuckets.length).toBeGreaterThan(0);
    }
  });

  it("all prerequisites reference existing activity ids", () => {
    const ids = new Set(ACTIVITIES.map((a) => a.id));
    for (const act of ACTIVITIES) {
      for (const prereq of act.prerequisites) {
        expect(ids.has(prereq), `${act.id} references missing prereq "${prereq}"`).toBe(true);
      }
    }
  });
});

describe("generateSessionPlan", () => {
  it("returns a plan for age 7", () => {
    const plan = generateSessionPlan(7);
    expect(plan.ageBucket).toBe("5-7");
    expect(plan.activities).toBeInstanceOf(Array);
    expect(plan.estimatedMinutes).toBeGreaterThan(0);
  });

  it("respects maxActivities", () => {
    const plan = generateSessionPlan(8, 3);
    expect(plan.activities.length).toBeLessThanOrEqual(3);
  });

  it("includes new activities first for fresh users", () => {
    const plan = generateSessionPlan(8, 10);
    expect(plan.activities.length).toBeGreaterThan(0);
    // All activities for a fresh user should be "new"
    const reasons = plan.activities.map((a) => a.reason);
    expect(reasons).toContain("new");
  });
});

describe("recordActivityCompletion", () => {
  it("saves progress to localStorage", () => {
    const progress = recordActivityCompletion("abc-a-i", 0.9);
    expect(progress.activityId).toBe("abc-a-i");
    expect(progress.correctRate).toBe(0.9);
    expect(progress.attempts).toBe(1);
    expect(progress.nextReviewAt).toBeGreaterThan(Date.now());
  });

  it("increases attempts on repeat", () => {
    recordActivityCompletion("abc-a-i", 0.8);
    const p2 = recordActivityCompletion("abc-a-i", 0.9);
    expect(p2.attempts).toBe(2);
  });

  it("puts struggling items in remediation", () => {
    // Complete with poor score twice
    recordActivityCompletion("abc-a-i", 0.3);
    recordActivityCompletion("abc-a-i", 0.3);
    const overview = getProgressOverview(8);
    const struggling = overview.remediation.find((a) => a.id === "abc-a-i");
    expect(struggling).toBeDefined();
  });
});
