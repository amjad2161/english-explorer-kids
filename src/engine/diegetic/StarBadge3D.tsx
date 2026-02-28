import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * StarBadge3D — a 3D star achievement badge that spins and glows.
 * Shows earned vs total stars with animated fill.
 */
interface StarBadge3DProps {
  earned: number;
  total?: number;
  position?: [number, number, number];
  size?: number;
}

/** Creates a 5-pointed star shape */
const createStarShape = (outerRadius: number, innerRadius: number): THREE.Shape => {
  const shape = new THREE.Shape();
  const points = 5;
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
};

const StarBadge3D = ({
  earned,
  total = 5,
  position = [0, 0, 0],
  size = 0.35,
}: StarBadge3DProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);

  const starShape = createStarShape(size, size * 0.42);
  const extrudeSettings = { depth: 0.06, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.01, bevelSegments: 2 };

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const t = performance.now() * 0.001;

    // Gentle hover spin
    const targetRotY = hovered ? t * 2 : Math.sin(t * 0.5) * 0.15;
    groupRef.current.rotation.y +=
      (targetRotY - groupRef.current.rotation.y) * (1 - Math.exp(-4 * delta));

    // Pulse scale when full
    if (earned >= total) {
      groupRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.04);
    }

    // Glow
    if (glowRef.current) {
      const fullGlow = earned >= total;
      const targetI = fullGlow ? 0.8 + Math.sin(t * 4) * 0.2 : 0.1 + (earned / total) * 0.3;
      glowRef.current.intensity +=
        (targetI - glowRef.current.intensity) * (1 - Math.exp(-5 * delta));
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerLeave={() => { setHovered(false); document.body.style.cursor = "default"; }}
    >
      {/* Backing circle — wooden medallion */}
      <mesh position={[0, 0, -0.04]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size * 1.5, size * 1.5, 0.06, 20]} />
        <meshStandardMaterial color="#6d4c2a" roughness={0.7} />
      </mesh>

      {/* Ring border */}
      <mesh position={[0, 0, -0.01]}>
        <torusGeometry args={[size * 1.4, 0.04, 8, 24]} />
        <meshStandardMaterial color="#8b6914" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Stars row */}
      {Array.from({ length: total }).map((_, i) => {
        const isEarned = i < earned;
        const offsetX = (i - (total - 1) / 2) * size * 0.75;
        const starSize = size * 0.3;
        const smallStar = createStarShape(starSize, starSize * 0.42);

        return (
          <group key={i} position={[offsetX, 0, 0.02]}>
            <mesh castShadow>
              <extrudeGeometry args={[smallStar, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.005, bevelSegments: 1 }]} />
              <meshStandardMaterial
                color={isEarned ? "#ffd54f" : "#5a534a"}
                roughness={isEarned ? 0.3 : 0.8}
                metalness={isEarned ? 0.4 : 0.05}
                emissive={isEarned ? "#ffd54f" : "#000000"}
                emissiveIntensity={isEarned ? 0.15 : 0}
              />
            </mesh>
          </group>
        );
      })}

      {/* Center glow */}
      <pointLight
        ref={glowRef}
        position={[0, 0, 0.5]}
        intensity={0.2}
        distance={2}
        color={earned >= total ? "#ffd54f" : "#ffab40"}
        decay={2}
      />
    </group>
  );
};

export default StarBadge3D;
