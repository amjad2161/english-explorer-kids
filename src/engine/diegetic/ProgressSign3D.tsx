import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

/**
 * ProgressSign3D — a wooden sign post showing progress as an animated fill bar.
 * Looks like a trail marker or milestone sign in a forest/adventure setting.
 */
interface ProgressSign3DProps {
  progress: number; // 0-100
  label?: string;
  position?: [number, number, number];
  width?: number;
}

const ProgressSign3D = ({
  progress,
  label = "",
  position = [0, 0, 0],
  width = 2,
}: ProgressSign3DProps) => {
  const fillRef = useRef<THREE.Mesh>(null);
  const starRef = useRef<THREE.Group>(null);
  const currentFill = useRef(0);

  const barHeight = 0.2;
  const barWidth = width - 0.4;
  const clampedProgress = Math.max(0, Math.min(100, progress));

  useFrame((_, delta) => {
    // Smooth fill animation
    currentFill.current += (clampedProgress - currentFill.current) * (1 - Math.exp(-4 * delta));
    const fillFraction = currentFill.current / 100;

    if (fillRef.current) {
      fillRef.current.scale.x = Math.max(0.001, fillFraction);
      fillRef.current.position.x = -(barWidth / 2) * (1 - fillFraction);
    }

    // Star sparkle at 100%
    if (starRef.current) {
      const t = performance.now() * 0.001;
      starRef.current.rotation.z = Math.sin(t * 2) * 0.15;
      starRef.current.scale.setScalar(
        clampedProgress >= 100 ? 1 + Math.sin(t * 4) * 0.1 : 0.8
      );
    }
  });

  return (
    <group position={position}>
      {/* Post / pole */}
      <mesh position={[0, -0.8, -0.05]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 1.2, 8]} />
        <meshStandardMaterial color="#6d4c2a" roughness={0.85} />
      </mesh>

      {/* Sign board */}
      <mesh castShadow>
        <boxGeometry args={[width, 0.8, 0.06]} />
        <meshStandardMaterial color="#a0784c" roughness={0.7} />
      </mesh>

      {/* Board frame */}
      {[
        [0, 0.38, 0.03, width + 0.06, 0.04, 0.04],
        [0, -0.38, 0.03, width + 0.06, 0.04, 0.04],
        [-width / 2 - 0.01, 0, 0.03, 0.04, 0.8, 0.04],
        [width / 2 + 0.01, 0, 0.03, 0.04, 0.8, 0.04],
      ].map(([x, y, z, w, h, d], i) => (
        <mesh key={i} position={[x as number, y as number, z as number]}>
          <boxGeometry args={[w as number, h as number, d as number]} />
          <meshStandardMaterial color="#8b6914" roughness={0.75} />
        </mesh>
      ))}

      {/* Label text */}
      {label && (
        <Text
          position={[0, 0.18, 0.04]}
          fontSize={0.14}
          color="#fff8e1"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/baloobhai2/v28/sZlWdRSL-z1VEWZ4YNA7Y5I.woff2"
          outlineWidth={0.005}
          outlineColor="#3e2a0a"
        >
          {label}
        </Text>
      )}

      {/* Progress bar background */}
      <mesh position={[0, -0.08, 0.032]}>
        <boxGeometry args={[barWidth, barHeight, 0.02]} />
        <meshStandardMaterial color="#4a3520" roughness={0.9} />
      </mesh>

      {/* Progress bar fill */}
      <mesh ref={fillRef} position={[0, -0.08, 0.04]}>
        <boxGeometry args={[barWidth, barHeight - 0.04, 0.02]} />
        <meshStandardMaterial
          color={clampedProgress >= 100 ? "#ffd54f" : "#66bb6a"}
          roughness={0.4}
          emissive={clampedProgress >= 100 ? "#ffd54f" : "#66bb6a"}
          emissiveIntensity={clampedProgress >= 100 ? 0.3 : 0.1}
        />
      </mesh>

      {/* Percentage text */}
      <Text
        position={[0, -0.08, 0.06]}
        fontSize={0.1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/baloobhai2/v28/sZlWdRSL-z1VEWZ4YNA7Y5I.woff2"
        fontWeight={700}
      >
        {`${Math.round(clampedProgress)}%`}
      </Text>

      {/* Star icon at end */}
      <group ref={starRef} position={[barWidth / 2 + 0.2, -0.08, 0.05]}>
        <mesh>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial
            color="#ffd54f"
            emissive="#ffd54f"
            emissiveIntensity={clampedProgress >= 100 ? 0.5 : 0.1}
            roughness={0.3}
          />
        </mesh>
      </group>
    </group>
  );
};

export default ProgressSign3D;
