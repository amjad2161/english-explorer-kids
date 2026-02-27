import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  useCharacterStore,
  dispatchCharacterEvent,
  type CharacterEvent,
} from "@/lib/characterStore";

// Reset store between tests
beforeEach(() => {
  useCharacterStore.setState({ mood: "idle", speechBubble: null, animationKey: 0 });
});

describe("characterStore", () => {
  it("starts with idle mood", () => {
    expect(useCharacterStore.getState().mood).toBe("idle");
  });

  it("dispatches correct event → celebrate mood", () => {
    dispatchCharacterEvent({ type: "correct" });
    expect(useCharacterStore.getState().mood).toBe("celebrate");
  });

  it("dispatches wrong event → sad mood", () => {
    dispatchCharacterEvent({ type: "wrong" });
    expect(useCharacterStore.getState().mood).toBe("sad");
  });

  it("dispatches hint event → point mood", () => {
    dispatchCharacterEvent({ type: "hint", payload: { message: "Try letter A!" } });
    expect(useCharacterStore.getState().mood).toBe("point");
    expect(useCharacterStore.getState().speechBubble).toBe("Try letter A!");
  });

  it("dispatches navigate event → wave mood", () => {
    dispatchCharacterEvent({ type: "navigate" });
    expect(useCharacterStore.getState().mood).toBe("wave");
  });

  it("dispatches level-up event → celebrate mood", () => {
    dispatchCharacterEvent({ type: "level-up" });
    expect(useCharacterStore.getState().mood).toBe("celebrate");
  });

  it("increments animationKey on each dispatch", () => {
    const before = useCharacterStore.getState().animationKey;
    dispatchCharacterEvent({ type: "wave" });
    expect(useCharacterStore.getState().animationKey).toBe(before + 1);
    dispatchCharacterEvent({ type: "think" });
    expect(useCharacterStore.getState().animationKey).toBe(before + 2);
  });

  it("auto-returns to idle after duration", async () => {
    vi.useFakeTimers();
    dispatchCharacterEvent({ type: "correct", payload: { duration: 100 } });
    expect(useCharacterStore.getState().mood).toBe("celebrate");
    vi.advanceTimersByTime(150);
    expect(useCharacterStore.getState().mood).toBe("idle");
    vi.useRealTimers();
  });
});

describe("dispatchCharacterEvent API", () => {
  it("is callable from outside components", () => {
    const event: CharacterEvent = { type: "wave" };
    expect(() => dispatchCharacterEvent(event)).not.toThrow();
  });
});
