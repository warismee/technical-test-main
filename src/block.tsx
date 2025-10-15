import React, { Suspense, useState, useMemo, useEffect } from "react";
import { Html } from "@react-three/drei";
import { CircuitUIOverlay } from "./CircuitUIOverlay";
import MissionSchematic2DScene from "./MissionSchematic2DScene";
import { circuitTemplates, generateUniqueChallenge, validateCircuit, getMissionForTemplate, getTemplateForMission, generateUniqueMission, getMissionById, getTotalMissionsForDifficulty } from "./missionEngine";
import { 
  MdLightMode, 
  MdDarkMode, 
  MdCheckCircle, 
  MdCancel,
  MdRefresh,
  MdHome,
  MdArrowForward,
  MdContentCopy,
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
import { useRealtimeGame } from './realtime';

interface BlockProps {
  difficulty?: "easy" | "medium" | "hard";
  theme?: "light" | "dark" | string;
  playerCount?: number;
  title?: string;
  description?: string;
  autoRotate?: boolean;
  cameraPosition?: [number, number, number];
  use3DCircuit?: boolean;
  viewMode?: "2d-schematic";
  showControls?: boolean;
  roomId?: string; // realtime room id
}

type ViewMode = "2d-schematic";




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
      <div className={`${isDarkMode 
        ? 'bg-gray-800/80 text-white backdrop-blur-md' 
        : 'bg-white/80 backdrop-blur-md'} rounded-lg shadow-xl padding-8 max-w-md w-full mx-4 relative`}>
        {/* Dark Mode Toggle */}
        {onToggleDarkMode && (
          <button
            onClick={onToggleDarkMode}
            className={`btn absolute top-4 right-4 p-2 rounded-lg transition-colors ${
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
          <div className="text-6xl mb-4 flex justify-center">
            {isValid ? <MdCheckCircle size={96} className="text-green-500" /> : <MdCancel size={96} className="text-red-500" />}
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
            className="btn w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
          >
            <span className="flex items-center justify-center gap-2">
              Continue to Next Mission <MdArrowForward />
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
  playerCount?: number;
}

function GameSummary({ score, questionsAnswered, questionsCorrect, difficulty, onRestart, onChangeDifficulty, onBackToMenu, isDarkMode = false, onToggleDarkMode, playerCount = 1 }: GameSummaryProps) {
  const totalMissions = getTotalMissionsForDifficulty(difficulty);
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
  <div className={`flex items-center justify-center h-full ${isDarkMode ? 'animated-gradient-dark' : 'animated-gradient-light'}`}>
      <div className={`${isDarkMode 
        ? 'bg-gray-800/80 text-white backdrop-blur-md' 
        : 'bg-white/80 backdrop-blur-md'} rounded-lg shadow-xl padding-8 max-w-md w-full mx-4 relative`}>
        {/* Dark Mode Toggle */}
        {onToggleDarkMode && (
          <button
            onClick={onToggleDarkMode}
            className={`btn absolute top-4 right-4 p-2 rounded-lg transition-colors ${
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
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>You've completed all {totalMissions} {difficulty} missions!</p>
          
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
              className={`btn w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${getDifficultyColor(difficulty)}`}
            >
              <span className="flex items-center justify-center gap-2">
                <MdRefresh /> Play {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Again
              </span>
            </button>
            
            {playerCount === 1 && (
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as const).filter(d => d !== difficulty).map(diff => (
                  <button
                    key={diff}
                    onClick={() => onChangeDifficulty(diff)}
                    className={`btn flex-1 py-2 px-3 rounded-lg text-white font-medium transition-colors ${getDifficultyColor(diff)}`}
                  >
                    Try {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </button>
                ))}
              </div>
            )}
            
            <button
              onClick={onBackToMenu}
              className="btn w-full py-2 px-4 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-medium transition-colors"
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
  playerCount: number;
  onPlayerCountChange: (count: number) => void;
}

// Waiting Room UI shown until expected players join
interface WaitingRoomProps {
  roomId: string;
  totalPlayers: number;
  expectedPlayers: number;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onCancel: () => void;
}

function WaitingRoom({ roomId, totalPlayers, expectedPlayers, isDarkMode = false, onToggleDarkMode, onCancel }: WaitingRoomProps) {
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?room=${roomId}`
    : `?room=${roomId}`;

  // Toast state for copy feedback
  const [copied, setCopied] = useState(false);

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      // Auto-hide after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  return (
    <div className={`flex items-center justify-center h-full ${isDarkMode ? 'animated-gradient-dark' : 'animated-gradient-light'}`}>
      <div className={`${isDarkMode 
        ? 'bg-gray-800/80 text-white backdrop-blur-md' 
        : 'bg-white/80 backdrop-blur-md'} rounded-lg shadow-xl padding-8 max-w-lg w-full mx-4 relative`}>
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

        <div className="text-center space-y-4">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Waiting for players…</h2>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Players: <span className="font-semibold">{totalPlayers}</span> / {expectedPlayers}
          </p>

          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 text-left space-y-2`}>
            <div className="text-sm opacity-80">Room ID</div>
            <div className={`font-mono text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{roomId}</div>
            <div className="text-sm opacity-80 mt-3">Invite Link</div>
            <div className="flex gap-2">
              <input
                readOnly
                className={`flex-1 text-sm px-3 py-2 rounded ${isDarkMode ? 'bg-gray-800 text-gray-200 border border-gray-600' : 'bg-white text-gray-800 border border-gray-200'}`}
                value={shareUrl}
              />
              <button
                onClick={copyInvite}
                className="btn px-3 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                title="Copy invite link"
              >
                <MdContentCopy /> Copy
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onCancel}
              className="btn w-full py-2 px-4 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-medium transition-colors"
            >
              <span className="flex items-center justify-center gap-2">
                <MdHome /> Back to Menu
              </span>
            </button>
          </div>
        </div>
      </div>
      {/* Copy toast */}
      {copied && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-opacity duration-200 ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white'
          }`}
          role="status"
          aria-live="polite"
        >
          <MdContentCopy />
          <span>Invite link copied</span>
        </div>
      )}
    </div>
  );
}

