import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useQualityStore } from "../qualityTier";

/** Classroom Stage — warm wooden environment, chalkboard, desk, floating chalk dust */
const ClassroomStage = () => {
  const dustRef = useRef<THREE.Points>(null);
  const particleCount = useQualityStore((s) => s.settings.particleCount);

  const dust = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = Math.random() * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, [particleCount]);

  useFrame(({ clock }) => {
    if (!dustRef.current) return;
    const pos = dustRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const t = clock.getElapsedTime();
    for (let i = 0; i < particleCount; i++) {
      pos.array[i * 3 + 1] += Math.sin(t * 0.2 + i * 0.5) * 0.001;
      pos.array[i * 3] += Math.cos(t * 0.15 + i) * 0.0008;
    }
    pos.needsUpdate = true;
  });

  return (
    <group>
      {/* Floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[16, 12]} />
        <meshStandardMaterial color="#c4a67a" roughness={0.85} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 3, -5]} receiveShadow>
        <planeGeometry args={[16, 6]} />
        <meshStandardMaterial color="#f5efe6" roughness={0.9} />
      </mesh>

      {/* Chalkboard */}
      <mesh position={[0, 3.2, -4.95]} castShadow>
        <boxGeometry args={[6, 3, 0.1]} />
        <meshStandardMaterial color="#2d5a3d" roughness={0.7} />
      </mesh>
      {/* Chalkboard frame */}
      <mesh position={[0, 3.2, -4.9]}>
        <boxGeometry args={[6.4, 3.4, 0.05]} />
        <meshStandardMaterial color="#8b6914" roughness={0.6} />
      </mesh>

      {/* Desk */}
      <mesh position={[0, 0.75, 1]} castShadow>
        <boxGeometry args={[3, 0.08, 1.5]} />
        <meshStandardMaterial color="#a0784c" roughness={0.7} />
      </mesh>
      {/* Desk legs */}
      {[[-1.3, 0.375, 0.5], [1.3, 0.375, 0.5], [-1.3, 0.375, 1.5], [1.3, 0.375, 1.5]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.75, 6]} />
          <meshStandardMaterial color="#7a5c3a" roughness={0.8} />
        </mesh>
      ))}

      {/* Chalk dust */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={dust} count={particleCount} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.04} color="#f5f0e0" transparent opacity={0.25} sizeAttenuation />
      </points>
    </group>
  );
};

export default ClassroomStage;
