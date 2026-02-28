import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCharacterStore, CharacterMood } from "@/lib/characterStore";

/**
 * Fox3DCompanion — a small fox that sits near the owl and reacts to game events.
 * Expressive tail wag, ear perks, and bounce animations per mood.
 */

interface MoodParams {
  tailWag: number;
  tailSpeed: number;
  earPerk: number;
  bodyBounce: number;
  bounceSpeed: number;
  jumpHeight: number;
  color: string;
}

const MOOD_PARAMS: Record<CharacterMood, MoodParams> = {
  idle:      { tailWag: 0.2,  tailSpeed: 1.5, earPerk: 0,    bodyBounce: 0.02, bounceSpeed: 1,   jumpHeight: 0,   color: "#e65100" },
  talk:      { tailWag: 0.3,  tailSpeed: 2.5, earPerk: 0.15, bodyBounce: 0.03, bounceSpeed: 2,   jumpHeight: 0,   color: "#ff8f00" },
  react:     { tailWag: 0.5,  tailSpeed: 4,   earPerk: 0.25, bodyBounce: 0.05, bounceSpeed: 3,   jumpHeight: 0.2, color: "#ff6d00" },
  celebrate: { tailWag: 0.7,  tailSpeed: 6,   earPerk: 0.3,  bodyBounce: 0.08, bounceSpeed: 4,   jumpHeight: 0.4, color: "#ffd54f" },
  point:     { tailWag: 0.15, tailSpeed: 1,   earPerk: 0.2,  bodyBounce: 0.01, bounceSpeed: 1,   jumpHeight: 0,   color: "#ff8f00" },
  think:     { tailWag: 0.05, tailSpeed: 0.5, earPerk: -0.1, bodyBounce: 0.01, bounceSpeed: 0.6, jumpHeight: 0,   color: "#bf360c" },
  wave:      { tailWag: 0.4,  tailSpeed: 3,   earPerk: 0.1,  bodyBounce: 0.04, bounceSpeed: 2.5, jumpHeight: 0.15,color: "#ff9800" },
  surprised: { tailWag: 0.6,  tailSpeed: 8,   earPerk: 0.35, bodyBounce: 0.06, bounceSpeed: 5,   jumpHeight: 0.3, color: "#ff3d00" },
  sad:       { tailWag: 0.05, tailSpeed: 0.4, earPerk: -0.2, bodyBounce: 0.01, bounceSpeed: 0.5, jumpHeight: 0,   color: "#795548" },
};

