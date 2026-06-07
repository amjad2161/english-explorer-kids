import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function StylizedTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.22, 1.2, 6]} />
        <meshStandardMaterial color="#6d4c41" />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <coneGeometry args={[0.9, 1.4, 8]} />
        <meshStandardMaterial color="#2ecc71" />
      </mesh>
    </group>
  );
}

export function CrystalCluster({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.4;
  });
  return (
    <group ref={ref} position={position}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[i * 0.4 - 0.4, 0.5 + i * 0.2, 0]} rotation={[0.2, i * 0.5, 0]}>
          <coneGeometry args={[0.25, 1 + i * 0.3, 4]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

export function AcademyBuilding({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[3, 2.4, 2.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 2.6, 0]}>
        <coneGeometry args={[2.2, 1.2, 4]} />
        <meshStandardMaterial color="#dfe6e9" />
      </mesh>
      <pointLight position={[0, 2, 1.5]} intensity={0.6} color={color} distance={8} />
    </group>
  );
}

export function MusicalNote({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(s.clock.elapsedTime * 2 + position[0]) * 0.3;
      ref.current.rotation.y = s.clock.elapsedTime;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[0.35, 0.08, 8, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </mesh>
  );
}

export function GlowingOrb({
  position,
  color,
  intensity = 0.5,
}: {
  position: [number, number, number];
  color: string;
  intensity?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = intensity + Math.sin(s.clock.elapsedTime * 2.5) * 0.15;
    ref.current.position.y = position[1] + Math.sin(s.clock.elapsedTime + position[0]) * 0.15;
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.55, 24, 24]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} transparent opacity={0.85} />
    </mesh>
  );
}

export function LabBeaker({ position }: { position: [number, number, number] }) {
  const liquid = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!liquid.current) return;
    const mat = liquid.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.35 + Math.sin(s.clock.elapsedTime * 3) * 0.2;
  });
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.35, 0.45, 1.2, 16]} />
        <meshStandardMaterial color="#dfe6e9" transparent opacity={0.55} />
      </mesh>
      <mesh ref={liquid} position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.3, 0.38, 0.7, 16]} />
        <meshStandardMaterial color="#74b9ff" emissive="#0984e3" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

export function AnimalStatue({
  position,
  color,
  scale = 1,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.4) * 0.15;
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.9, 0.7, 1.4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.1, 0.5]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export function GraduationArch({ position }: { position: [number, number, number] }) {
  const banner = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (banner.current) banner.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.5) * 0.08;
  });
  return (
    <group position={position}>
      <mesh position={[-2.5, 2.5, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 5, 8]} />
        <meshStandardMaterial color="#b8860b" metalness={0.6} />
      </mesh>
      <mesh position={[2.5, 2.5, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 5, 8]} />
        <meshStandardMaterial color="#b8860b" metalness={0.6} />
      </mesh>
      <mesh ref={banner} position={[0, 4.8, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[5.2, 0.8, 0.15]} />
        <meshStandardMaterial color="#e17055" emissive="#d63031" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}
