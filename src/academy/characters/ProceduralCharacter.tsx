import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CharacterId } from "../types";
import { characterStyles } from "./characterStyles";

interface Props {
  id: CharacterId;
  position?: [number, number, number];
  animate?: boolean;
}

export default function ProceduralCharacter({ id, position = [0, 0, 0], animate = true }: Props) {
  const group = useRef<THREE.Group>(null);
  const style = characterStyles[id];

  useFrame((state) => {
    if (!group.current || !animate) return;
    const t = state.clock.elapsedTime;
    group.current.position.y = position[1] + Math.sin(t * 2 + position[0]) * 0.06;
    group.current.rotation.y = Math.sin(t * 0.5 + position[2]) * 0.15;
  });

  const s = style.scale;

  if (style.kind === "owl") {
    return (
      <group ref={group} position={position} scale={s}>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.55, 16, 16]} />
          <meshStandardMaterial color={style.primary} />
        </mesh>
        <mesh position={[-0.2, 1.35, 0.4]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#fff" emissive="#ffeaa7" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0.2, 1.35, 0.4]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#fff" emissive="#ffeaa7" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 0.6, 0]} rotation={[0, 0, Math.PI / 6]}>
          <coneGeometry args={[0.7, 0.5, 3]} />
          <meshStandardMaterial color={style.secondary} />
        </mesh>
      </group>
    );
  }

  if (style.kind === "robot") {
    return (
      <group ref={group} position={position} scale={s}>
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[0.7, 0.7, 0.5]} />
          <meshStandardMaterial color={style.primary} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.35, 0.2]}>
          <boxGeometry args={[0.5, 0.2, 0.15]} />
          <meshStandardMaterial color={style.accent} emissive={style.accent} emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.35, 0.4, 0.6, 8]} />
          <meshStandardMaterial color={style.secondary} />
        </mesh>
      </group>
    );
  }

  if (style.kind === "creature") {
    return (
      <group ref={group} position={position} scale={s}>
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color={style.primary} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <capsuleGeometry args={[0.35, 0.5, 4, 8]} />
          <meshStandardMaterial color={style.secondary} />
        </mesh>
        <mesh position={[-0.5, 1.3, 0]} rotation={[0, 0, 0.5]}>
          <coneGeometry args={[0.15, 0.5, 4]} />
          <meshStandardMaterial color={style.accent} />
        </mesh>
        <mesh position={[0.5, 1.3, 0]} rotation={[0, 0, -0.5]}>
          <coneGeometry args={[0.15, 0.5, 4]} />
          <meshStandardMaterial color={style.accent} />
        </mesh>
      </group>
    );
  }

  // human
  return (
    <group ref={group} position={position} scale={s}>
      <mesh position={[0, 1.35, 0]} castShadow>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.5, 4, 8]} />
        <meshStandardMaterial color={style.primary} />
      </mesh>
      <mesh position={[-0.22, 0.85, 0]} rotation={[0, 0, 0.3]}>
        <capsuleGeometry args={[0.08, 0.35, 4, 6]} />
        <meshStandardMaterial color={style.primary} />
      </mesh>
      <mesh position={[0.22, 0.85, 0]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.08, 0.35, 4, 6]} />
        <meshStandardMaterial color={style.primary} />
      </mesh>
      <mesh position={[-0.12, 0.15, 0]}>
        <capsuleGeometry args={[0.1, 0.4, 4, 6]} />
        <meshStandardMaterial color={style.secondary} />
      </mesh>
      <mesh position={[0.12, 0.15, 0]}>
        <capsuleGeometry args={[0.1, 0.4, 4, 6]} />
        <meshStandardMaterial color={style.secondary} />
      </mesh>
    </group>
  );
}
