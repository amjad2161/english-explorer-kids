import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCharacterStore } from "@/store/characterStore";

// Reset store state between tests
beforeEach(() => {
  useCharacterStore.setState({
    animation: "idle",
    visible: true,
    characterFile: "default.glb",
  });
});

describe("characterStore", () => {
  it("has correct initial state", () => {
    const { result } = renderHook(() => useCharacterStore());
    expect(result.current.animation).toBe("idle");
    expect(result.current.visible).toBe(true);
    expect(result.current.characterFile).toBe("default.glb");
  });

  it("setAnimation updates animation", () => {
    const { result } = renderHook(() => useCharacterStore());
    act(() => result.current.setAnimation("celebrate"));
    expect(result.current.animation).toBe("celebrate");
  });

  it("setVisible hides the character", () => {
    const { result } = renderHook(() => useCharacterStore());
    act(() => result.current.setVisible(false));
    expect(result.current.visible).toBe(false);
  });

  it("setCharacterFile updates the file", () => {
    const { result } = renderHook(() => useCharacterStore());
    act(() => result.current.setCharacterFile("robot.glb"));
    expect(result.current.characterFile).toBe("robot.glb");
  });
});

describe("CharacterLayer visibility", () => {
  it("returns null when visible is false", async () => {
    // Mock three.js canvas-heavy deps so JSDOM doesn't throw
    vi.mock("@react-three/fiber", () => ({ Canvas: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
    vi.mock("@react-three/drei", () => ({
      useGLTF: () => { throw new Error("MISSING_CHARACTER_ASSET"); },
      useAnimations: () => ({ actions: {} }),
      OrbitControls: () => null,
    }));

    const { default: CharacterLayer } = await import("@/components/CharacterLayer");
    const { render } = await import("@testing-library/react");

    useCharacterStore.setState({ visible: false });
    const { container } = render(<CharacterLayer />);
    expect(container.firstChild).toBeNull();
  });
});
