import { useQualityStore } from "./qualityTier";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

/**
 * CinematicPostProcessing — bloom + vignette, only active on HIGH tier.
 * Renders nothing on LOW/MED for performance.
 */
const CinematicPostProcessing = () => {
  const postprocessing = useQualityStore((s) => s.settings.postprocessing);

  if (!postprocessing) return null;

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.35}
        luminanceThreshold={0.7}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette
        offset={0.3}
        darkness={0.4}
        eskil={false}
      />
    </EffectComposer>
  );
};

export default CinematicPostProcessing;
