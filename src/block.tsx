import React, { Suspense, useState, useMemo, useEffect } from "react";
import { Html } from "@react-three/drei";
import { CircuitUIOverlay } from "./CircuitUIOverlay";
import MissionSchematic2DScene from "./MissionSchematic2DScene";
import { circuitTemplates, generateUniqueChallenge, validateCircuit, getTotalQuestionsForDifficulty, getMissionForTemplate, getTemplateForMission, generateUniqueMission, getMissionById } from "./missionEngine";
import { 
  MdLightMode, 
  MdDarkMode, 
  MdCheckCircle, 
  MdCancel,
  MdRefresh,
  MdHome,
  MdArrowForward 
} from "react-icons/md";
import { 
  FaTrophy, 
  FaBullseye, 
  FaThumbsUp, 
  FaDumbbell,
  FaSeedling,
  FaBolt,
  FaFire
} from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";

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

interface QuestionSummaryProps {
  isValid: boolean;
  score: number;
  errors: string[];
  totalScore: number;
  questionsCorrect: number;
  questionsAnswered: number;
  onNextQuestion: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

function QuestionSummary({ 
  isValid, 
  score, 
  errors, 
  totalScore, 
  questionsCorrect, 
  questionsAnswered, 
  onNextQuestion,
  isDarkMode = false,
  onToggleDarkMode
}: QuestionSummaryProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-xl p-8 max-w-md w-full mx-4 relative`}>
        {/* Dark Mode Toggle */}
        {onToggleDarkMode && (
          <button
            onClick={onToggleDarkMode}
            className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
          </button>
        )}
        <div className="text-center">
          <div className="text-6xl mb-4">
            {isValid ? <MdCheckCircle size={96} className="text-green-500 mx-auto" /> : <MdCancel size={96} className="text-red-500 mx-auto" />}
          </div>
          
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {isValid ? "Great Job!" : "Not Quite Right"}
          </h2>
          
          {isValid ? (
            <div className="mb-6">
              <p className="text-lg text-green-600 font-semibold mb-2 flex items-center justify-center gap-2">
                Circuit is valid! <IoSparkles className="text-yellow-500" />
              </p>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                You earned <span className="font-bold text-blue-600">{score}</span> points!
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-lg text-red-600 font-semibold mb-3">
                Circuit validation failed
              </p>
              <div className={`${isDarkMode ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200'} border rounded-lg p-3 mb-4`}>
                <div className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'} space-y-1`}>
                  {errors.map((error, index) => (
                    <div key={index}>• {error}</div>
                  ))}
                </div>
              </div>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Score: <span className="font-bold">0</span> points
              </p>
            </div>
          )}
          
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mb-6`}>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-blue-600">{totalScore}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Score</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-600">
                  {questionsCorrect}/{questionsAnswered}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Correct</div>
              </div>
            </div>
          </div>
          
          <button
            onClick={onNextQuestion}
            className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
          >
            <span className="flex items-center justify-center gap-2">
              Continue to Next Question <MdArrowForward />
            </span>
          </button>
        </div>
      </div>
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
  onBackToMenu: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

function GameSummary({ score, questionsAnswered, questionsCorrect, difficulty, onRestart, onChangeDifficulty, onBackToMenu, isDarkMode = false, onToggleDarkMode }: GameSummaryProps) {
  const totalQuestions = getTotalQuestionsForDifficulty(difficulty);
  const accuracy = questionsAnswered > 0 ? Math.round((questionsCorrect / questionsAnswered) * 100) : 0;
  const averageScore = questionsAnswered > 0 ? Math.round(score / questionsAnswered) : 0;

  const getPerformanceMessage = () => {
    if (accuracy >= 90) return (
      <span className="flex items-center justify-center gap-2">
        <FaTrophy className="text-yellow-500" /> Excellent work! You're a circuit master!
      </span>
    );
    if (accuracy >= 75) return (
      <span className="flex items-center justify-center gap-2">
        <FaBullseye className="text-blue-500" /> Great job! You have a solid understanding of circuits.
      </span>
    );
    if (accuracy >= 60) return (
      <span className="flex items-center justify-center gap-2">
        <FaThumbsUp className="text-green-500" /> Good effort! Keep practicing to improve.
      </span>
    );
    return (
      <span className="flex items-center justify-center gap-2">
        <FaDumbbell className="text-purple-500" /> Keep learning! Practice makes perfect.
      </span>
    );
  };

  const getDifficultyColor = (diff: "easy" | "medium" | "hard") => {
    switch (diff) {
      case 'easy': return 'bg-green-500 hover:bg-green-600';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'hard': return 'bg-red-500 hover:bg-red-600';
    }
  };

  return (
    <div className={`flex items-center justify-center h-full ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-xl p-8 max-w-md w-full mx-4 relative`}>
        {/* Dark Mode Toggle */}
        {onToggleDarkMode && (
          <button
            onClick={onToggleDarkMode}
            className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
          </button>
        )}
        <div className="text-center">
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2 flex items-center justify-center gap-2`}>
            <IoSparkles className="text-yellow-500" /> Game Complete!
          </h2>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>You've completed all {totalQuestions} {difficulty} circuit challenges!</p>
          
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6 mb-6`}>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{score}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{questionsCorrect}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{averageScore}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Score</div>
              </div>
            </div>
          </div>

          <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{getPerformanceMessage()}</p>

          <div className="space-y-3">
            <button
              onClick={onRestart}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${getDifficultyColor(difficulty)}`}
            >
              <span className="flex items-center justify-center gap-2">
                <MdRefresh /> Play {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Again
              </span>
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
            
            <button
              onClick={onBackToMenu}
              className="w-full py-2 px-4 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-medium transition-colors"
            >
              <span className="flex items-center justify-center gap-2">
                <MdHome /> Back to Menu
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DifficultyMenuProps {
  onStartGame: (difficulty: "easy" | "medium" | "hard") => void;
  theme: string;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

function DifficultyMenu({ onStartGame, theme, isDarkMode = false, onToggleDarkMode }: DifficultyMenuProps) {
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
      case 'easy': return <FaSeedling className="text-green-600" size={48} />;
      case 'medium': return <FaBolt className="text-yellow-600" size={48} />;
      case 'hard': return <FaFire className="text-red-600" size={48} />;
    }
  };

  return (
    <div className={`flex items-center justify-center h-full ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 relative`}>
        {/* Dark Mode Toggle */}
        {onToggleDarkMode && (
          <button
            onClick={onToggleDarkMode}
            className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
          </button>
        )}
        
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2 flex items-center justify-center gap-2`}>
            <FaBolt className="text-yellow-500" /> Circuit Challenge
          </h1>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-lg`}>Choose your difficulty level to begin the circuit building challenge!</p>
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
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>How to Play:</h3>
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
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
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");
  // Mission-tunable properties (e.g., resistor values in kΩ for divider mission)
  const [missionComponentValues, setMissionComponentValues] = useState<{ [id: string]: number }>({});
  // Mission state
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [shownMissionIds, setShownMissionIds] = useState<string[]>([]);
  
  // Question summary state
  const [showQuestionSummary, setShowQuestionSummary] = useState(false);
  const [questionSummaryData, setQuestionSummaryData] = useState<{
    isValid: boolean;
    score: number;
    errors: string[];
    totalScore: number;
    questionsCorrect: number;
    questionsAnswered: number;
  } | null>(null);
  
  // Get the current circuit template based on difficulty (memoized to prevent refresh on component selection)
  const currentTemplate = useMemo(() => {
    const template = generateUniqueChallenge(currentDifficulty, shownQuestionIds);

    // If template pool is exhausted but we're in mission mode, don't end the game here
    if (template === null) {
      if (!activeMissionId) {
        setIsGameComplete(true);
      }
      return null;
    }

    // Add the new question ID to the shown list
    if (!shownQuestionIds.includes(template.id)) {
      setShownQuestionIds(prev => [...prev, template.id]);
    }
    return template;
  }, [currentDifficulty, questionsAnswered, activeMissionId]);

  const activeTemplate = useMemo(() => {
    const missionTemplate = activeMissionId ? getTemplateForMission(activeMissionId) : null;
    // Fallback to currentTemplate if mission mapping is missing
    return missionTemplate ?? currentTemplate;
  }, [currentTemplate, activeMissionId]);

  // Debug - show specific template (change debugTemplateId to test different templates)
  // const currentTemplate = useMemo(() => {
  //   const debugTemplateId = "hard-2"; // Change this ID to debug different templates
    
  //   // Find the specific template by ID across all difficulties
  //   const debugTemplate = circuitTemplates.find(t => t.id === debugTemplateId);
    
  //   if (debugTemplate) {
  //     // Add to shown questions if not already there
  //     if (!shownQuestionIds.includes(debugTemplate.id)) {
  //       setShownQuestionIds(prev => [...prev, debugTemplate.id]);
  //     }
  //     return debugTemplate;
  //   }
    
  //   // Fallback to first available template if debug template not found
  //   console.warn(`Debug template "${debugTemplateId}" not found, using first available template`);
  //   return circuitTemplates[0] || null;
  // }, []); // Empty dependency array to keep it stable for debugging

  // Reset placed components when template changes
  useEffect(() => {
    setPlacedComponents({});
  }, [activeTemplate?.id]);

  // Handle difficulty change
  const handleDifficultyChange = (newDifficulty: "easy" | "medium" | "hard") => {
    setCurrentDifficulty(newDifficulty);
    // Reset game state when difficulty changes
    setPlacedComponents({});
    setSelectedComponentFromUI(null);
    // Reset shown questions for new difficulty level
    setShownQuestionIds([]);
    setIsGameComplete(false);
    // Reset summary state
    setShowQuestionSummary(false);
    setQuestionSummaryData(null);
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
  setShownMissionIds([]);
    setIsGameComplete(false);
    setShowQuestionSummary(false);
    setQuestionSummaryData(null);
    setScore(0);
    setQuestionsAnswered(0);
    setQuestionsCorrect(0);
    setIsGameStarted(true);
  // Keep currentDifficulty; pick a fresh mission on restart
  const mission = generateUniqueMission(currentDifficulty, []);
  setActiveMissionId(mission ? mission.id : null);
  };

  // Handle starting the game with selected difficulty
  const handleStartGame = (selectedDifficulty: "easy" | "medium" | "hard") => {
    setCurrentDifficulty(selectedDifficulty);
    setPlacedComponents({});
    setSelectedComponentFromUI(null);
    setShownQuestionIds([]);
    setShownMissionIds([]);
    setIsGameComplete(false);
    setShowQuestionSummary(false);
    setQuestionSummaryData(null);
    setScore(0);
    setQuestionsAnswered(0);
    setQuestionsCorrect(0);
    setIsGameStarted(true);

    // Start with the first available mission for the selected difficulty
    const mission = generateUniqueMission(selectedDifficulty, []);
    if (mission) {
      setActiveMissionId(mission.id);
      setShownMissionIds([mission.id]);
    } else {
      // No missions available for this difficulty; clear mission mode
      setActiveMissionId(null);
    }
  };

  // Handle changing difficulty from game summary
  const handleChangeDifficultyFromSummary = (newDifficulty: "easy" | "medium" | "hard") => {
    setCurrentDifficulty(newDifficulty);
    setPlacedComponents({});
    setSelectedComponentFromUI(null);
    setShownQuestionIds([]);
  setShownMissionIds([]);
    setIsGameComplete(false);
    setShowQuestionSummary(false);
    setQuestionSummaryData(null);
    setScore(0);
    setQuestionsAnswered(0);
    setQuestionsCorrect(0);
  const mission = generateUniqueMission(newDifficulty, []);
  setActiveMissionId(mission ? mission.id : null);
  };

  // Handle going back to main menu
  const handleBackToMenu = () => {
    setIsGameStarted(false);
    setIsGameComplete(false);
    setPlacedComponents({});
    setSelectedComponentFromUI(null);
    setShownQuestionIds([]);
  setShownMissionIds([]);
    setShowQuestionSummary(false);
    setQuestionSummaryData(null);
    setScore(0);
    setQuestionsAnswered(0);
    setQuestionsCorrect(0);
  setActiveMissionId(null);
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

  // Handle circuit validation and show summary
  const handleValidateCircuit = () => {
    if (!activeTemplate) {
      console.error('No current template available for validation');
      return;
    }

    // Convert placed components to the format expected by validateCircuit
    const placedComponentsArray = Object.entries(placedComponents).map(([nodeId, componentType]) => {
      // Find the node position from the template
      const node = activeTemplate.targetTopology.find(n => n.id === nodeId);
      return {
        instanceId: nodeId,
        type: componentType,
        x: node?.position.x || 0,
        y: node?.position.y || 0
      };
    });

    // Skip connection validation - only check component placement
    const connections: Array<{ from: string; to: string }> = [];
    
  const result = validateCircuit(placedComponentsArray, connections, activeTemplate, {
      componentValues: missionComponentValues,
      units: 'kOhm',
    });
    
    // Update score and question count
    const newQuestionsAnswered = questionsAnswered + 1;
    setQuestionsAnswered(newQuestionsAnswered);
    
    let newScore = score;
    let newQuestionsCorrect = questionsCorrect;
    
    if (result.isValid) {
      newScore = score + result.score;
      newQuestionsCorrect = questionsCorrect + 1;
      setScore(newScore);
      setQuestionsCorrect(newQuestionsCorrect);
    }
    
    // Show question summary instead of alert
    setQuestionSummaryData({
      isValid: result.isValid,
      score: result.score,
      errors: result.errors,
      totalScore: newScore,
      questionsCorrect: newQuestionsCorrect,
      questionsAnswered: newQuestionsAnswered
    });
    setShowQuestionSummary(true);
    
    console.log('Validation result:', result);
  };

  // Handle moving to next question from summary
  const handleNextQuestion = () => {
    // Hide summary
    setShowQuestionSummary(false);
    setQuestionSummaryData(null);
    
    // Reset components for next question
    setPlacedComponents({});
    setSelectedComponentFromUI(null);
    setMissionComponentValues({});

    // Advance to next mission if mission mode is active; otherwise continue template mode
    if (activeMissionId) {
      // Try to get next unique mission in same difficulty avoiding shownMissionIds
      const nextMission = generateUniqueMission(currentDifficulty, shownMissionIds);
      if (nextMission) {
        setActiveMissionId(nextMission.id);
        setShownMissionIds((prev) => [...prev, nextMission.id]);
      } else {
        // No more missions; mark game complete
        setIsGameComplete(true);
      }
    }
  };

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Ensure defaults for DTL mission controls so prediction shows up
  React.useEffect(() => {
    if (!activeTemplate) return;
    const m = activeMissionId ? getMissionById(activeMissionId) : getMissionForTemplate(activeTemplate);
    if (m && m.goal.kind === 'dtl-output-target') {
      setMissionComponentValues((prev) => ({
        R1: prev['R1'] ?? 100,
        R2: prev['R2'] ?? 100,
      }));
    }
  }, [activeMissionId, activeTemplate]);

  // Dynamic theme and background based on dark mode
  const currentTheme = isDarkMode ? "dark" : "light";
  const backgroundColor = isDarkMode ? "#111" : "#fafafa";

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
  // If no active template (mission/template), show loading or error
  if (!activeTemplate) {
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
            <MissionSchematic2DScene
        template={activeTemplate!}
              mission={activeMissionId ? (getMissionById(activeMissionId) ?? undefined) : undefined}
              selectedComponentFromUI={selectedComponentFromUI}
              onComponentPlaced={handleComponentPlaced}
              placedComponents={placedComponents}
              onComponentRemoved={handleComponentRemoved}
              isDarkMode={isDarkMode}
              onResistorValuesChange={setMissionComponentValues}
            />
            {/* 2D Drag-and-drop Overlay */}
            <CircuitUIOverlay 
              currentTemplate={activeTemplate!} 
              playerCount={playerCount} 
              theme={currentTheme}
              onComponentSelected={setSelectedComponentFromUI}
              selectedComponent={selectedComponentFromUI}
              onValidateCircuit={handleValidateCircuit}
              hasPlacedComponents={Object.keys(placedComponents).length > 0}
              score={score}
              questionsAnswered={questionsAnswered}
              questionsCorrect={questionsCorrect}
              currentDifficulty={currentDifficulty}
              onBackToMenu={handleBackToMenu}
              isDarkMode={isDarkMode}
              onToggleDarkMode={toggleDarkMode}
              mission={activeMissionId ? (getMissionById(activeMissionId) ?? undefined) : undefined}
              allowedComponentTypes={(activeMissionId ? getMissionById(activeMissionId)?.allowedComponents : getMissionForTemplate(activeTemplate!)?.allowedComponents)?.map(a => a.type)}
              allowedComponents={(activeMissionId ? getMissionById(activeMissionId)?.allowedComponents : getMissionForTemplate(activeTemplate!)?.allowedComponents)}
              missionTitle={activeMissionId ? getMissionById(activeMissionId)?.title : getMissionForTemplate(activeTemplate! )?.title}
              missionDescription={activeMissionId ? getMissionById(activeMissionId)?.description : getMissionForTemplate(activeTemplate! )?.description}
              constraints={activeMissionId ? getMissionById(activeMissionId)?.constraints : getMissionForTemplate(activeTemplate! )?.constraints}
              missionValues={missionComponentValues}
              missionUnits={'kOhm'}
              componentControls={(() => {
                const m = activeMissionId ? getMissionById(activeMissionId) : getMissionForTemplate(activeTemplate!);
                if (!m) return undefined;
                if (m.goal.kind === 'led-current-target') {
                  return [{ id: 'R1', label: 'R1', unit: 'kΩ', value: missionComponentValues['R1'] ?? 1, min: 0.001, max: 1000, step: 0.1 }];
                }
                if (m.goal.kind === 'voltage-threshold') {
                  return [
                    { id: 'R1', label: 'R1', unit: 'kΩ', value: missionComponentValues['R1'] ?? 1, min: 0.001, max: 1000, step: 0.1 },
                    { id: 'R2', label: 'R2', unit: 'kΩ', value: missionComponentValues['R2'] ?? 1, min: 0.001, max: 1000, step: 0.1 },
                  ];
                }
                if (m.id === 'mission-rlc-series-1') {
                  return [
                    { id: 'R', label: 'R', unit: 'kΩ', value: missionComponentValues['R'] ?? 1, min: 0.001, max: 1000, step: 0.1 },
                    { id: 'L', label: 'L', unit: 'mH', value: missionComponentValues['L'] ?? 10, min: 0.001, max: 1000, step: 0.1 },
                    { id: 'C', label: 'C', unit: 'µF', value: missionComponentValues['C'] ?? 1, min: 0.001, max: 1000, step: 0.1 },
                  ];
                }
                if (m.id === 'mission-dtl-1' || m.goal.kind === 'dtl-output-target') {
                  return [
                    { id: 'R1', label: 'R1 (base bias)', unit: 'kΩ', value: missionComponentValues['R1'] ?? 100, min: 0.001, max: 1000, step: 0.1 },
                    { id: 'R2', label: 'R2 (collector pull-up)', unit: 'kΩ', value: missionComponentValues['R2'] ?? 100, min: 0.001, max: 1000, step: 0.1 },
                  ];
                }
                return undefined;
              })()}
              onComponentControlChange={(id, value) => setMissionComponentValues(prev => ({ ...prev, [id]: value }))}
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
        theme={currentTheme}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
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
        onBackToMenu={handleBackToMenu}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />
    );
  }

  return (
    <div className="relative w-full h-full" style={{ backgroundColor }}>
      {/* Render the current view */}
      {renderCurrentView()}
      
      {/* Question Summary Modal */}
      {showQuestionSummary && questionSummaryData && (
        <QuestionSummary
          isValid={questionSummaryData.isValid}
          score={questionSummaryData.score}
          errors={questionSummaryData.errors}
          totalScore={questionSummaryData.totalScore}
          questionsCorrect={questionSummaryData.questionsCorrect}
          questionsAnswered={questionSummaryData.questionsAnswered}
          onNextQuestion={handleNextQuestion}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      )}      
    </div>
  );
};
