import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * SceneTransitionFade — a fullscreen quad that fades in/out during stage transitions.
 * Controlled by the parent via the `active` prop.
 */
const SceneTransitionFade = ({ active }: { active: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((_, delta) => {
    if (!matRef.current) return;
    const target = active ? 0.6 : 0;
    matRef.current.opacity += (target - matRef.current.opacity) * (1 - Math.exp(-4 * delta));
    if (meshRef.current) {
      meshRef.current.visible = matRef.current.opacity > 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 3]} renderOrder={999}>
      <planeGeometry args={[20, 20]} />
      <meshBasicMaterial
        ref={matRef}
        color="#0a0a0a"
        transparent
        opacity={0}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
};

export default SceneTransitionFade;
