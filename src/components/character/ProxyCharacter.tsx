import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CharacterMood } from "@/lib/characterStore";
import { threeMaterials } from "@/lib/designTokens";

interface ProxyCharacterProps {
  mood: CharacterMood;
  animationKey: number;
}

/**
 * ProxyCharacter — fallback 3D owl built entirely from Three.js primitives.
 *
 * This component is rendered when no GLB asset is available.
 * It logs a single console.error per mount so developers know to supply a
 * real rigged GLB.
 */
const ProxyCharacter = ({ mood, animationKey }: ProxyCharacterProps) => {
  const groupRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Mesh>(null!);
  const leftEyeRef = useRef<THREE.Mesh>(null!);
  const rightEyeRef = useRef<THREE.Mesh>(null!);
  const leftWingRef = useRef<THREE.Mesh>(null!);
  const rightWingRef = useRef<THREE.Mesh>(null!);
  const beakRef = useRef<THREE.Mesh>(null!);

  // Log missing asset once per mount (warn, not error)
  useEffect(() => {
    console.warn("MISSING_CHARACTER_ASSET: No GLB found; rendering proxy 3D character.");
  }, []);

  // Animation clock offsets so we can animate per-mood
  const clockRef = useRef(0);
  const reactionRef = useRef({ active: false, elapsed: 0 });

  useEffect(() => {
    // Restart clock on mood or animationKey change
    clockRef.current = 0;
    reactionRef.current = { active: true, elapsed: 0 };
  }, [mood, animationKey]);

  useFrame((_, delta) => {
    clockRef.current += delta;
    const t = clockRef.current;

    if (!groupRef.current) return;

    // --- Base idle bob ---
    const idleY = Math.sin(t * 1.8) * 0.04;
    const idleRotZ = Math.sin(t * 0.9) * 0.02;

    switch (mood) {
      case "celebrate":
        groupRef.current.position.y = Math.abs(Math.sin(t * 5)) * 0.2;
        groupRef.current.rotation.z = Math.sin(t * 8) * 0.15;
        if (leftWingRef.current) leftWingRef.current.rotation.z = -Math.abs(Math.sin(t * 5)) * 0.6 - 0.1;
        if (rightWingRef.current) rightWingRef.current.rotation.z = Math.abs(Math.sin(t * 5)) * 0.6 + 0.1;
        break;

      case "wave":
        groupRef.current.position.y = idleY;
        groupRef.current.rotation.z = idleRotZ;
        if (rightWingRef.current) rightWingRef.current.rotation.z = Math.sin(t * 4) * 0.5 + 0.3;
        if (leftWingRef.current) leftWingRef.current.rotation.z = -0.1;
        break;

      case "sad":
        groupRef.current.position.y = -Math.abs(Math.sin(t * 0.8)) * 0.05;
        groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.06;
        if (headRef.current) headRef.current.rotation.z = -0.15;
        if (leftWingRef.current) leftWingRef.current.rotation.z = 0.05;
        if (rightWingRef.current) rightWingRef.current.rotation.z = -0.05;
        break;

      case "think":
        groupRef.current.position.y = idleY;
        if (headRef.current) headRef.current.rotation.z = Math.sin(t * 1.2) * 0.08 + 0.1;
        if (rightWingRef.current) rightWingRef.current.rotation.z = 0.3;
        break;

      case "point":
        groupRef.current.position.y = idleY;
        if (rightWingRef.current) rightWingRef.current.rotation.z = -0.4;
        if (rightWingRef.current) rightWingRef.current.rotation.x = Math.sin(t * 2) * 0.1;
        break;

      case "surprised":
        groupRef.current.position.y = Math.sin(t * 3) * 0.08 + 0.05;
        groupRef.current.scale.setScalar(1 + Math.abs(Math.sin(t * 3)) * 0.08);
        if (headRef.current) headRef.current.rotation.z = 0;
        break;

      case "talk":
        groupRef.current.position.y = idleY;
        if (beakRef.current) beakRef.current.rotation.x = Math.abs(Math.sin(t * 8)) * 0.3;
        if (headRef.current) headRef.current.rotation.z = Math.sin(t * 2) * 0.05;
        break;

      default: // idle, react
        groupRef.current.position.y = idleY;
        groupRef.current.rotation.z = idleRotZ;
        if (leftWingRef.current) leftWingRef.current.rotation.z = Math.sin(t * 1.5) * 0.05 - 0.1;
        if (rightWingRef.current) rightWingRef.current.rotation.z = Math.sin(t * 1.5 + 1) * 0.05 + 0.1;
        if (headRef.current) headRef.current.rotation.z = Math.sin(t * 0.7) * 0.04;
        if (beakRef.current) beakRef.current.rotation.x = 0;
        break;
    }

    // Blink
    const blinkPhase = Math.sin(t * 3);
    const blinkScale = blinkPhase > 0.97 ? 0.1 : 1;
    if (leftEyeRef.current) leftEyeRef.current.scale.y = blinkScale;
    if (rightEyeRef.current) rightEyeRef.current.scale.y = blinkScale;
  });

  const bodyColor = threeMaterials.owlBody;
  const headColor = threeMaterials.owlHead;
  const eyeColor = threeMaterials.owlEye;
  const irisColor = threeMaterials.owlIris;
  const beakColor = threeMaterials.owlBeak;
  const wingColor = threeMaterials.owlWing;

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, -0.25, 0]}>
        <sphereGeometry args={[0.38, 24, 20]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, 0.26, 0]}>
        <sphereGeometry args={[0.28, 24, 20]} />
        <meshStandardMaterial color={headColor} roughness={0.65} metalness={0.05} />

        {/* Left eye white */}
        <mesh position={[-0.12, 0.06, 0.24]}>
          <sphereGeometry args={[0.1, 16, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
          {/* Iris */}
          <mesh position={[0, 0, 0.06]}>
            <sphereGeometry args={[0.065, 14, 10]} />
            <meshStandardMaterial color={irisColor} roughness={0.2} metalness={0.1} />
            {/* Pupil */}
            <mesh position={[0, 0, 0.04]}>
              <sphereGeometry args={[0.038, 12, 8]} />
              <meshStandardMaterial color={eyeColor} roughness={0.1} />
            </mesh>
          </mesh>
        </mesh>

        {/* Right eye white */}
        <mesh ref={leftEyeRef} position={[0.12, 0.06, 0.24]}>
          <sphereGeometry args={[0.1, 16, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
          {/* Iris */}
          <mesh ref={rightEyeRef} position={[0, 0, 0.06]}>
            <sphereGeometry args={[0.065, 14, 10]} />
            <meshStandardMaterial color={irisColor} roughness={0.2} metalness={0.1} />
            {/* Pupil */}
            <mesh position={[0, 0, 0.04]}>
              <sphereGeometry args={[0.038, 12, 8]} />
              <meshStandardMaterial color={eyeColor} roughness={0.1} />
            </mesh>
          </mesh>
        </mesh>

        {/* Beak */}
        <mesh ref={beakRef} position={[0, -0.06, 0.28]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.06, 0.12, 8]} />
          <meshStandardMaterial color={beakColor} roughness={0.5} />
        </mesh>

        {/* Left ear tuft */}
        <mesh position={[-0.16, 0.22, 0]} rotation={[0, 0, -0.4]}>
          <coneGeometry args={[0.05, 0.14, 6]} />
          <meshStandardMaterial color={headColor} roughness={0.8} />
        </mesh>
        {/* Right ear tuft */}
        <mesh position={[0.16, 0.22, 0]} rotation={[0, 0, 0.4]}>
          <coneGeometry args={[0.05, 0.14, 6]} />
          <meshStandardMaterial color={headColor} roughness={0.8} />
        </mesh>
      </mesh>

      {/* Left wing */}
      <mesh ref={leftWingRef} position={[-0.42, -0.18, 0]} rotation={[0, 0, -0.1]} scale={[0.36, 0.56, 1]}>
        <circleGeometry args={[0.5, 14]} />
        <meshStandardMaterial color={wingColor} roughness={0.75} side={THREE.DoubleSide} />
      </mesh>

      {/* Right wing */}
      <mesh ref={rightWingRef} position={[0.42, -0.18, 0]} rotation={[0, 0, 0.1]} scale={[0.36, 0.56, 1]}>
        <circleGeometry args={[0.5, 14]} />
        <meshStandardMaterial color={wingColor} roughness={0.75} side={THREE.DoubleSide} />
      </mesh>

      {/* Feet */}
      <mesh position={[-0.1, -0.6, 0.08]}>
        <capsuleGeometry args={[0.04, 0.12, 4, 8]} />
        <meshStandardMaterial color={beakColor} roughness={0.6} />
      </mesh>
      <mesh position={[0.1, -0.6, 0.08]}>
        <capsuleGeometry args={[0.04, 0.12, 4, 8]} />
        <meshStandardMaterial color={beakColor} roughness={0.6} />
      </mesh>
    </group>
  );
};

export default ProxyCharacter;
