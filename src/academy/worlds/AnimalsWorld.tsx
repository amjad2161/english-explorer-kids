import EnvironmentBase, { FloatingIsland, PortalRing } from "./shared/EnvironmentBase";
import { AnimalStatue, StylizedTree } from "./shared/WorldDecor";
import { worldRegistry } from "../registries/worldRegistry";

function AnimalDen({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[1.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[1.2, 1.4, 0.5, 16]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
    </group>
  );
}

export default function AnimalsWorld() {
  const pos = worldRegistry.animals.hubPosition;
  return (
    <EnvironmentBase groundColor="#a8e6cf" skyTint="#81c784">
      <group position={pos}>
        <FloatingIsland position={[0, 0, 0]} radius={10} color="#2ed573" />
        <AnimalDen position={[-4, 1, 2]} color="#8d6e63" />
        <AnimalDen position={[4, 1, -2]} color="#4caf50" />
        <AnimalDen position={[0, 1, -4]} color="#2196f3" />
        <mesh position={[2, 1.2, 3]} castShadow>
          <boxGeometry args={[1.5, 1, 2]} />
          <meshStandardMaterial color="#795548" />
        </mesh>
        <AnimalStatue position={[-2, 1.2, -3]} color="#e17055" />
        <AnimalStatue position={[3, 1.2, 1]} color="#00b894" scale={0.85} />
        <StylizedTree position={[-5, 1, 0]} scale={1.1} />
        <StylizedTree position={[5, 1, -3]} scale={0.9} />
        <PortalRing position={[0, 2.5, -6]} color="#2ed573" />
      </group>
    </EnvironmentBase>
  );
}
