import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCharacterStore, CharacterMood } from "@/lib/characterStore";

/**
 * Mouse3DCompanion — a tiny librarian mouse with big round ears.
 * Nose twitches, ears twitch, hops on celebrate.
 */

interface MoodParams {
  noseTwitch: number;
  earTwitch: number;
  bodyBob: number;
  bobSpeed: number;
  jumpHeight: number;
  tailSwing: number;
}

const MOOD_PARAMS: Record<CharacterMood, MoodParams> = {
  idle:      { noseTwitch: 0.05, earTwitch: 0.03, bodyBob: 0.015, bobSpeed: 1.5,  jumpHeight: 0,   tailSwing: 0.1  },
  talk:      { noseTwitch: 0.1,  earTwitch: 0.08, bodyBob: 0.025, bobSpeed: 2.5,  jumpHeight: 0,   tailSwing: 0.2  },
  react:     { noseTwitch: 0.15, earTwitch: 0.15, bodyBob: 0.04,  bobSpeed: 3,    jumpHeight: 0.15,tailSwing: 0.3  },
  celebrate: { noseTwitch: 0.2,  earTwitch: 0.2,  bodyBob: 0.06,  bobSpeed: 4.5,  jumpHeight: 0.35,tailSwing: 0.5  },
  point:     { noseTwitch: 0.08, earTwitch: 0.1,  bodyBob: 0.02,  bobSpeed: 1.2,  jumpHeight: 0,   tailSwing: 0.15 },
  think:     { noseTwitch: 0.12, earTwitch: 0.02, bodyBob: 0.01,  bobSpeed: 0.8,  jumpHeight: 0,   tailSwing: 0.05 },
  wave:      { noseTwitch: 0.1,  earTwitch: 0.12, bodyBob: 0.03,  bobSpeed: 2.5,  jumpHeight: 0.1, tailSwing: 0.25 },
  surprised: { noseTwitch: 0.25, earTwitch: 0.25, bodyBob: 0.05,  bobSpeed: 6,    jumpHeight: 0.25,tailSwing: 0.4  },
  sad:       { noseTwitch: 0.02, earTwitch: 0.01, bodyBob: 0.008, bobSpeed: 0.5,  jumpHeight: 0,   tailSwing: 0.03 },
};

