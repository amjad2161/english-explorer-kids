import EnvironmentBase, { FloatingIsland, PortalRing } from "./shared/EnvironmentBase";
import { GraduationArch } from "./shared/WorldDecor";
import { worldRegistry } from "../registries/worldRegistry";
import { useAcademyStore } from "../store/academyStore";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function MedalSpin() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.8;
  });
  return (
    <mesh ref={ref} position={[0, 5, 0]} rotation={[Math.PI / 4, 0, 0]}>
      <cylinderGeometry args={[1.5, 1.5, 0.15, 32]} />
      <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} emissive="#f39c12" emissiveIntensity={0.5} />
    </mesh>
  );
}

export default function FinaleWorld() {
  const pos = worldRegistry.finale.hubPosition;
  const locks = useAcademyStore((s) => s.finaleLocksOpen);
  const medal = useAcademyStore((s) => s.medalEarned);

  return (
    <EnvironmentBase groundColor="#fff8e1" skyTint="#ffeaa7" showStars>
      <group position={pos}>
        <FloatingIsland position={[0, 0, 0]} radius={14} color="#f5d76e" />
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[-3 + i * 3, 2, -4]}>
            <torusGeometry args={[1, 0.2, 8, 24]} />
            <meshStandardMaterial
              color={i < locks ? "#ffd700" : "#636e72"}
              emissive={i < locks ? "#f39c12" : "#000"}
              emissiveIntensity={i < locks ? 0.8 : 0}
            />
          </mesh>
        ))}
        {medal && <MedalSpin />}
        <GraduationArch position={[0, 1.2, 5]} />
        <PortalRing position={[0, 3, -7]} color="#f5d76e" />
        <pointLight position={[0, 10, 0]} intensity={3} color="#ffeaa7" distance={40} />
      </group>
    </EnvironmentBase>
  );
}
