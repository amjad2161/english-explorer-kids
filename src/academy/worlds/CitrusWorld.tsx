import EnvironmentBase, { FloatingIsland, PortalRing } from "./shared/EnvironmentBase";
import { StylizedTree } from "./shared/WorldDecor";
import { worldRegistry } from "../registries/worldRegistry";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function CitrusFruit({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.3;
  });
  return (
    <mesh ref={ref} position={position} castShadow>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} />
    </mesh>
  );
}

export default function CitrusWorld() {
  const pos = worldRegistry.citrus.hubPosition;
  return (
    <EnvironmentBase groundColor="#c8e6c9" skyTint="#fff3e0">
      <group position={pos}>
        <FloatingIsland position={[0, 0, 0]} radius={9} color="#ff9f43" />
        {Array.from({ length: 12 }, (_, i) => (
          <CitrusFruit
            key={i}
            position={[
              Math.cos((i / 12) * Math.PI * 2) * 5,
              1.2 + (i % 3) * 0.3,
              Math.sin((i / 12) * Math.PI * 2) * 5,
            ]}
            color={i % 2 ? "#ff6348" : "#ffa502"}
          />
        ))}
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[6, 0.3, 3]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        <StylizedTree position={[-5, 1, -2]} scale={0.85} />
        <StylizedTree position={[5, 1, 1]} scale={0.75} />
        <PortalRing position={[0, 2.5, -6]} color="#ff9f43" />
      </group>
    </EnvironmentBase>
  );
}
