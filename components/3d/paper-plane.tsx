import { useRef } from "react";
import { Vector3, Object3D, Object3DEventMap, Group } from "three";
import { useFrame } from "@react-three/fiber";
import { Cone } from "@react-three/drei";

const PaperPlane = ({ position }: { position: number[] }) => {
  const ref = useRef<Object3D>(null!);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.02;
      ref.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group
      ref={ref as React.Ref<Group<Object3DEventMap>>}
      position={new Vector3(...position)}
    >
      <Cone args={[0.1, 0.4, 4]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#FFFFFF" />
      </Cone>
    </group>
  );
};

export default PaperPlane;
