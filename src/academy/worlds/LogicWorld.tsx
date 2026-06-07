import EnvironmentBase, { FloatingIsland } from "./shared/EnvironmentBase";
import { CrystalCluster } from "./shared/WorldDecor";
import { worldRegistry } from "../registries/worldRegistry";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function LogicCube({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      ref.current.rotation.x = s.clock.elapsedTime * 0.5;
      ref.current.rotation.y = s.clock.elapsedTime * 0.7;
    }
  });
  return (
    <mesh ref={ref} position={position} castShadow>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial color="#54a0ff" emissive="#0984e3" emissiveIntensity={0.3} wireframe />
    </mesh>
  );
}

export default function LogicWorld() {
  const pos = worldRegistry.logic.hubPosition;
  return (
    <EnvironmentBase groundColor="#2d3436" skyTint="#74b9ff">
      <group position={pos}>
        <FloatingIsland position={[0, 0, 0]} radius={9} color="#636e72" />
        {Array.from({ length: 8 }, (_, i) => (
          <LogicCube
            key={i}
            position={[
              (i % 4) * 2 - 3,
              1.5 + Math.floor(i / 4) * 1.5,
              (i % 2) * 2 - 1,
            ]}
          />
        ))}
        <mesh position={[0, 3, -2]}>
          <torusKnotGeometry args={[1.2, 0.3, 64, 8]} />
          <meshStandardMaterial color="#a29bfe" emissive="#6c5ce7" emissiveIntensity={0.4} />
        </mesh>
        <CrystalCluster position={[-4, 0, 3]} color="#74b9ff" />
        <CrystalCluster position={[4, 0, 2]} color="#a29bfe" />
      </group>
    </EnvironmentBase>
  );
}
