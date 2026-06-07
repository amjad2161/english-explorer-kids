import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sky, Stars, Cloud } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

interface Props {
  groundColor?: string;
  skyTint?: string;
  fogColor?: string;
  showStars?: boolean;
  children?: React.ReactNode;
}

export function GroundPlane({ color = "#3d6b4f" }: { color?: string }) {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  );
}

export function FloatingIsland({
  position,
  radius = 8,
  color = "#5d8a66",
}: {
  position: [number, number, number];
  radius?: number;
  color?: string;
}) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius * 1.1, 2, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, -1.8, 0]}>
        <coneGeometry args={[radius * 0.85, 3, 32]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>
    </group>
  );
}

export function PortalRing({
  position,
  color = "#f5d76e",
}: {
  position: [number, number, number];
  color?: string;
}) {
  const ring = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring.current) ring.current.rotation.z = t * 0.6;
    if (inner.current) {
      inner.current.rotation.z = -t * 1.2;
      inner.current.scale.setScalar(1 + Math.sin(t * 2) * 0.06);
    }
  });

  return (
    <group position={position}>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.15, 16, 48]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      <mesh ref={inner} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.6, 0.08, 12, 32]} />
        <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={0.9} transparent opacity={0.7} />
      </mesh>
      <pointLight intensity={1.2} color={color} distance={12} />
    </group>
  );
}

export default function EnvironmentBase({
  groundColor = "#3d6b4f",
  skyTint = "#87ceeb",
  showStars = false,
  children,
}: Props) {
  return (
    <>
      <color attach="background" args={[skyTint]} />
      <fog attach="fog" args={[skyTint, 25, 90]} />
      <Sky sunPosition={[80, 40, 60]} turbidity={6} rayleigh={1.2} />
      {showStars && <Stars radius={80} depth={40} count={3000} factor={3} />}
      <Cloud position={[-15, 18, -10]} opacity={0.45} speed={0.15} />
      <Cloud position={[20, 22, 5]} opacity={0.35} speed={0.1} />
      <ambientLight intensity={0.45} />
      <directionalLight
        castShadow
        position={[12, 24, 8]}
        intensity={1.4}
        shadow-mapSize={[1024, 1024]}
      />
      <GroundPlane color={groundColor} />
      {children}
    </>
  );
}
