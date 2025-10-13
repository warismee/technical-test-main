import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { SchematicResistor, SchematicCapacitor, SchematicInductor, SchematicWire, SchematicTerminal, SchematicTransistor, SchematicLED, SchematicDiode, SchematicSwitch, SchematicOpAmp, SchematicIC, SchematicJunction } from "./CircuitSchematic2D";
import { Text } from "@react-three/drei";
import { CircuitTemplate } from "./circuitLogic";
import * as THREE from "three";

interface CircuitSchematic2DProps {
  template: CircuitTemplate;
  selectedComponentFromUI?: string | null; // Component type selected from UI overlay
  onComponentPlaced?: (nodeId: string, componentType: string) => void; // Callback when component is placed
  placedComponents?: {[nodeId: string]: string}; // Components placed from parent
  onComponentRemoved?: (nodeId: string) => void; // Callback when component is removed
  isDarkMode?: boolean; // Dark mode flag for styling
}

// Blank component placeholder that users can click to select component type
function BlankComponentSlot({ 
  position, 
  nodeId,
  onSlotClick,
  isClicked = false,
  hasSelectedComponent = false,
  selectedComponentType = null,
  isDarkMode = false,
  rotation = 0
}: { 
  position: [number, number, number]; 
  nodeId: string;
  onSlotClick: (nodeId: string) => void;
  isClicked?: boolean;
  hasSelectedComponent?: boolean;
  selectedComponentType?: string | null;
  isDarkMode?: boolean;
  rotation?: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <group 
      position={position}
      rotation={[0, 0, rotation]}
      scale={hovered ? 1.02 : 1}
    >
      {/* Clickable area - adjust size based on component type */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSlotClick(nodeId);
        }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={nodeId === 'Q1' ? [2.6, 2.4, 0.1] : [2.2, 0.8, 0.1]} />
        <meshBasicMaterial 
          color={isClicked ? "#bbdefb" : hovered ? "#e0f2fe" : "#f5f5f5"} 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* Dashed border to indicate it's a placeholder */}
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(nodeId === 'Q1' ? 2.6 : 2.2, nodeId === 'Q1' ? 2.4 : 0.8, 0.1)]} />
        <lineDashedMaterial 
          attach="material" 
          color={isClicked ? "#1976d2" : hovered ? "#0288d1" : (isDarkMode ? "#ffffff" : "#999999")} 
          dashSize={0.1} 
          gapSize={0.05}
        />
      </lineSegments>
      
      {/* Connection points - show appropriate points based on selected component */}
      {nodeId === 'Q1' || selectedComponentType === 'transistor' ? (
        <>
          {/* Transistor connection points: base (left), collector (top), emitter (bottom) */}
          <mesh position={[-1, 0, 0]}>
            <circleGeometry args={[0.06, 8]} />
            <meshBasicMaterial color={isDarkMode ? "#ffffff" : "#444444"} />
          </mesh>
          <mesh position={[0.3, 1, 0]}>
            <circleGeometry args={[0.06, 8]} />
            <meshBasicMaterial color={isDarkMode ? "#ffffff" : "#444444"} />
          </mesh>
          <mesh position={[0.3, -1, 0]}>
            <circleGeometry args={[0.06, 8]} />
            <meshBasicMaterial color={isDarkMode ? "#ffffff" : "#444444"} />
          </mesh>
        </>
      ) : (
        <>
          {/* Standard two-terminal connection points */}
          <mesh position={[-1, 0, 0]}>
            <circleGeometry args={[0.05, 8]} />
            <meshBasicMaterial color={isDarkMode ? "#ffffff" : "#666666"} />
          </mesh>
          <mesh position={[1, 0, 0]}>
            <circleGeometry args={[0.05, 8]} />
            <meshBasicMaterial color={isDarkMode ? "#ffffff" : "#666666"} />
          </mesh>
        </>
      )}
      
      {/* Placeholder text */}
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.15}
        color={isClicked ? "#1976d2" : hovered ? "#0288d1" : (isDarkMode ? "#ffffff" : "#666666")}
        anchorX="center"
        anchorY="middle"
      >
        {hasSelectedComponent ? "Click to place" : 
         isClicked ? "Select component" : "Click to select"}
      </Text>
    </group>
  );
}

