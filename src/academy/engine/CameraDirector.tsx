import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useAcademyStore } from "../store/academyStore";
import { getBeatAtTime } from "../cinema/masterScript";

const _target = new THREE.Vector3();
const _pos = new THREE.Vector3();

export default function CameraDirector() {
  const camera = useThree((s) => s.camera);
  const elapsedSec = useAcademyStore((s) => s.elapsedSec);
  const reducedMotion = useAcademyStore((s) => s.reducedMotion);
  const goal = useRef({ pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 45 });

  useFrame((_, delta) => {
    const beat = getBeatAtTime(elapsedSec);
    const { position, lookAt, fov = 45 } = beat.camera;
    goal.current.pos.set(...position);
    goal.current.look.set(...lookAt);
    goal.current.fov = fov;

    const lerp = reducedMotion ? 1 : Math.min(1, delta * 1.8);
    _pos.copy(camera.position).lerp(goal.current.pos, lerp);
    camera.position.copy(_pos);
    _target.copy(goal.current.look);
    camera.lookAt(_target);

    if ("fov" in camera && typeof camera.fov === "number") {
      const persp = camera as THREE.PerspectiveCamera;
      persp.fov = THREE.MathUtils.lerp(persp.fov, goal.current.fov, lerp);
      persp.updateProjectionMatrix();
    }
  });

  return null;
}
