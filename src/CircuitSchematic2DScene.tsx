import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { SchematicResistor, SchematicCapacitor, SchematicInductor, SchematicWire } from "./CircuitSchematic2D";
import { Text } from "@react-three/drei";

export default function CircuitSchematic2D() {
  return (
    <Canvas 
      camera={{ position: [0, 0, 10], zoom: 50 }}
      orthographic
      gl={{ antialias: true, alpha: true }}
      className="w-full h-full"
    >
      {/* Simple lighting for 2D view */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[0, 0, 5]} intensity={0.5} />
      
      {/* Main circuit components in series */}
      <SchematicResistor
        type="resistor"
        position={[-4, 2, 0]}
        label="R1"
        onDrag={(pos) => console.log('R1 moved to:', pos)}
      />
      <SchematicCapacitor
        type="capacitor"
        position={[0, 2, 0]}
        label="C1"
        onDrag={(pos) => console.log('C1 moved to:', pos)}
      />
      <SchematicInductor
        type="inductor"
        position={[4, 2, 0]}
        label="L1"
        onDrag={(pos) => console.log('L1 moved to:', pos)}
      />
      
      {/* Series connection wires */}
      <SchematicWire from={[-5, 2, 0]} to={[-3, 2, 0]} />
      <SchematicWire from={[-1, 2, 0]} to={[1, 2, 0]} />
      <SchematicWire from={[3, 2, 0]} to={[5, 2, 0]} />
      
      {/* Parallel branch with R2 */}
      <SchematicResistor
        type="resistor"
        position={[-2, 0, 0]}
        label="R2"
        onDrag={(pos) => console.log('R2 moved to:', pos)}
      />
      <SchematicWire from={[-3, 2, 0]} to={[-3, 0, 0]} />
      <SchematicWire from={[-3, 0, 0]} to={[-1, 0, 0]} />
      <SchematicWire from={[-1, 0, 0]} to={[1, 2, 0]} />
      
      {/* Voltage source */}
      <group position={[-6, 1, 0]}>
        {/* Battery symbol */}
        <mesh position={[-0.1, 0, 0]}>
          <boxGeometry args={[0.05, 0.6, 0.1]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        <mesh position={[0.1, 0, 0]}>
          <boxGeometry args={[0.05, 0.3, 0.1]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        <Text
          position={[0, -0.6, 0]}
          fontSize={0.15}
          color="#333333"
          anchorX="center"
          anchorY="middle"
        >
          V1
        </Text>
        <Text
          position={[-0.4, 0, 0]}
          fontSize={0.15}
          color="#333333"
          anchorX="center"
          anchorY="middle"
        >
          +
        </Text>
        <Text
          position={[0.4, 0, 0]}
          fontSize={0.15}
          color="#333333"
          anchorX="center"
          anchorY="middle"
        >
          -
        </Text>
      </group>
      <SchematicWire from={[-5.8, 1, 0]} to={[-5, 2, 0]} />
      
      {/* Ground symbol */}
      <group position={[0, -1, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.05, 0.5, 0.1]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        {/* Ground lines */}
        <mesh position={[0, -0.35, 0]}>
          <boxGeometry args={[0.6, 0.03, 0.1]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        <mesh position={[0, -0.45, 0]}>
          <boxGeometry args={[0.4, 0.03, 0.1]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        <mesh position={[0, -0.55, 0]}>
          <boxGeometry args={[0.2, 0.03, 0.1]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        <Text
          position={[0.7, -0.3, 0]}
          fontSize={0.15}
          color="#333333"
          anchorX="left"
          anchorY="middle"
        >
          GND
        </Text>
      </group>
      <SchematicWire from={[0, 0, 0]} to={[0, -0.75, 0]} />
      <SchematicWire from={[-6.2, 1, 0]} to={[-6.2, -1, 0]} />
      <SchematicWire from={[-6.2, -1, 0]} to={[0, -1, 0]} />
      <SchematicWire from={[5, 2, 0]} to={[6, 2, 0]} />
      <SchematicWire from={[6, 2, 0]} to={[6, -1, 0]} />
      <SchematicWire from={[6, -1, 0]} to={[0, -1, 0]} />
      
      {/* Title */}
      <Text
        position={[0, 4, 0]}
        fontSize={0.3}
        color="#333333"
        anchorX="center"
        anchorY="middle"
      >
        RLC Circuit Schematic
      </Text>
      
      {/* 2D Camera Controls - pan and zoom only */}
      <OrbitControls
        enablePan
        enableZoom
        enableRotate={false} // Disable rotation for pure 2D view
        maxDistance={20}
        minDistance={2}
        zoomSpeed={0.5}
      />
    </Canvas>
  );
}
