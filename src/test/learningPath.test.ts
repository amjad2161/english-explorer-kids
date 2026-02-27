import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAgeBand,
  nextInterval,
  isDueForReview,
  checkPrerequisites,
  getAvailableObjectives,
  analyzeErrors,
  generateDailyPlan,
  updateMastery,
  FOUNDATION_OBJECTIVES,
  type MasteryRecord,
} from "@/lib/learningPath";

describe("learningPath", () => {
  describe("getAgeBand", () => {
    it("returns 0-3 for ages 0–3", () => {
      expect(getAgeBand(0)).toBe("0-3");
      expect(getAgeBand(2)).toBe("0-3");
      expect(getAgeBand(3)).toBe("0-3");
    });

    it("returns 4-6 for ages 4–6", () => {
      expect(getAgeBand(4)).toBe("4-6");
      expect(getAgeBand(6)).toBe("4-6");
    });

    it("returns 7-10 for ages 7–10", () => {
      expect(getAgeBand(7)).toBe("7-10");
      expect(getAgeBand(10)).toBe("7-10");
    });

    it("returns 11-14 for ages 11+", () => {
      expect(getAgeBand(11)).toBe("11-14");
      expect(getAgeBand(14)).toBe("11-14");
    });
  });

  describe("nextInterval (spaced repetition)", () => {
    it("resets to 1 hour on incorrect answer", () => {
      expect(nextInterval(24, false)).toBe(1);
      expect(nextInterval(168, false)).toBe(1);
    });

    it("advances to next interval on correct answer", () => {
      expect(nextInterval(1, true)).toBe(4);
      expect(nextInterval(4, true)).toBe(12);
      expect(nextInterval(12, true)).toBe(24);
    });

    it("stays at max interval when already at max", () => {
      expect(nextInterval(168, true)).toBe(168);
    });
  });

  describe("isDueForReview", () => {
    it("returns true when enough time has passed", () => {
      const record: MasteryRecord = {
        objectiveId: "test",
        score: 0.8,
        attempts: 5,
        correct: 4,
        lastPracticed: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
        intervalHours: 4,
        errorTypes: [],
      };
      expect(isDueForReview(record)).toBe(true);
    });

    it("returns false when not enough time has passed", () => {
      const record: MasteryRecord = {
        objectiveId: "test",
        score: 0.8,
        attempts: 5,
        correct: 4,
        lastPracticed: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
        intervalHours: 4,
        errorTypes: [],
      };
      expect(isDueForReview(record)).toBe(false);
    });
  });

  describe("checkPrerequisites", () => {
    it("returns true for objectives with no prerequisites", () => {
      const mastery = new Map<string, MasteryRecord>();
      expect(checkPrerequisites("vc-animals", mastery)).toBe(true);
    });

    it("returns false when prerequisites are not met", () => {
      const mastery = new Map<string, MasteryRecord>();
      expect(checkPrerequisites("ph-sounds", mastery)).toBe(false);
    });

    it("returns true when prerequisites are mastered", () => {
      const mastery = new Map<string, MasteryRecord>();
      mastery.set("ph-letters", {
        objectiveId: "ph-letters",
        score: 0.8,
        attempts: 10,
        correct: 8,
        lastPracticed: Date.now(),
        intervalHours: 24,
        errorTypes: [],
      });
      expect(checkPrerequisites("ph-sounds", mastery)).toBe(true);
    });

    it("returns false when prerequisite score is below threshold", () => {
      const mastery = new Map<string, MasteryRecord>();
      mastery.set("ph-letters", {
        objectiveId: "ph-letters",
        score: 0.5,
        attempts: 10,
        correct: 5,
        lastPracticed: Date.now(),
        intervalHours: 1,
        errorTypes: [],
      });
      expect(checkPrerequisites("ph-sounds", mastery)).toBe(false);
    });
  });

  describe("getAvailableObjectives", () => {
    it("returns age-appropriate objectives for a toddler", () => {
      const mastery = new Map<string, MasteryRecord>();
      const available = getAvailableObjectives(2, mastery);
      // Should include vocabulary and listening basics, not grammar
      const ids = available.map((o) => o.id);
      expect(ids).toContain("vc-animals");
      expect(ids).toContain("vc-colors");
      expect(ids).toContain("ls-commands");
      expect(ids).not.toContain("gr-be");
      expect(ids).not.toContain("ph-letters");
    });

    it("excludes fully mastered objectives", () => {
      const mastery = new Map<string, MasteryRecord>();
      mastery.set("vc-animals", {
        objectiveId: "vc-animals",
        score: 0.96,
        attempts: 50,
        correct: 48,
        lastPracticed: Date.now(),
        intervalHours: 168,
        errorTypes: [],
      });
      const available = getAvailableObjectives(5, mastery);
      expect(available.map((o) => o.id)).not.toContain("vc-animals");
    });
  });

  describe("analyzeErrors", () => {
    it("identifies objectives needing remediation", () => {
      const records: MasteryRecord[] = [
        {
          objectiveId: "ph-letters",
          score: 0.3,
          attempts: 10,
          correct: 3,
          lastPracticed: Date.now(),
          intervalHours: 1,
          errorTypes: ["confusion_b_d"],
        },
      ];
      const analysis = analyzeErrors(records);
      expect(analysis.needsRemediation).toContain("ph-letters");
    });

    it("identifies weak domains", () => {
      const records: MasteryRecord[] = [
        {
          objectiveId: "ph-letters",
          score: 0.4,
          attempts: 10,
          correct: 4,
          lastPracticed: Date.now(),
          intervalHours: 1,
          errorTypes: [],
        },
        {
          objectiveId: "ph-sounds",
          score: 0.3,
          attempts: 5,
          correct: 2,
          lastPracticed: Date.now(),
          intervalHours: 1,
          errorTypes: [],
        },
      ];
      const analysis = analyzeErrors(records);
      expect(analysis.weakDomains).toContain("phonics");
    });
  });

  describe("generateDailyPlan", () => {
    it("generates a plan with warmup, teach, practice, game, review sections", () => {
      const mastery = new Map<string, MasteryRecord>();
      const plan = generateDailyPlan(5, mastery);
      expect(plan).toHaveProperty("warmup");
      expect(plan).toHaveProperty("teach");
      expect(plan).toHaveProperty("practice");
      expect(plan).toHaveProperty("game");
      expect(plan).toHaveProperty("review");
    });

    it("includes new items in teach section for fresh learner", () => {
      const mastery = new Map<string, MasteryRecord>();
      const plan = generateDailyPlan(5, mastery, "lesson");
      expect(plan.teach.length).toBeGreaterThan(0);
    });
  });

  describe("updateMastery", () => {
    it("creates new record for first attempt", () => {
      const mastery = new Map<string, MasteryRecord>();
      const updated = updateMastery(mastery, "vc-animals", true);
      const record = updated.get("vc-animals");
      expect(record).toBeDefined();
      expect(record!.attempts).toBe(1);
      expect(record!.correct).toBe(1);
      expect(record!.score).toBe(1);
    });

    it("updates existing record correctly", () => {
      let mastery = new Map<string, MasteryRecord>();
      mastery = updateMastery(mastery, "vc-animals", true);
      mastery = updateMastery(mastery, "vc-animals", false);
      const record = mastery.get("vc-animals");
      expect(record!.attempts).toBe(2);
      expect(record!.correct).toBe(1);
      expect(record!.score).toBe(0.5);
    });

    it("tracks error types", () => {
      const mastery = new Map<string, MasteryRecord>();
      const updated = updateMastery(mastery, "ph-letters", false, "confusion_b_d");
      const record = updated.get("ph-letters");
      expect(record!.errorTypes).toContain("confusion_b_d");
    });
  });
});
