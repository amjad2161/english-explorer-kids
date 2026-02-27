import { describe, it, expect, beforeEach } from "vitest";
import { getXP, addXP, getLevel } from "@/lib/xp";
import { getStageProgress, saveStageProgress, getTotalEarnedStars } from "@/lib/levels";
import { getProgress, addCompletedLetter, addCompletedWord } from "@/lib/progress";
import { checkAchievements } from "@/lib/achievements";

// ─── XP System ───────────────────────────────────────────────────────────────

describe("XP system", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts at zero XP", () => {
    const state = getXP();
    expect(state.totalXP).toBe(0);
    expect(state.streak).toBe(0);
  });

  it("adds XP correctly", () => {
    const state = addXP(50);
    expect(state.totalXP).toBe(50);
  });

  it("accumulates XP across multiple calls", () => {
    addXP(30);
    addXP(20);
    const state = getXP();
    expect(state.totalXP).toBe(50);
  });

  it("increments streak on first daily XP", () => {
    const state = addXP(10);
    expect(state.streak).toBe(1);
  });
});

// ─── Level System ────────────────────────────────────────────────────────────

describe("getLevel", () => {
  it("returns level 1 for zero XP", () => {
    expect(getLevel(0).level).toBe(1);
  });

  it("advances to level 2 at 50 XP", () => {
    expect(getLevel(50).level).toBe(2);
  });

  it("advances to level 3 at 150 XP", () => {
    expect(getLevel(150).level).toBe(3);
  });

  it("returns correct current and needed values", () => {
    const { current, needed } = getLevel(60);
    expect(needed).toBe(100); // 150 - 50 = 100
    expect(current).toBe(10); // 60 - 50 = 10
  });

  it("has a title for every level", () => {
    const xpValues = [0, 50, 150, 300, 500, 800, 1200, 1800, 2500, 3500, 5000];
    for (const xp of xpValues) {
      expect(getLevel(xp).title.length).toBeGreaterThan(0);
    }
  });
});

// ─── Stage Progress ──────────────────────────────────────────────────────────

describe("Stage progress", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns default uncompleted state for unknown stage", () => {
    const p = getStageProgress("test-stage");
    expect(p.starsEarned).toBe(0);
    expect(p.completed).toBe(false);
  });

  it("saves and retrieves stage progress", () => {
    saveStageProgress("1-1", 3);
    const p = getStageProgress("1-1");
    expect(p.starsEarned).toBe(3);
    expect(p.completed).toBe(true);
  });

  it("only improves star count (never decreases)", () => {
    saveStageProgress("1-1", 4);
    saveStageProgress("1-1", 2); // worse score
    const p = getStageProgress("1-1");
    expect(p.starsEarned).toBe(4); // still highest
  });

  it("is idempotent when saving the same score twice", () => {
    saveStageProgress("1-1", 4);
    saveStageProgress("1-1", 4); // same score again
    const p = getStageProgress("1-1");
    expect(p.starsEarned).toBe(4);
    expect(getTotalEarnedStars()).toBe(4); // counted only once
  });

  it("counts total earned stars across stages", () => {
    saveStageProgress("1-1", 3);
    saveStageProgress("1-2", 5);
    expect(getTotalEarnedStars()).toBe(8);
  });
});

// ─── Learning Progress ───────────────────────────────────────────────────────

describe("Learning progress", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts empty", () => {
    const p = getProgress();
    expect(p.completedLetters).toHaveLength(0);
    expect(p.completedWords).toHaveLength(0);
  });

  it("adds completed letters without duplicates", () => {
    addCompletedLetter("A");
    addCompletedLetter("A"); // duplicate
    addCompletedLetter("B");
    const p = getProgress();
    expect(p.completedLetters).toHaveLength(2);
    expect(p.completedLetters).toContain("A");
    expect(p.completedLetters).toContain("B");
  });

  it("adds completed words without duplicates", () => {
    addCompletedWord("cat");
    addCompletedWord("cat"); // duplicate
    addCompletedWord("dog");
    const p = getProgress();
    expect(p.completedWords).toHaveLength(2);
  });
});

// ─── Achievements ────────────────────────────────────────────────────────────

describe("Achievements", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty array when no achievements unlocked", () => {
    const newOnes = checkAchievements();
    expect(newOnes).toHaveLength(0); // No stars earned yet
  });

  it("unlocks star achievement after earning enough stars", () => {
    saveStageProgress("1-1", 5); // 5 stars from one stage
    const newOnes = checkAchievements();
    const ids = newOnes.map(a => a.id);
    expect(ids).toContain("stars_5");
  });

  it("does not re-unlock already unlocked achievements", () => {
    saveStageProgress("1-1", 5);
    checkAchievements(); // first call unlocks
    const secondCall = checkAchievements(); // should not unlock again
    expect(secondCall).toHaveLength(0);
  });
});
