import React, { Suspense, useState } from "react";
import { Html } from "@react-three/drei";
import { CircuitUIOverlay } from "./CircuitUIOverlay";
import ThreeCircuit from "./ThreeCircuit";
import CircuitSchematic2DScene from "./CircuitSchematic2DScene";

interface BlockProps {
  difficulty?: "easy" | "medium" | "hard";
  theme?: "light" | "dark" | string;
  playerCount?: number;
  title?: string;
  description?: string;
  autoRotate?: boolean;
  cameraPosition?: [number, number, number];
  use3DCircuit?: boolean;
  viewMode?: "2d-schematic" | "3d-realistic";
  showControls?: boolean;
}

type ViewMode = "2d-schematic" | "3d-realistic";



function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <span className="ml-3 text-gray-600">Loading 3D Scene...</span>
    </div>
  );
}

export const Block: React.FC<BlockProps> = ({
  difficulty = "easy",
  theme = "light",
  playerCount = 1,
  autoRotate = true,
  cameraPosition = [10, 10, 10],
  use3DCircuit = false,
  viewMode: initialViewMode = "2d-schematic",
  showControls = true,
}) => {
  // State for managing view mode internally
  const [currentViewMode, setCurrentViewMode] = useState<ViewMode>(
    use3DCircuit ? "3d-realistic" : initialViewMode
  );

  // Example: adjust background based on theme
  const backgroundColor = theme === "dark" ? "#111" : "#fafafa";

  // Mode info descriptions
  const getModeInfo = (mode: ViewMode): string => {
    switch(mode) {
      case '2d-schematic':
        return 'Traditional circuit diagram view with draggable symbols and UI overlay';
      case '3d-realistic':
        return 'Detailed 3D circuit visualization';
      default:
        return '';
    }
  };

  // Render the current view mode
  const renderCurrentView = () => {
    switch (currentViewMode) {
      case "2d-schematic":
        return (
          <>
            <CircuitSchematic2DScene />
            {/* 2D Drag-and-drop Overlay */}
            <CircuitUIOverlay difficulty={difficulty} playerCount={playerCount} theme={theme} />
          </>
        );

      case "3d-realistic":
      default:
        return <ThreeCircuit />;
    }
  };

  return (
    <div className="relative w-full h-full" style={{ backgroundColor }}>
      {/* Render the current view */}
      {renderCurrentView()}

      {/* Mode Selection Controls */}
      {showControls && (
        <div className="absolute top-5 left-5 z-50" 
             style={{
               background: 'rgba(255, 255, 255, 0.9)',
               padding: '15px',
               borderRadius: '8px',
               boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
               fontFamily: 'Arial, sans-serif'
             }}>
          <h3 style={{ 
            margin: '0 0 10px 0', 
            fontSize: '16px', 
            fontWeight: 'bold',
            color: '#333'
          }}>
            Circuit Visualization Demo
          </h3>
          
          <button
            onClick={() => setCurrentViewMode('2d-schematic')}
            style={{
              display: 'block',
              width: '200px',
              margin: '5px 0',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              background: currentViewMode === '2d-schematic' ? '#28a745' : '#007acc',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            onMouseOver={(e) => {
              if (currentViewMode !== '2d-schematic') {
                e.currentTarget.style.background = '#005a9e';
              }
            }}
            onMouseOut={(e) => {
              if (currentViewMode !== '2d-schematic') {
                e.currentTarget.style.background = '#007acc';
              }
            }}
          >
            2D Schematic View
          </button>

          <button
            onClick={() => setCurrentViewMode('3d-realistic')}
            style={{
              display: 'block',
              width: '200px',
              margin: '5px 0',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              background: currentViewMode === '3d-realistic' ? '#28a745' : '#007acc',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            onMouseOver={(e) => {
              if (currentViewMode !== '3d-realistic') {
                e.currentTarget.style.background = '#005a9e';
              }
            }}
            onMouseOut={(e) => {
              if (currentViewMode !== '3d-realistic') {
                e.currentTarget.style.background = '#007acc';
              }
            }}
          >
            3D Realistic Circuit
          </button>

          <p style={{ 
            fontSize: '12px', 
            margin: '8px 0 5px 0', 
            color: '#666' 
          }}>
            <small>Switch between different visualization modes</small>
          </p>

          <div style={{
            marginTop: '10px',
            padding: '8px',
            background: 'rgba(0, 120, 204, 0.1)',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#007acc'
          }}>
            <strong>{currentViewMode.charAt(0).toUpperCase() + currentViewMode.slice(1).replace('-', ' ')}:</strong> {getModeInfo(currentViewMode)}
          </div>
        </div>
      )}
    </div>
  );
};
