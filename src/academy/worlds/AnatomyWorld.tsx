import EnvironmentBase, { FloatingIsland, PortalRing } from "./shared/EnvironmentBase";
import { LabBeaker, CrystalCluster } from "./shared/WorldDecor";
import { worldRegistry } from "../registries/worldRegistry";
import { useAcademyStore } from "../store/academyStore";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function HeartModel() {
  const ref = useRef<THREE.Group>(null);
  const bpm = useAcademyStore((s) => s.heartBpm);
  useFrame((s) => {
    if (!ref.current) return;
    const pulse = 1 + Math.sin(s.clock.elapsedTime * (bpm / 30)) * 0.08;
    ref.current.scale.setScalar(pulse);
  });
  return (
    <group ref={ref} position={[0, 3, 0]}>
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial color="#ff6b9d" emissive="#e84393" emissiveIntensity={0.5} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

export default function AnatomyWorld() {
  const pos = worldRegistry.anatomy.hubPosition;
  return (
    <EnvironmentBase groundColor="#ffeef2" skyTint="#ffb8d0">
      <group position={pos}>
        <FloatingIsland position={[0, 0, 0]} radius={9} color="#ffc0cb" />
        <HeartModel />
        <mesh position={[0, 2, 1]}>
          <capsuleGeometry args={[0.6, 2.5, 8, 16]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
        <LabBeaker position={[-3.5, 1.2, 2]} />
        <LabBeaker position={[3.5, 1.2, -1.5]} />
        <CrystalCluster position={[4, 1.2, 3]} color="#ff7675" />
        <PortalRing position={[0, 2.5, -6]} color="#ff6b9d" />
      </group>
    </EnvironmentBase>
  );
}
