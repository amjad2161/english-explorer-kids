import { useCharacterStore } from "@/store/characterStore";
import Character3D from "@/components/Character3D";

const CharacterLayer = () => {
  const visible = useCharacterStore((s) => s.visible);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 pointer-events-none"
      aria-hidden="true"
    >
      <Character3D width={120} height={180} />
    </div>
  );
};

export default CharacterLayer;
