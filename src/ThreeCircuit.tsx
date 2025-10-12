import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useState } from "react";

function Resistor({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[1, 0.3, 0.3]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

function Capacitor({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[-0.2, 0, 0]}>
        <boxGeometry args={[0.05, 0.6, 0.3]} />
        <meshStandardMaterial color="lightblue" />
      </mesh>
      <mesh position={[0.2, 0, 0]}>
        <boxGeometry args={[0.05, 0.6, 0.3]} />
        <meshStandardMaterial color="lightblue" />
      </mesh>
    </group>
  );
}

function Inductor({ position }: { position: [number, number, number] }) {
  const coils = [];
  for (let i = 0; i < 6; i++) {
    coils.push(
      <mesh key={i} position={[i * 0.15 - 0.4, 0, 0]}>
        <torusGeometry args={[0.07, 0.02, 8, 16]} />
        <meshStandardMaterial color="gold" />
      </mesh>
    );
  }
  return <group position={position}>{coils}</group>;
}

function Wire({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)];
  return (
    <Line
      points={points}
      color="gray"
      lineWidth={2}
    />
  );
}

export default function ThreeCircuit() {
  return (
    <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} />
      <OrbitControls />

      {/* Components */}
      <Resistor position={[0, 0, 0]} />
      <Wire from={[-2, 0, 0]} to={[0, 0, 0]} />
      <Capacitor position={[2, 0, 0]} />
      <Wire from={[0, 0, 0]} to={[2, 0, 0]} />
      <Inductor position={[4, 0, 0]} />
      <Wire from={[2, 0, 0]} to={[4, 0, 0]} />
    </Canvas>
  );
}
