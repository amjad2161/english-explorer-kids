import EnvironmentBase, { FloatingIsland, PortalRing } from "./shared/EnvironmentBase";
import { LabBeaker, StylizedTree } from "./shared/WorldDecor";
import { worldRegistry } from "../registries/worldRegistry";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function GlowingFlower() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      const m = ref.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 0.3 + Math.sin(s.clock.elapsedTime * 2) * 0.2;
    }
  });
  return (
    <group position={[0, 1.5, 0]}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#7bed9f" emissive="#2ed573" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
        <meshStandardMaterial color="#27ae60" />
      </mesh>
    </group>
  );
}

export default function ScienceWorld() {
  const pos = worldRegistry.science.hubPosition;
  return (
    <EnvironmentBase groundColor="#d5f5e3" skyTint="#abebc6">
      <group position={pos}>
        <FloatingIsland position={[0, 0, 0]} radius={9} color="#58d68d" />
        {Array.from({ length: 6 }, (_, i) => (
          <group key={i} position={[Math.cos(i) * 3, 0, Math.sin(i) * 3]}>
            <GlowingFlower />
          </group>
        ))}
        <LabBeaker position={[-3, 1.2, 2]} />
        <LabBeaker position={[3, 1.2, -2]} />
        <StylizedTree position={[5, 1, 3]} scale={0.9} />
        <PortalRing position={[0, 2.5, -6]} color="#58d68d" />
      </group>
    </EnvironmentBase>
  );
}
