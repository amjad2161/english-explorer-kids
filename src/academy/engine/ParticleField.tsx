import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAcademyStore } from "../store/academyStore";
import { worldRegistry } from "../registries/worldRegistry";

export default function ParticleField() {
  const activeWorld = useAcademyStore((s) => s.activeWorld);
  const reducedMotion = useAcademyStore((s) => s.reducedMotion);
  const points = useRef<THREE.Points>(null);
  const color = worldRegistry[activeWorld].accentColor;

  const geometry = useMemo(() => {
    const count = 400;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = Math.random() * 25 + 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((state) => {
    if (!points.current || reducedMotion) return;
    points.current.rotation.y = state.clock.elapsedTime * 0.02;
    const pos = points.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      pos.setY(i, y + Math.sin(state.clock.elapsedTime + i) * 0.002);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial size={0.12} color={color} transparent opacity={0.55} depthWrite={false} />
    </points>
  );
}
