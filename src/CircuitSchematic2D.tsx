import React, { useState } from "react";
import { Line, Text } from "@react-three/drei";
import * as THREE from "three";

interface SchematicComponentProps {
  position: [number, number, number];
  type: 'resistor' | 'capacitor' | 'inductor' | 'switch' | 'led' | 'transistor' | 'diode' | 'opamp' | 'ic';
  label?: string;
  isDarkMode?: boolean;
  rotation?: number; // Rotation in radians for component orientation
}

function SchematicResistor({ position, label, isDarkMode = false, rotation = 0 }: SchematicComponentProps) {
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

  return (
    <group position={position} rotation={[0, 0, rotation]}>
      {/* Zigzag resistor symbol */}
      <Line
        points={zigzagPoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={3}
      />
      
      {/* Connection points */}
      <mesh position={[-1, 0, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color={isDarkMode ? "#ffffff" : "#666666"} />
      </mesh>
      <mesh position={[1, 0, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color={isDarkMode ? "#ffffff" : "#666666"} />
      </mesh>
      
      {/* Label */}
      {label && (
        <Text
          position={[0, -0.5, 0]}
          fontSize={0.2}
          color={isDarkMode ? "#ffffff" : "#333333"}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </group>
  );
}

function SchematicCapacitor({ position, label, isDarkMode = false, rotation = 0 }: SchematicComponentProps) {
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

  return (
    <group position={position} rotation={[0, 0, rotation]}>
      {/* Left plate */}
      <Line
        points={leftPlatePoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={4}
      />
      
      {/* Right plate */}
      <Line
        points={rightPlatePoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={4}
      />
      
      {/* Connection lines */}
      <Line
        points={leftConnectionPoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={2}
      />
      <Line
        points={rightConnectionPoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={2}
      />
      
      {/* Connection points */}
      <mesh position={[-1, 0, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color={isDarkMode ? "#ffffff" : "#666666"} />
      </mesh>
      <mesh position={[1, 0, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color={isDarkMode ? "#ffffff" : "#666666"} />
      </mesh>
      
      {/* Label */}
      {label && (
        <Text
          position={[0, -0.7, 0]}
          fontSize={0.2}
          color={isDarkMode ? "#ffffff" : "#333333"}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </group>
  );
}

function SchematicInductor({ position, label, isDarkMode = false, rotation = 0 }: SchematicComponentProps) {
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
    <group position={position} rotation={[0, 0, rotation]}>
      {/* Coil symbol */}
      <Line
        points={coilPoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={3}
      />
      
      {/* Connection lines */}
      <Line
        points={leftConnectionPoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={2}
      />
      <Line
        points={rightConnectionPoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={2}
      />
      
      {/* Connection points */}
      <mesh position={[-1, 0, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color={isDarkMode ? "#ffffff" : "#666666"} />
      </mesh>
      <mesh position={[1, 0, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color={isDarkMode ? "#ffffff" : "#666666"} />
      </mesh>
      
      {/* Label */}
      {label && (
        <Text
          position={[0, -0.5, 0]}
          fontSize={0.2}
          color={isDarkMode ? "#ffffff" : "#333333"}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </group>
  );
}

function SchematicWire({ from, to, isDarkMode = false }: { from: [number, number, number]; to: [number, number, number]; isDarkMode?: boolean }) {
  const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)];
  return (
    <Line
      points={points}
      color={isDarkMode ? "#ffffff" : "#333333"}
      lineWidth={2}
    />
  );
}

function SchematicSwitch({ position, label, isDarkMode = false, rotation = 0 }: SchematicComponentProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  // Switch contacts
  const leftContactPoints = [
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(-0.3, 0, 0),
  ];

  const rightContactPoints = [
    new THREE.Vector3(0.3, 0, 0),
    new THREE.Vector3(1, 0, 0),
  ];

  // Switch blade (rotates based on open/closed state)
  const bladeAngle = isOpen ? Math.PI / 6 : 0;
  const bladeEndX = -0.3 + 0.6 * Math.cos(bladeAngle);
  const bladeEndY = 0.6 * Math.sin(bladeAngle);
  
  const bladePoints = [
    new THREE.Vector3(-0.3, 0, 0),
    new THREE.Vector3(bladeEndX, bladeEndY, 0),
  ];

  return (
    <group 
      position={position}
      rotation={[0, 0, rotation]}
      onClick={handleClick}
    >
      {/* Connection lines */}
      <Line
        points={leftContactPoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={2}
      />
      <Line
        points={rightContactPoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={2}
      />
      
      {/* Switch blade */}
      <Line
        points={bladePoints}
        color={isOpen ? "#ff8888" : isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={3}
      />
      
      {/* Contact points */}
      <mesh position={[-0.3, 0, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      <mesh position={[0.3, 0, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      
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

function SchematicLED({ position, label, isDarkMode = false, rotation = 0 }: SchematicComponentProps) {

  // LED diode triangle
  const trianglePoints = [
    new THREE.Vector3(-0.2, -0.3, 0),
    new THREE.Vector3(0.2, 0, 0),
    new THREE.Vector3(-0.2, 0.3, 0),
    new THREE.Vector3(-0.2, -0.3, 0),
  ];

  // LED cathode line
  const cathodePoints = [
    new THREE.Vector3(0.2, -0.3, 0),
    new THREE.Vector3(0.2, 0.3, 0),
  ];

  // Connection lines
  const leftConnectionPoints = [
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(-0.2, 0, 0),
  ];

  const rightConnectionPoints = [
    new THREE.Vector3(0.2, 0, 0),
    new THREE.Vector3(1, 0, 0),
  ];

  // Light rays
  const ray1Points = [
    new THREE.Vector3(0.4, 0.2, 0),
    new THREE.Vector3(0.6, 0.4, 0),
  ];

  const ray2Points = [
    new THREE.Vector3(0.4, -0.2, 0),
    new THREE.Vector3(0.6, -0.4, 0),
  ];

  return (
    <group position={position} rotation={[0, 0, rotation]}>
      {/* LED triangle (anode) */}
      <Line
        points={trianglePoints}
        color="#ff4444"
        lineWidth={3}
      />
      
      {/* LED cathode line */}
      <Line
        points={cathodePoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={3}
      />
      
      {/* Connection lines */}
      <Line
        points={leftConnectionPoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={2}
      />
      <Line
        points={rightConnectionPoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={2}
      />
      
      {/* Light rays */}
      <Line
        points={ray1Points}
        color="#ffaa00"
        lineWidth={2}
      />
      <Line
        points={ray2Points}
        color="#ffaa00"
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

function SchematicTransistor({ position, label, isDarkMode = false, rotation = 0 }: SchematicComponentProps) {

  // Base line (vertical)
  const basePoints = [
    new THREE.Vector3(-0.2, -0.4, 0),
    new THREE.Vector3(-0.2, 0.4, 0),
  ];

  // Collector line
  const collectorPoints = [
    new THREE.Vector3(-0.2, 0.2, 0),
    new THREE.Vector3(0.3, 0.4, 0),
  ];

  // Emitter line
  const emitterPoints = [
    new THREE.Vector3(-0.2, -0.2, 0),
    new THREE.Vector3(0.3, -0.4, 0),
  ];

  // Connection lines
  const baseConnectionPoints = [
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(-0.2, 0, 0),
  ];

  const collectorConnectionPoints = [
    new THREE.Vector3(0.3, 0.4, 0),
    new THREE.Vector3(0.3, 1, 0),
  ];

  const emitterConnectionPoints = [
    new THREE.Vector3(0.3, -0.4, 0),
    new THREE.Vector3(0.3, -1, 0),
  ];

  // Arrow on emitter (NPN transistor)
  const arrowPoints = [
    new THREE.Vector3(0.15, -0.25, 0),
    new THREE.Vector3(0.25, -0.35, 0),
    new THREE.Vector3(0.05, -0.35, 0),
    new THREE.Vector3(0.15, -0.25, 0),
  ];

  return (
    <group position={position} rotation={[0, 0, rotation]}>
      {/* Base line */}
      <Line
        points={basePoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={4}
      />
      
      {/* Collector line */}
      <Line
        points={collectorPoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={3}
      />
      
      {/* Emitter line */}
      <Line
        points={emitterPoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={3}
      />
      
      {/* Arrow on emitter */}
      <Line
        points={arrowPoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={2}
      />
      
      {/* Connection lines */}
      <Line
        points={baseConnectionPoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={2}
      />
      <Line
        points={collectorConnectionPoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={2}
      />
      <Line
        points={emitterConnectionPoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={2}
      />
      
      {/* Connection points */}
      <mesh position={[-1, 0, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      <mesh position={[0.3, 1, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      <mesh position={[0.3, -1, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      
      {/* Label */}
      {label && (
        <Text
          position={[0, -1.3, 0]}
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

function SchematicDiode({ position, label, isDarkMode = false, rotation = 0 }: SchematicComponentProps) {

  // Diode triangle (anode)
  const trianglePoints = [
    new THREE.Vector3(-0.2, -0.3, 0),
    new THREE.Vector3(0.2, 0, 0),
    new THREE.Vector3(-0.2, 0.3, 0),
    new THREE.Vector3(-0.2, -0.3, 0),
  ];

  // Diode cathode line
  const cathodePoints = [
    new THREE.Vector3(0.2, -0.3, 0),
    new THREE.Vector3(0.2, 0.3, 0),
  ];

  // Connection lines
  const leftConnectionPoints = [
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(-0.2, 0, 0),
  ];

  const rightConnectionPoints = [
    new THREE.Vector3(0.2, 0, 0),
    new THREE.Vector3(1, 0, 0),
  ];

  return (
    <group position={position} rotation={[0, 0, rotation]}>
      {/* Diode triangle (anode) */}
      <Line
        points={trianglePoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={3}
      />
      
      {/* Diode cathode line */}
      <Line
        points={cathodePoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={3}
      />
      
      {/* Connection lines */}
      <Line
        points={leftConnectionPoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={2}
      />
      <Line
        points={rightConnectionPoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
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

function SchematicOpAmp({ position, label, isDarkMode = false, rotation = 0 }: SchematicComponentProps) {

  // Op-amp triangle
  const trianglePoints = [
    new THREE.Vector3(-0.5, -0.4, 0),
    new THREE.Vector3(-0.5, 0.4, 0),
    new THREE.Vector3(0.5, 0, 0),
    new THREE.Vector3(-0.5, -0.4, 0),
  ];

  // Connection lines
  const positiveInputPoints = [
    new THREE.Vector3(-1, 0.2, 0),
    new THREE.Vector3(-0.5, 0.2, 0),
  ];

  const negativeInputPoints = [
    new THREE.Vector3(-1, -0.2, 0),
    new THREE.Vector3(-0.5, -0.2, 0),
  ];

  const outputPoints = [
    new THREE.Vector3(0.5, 0, 0),
    new THREE.Vector3(1, 0, 0),
  ];

  const vccPoints = [
    new THREE.Vector3(0, 0.4, 0),
    new THREE.Vector3(0, 0.8, 0),
  ];

  const gndPoints = [
    new THREE.Vector3(0, -0.4, 0),
    new THREE.Vector3(0, -0.8, 0),
  ];

  return (
    <group position={position} rotation={[0, 0, rotation]}>
      {/* Op-amp triangle */}
      <Line
        points={trianglePoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={3}
      />
      
      {/* Connection lines */}
      <Line points={positiveInputPoints} color={isDarkMode ? "#ffffff" : "#333333"} lineWidth={2} />
      <Line points={negativeInputPoints} color={isDarkMode ? "#ffffff" : "#333333"} lineWidth={2} />
      <Line points={outputPoints} color={isDarkMode ? "#ffffff" : "#333333"} lineWidth={2} />
      <Line points={vccPoints} color={isDarkMode ? "#ffffff" : "#333333"} lineWidth={2} />
      <Line points={gndPoints} color={isDarkMode ? "#ffffff" : "#333333"} lineWidth={2} />

      {/* + and - symbols */}
      <Text
        position={[-0.3, 0.15, 0]}
        fontSize={0.15}
        color="#333333"
        anchorX="center"
        anchorY="middle"
      >
        +
      </Text>
      <Text
        position={[-0.3, -0.15, 0]}
        fontSize={0.15}
        color="#333333"
        anchorX="center"
        anchorY="middle"
      >
        -
      </Text>
      
      {/* Connection points */}
      <mesh position={[-1, 0.2, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      <mesh position={[-1, -0.2, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      <mesh position={[1, 0, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      <mesh position={[0, -0.8, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      
      {/* Label */}
      {label && (
        <Text
          position={[0, -1.1, 0]}
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

function SchematicIC({ position, label, isDarkMode = false, rotation = 0 }: SchematicComponentProps) {

  // IC package outline
  const packagePoints = [
    new THREE.Vector3(-0.6, -0.4, 0),
    new THREE.Vector3(0.6, -0.4, 0),
    new THREE.Vector3(0.6, 0.4, 0),
    new THREE.Vector3(-0.6, 0.4, 0),
    new THREE.Vector3(-0.6, -0.4, 0),
  ];

  // Pin connection lines
  const pin1Points = [new THREE.Vector3(-0.6, 0.2, 0), new THREE.Vector3(-1, 0.2, 0)];
  const pin2Points = [new THREE.Vector3(-0.6, -0.2, 0), new THREE.Vector3(-1, -0.2, 0)];
  const pin3Points = [new THREE.Vector3(0.6, -0.2, 0), new THREE.Vector3(1, -0.2, 0)];
  const pin4Points = [new THREE.Vector3(0.6, 0.2, 0), new THREE.Vector3(1, 0.2, 0)];
  const vccPoints = [new THREE.Vector3(0, 0.4, 0), new THREE.Vector3(0, 0.8, 0)];
  const gndPoints = [new THREE.Vector3(0, -0.4, 0), new THREE.Vector3(0, -0.8, 0)];

  return (
    <group position={position} rotation={[0, 0, rotation]}>
      {/* IC package */}
      <Line
        points={packagePoints}
        color={isDarkMode ? "#ffffff" : "#333333"}
        lineWidth={3}
      />
      
      {/* Pin connection lines */}
      <Line points={pin1Points} color={isDarkMode ? "#ffffff" : "#333333"} lineWidth={2} />
      <Line points={pin2Points} color={isDarkMode ? "#ffffff" : "#333333"} lineWidth={2} />
      <Line points={pin3Points} color={isDarkMode ? "#ffffff" : "#333333"} lineWidth={2} />
      <Line points={pin4Points} color={isDarkMode ? "#ffffff" : "#333333"} lineWidth={2} />
      <Line points={vccPoints} color={isDarkMode ? "#ffffff" : "#333333"} lineWidth={2} />
      <Line points={gndPoints} color={isDarkMode ? "#ffffff" : "#333333"} lineWidth={2} />
      
      {/* IC identifier */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.15}
        color="#333333"
        anchorX="center"
        anchorY="middle"
      >
        IC
      </Text>
      
      {/* Connection points */}
      <mesh position={[-1, 0.2, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      <mesh position={[-1, -0.2, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      <mesh position={[1, 0.2, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      <mesh position={[1, -0.2, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      <mesh position={[0, -0.8, 0]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
      
      {/* Label */}
      {label && (
        <Text
          position={[0, -1.1, 0]}
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

function SchematicJunction({ position, isDarkMode = false }: { position: [number, number, number]; isDarkMode?: boolean }) {
  return (
    <group position={position}>
      {/* Junction connection point */}
      <mesh>
        <circleGeometry args={[0.08, 16]} />
        <meshBasicMaterial color={isDarkMode ? "#ffffff" : "#333333"} />
      </mesh>
    </group>
  );
}

function SchematicTerminal({ position, label, isDarkMode = false }: { position: [number, number, number]; label: string; isDarkMode?: boolean }) {
  return (
    <group position={position}>
      {/* Terminal connection point */}
      <mesh>
        <circleGeometry args={[0.1, 16]} />
        <meshBasicMaterial color="#ff4444" />
      </mesh>
      {/* Terminal label */}
      <Text
        position={[0, -0.4, 0]}
        fontSize={0.2}
        color={isDarkMode ? "#ffffff" : "#333333"}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

export { 
  SchematicResistor, 
  SchematicCapacitor, 
  SchematicInductor, 
  SchematicSwitch,
  SchematicLED,
  SchematicTransistor,
  SchematicDiode,
  SchematicOpAmp,
  SchematicIC,
  SchematicWire, 
  SchematicJunction,
  SchematicTerminal 
};
