import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneDirector } from "./SceneDirector";
import { useQualityStore } from "./qualityTier";

const _targetPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3(0, 1, 0);

/**
 * CinematicCamera — smoothly lerps the camera between stage transitions.
 * Uses the SceneDirector's cameraPosition as the target and interpolates
 * with a cinematic easing curve each frame.
 */
const CinematicCamera = () => {
  const { camera } = useThree();
  const cameraPosition = useSceneDirector((s) => s.cameraPosition);
  const isTransitioning = useSceneDirector((s) => s.isTransitioning);
  const reduceMotion = useQualityStore((s) => s.reduceMotion);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    _targetPos.set(...cameraPosition);

    if (reduceMotion) {
      // Snap immediately
      camera.position.copy(_targetPos);
      camera.lookAt(_targetLook);
      return;
    }

    // Lerp speed — faster when not transitioning, cinematic during transitions
    const speed = isTransitioning ? 1.8 : 3.5;
    camera.position.lerp(_targetPos, 1 - Math.exp(-speed * delta));

    // Subtle idle sway when not transitioning
    if (!isTransitioning) {
      timeRef.current += delta;
      const t = timeRef.current;
      camera.position.x += Math.sin(t * 0.15) * 0.008;
      camera.position.y += Math.cos(t * 0.12) * 0.005;
    }

    camera.lookAt(_targetLook);
  });

  return null;
};

export default CinematicCamera;
