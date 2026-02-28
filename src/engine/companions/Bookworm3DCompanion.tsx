import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCharacterStore, CharacterMood } from "@/lib/characterStore";

/**
 * Bookworm3DCompanion — a cute segmented bookworm with glasses.
 * Wiggles more when excited, curls up when sad, bounces on celebrate.
 */

interface MoodParams {
  wiggle: number;
  wiggleSpeed: number;
  stretch: number;
  bounce: number;
  jumpHeight: number;
}

const MOOD_PARAMS: Record<CharacterMood, MoodParams> = {
  idle:      { wiggle: 0.08, wiggleSpeed: 1.2, stretch: 1,    bounce: 0.02, jumpHeight: 0   },
  talk:      { wiggle: 0.15, wiggleSpeed: 2,   stretch: 1.05, bounce: 0.03, jumpHeight: 0   },
  react:     { wiggle: 0.25, wiggleSpeed: 3,   stretch: 1.1,  bounce: 0.05, jumpHeight: 0.15},
  celebrate: { wiggle: 0.4,  wiggleSpeed: 5,   stretch: 1.15, bounce: 0.08, jumpHeight: 0.3 },
  point:     { wiggle: 0.1,  wiggleSpeed: 1,   stretch: 1.08, bounce: 0.02, jumpHeight: 0   },
  think:     { wiggle: 0.04, wiggleSpeed: 0.6, stretch: 0.95, bounce: 0.01, jumpHeight: 0   },
  wave:      { wiggle: 0.2,  wiggleSpeed: 3,   stretch: 1.05, bounce: 0.04, jumpHeight: 0.1 },
  surprised: { wiggle: 0.35, wiggleSpeed: 7,   stretch: 1.2,  bounce: 0.06, jumpHeight: 0.2 },
  sad:       { wiggle: 0.03, wiggleSpeed: 0.4, stretch: 0.85, bounce: 0.01, jumpHeight: 0   },
};

const SEGMENT_COUNT = 5;
const SEGMENT_COLORS = ["#7cb342", "#8bc34a", "#9ccc65", "#aed581", "#c5e1a5"];

const Bookworm3DCompanion = ({ position = [-2.8, -0.1, 2] as [number, number, number] }) => {
  const groupRef = useRef<THREE.Group>(null);
  const segmentRefs = useRef<(THREE.Mesh | null)[]>([]);
  const headRef = useRef<THREE.Group>(null);

  const mood = useCharacterStore((s) => s.mood);
  const animKey = useCharacterStore((s) => s.animationKey);
  const cur = useRef<MoodParams>({ ...MOOD_PARAMS.idle });
  const jumpTimer = useRef(0);

  useEffect(() => {
    const target = MOOD_PARAMS[mood] || MOOD_PARAMS.idle;
    if (target.jumpHeight > 0) jumpTimer.current = 0.7;
  }, [mood, animKey]);

  useFrame((_, delta) => {
    const target = MOOD_PARAMS[mood] || MOOD_PARAMS.idle;
    const c = cur.current;
    const lerp = 1 - Math.exp(-5 * delta);
    const t = performance.now() * 0.001;

    c.wiggle += (target.wiggle - c.wiggle) * lerp;
    c.wiggleSpeed += (target.wiggleSpeed - c.wiggleSpeed) * lerp;
    c.stretch += (target.stretch - c.stretch) * lerp;
    c.bounce += (target.bounce - c.bounce) * lerp;

    // Jump
    let yOff = Math.sin(t * c.wiggleSpeed * 0.8) * c.bounce;
    if (jumpTimer.current > 0) {
      jumpTimer.current -= delta;
      yOff += Math.sin(Math.max(0, jumpTimer.current) * Math.PI / 0.7) * target.jumpHeight;
    }
    if (groupRef.current) groupRef.current.position.y = position[1] + yOff;

    // Segments wiggle — each offset by phase
    for (let i = 0; i < SEGMENT_COUNT; i++) {
      const seg = segmentRefs.current[i];
      if (!seg) continue;
      const phase = i * 0.8;
      seg.position.x = Math.sin(t * c.wiggleSpeed + phase) * c.wiggle * (i * 0.3);
      seg.position.y = Math.cos(t * c.wiggleSpeed * 0.7 + phase) * c.wiggle * 0.2;
      seg.scale.setScalar(c.stretch - i * 0.02);
    }

    // Head wobble
    if (headRef.current) {
      headRef.current.rotation.z = Math.sin(t * c.wiggleSpeed * 1.2) * c.wiggle * 0.5;
      headRef.current.rotation.x = Math.sin(t * 0.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={0.45}>
      {/* Body segments */}
      {SEGMENT_COLORS.map((color, i) => (
        <mesh
          key={i}
          ref={(el) => { segmentRefs.current[i] = el; }}
          position={[-i * 0.22, 0, 0]}
          castShadow
        >
          <sphereGeometry args={[0.14 - i * 0.01, 10, 8]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}

      {/* Head */}
      <group ref={headRef} position={[0.2, 0.08, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.18, 12, 10]} />
          <meshStandardMaterial color="#558b2f" roughness={0.5} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.06, 0.04, 0.15]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.06, 0.04, 0.15]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.06, 0.04, 0.19]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <mesh position={[0.06, 0.04, 0.19]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>

        {/* Glasses frames */}
        {[-0.06, 0.06].map((gx, i) => (
          <mesh key={i} position={[gx, 0.04, 0.16]}>
            <torusGeometry args={[0.055, 0.008, 8, 16]} />
            <meshStandardMaterial color="#5d4037" roughness={0.4} metalness={0.3} />
          </mesh>
        ))}
        {/* Glasses bridge */}
        <mesh position={[0, 0.04, 0.17]}>
          <boxGeometry args={[0.04, 0.008, 0.008]} />
          <meshStandardMaterial color="#5d4037" roughness={0.4} metalness={0.3} />
        </mesh>

        {/* Smile */}
        <mesh position={[0, -0.04, 0.17]} rotation-x={0.1}>
          <torusGeometry args={[0.04, 0.008, 6, 12, Math.PI]} />
          <meshStandardMaterial color="#33691e" roughness={0.5} />
        </mesh>

        {/* Tiny hat / book on head */}
        <mesh position={[0, 0.16, 0]} rotation-z={0.15}>
          <boxGeometry args={[0.14, 0.04, 0.1]} />
          <meshStandardMaterial color="#8d6e63" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.18, 0]} rotation-z={0.15}>
          <boxGeometry args={[0.15, 0.01, 0.11]} />
          <meshStandardMaterial color="#d32f2f" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
};

export default Bookworm3DCompanion;