function DifficultyMenu({ onStartGame, theme, isDarkMode = false, onToggleDarkMode, playerCount, onPlayerCountChange }: DifficultyMenuProps) {
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
    <div className={`flex items-center justify-center h-full ${isDarkMode ? 'animated-gradient-dark' : 'animated-gradient-light'}`}>
      <div className={`${isDarkMode 
        ? 'bg-gray-800/80 text-white backdrop-blur-md' 
        : 'bg-white/80 backdrop-blur-md'} rounded-lg shadow-xl padding-8 max-w-2xl w-full mx-4 relative`}>
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
        {/* Player count selector */}
        <div className="mb-6">
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => onPlayerCountChange(1)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                playerCount === 1
                  ? 'bg-blue-500 text-white border-blue-400'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
              }`}
              aria-pressed={playerCount === 1}
            >
              1 Player
            </button>
            <button
              onClick={() => onPlayerCountChange(2)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                playerCount === 2
                  ? 'bg-blue-500 text-white border-blue-400'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
              }`}
              aria-pressed={playerCount === 2}
            >
              2 Players
            </button>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {(['easy', 'medium', 'hard'] as const).map(diff => (
            <div key={diff} className="text-center">
              <button
                onClick={() => onStartGame(diff)}
                className={`btn w-full p-6 rounded-xl text-white font-bold text-xl transition-all duration-200 transform hover:scale-105 shadow-lg ${getDifficultyColor(diff)}`}
              >
                <div className="text-4xl mb-3 flex justify-center">{getDifficultyIcon(diff)}</div>
                <div className="text-2xl mb-2">{diff.charAt(0).toUpperCase() + diff.slice(1)}</div>
                <div className="text-sm opacity-90 font-normal leading-relaxed">
                  {getDifficultyDescription(diff)}
                </div>
                <div className="mt-4 text-sm font-semibold">
                  {getTotalMissionsForDifficulty(diff)} Missions
                </div>
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>How to Play:</h3>
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
              <p>• Pick parts to fill the blank slots in the schematic</p>
              <p>• Use the right components and values to satisfy the mission goal</p>
              <p>• Click "Submit" to validate your mission</p>
              <p>• Earn points for completed missions and track your progress</p>
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
  roomId = 'circuit-room'
}) => {
  // State for managing view mode internally
  const [currentViewMode, setCurrentViewMode] = useState<ViewMode>(initialViewMode);

  // State to manage component selection between UI overlay and circuit scene
  const [selectedComponentFromUI, setSelectedComponentFromUI] = useState<string | null>(null);
  
  // Local mirror of realtime placements (for quick render diffing)
  const [placedComponents, setPlacedComponents] = useState<{[nodeId: string]: string}>({});
  
  // State for difficulty selection (overrides prop)
  const [currentDifficulty, setCurrentDifficulty] = useState<"easy" | "medium" | "hard">(difficulty);
  
  // Scoreboard state (local personal score)
  const [score, setScore] = useState(0);
  // Player count selection (1 or 2 players)
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<number>(playerCount ?? 1);
  // Waiting room + room id + host role
  // Initialize room/waiting state from URL (joiners go straight to waiting room)
  const initialRoomFromUrl = ((): string | null => {
    if (typeof window === 'undefined') return null;
    const url = new URL(window.location.href);
    return url.searchParams.get('room');
  })();
  const [currentRoomId, setCurrentRoomId] = useState<string>(initialRoomFromUrl ?? roomId);
  const [isWaitingRoom, setIsWaitingRoom] = useState(!!initialRoomFromUrl);
  const [isHost, setIsHost] = useState(false);
  const expectedPlayers = selectedPlayerCount; // wait until selected number of players are connected

  // Realtime shared state (aggregate + presence + mission + placements)
  const { sharedScore, sharedQuestionsAnswered, sharedQuestionsCorrect, adjustSharedScore, incrementSharedQuestionsAnswered, incrementSharedQuestionsCorrect, setPersonalScore, peers, isConnected, missionId, setMissionId, placed, setPlaced, patchPlaced, missionValues, setMissionValues, patchMissionValue, hintMeta, applyHintPenalty, resetHintMeta, questionSummary: sharedQuestionSummary, publishQuestionSummary, clearQuestionSummary } = useRealtimeGame({ roomId: currentRoomId, initialScore: 0 });
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
  // Local mirror for mission component values replaced by realtime missionValues
  const [missionComponentValues, setMissionComponentValues] = useState<{ [id: string]: number }>({});
  // Mission state (local fallback). Realtime missionId will override if present.
  const [activeMissionIdLocal, setActiveMissionIdLocal] = useState<string | null>(null);
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

  // Subscribe to shared questionSummary to open/close modal in sync
  useEffect(() => {
    if (sharedQuestionSummary) {
      setQuestionSummaryData({
        isValid: sharedQuestionSummary.isValid,
        score: sharedQuestionSummary.score,
        errors: sharedQuestionSummary.errors,
        totalScore: sharedQuestionSummary.totalScore,
        questionsCorrect: sharedQuestionSummary.questionsCorrect,
        questionsAnswered: sharedQuestionSummary.questionsAnswered,
      });
      setShowQuestionSummary(true);
    } else {
      setShowQuestionSummary(false);
      setQuestionSummaryData(null);
    }
  }, [sharedQuestionSummary]);
  
  // Get the current circuit template based on difficulty (memoized to prevent refresh on component selection)
  const currentTemplate = useMemo(() => {
    const template = generateUniqueChallenge(currentDifficulty, shownQuestionIds);

    // If template pool is exhausted but we're in mission mode, don't end the game here
    if (template === null) {
      if (!(activeMissionIdLocal)) {
        setIsGameComplete(true);
      }
      return null;
    }

    // Add the new question ID to the shown list
    if (!shownQuestionIds.includes(template.id)) {
      setShownQuestionIds(prev => [...prev, template.id]);
    }
    return template;
  }, [currentDifficulty, questionsAnswered, activeMissionIdLocal]);

  const activeTemplate = useMemo(() => {
    const missionTemplate = activeMissionIdLocal ? getTemplateForMission(activeMissionIdLocal) : null;
    // Fallback to currentTemplate if mission mapping is missing
    return missionTemplate ?? currentTemplate;
  }, [currentTemplate, activeMissionIdLocal]);

  // Sync local mission component values with realtime values
  useEffect(() => {
    setMissionComponentValues(missionValues);
  }, [missionValues]);

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

  // Sync local placements with realtime when template or shared placed map changes
  useEffect(() => {
    setPlacedComponents(placed);
  }, [placed, activeTemplate?.id]);

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
  setActiveMissionIdLocal(mission ? mission.id : null);
  if (mission) {
    setShownMissionIds([mission.id]);
    // Reset hint for new mission across clients
    resetHintMeta();
  // Clear shared placements and mission values for the new mission
  setPlaced({});
  setMissionValues({});
    // Sync mission selection for all players
    setMissionId(mission.id);
  } else {
    // No missions available; broadcast game-complete state
    setMissionId(null);
  }
  };

  // Handle starting the game with selected difficulty
  const handleStartGame = (selectedDifficulty: "easy" | "medium" | "hard") => {
    setCurrentDifficulty(selectedDifficulty);
    // Reset local state
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

    if (selectedPlayerCount === 1) {
      // Single-player: start immediately with a mission, no waiting room
      const mission = generateUniqueMission(selectedDifficulty, []);
      setActiveMissionIdLocal(mission ? mission.id : null);
      if (mission) {
        setShownMissionIds([mission.id]);
        resetHintMeta();
        setPlaced({});
        setMissionValues({});
        setMissionId(mission.id);
      } else {
        setMissionId(null);
      }
      setIsWaitingRoom(false);
      setIsHost(true);
      setIsGameStarted(true);
      // Remove room param for solo mode
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('room');
        window.history.replaceState({}, '', url.toString());
      }
    } else {
      // Two-player: create a room and enter waiting room as host
      const baseId = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
        ? (crypto as any).randomUUID()
        : Math.random().toString(36).slice(2, 10);
      const newRoomId = `${selectedDifficulty}-${baseId}`;
      setCurrentRoomId(newRoomId);
      setIsWaitingRoom(true);
      setIsHost(true);
      setIsGameStarted(false);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('room', newRoomId);
        window.history.replaceState({}, '', url.toString());
      }
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
  setActiveMissionIdLocal(mission ? mission.id : null);
    if (mission) {
      setShownMissionIds([mission.id]);
      resetHintMeta();
  // Clear shared placements and mission values for the new mission
  setPlaced({});
  setMissionValues({});
      // Sync for all players
      setMissionId(mission.id);
    } else {
      // Nothing to play at this difficulty; reflect across clients
      setMissionId(null);
    }
  };

  // Handle going back to main menu
  const handleBackToMenu = () => {
    setIsGameStarted(false);
    setIsWaitingRoom(false);
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
  setActiveMissionIdLocal(null);
  // Clear shared mission for everyone when returning to menu
  setMissionId(null);
    // Reset back to default room
    setCurrentRoomId(roomId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('room');
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Handle when a component is placed in the circuit
  const handleComponentPlaced = (nodeId: string, componentType: string) => {
  setSelectedComponentFromUI(null);
  patchPlaced(nodeId, componentType);
  console.log(`Component ${componentType} placed at ${nodeId}`);
  };

  // Handle when a component is removed from the circuit
  const handleComponentRemoved = (nodeId: string) => {
  patchPlaced(nodeId, null);
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
  // Realtime aggregate
  incrementSharedQuestionsAnswered();
    
    let newScore = score;
    let newQuestionsCorrect = questionsCorrect;
    
    if (result.isValid) {
      // Apply hint penalty to awarded points if a hint was used
      const usedPenalty = (hintMeta?.count ?? 0) > 0 ? (hintMeta?.lastPenaltyPercent ?? 0) : 0;
      const awarded = Math.max(0, Math.round(result.score * (1 - usedPenalty)));
      newScore = score + awarded;
      newQuestionsCorrect = questionsCorrect + 1;
      setScore(newScore);
      setQuestionsCorrect(newQuestionsCorrect);
      // Realtime: add to shared aggregate & update own personal score in presence map
      adjustSharedScore(awarded);
      setPersonalScore(newScore);
      incrementSharedQuestionsCorrect();
    }
    
    // Show question summary instead of alert
    const summaryPayload = {
      isValid: result.isValid,
      // Show the awarded points (after any hint penalty) if valid
      score: result.isValid ? Math.max(0, Math.round(result.score * (1 - ((hintMeta?.count ?? 0) > 0 ? (hintMeta?.lastPenaltyPercent ?? 0) : 0)))) : result.score,
      errors: result.errors,
      totalScore: newScore,
      questionsCorrect: newQuestionsCorrect,
      questionsAnswered: newQuestionsAnswered
    };
    // Publish shared summary so all clients open the same modal
    publishQuestionSummary(summaryPayload);
    
    console.log('Validation result:', result);
  };

  // Handle moving to next question from summary
  const handleNextQuestion = () => {
  // Hide summary in sync
  clearQuestionSummary();
    
    // Reset components for next question
    setPlacedComponents({});
    setSelectedComponentFromUI(null);
  setMissionComponentValues({});

    // Advance to next mission if mission mode is active; otherwise continue template mode
  if (activeMissionIdLocal) {
      // Try to get next unique mission in same difficulty avoiding shownMissionIds
      const nextMission = generateUniqueMission(currentDifficulty, shownMissionIds);
      if (nextMission) {
        setActiveMissionIdLocal(nextMission.id);
        setShownMissionIds((prev) => [...prev, nextMission.id]);
        // Sync mission selection for all players
        setMissionId(nextMission.id);
  // Reset hint usage for the new mission across clients
  resetHintMeta();
  // Clear shared placements and mission values for the new mission
  setPlaced({});
  setMissionValues({});
      } else {
        // No more missions; mark game complete
        setIsGameComplete(true);
        // Clear shared mission id
        setMissionId(null);
      }
    }
  };

  // Allow joining an existing room via URL (?room=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const roomFromUrl = url.searchParams.get('room');
    if (roomFromUrl) {
      // Extract difficulty prefix from room id: <difficulty>-<uuid>
      const maybeDiff = roomFromUrl.split('-')[0] as string | undefined;
      if (maybeDiff === 'easy' || maybeDiff === 'medium' || maybeDiff === 'hard') {
        if (maybeDiff !== currentDifficulty) {
          setCurrentDifficulty(maybeDiff);
        }
      }
      if (roomFromUrl !== currentRoomId) {
        setCurrentRoomId(roomFromUrl);
      }
      // Always enter waiting room when joining via URL as non-host
      setIsWaitingRoom(true);
      setIsHost(false);
      setIsGameStarted(false);
  setSelectedPlayerCount(2);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Host: when enough players are present, start first mission and leave waiting room
  useEffect(() => {
    if (!isWaitingRoom || !isHost || isGameStarted) return;
    const totalPlayers = Array.isArray(peers) ? peers.length : 0; // includes self
    if (totalPlayers >= expectedPlayers) {
      const mission = generateUniqueMission(currentDifficulty, []);
      if (mission) {
        setActiveMissionIdLocal(mission.id);
        setShownMissionIds([mission.id]);
        resetHintMeta();
        setPlaced({});
        setMissionValues({});
        setMissionId(mission.id);
      } else {
        setActiveMissionIdLocal(null);
        setMissionId(null);
      }
      setIsWaitingRoom(false);
      setIsGameStarted(true);
    }
  }, [isWaitingRoom, isHost, isGameStarted, peers, currentDifficulty, setMissionId, resetHintMeta, setPlaced, setMissionValues]);

  // Non-host: leave waiting room when a mission is set
  useEffect(() => {
    if (isWaitingRoom && !isHost && missionId) {
      setIsWaitingRoom(false);
      setIsGameStarted(true);
    }
  }, [missionId, isWaitingRoom, isHost]);

  // When shared missionId changes, mirror locally and reset per-mission local state
  useEffect(() => {
    // Ignore if equal to avoid loops
    if (missionId !== activeMissionIdLocal) {
      setActiveMissionIdLocal(missionId ?? null);
      if (missionId) {
        setPlacedComponents({});
        setSelectedComponentFromUI(null);
        setMissionComponentValues({});
        setShownMissionIds((prev) => prev.includes(missionId) ? prev : [...prev, missionId]);
      } else {
        // If shared mission is cleared, all clients should enter game-complete
        setPlacedComponents({});
        setSelectedComponentFromUI(null);
        setMissionComponentValues({});
        setIsGameComplete(true);
        // Close any open summaries locally to avoid overlap
        setShowQuestionSummary(false);
        setQuestionSummaryData(null);
      }
    }
  }, [missionId]);

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Ensure defaults for DTL mission controls so prediction shows up
  React.useEffect(() => {
    if (!activeTemplate) return;
  const m = activeMissionIdLocal ? getMissionById(activeMissionIdLocal) : getMissionForTemplate(activeTemplate);
    if (m && m.goal.kind === 'dtl-output-target') {
      setMissionComponentValues((prev) => ({
        R1: prev['R1'] ?? 100,
        R2: prev['R2'] ?? 100,
      }));
    }
  }, [activeMissionIdLocal, activeTemplate]);

  // Dynamic theme and background based on dark mode
  const currentTheme = isDarkMode ? "dark" : "light";
  // Background now handled via animated gradient classes in styles.css

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
            <div className="text-lg text-gray-600 mb-4">No more missions available</div>
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
              mission={activeMissionIdLocal ? (getMissionById(activeMissionIdLocal) ?? undefined) : undefined}
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
              playerCount={selectedPlayerCount} 
              theme={currentTheme}
              isHost={isHost}
              onComponentSelected={setSelectedComponentFromUI}
              selectedComponent={selectedComponentFromUI}
              onValidateCircuit={handleValidateCircuit}
              hasPlacedComponents={Object.keys(placedComponents).length > 0}
              score={sharedScore}
              hintMeta={hintMeta}
              onHintUsed={(penaltyPercent) => {
                // Record hint usage; actual deduction applied on next awarded points
                applyHintPenalty(penaltyPercent);
              }}
              questionsAnswered={sharedQuestionsAnswered}
              questionsCorrect={sharedQuestionsCorrect}
              currentDifficulty={currentDifficulty}
              onBackToMenu={handleBackToMenu}
              isDarkMode={isDarkMode}
              onToggleDarkMode={toggleDarkMode}
              mission={activeMissionIdLocal ? (getMissionById(activeMissionIdLocal) ?? undefined) : undefined}
              allowedComponentTypes={(activeMissionIdLocal ? getMissionById(activeMissionIdLocal)?.allowedComponents : getMissionForTemplate(activeTemplate!)?.allowedComponents)?.map(a => a.type)}
              allowedComponents={(activeMissionIdLocal ? getMissionById(activeMissionIdLocal)?.allowedComponents : getMissionForTemplate(activeTemplate!)?.allowedComponents)}
              missionTitle={activeMissionIdLocal ? getMissionById(activeMissionIdLocal)?.title : getMissionForTemplate(activeTemplate! )?.title}
              missionDescription={activeMissionIdLocal ? getMissionById(activeMissionIdLocal)?.description : getMissionForTemplate(activeTemplate! )?.description}
              constraints={activeMissionIdLocal ? getMissionById(activeMissionIdLocal)?.constraints : getMissionForTemplate(activeTemplate! )?.constraints}
              missionValues={missionComponentValues}
              missionUnits={'kOhm'}
              componentControls={(() => {
                const m = activeMissionIdLocal ? getMissionById(activeMissionIdLocal) : getMissionForTemplate(activeTemplate!);
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
              onComponentControlChange={(id, value) => {
                setMissionComponentValues(prev => ({ ...prev, [id]: value }));
                patchMissionValue(id, value);
              }}
            />
            {/* Shared realtime meta (aggregate score & hints) */}
            {/* <div className="absolute top-2 left-2 text-xs px-3 py-2 rounded bg-black/50 text-white backdrop-blur-sm space-y-1 shadow">
              <div>Shared Score: <span className="font-semibold">{sharedScore}</span></div>
              <div>Hints Used (room): {hintMeta?.count ?? 0}</div>
              {hintMeta?.lastPenaltyPercent ? (
                <div className="opacity-70">Last Penalty: {Math.round((hintMeta.lastPenaltyPercent)*100)}%</div>
              ) : null}
              <div className={`mt-1 h-2 rounded ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
            </div> */}
          </>
        );
    }
  };

  // If game hasn't started, show difficulty menu
  if (isWaitingRoom) {
    const totalPlayers = Array.isArray(peers) ? peers.length : 0; // includes self
    return (
      <WaitingRoom
        roomId={currentRoomId}
        totalPlayers={totalPlayers}
        expectedPlayers={expectedPlayers}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onCancel={handleBackToMenu}
      />
    );
  }

  if (!isGameStarted) {
    return (
      <DifficultyMenu
        onStartGame={handleStartGame}
        theme={currentTheme}
        isDarkMode={isDarkMode}
  onToggleDarkMode={toggleDarkMode}
  playerCount={selectedPlayerCount}
  onPlayerCountChange={setSelectedPlayerCount}
      />
    );
  }

  // If game is complete, show summary
  if (isGameComplete) {
    return (
      <GameSummary
  score={sharedScore}
  questionsAnswered={sharedQuestionsAnswered}
  questionsCorrect={sharedQuestionsCorrect}
        difficulty={currentDifficulty}
        onRestart={handleGameRestart}
        onChangeDifficulty={handleChangeDifficultyFromSummary}
        onBackToMenu={handleBackToMenu}
        isDarkMode={isDarkMode}
  onToggleDarkMode={toggleDarkMode}
  playerCount={selectedPlayerCount}
      />
    );
  }

  return (
    <div className={`relative w-full h-full ${isDarkMode ? 'animated-gradient-dark' : 'animated-gradient-light'}`}>
      {/* Render the current view */}
      {renderCurrentView()}
      
  {/* Mission Summary Modal */}
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
