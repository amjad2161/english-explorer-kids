import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { playWoodButtonSound } from "@/lib/sounds";

/**
 * WoodButton3D — a tactile wooden sign button for the cinematic UI.
 * Features press animation, hover glow, wood grain texture, and knock sound.
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

/** Procedural wood grain colors for layered plank look */
const GRAIN_STRIPS = [
  { offset: -0.12, color: "#7a5c1e", width: 0.08 },
  { offset: 0.05, color: "#9a7830", width: 0.06 },
  { offset: 0.15, color: "#6d4c12", width: 0.1 },
  { offset: -0.06, color: "#8b6914", width: 0.05 },
];

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
  const bounceRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current || !boardRef.current) return;

    // Press spring
    const targetZ = pressed ? -0.06 : 0;
    groupRef.current.position.z +=
      (targetZ - (groupRef.current.position.z - position[2])) *
      (1 - Math.exp(-12 * delta));

    // Hover scale with elastic overshoot
    const targetScale = hovered ? 1.06 : 1;
    groupRef.current.scale.x +=
      (targetScale - groupRef.current.scale.x) * (1 - Math.exp(-8 * delta));
    groupRef.current.scale.y +=
      (targetScale - groupRef.current.scale.y) * (1 - Math.exp(-8 * delta));

    // Press bounce
    if (bounceRef.current > 0) {
      bounceRef.current -= delta;
      const bouncePhase = Math.max(0, bounceRef.current);
      const bounce = Math.sin(bouncePhase * Math.PI * 6) * bouncePhase * 0.15;
      groupRef.current.scale.y = (hovered ? 1.06 : 1) + bounce;
    }

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
    bounceRef.current = 0.4;
    playWoodButtonSound();
    onClick?.();
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleClick();
      }}
    >
      {/* Shadow / depth layer */}
      <mesh position={[0, -0.02, -0.04]}>
        <boxGeometry args={[width + 0.06, height + 0.06, 0.06]} />
        <meshStandardMaterial color="#3e2a0a" roughness={0.95} />
      </mesh>

      {/* Main wooden board */}
      <mesh ref={boardRef} castShadow>
        <boxGeometry args={[width, height, 0.08]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Wood grain strips — procedural texture layers */}
      {GRAIN_STRIPS.map((strip, i) => (
        <mesh
          key={`grain-${i}`}
          position={[0, strip.offset, 0.041]}
        >
          <boxGeometry args={[width - 0.08, strip.width, 0.003]} />
          <meshStandardMaterial
            color={strip.color}
            roughness={0.85}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}

      {/* Knot holes — dark circles simulating wood knots */}
      {[
        [-width / 2 + 0.35, -0.08, 0.042, 0.04],
        [width / 2 - 0.45, 0.12, 0.042, 0.03],
      ].map(([x, y, z, r], i) => (
        <mesh key={`knot-${i}`} position={[x, y, z] as [number, number, number]}>
          <circleGeometry args={[r, 10]} />
          <meshStandardMaterial
            color="#4a3010"
            roughness={0.9}
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}

      {/* Top highlight strip */}
      <mesh position={[0, height / 2 - 0.04, 0.042]}>
        <boxGeometry args={[width - 0.1, 0.04, 0.01]} />
        <meshStandardMaterial
          color="#c9a84c"
          roughness={0.5}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Border frame */}
      {[
        [0, height / 2, 0.04, width + 0.08, 0.06, 0.04],
        [0, -height / 2, 0.04, width + 0.08, 0.06, 0.04],
        [-width / 2, 0, 0.04, 0.06, height, 0.04],
        [width / 2, 0, 0.04, 0.06, height, 0.04],
      ].map(([x, y, z, w, h, d], i) => (
        <mesh
          key={i}
          position={[x as number, y as number, z as number]}
        >
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
        <mesh
          key={`nail-${i}`}
          position={pos as [number, number, number]}
        >
          <cylinderGeometry args={[0.025, 0.025, 0.02, 8]} />
          <meshStandardMaterial
            color="#9e9e9e"
            metalness={0.7}
            roughness={0.3}
          />
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
        <pointLight
          position={[0, 0, 0.5]}
          intensity={0.4}
          distance={2}
          color="#ffd54f"
          decay={2}
        />
      )}
    </group>
  );
};

export default WoodButton3D;
