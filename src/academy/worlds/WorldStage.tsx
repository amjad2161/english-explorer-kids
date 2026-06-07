import { Suspense } from "react";
import { useAcademyStore } from "../store/academyStore";
import type { WorldId } from "../types";
import HubWorld from "./HubWorld";
import CitrusWorld from "./CitrusWorld";
import LogicWorld from "./LogicWorld";
import AnatomyWorld from "./AnatomyWorld";
import ScienceWorld from "./ScienceWorld";
import AnimalsWorld from "./AnimalsWorld";
import MusicWorld from "./MusicWorld";
import FeelingsWorld from "./FeelingsWorld";
import LanguageWorld from "./LanguageWorld";
import FinaleWorld from "./FinaleWorld";

const WORLDS: Record<WorldId, React.FC> = {
  hub: HubWorld,
  citrus: CitrusWorld,
  logic: LogicWorld,
  anatomy: AnatomyWorld,
  science: ScienceWorld,
  animals: AnimalsWorld,
  music: MusicWorld,
  feelings: FeelingsWorld,
  language: LanguageWorld,
  finale: FinaleWorld,
};

export default function WorldStage() {
  const activeWorld = useAcademyStore((s) => s.activeWorld);
  const World = WORLDS[activeWorld];

  return (
    <Suspense fallback={null}>
      <World />
    </Suspense>
  );
}
