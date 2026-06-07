import { beforeEach, describe, expect, it } from "vitest";
import { useAcademyStore } from "@/academy/store/academyStore";
import { clearAcademySession } from "@/academy/store/sessionPersistence";

describe("academyStore", () => {
  beforeEach(() => {
    clearAcademySession();
    useAcademyStore.getState().resetSession();
  });

  it("starts with overlay and no active session", () => {
    const state = useAcademyStore.getState();
    expect(state.showStartOverlay).toBe(true);
    expect(state.sessionActive).toBe(false);
    expect(state.playing).toBe(false);
  });

  it("startSession clears progress and begins playback", () => {
    useAcademyStore.getState().startSession(true);
    const state = useAcademyStore.getState();
    expect(state.sessionActive).toBe(true);
    expect(state.showStartOverlay).toBe(false);
    expect(state.playing).toBe(true);
    expect(state.elapsedSec).toBe(0);
  });

  it("pauses timeline at interaction gate without opening modal", () => {
    useAcademyStore.getState().startSession(true);
    useAcademyStore.setState({ elapsedSec: 129.5, playing: true });
    useAcademyStore.getState().tick(1);

    const state = useAcademyStore.getState();
    expect(state.activeInteraction).toBeNull();
    expect(state.playing).toBe(false);
    expect(state.elapsedSec).toBe(130);
  });

  it("openFinaleLock increments locks up to three", () => {
    useAcademyStore.getState().openFinaleLock();
    useAcademyStore.getState().openFinaleLock();
    useAcademyStore.getState().openFinaleLock();
    useAcademyStore.getState().openFinaleLock();
    expect(useAcademyStore.getState().finaleLocksOpen).toBe(3);
  });
});
