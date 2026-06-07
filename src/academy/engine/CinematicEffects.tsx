import { Bloom, Vignette } from "@react-three/postprocessing";
import { useAcademyStore } from "../store/academyStore";

export default function CinematicEffects() {
  const reducedMotion = useAcademyStore((s) => s.reducedMotion);
  if (reducedMotion) return null;
  return (
    <>
      <Bloom intensity={0.35} luminanceThreshold={0.85} luminanceSmoothing={0.4} mipmapBlur />
      <Vignette offset={0.25} darkness={0.45} />
    </>
  );
}
