import {
  Vector3,
} from "three";
import { Cylinder} from "@react-three/drei";


const CartoonAvatar = ({
    position,
    color,
  }: {
    position: number[];
    color: string;
  }) => {
    const vectorPosition = new Vector3(...position);
    return (
      <group position={vectorPosition}>
        <Cylinder args={[0.2, 0.2, 0.3, 32]} position={[0, 0.15, 0]}>
          <meshStandardMaterial color={color} />
        </Cylinder>
        <Cylinder args={[0.15, 0.15, 0.2, 32]} position={[0, -0.1, 0]}>
          <meshStandardMaterial color="#87CEEB" />
        </Cylinder>
      </group>
    );
  };


export default CartoonAvatar;