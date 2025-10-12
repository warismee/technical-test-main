import React, { useRef, useState } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { Line, Text } from "@react-three/drei";
import * as THREE from "three";

interface SchematicComponentProps {
  position: [number, number, number];
  onDrag?: (position: [number, number, number]) => void;
  type: 'resistor' | 'capacitor' | 'inductor';
  label?: string;
}

function SchematicResistor({ position: initialPosition, onDrag, label }: SchematicComponentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [position, setPosition] = useState<[number, number, number]>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Create zigzag pattern for resistor
  const zigzagPoints = [
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(-0.6, 0, 0),
    new THREE.Vector3(-0.4, 0.3, 0),
    new THREE.Vector3(-0.2, -0.3, 0),
    new THREE.Vector3(0, 0.3, 0),
    new THREE.Vector3(0.2, -0.3, 0),
    new THREE.Vector3(0.4, 0.3, 0),
    new THREE.Vector3(0.6, 0, 0),
    new THREE.Vector3(1, 0, 0),
  ];

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setIsDragging(true);
    (event.target as any).setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    setIsDragging(false);
    (event.target as any).releasePointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    
    const newPosition: [number, number, number] = [
      event.point.x,
      event.point.y,
      0 // Keep on Z=0 plane for 2D
    ];
    
    setPosition(newPosition);
    onDrag?.(newPosition);
  };

  return (
    <group 
      ref={groupRef} 
      position={position}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      {/* Invisible interaction box */}
      <mesh>
        <boxGeometry args={[2.2, 0.8, 0.1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Zigzag resistor symbol */}
      <Line
        points={zigzagPoints}
        color={isDragging ? "#ff4444" : "#333333"}
        lineWidth={3}
      />
      
      {/* Connection points */}
      <mesh position={[-1, 0, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      <mesh position={[1, 0, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      
      {/* Label */}
      {label && (
        <Text
          position={[0, -0.5, 0]}
          fontSize={0.2}
          color="#333333"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </group>
  );
}

function SchematicCapacitor({ position: initialPosition, onDrag, label }: SchematicComponentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [position, setPosition] = useState<[number, number, number]>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Create parallel lines for capacitor
  const leftPlatePoints = [
    new THREE.Vector3(-0.1, -0.4, 0),
    new THREE.Vector3(-0.1, 0.4, 0),
  ];
  
  const rightPlatePoints = [
    new THREE.Vector3(0.1, -0.4, 0),
    new THREE.Vector3(0.1, 0.4, 0),
  ];

  const leftConnectionPoints = [
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(-0.1, 0, 0),
  ];

  const rightConnectionPoints = [
    new THREE.Vector3(0.1, 0, 0),
    new THREE.Vector3(1, 0, 0),
  ];

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setIsDragging(true);
    (event.target as any).setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    setIsDragging(false);
    (event.target as any).releasePointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    
    const newPosition: [number, number, number] = [
      event.point.x,
      event.point.y,
      0
    ];
    
    setPosition(newPosition);
    onDrag?.(newPosition);
  };

  return (
    <group 
      ref={groupRef} 
      position={position}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      {/* Invisible interaction box */}
      <mesh>
        <boxGeometry args={[2.2, 1, 0.1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Left plate */}
      <Line
        points={leftPlatePoints}
        color={isDragging ? "#4444ff" : "#333333"}
        lineWidth={4}
      />
      
      {/* Right plate */}
      <Line
        points={rightPlatePoints}
        color={isDragging ? "#4444ff" : "#333333"}
        lineWidth={4}
      />
      
      {/* Connection lines */}
      <Line
        points={leftConnectionPoints}
        color="#333333"
        lineWidth={2}
      />
      <Line
        points={rightConnectionPoints}
        color="#333333"
        lineWidth={2}
      />
      
      {/* Connection points */}
      <mesh position={[-1, 0, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      <mesh position={[1, 0, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      
      {/* Label */}
      {label && (
        <Text
          position={[0, -0.7, 0]}
          fontSize={0.2}
          color="#333333"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </group>
  );
}

function SchematicInductor({ position: initialPosition, onDrag, label }: SchematicComponentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [position, setPosition] = useState<[number, number, number]>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setIsDragging(true);
    (event.target as any).setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    setIsDragging(false);
    (event.target as any).releasePointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    
    const newPosition: [number, number, number] = [
      event.point.x,
      event.point.y,
      0
    ];
    
    setPosition(newPosition);
    onDrag?.(newPosition);
  };

  // Create coil curves for inductor
  const coilPoints = [];
  const numCoils = 4;
  for (let i = 0; i <= numCoils * 20; i++) {
    const t = i / 20;
    const x = (t - numCoils / 2) * 0.4;
    const y = Math.sin(t * Math.PI * 2) * 0.2;
    coilPoints.push(new THREE.Vector3(x, y, 0));
  }

  const leftConnectionPoints = [
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(-0.8, 0, 0),
  ];

  const rightConnectionPoints = [
    new THREE.Vector3(0.8, 0, 0),
    new THREE.Vector3(1, 0, 0),
  ];

  return (
    <group 
      ref={groupRef} 
      position={position}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      {/* Invisible interaction box */}
      <mesh>
        <boxGeometry args={[2.2, 0.8, 0.1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Coil symbol */}
      <Line
        points={coilPoints}
        color={isDragging ? "#44ff44" : "#333333"}
        lineWidth={3}
      />
      
      {/* Connection lines */}
      <Line
        points={leftConnectionPoints}
        color="#333333"
        lineWidth={2}
      />
      <Line
        points={rightConnectionPoints}
        color="#333333"
        lineWidth={2}
      />
      
      {/* Connection points */}
      <mesh position={[-1, 0, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      <mesh position={[1, 0, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      
      {/* Label */}
      {label && (
        <Text
          position={[0, -0.5, 0]}
          fontSize={0.2}
          color="#333333"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </group>
  );
}

function SchematicWire({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)];
  return (
    <Line
      points={points}
      color="#333333"
      lineWidth={2}
    />
  );
}

export { SchematicResistor, SchematicCapacitor, SchematicInductor, SchematicWire };
