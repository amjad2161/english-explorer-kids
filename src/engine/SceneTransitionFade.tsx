import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneDirector } from "./SceneDirector";

/**
 * SceneTransitionFade — cinematic fade-through-black with dissolving particles.
 *
 * Lifecycle (800ms total):
 *   0–400ms  → fade to black + particles burst outward
 *   400–800ms → fade from black + particles drift inward and vanish
 */

const PARTICLE_COUNT = 120;

const SceneTransitionFade = ({ active }: { active: boolean }) => {
  const quadRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const pointsMatRef = useRef<THREE.PointsMaterial>(null);

  const progress = useSceneDirector((s) => s.transitionProgress);

  // Particle geometry — positions + velocities baked once
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Start clustered at center
      pos[i * 3] = (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 2] = 0;
      // Random outward velocity
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.3 + Math.random() * 0.7;
      vel[i * 3] = Math.cos(angle) * speed;
      vel[i * 3 + 1] = Math.sin(angle) * speed;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }
    return { positions: pos, velocities: vel };
  }, []);

  // Animation phase ref to track internal timing
  const phaseRef = useRef({ t: 0, wasActive: false, direction: 0 }); // direction: 1=fading in, -1=fading out

  useFrame((_, delta) => {
    if (!matRef.current || !quadRef.current) return;

    const p = phaseRef.current;

    // Detect transition start
    if (active && !p.wasActive) {
      p.t = 0;
      p.direction = 1; // fade to black
      p.wasActive = true;
    }
    if (!active && p.wasActive) {
      p.direction = -1; // fade from black
      p.wasActive = false;
    }

    // Advance timer
    if (p.direction !== 0) {
      p.t += delta;
    }

    // Calculate opacity based on phase
    let opacity = 0;
    let particleSpread = 0;
    let particleOpacity = 0;

    if (p.direction === 1) {
      // Fading to black (0→0.4s)
      const t01 = Math.min(1, p.t / 0.4);
      // Ease-out cubic
      opacity = t01 * t01 * (3 - 2 * t01) * 0.85;
      particleSpread = t01;
      particleOpacity = Math.sin(t01 * Math.PI) * 0.8;

      if (p.t >= 0.4) {
        // Hold at peak briefly
        opacity = 0.85;
      }
    } else if (p.direction === -1) {
      // Fading from black (0→0.5s)
      const t01 = Math.min(1, p.t / 0.5);
      // Ease-in cubic for slower reveal
      const ease = 1 - (1 - t01) * (1 - t01);
      opacity = 0.85 * (1 - ease);
      particleSpread = 1 - t01 * 0.5;
      particleOpacity = (1 - ease) * 0.5;

      if (t01 >= 1) {
        p.direction = 0;
        p.t = 0;
        opacity = 0;
        particleOpacity = 0;
      }
    }

    // Apply quad fade
    matRef.current.opacity = opacity;
    quadRef.current.visible = opacity > 0.005;

    // Animate particles
    if (pointsRef.current && pointsMatRef.current) {
      pointsRef.current.visible = particleOpacity > 0.01;
      pointsMatRef.current.opacity = particleOpacity;

      const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        posAttr.array[i * 3] = velocities[i * 3] * particleSpread * 6;
        posAttr.array[i * 3 + 1] = velocities[i * 3 + 1] * particleSpread * 4;
        posAttr.array[i * 3 + 2] = velocities[i * 3 + 2] * particleSpread * 2;
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Full-screen black overlay */}
      <mesh ref={quadRef} position={[0, 0, 4]} renderOrder={998} visible={false}>
        <planeGeometry args={[30, 30]} />
        <meshBasicMaterial
          ref={matRef}
          color="#050510"
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      {/* Dissolve particles */}
      <points ref={pointsRef} position={[0, 2, 3.5]} renderOrder={999} visible={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={positions}
            count={PARTICLE_COUNT}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={pointsMatRef}
          size={0.08}
          color="#ffd54f"
          transparent
          opacity={0}
          sizeAttenuation
          depthTest={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
};

export default SceneTransitionFade;
