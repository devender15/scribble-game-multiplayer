import { useRef, useState, useEffect } from "react";
import {
  Vector3,
  Object3D,
  Mesh,
  NormalBufferAttributes,
  BufferGeometry,
  Material,
  Object3DEventMap,
} from "three";
import { useFrame } from "@react-three/fiber";
import { Box, Cylinder, Cone } from "@react-three/drei";

const FloatingElement = ({
  position,
  color,
  shape = "sphere",
}: {
  position: number[];
  color: string;
  shape?: string;
}) => {
  const ref = useRef<Object3D>(null!);
  const [targetPosition, setTargetPosition] = useState(
    new Vector3(...position)
  );

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.lerp(targetPosition, 0.02);
      ref.current.rotation.x += 0.01;
      ref.current.rotation.y += 0.01;
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTargetPosition(
        new Vector3(
          position[0] + Math.random() * 2 - 1,
          position[1] + Math.random() * 2 - 1,
          position[2] + Math.random() * 2 - 1
        )
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [position]);

  const ShapeComponent =
    shape === "box" ? Box : shape === "cylinder" ? Cylinder : Cone;

  return (
    <ShapeComponent
      ref={
        ref as React.MutableRefObject<
          Mesh<
            BufferGeometry<NormalBufferAttributes>,
            Material | Material[],
            Object3DEventMap
          >
        >
      }
      args={shape === "box" ? [0.3, 0.3, 0.3] : [0.1, 0.1, 0.3]}
      position={new Vector3(...position)}
    >
      <meshStandardMaterial color={color} />
    </ShapeComponent>
  );
};

export default FloatingElement;