"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { Font } from "three/examples/jsm/loaders/FontLoader";
import GameMode from "./game-mode";
import FloatingElement from "./3d/floating-element";
import PaperPlane from "./3d/paper-plane";
import CartoonAvatar from "./3d/cartoon-avatar";

interface MousePosition {
  x: number;
  y: number;
}

const TextWithFont: React.FC<{ font: Font }> = ({ font }) => (
  <Text
    position={[0, 0.5, -2]}
    font={font}
    fontSize={1.2}
    color="#FFFFFF"
    anchorX="center"
    anchorY="middle"
    outlineWidth={0.05}
    outlineColor="#000000"
  >
    drawit
  </Text>
);

const Scene: React.FC = () => {
  const { camera } = useThree();
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [font, setFont] = useState<Font | null>(null);
  const [fontError, setFontError] = useState<boolean>(false);

  useEffect(() => {
    const loader = new FontLoader();
    loader.load(
      '/fonts/pacifico.json',
      (loadedFont) => setFont(loadedFont),
      undefined,
      (error) => {
        console.error('Font loading error:', error);
        setFontError(true);
      }
    );
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame(() => {
    camera.position.x += (mousePosition.x * 2 - camera.position.x) * 0.05;
    camera.position.y += (-mousePosition.y * 2 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <FloatingElement position={[-2, 1, -5]} color="#FF69B4" shape="box" />
      <FloatingElement position={[2, -1, -5]} color="#8A2BE2" shape="cylinder" />
      <FloatingElement position={[-1, -2, -5]} color="#FF00FF" />
      <FloatingElement position={[1, 2, -5]} color="#9370DB" shape="box" />
      <FloatingElement position={[0, 0, -3]} color="#DA70D6" shape="cylinder" />
      <PaperPlane position={[-1.5, 0, -4]} />
      <PaperPlane position={[1.5, 1, -4]} />
      <PaperPlane position={[0, -1, -4]} />
      <CartoonAvatar position={[-2, -1, -3]} color="#FFB6C1" />
      <CartoonAvatar position={[2, 0, -3]} color="#98FB98" />
      <CartoonAvatar position={[0, 1, -3]} color="#DDA0DD" />
      {font && !fontError ? (
        <TextWithFont font={font} />
      ) : (
        <Text
          position={[0, 0.5, -2]}
          fontSize={1.2}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          drawit
        </Text>
      )}
    </>
  );
};

export const HeroSection: React.FC = () => {
  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600">
      <Canvas className="absolute inset-0">
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 mt-[25rem] flex flex-col items-center justify-center text-white">
        <GameMode />
      </div>
    </div>
  );
};