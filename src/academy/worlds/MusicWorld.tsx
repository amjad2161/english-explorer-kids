import EnvironmentBase, { FloatingIsland } from "./shared/EnvironmentBase";
import { MusicalNote } from "./shared/WorldDecor";
import { worldRegistry } from "../registries/worldRegistry";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function NoteOrb({ position, hue }: { position: [number, number, number]; hue: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(s.clock.elapsedTime * 2 + hue) * 0.4;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.35, 12, 12]} />
      <meshStandardMaterial color={`hsl(${hue}, 80%, 60%)`} emissive={`hsl(${hue}, 80%, 40%)`} emissiveIntensity={0.5} />
    </mesh>
  );
}

export default function MusicWorld() {
  const pos = worldRegistry.music.hubPosition;
  return (
    <EnvironmentBase groundColor="#e8daef" skyTint="#d7bde2">
      <group position={pos}>
        <FloatingIsland position={[0, 0, 0]} radius={9} color="#a55eea" />
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[8, 0.4, 4]} />
          <meshStandardMaterial color="#2d3436" />
        </mesh>
        {Array.from({ length: 7 }, (_, i) => (
          <NoteOrb key={i} position={[-3 + i, 2.5, 0]} hue={i * 50} />
        ))}
        <MusicalNote position={[-2, 4, 2]} color="#fd79a8" />
        <MusicalNote position={[2, 4.5, -1]} color="#ffeaa7" />
        <MusicalNote position={[0, 5, 1.5]} color="#a29bfe" />
      </group>
    </EnvironmentBase>
  );
}
