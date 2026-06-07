import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { useAcademyStore } from "../store/academyStore";
import { getBeatAtTime } from "../cinema/masterScript";

export default function InteractionBeacon() {
  const elapsedSec = useAcademyStore((s) => s.elapsedSec);
  const mode = useAcademyStore((s) => s.mode);
  const enterInteraction = useAcademyStore((s) => s.enterInteraction);
  const ring = useRef<THREE.Mesh>(null);
  const beat = getBeatAtTime(elapsedSec);

  useFrame((state) => {
    if (!ring.current) return;
    const t = state.clock.elapsedTime;
    ring.current.rotation.z = t * 1.5;
    ring.current.scale.setScalar(1 + Math.sin(t * 3) * 0.08);
  });

  if (mode !== "interactive" || !beat.interaction) return null;

  return (
    <group position={[0, 3.5, 4]}>
      <mesh ref={ring}>
        <torusGeometry args={[1.2, 0.12, 12, 48]} />
        <meshStandardMaterial color="#ffd700" emissive="#f39c12" emissiveIntensity={0.9} />
      </mesh>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          if (beat.interaction) enterInteraction(beat.interaction);
        }}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "default"; }}
      >
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial color="#ffeaa7" transparent opacity={0.35} />
      </mesh>
      <Text position={[0, 2, 0]} fontSize={0.35} color="#fff" anchorX="center" anchorY="middle">
        Tap to play!
      </Text>
    </group>
  );
}
