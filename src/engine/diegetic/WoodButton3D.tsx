import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

/**
 * WoodButton3D — a tactile wooden sign button for the cinematic UI.
 * Features press animation, hover glow, and grain texture via procedural colors.
 */
interface WoodButton3DProps {
  label: string;
  position?: [number, number, number];
  width?: number;
  height?: number;
  onClick?: () => void;
  color?: string;
  fontSize?: number;
}

const WoodButton3D = ({
  label,
  position = [0, 0, 0],
  width = 2.4,
  height = 0.7,
  onClick,
  color = "#8b6914",
  fontSize = 0.22,
}: WoodButton3DProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const boardRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const pressTimer = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current || !boardRef.current) return;

    // Press spring
    const targetZ = pressed ? -0.06 : 0;
    groupRef.current.position.z += (targetZ - (groupRef.current.position.z - position[2])) * (1 - Math.exp(-12 * delta));

    // Hover scale
    const targetScale = hovered ? 1.06 : 1;
    groupRef.current.scale.x += (targetScale - groupRef.current.scale.x) * (1 - Math.exp(-8 * delta));
    groupRef.current.scale.y += (targetScale - groupRef.current.scale.y) * (1 - Math.exp(-8 * delta));

    // Press cooldown
    if (pressed) {
      pressTimer.current += delta;
      if (pressTimer.current > 0.15) {
        setPressed(false);
        pressTimer.current = 0;
      }
    }
  });

  const handleClick = () => {
    setPressed(true);
    pressTimer.current = 0;
    onClick?.();
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerLeave={() => { setHovered(false); document.body.style.cursor = "default"; }}
      onClick={(e) => { e.stopPropagation(); handleClick(); }}
    >
      {/* Shadow / depth layer */}
      <mesh position={[0, -0.02, -0.04]}>
        <boxGeometry args={[width + 0.06, height + 0.06, 0.06]} />
        <meshStandardMaterial color="#3e2a0a" roughness={0.95} />
      </mesh>

      {/* Main wooden board */}
      <mesh ref={boardRef} castShadow>
        <boxGeometry args={[width, height, 0.08]} />
        <meshStandardMaterial
          color={color}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* Top highlight strip */}
      <mesh position={[0, height / 2 - 0.04, 0.041]}>
        <boxGeometry args={[width - 0.1, 0.04, 0.01]} />
        <meshStandardMaterial color="#c9a84c" roughness={0.5} transparent opacity={0.5} />
      </mesh>

      {/* Border frame */}
      {[
        [0, height / 2, 0.04, width + 0.08, 0.06, 0.04],
        [0, -height / 2, 0.04, width + 0.08, 0.06, 0.04],
        [-width / 2, 0, 0.04, 0.06, height, 0.04],
        [width / 2, 0, 0.04, 0.06, height, 0.04],
      ].map(([x, y, z, w, h, d], i) => (
        <mesh key={i} position={[x as number, y as number, z as number]}>
          <boxGeometry args={[w as number, h as number, d as number]} />
          <meshStandardMaterial color="#6d4c2a" roughness={0.8} />
        </mesh>
      ))}

      {/* Nail decorations */}
      {[
        [-width / 2 + 0.12, height / 2 - 0.08, 0.06],
        [width / 2 - 0.12, height / 2 - 0.08, 0.06],
        [-width / 2 + 0.12, -height / 2 + 0.08, 0.06],
        [width / 2 - 0.12, -height / 2 + 0.08, 0.06],
      ].map((pos, i) => (
        <mesh key={`nail-${i}`} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.025, 0.025, 0.02, 8]} />
          <meshStandardMaterial color="#9e9e9e" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Label text */}
      <Text
        position={[0, 0, 0.06]}
        fontSize={fontSize}
        color="#fff8e1"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/baloobhai2/v28/sZlWdRSL-z1VEWZ4YNA7Y5I.woff2"
        outlineWidth={0.01}
        outlineColor="#3e2a0a"
      >
        {label}
      </Text>

      {/* Hover glow */}
      {hovered && (
        <pointLight position={[0, 0, 0.5]} intensity={0.4} distance={2} color="#ffd54f" decay={2} />
      )}
    </group>
  );
};

export default WoodButton3D;
