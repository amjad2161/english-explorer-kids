import { describe, it, expect } from "vitest";
import {
  generateStory,
  validateStorySafety,
  type StoryInput,
} from "@/lib/storyEngine";

describe("storyEngine", () => {
  describe("generateStory", () => {
    it("generates a story with scenes", () => {
      const input: StoryInput = {
        targetDomain: "vocabulary",
        ageBand: "4-6",
      };
      const story = generateStory(input);
      expect(story.scenes.length).toBeGreaterThanOrEqual(3);
      expect(story.title).toBeTruthy();
      expect(story.targetDomain).toBe("vocabulary");
    });

    it("generates stories with specified theme", () => {
      const input: StoryInput = {
        targetDomain: "vocabulary",
        ageBand: "4-6",
        theme: "park",
      };
      const story = generateStory(input);
      expect(story.theme).toBe("park");
      expect(story.scenes.length).toBe(4); // 3 scenes + recap
    });

    it("includes embedded activities in scenes", () => {
      const input: StoryInput = {
        targetDomain: "vocabulary",
        ageBand: "4-6",
        theme: "school",
      };
      const story = generateStory(input);
      const activitiesCount = story.scenes.filter((s) => s.activity).length;
      expect(activitiesCount).toBeGreaterThanOrEqual(2);
    });

    it("uses provided words in the story", () => {
      const words = ["apple", "banana", "cherry"];
      const input: StoryInput = {
        targetDomain: "vocabulary",
        ageBand: "7-10",
        theme: "kitchen",
        words,
      };
      const story = generateStory(input);
      const allNarration = story.scenes.map((s) => s.narration).join(" ");
      expect(allNarration).toContain("apple");
      expect(allNarration).toContain("banana");
    });

    it("adapts activities for young learners (repeat vs spell)", () => {
      const youngStory = generateStory({
        targetDomain: "vocabulary",
        ageBand: "0-3",
        theme: "park",
      });
      const olderStory = generateStory({
        targetDomain: "vocabulary",
        ageBand: "11-14",
        theme: "park",
      });

      // Young learners should get 'repeat' activities
      const youngActivities = youngStory.scenes
        .filter((s) => s.activity)
        .map((s) => s.activity!.type);
      expect(youngActivities).toContain("repeat");

      // Older learners should get 'spell' activities
      const olderActivities = olderStory.scenes
        .filter((s) => s.activity)
        .map((s) => s.activity!.type);
      expect(olderActivities).toContain("spell");
    });

    it("includes scaffolding translations", () => {
      const story = generateStory({
        targetDomain: "vocabulary",
        ageBand: "4-6",
        theme: "park",
      });
      const withScaffolding = story.scenes.filter((s) => s.scaffolding);
      expect(withScaffolding.length).toBeGreaterThan(0);
    });
  });

  describe("validateStorySafety", () => {
    it("returns true for safe stories", () => {
      const story = generateStory({
        targetDomain: "vocabulary",
        ageBand: "4-6",
        theme: "park",
      });
      expect(validateStorySafety(story)).toBe(true);
    });

    it("returns false for unsafe content", () => {
      const unsafeStory = generateStory({
        targetDomain: "vocabulary",
        ageBand: "4-6",
        theme: "park",
      });
      // Manually inject unsafe content for testing
      unsafeStory.scenes[0].narration = "There was violence in the park";
      expect(validateStorySafety(unsafeStory)).toBe(false);
    });

    it("rejects stories with external links", () => {
      const story = generateStory({
        targetDomain: "vocabulary",
        ageBand: "4-6",
        theme: "park",
      });
      story.scenes[0].narration = "Visit http://example.com for more";
      expect(validateStorySafety(story)).toBe(false);
    });
  });
});