const Mouse3DCompanion = ({ position = [-4, 0, 2.8] as [number, number, number] }) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const noseRef = useRef<THREE.Mesh>(null);
  const leftEarRef = useRef<THREE.Mesh>(null);
  const rightEarRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Group>(null);

  const mood = useCharacterStore((s) => s.mood);
  const animKey = useCharacterStore((s) => s.animationKey);
  const cur = useRef<MoodParams>({ ...MOOD_PARAMS.idle });
  const jumpTimer = useRef(0);

  useEffect(() => {
    const target = MOOD_PARAMS[mood] || MOOD_PARAMS.idle;
    if (target.jumpHeight > 0) jumpTimer.current = 0.6;
  }, [mood, animKey]);

  useFrame((_, delta) => {
    const target = MOOD_PARAMS[mood] || MOOD_PARAMS.idle;
    const c = cur.current;
    const lerp = 1 - Math.exp(-5 * delta);
    const t = performance.now() * 0.001;

    c.noseTwitch += (target.noseTwitch - c.noseTwitch) * lerp;
    c.earTwitch += (target.earTwitch - c.earTwitch) * lerp;
    c.bodyBob += (target.bodyBob - c.bodyBob) * lerp;
    c.bobSpeed += (target.bobSpeed - c.bobSpeed) * lerp;
    c.tailSwing += (target.tailSwing - c.tailSwing) * lerp;

    // Body bob + jump
    let yOff = Math.sin(t * c.bobSpeed) * c.bodyBob;
    if (jumpTimer.current > 0) {
      jumpTimer.current -= delta;
      yOff += Math.sin(Math.max(0, jumpTimer.current) * Math.PI / 0.6) * target.jumpHeight;
    }
    if (groupRef.current) groupRef.current.position.y = position[1] + yOff;

    // Body squash
    if (bodyRef.current) {
      bodyRef.current.scale.y = 1 + c.bodyBob * Math.sin(t * c.bobSpeed * 2) * 2;
    }

    // Nose twitch (fast small oscillation)
    if (noseRef.current) {
      noseRef.current.position.x = Math.sin(t * 12) * c.noseTwitch * 0.02;
      noseRef.current.position.y = -0.06 + Math.abs(Math.sin(t * 8)) * c.noseTwitch * 0.01;
    }

    // Ear twitch
    if (leftEarRef.current) {
      leftEarRef.current.rotation.z = 0.3 + Math.sin(t * 3.5) * c.earTwitch;
    }
    if (rightEarRef.current) {
      rightEarRef.current.rotation.z = -0.3 - Math.sin(t * 3.7) * c.earTwitch;
    }

    // Tail swing
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * c.bobSpeed * 1.5) * c.tailSwing;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={0.4}>
      {/* Body */}
      <mesh ref={bodyRef} castShadow>
        <sphereGeometry args={[0.3, 12, 10]} />
        <meshStandardMaterial color="#9e9e9e" roughness={0.6} />
      </mesh>

      {/* Belly */}
      <mesh position={[0, -0.04, 0.24]}>
        <sphereGeometry args={[0.2, 10, 8]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.7} />
      </mesh>

      {/* Head */}
      <group position={[0, 0.35, 0.05]}>
        <mesh castShadow>
          <sphereGeometry args={[0.22, 12, 10]} />
          <meshStandardMaterial color="#bdbdbd" roughness={0.55} />
        </mesh>

        {/* Big round ears */}
        <mesh ref={leftEarRef} position={[-0.18, 0.18, 0]} rotation-z={0.3}>
          <sphereGeometry args={[0.12, 10, 8]} />
          <meshStandardMaterial color="#9e9e9e" roughness={0.6} />
        </mesh>
        <mesh position={[-0.17, 0.17, 0.02]} rotation-z={0.3}>
          <sphereGeometry args={[0.08, 8, 6]} />
          <meshStandardMaterial color="#f8bbd0" roughness={0.7} />
        </mesh>
        <mesh ref={rightEarRef} position={[0.18, 0.18, 0]} rotation-z={-0.3}>
          <sphereGeometry args={[0.12, 10, 8]} />
          <meshStandardMaterial color="#9e9e9e" roughness={0.6} />
        </mesh>
        <mesh position={[0.17, 0.17, 0.02]} rotation-z={-0.3}>
          <sphereGeometry args={[0.08, 8, 6]} />
          <meshStandardMaterial color="#f8bbd0" roughness={0.7} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.07, 0.03, 0.18]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.07, 0.03, 0.18]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.07, 0.03, 0.21]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <mesh position={[0.07, 0.03, 0.21]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>

        {/* Nose */}
        <mesh ref={noseRef} position={[0, -0.06, 0.22]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#f48fb1" roughness={0.4} />
        </mesh>

        {/* Whiskers (simplified as thin boxes) */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.04, -0.06, 0.2]}>
            <mesh rotation-z={side * 0.15}>
              <boxGeometry args={[0.12, 0.005, 0.005]} />
              <meshStandardMaterial color="#757575" roughness={0.5} />
            </mesh>
            <mesh rotation-z={side * -0.1} position={[0, -0.02, 0]}>
              <boxGeometry args={[0.1, 0.005, 0.005]} />
              <meshStandardMaterial color="#757575" roughness={0.5} />
            </mesh>
          </group>
        ))}

        {/* Tiny glasses (librarian) */}
        {[-0.07, 0.07].map((gx, i) => (
          <mesh key={i} position={[gx, 0.03, 0.19]}>
            <torusGeometry args={[0.042, 0.005, 6, 12]} />
            <meshStandardMaterial color="#795548" roughness={0.4} metalness={0.2} />
          </mesh>
        ))}
        <mesh position={[0, 0.03, 0.2]}>
          <boxGeometry args={[0.03, 0.005, 0.005]} />
          <meshStandardMaterial color="#795548" roughness={0.4} metalness={0.2} />
        </mesh>
      </group>

      {/* Tail */}
      <group ref={tailRef} position={[0, -0.15, -0.28]}>
        <mesh rotation-x={-0.5}>
          <cylinderGeometry args={[0.02, 0.01, 0.35, 6]} />
          <meshStandardMaterial color="#f8bbd0" roughness={0.6} />
        </mesh>
      </group>

      {/* Feet */}
      <mesh position={[-0.1, -0.3, 0.08]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#f8bbd0" roughness={0.6} />
      </mesh>
      <mesh position={[0.1, -0.3, 0.08]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#f8bbd0" roughness={0.6} />
      </mesh>
    </group>
  );
};

export default Mouse3DCompanion;
