import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneDirector } from "./SceneDirector";
import { useQualityStore } from "./qualityTier";

/**
 * SceneLighting — 3-point lighting rig driven by SceneDirector.
 * Key + Fill + Rim + Ambient for cinematic depth.
 */
const SceneLighting = () => {
  const { lighting } = useSceneDirector();
  const shadows = useQualityStore((s) => s.settings.shadows);
  const shadowMapSize = useQualityStore((s) => s.settings.shadowMapSize);

  const keyRef = useRef<THREE.DirectionalLight>(null);

  // Gentle key light sway for organic feel
  useFrame(({ clock }) => {
    if (!keyRef.current) return;
    const t = clock.getElapsedTime();
    keyRef.current.position.x = 5 + Math.sin(t * 0.1) * 0.5;
    keyRef.current.position.y = 8 + Math.cos(t * 0.08) * 0.3;
  });

  return (
    <>
      {/* Key light */}
      <directionalLight
        ref={keyRef}
        position={[5, 8, 5]}
        intensity={lighting.keyIntensity}
        color={lighting.keyColor}
        castShadow={shadows}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.002}
      />

      {/* Fill light */}
      <directionalLight
        position={[-4, 4, 3]}
        intensity={lighting.fillIntensity}
        color={lighting.fillColor}
      />

      {/* Rim light */}
      <directionalLight
        position={[0, 3, -6]}
        intensity={lighting.rimIntensity}
        color={lighting.rimColor}
      />

      {/* Ambient */}
      <ambientLight
        intensity={lighting.ambientIntensity}
        color={lighting.ambientColor}
      />

      {/* Soft hemisphere for natural sky/ground bounce */}
      <hemisphereLight
        args={["#b0d4f1", "#4a7c59", 0.2]}
      />
    </>
  );
};

export default SceneLighting;
