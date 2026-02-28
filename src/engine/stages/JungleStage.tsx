import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useQualityStore } from "../qualityTier";

/** Jungle Stage — dense tropical vegetation, warm golden light, firefly particles */
const JungleStage = () => {
  const fireflyRef = useRef<THREE.Points>(null);
  const particleCount = useQualityStore((s) => s.settings.particleCount);

  const palms = useMemo(() => {
    const arr: { pos: [number, number, number]; rot: number; scale: number }[] = [];
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + Math.sin(i * 2) * 0.3;
      const r = 5 + Math.sin(i * 4.1) * 2.5;
      arr.push({
        pos: [Math.cos(angle) * r, 0, Math.sin(angle) * r - 4],
        rot: Math.random() * 0.3 - 0.15,
        scale: 0.7 + Math.random() * 0.6,
      });
    }
    return arr;
  }, []);

  const fireflies = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = 0.5 + Math.random() * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return positions;
  }, [particleCount]);

  useFrame(({ clock }) => {
    if (!fireflyRef.current) return;
    const pos = fireflyRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const t = clock.getElapsedTime();
    for (let i = 0; i < particleCount; i++) {
      pos.array[i * 3] += Math.sin(t * 0.8 + i * 1.3) * 0.004;
      pos.array[i * 3 + 1] += Math.cos(t * 0.6 + i * 0.9) * 0.003;
      pos.array[i * 3 + 2] += Math.sin(t * 0.4 + i * 1.7) * 0.002;
    }
    pos.needsUpdate = true;
  });

  return (
    <group>
      {/* Jungle floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[18, 32]} />
        <meshStandardMaterial color="#2e6b3a" roughness={0.95} />
      </mesh>

      {/* Palm trees */}
      {palms.map((palm, i) => (
        <group key={i} position={palm.pos} scale={palm.scale} rotation-z={palm.rot}>
          {/* Trunk — curved via slight lean */}
          <mesh position={[0, 2, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.2, 4, 8]} />
            <meshStandardMaterial color="#8b6c42" roughness={0.85} />
          </mesh>
          {/* Fronds — simplified as flattened spheres */}
          {[0, 1, 2, 3].map((f) => (
            <mesh
              key={f}
              position={[Math.cos(f * 1.57) * 0.8, 4.2, Math.sin(f * 1.57) * 0.8]}
              rotation-z={Math.cos(f * 1.57) * 0.5}
              rotation-x={Math.sin(f * 1.57) * 0.5}
              castShadow
            >
              <sphereGeometry args={[0.9, 8, 6]} />
              <meshStandardMaterial
                color={new THREE.Color().setHSL(0.3 + Math.sin(i + f) * 0.04, 0.65, 0.35)}
                roughness={0.7}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Vines / ground plants */}
      {[[-3, 0.3, -2], [4, 0.25, -1], [-2, 0.2, 3]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.5, 8, 6]} />
          <meshStandardMaterial color="#1b5e20" roughness={0.9} />
        </mesh>
      ))}

      {/* Fireflies */}
      <points ref={fireflyRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={fireflies} count={particleCount} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.07} color="#ffe082" transparent opacity={0.6} sizeAttenuation />
      </points>
    </group>
  );
};

export default JungleStage;