export default function CircuitSchematic2D({ 
  template, 
  selectedComponentFromUI, 
  onComponentPlaced,
  placedComponents = {},
  onComponentRemoved,
  isDarkMode = false
}: CircuitSchematic2DProps) {
  // State to track which slots have been clicked/selected
  const [clickedSlots, setClickedSlots] = useState<{[nodeId: string]: boolean}>({});
  
  // Helper function to calculate component rotation (angle between its two connected nodes)
  const calculateComponentRotation = (node: any): number => {
    if (node.connections.length >= 2) {
      const n1 = template.targetTopology.find(n => n.id === node.connections[0]);
      const n2 = template.targetTopology.find(n => n.id === node.connections[1]);
      if (n1 && n2) {
  const dx = (n2.position.x - n1.position.x);
  const dy = (n2.position.y - n1.position.y);
  // Screen Y increases downward; invert dy for 3D world where Y increases upward
  return Math.atan2(-dy, dx);
      }
    }
    return 0;
  };
  
  const handleSlotClick = (nodeId: string) => {
    // If a component is selected from UI and we click a slot, place the component
    if (selectedComponentFromUI && !placedComponents[nodeId]) {
      // Clear slot selection since component is now placed
      setClickedSlots({});
      
      // Notify parent component about placement
      onComponentPlaced?.(nodeId, selectedComponentFromUI);
      
      console.log(`Placed ${selectedComponentFromUI} in slot ${nodeId}`);
      return;
    }
    
    // If no component selected from UI, just handle slot selection
    setClickedSlots(prev => {
      const isCurrentlySelected = prev[nodeId] === true;
      if (isCurrentlySelected) {
        // If clicking the currently selected slot, deselect it
        return {};
      } else {
        // If clicking a different slot, select only this one
        return { [nodeId]: true };
      }
    });
    
    console.log(`Selected slot ${nodeId} - select a component from the sidebar to place`);
  };

  const handleComponentClick = (nodeId: string, componentType: string) => {
    console.log(`Removing ${componentType} component from slot ${nodeId}`);
    // Notify parent component about removal
    onComponentRemoved?.(nodeId);
  };

  const handleBackgroundClick = (event: any) => {
    // Only deselect if clicking on the background, not on components
    if (event.eventObject === event.object) {
      setClickedSlots({});
    }
  };

  const handleBackgroundPointerDown = (event: any) => {
    // Enable dragging when pointer is down on background
    if (event.eventObject === event.object) {
      event.stopPropagation();
    }
  };

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
      
      {/* Invisible background to capture clicks and enable dragging */}
      <mesh 
        position={[0, 0, -1]} 
        onClick={handleBackgroundClick}
        onPointerDown={handleBackgroundPointerDown}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Dynamic circuit rendering based on template */}
      {template.targetTopology.map((node) => {
        // Convert position from template (x:100-400, y:200) to 3D coordinates with much more spacing
        const x3d = (node.position.x - 250) / 40; // Further increased spacing by reducing divisor to 40
        const y3d = (250 - node.position.y) / 40; // Further increased spacing by reducing divisor to 40
        const position: [number, number, number] = [x3d, y3d, 0];
        


        if (node.type === 'terminal') {
          return (
            <SchematicTerminal 
              key={node.id}
              position={position}
              label={node.id}
              isDarkMode={isDarkMode}
            />
          );
        }
        
        if (node.type === 'junction') {
          return (
            <SchematicJunction 
              key={node.id}
              position={position}
              isDarkMode={isDarkMode}
            />
          );
        }
        
        if (node.type === 'component') {
          // Check if a component has been placed in this slot
          const placedComponentType = placedComponents[node.id];
          
          if (placedComponentType) {
            // Calculate component orientation based on connected nodes
            const rotation = calculateComponentRotation(node);
            
            // Render the actual placed component
            const componentMap: { [key: string]: string } = {
              'R': 'resistor',
              'L': 'inductor', 
              'C': 'capacitor',
              'LED': 'led',
              'D': 'diode',
              'S': 'switch',
              'Q': 'transistor',
              'OP': 'opamp',
              'IC': 'ic'
            };
            
            const componentType = componentMap[placedComponentType] || 'resistor';
            
            if (componentType === 'resistor') {
              return (
                <group key={node.id} onClick={() => handleComponentClick(node.id, 'resistor')}>
                  <SchematicResistor
                    type="resistor"
                    position={position}
                    rotation={rotation}
                    isDarkMode={isDarkMode}
                  />
                </group>
              );
            } else if (componentType === 'inductor') {
              return (
                <group key={node.id} onClick={() => handleComponentClick(node.id, 'inductor')}>
                  <SchematicInductor
                    type="inductor"
                    position={position}
                    rotation={rotation}
                    isDarkMode={isDarkMode}
                  />
                </group>
              );
            } else if (componentType === 'capacitor') {
              return (
                <group key={node.id} onClick={() => handleComponentClick(node.id, 'capacitor')}>
                  <SchematicCapacitor
                    type="capacitor"
                    position={position}
                    rotation={rotation}
                    isDarkMode={isDarkMode}
                  />
                </group>
              );
            } else if (componentType === 'led') {
              return (
                <group key={node.id} onClick={() => handleComponentClick(node.id, 'led')}>
                  <SchematicLED
                    type="led"
                    position={position}
                    rotation={rotation}
                    isDarkMode={isDarkMode}
                  />
                </group>
              );
            } else if (componentType === 'transistor') {
              return (
                <group key={node.id} onClick={() => handleComponentClick(node.id, 'transistor')}>
                  <SchematicTransistor
                    type="transistor"
                    position={position}
                    rotation={rotation}
                    isDarkMode={isDarkMode}
                  />
                </group>
              );
            } else if (componentType === 'diode') {
              return (
                <group key={node.id} onClick={() => handleComponentClick(node.id, 'diode')}>
                  <SchematicDiode
                    type="diode"
                    position={position}
                    rotation={rotation}
                    isDarkMode={isDarkMode}
                  />
                </group>
              );
            } else if (componentType === 'switch') {
              return (
                <group key={node.id} onClick={() => handleComponentClick(node.id, 'switch')}>
                  <SchematicSwitch
                    type="switch"
                    position={position}
                    rotation={rotation}
                    isDarkMode={isDarkMode}
                  />
                </group>
              );
            } else if (componentType === 'opamp') {
              return (
                <group key={node.id} onClick={() => handleComponentClick(node.id, 'opamp')}>
                  <SchematicOpAmp
                    type="opamp"
                    position={position}
                    rotation={rotation}
                    isDarkMode={isDarkMode}
                  />
                </group>
              );
            } else if (componentType === 'ic') {
              return (
                <group key={node.id} onClick={() => handleComponentClick(node.id, 'ic')}>
                  <SchematicIC
                    type="ic"
                    position={position}
                    rotation={rotation}
                    isDarkMode={isDarkMode}
                  />
                </group>
              );
            }
          } else {
            // Calculate expected component orientation for the placeholder
            const rotation = calculateComponentRotation(node);
            
            // Show blank slot for user to place component
            return (
              <BlankComponentSlot
                key={node.id}
                position={position}
                nodeId={node.id}
                onSlotClick={handleSlotClick}
                isClicked={clickedSlots[node.id] || false}
                hasSelectedComponent={!!selectedComponentFromUI}
                selectedComponentType={selectedComponentFromUI}
                isDarkMode={isDarkMode}
                rotation={rotation}
              />
            );
          }
        }
        return null;
      })}

      {/* Wire connections - show as horizontal/vertical segments only */}
      {template.targetTopology.map((node) => {
        if (node.connections.length === 0) return null;
        
        const nodeX = (node.position.x - 250) / 40;
        const nodeY = (250 - node.position.y) / 40;
        
        return node.connections.map((connectedId) => {
          const connectedNode = template.targetTopology.find(n => n.id === connectedId);
          if (!connectedNode || connectedId <= node.id) return null; // Avoid duplicate wires
          
          const connectedX = (connectedNode.position.x - 250) / 40;
          const connectedY = (250 - connectedNode.position.y) / 40;
          
          // Calculate exact connection points based on component type and position
          let fromConnectionX: number, fromConnectionY: number, toConnectionX: number, toConnectionY: number;
          
          // Helper function to get transistor connection point
          const getTransistorConnectionPoint = (nodePos: {x: number, y: number}, connectedNodeId: string, connections: string[]) => {
            const nodeX = (nodePos.x - 250) / 40;
            const nodeY = (250 - nodePos.y) / 40;
            
            // Find the index of the connected node in the connections array
            const connectionIndex = connections.indexOf(connectedNodeId);
            
            // For the transistor switch circuit: Q1 connections are ['Q1_C', 'GND', 'R2']
            // Map these to the actual transistor pin positions:
            // Q1_C (collector junction) -> collector (top): +0.3, +1
            // GND (ground) -> emitter (bottom): +0.3, -1  
            // R2 (base signal) -> base (left): -1, 0
            
            if (connectedNodeId === 'Q1_C') {
              // Collector connection (top)
              return { x: nodeX + 0.3, y: nodeY + 1 };
            } else if (connectedNodeId === 'GND') {
              // Emitter connection (bottom)
              return { x: nodeX + 0.3, y: nodeY - 1 };
            } else if (connectedNodeId === 'R2') {
              // Base connection (left)
              return { x: nodeX - 1, y: nodeY };
            } else {
              // Fallback to index-based positioning
              if (connectionIndex === 0) {
                return { x: nodeX + 0.3, y: nodeY + 1 };
              } else if (connectionIndex === 1) {
                return { x: nodeX + 0.3, y: nodeY - 1 };
              } else {
                return { x: nodeX - 1, y: nodeY };
              }
            }
          };
          
          // For components, determine connection points
          if (node.type === 'component') {
            // Check if this is a transistor by looking at placed components
            const nodeComponentType = placedComponents[node.id];
            
            if (nodeComponentType === 'transistor') {
              const connectionPoint = getTransistorConnectionPoint(node.position, connectedId, node.connections);
              fromConnectionX = connectionPoint.x;
              fromConnectionY = connectionPoint.y;
            } else {
              // Regular component - determine connection points based on rotation vector (supports arbitrary angles)
              const theta = calculateComponentRotation(node);
              const dirX = Math.cos(theta);
              const dirY = Math.sin(theta);
              const vecX = connectedX - nodeX;
              const vecY = connectedY - nodeY;
              const dot = vecX * dirX + vecY * dirY;
              const sign = dot >= 0 ? 1 : -1;
              fromConnectionX = nodeX + sign * dirX;
              fromConnectionY = nodeY + sign * dirY;
            }
          } else {
            // Terminals connect from center
            fromConnectionX = nodeX;
            fromConnectionY = nodeY;
          }
          
          if (connectedNode.type === 'component') {
            // Check if connected node is a transistor
            const connectedComponentType = placedComponents[connectedNode.id];
            if (connectedComponentType === 'transistor') {
              const connectionPoint = getTransistorConnectionPoint(connectedNode.position, node.id, connectedNode.connections);
              toConnectionX = connectionPoint.x;
              toConnectionY = connectionPoint.y;
            } else {
              // Regular component - determine connection points based on rotation vector (supports arbitrary angles)
              const theta = calculateComponentRotation(connectedNode);
              const dirX = Math.cos(theta);
              const dirY = Math.sin(theta);
              const vecX = nodeX - connectedX;
              const vecY = nodeY - connectedY;
              const dot = vecX * dirX + vecY * dirY;
              const sign = dot >= 0 ? 1 : -1;
              toConnectionX = connectedX + sign * dirX;
              toConnectionY = connectedY + sign * dirY;
            }
          } else {
            // Terminals connect to center
            toConnectionX = connectedX;
            toConnectionY = connectedY;
          }
          
          // VIN terminals use L-shaped full routing; others use pin stubs
          const isVinTerminal = (n: any) => n.type === 'terminal' && /^vin[+-]$/i.test(n.id);
          const isVinConnection = isVinTerminal(node) || isVinTerminal(connectedNode);

          if (isVinConnection) {
            const dxAbs = Math.abs(fromConnectionX - toConnectionX);
            const dyAbs = Math.abs(fromConnectionY - toConnectionY);
            const useHorizontalFirst = dxAbs >= dyAbs;
            const bendX = useHorizontalFirst ? toConnectionX : fromConnectionX;
            const bendY = useHorizontalFirst ? fromConnectionY : toConnectionY;

            return [
              <SchematicWire
                key={`${node.id}-${connectedId}-vin-seg1`}
                from={[fromConnectionX, fromConnectionY, 0]}
                to={[bendX, bendY, 0]}
                isDarkMode={isDarkMode}
              />,
              <SchematicWire
                key={`${node.id}-${connectedId}-vin-seg2`}
                from={[bendX, bendY, 0]}
                to={[toConnectionX, toConnectionY, 0]}
                isDarkMode={isDarkMode}
              />
            ];
          }

          // Draw short pin stubs at both endpoints instead of full wires
          const stubs: React.ReactElement[] = [];
          const dx = toConnectionX - fromConnectionX;
          const dy = toConnectionY - fromConnectionY;
          const len = Math.hypot(dx, dy) || 1;
          const nx = dx / len;
          const ny = dy / len;
          const stubLen = 0.7;

          stubs.push(
            <SchematicWire
              key={`${node.id}-${connectedId}-stub1`}
              from={[fromConnectionX, fromConnectionY, 0]}
              to={[fromConnectionX + nx * stubLen, fromConnectionY + ny * stubLen, 0]}
              isDarkMode={isDarkMode}
            />
          );
          stubs.push(
            <SchematicWire
              key={`${node.id}-${connectedId}-stub2`}
              from={[toConnectionX, toConnectionY, 0]}
              to={[toConnectionX - nx * stubLen, toConnectionY - ny * stubLen, 0]}
              isDarkMode={isDarkMode}
            />
          );

          return stubs;
        });
      }).flat().filter(Boolean)}
      
      {/* 2D Camera Controls - enhanced pan and zoom with drag functionality */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={false} // Disable rotation for pure 2D view
        maxDistance={20}
        minDistance={2}
        zoomSpeed={0.5}
        panSpeed={1.0} // Control panning sensitivity
        mouseButtons={{
          LEFT: THREE.MOUSE.PAN, // Left mouse button for panning/dragging
          MIDDLE: THREE.MOUSE.DOLLY, // Middle mouse button for zooming
          RIGHT: THREE.MOUSE.PAN // Right mouse button also for panning
        }}
        touches={{
          ONE: THREE.TOUCH.PAN, // Single touch for panning on mobile
          TWO: THREE.TOUCH.DOLLY_PAN // Two-finger touch for zoom and pan
        }}
      />
    </Canvas>
  );
}
