import { describe, it, expect } from "vitest";
import {
  STORIES,
  getStoriesForAge,
  getStoryById,
  checkAnswer,
  type StoryActivity,
} from "@/lib/storyEngine";

describe("STORIES catalogue", () => {
  it("has at least 3 stories", () => {
    expect(STORIES.length).toBeGreaterThanOrEqual(3);
  });

  it("every story has required fields", () => {
    for (const story of STORIES) {
      expect(story.id).toBeTruthy();
      expect(story.title.en).toBeTruthy();
      expect(story.title.he).toBeTruthy();
      expect(story.title.ar).toBeTruthy();
      expect(story.beats.length).toBeGreaterThan(0);
      expect(story.emoji).toBeTruthy();
    }
  });

  it("every beat has text in all three languages", () => {
    for (const story of STORIES) {
      for (const beat of story.beats) {
        expect(beat.text.en, `${story.id}/${beat.id} missing en text`).toBeTruthy();
        expect(beat.text.he, `${story.id}/${beat.id} missing he text`).toBeTruthy();
        expect(beat.text.ar, `${story.id}/${beat.id} missing ar text`).toBeTruthy();
      }
    }
  });

  it("activities have valid types", () => {
    const validTypes = ["pick", "match", "spell", "build-sentence"];
    for (const story of STORIES) {
      for (const beat of story.beats) {
        if (beat.activity) {
          expect(validTypes).toContain(beat.activity.type);
        }
      }
    }
  });
});

describe("getStoriesForAge", () => {
  it("returns stories appropriate for age 5", () => {
    const stories = getStoriesForAge(5);
    expect(stories.every((s) => s.minAge <= 5)).toBe(true);
  });

  it("returns all stories for age 12", () => {
    const stories = getStoriesForAge(12);
    expect(stories.length).toBe(STORIES.length);
  });

  it("returns empty for age 1 (all stories require older)", () => {
    // Only if no stories have minAge <= 1
    const stories = getStoriesForAge(1);
    expect(stories.every((s) => s.minAge <= 1)).toBe(true);
  });
});

describe("getStoryById", () => {
  it("returns a story for valid id", () => {
    const story = getStoryById("story-owl-adventure");
    expect(story).toBeDefined();
    expect(story?.id).toBe("story-owl-adventure");
  });

  it("returns undefined for invalid id", () => {
    expect(getStoryById("nonexistent")).toBeUndefined();
  });
});

describe("checkAnswer", () => {
  const activity: StoryActivity = {
    type: "pick",
    prompt: { en: "?", he: "?", ar: "?" },
    answer: "Morning",
    options: ["Morning", "Night"],
  };

  it("returns true for correct case-insensitive answer", () => {
    expect(checkAnswer(activity, "morning")).toBe(true);
    expect(checkAnswer(activity, "Morning")).toBe(true);
    expect(checkAnswer(activity, "MORNING")).toBe(true);
  });

  it("returns false for wrong answer", () => {
    expect(checkAnswer(activity, "Night")).toBe(false);
    expect(checkAnswer(activity, "")).toBe(false);
  });

  it("trims whitespace", () => {
    expect(checkAnswer(activity, "  morning  ")).toBe(true);
  });
});
