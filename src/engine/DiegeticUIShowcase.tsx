import { WoodButton3D } from "./diegetic";
import { LetterTile3D } from "./diegetic";
import { ProgressSign3D } from "./diegetic";
import { useSceneDirector } from "./SceneDirector";
import { dispatchCharacterEvent } from "@/lib/characterStore";
import { playClickSound } from "@/lib/sounds";

/**
 * DiegeticUIShowcase — demonstrates the 3D UI primitives in the scene.
 * Positioned to the right side of the stage, showing buttons, tiles, and progress.
 */
const DiegeticUIShowcase = () => {
  const stage = useSceneDirector((s) => s.activeStage);

  // Only show on certain stages for demo
  if (stage !== "forest" && stage !== "classroom") return null;

  return (
    <group position={[3, 0, 0]}>
      {/* Wood button */}
      <WoodButton3D
        label="▶  Play"
        position={[0, 2.5, 0]}
        onClick={() => {
          playClickSound();
          dispatchCharacterEvent({ type: "celebrate" });
        }}
      />

      {/* Letter tiles row */}
      <group position={[-0.9, 1.4, 0]}>
        {["A", "B", "C"].map((letter, i) => (
          <LetterTile3D
            key={letter}
            letter={letter}
            position={[i * 0.7, 0, 0]}
            onClick={() => {
              playClickSound();
              dispatchCharacterEvent({ type: "correct" });
            }}
          />
        ))}
      </group>

      {/* Progress sign */}
      <ProgressSign3D
        progress={65}
        label="Level 3"
        position={[0, 0.3, 0]}
        width={1.8}
      />
    </group>
  );
};

export default DiegeticUIShowcase;
