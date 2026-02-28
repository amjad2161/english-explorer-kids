import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

/**
 * Scoreboard3D — a rustic wooden scoreboard showing player name + score.
 * Looks like a carved wooden plaque hanging on a post.
 */
interface Scoreboard3DProps {
  score: number;
  label?: string;
  position?: [number, number, number];
  width?: number;
  maxScore?: number;
}

const Scoreboard3D = ({
  score,
  label = "Score",
  position = [0, 0, 0],
  width = 2,
  maxScore = 999,
}: Scoreboard3DProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const scoreRef = useRef({ display: 0 });
  const glowRef = useRef<THREE.PointLight>(null);

  const clamped = Math.min(score, maxScore);

  useFrame((_, delta) => {
    // Smooth score counter
    scoreRef.current.display +=
      (clamped - scoreRef.current.display) * (1 - Math.exp(-8 * delta));

    // Subtle swing
    if (groupRef.current) {
      const t = performance.now() * 0.001;
      groupRef.current.rotation.z = Math.sin(t * 0.6) * 0.015;
    }

    // Glow intensity based on score
    if (glowRef.current) {
      const intensity = 0.1 + (clamped / maxScore) * 0.6;
      glowRef.current.intensity +=
        (intensity - glowRef.current.intensity) * (1 - Math.exp(-3 * delta));
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Hanging rope */}
      <mesh position={[0, 0.55, -0.02]}>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 6]} />
        <meshStandardMaterial color="#8d6e63" roughness={0.9} />
      </mesh>

      {/* Main plaque — stone slab */}
      <mesh castShadow>
        <boxGeometry args={[width, 1, 0.08]} />
        <meshStandardMaterial color="#6d6358" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Stone texture overlay — darker inner */}
      <mesh position={[0, 0, 0.041]}>
        <boxGeometry args={[width - 0.15, 0.85, 0.005]} />
        <meshStandardMaterial color="#5a534a" roughness={0.9} />
      </mesh>

      {/* Chiseled border */}
      {[
        [0, 0.47, 0.04, width + 0.04, 0.05, 0.04],
        [0, -0.47, 0.04, width + 0.04, 0.05, 0.04],
        [-width / 2 - 0.005, 0, 0.04, 0.05, 1, 0.04],
        [width / 2 + 0.005, 0, 0.04, 0.05, 1, 0.04],
      ].map(([x, y, z, w, h, d], i) => (
        <mesh key={i} position={[x as number, y as number, z as number]}>
          <boxGeometry args={[w as number, h as number, d as number]} />
          <meshStandardMaterial color="#7a6f63" roughness={0.8} />
        </mesh>
      ))}

      {/* Corner studs — metal rivets */}
      {[
        [-width / 2 + 0.1, 0.38, 0.06],
        [width / 2 - 0.1, 0.38, 0.06],
        [-width / 2 + 0.1, -0.38, 0.06],
        [width / 2 - 0.1, -0.38, 0.06],
      ].map((pos, i) => (
        <mesh key={`stud-${i}`} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#b0a090" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}

      {/* Label text */}
      <Text
        position={[0, 0.22, 0.06]}
        fontSize={0.12}
        color="#c4b89a"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/baloobhai2/v28/sZlWdRSL-z1VEWZ4YNA7Y5I.woff2"
        outlineWidth={0.004}
        outlineColor="#3e3428"
      >
        {label}
      </Text>

      {/* Score number */}
      <Text
        position={[0, -0.08, 0.06]}
        fontSize={0.32}
        color="#ffd54f"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/baloobhai2/v28/sZlWdRSL-z1VEWZ4YNA7Y5I.woff2"
        fontWeight={800}
        outlineWidth={0.008}
        outlineColor="#3e2a0a"
      >
        {`${Math.round(scoreRef.current?.display ?? clamped)}`}
      </Text>

      {/* Score glow */}
      <pointLight
        ref={glowRef}
        position={[0, -0.08, 0.5]}
        intensity={0.2}
        distance={2.5}
        color="#ffd54f"
        decay={2}
      />
    </group>
  );
};

export default Scoreboard3D;
