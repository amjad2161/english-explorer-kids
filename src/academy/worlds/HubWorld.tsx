import { useLanguage } from "@/lib/i18n";
import { academyT } from "../i18n/academyTranslations";
import { useAcademyStore } from "../store/academyStore";
import { worldRegistry, worldOrder } from "../registries/worldRegistry";
import type { WorldId } from "../types";
import EnvironmentBase, { FloatingIsland, PortalRing } from "./shared/EnvironmentBase";
import { AcademyBuilding, StylizedTree } from "./shared/WorldDecor";

export default function HubWorld() {
  const { lang } = useLanguage();
  const jumpToWorld = useAcademyStore((s) => s.jumpToWorld);
  const hub = worldRegistry.hub;

  const handlePortal = (worldId: WorldId) => {
    jumpToWorld(worldId);
  };

  return (
    <EnvironmentBase groundColor="#4a7c59" skyTint="#a8d8f0" showStars>
      <FloatingIsland position={[0, 0, 0]} radius={12} color="#5d9e6f" />
      {worldOrder
        .filter((w) => w !== "hub")
        .map((id) => {
          const w = worldRegistry[id];
          const label = academyT(lang, w.titleKey);
          return (
            <group key={id}>
              <FloatingIsland
                position={w.hubPosition}
                radius={5}
                color={w.accentColor}
              />
              <PortalRing
                position={[w.hubPosition[0], w.hubPosition[1] + 3, w.hubPosition[2]]}
                color={w.accentColor}
                label={label}
                onClick={() => handlePortal(id)}
              />
            </group>
          );
        })}
      <AcademyBuilding position={[0, 0, -2]} color={hub.accentColor} />
      <StylizedTree position={[-5, 0, 3]} scale={1.2} />
      <StylizedTree position={[5, 0, 2]} scale={0.9} />
      <StylizedTree position={[-3, 0, -4]} scale={1.1} />
      <mesh position={[0, 0.5, 4]}>
        <cylinderGeometry args={[2, 2.5, 1.2, 8]} />
        <meshStandardMaterial color={hub.accentColor} metalness={0.4} roughness={0.3} />
      </mesh>
      <pointLight position={[0, 8, 0]} intensity={2} color={hub.accentColor} distance={30} />
    </EnvironmentBase>
  );
}
