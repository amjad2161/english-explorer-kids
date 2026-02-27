import { Suspense, useRef, forwardRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, AdaptiveDpr } from "@react-three/drei";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProxyCharacter from "./ProxyCharacter";
import type { CharacterMood } from "@/lib/characterStore";

interface CharacterCanvasProps {
  mood: CharacterMood;
  animationKey: number;
  width: number;
  height: number;
  /** Allow orbit controls for debugging; off by default */
  debugOrbit?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * CharacterCanvas — lightweight per-component Three.js canvas.
 *
 * Wraps @react-three/fiber <Canvas> with:
 * - ErrorBoundary so a broken 3D scene never crashes the page
 * - Suspense fallback (pulsing placeholder)
 * - Adaptive DPR for performance
 * - ProxyCharacter fallback (no GLB asset required)
 */
const CharacterCanvas = ({
  mood,
  animationKey,
  width,
  height,
  debugOrbit = false,
  className,
  style,
}: CharacterCanvasProps) => {
  const canvasKey = useRef(`char-canvas-${Math.random()}`).current;

  return (
    <ErrorBoundary>
      <div
        style={{ width, height, ...style }}
        className={className}
        aria-hidden="true"
      >
        <Suspense fallback={<PulseFallback width={width} height={height} />}>
          <Canvas
            key={canvasKey}
            camera={{ position: [0, 0, 1.8], fov: 50 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
            style={{ background: "transparent" }}
          >
            {/* Adaptive performance */}
            <AdaptiveDpr pixelated />

            {/* Lighting */}
            <ambientLight intensity={1.2} />
            <pointLight position={[2, 4, 3]} intensity={2} />
            <pointLight position={[-2, 1, 2]} intensity={0.8} color="#fffbf0" />

            {/* Character */}
            <ProxyCharacter mood={mood} animationKey={animationKey} />

            {debugOrbit && <OrbitControls />}
          </Canvas>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};

/** Simple pulsing fallback shown while Canvas is loading */
const PulseFallback = ({ width, height }: { width: number; height: number }) => (
  <div
    style={{ width, height }}
    className="flex items-center justify-center"
    aria-hidden="true"
  >
    <div
      className="rounded-full animate-pulse"
      style={{
        width: width * 0.5,
        height: width * 0.5,
        background: "hsl(var(--primary) / 0.15)",
      }}
    />
  </div>
);

export default CharacterCanvas;
