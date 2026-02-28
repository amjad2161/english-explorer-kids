import { useRef, forwardRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

/**
 * EnergyMeter3D — a vertical stone/wood energy gauge with animated liquid fill.
 * Think of a carved stone pillar with glowing green energy inside.
 */
interface EnergyMeter3DProps {
  energy: number; // 0-100
  label?: string;
  position?: [number, number, number];
  height?: number;
}

const EnergyMeter3D = forwardRef<THREE.Group, EnergyMeter3DProps>(({
  energy,
  label = "Energy",
  position = [0, 0, 0],
  height = 2,
}, _ref) => {
  const fillRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const bubblesRef = useRef<THREE.Group>(null);
  const currentFill = useRef(0);

  const clamped = Math.max(0, Math.min(100, energy));
  const innerHeight = height - 0.4;
  const barWidth = 0.35;

  // Determine color based on energy level
  const getColor = (e: number) => {
    if (e > 60) return "#66bb6a"; // Green — healthy
    if (e > 30) return "#ffa726"; // Orange — caution
    return "#ef5350"; // Red — low
  };

  useFrame((_, delta) => {
    const t = performance.now() * 0.001;

    // Smooth fill
    currentFill.current +=
      (clamped - currentFill.current) * (1 - Math.exp(-4 * delta));
    const fillFraction = currentFill.current / 100;
    const fillH = innerHeight * fillFraction;

    if (fillRef.current) {
      fillRef.current.scale.y = Math.max(0.001, fillFraction);
      fillRef.current.position.y = -innerHeight / 2 + fillH / 2;

      // Wobble the fill surface
      fillRef.current.scale.x = 1 + Math.sin(t * 3) * 0.02;
    }

    // Bubble animation
    if (bubblesRef.current) {
      bubblesRef.current.children.forEach((bubble, i) => {
        const speed = 0.3 + i * 0.1;
        const phase = i * 1.7;
        bubble.position.y =
          -innerHeight / 2 +
          ((((t * speed + phase) % 1) * fillH));
        bubble.position.x = Math.sin(t * 2 + phase) * 0.06;
        (bubble as THREE.Mesh).visible = fillFraction > 0.05;
        bubble.scale.setScalar(0.5 + Math.sin(t * 4 + phase) * 0.2);
      });
    }

    // Glow
    if (glowRef.current) {
      glowRef.current.color.set(getColor(currentFill.current));
      const targetI = 0.1 + fillFraction * 0.5;
      glowRef.current.intensity +=
        (targetI - glowRef.current.intensity) * (1 - Math.exp(-3 * delta));
      glowRef.current.position.y = -innerHeight / 2 + fillH;
    }
  });

  const color = getColor(clamped);

  return (
    <group position={position}>
      {/* Stone pillar base */}
      <mesh position={[0, -height / 2 - 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.4, 0.2, 10]} />
        <meshStandardMaterial color="#6d6358" roughness={0.85} />
      </mesh>

      {/* Stone frame — outer */}
      <mesh castShadow>
        <boxGeometry args={[barWidth + 0.2, height, 0.12]} />
        <meshStandardMaterial color="#7a6f63" roughness={0.8} />
      </mesh>

      {/* Inner cavity (dark) */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[barWidth, innerHeight, 0.08]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
      </mesh>

      {/* Energy fill */}
      <mesh ref={fillRef} position={[0, -innerHeight / 2, 0.04]}>
        <boxGeometry args={[barWidth - 0.04, innerHeight, 0.06]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          transparent
          opacity={0.85}
          emissive={color}
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Bubbles inside the liquid */}
      <group ref={bubblesRef} position={[0, 0, 0.06]}>
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.4}
              roughness={0.2}
            />
          </mesh>
        ))}
      </group>

      {/* Glass overlay — semi-transparent */}
      <mesh position={[0, 0, 0.065]}>
        <boxGeometry args={[barWidth - 0.02, innerHeight + 0.02, 0.01]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* Carved frame details — horizontal bands */}
      {[-innerHeight / 2, 0, innerHeight / 2].map((y, i) => (
        <mesh key={i} position={[0, y, 0.07]}>
          <boxGeometry args={[barWidth + 0.22, 0.04, 0.03]} />
          <meshStandardMaterial color="#8b7355" roughness={0.7} />
        </mesh>
      ))}

      {/* Top cap — carved stone */}
      <mesh position={[0, height / 2 + 0.05, 0]} castShadow>
        <boxGeometry args={[barWidth + 0.24, 0.12, 0.14]} />
        <meshStandardMaterial color="#7a6f63" roughness={0.8} />
      </mesh>

      {/* Label */}
      <Text
        position={[0, height / 2 + 0.2, 0.04]}
        fontSize={0.1}
        color="#c4b89a"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/baloobhai2/v28/sZlWdRSL-z1VEWZ4YNA7Y5I.woff2"
        outlineWidth={0.004}
        outlineColor="#3e3428"
      >
        {label}
      </Text>

      {/* Percentage */}
      <Text
        position={[0, -height / 2 - 0.25, 0.04]}
        fontSize={0.12}
        color={color}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/baloobhai2/v28/sZlWdRSL-z1VEWZ4YNA7Y5I.woff2"
        fontWeight={700}
      >
        {`${Math.round(clamped)}%`}
      </Text>

      {/* Glow light */}
      <pointLight
        ref={glowRef}
        position={[0, 0, 0.6]}
        intensity={0.2}
        distance={2.5}
        color={color}
        decay={2}
      />
    </group>
  );
});

EnergyMeter3D.displayName = "EnergyMeter3D";

export default EnergyMeter3D;
