import React, { Suspense, useState, useMemo, useEffect } from "react";
import { Html } from "@react-three/drei";
import { CircuitUIOverlay } from "./CircuitUIOverlay";
import CircuitSchematic2DScene from "./CircuitSchematic2DScene";
import { circuitTemplates, generateRandomChallenge, validateCircuit } from "./circuitLogic";

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

  // State to manage component selection between UI overlay and circuit scene
  const [selectedComponentFromUI, setSelectedComponentFromUI] = useState<string | null>(null);
  
  // State to track placed components for validation
  const [placedComponents, setPlacedComponents] = useState<{[nodeId: string]: string}>({});
  
  // Scoreboard state
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [questionsCorrect, setQuestionsCorrect] = useState(0);

  // Get the current circuit template based on difficulty (memoized to prevent refresh on component selection)
  const currentTemplate = useMemo(() => generateRandomChallenge(difficulty), [difficulty, questionsAnswered]);

  // Reset placed components when template changes
  useEffect(() => {
    setPlacedComponents({});
  }, [currentTemplate.id]);

  // Handle when a component is placed in the circuit
  const handleComponentPlaced = (nodeId: string, componentType: string) => {
    // Clear the selected component from UI after placement
    setSelectedComponentFromUI(null);
    
    // Update placed components tracking
    setPlacedComponents(prev => ({
      ...prev,
      [nodeId]: componentType
    }));
    
    console.log(`Component ${componentType} placed at ${nodeId}`);
  };

  // Handle when a component is removed from the circuit
  const handleComponentRemoved = (nodeId: string) => {
    setPlacedComponents(prev => {
      const updated = { ...prev };
      delete updated[nodeId];
      return updated;
    });
    console.log(`Component removed from ${nodeId}`);
  };

  // Handle circuit validation and move to next question
  const handleValidateCircuit = () => {
    // Convert placed components to the format expected by validateCircuit
    const placedComponentsArray = Object.entries(placedComponents).map(([nodeId, componentType]) => {
      // Find the node position from the template
      const node = currentTemplate.targetTopology.find(n => n.id === nodeId);
      return {
        instanceId: nodeId,
        type: componentType,
        x: node?.position.x || 0,
        y: node?.position.y || 0
      };
    });

    // Skip connection validation - only check component placement
    const connections: Array<{ from: string; to: string }> = [];
    
    const result = validateCircuit(placedComponentsArray, connections, currentTemplate);
    
    // Update score and question count
    const newQuestionsAnswered = questionsAnswered + 1;
    setQuestionsAnswered(newQuestionsAnswered);
    
    if (result.isValid) {
      const newScore = score + result.score;
      const newQuestionsCorrect = questionsCorrect + 1;
      setScore(newScore);
      setQuestionsCorrect(newQuestionsCorrect);
      
      alert(`✅ Circuit is valid! Earned ${result.score} points!\nTotal Score: ${newScore}\nCorrect: ${newQuestionsCorrect}/${newQuestionsAnswered}`);
    } else {
      alert(`❌ Circuit validation failed:\n${result.errors.join('\n')}\nScore: 0 points\nTotal Score: ${score}\nCorrect: ${questionsCorrect}/${newQuestionsAnswered}`);
    }
    
    // Reset components for next question
    setPlacedComponents({});
    setSelectedComponentFromUI(null);
    
    console.log('Validation result:', result);
  };

  // Example: adjust background based on theme
  const backgroundColor = theme === "dark" ? "#111" : "#fafafa";

  // Mode info descriptions
  const getModeInfo = (mode: ViewMode): string => {
    switch(mode) {
      case '2d-schematic':
        return 'Traditional circuit diagram view with draggable symbols and UI overlay';
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
            <CircuitSchematic2DScene 
              template={currentTemplate}
              selectedComponentFromUI={selectedComponentFromUI}
              onComponentPlaced={handleComponentPlaced}
              placedComponents={placedComponents}
              onComponentRemoved={handleComponentRemoved}
            />
            {/* 2D Drag-and-drop Overlay */}
            <CircuitUIOverlay 
              currentTemplate={currentTemplate} 
              playerCount={playerCount} 
              theme={theme}
              onComponentSelected={setSelectedComponentFromUI}
              selectedComponent={selectedComponentFromUI}
              onValidateCircuit={handleValidateCircuit}
              hasPlacedComponents={Object.keys(placedComponents).length > 0}
              score={score}
              questionsAnswered={questionsAnswered}
              questionsCorrect={questionsCorrect}
            />
          </>
        );
    }
  };

  return (
    <div className="relative w-full h-full" style={{ backgroundColor }}>
      {/* Render the current view */}
      {renderCurrentView()}      
    </div>
  );
};
