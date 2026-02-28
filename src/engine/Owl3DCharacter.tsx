import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCharacterStore, CharacterMood } from "@/lib/characterStore";

// ---------------------------------------------------------------------------
// Animation parameters per mood
// ---------------------------------------------------------------------------

interface MoodAnim {
  bodyBob: number;       // vertical oscillation amplitude
  bodySpeed: number;     // oscillation speed
  wingFlap: number;      // wing rotation amplitude
  wingSpeed: number;     // wing flap speed
  headTilt: number;      // head Z rotation target
  eyeScale: number;      // pupil scale (surprise = big)
  bodySquash: number;    // Y scale modifier
  jumpHeight: number;    // one-shot jump
  color: string;         // glow color
}

const MOOD_ANIMS: Record<CharacterMood, MoodAnim> = {
  idle:       { bodyBob: 0.03,  bodySpeed: 1.2,  wingFlap: 0.05, wingSpeed: 0.8,  headTilt: 0,     eyeScale: 1,   bodySquash: 0,    jumpHeight: 0,   color: "#7cb342" },
  talk:       { bodyBob: 0.05,  bodySpeed: 2.5,  wingFlap: 0.15, wingSpeed: 3,    headTilt: 0.1,   eyeScale: 1,   bodySquash: 0.02, jumpHeight: 0,   color: "#42a5f5" },
  react:      { bodyBob: 0.06,  bodySpeed: 3,    wingFlap: 0.3,  wingSpeed: 5,    headTilt: -0.15, eyeScale: 1.3, bodySquash: 0.04, jumpHeight: 0.3, color: "#ff9800" },
  celebrate:  { bodyBob: 0.1,   bodySpeed: 4,    wingFlap: 0.5,  wingSpeed: 8,    headTilt: 0,     eyeScale: 1.2, bodySquash: 0.06, jumpHeight: 0.5, color: "#ffd54f" },
  point:      { bodyBob: 0.02,  bodySpeed: 1,    wingFlap: 0.4,  wingSpeed: 1.5,  headTilt: 0.2,   eyeScale: 1,   bodySquash: 0,    jumpHeight: 0,   color: "#66bb6a" },
  think:      { bodyBob: 0.02,  bodySpeed: 0.8,  wingFlap: 0.02, wingSpeed: 0.5,  headTilt: -0.1,  eyeScale: 0.8, bodySquash: 0,    jumpHeight: 0,   color: "#ab47bc" },
  wave:       { bodyBob: 0.04,  bodySpeed: 2,    wingFlap: 0.6,  wingSpeed: 6,    headTilt: 0.05,  eyeScale: 1.1, bodySquash: 0.02, jumpHeight: 0.2, color: "#29b6f6" },
  surprised:  { bodyBob: 0.08,  bodySpeed: 5,    wingFlap: 0.4,  wingSpeed: 10,   headTilt: 0,     eyeScale: 1.5, bodySquash: 0.08, jumpHeight: 0.4, color: "#ef5350" },
  sad:        { bodyBob: 0.01,  bodySpeed: 0.6,  wingFlap: 0.02, wingSpeed: 0.3,  headTilt: -0.2,  eyeScale: 0.7, bodySquash: -0.03,jumpHeight: 0,   color: "#78909c" },
};

// ---------------------------------------------------------------------------
// Owl3D Component
// ---------------------------------------------------------------------------

