import { useFrame } from "@react-three/fiber";
import { useAcademyStore } from "../store/academyStore";

/** Advances master timeline when in cinematic mode */
export default function TimelineClock() {
  const tick = useAcademyStore((s) => s.tick);
  useFrame((_, delta) => tick(delta));
  return null;
}
