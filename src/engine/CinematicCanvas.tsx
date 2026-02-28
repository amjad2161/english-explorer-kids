import { Suspense, lazy, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useLocation } from "react-router-dom";
import * as THREE from "three";
import { useSceneDirector } from "./SceneDirector";
import { useQualityStore } from "./qualityTier";
import SceneLighting from "./SceneLighting";
import CinematicCamera from "./CinematicCamera";
import Owl3DCharacter from "./Owl3DCharacter";
import DiegeticUIShowcase from "./DiegeticUIShowcase";
import { Fox3DCompanion, Bookworm3DCompanion, Mouse3DCompanion } from "./companions";
import CinematicPostProcessing from "./CinematicPostProcessing";
import SceneTransitionFade from "./SceneTransitionFade";
import PerformanceHUD from "./PerformanceHUD";

// Lazy-load stages for code splitting
const ForestStage = lazy(() => import("./stages/ForestStage"));
const ClassroomStage = lazy(() => import("./stages/ClassroomStage"));
const SnowMountainStage = lazy(() => import("./stages/SnowMountainStage"));
const JungleStage = lazy(() => import("./stages/JungleStage"));

type StageComponentName = "forest" | "classroom" | "snowMountain" | "jungle";
type StageComponent = React.FC;
type StageComponents = Record<StageComponentName, StageComponent>;

const STAGE_COMPONENTS = {
  forest: ForestStage,
  classroom: ClassroomStage,
  snowMountain: SnowMountainStage,
  jungle: JungleStage,
} as const;

const Null = () => null;

type Vec3 = [number, number, number];
interface StagePositions {
  owl: Vec3;
  fox: Vec3;
  bookworm: Vec3;
  mouse: Vec3;
}

const STAGE_POSITIONS: Record<string, StagePositions> = {
  forest: {
    owl:      [-3,   0.8,  2],
    fox:      [-1.8, 0.2,  2.5],
    bookworm: [-2.8, -0.1, 2],
    mouse:    [-4,   0,    2.8],
  },
  classroom: {
    owl:      [-2.5, 1.2,  1.5],
    fox:      [-1,   0.3,  2],
    bookworm: [-3.5, 0.6,  1.8],
    mouse:    [-4.2, 0.3,  2.2],
  },
  snowMountain: {
    owl:      [-2,   1.5,  1],
    fox:      [-0.5, 0.6,  1.8],
    bookworm: [-3.2, 0.2,  1.5],
    mouse:    [-3.8, 0.8,  2.5],
  },
  jungle: {
    owl:      [-3.5, 1,    2.2],
    fox:      [-2,   -0.2, 3],
    bookworm: [-1.5, 0.5,  2.5],
    mouse:    [-4.5, -0.3, 3.2],
  },
};

/**
 * LerpedCharacter — wraps a character in a group that smoothly
 * lerps its position when the target changes, with a gentle
 * scale bounce on arrival.
 */
const _lerpTarget = new THREE.Vector3();

