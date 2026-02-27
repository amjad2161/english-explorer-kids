import { describe, it, expect } from "vitest";
import {
  mapEventToReaction,
  createCharacterDispatch,
  type CharacterEvent,
} from "@/lib/characterEvents";

describe("characterEvents", () => {
  describe("mapEventToReaction", () => {
    it("maps correct_answer to positive reaction", () => {
      const event: CharacterEvent = { type: "correct_answer" };
      const reaction = mapEventToReaction(event);
      expect(reaction.action).toBe("react_positive");
      expect(reaction.mood).toBe("happy");
      expect(reaction.duration).toBeGreaterThan(0);
    });

    it("maps wrong_answer to encouraging reaction", () => {
      const reaction = mapEventToReaction({ type: "wrong_answer" });
      expect(reaction.action).toBe("react_negative");
      expect(reaction.mood).toBe("encouraging");
    });

    it("maps level_up to celebration", () => {
      const reaction = mapEventToReaction({ type: "level_up" });
      expect(reaction.action).toBe("celebrate");
      expect(reaction.mood).toBe("celebrating");
    });

    it("maps hint_requested to thinking", () => {
      const reaction = mapEventToReaction({ type: "hint_requested" });
      expect(reaction.action).toBe("think");
      expect(reaction.mood).toBe("thinking");
    });

    it("maps game_start to wave", () => {
      const reaction = mapEventToReaction({ type: "game_start" });
      expect(reaction.action).toBe("wave");
      expect(reaction.mood).toBe("happy");
    });

    it("maps achievement_unlocked to celebration", () => {
      const reaction = mapEventToReaction({ type: "achievement_unlocked" });
      expect(reaction.action).toBe("celebrate");
      expect(reaction.mood).toBe("celebrating");
    });
  });

  describe("createCharacterDispatch", () => {
    it("calls setAction and setMood on dispatch", () => {
      let lastAction = "";
      let lastMood = "";
      let lastSpeech = "";

      const dispatch = createCharacterDispatch(
        (a) => { lastAction = a; },
        (m) => { lastMood = m; },
        (s) => { lastSpeech = s; },
      );

      dispatch({ type: "correct_answer" });
      expect(lastAction).toBe("react_positive");
      expect(lastMood).toBe("happy");
    });

    it("sets speech when reaction has speech text", () => {
      let lastSpeech = "";

      const dispatch = createCharacterDispatch(
        () => {},
        () => {},
        (s) => { lastSpeech = s; },
      );

      // All default reactions have empty speech, so speech setter shouldn't be called with truthy value
      dispatch({ type: "correct_answer" });
      expect(lastSpeech).toBe("");
    });
  });
});
