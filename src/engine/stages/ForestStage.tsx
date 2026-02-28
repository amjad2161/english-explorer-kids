import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useQualityStore } from "../qualityTier";

/** Forest Stage — lush green environment with soft dappled light, floating particles */
const ForestStage = () => {
  const groupRef = useRef<THREE.Group>(null);
  const particleCount = useQualityStore((s) => s.settings.particleCount);

  // Generate tree positions deterministically
  const trees = useMemo(() => {
    const arr: { pos: [number, number, number]; scale: number; hue: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const r = 6 + Math.sin(i * 3.7) * 3;
      arr.push({
        pos: [Math.cos(angle) * r, 0, Math.sin(angle) * r - 5],
        scale: 0.8 + Math.sin(i * 2.1) * 0.4,
        hue: 0.28 + Math.sin(i * 1.3) * 0.05,
      });
    }
    return arr;
  }, []);

  // Floating leaf particles
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      const g = 0.4 + Math.random() * 0.4;
      colors[i * 3] = 0.2 + Math.random() * 0.3;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = 0.1;
    }
    return { positions, colors };
  }, [particleCount]);

  const particlesRef = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (!particlesRef.current) return;
    const geo = particlesRef.current.geometry;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const t = clock.getElapsedTime();
    for (let i = 0; i < particleCount; i++) {
      pos.array[i * 3 + 1] += Math.sin(t * 0.5 + i) * 0.003;
      pos.array[i * 3] += Math.cos(t * 0.3 + i * 0.7) * 0.002;
      if (pos.array[i * 3 + 1] > 8) pos.array[i * 3 + 1] = 0;
    }
    pos.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      {/* Ground */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[18, 32]} />
        <meshStandardMaterial color="#3a7d44" roughness={0.9} />
      </mesh>

      {/* Stylized trees */}
      {trees.map((tree, i) => (
        <group key={i} position={tree.pos} scale={tree.scale}>
          {/* Trunk */}
          <mesh position={[0, 1, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.25, 2, 8]} />
            <meshStandardMaterial color="#6d4c2a" roughness={0.8} />
          </mesh>
          {/* Canopy */}
          <mesh position={[0, 2.8, 0]} castShadow>
            <sphereGeometry args={[1.2, 12, 10]} />
            <meshStandardMaterial
              color={new THREE.Color().setHSL(tree.hue, 0.6, 0.4)}
              roughness={0.7}
            />
          </mesh>
        </group>
      ))}

      {/* Floating particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={particles.positions}
            count={particleCount}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            array={particles.colors}
            count={particleCount}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.08} vertexColors transparent opacity={0.6} sizeAttenuation />
      </points>

      {/* Atmospheric fog plane */}
      <mesh position={[0, 0.5, -8]} rotation-x={0}>
        <planeGeometry args={[30, 4]} />
        <meshBasicMaterial color="#c8e6c9" transparent opacity={0.08} />
      </mesh>
    </group>
  );
};

export default ForestStage;
