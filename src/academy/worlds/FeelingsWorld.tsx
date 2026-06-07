import EnvironmentBase, { FloatingIsland, PortalRing } from "./shared/EnvironmentBase";
import { GlowingOrb } from "./shared/WorldDecor";
import { worldRegistry } from "../registries/worldRegistry";
import { useAcademyStore } from "../store/academyStore";

export default function FeelingsWorld() {
  const pos = worldRegistry.feelings.hubPosition;
  const warmth = useAcademyStore((s) => s.empathyWarmth);
  const glow = 0.3 + warmth * 0.7;

  return (
    <EnvironmentBase groundColor="#fce4ec" skyTint="#f8bbd9">
      <group position={pos}>
        <FloatingIsland position={[0, 0, 0]} radius={9} color="#fd79a8" />
        <mesh position={[0, 3, 0]}>
          <sphereGeometry args={[2, 32, 32]} />
          <meshStandardMaterial
            color="#ff7675"
            emissive="#e84393"
            emissiveIntensity={glow}
            transparent
            opacity={0.7}
          />
        </mesh>
        {["#fab1a0", "#ffeaa7", "#81ecec", "#a29bfe"].map((c, i) => (
          <GlowingOrb
            key={c}
            position={[Math.cos(i) * 4, 2, Math.sin(i) * 4]}
            color={c}
            intensity={0.3 + warmth * 0.4}
          />
        ))}
        <PortalRing position={[0, 2.5, -6]} color="#fd79a8" />
      </group>
    </EnvironmentBase>
  );
}
