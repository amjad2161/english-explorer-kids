import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

/**
 * LetterTile3D — a 3D letter block with hover tilt, press squash, and pop animation.
 * Used for alphabet displays, spelling games, etc.
 */
interface LetterTile3DProps {
  letter: string;
  position?: [number, number, number];
  size?: number;
  color?: string;
  textColor?: string;
  onClick?: () => void;
  active?: boolean;
  correct?: boolean | null; // null=neutral, true=green flash, false=red shake
}

const TILE_COLORS = {
  neutral: "#f5f0e0",
  active: "#fff9c4",
  correct: "#c8e6c9",
  wrong: "#ffcdd2",
};

const LetterTile3D = ({
  letter,
  position = [0, 0, 0],
  size = 0.6,
  color,
  textColor = "#1a1a2e",
  onClick,
  active = false,
  correct = null,
}: LetterTile3DProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [pressing, setPressing] = useState(false);
  const pressAnim = useRef(0);
  const shakeAnim = useRef(0);
  const popAnim = useRef(0);

  // Determine tile color
  const tileColor = color
    ? color
    : correct === true
    ? TILE_COLORS.correct
    : correct === false
    ? TILE_COLORS.wrong
    : active
    ? TILE_COLORS.active
    : TILE_COLORS.neutral;

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Press animation (squash & stretch)
    if (pressing) {
      pressAnim.current += delta * 12;
      if (pressAnim.current > Math.PI) {
        setPressing(false);
        pressAnim.current = 0;
      }
    }
    const squash = pressing ? Math.sin(pressAnim.current) * 0.15 : 0;
    groupRef.current.scale.y = 1 - squash;
    groupRef.current.scale.x = 1 + squash * 0.5;
    groupRef.current.scale.z = 1 + squash * 0.5;

    // Hover lift
    const targetY = hovered ? position[1] + 0.08 : position[1];
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * (1 - Math.exp(-10 * delta));

    // Hover tilt
    const targetRotX = hovered ? -0.1 : 0;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * (1 - Math.exp(-8 * delta));

    // Wrong answer shake
    if (correct === false) {
      shakeAnim.current += delta * 30;
      groupRef.current.rotation.z = Math.sin(shakeAnim.current) * 0.1 * Math.exp(-shakeAnim.current * 0.1);
    } else {
      shakeAnim.current = 0;
      groupRef.current.rotation.z *= 0.9;
    }

    // Correct answer pop
    if (correct === true) {
      popAnim.current += delta * 8;
      const pop = Math.sin(popAnim.current) * 0.1 * Math.exp(-popAnim.current * 0.3);
      groupRef.current.scale.x = 1 + pop;
      groupRef.current.scale.y = 1 + pop;
    } else {
      popAnim.current = 0;
    }
  });

  const handleClick = () => {
    setPressing(true);
    pressAnim.current = 0;
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
      {/* Shadow */}
      <mesh position={[0, -0.02, -0.03]}>
        <boxGeometry args={[size, size, size * 0.3]} />
        <meshStandardMaterial color="#8d6e63" roughness={0.95} transparent opacity={0.3} />
      </mesh>

      {/* Tile body */}
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[size, size, size * 0.25]} />
        <meshStandardMaterial
          color={tileColor}
          roughness={0.5}
          metalness={0.02}
        />
      </mesh>

      {/* Beveled edge highlight */}
      <mesh position={[0, size * 0.48, size * 0.08]}>
        <boxGeometry args={[size * 0.9, 0.02, size * 0.2]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.2} roughness={0.3} />
      </mesh>

      {/* Letter */}
      <Text
        position={[0, 0, size * 0.14]}
        fontSize={size * 0.55}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/baloobhai2/v28/sZlWdRSL-z1VEWZ4YNA7Y5I.woff2"
        fontWeight={800}
      >
        {letter}
      </Text>

      {/* Active / hover glow */}
      {(hovered || active) && (
        <pointLight
          position={[0, 0, 0.5]}
          intensity={active ? 0.6 : 0.3}
          distance={1.5}
          color={correct === true ? "#66bb6a" : correct === false ? "#ef5350" : "#ffd54f"}
          decay={2}
        />
      )}
    </group>
  );
};

export default LetterTile3D;
