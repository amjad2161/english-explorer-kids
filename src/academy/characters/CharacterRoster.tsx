import { useMemo } from "react";
import { useAcademyStore } from "../store/academyStore";
import { worldRegistry } from "../registries/worldRegistry";
import type { CharacterId } from "../types";
import ProceduralCharacter from "./ProceduralCharacter";

const formation: Record<number, [number, number, number]> = {
  0: [0, 0, 0],
  1: [-1.5, 0, 0.8],
  2: [1.5, 0, 0.8],
  3: [-2.8, 0, 1.2],
  4: [2.8, 0, 1.2],
  5: [0, 0, 1.6],
  6: [-1, 0, 2],
};

export default function CharacterRoster() {
  const visible = useAcademyStore((s) => s.visibleCharacters);
  const activeWorld = useAcademyStore((s) => s.activeWorld);
  const worldOffset = worldRegistry[activeWorld].hubPosition;

  const slots = useMemo(
    () =>
      visible.map((id: CharacterId, i: number) => ({
        id,
        position: formation[i % 7] ?? [i * 1.2 - 2, 0, 1],
      })),
    [visible],
  );

  return (
    <group position={[worldOffset[0], worldOffset[1], worldOffset[2] + 2]}>
      {slots.map(({ id, position }) => (
        <ProceduralCharacter key={id} id={id} position={position} />
      ))}
    </group>
  );
}
