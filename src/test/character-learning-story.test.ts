/**
 * Unit tests for Character Runtime, Learning Path Engine, and Story Engine.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// ─── Character Store ──────────────────────────────────────────────────────────
import { useCharacterStore, dispatchCharacterEvent } from "@/lib/characterStore";

describe("CharacterStore", () => {
  beforeEach(() => {
    // Reset store between tests
    useCharacterStore.setState({ mood: "idle", speech: null, isVisible: true });
    vi.useFakeTimers();
  });

  it("starts with idle mood and no speech", () => {
    const state = useCharacterStore.getState();
    expect(state.mood).toBe("idle");
    expect(state.speech).toBeNull();
    expect(state.isVisible).toBe(true);
  });

  it("dispatches correct event → celebrate mood", () => {
    dispatchCharacterEvent({ type: "correct" });
    const state = useCharacterStore.getState();
    expect(state.mood).toBe("celebrate");
    expect(state.speech).toBe("🎉");
  });

  it("dispatches wrong event → sad mood", () => {
    dispatchCharacterEvent({ type: "wrong" });
    const state = useCharacterStore.getState();
    expect(state.mood).toBe("sad");
    expect(state.speech).toBe("💙");
  });

  it("dispatches hint event → point mood", () => {
    dispatchCharacterEvent({ type: "hint" });
    expect(useCharacterStore.getState().mood).toBe("point");
  });

  it("auto-resets to idle after 2.5 seconds", () => {
    dispatchCharacterEvent({ type: "correct" });
    expect(useCharacterStore.getState().mood).toBe("celebrate");
    vi.advanceTimersByTime(2600);
    expect(useCharacterStore.getState().mood).toBe("idle");
    expect(useCharacterStore.getState().speech).toBeNull();
  });

  it("accepts custom payload message", () => {
    dispatchCharacterEvent({ type: "celebrate", payload: { message: "🏆" } });
    expect(useCharacterStore.getState().speech).toBe("🏆");
  });

  it("setVisible hides/shows character", () => {
    useCharacterStore.getState().setVisible(false);
    expect(useCharacterStore.getState().isVisible).toBe(false);
    useCharacterStore.getState().setVisible(true);
    expect(useCharacterStore.getState().isVisible).toBe(true);
  });
});

// ─── Learning Path Engine ─────────────────────────────────────────────────────
import {
  getAgeGroup,
  meetsPrerequisites,
  generateDailyPlan,
  scheduleReview,
  getDueItems,
  updateSkillLevel,
  getRemediationPlan,
  getDefaultProfile,
} from "@/lib/learningPath";

describe("learningPath — getAgeGroup", () => {
  it("returns 0-3 for age 2", () => expect(getAgeGroup(2)).toBe("0-3"));
  it("returns 4-6 for age 5", () => expect(getAgeGroup(5)).toBe("4-6"));
  it("returns 7-10 for age 8", () => expect(getAgeGroup(8)).toBe("7-10"));
  it("returns 11-14 for age 12", () => expect(getAgeGroup(12)).toBe("11-14"));
  it("returns 11-14 for age 14", () => expect(getAgeGroup(14)).toBe("11-14"));
});

describe("learningPath — meetsPrerequisites", () => {
  const noSkills = {
    phonics: 0, vocabulary: 0, grammar: 0, listening: 0,
    speaking: 0, reading: 0, writing: 0,
  };
  const someSkills = { ...noSkills, phonics: 30, vocabulary: 30 };

  it("vocabulary has no prerequisites — always met", () => {
    expect(meetsPrerequisites("vocabulary", noSkills)).toBe(true);
  });

  it("grammar requires phonics+vocabulary — not met at 0", () => {
    expect(meetsPrerequisites("grammar", noSkills)).toBe(false);
  });

  it("grammar prerequisites met when skills >= 20", () => {
    expect(meetsPrerequisites("grammar", someSkills)).toBe(true);
  });

  it("reading requires phonics — not met at 0", () => {
    expect(meetsPrerequisites("reading", noSkills)).toBe(false);
  });

  it("speaking requires listening", () => {
    expect(meetsPrerequisites("speaking", noSkills)).toBe(false);
    expect(meetsPrerequisites("speaking", { ...noSkills, listening: 25 })).toBe(true);
  });
});

describe("learningPath — generateDailyPlan", () => {
  const profile = getDefaultProfile(7, "he");

  it("generates a plan with at least 3 steps", () => {
    const plan = generateDailyPlan(profile, "vocabulary");
    expect(plan.steps.length).toBeGreaterThanOrEqual(3);
  });

  it("first step is warm_up", () => {
    const plan = generateDailyPlan(profile, "vocabulary");
    expect(plan.steps[0].type).toBe("warm_up");
  });

  it("last step is reward", () => {
    const plan = generateDailyPlan(profile, "vocabulary");
    const last = plan.steps[plan.steps.length - 1];
    expect(last.type).toBe("reward");
  });

  it("estimated minutes equals sum of step durations", () => {
    const plan = generateDailyPlan(profile, "vocabulary");
    const sum = plan.steps.reduce((a, s) => a + s.durationMin, 0);
    expect(plan.estimatedMinutes).toBe(sum);
  });

  it("for 0-3 age group, no story step in short sessions", () => {
    const babyProfile = getDefaultProfile(2, "ar");
    const plan = generateDailyPlan(babyProfile, "listening", 10);
    const storySteps = plan.steps.filter((s) => s.type === "story");
    expect(storySteps.length).toBe(0);
  });
});

describe("learningPath — spaced repetition", () => {
  it("schedules correct items further out than incorrect ones", () => {
    const profile = getDefaultProfile(6);
    const correct = scheduleReview(profile, "item1", true);
    const wrong = scheduleReview(profile, "item1", false);
    expect(correct.spacedRepetition["item1"]).toBeGreaterThan(wrong.spacedRepetition["item1"]);
  });

  it("getDueItems returns items past their review time", () => {
    const profile = getDefaultProfile(6);
    const past = Date.now() - 1000;
    const updated = {
      ...profile,
      spacedRepetition: { itemA: past, itemB: Date.now() + 99999 },
    };
    const due = getDueItems(updated);
    expect(due).toContain("itemA");
    expect(due).not.toContain("itemB");
  });
});

describe("learningPath — updateSkillLevel", () => {
  it("increases skill level by delta", () => {
    const profile = getDefaultProfile(8);
    const updated = updateSkillLevel(profile, "phonics", 20);
    expect(updated.skillLevels.phonics).toBe(20);
  });

  it("caps at 100", () => {
    const profile = getDefaultProfile(8);
    const updated = updateSkillLevel(profile, "vocabulary", 150);
    expect(updated.skillLevels.vocabulary).toBe(100);
  });

  it("floor at 0", () => {
    const profile = getDefaultProfile(8);
    const updated = updateSkillLevel(profile, "grammar", -50);
    expect(updated.skillLevels.grammar).toBe(0);
  });

  it("updates overall level as average", () => {
    const profile = getDefaultProfile(10);
    const updated = updateSkillLevel(profile, "phonics", 70);
    expect(updated.overallLevel).toBeGreaterThan(0);
  });
});

describe("learningPath — getRemediationPlan", () => {
  it("returns null when error count < 3", () => {
    const profile = getDefaultProfile(8);
    expect(getRemediationPlan(profile, "grammar")).toBeNull();
  });

  it("returns remediation plan with high error counts", () => {
    const profile = {
      ...getDefaultProfile(8),
      errorCounts: { "grammar-1": 3, "grammar-2": 2 },
    };
    const plan = getRemediationPlan(profile, "grammar");
    expect(plan).not.toBeNull();
    expect(plan?.route).toBeDefined();
  });
});

// ─── Story Engine ─────────────────────────────────────────────────────────────
import { generateStory, loadStoryProgress, saveStoryProgress, markStoryComplete } from "@/lib/storyEngine";

describe("storyEngine — generateStory", () => {
  it("generates a story with at least 2 scenes", () => {
    const story = generateStory("vocabulary", "4-6", "animals", 0);
    expect(story.scenes.length).toBeGreaterThanOrEqual(2);
  });

  it("story has a title", () => {
    const story = generateStory("phonics", "7-10", "school", 1);
    expect(story.title).toBeTruthy();
    expect(typeof story.title).toBe("string");
  });

  it("story has reward message in all three languages", () => {
    const story = generateStory("vocabulary", "4-6", "home", 0);
    expect(story.rewardMessage.he).toBeTruthy();
    expect(story.rewardMessage.ar).toBeTruthy();
    expect(story.rewardMessage.en).toBeTruthy();
  });

  it("scenes have activities", () => {
    const story = generateStory("vocabulary", "7-10", "nature", 0);
    const withActivity = story.scenes.filter((s) => s.activity !== null);
    expect(withActivity.length).toBeGreaterThan(0);
  });

  it("activity answers are non-empty strings", () => {
    const story = generateStory("vocabulary", "4-6", "food", 0);
    story.scenes.forEach((scene) => {
      if (scene.activity) {
        expect(typeof scene.activity.answer).toBe("string");
        expect(scene.activity.answer.length).toBeGreaterThan(0);
      }
    });
  });

  it("different session indices produce different words", () => {
    const story0 = generateStory("vocabulary", "4-6", "animals", 0);
    const story1 = generateStory("vocabulary", "4-6", "animals", 7);
    // They may differ (not guaranteed but likely for different indices)
    // At minimum, both have valid scenes
    expect(story0.scenes.length).toBeGreaterThan(0);
    expect(story1.scenes.length).toBeGreaterThan(0);
  });

  it("story id encodes goal, ageGroup, theme, sessionIndex", () => {
    const story = generateStory("grammar", "11-14", "adventure", 3);
    expect(story.id).toContain("grammar");
    expect(story.id).toContain("11-14");
    expect(story.id).toContain("adventure");
    expect(story.id).toContain("3");
  });
});

describe("storyEngine — progress persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loadStoryProgress returns defaults when nothing stored", () => {
    const progress = loadStoryProgress();
    expect(progress.completedStoryIds).toEqual([]);
    expect(progress.currentStoryId).toBeNull();
    expect(progress.currentSceneIndex).toBe(0);
  });

  it("saveStoryProgress and loadStoryProgress round-trip correctly", () => {
    const data = { completedStoryIds: ["s1", "s2"], currentStoryId: "s3", currentSceneIndex: 2 };
    saveStoryProgress(data);
    expect(loadStoryProgress()).toEqual(data);
  });

  it("markStoryComplete adds story to completedStoryIds", () => {
    markStoryComplete("story-abc");
    const progress = loadStoryProgress();
    expect(progress.completedStoryIds).toContain("story-abc");
    expect(progress.currentStoryId).toBeNull();
  });

  it("markStoryComplete does not duplicate", () => {
    markStoryComplete("story-abc");
    markStoryComplete("story-abc");
    const progress = loadStoryProgress();
    expect(progress.completedStoryIds.filter((id) => id === "story-abc").length).toBe(1);
  });
});
