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
    // Keep transistors in canonical orientation (base left, collector up, emitter down)
    // because wiring uses fixed offsets for Q pins that assume no rotation.
    // Applies to any node with id starting with 'Q' or explicitly placed as a transistor.
    if (/^Q\d*/i.test(node.id) || placedComponents[node.id] === 'transistor') {
      return 0;
    }
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
          
          // Helper: get exact connection point on a transistor (base/collector/emitter)
          // Uses id hints (e.g., Q1_C, Q1_B, GND, R1/IN) and relative position of the other node.
          const getTransistorConnectionPoint = (transistorNode: any, otherNode: any) => {
            const tX = (transistorNode.position.x - 250) / 40;
            const tY = (250 - transistorNode.position.y) / 40;
            const otherId: string = otherNode.id || '';

            // Prefer semantic id hints first
            const isCollectorById = /(^|_)C$/i.test(otherId) || /_C/i.test(otherId) || otherId === `${transistorNode.id}_C` || otherId === 'Q1_C';
            const isEmitterById = /GND/i.test(otherId) || /(^|_)E$/i.test(otherId);
            const isBaseById = /(^|_)B$/i.test(otherId) || otherId === 'R1' || /^IN$/i.test(otherId);

            let pin: 'collector' | 'emitter' | 'base' | null = null;
            if (isCollectorById) pin = 'collector';
            else if (isEmitterById) pin = 'emitter';
            else if (isBaseById) pin = 'base';

            // If no id hint, use relative position in template (screen coords where y increases downward)
            if (!pin && otherNode && otherNode.position && transistorNode && transistorNode.position) {
              const dyScreen = otherNode.position.y - transistorNode.position.y; // >0 means other is below transistor
              const dxScreen = otherNode.position.x - transistorNode.position.x;
              if (Math.abs(dyScreen) > Math.max(10, Math.abs(dxScreen))) {
                pin = dyScreen < 0 ? 'collector' : 'emitter';
              } else {
                // Mostly horizontal: assume base to the left by convention
                pin = dxScreen < 0 ? 'base' : 'base';
              }
            }

            // Map pin to the fixed connection offsets of our symbol
            const finalPin = pin || 'base';
            switch (finalPin) {
              case 'collector':
                return { x: tX + 0.3, y: tY + 1, pin: finalPin } as const;
              case 'emitter':
                return { x: tX + 0.3, y: tY - 1, pin: finalPin } as const;
              case 'base':
              default:
                return { x: tX - 1, y: tY, pin: finalPin } as const;
            }
          };
          
          // For components, determine connection points
          if (node.type === 'component') {
            // Check if this is a transistor by looking at placed components
            const nodeComponentType = placedComponents[node.id];
            const isTransistorNode = /^Q\d*/i.test(node.id) || nodeComponentType === 'transistor';
            
            if (isTransistorNode) {
              const connectionPoint = getTransistorConnectionPoint(node, connectedNode);
              fromConnectionX = connectionPoint.x;
              fromConnectionY = connectionPoint.y;
              // Attach pin info for routing preference
              (node as any)._lastTransistorPin = connectionPoint.pin;
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
            const isTransistorConnected = /^Q\d*/i.test(connectedNode.id) || connectedComponentType === 'transistor';
            if (isTransistorConnected) {
              const connectionPoint = getTransistorConnectionPoint(connectedNode, node);
              toConnectionX = connectionPoint.x;
              toConnectionY = connectionPoint.y;
              (connectedNode as any)._lastTransistorPin = connectionPoint.pin;
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
          
          // Medium-8 uses straight wires; others use orthogonal L-shaped routing
          if (template.id === 'medium-8') {
            return (
              <SchematicWire
                key={`${node.id}-${connectedId}-straight`}
                from={[fromConnectionX, fromConnectionY, 0]}
                to={[toConnectionX, toConnectionY, 0]}
                isDarkMode={isDarkMode}
              />
            );
          }

          const dxAbs = Math.abs(fromConnectionX - toConnectionX);
          const dyAbs = Math.abs(fromConnectionY - toConnectionY);
          // Prefer routing aligned with transistor leg when applicable
          const fromPin = (node as any)._lastTransistorPin as ('collector'|'emitter'|'base'|undefined);
          const toPin = (connectedNode as any)._lastTransistorPin as ('collector'|'emitter'|'base'|undefined);
          let useHorizontalFirst = dxAbs >= dyAbs;
          if (fromPin) {
            useHorizontalFirst = fromPin === 'base';
          } else if (toPin) {
            useHorizontalFirst = toPin === 'base';
          }
          const bendX = useHorizontalFirst ? toConnectionX : fromConnectionX;
          const bendY = useHorizontalFirst ? fromConnectionY : toConnectionY;

          return [
            <SchematicWire
              key={`${node.id}-${connectedId}-seg1`}
              from={[fromConnectionX, fromConnectionY, 0]}
              to={[bendX, bendY, 0]}
              isDarkMode={isDarkMode}
            />,
            <SchematicWire
              key={`${node.id}-${connectedId}-seg2`}
              from={[bendX, bendY, 0]}
              to={[toConnectionX, toConnectionY, 0]}
              isDarkMode={isDarkMode}
            />
          ];
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
