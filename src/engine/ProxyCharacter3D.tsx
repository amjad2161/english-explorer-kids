import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * ProxyCharacter3D — neutral animated 3D placeholder for missing character assets.
 * Renders a friendly blob shape with idle breathing + eye blinks.
 * Logs MISSING_CHARACTER_ASSET on mount.
 */
const ProxyCharacter3D = ({
  position = [0, 1, 0] as [number, number, number],
  color = "#7cb342",
  name = "unknown",
}: {
  position?: [number, number, number];
  color?: string;
  name?: string;
}) => {
  const bodyRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);

  // Log missing asset
  useRef(() => {
    console.warn(`MISSING_CHARACTER_ASSET: ${name}`);
  });

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Breathing
    if (bodyRef.current) {
      bodyRef.current.scale.y = 1 + Math.sin(t * 1.5) * 0.04;
      bodyRef.current.scale.x = 1 + Math.cos(t * 1.5) * 0.02;
      bodyRef.current.rotation.y = Math.sin(t * 0.3) * 0.1;
    }

    // Blinking
    const blink = Math.sin(t * 4) > 0.97;
    const eyeScaleY = blink ? 0.1 : 1;
    if (leftEyeRef.current) leftEyeRef.current.scale.y = eyeScaleY;
    if (rightEyeRef.current) rightEyeRef.current.scale.y = eyeScaleY;
  });

  return (
    <group position={position}>
      {/* Body */}
      <mesh ref={bodyRef} castShadow>
        <sphereGeometry args={[0.6, 16, 14]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>

      {/* Eyes */}
      <mesh ref={leftEyeRef} position={[-0.18, 0.15, 0.5]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.18, 0.15, 0.58]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      <mesh ref={rightEyeRef} position={[0.18, 0.15, 0.5]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.18, 0.15, 0.58]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Mouth — friendly smile arc */}
      <mesh position={[0, -0.1, 0.55]} rotation-x={0.2}>
        <torusGeometry args={[0.12, 0.02, 8, 12, Math.PI]} />
        <meshStandardMaterial color="#c62828" />
      </mesh>
    </group>
  );
};

export default ProxyCharacter3D;
