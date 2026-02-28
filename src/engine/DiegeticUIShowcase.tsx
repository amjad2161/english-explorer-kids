import { WoodButton3D, LetterTile3D, ProgressSign3D, Scoreboard3D, StarBadge3D, EnergyMeter3D } from "./diegetic";
import { useSceneDirector } from "./SceneDirector";
import { dispatchCharacterEvent } from "@/lib/characterStore";


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
          dispatchCharacterEvent({ type: "celebrate" });
        }}
      />

      {/* Letter tiles row */}
      <group position={[-0.9, 1.4, 0]}>
        {["A", "B", "C"].map((letter, i) => (
          <LetterTile3D
            key={letter}
            letter={letter}
            index={i}
            position={[i * 0.7, 0, 0]}
            onClick={() => {
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

      {/* Scoreboard */}
      <Scoreboard3D
        score={1250}
        label="Score"
        position={[0, -1.2, 0]}
        width={1.6}
      />

      {/* Star badge */}
      <StarBadge3D
        earned={3}
        total={5}
        position={[-1.2, -1.2, 0]}
        size={0.3}
      />

      {/* Energy meter */}
      <EnergyMeter3D
        energy={72}
        label="Energy"
        position={[1.5, -0.5, 0]}
        height={1.6}
      />
    </group>
  );
};

export default DiegeticUIShowcase;
