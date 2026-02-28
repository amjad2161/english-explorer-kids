import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useQualityStore } from "../qualityTier";

/** Snow Mountain Stage — icy peaks, falling snowflakes, crisp atmosphere */
const SnowMountainStage = () => {
  const snowRef = useRef<THREE.Points>(null);
  const particleCount = useQualityStore((s) => s.settings.particleCount);

  const snowflakes = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = Math.random() * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    return positions;
  }, [particleCount]);

  useFrame(() => {
    if (!snowRef.current) return;
    const pos = snowRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < particleCount; i++) {
      pos.array[i * 3 + 1] -= 0.015;
      pos.array[i * 3] += Math.sin(i * 0.3) * 0.003;
      if (pos.array[i * 3 + 1] < -0.5) pos.array[i * 3 + 1] = 12;
    }
    pos.needsUpdate = true;
  });

  return (
    <group>
      {/* Snow ground */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[20, 32]} />
        <meshStandardMaterial color="#e8eef5" roughness={0.95} />
      </mesh>

      {/* Mountains */}
      {[
        { pos: [-5, 0, -10] as [number, number, number], h: 6, r: 3 },
        { pos: [0, 0, -12] as [number, number, number], h: 8, r: 4 },
        { pos: [6, 0, -9] as [number, number, number], h: 5, r: 2.5 },
        { pos: [-8, 0, -8] as [number, number, number], h: 4, r: 2 },
      ].map((m, i) => (
        <mesh key={i} position={[m.pos[0], m.h / 2, m.pos[2]]} castShadow>
          <coneGeometry args={[m.r, m.h, 8]} />
          <meshStandardMaterial color={i === 1 ? "#d0dde8" : "#bcc8d4"} roughness={0.8} />
        </mesh>
      ))}

      {/* Snow caps */}
      <mesh position={[0, 7, -12]}>
        <coneGeometry args={[1.5, 2, 8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>

      {/* Snowflakes */}
      <points ref={snowRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={snowflakes} count={particleCount} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.06} color="#ffffff" transparent opacity={0.7} sizeAttenuation />
      </points>
    </group>
  );
};

export default SnowMountainStage;
