import { Physics } from "@react-three/rapier";
import type { ReactNode } from "react";

export default function PhysicsWorld({ children }: { children: ReactNode }) {
  return (
    <Physics gravity={[0, -9.81, 0]} timeStep="vary" interpolate>
      {children}
    </Physics>
  );
}