const LerpedCharacter = ({
  target,
  children,
}: {
  target: Vec3;
  children: React.ReactNode;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const reduceMotion = useQualityStore((s) => s.reduceMotion);
  const isTransitioning = useSceneDirector((s) => s.isTransitioning);
  const initialized = useRef(false);
  const prevTarget = useRef<Vec3>([...target]);
  const bounceTime = useRef(0); // -1 = armed, >0 = animating, 0 = idle
  const targetRotY = useRef(0);
  const BOUNCE_DUR = 0.45;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    _lerpTarget.set(...target);

    // Detect target change → arm bounce + compute turn direction
    if (
      target[0] !== prevTarget.current[0] ||
      target[1] !== prevTarget.current[1] ||
      target[2] !== prevTarget.current[2]
    ) {
      // Determine Y rotation based on X movement direction
      const dx = target[0] - prevTarget.current[0];
      const dz = target[2] - prevTarget.current[2];
      if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
        targetRotY.current = Math.atan2(dx, dz) * 0.35; // subtle, max ~20°
      }
      prevTarget.current = [...target];
      bounceTime.current = -1;
    }

    if (!initialized.current) {
      groupRef.current.position.copy(_lerpTarget);
      groupRef.current.scale.setScalar(1);
      groupRef.current.rotation.y = 0;
      initialized.current = true;
      return;
    }

    if (reduceMotion) {
      groupRef.current.position.copy(_lerpTarget);
      groupRef.current.scale.setScalar(1);
      groupRef.current.rotation.y = 0;
    } else {
      // Slower during cinematic transitions, snappier during normal nav
      const speed = isTransitioning ? 1.2 : 3.5;
      groupRef.current.position.lerp(_lerpTarget, 1 - Math.exp(-speed * delta));

      // Smoothly rotate toward movement direction, then ease back to 0
      const dist = groupRef.current.position.distanceTo(_lerpTarget);
      const rotTarget = dist > 0.03 ? targetRotY.current : 0;
      groupRef.current.rotation.y += (rotTarget - groupRef.current.rotation.y) * (1 - Math.exp(-4 * delta));

      // Trigger bounce when close enough to destination
      if (bounceTime.current === -1 && dist < 0.02) {
        bounceTime.current = BOUNCE_DUR;
      }

      // Gentle Y bounce + scale on arrival
      if (bounceTime.current > 0) {
        bounceTime.current -= delta;
        const t = 1 - bounceTime.current / BOUNCE_DUR; // 0→1
        const easeOut = 1 - t;
        const yBounce = 0.12 * Math.sin(t * Math.PI * 2) * easeOut;
        groupRef.current.position.y = _lerpTarget.y + yBounce;
        const s = 1 + 0.06 * Math.sin(t * Math.PI) * easeOut;
        groupRef.current.scale.setScalar(s);
        if (bounceTime.current <= 0) {
          bounceTime.current = 0;
          groupRef.current.position.y = _lerpTarget.y;
          groupRef.current.scale.setScalar(1);
        }
      }
    }
  });

  return <group ref={groupRef}>{children}</group>;
};

/** Scene content — renders active stage + lighting + camera + effects */
const SceneContent = () => {
  const activeStage = useSceneDirector((s) => s.activeStage);
  const isTransitioning = useSceneDirector((s) => s.isTransitioning);
  const StageComponent = STAGE_COMPONENTS[activeStage];
  const pos = STAGE_POSITIONS[activeStage] || STAGE_POSITIONS.forest;

  return (
    <>
      <CinematicCamera />
      <SceneLighting />
      <Suspense fallback={<Null />}>
        <StageComponent />
      </Suspense>
      <LerpedCharacter target={pos.owl}>
        <Owl3DCharacter position={[0, 0, 0]} />
      </LerpedCharacter>
      <LerpedCharacter target={pos.fox}>
        <Fox3DCompanion position={[0, 0, 0]} />
      </LerpedCharacter>
      <LerpedCharacter target={pos.bookworm}>
        <Bookworm3DCompanion position={[0, 0, 0]} />
      </LerpedCharacter>
      <LerpedCharacter target={pos.mouse}>
        <Mouse3DCompanion position={[0, 0, 0]} />
      </LerpedCharacter>
      <DiegeticUIShowcase />
      <SceneTransitionFade active={isTransitioning} />
      <CinematicPostProcessing />
    </>
  );
};

const RouteSync = () => {
  const location = useLocation();
  const setStageForRoute = useSceneDirector((s) => s.setStageForRoute);

  useEffect(() => {
    setStageForRoute(location.pathname);
  }, [location.pathname, setStageForRoute]);

  return null;
};

const CinematicCanvas = () => {
  const { settings } = useQualityStore();

  return (
    <>
      <RouteSync />
      <PerformanceHUD />
      <div
        className="fixed inset-0 z-0"
        aria-hidden="true"
        style={{ opacity: 0.6, pointerEvents: "none" }}
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
            position: [0, 2.5, 8],
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
