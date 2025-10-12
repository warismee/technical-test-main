import React, { Suspense, useState, useMemo, useEffect } from "react";
import { Html } from "@react-three/drei";
import { CircuitUIOverlay } from "./CircuitUIOverlay";
import CircuitSchematic2DScene from "./CircuitSchematic2DScene";
import { circuitTemplates, generateRandomChallenge, generateUniqueChallenge, validateCircuit, getTotalQuestionsForDifficulty } from "./circuitLogic";

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

interface GameSummaryProps {
  score: number;
  questionsAnswered: number;
  questionsCorrect: number;
  difficulty: "easy" | "medium" | "hard";
  onRestart: () => void;
  onChangeDifficulty: (newDifficulty: "easy" | "medium" | "hard") => void;
}

function GameSummary({ score, questionsAnswered, questionsCorrect, difficulty, onRestart, onChangeDifficulty }: GameSummaryProps) {
  const totalQuestions = getTotalQuestionsForDifficulty(difficulty);
  const accuracy = questionsAnswered > 0 ? Math.round((questionsCorrect / questionsAnswered) * 100) : 0;
  const averageScore = questionsAnswered > 0 ? Math.round(score / questionsAnswered) : 0;

  const getPerformanceMessage = () => {
    if (accuracy >= 90) return "🏆 Excellent work! You're a circuit master!";
    if (accuracy >= 75) return "🎯 Great job! You have a solid understanding of circuits.";
    if (accuracy >= 60) return "👍 Good effort! Keep practicing to improve.";
    return "💪 Keep learning! Practice makes perfect.";
  };

  const getDifficultyColor = (diff: "easy" | "medium" | "hard") => {
    switch (diff) {
      case 'easy': return 'bg-green-500 hover:bg-green-600';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'hard': return 'bg-red-500 hover:bg-red-600';
    }
  };

  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">🎉 Game Complete!</h2>
          <p className="text-gray-600 mb-6">You've completed all {totalQuestions} {difficulty} circuit challenges!</p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{score}</div>
                <div className="text-sm text-gray-600">Total Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{questionsCorrect}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{averageScore}</div>
                <div className="text-sm text-gray-600">Avg Score</div>
              </div>
            </div>
          </div>

          <p className="text-lg mb-6 text-gray-700">{getPerformanceMessage()}</p>

          <div className="space-y-3">
            <button
              onClick={onRestart}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${getDifficultyColor(difficulty)}`}
            >
              🔄 Play {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Again
            </button>
            
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).filter(d => d !== difficulty).map(diff => (
                <button
                  key={diff}
                  onClick={() => onChangeDifficulty(diff)}
                  className={`flex-1 py-2 px-3 rounded-lg text-white font-medium transition-colors ${getDifficultyColor(diff)}`}
                >
                  Try {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DifficultyMenuProps {
  onStartGame: (difficulty: "easy" | "medium" | "hard") => void;
  theme: string;
}

function DifficultyMenu({ onStartGame, theme }: DifficultyMenuProps) {
  const getDifficultyColor = (diff: "easy" | "medium" | "hard") => {
    switch (diff) {
      case 'easy': return 'bg-green-500 hover:bg-green-600 border-green-300';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600 border-yellow-300';
      case 'hard': return 'bg-red-500 hover:bg-red-600 border-red-300';
    }
  };

  const getDifficultyDescription = (diff: "easy" | "medium" | "hard") => {
    switch (diff) {
      case 'easy': return 'Basic circuits with simple components like resistors and LEDs';
      case 'medium': return 'Intermediate circuits with capacitors, inductors, and transistors';
      case 'hard': return 'Advanced circuits with complex components and multiple stages';
    }
  };

  const getDifficultyIcon = (diff: "easy" | "medium" | "hard") => {
    switch (diff) {
      case 'easy': return '🌱';
      case 'medium': return '⚡';
      case 'hard': return '🔥';
    }
  };

  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🔌 Circuit Challenge</h1>
          <p className="text-gray-600 text-lg">Choose your difficulty level to begin the circuit building challenge!</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {(['easy', 'medium', 'hard'] as const).map(diff => (
            <div key={diff} className="text-center">
              <button
                onClick={() => onStartGame(diff)}
                className={`w-full p-6 rounded-xl text-white font-bold text-xl transition-all duration-200 transform hover:scale-105 shadow-lg ${getDifficultyColor(diff)}`}
              >
                <div className="text-4xl mb-3">{getDifficultyIcon(diff)}</div>
                <div className="text-2xl mb-2">{diff.charAt(0).toUpperCase() + diff.slice(1)}</div>
                <div className="text-sm opacity-90 font-normal leading-relaxed">
                  {getDifficultyDescription(diff)}
                </div>
                <div className="mt-4 text-sm font-semibold">
                  {getTotalQuestionsForDifficulty(diff)} Questions
                </div>
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">How to Play:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Select the blank component in the circuit</p>
              <p>• Select the correct components to complete each circuit</p>
              <p>• Click "Submit" to check your solution</p>
              <p>• Earn points for correct answers and track your progress</p>
            </div>
          </div>
        </div>
      </div>
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
  
  // State for difficulty selection (overrides prop)
  const [currentDifficulty, setCurrentDifficulty] = useState<"easy" | "medium" | "hard">(difficulty);
  
  // Scoreboard state
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [questionsCorrect, setQuestionsCorrect] = useState(0);
  
  // Track shown questions to avoid repetition
  const [shownQuestionIds, setShownQuestionIds] = useState<string[]>([]);
  
  // Game completion state
  const [isGameComplete, setIsGameComplete] = useState(false);
  
  // Game started state
  const [isGameStarted, setIsGameStarted] = useState(false);

  // Get the current circuit template based on difficulty (memoized to prevent refresh on component selection)
  const currentTemplate = useMemo(() => {
    const template = generateUniqueChallenge(currentDifficulty, shownQuestionIds);
    
    // Check if game is complete (no more questions available)
    if (template === null) {
      setIsGameComplete(true);
      return null;
    }
    
    // Add the new question ID to the shown list
    if (!shownQuestionIds.includes(template.id)) {
      setShownQuestionIds(prev => [...prev, template.id]);
    }
    return template;
  }, [currentDifficulty, questionsAnswered]);

  // Reset placed components when template changes
  useEffect(() => {
    setPlacedComponents({});
  }, [currentTemplate?.id]);

  // Handle difficulty change
  const handleDifficultyChange = (newDifficulty: "easy" | "medium" | "hard") => {
    setCurrentDifficulty(newDifficulty);
    // Reset game state when difficulty changes
    setPlacedComponents({});
    setSelectedComponentFromUI(null);
    // Reset shown questions for new difficulty level
    setShownQuestionIds([]);
    setIsGameComplete(false);
    // Optionally reset score/stats when changing difficulty
    // setScore(0);
    // setQuestionsAnswered(0);
    // setQuestionsCorrect(0);
  };

  // Handle game restart with same difficulty
  const handleGameRestart = () => {
    setPlacedComponents({});
    setSelectedComponentFromUI(null);
    setShownQuestionIds([]);
    setIsGameComplete(false);
    setScore(0);
    setQuestionsAnswered(0);
    setQuestionsCorrect(0);
    setIsGameStarted(true);
  };

  // Handle starting the game with selected difficulty
  const handleStartGame = (selectedDifficulty: "easy" | "medium" | "hard") => {
    setCurrentDifficulty(selectedDifficulty);
    setPlacedComponents({});
    setSelectedComponentFromUI(null);
    setShownQuestionIds([]);
    setIsGameComplete(false);
    setScore(0);
    setQuestionsAnswered(0);
    setQuestionsCorrect(0);
    setIsGameStarted(true);
  };

  // Handle changing difficulty from game summary
  const handleChangeDifficultyFromSummary = (newDifficulty: "easy" | "medium" | "hard") => {
    setCurrentDifficulty(newDifficulty);
    setPlacedComponents({});
    setSelectedComponentFromUI(null);
    setShownQuestionIds([]);
    setIsGameComplete(false);
    setScore(0);
    setQuestionsAnswered(0);
    setQuestionsCorrect(0);
  };

  // Handle going back to main menu
  const handleBackToMenu = () => {
    setIsGameStarted(false);
    setIsGameComplete(false);
    setPlacedComponents({});
    setSelectedComponentFromUI(null);
    setShownQuestionIds([]);
    setScore(0);
    setQuestionsAnswered(0);
    setQuestionsCorrect(0);
  };

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
    if (!currentTemplate) {
      console.error('No current template available for validation');
      return;
    }

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
    // If no current template, show loading or error
    if (!currentTemplate) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-lg text-gray-600 mb-4">No more questions available</div>
            <div className="text-sm text-gray-500">Game should be complete</div>
          </div>
        </div>
      );
    }

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
              currentDifficulty={currentDifficulty}
              onBackToMenu={handleBackToMenu}
            />
          </>
        );
    }
  };

  // If game hasn't started, show difficulty menu
  if (!isGameStarted) {
    return (
      <DifficultyMenu
        onStartGame={handleStartGame}
        theme={theme}
      />
    );
  }

  // If game is complete, show summary
  if (isGameComplete) {
    return (
      <GameSummary
        score={score}
        questionsAnswered={questionsAnswered}
        questionsCorrect={questionsCorrect}
        difficulty={currentDifficulty}
        onRestart={handleGameRestart}
        onChangeDifficulty={handleChangeDifficultyFromSummary}
      />
    );
  }

  return (
    <div className="relative w-full h-full" style={{ backgroundColor }}>
      {/* Render the current view */}
      {renderCurrentView()}      
    </div>
  );
};
