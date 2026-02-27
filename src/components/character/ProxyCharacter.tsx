import { useRef, useEffect, forwardRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CharacterMood } from "@/lib/characterStore";

interface ProxyCharacterProps {
  mood: CharacterMood;
  animationKey: number;
}

/**
 * ProxyCharacter — Realistic 3D owl built from Three.js primitives.
 * Features: layered feather textures, detailed eyes, talons, chest pattern.
 */
const ProxyCharacter = forwardRef<THREE.Group, ProxyCharacterProps>(({ mood, animationKey }, _ref) => {
  const groupRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Group>(null!);
  const leftEyeRef = useRef<THREE.Mesh>(null!);
  const rightEyeRef = useRef<THREE.Mesh>(null!);
  const leftWingRef = useRef<THREE.Group>(null!);
  const rightWingRef = useRef<THREE.Group>(null!);
  const beakRef = useRef<THREE.Mesh>(null!);
  const leftPupilRef = useRef<THREE.Mesh>(null!);
  const rightPupilRef = useRef<THREE.Mesh>(null!);
  const tailRef = useRef<THREE.Group>(null!);

  useEffect(() => {
    console.warn("MISSING_CHARACTER_ASSET: No GLB found; rendering realistic proxy owl.");
  }, []);

  const clockRef = useRef(0);

  useEffect(() => {
    clockRef.current = 0;
  }, [mood, animationKey]);

  useFrame((_, delta) => {
    clockRef.current += delta;
    const t = clockRef.current;
    if (!groupRef.current) return;

    // Reset transforms each frame
    groupRef.current.scale.setScalar(1);
    if (headRef.current) {
      headRef.current.rotation.set(0, 0, 0);
    }

    const idleY = Math.sin(t * 1.5) * 0.02;
    const idleRotZ = Math.sin(t * 0.8) * 0.01;

    // Breathing effect on body
    const breathe = 1 + Math.sin(t * 2) * 0.008;

    switch (mood) {
      case "celebrate":
        groupRef.current.position.y = Math.abs(Math.sin(t * 4.5)) * 0.18;
        groupRef.current.rotation.z = Math.sin(t * 7) * 0.1;
        if (leftWingRef.current) leftWingRef.current.rotation.z = -Math.abs(Math.sin(t * 5)) * 0.8 - 0.2;
        if (rightWingRef.current) rightWingRef.current.rotation.z = Math.abs(Math.sin(t * 5)) * 0.8 + 0.2;
        if (tailRef.current) tailRef.current.rotation.x = Math.sin(t * 6) * 0.15;
        break;

      case "wave":
        groupRef.current.position.y = idleY;
        groupRef.current.rotation.z = idleRotZ;
        if (rightWingRef.current) rightWingRef.current.rotation.z = Math.sin(t * 4) * 0.5 + 0.4;
        if (leftWingRef.current) leftWingRef.current.rotation.z = -0.15;
        if (headRef.current) headRef.current.rotation.y = Math.sin(t * 2) * 0.1;
        break;

      case "sad":
        groupRef.current.position.y = -Math.abs(Math.sin(t * 0.6)) * 0.04;
        groupRef.current.rotation.z = Math.sin(t * 0.4) * 0.04;
        if (headRef.current) headRef.current.rotation.z = -0.12;
        if (headRef.current) headRef.current.rotation.x = 0.15;
        if (leftWingRef.current) leftWingRef.current.rotation.z = 0.05;
        if (rightWingRef.current) rightWingRef.current.rotation.z = -0.05;
        break;

      case "think":
        groupRef.current.position.y = idleY;
        if (headRef.current) headRef.current.rotation.z = Math.sin(t * 1) * 0.06 + 0.08;
        if (headRef.current) headRef.current.rotation.y = 0.15;
        if (rightWingRef.current) rightWingRef.current.rotation.z = 0.35;
        break;

      case "point":
        groupRef.current.position.y = idleY;
        if (rightWingRef.current) rightWingRef.current.rotation.z = -0.5;
        if (rightWingRef.current) rightWingRef.current.rotation.x = Math.sin(t * 2) * 0.08;
        if (headRef.current) headRef.current.rotation.y = -0.2;
        break;

      case "surprised":
        groupRef.current.position.y = Math.sin(t * 3) * 0.06 + 0.06;
        groupRef.current.scale.setScalar(1 + Math.abs(Math.sin(t * 3)) * 0.06);
        if (headRef.current) headRef.current.rotation.x = -0.1;
        break;

      case "talk":
        groupRef.current.position.y = idleY;
        if (beakRef.current) beakRef.current.rotation.x = Math.abs(Math.sin(t * 8)) * 0.25;
        if (headRef.current) headRef.current.rotation.z = Math.sin(t * 2) * 0.04;
        if (headRef.current) headRef.current.rotation.y = Math.sin(t * 1.5) * 0.08;
        break;

      default:
        groupRef.current.position.y = idleY;
        groupRef.current.rotation.z = idleRotZ;
        groupRef.current.scale.y = breathe;
        if (leftWingRef.current) leftWingRef.current.rotation.z = Math.sin(t * 1.2) * 0.04 - 0.12;
        if (rightWingRef.current) rightWingRef.current.rotation.z = Math.sin(t * 1.2 + 1) * 0.04 + 0.12;
        if (headRef.current) headRef.current.rotation.z = Math.sin(t * 0.6) * 0.03;
        if (headRef.current) headRef.current.rotation.y = Math.sin(t * 0.4) * 0.05;
        if (beakRef.current) beakRef.current.rotation.x = 0;
        if (tailRef.current) tailRef.current.rotation.x = Math.sin(t * 1) * 0.03;
        break;
    }

    // Blink
    const blinkPhase = Math.sin(t * 2.5);
    const blinkScale = blinkPhase > 0.96 ? 0.05 : 1;
    if (leftEyeRef.current) leftEyeRef.current.scale.y = blinkScale;
    if (rightEyeRef.current) rightEyeRef.current.scale.y = blinkScale;

    // Pupil micro-movement (look around)
    const pupilX = Math.sin(t * 0.7) * 0.012;
    const pupilY = Math.cos(t * 0.5) * 0.008;
    if (leftPupilRef.current) {
      leftPupilRef.current.position.x = pupilX;
      leftPupilRef.current.position.y = pupilY;
    }
    if (rightPupilRef.current) {
      rightPupilRef.current.position.x = pupilX;
      rightPupilRef.current.position.y = pupilY;
    }
  });

  // Color palette — realistic great horned owl
  const bodyMain = "#5a3e28";
  const bodyLight = "#7a5a3e";
  const belly = "#c8a878";
  const bellyPattern = "#8b6b48";
  const headColor = "#6b4e35";
  const faceDisk = "#c4a06a";
  const eyeRing = "#1a1a1a";
  const irisColor = "#e8a800";
  const pupilColor = "#0a0a0a";
  const beakColor = "#2a2a2a";
  const talonColor = "#3a3a3a";
  const wingOuter = "#4a3420";
  const wingInner = "#6b5038";
  const earTuft = "#3e2a18";

  return (
    <group ref={groupRef}>
      {/* === BODY === */}
      {/* Main body — elongated oval */}
      <mesh position={[0, -0.22, 0]}>
        <sphereGeometry args={[0.34, 32, 24]} />
        <meshStandardMaterial color={bodyMain} roughness={0.85} metalness={0.02} />
      </mesh>
      {/* Body front lighter area */}
      <mesh position={[0, -0.2, 0.12]}>
        <sphereGeometry args={[0.28, 24, 20]} />
        <meshStandardMaterial color={bodyLight} roughness={0.8} metalness={0.02} />
      </mesh>

      {/* Belly / chest with lighter feathering */}
      <mesh position={[0, -0.32, 0.2]}>
        <sphereGeometry args={[0.22, 20, 16]} />
        <meshStandardMaterial color={belly} roughness={0.75} />
      </mesh>
      {/* Chest feather stripes (decorative geometry) */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={`stripe-${i}`} position={[0, -0.2 - i * 0.07, 0.3]} scale={[0.6, 0.3, 0.1]}>
          <torusGeometry args={[0.12, 0.015, 6, 12, Math.PI]} />
          <meshStandardMaterial color={bellyPattern} roughness={0.9} transparent opacity={0.6} />
        </mesh>
      ))}

      {/* === HEAD === */}
      <group ref={headRef} position={[0, 0.22, 0]}>
        {/* Main head sphere */}
        <mesh>
          <sphereGeometry args={[0.26, 32, 24]} />
          <meshStandardMaterial color={headColor} roughness={0.8} metalness={0.02} />
        </mesh>

        {/* Facial disk — the flat face area characteristic of owls */}
        <mesh position={[0, -0.02, 0.18]}>
          <sphereGeometry args={[0.2, 24, 18]} />
          <meshStandardMaterial color={faceDisk} roughness={0.7} />
        </mesh>

        {/* Eyebrow ridges */}
        <mesh position={[-0.1, 0.1, 0.2]} rotation={[0, 0, -0.3]}>
          <capsuleGeometry args={[0.025, 0.08, 4, 8]} />
          <meshStandardMaterial color={headColor} roughness={0.9} />
        </mesh>
        <mesh position={[0.1, 0.1, 0.2]} rotation={[0, 0, 0.3]}>
          <capsuleGeometry args={[0.025, 0.08, 4, 8]} />
          <meshStandardMaterial color={headColor} roughness={0.9} />
        </mesh>

        {/* === LEFT EYE === */}
        <group position={[-0.1, 0.02, 0.22]}>
          {/* Eye socket ring */}
          <mesh>
            <torusGeometry args={[0.075, 0.015, 8, 16]} />
            <meshStandardMaterial color={eyeRing} roughness={0.5} />
          </mesh>
          {/* Eye white */}
          <mesh ref={leftEyeRef}>
            <sphereGeometry args={[0.072, 20, 14]} />
            <meshStandardMaterial color="#f0e8d8" roughness={0.2} />
            {/* Iris — golden amber */}
            <mesh position={[0, 0, 0.04]}>
              <sphereGeometry args={[0.055, 18, 12]} />
              <meshStandardMaterial color={irisColor} roughness={0.15} metalness={0.2} emissive={irisColor} emissiveIntensity={0.15} />
              {/* Pupil */}
              <mesh ref={leftPupilRef} position={[0, 0, 0.03]}>
                <sphereGeometry args={[0.03, 14, 10]} />
                <meshStandardMaterial color={pupilColor} roughness={0.05} />
                {/* Eye highlight */}
                <mesh position={[0.012, 0.012, 0.02]}>
                  <sphereGeometry args={[0.008, 8, 6]} />
                  <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} roughness={0} />
                </mesh>
              </mesh>
            </mesh>
          </mesh>
        </group>

        {/* === RIGHT EYE === */}
        <group position={[0.1, 0.02, 0.22]}>
          <mesh>
            <torusGeometry args={[0.075, 0.015, 8, 16]} />
            <meshStandardMaterial color={eyeRing} roughness={0.5} />
          </mesh>
          <mesh ref={rightEyeRef}>
            <sphereGeometry args={[0.072, 20, 14]} />
            <meshStandardMaterial color="#f0e8d8" roughness={0.2} />
            <mesh position={[0, 0, 0.04]}>
              <sphereGeometry args={[0.055, 18, 12]} />
              <meshStandardMaterial color={irisColor} roughness={0.15} metalness={0.2} emissive={irisColor} emissiveIntensity={0.15} />
              <mesh ref={rightPupilRef} position={[0, 0, 0.03]}>
                <sphereGeometry args={[0.03, 14, 10]} />
                <meshStandardMaterial color={pupilColor} roughness={0.05} />
                <mesh position={[0.012, 0.012, 0.02]}>
                  <sphereGeometry args={[0.008, 8, 6]} />
                  <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} roughness={0} />
                </mesh>
              </mesh>
            </mesh>
          </mesh>
        </group>

        {/* === BEAK === */}
        <group position={[0, -0.08, 0.28]}>
          {/* Upper beak — hooked */}
          <mesh ref={beakRef} rotation={[0.5, 0, 0]}>
            <coneGeometry args={[0.035, 0.1, 8]} />
            <meshStandardMaterial color={beakColor} roughness={0.4} metalness={0.1} />
          </mesh>
          {/* Beak base / cere */}
          <mesh position={[0, 0.02, -0.01]}>
            <sphereGeometry args={[0.03, 10, 8]} />
            <meshStandardMaterial color="#3a3520" roughness={0.6} />
          </mesh>
        </group>

        {/* === EAR TUFTS === (Great Horned Owl style) */}
        <group position={[-0.14, 0.22, 0]} rotation={[0.15, 0, -0.35]}>
          <mesh>
            <coneGeometry args={[0.04, 0.16, 6]} />
            <meshStandardMaterial color={earTuft} roughness={0.9} />
          </mesh>
          <mesh position={[0.015, 0.02, 0]}>
            <coneGeometry args={[0.025, 0.12, 5]} />
            <meshStandardMaterial color={bodyLight} roughness={0.85} />
          </mesh>
        </group>
        <group position={[0.14, 0.22, 0]} rotation={[0.15, 0, 0.35]}>
          <mesh>
            <coneGeometry args={[0.04, 0.16, 6]} />
            <meshStandardMaterial color={earTuft} roughness={0.9} />
          </mesh>
          <mesh position={[-0.015, 0.02, 0]}>
            <coneGeometry args={[0.025, 0.12, 5]} />
            <meshStandardMaterial color={bodyLight} roughness={0.85} />
          </mesh>
        </group>

        {/* Forehead feather detail */}
        <mesh position={[0, 0.16, 0.12]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.06, 0.06, 8]} />
          <meshStandardMaterial color={headColor} roughness={0.85} />
        </mesh>
      </group>

      {/* === LEFT WING === */}
      <group ref={leftWingRef} position={[-0.36, -0.15, -0.05]}>
        {/* Primary wing shape */}
        <mesh rotation={[0.1, 0.2, -0.12]} scale={[0.42, 0.7, 0.08]}>
          <sphereGeometry args={[0.5, 16, 12]} />
          <meshStandardMaterial color={wingOuter} roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
        {/* Wing inner layer */}
        <mesh position={[0.03, 0, 0.03]} rotation={[0.1, 0.2, -0.12]} scale={[0.32, 0.55, 0.06]}>
          <sphereGeometry args={[0.5, 14, 10]} />
          <meshStandardMaterial color={wingInner} roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
        {/* Feather tips */}
        {[0, 1, 2].map((i) => (
          <mesh key={`lf-${i}`} position={[-0.08, -0.2 - i * 0.06, 0]} rotation={[0, 0, -0.2 - i * 0.1]} scale={[0.15, 0.12, 0.03]}>
            <sphereGeometry args={[0.5, 8, 6]} />
            <meshStandardMaterial color={wingOuter} roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* === RIGHT WING === */}
      <group ref={rightWingRef} position={[0.36, -0.15, -0.05]}>
        <mesh rotation={[0.1, -0.2, 0.12]} scale={[0.42, 0.7, 0.08]}>
          <sphereGeometry args={[0.5, 16, 12]} />
          <meshStandardMaterial color={wingOuter} roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-0.03, 0, 0.03]} rotation={[0.1, -0.2, 0.12]} scale={[0.32, 0.55, 0.06]}>
          <sphereGeometry args={[0.5, 14, 10]} />
          <meshStandardMaterial color={wingInner} roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={`rf-${i}`} position={[0.08, -0.2 - i * 0.06, 0]} rotation={[0, 0, 0.2 + i * 0.1]} scale={[0.15, 0.12, 0.03]}>
            <sphereGeometry args={[0.5, 8, 6]} />
            <meshStandardMaterial color={wingOuter} roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* === TAIL === */}
      <group ref={tailRef} position={[0, -0.5, -0.2]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={`tail-${i}`} position={[(i - 2) * 0.05, -0.02, -0.02 * i]} rotation={[0.4, 0, (i - 2) * 0.08]} scale={[0.06, 0.18, 0.02]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={i % 2 === 0 ? wingOuter : bodyMain} roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* === TALONS === */}
      <group position={[-0.1, -0.58, 0.06]}>
        {/* Leg */}
        <mesh>
          <capsuleGeometry args={[0.025, 0.08, 4, 8]} />
          <meshStandardMaterial color={talonColor} roughness={0.5} metalness={0.1} />
        </mesh>
        {/* Toes */}
        {[-0.03, 0, 0.03].map((x, i) => (
          <mesh key={`lt-${i}`} position={[x, -0.06, 0.02]} rotation={[0.6, 0, (i - 1) * 0.3]}>
            <capsuleGeometry args={[0.012, 0.05, 3, 6]} />
            <meshStandardMaterial color={talonColor} roughness={0.4} metalness={0.15} />
          </mesh>
        ))}
      </group>
      <group position={[0.1, -0.58, 0.06]}>
        <mesh>
          <capsuleGeometry args={[0.025, 0.08, 4, 8]} />
          <meshStandardMaterial color={talonColor} roughness={0.5} metalness={0.1} />
        </mesh>
        {[-0.03, 0, 0.03].map((x, i) => (
          <mesh key={`rt-${i}`} position={[x, -0.06, 0.02]} rotation={[0.6, 0, (i - 1) * 0.3]}>
            <capsuleGeometry args={[0.012, 0.05, 3, 6]} />
            <meshStandardMaterial color={talonColor} roughness={0.4} metalness={0.15} />
          </mesh>
        ))}
      </group>
    </group>
  );
});

ProxyCharacter.displayName = "ProxyCharacter";

export default ProxyCharacter;