const Fox3DCompanion = ({ position = [-1.8, 0.2, 2.5] as [number, number, number] }) => {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const leftEarRef = useRef<THREE.Mesh>(null);
  const rightEarRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  const mood = useCharacterStore((s) => s.mood);
  const animKey = useCharacterStore((s) => s.animationKey);
  const cur = useRef<MoodParams>({ ...MOOD_PARAMS.idle });
  const jumpTimer = useRef(0);

  useEffect(() => {
    const target = MOOD_PARAMS[mood] || MOOD_PARAMS.idle;
    if (target.jumpHeight > 0) jumpTimer.current = 0.8;
  }, [mood, animKey]);

  useFrame((_, delta) => {
    const target = MOOD_PARAMS[mood] || MOOD_PARAMS.idle;
    const c = cur.current;
    const lerp = 1 - Math.exp(-5 * delta);
    const t = performance.now() * 0.001;

    // Lerp params
    c.tailWag += (target.tailWag - c.tailWag) * lerp;
    c.tailSpeed += (target.tailSpeed - c.tailSpeed) * lerp;
    c.earPerk += (target.earPerk - c.earPerk) * lerp;
    c.bodyBounce += (target.bodyBounce - c.bodyBounce) * lerp;
    c.bounceSpeed += (target.bounceSpeed - c.bounceSpeed) * lerp;

    // Body bounce + jump
    let yOff = Math.sin(t * c.bounceSpeed) * c.bodyBounce;
    if (jumpTimer.current > 0) {
      jumpTimer.current -= delta;
      yOff += Math.sin(Math.max(0, jumpTimer.current) * Math.PI / 0.8) * target.jumpHeight;
    }
    if (groupRef.current) groupRef.current.position.y = position[1] + yOff;

    // Body squash
    if (bodyRef.current) {
      bodyRef.current.scale.y = 1 + c.bodyBounce * Math.sin(t * c.bounceSpeed * 2);
      bodyRef.current.scale.x = 1 - c.bodyBounce * 0.4 * Math.sin(t * c.bounceSpeed * 2);
    }

    // Tail wag
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * c.tailSpeed) * c.tailWag;
      tailRef.current.rotation.x = Math.sin(t * c.tailSpeed * 0.7) * c.tailWag * 0.3;
    }

    // Ear perk
    if (leftEarRef.current) leftEarRef.current.rotation.z = 0.25 + c.earPerk;
    if (rightEarRef.current) rightEarRef.current.rotation.z = -0.25 - c.earPerk;

    // Glow
    if (glowRef.current) {
      glowRef.current.color.set(target.color);
      glowRef.current.intensity += ((mood === "idle" ? 0.2 : 0.6) - glowRef.current.intensity) * lerp;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={0.55}>
      <pointLight ref={glowRef} position={[0, 0.3, 0.8]} intensity={0.2} distance={3} decay={2} />

      {/* Body */}
      <mesh ref={bodyRef} castShadow>
        <sphereGeometry args={[0.4, 14, 12]} />
        <meshStandardMaterial color="#e65100" roughness={0.6} />
      </mesh>

      {/* Belly */}
      <mesh position={[0, -0.05, 0.32]}>
        <sphereGeometry args={[0.25, 10, 8]} />
        <meshStandardMaterial color="#fff3e0" roughness={0.7} />
      </mesh>

      {/* Head */}
      <group position={[0, 0.45, 0.1]}>
        <mesh castShadow>
          <sphereGeometry args={[0.28, 12, 10]} />
          <meshStandardMaterial color="#ef6c00" roughness={0.55} />
        </mesh>

        {/* Snout */}
        <mesh position={[0, -0.08, 0.25]} rotation-x={0.2}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#fff3e0" roughness={0.6} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.04, 0.36]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.3} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.1, 0.05, 0.22]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.1, 0.05, 0.22]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.1, 0.05, 0.27]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <mesh position={[0.1, 0.05, 0.27]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>

        {/* Ears */}
        <mesh ref={leftEarRef} position={[-0.18, 0.22, 0]} rotation-z={0.25}>
          <coneGeometry args={[0.08, 0.22, 6]} />
          <meshStandardMaterial color="#e65100" roughness={0.6} />
        </mesh>
        <mesh ref={rightEarRef} position={[0.18, 0.22, 0]} rotation-z={-0.25}>
          <coneGeometry args={[0.08, 0.22, 6]} />
          <meshStandardMaterial color="#e65100" roughness={0.6} />
        </mesh>
        {/* Inner ears */}
        <mesh position={[-0.16, 0.2, 0.02]} rotation-z={0.25}>
          <coneGeometry args={[0.04, 0.12, 6]} />
          <meshStandardMaterial color="#ffab91" roughness={0.7} />
        </mesh>
        <mesh position={[0.16, 0.2, 0.02]} rotation-z={-0.25}>
          <coneGeometry args={[0.04, 0.12, 6]} />
          <meshStandardMaterial color="#ffab91" roughness={0.7} />
        </mesh>
      </group>

      {/* Tail */}
      <group ref={tailRef} position={[0, 0, -0.35]}>
        <mesh rotation-x={-0.4} position={[0, 0.15, -0.1]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#e65100" roughness={0.6} />
        </mesh>
        <mesh rotation-x={-0.6} position={[0, 0.3, -0.15]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#fff3e0" roughness={0.7} />
        </mesh>
      </group>

      {/* Feet */}
      <mesh position={[-0.12, -0.4, 0.1]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color="#4e342e" roughness={0.6} />
      </mesh>
      <mesh position={[0.12, -0.4, 0.1]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshStandardMaterial color="#4e342e" roughness={0.6} />
      </mesh>
    </group>
  );
};

export default Fox3DCompanion;
