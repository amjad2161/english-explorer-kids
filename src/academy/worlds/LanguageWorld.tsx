import EnvironmentBase, { FloatingIsland, PortalRing } from "./shared/EnvironmentBase";
import { CrystalCluster } from "./shared/WorldDecor";
import { worldRegistry } from "../registries/worldRegistry";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function StarLetter({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.z = s.clock.elapsedTime * 0.2;
  });
  return (
    <mesh ref={ref} position={position}>
      <octahedronGeometry args={[0.4, 0]} />
      <meshStandardMaterial color="#00cec9" emissive="#00b894" emissiveIntensity={0.6} />
    </mesh>
  );
}

export default function LanguageWorld() {
  const pos = worldRegistry.language.hubPosition;
  return (
    <EnvironmentBase groundColor="#e0f7fa" skyTint="#80deea" showStars>
      <group position={pos}>
        <FloatingIsland position={[0, 0, 0]} radius={9} color="#00cec9" />
        {Array.from({ length: 10 }, (_, i) => (
          <StarLetter
            key={i}
            position={[
              Math.cos((i / 10) * Math.PI * 2) * 5,
              2 + (i % 3),
              Math.sin((i / 10) * Math.PI * 2) * 5,
            ]}
          />
        ))}
        <CrystalCluster position={[-4, 1.2, 0]} color="#00cec9" />
        <CrystalCluster position={[4, 1.2, 2]} color="#6c5ce7" />
        <PortalRing position={[0, 2.5, -6]} color="#00b894" />
      </group>
    </EnvironmentBase>
  );
}
