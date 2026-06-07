import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import CameraDirector from "./CameraDirector";
import CinematicEffects from "./CinematicEffects";
import PhysicsWorld from "./PhysicsWorld";
import TimelineClock from "./TimelineClock";
import WorldStage from "../worlds/WorldStage";
import CharacterRoster from "../characters/CharacterRoster";
import ParticleField from "./ParticleField";
import InteractionBeacon from "./InteractionBeacon";
import { useAcademyStore } from "../store/academyStore";

function SceneContent() {
  return (
    <PhysicsWorld>
      <TimelineClock />
      <CameraDirector />
      <WorldStage />
      <CharacterRoster />
      <ParticleField />
      <InteractionBeacon />
      <EffectComposer multisampling={0}>
        <CinematicEffects />
      </EffectComposer>
    </PhysicsWorld>
  );
}

export default function KidGeniusCanvas() {
  const setWebglSupported = useAcademyStore((s) => s.setWebglSupported);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setWebglSupported(!!gl);
    } catch {
      setWebglSupported(false);
    }
  }, [setWebglSupported]);

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        shadows
        camera={{ position: [0, 18, 28], fov: 45, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
