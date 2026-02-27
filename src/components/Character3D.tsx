import { useRef, useEffect, Suspense, Component, ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, useAnimations, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useCharacterStore, CharacterAnimation } from "@/store/characterStore";

const ANIMATION_MAP: Record<CharacterAnimation, string> = {
  idle: "Idle",
  wave: "Wave",
  celebrate: "Celebrate",
  walk: "Walk",
  jump: "Jump",
};

/* ── Renders the GLB model with animation ── */
const GLBModel = ({ url, animation }: { url: string; animation: CharacterAnimation }) => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    const clipName = ANIMATION_MAP[animation];
    const action = actions[clipName] ?? Object.values(actions)[0];
    if (action) {
      action.reset().fadeIn(0.3).play();
      return () => { action.fadeOut(0.3); };
    }
  }, [actions, animation]);

  return <primitive ref={group} object={scene} />;
};

/* ── Temporary 3D box shown when GLB is unavailable ── */
const FallbackBox = () => (
  <mesh>
    <boxGeometry args={[1, 1.8, 0.5]} />
    <meshStandardMaterial color="#6366f1" />
  </mesh>
);

/* ── Error boundary that catches missing GLB errors ── */
interface AssetErrorBoundaryProps {
  children: ReactNode;
  characterFile: string;
}
interface AssetErrorBoundaryState {
  hasError: boolean;
}

class AssetErrorBoundary extends Component<AssetErrorBoundaryProps, AssetErrorBoundaryState> {
  state: AssetErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AssetErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    console.error("MISSING_CHARACTER_ASSET", this.props.characterFile);
  }

  render() {
    if (this.state.hasError) {
      return <FallbackBox />;
    }
    return this.props.children;
  }
}

/* ── Public component ── */
export interface Character3DProps {
  characterFile?: string;
  animation?: CharacterAnimation;
  width?: number;
  height?: number;
}

const Character3D = ({
  characterFile,
  animation,
  width = 120,
  height = 180,
}: Character3DProps) => {
  const store = useCharacterStore();
  const file = characterFile ?? store.characterFile;
  const anim = animation ?? store.animation;
  const url = `/characters/${file}`;

  return (
    <div style={{ width, height }} aria-label="3D character">
      <Canvas camera={{ position: [0, 0.5, 3], fov: 40 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 4, 2]} intensity={1} />
        <AssetErrorBoundary characterFile={file}>
          <Suspense fallback={<FallbackBox />}>
            <GLBModel url={url} animation={anim} />
          </Suspense>
        </AssetErrorBoundary>
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
    </div>
  );
};

export default Character3D;