const Owl3DCharacter = ({ position = [-3, 0.8, 2] as [number, number, number] }) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  // Subscribe to character store
  const mood = useCharacterStore((s) => s.mood);
  const animKey = useCharacterStore((s) => s.animationKey);

  // Current & target animation params (lerp for smooth transitions)
  const currentAnim = useRef<MoodAnim>({ ...MOOD_ANIMS.idle });
  const jumpTimer = useRef(0);

  // Trigger jump on mood change
  useEffect(() => {
    const target = MOOD_ANIMS[mood] || MOOD_ANIMS.idle;
    if (target.jumpHeight > 0) {
      jumpTimer.current = 1; // 1 second jump
    }
  }, [mood, animKey]);

  useFrame((_, delta) => {
    const target = MOOD_ANIMS[mood] || MOOD_ANIMS.idle;
    const cur = currentAnim.current;
    const lerp = 1 - Math.exp(-5 * delta);

    // Lerp all params
    cur.bodyBob += (target.bodyBob - cur.bodyBob) * lerp;
    cur.bodySpeed += (target.bodySpeed - cur.bodySpeed) * lerp;
    cur.wingFlap += (target.wingFlap - cur.wingFlap) * lerp;
    cur.wingSpeed += (target.wingSpeed - cur.wingSpeed) * lerp;
    cur.headTilt += (target.headTilt - cur.headTilt) * lerp;
    cur.eyeScale += (target.eyeScale - cur.eyeScale) * lerp;
    cur.bodySquash += (target.bodySquash - cur.bodySquash) * lerp;

    const t = performance.now() * 0.001;

    // Body bob + jump
    let yOffset = Math.sin(t * cur.bodySpeed) * cur.bodyBob;
    if (jumpTimer.current > 0) {
      jumpTimer.current -= delta;
      const jumpPhase = Math.max(0, jumpTimer.current);
      yOffset += Math.sin(jumpPhase * Math.PI) * target.jumpHeight;
    }

    if (groupRef.current) {
      groupRef.current.position.y = position[1] + yOffset;
    }

    // Body squash & stretch
    if (bodyRef.current) {
      bodyRef.current.scale.y = 1 + cur.bodySquash * Math.sin(t * cur.bodySpeed * 2);
      bodyRef.current.scale.x = 1 - cur.bodySquash * 0.5 * Math.sin(t * cur.bodySpeed * 2);
    }

    // Head tilt
    if (headRef.current) {
      headRef.current.rotation.z += (cur.headTilt - headRef.current.rotation.z) * lerp;
      // Subtle look-around
      headRef.current.rotation.y = Math.sin(t * 0.4) * 0.08;
    }

    // Wing flap
    if (leftWingRef.current) {
      leftWingRef.current.rotation.z = Math.sin(t * cur.wingSpeed) * cur.wingFlap + 0.3;
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.z = -Math.sin(t * cur.wingSpeed) * cur.wingFlap - 0.3;
    }

    // Eye blink (every ~4s)
    const blink = Math.sin(t * 3.5) > 0.96;
    const pupilScale = blink ? 0.1 : cur.eyeScale;
    if (leftPupilRef.current) leftPupilRef.current.scale.setScalar(pupilScale);
    if (rightPupilRef.current) rightPupilRef.current.scale.setScalar(pupilScale);

    // Glow color & intensity based on mood
    if (glowRef.current) {
      glowRef.current.color.set(target.color);
      glowRef.current.intensity += (
        (mood === "idle" ? 0.3 : mood === "celebrate" ? 1.5 : 0.8) - glowRef.current.intensity
      ) * lerp;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Mood glow light */}
      <pointLight ref={glowRef} position={[0, 0.5, 1]} intensity={0.3} distance={4} decay={2} />

      {/* Body */}
      <mesh ref={bodyRef} castShadow>
        <sphereGeometry args={[0.5, 16, 14]} />
        <meshStandardMaterial color="#8d6e4c" roughness={0.6} />
      </mesh>

      {/* Belly patch */}
      <mesh position={[0, -0.05, 0.4]}>
        <sphereGeometry args={[0.3, 12, 10]} />
        <meshStandardMaterial color="#d4b896" roughness={0.7} />
      </mesh>

      {/* Head */}
      <group ref={headRef} position={[0, 0.55, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.35, 14, 12]} />
          <meshStandardMaterial color="#a0845c" roughness={0.55} />
        </mesh>

        {/* Ear tufts */}
        <mesh position={[-0.2, 0.3, 0]} rotation-z={0.3}>
          <coneGeometry args={[0.06, 0.2, 6]} />
          <meshStandardMaterial color="#6d4c2a" roughness={0.7} />
        </mesh>
        <mesh position={[0.2, 0.3, 0]} rotation-z={-0.3}>
          <coneGeometry args={[0.06, 0.2, 6]} />
          <meshStandardMaterial color="#6d4c2a" roughness={0.7} />
        </mesh>

        {/* Eyes — white */}
        <mesh position={[-0.12, 0.05, 0.3]}>
          <sphereGeometry args={[0.1, 10, 10]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.12, 0.05, 0.3]}>
          <sphereGeometry args={[0.1, 10, 10]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        {/* Pupils */}
        <mesh ref={leftPupilRef} position={[-0.12, 0.05, 0.38]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <mesh ref={rightPupilRef} position={[0.12, 0.05, 0.38]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>

        {/* Beak */}
        <mesh position={[0, -0.08, 0.35]} rotation-x={0.3}>
          <coneGeometry args={[0.06, 0.1, 6]} />
          <meshStandardMaterial color="#f9a825" roughness={0.4} />
        </mesh>

        {/* Graduation cap */}
        <group position={[0, 0.32, 0]} rotation-z={0.1}>
          {/* Cap base */}
          <mesh>
            <boxGeometry args={[0.4, 0.03, 0.4]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.3} />
          </mesh>
          {/* Cap top */}
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 0.1, 8]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.3} />
          </mesh>
          {/* Tassel */}
          <mesh position={[0.18, -0.05, 0]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshStandardMaterial color="#ffd54f" />
          </mesh>
        </group>
      </group>

      {/* Left wing */}
      <mesh ref={leftWingRef} position={[-0.45, 0.1, 0]} rotation-z={0.3} castShadow>
        <sphereGeometry args={[0.25, 10, 8]} />
        <meshStandardMaterial color="#7a5c3a" roughness={0.65} />
      </mesh>

      {/* Right wing */}
      <mesh ref={rightWingRef} position={[0.45, 0.1, 0]} rotation-z={-0.3} castShadow>
        <sphereGeometry args={[0.25, 10, 8]} />
        <meshStandardMaterial color="#7a5c3a" roughness={0.65} />
      </mesh>

      {/* Feet */}
      <mesh position={[-0.15, -0.5, 0.15]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color="#f9a825" roughness={0.5} />
      </mesh>
      <mesh position={[0.15, -0.5, 0.15]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color="#f9a825" roughness={0.5} />
      </mesh>
    </group>
  );
};

export default Owl3DCharacter;
