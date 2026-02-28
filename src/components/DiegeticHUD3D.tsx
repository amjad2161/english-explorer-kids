import { Suspense, memo } from "react";
import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";
import Scoreboard3D from "@/engine/diegetic/Scoreboard3D";
import StarBadge3D from "@/engine/diegetic/StarBadge3D";
import EnergyMeter3D from "@/engine/diegetic/EnergyMeter3D";

/**
 * DiegeticHUD3D — A compact 3D overlay showing live game stats
 * using the diegetic stone/wood UI components.
 * Renders as a floating panel in the game shell corner.
 */
interface DiegeticHUD3DProps {
  score: number;
  starsEarned: number;
  starsTotal?: number;
  /** Energy 0–100 (e.g. streak-based or progress-based) */
  energy: number;
  visible?: boolean;
}

const HUDScene = memo(({ score, starsEarned, starsTotal = 5, energy }: DiegeticHUD3DProps) => (
  <>
    <ambientLight intensity={0.6} />
    <directionalLight position={[3, 4, 5]} intensity={0.8} />

    <Scoreboard3D score={score} label="Score" position={[-1.6, 0.3, 0]} width={1.4} />
    <StarBadge3D earned={starsEarned} total={starsTotal} position={[0, 0.5, 0]} size={0.28} />
    <EnergyMeter3D energy={energy} label="Streak" position={[1.5, 0, 0]} height={1.5} />
  </>
));

HUDScene.displayName = "HUDScene";

const DiegeticHUD3D = ({
  score,
  starsEarned,
  starsTotal = 5,
  energy,
  visible = true,
}: DiegeticHUD3DProps) => {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1.2, duration: 0.5, type: "spring", stiffness: 200 }}
      className="fixed top-16 end-3 z-30 pointer-events-none"
      style={{ width: 220, height: 110 }}
    >
      <Canvas
        camera={{ position: [0, 0.3, 4.5], fov: 32 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent", borderRadius: 16 }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <HUDScene
            score={score}
            starsEarned={starsEarned}
            starsTotal={starsTotal}
            energy={energy}
          />
        </Suspense>
      </Canvas>
    </motion.div>
  );
};

export default DiegeticHUD3D;
