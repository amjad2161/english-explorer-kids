import { Suspense, lazy, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useLocation } from "react-router-dom";
import { useSceneDirector } from "./SceneDirector";
import { useQualityStore } from "./qualityTier";
import SceneLighting from "./SceneLighting";

// Lazy-load stages for code splitting
const ForestStage = lazy(() => import("./stages/ForestStage"));
const ClassroomStage = lazy(() => import("./stages/ClassroomStage"));
const SnowMountainStage = lazy(() => import("./stages/SnowMountainStage"));
const JungleStage = lazy(() => import("./stages/JungleStage"));

const STAGE_COMPONENTS = {
  forest: ForestStage,
  classroom: ClassroomStage,
  snowMountain: SnowMountainStage,
  jungle: JungleStage,
} as const;

/** Null fallback for Suspense inside Canvas */
const Null = () => null;

/** Scene content — renders active stage + lighting */
const SceneContent = () => {
  const { activeStage, cameraPosition } = useSceneDirector();
  const StageComponent = STAGE_COMPONENTS[activeStage];

  return (
    <>
      <SceneLighting />
      <Suspense fallback={<Null />}>
        <StageComponent />
      </Suspense>
    </>
  );
};

/** Route sync — updates SceneDirector when route changes */
const RouteSync = () => {
  const location = useLocation();
  const setStageForRoute = useSceneDirector((s) => s.setStageForRoute);

  useEffect(() => {
    setStageForRoute(location.pathname);
  }, [location.pathname, setStageForRoute]);

  return null;
};

/**
 * CinematicCanvas — persistent WebGL canvas mounted at app root.
 * Never remounts on navigation. Stage switches are handled internally.
 */
const CinematicCanvas = () => {
  const { settings } = useQualityStore();
  const cameraPosition = useSceneDirector((s) => s.cameraPosition);

  return (
    <>
      <RouteSync />
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
        style={{ opacity: 0.35 }}
      >
        <Canvas
          shadows={settings.shadows}
          dpr={settings.dpr}
          gl={{
            antialias: settings.antialias,
            powerPreference: "default",
            alpha: true,
          }}
          camera={{
            position: cameraPosition,
            fov: 45,
            near: 0.1,
            far: 100,
          }}
          style={{ background: "transparent" }}
        >
          <SceneContent />
        </Canvas>
      </div>
    </>
  );
};

export default CinematicCanvas;
