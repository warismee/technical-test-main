import * as React from "react";
import { CircuitTemplate } from "./circuitLogic";

interface CircuitUIOverlayProps {
  currentTemplate: CircuitTemplate;
  theme: string;
  playerCount: number;
  onComponentSelected?: (componentType: string | null) => void;
  selectedComponent?: string | null;
  onValidateCircuit?: () => void;
  hasPlacedComponents?: boolean;
  score?: number;
  questionsAnswered?: number;
  questionsCorrect?: number;
  currentDifficulty?: "easy" | "medium" | "hard";
  onBackToMenu?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

interface Component {
  id: string;
  type: string;
  label: string;
  symbol: React.ReactNode;
}



// SVG Schematic Symbols
const ResistorSymbol = ({ color = "#333333" }: { color?: string }) => (
  <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
    <path 
      d="M2 10 L8 10 L10 6 L14 14 L18 6 L22 14 L26 6 L30 14 L32 10 L38 10" 
      stroke={color} 
      strokeWidth="2" 
      fill="none"
    />
    <circle cx="2" cy="10" r="1.5" fill={color} />
    <circle cx="38" cy="10" r="1.5" fill={color} />
  </svg>
);

const CapacitorSymbol = ({ color = "#333333" }: { color?: string }) => (
  <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
    <line x1="2" y1="10" x2="16" y2="10" stroke={color} strokeWidth="2" />
    <line x1="16" y1="4" x2="16" y2="16" stroke={color} strokeWidth="3" />
    <line x1="24" y1="4" x2="24" y2="16" stroke={color} strokeWidth="3" />
    <line x1="24" y1="10" x2="38" y2="10" stroke={color} strokeWidth="2" />
    <circle cx="2" cy="10" r="1.5" fill={color} />
    <circle cx="38" cy="10" r="1.5" fill={color} />
  </svg>
);

const InductorSymbol = ({ color = "#333333" }: { color?: string }) => (
  <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
    <path 
      d="M2 10 L8 10" 
      stroke={color} 
      strokeWidth="2"
    />
    {/* Semicircular coils */}
    <path 
      d="M8 10 A2 2 0 0 0 12 10" 
      stroke={color} 
      strokeWidth="2" 
      fill="none"
    />
    <path 
      d="M12 10 A2 2 0 0 0 16 10" 
      stroke={color} 
      strokeWidth="2" 
      fill="none"
    />
    <path 
      d="M16 10 A2 2 0 0 0 20 10" 
      stroke={color} 
      strokeWidth="2" 
      fill="none"
    />
    <path 
      d="M20 10 A2 2 0 0 0 24 10" 
      stroke={color} 
      strokeWidth="2" 
      fill="none"
    />
    <path 
      d="M24 10 A2 2 0 0 0 28 10" 
      stroke={color} 
      strokeWidth="2" 
      fill="none"
    />
    <path 
      d="M28 10 A2 2 0 0 0 32 10" 
      stroke={color} 
      strokeWidth="2" 
      fill="none"
    />
    <path 
      d="M32 10 L38 10" 
      stroke={color} 
      strokeWidth="2"
    />
    <circle cx="2" cy="10" r="1.5" fill={color} />
    <circle cx="38" cy="10" r="1.5" fill={color} />
  </svg>
);

const getComponentsFromTemplate = (template: CircuitTemplate, symbolColor: string = "#333333"): Component[] => {
  const allComponents = [
    { id: "R", type: "R", label: "Resistor", symbol: <ResistorSymbol color={symbolColor} /> },
    { id: "L", type: "L", label: "Inductor", symbol: <InductorSymbol color={symbolColor} /> },
    { id: "C", type: "C", label: "Capacitor", symbol: <CapacitorSymbol color={symbolColor} /> },
    { id: "D", type: "D", label: "Diode", symbol: (
      <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
        <line x1="2" y1="10" x2="16" y2="10" stroke={symbolColor} strokeWidth="2" />
        <polygon points="16,6 16,14 24,10" fill={symbolColor} />
        <line x1="24" y1="6" x2="24" y2="14" stroke={symbolColor} strokeWidth="2" />
        <line x1="24" y1="10" x2="38" y2="10" stroke={symbolColor} strokeWidth="2" />
        <circle cx="2" cy="10" r="1.5" fill={symbolColor} />
        <circle cx="38" cy="10" r="1.5" fill={symbolColor} />
      </svg>
    ) },
    { id: "S", type: "S", label: "Switch", symbol: (
      <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
        <line x1="2" y1="10" x2="12" y2="10" stroke={symbolColor} strokeWidth="2" />
        <line x1="12" y1="10" x2="28" y2="6" stroke={symbolColor} strokeWidth="2" />
        <line x1="28" y1="10" x2="38" y2="10" stroke={symbolColor} strokeWidth="2" />
        <circle cx="12" cy="10" r="1.5" fill={symbolColor} />
        <circle cx="28" cy="10" r="1.5" fill={symbolColor} />
        <circle cx="2" cy="10" r="1.5" fill={symbolColor} />
        <circle cx="38" cy="10" r="1.5" fill={symbolColor} />
      </svg>
    ) },
    { id: "LED", type: "LED", label: "LED", symbol: (
      <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
        <line x1="2" y1="10" x2="16" y2="10" stroke={symbolColor} strokeWidth="2" />
        <polygon points="16,6 16,14 24,10" fill="#ff4444" />
        <line x1="24" y1="6" x2="24" y2="14" stroke={symbolColor} strokeWidth="2" />
        <line x1="24" y1="10" x2="38" y2="10" stroke={symbolColor} strokeWidth="2" />
        <line x1="26" y1="4" x2="30" y2="2" stroke="#ffaa00" strokeWidth="1.5" />
        <line x1="26" y1="16" x2="30" y2="18" stroke="#ffaa00" strokeWidth="1.5" />
        <circle cx="2" cy="10" r="1.5" fill={symbolColor} />
        <circle cx="38" cy="10" r="1.5" fill={symbolColor} />
      </svg>
    ) },
    { id: "Q", type: "Q", label: "Transistor", symbol: (
      <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
        <line x1="2" y1="10" x2="12" y2="10" stroke={symbolColor} strokeWidth="2" />
        <line x1="12" y1="6" x2="12" y2="14" stroke={symbolColor} strokeWidth="3" />
        <line x1="12" y1="8" x2="20" y2="4" stroke={symbolColor} strokeWidth="2" />
        <line x1="12" y1="12" x2="20" y2="16" stroke={symbolColor} strokeWidth="2" />
        <line x1="20" y1="4" x2="20" y2="2" stroke={symbolColor} strokeWidth="2" />
        <line x1="20" y1="16" x2="20" y2="18" stroke={symbolColor} strokeWidth="2" />
        <polygon points="18,15 20,16 19,17" fill={symbolColor} />
        <circle cx="2" cy="10" r="1.5" fill={symbolColor} />
        <circle cx="20" cy="2" r="1.5" fill={symbolColor} />
        <circle cx="20" cy="18" r="1.5" fill={symbolColor} />
      </svg>
    ) },
    { id: "OP", type: "OP", label: "Op-Amp", symbol: (
      <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
        <polygon points="8,4 8,16 32,10" fill="none" stroke={symbolColor} strokeWidth="2" />
        <line x1="2" y1="7" x2="8" y2="7" stroke={symbolColor} strokeWidth="2" />
        <line x1="2" y1="13" x2="8" y2="13" stroke={symbolColor} strokeWidth="2" />
        <line x1="32" y1="10" x2="38" y2="10" stroke={symbolColor} strokeWidth="2" />
        <line x1="20" y1="4" x2="20" y2="2" stroke={symbolColor} strokeWidth="2" />
        <line x1="20" y1="16" x2="20" y2="18" stroke={symbolColor} strokeWidth="2" />
        <text x="12" y="8" fontSize="6" fill={symbolColor}>+</text>
        <text x="12" y="14" fontSize="6" fill={symbolColor}>-</text>
        <circle cx="2" cy="7" r="1.5" fill={symbolColor} />
        <circle cx="2" cy="13" r="1.5" fill={symbolColor} />
        <circle cx="38" cy="10" r="1.5" fill={symbolColor} />
        <circle cx="20" cy="2" r="1.5" fill={symbolColor} />
        <circle cx="20" cy="18" r="1.5" fill={symbolColor} />
      </svg>
    ) },
    { id: "IC", type: "IC", label: "IC", symbol: (
      <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
        <rect x="8" y="4" width="24" height="12" fill="none" stroke={symbolColor} strokeWidth="2" />
        <line x1="2" y1="7" x2="8" y2="7" stroke={symbolColor} strokeWidth="2" />
        <line x1="2" y1="13" x2="8" y2="13" stroke={symbolColor} strokeWidth="2" />
        <line x1="32" y1="7" x2="38" y2="7" stroke={symbolColor} strokeWidth="2" />
        <line x1="32" y1="13" x2="38" y2="13" stroke={symbolColor} strokeWidth="2" />
        <line x1="20" y1="4" x2="20" y2="2" stroke={symbolColor} strokeWidth="2" />
        <line x1="20" y1="16" x2="20" y2="18" stroke={symbolColor} strokeWidth="2" />
        <text x="20" y="12" fontSize="8" fill={symbolColor} textAnchor="middle">IC</text>
        <circle cx="2" cy="7" r="1.5" fill={symbolColor} />
        <circle cx="2" cy="13" r="1.5" fill={symbolColor} />
        <circle cx="38" cy="7" r="1.5" fill={symbolColor} />
        <circle cx="38" cy="13" r="1.5" fill={symbolColor} />
        <circle cx="20" cy="2" r="1.5" fill={symbolColor} />
        <circle cx="20" cy="18" r="1.5" fill={symbolColor} />
      </svg>
    ) },
  ];

  // Get unique component types from the template's required components
  const requiredTypes = template.requiredComponents.map(comp => comp.type);
  return allComponents.filter(comp => requiredTypes.includes(comp.type));
};

export const CircuitUIOverlay: React.FC<CircuitUIOverlayProps> = ({
  currentTemplate,
  theme,
  playerCount,
  onComponentSelected,
  selectedComponent: selectedFromParent,
  onValidateCircuit,
  hasPlacedComponents = false,
  score = 0,
  questionsAnswered = 0,
  questionsCorrect = 0,
  currentDifficulty = "easy",
  onBackToMenu,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  const difficulty = currentTemplate.difficulty;

  // Determine symbol color based on dark mode
  const symbolColor = isDarkMode ? "#ffffff" : "#333333";
  const components = getComponentsFromTemplate(currentTemplate, symbolColor);

  // Handle ESC key to cancel selection
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedFromParent) {
        onComponentSelected?.(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedFromParent, onComponentSelected]);

  const isDark = theme === "dark";
  const sidebarBg = isDark ? "bg-gray-800/90" : "bg-white/90";
  const componentBg = isDark ? "bg-gray-700" : "bg-blue-100";
  const componentHover = isDark ? "hover:bg-gray-600" : "hover:bg-blue-200";
  const textColor = isDark ? "text-white" : "text-gray-800";
  const borderColor = isDark ? "border-gray-600" : "border-gray-400";

  const handleComponentClick = (component: Component) => {
    if (selectedFromParent === component.type) {
      onComponentSelected?.(null); // Deselect if clicking the same component
    } else {
      onComponentSelected?.(component.type); // Notify parent about selection
    }
  };



  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className={`absolute top-4 left-4 ${sidebarBg} p-3 rounded-lg shadow-lg pointer-events-auto`}>
        <div className={`text-sm ${textColor} font-medium`}>
          <div className="font-bold mb-1">{currentTemplate.name}</div>
          
          {/* Current Difficulty Display */}
          <div className="mb-2">
            <div className="text-xs mb-1">Difficulty:</div>
            <div className={`inline-block px-3 py-1 text-xs rounded font-medium ${
              currentDifficulty === 'easy' 
                ? 'bg-green-500 text-white' 
                : currentDifficulty === 'medium'
                ? 'bg-yellow-500 text-white'
                : 'bg-red-500 text-white'
            }`}>
              {currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}
            </div>
            <div className={`text-xs ${textColor} opacity-75 mt-1`}>
              {currentDifficulty === 'easy' && 'Simple circuits with basic components'}
              {currentDifficulty === 'medium' && 'More complex circuits with multiple components'}
              {currentDifficulty === 'hard' && 'Advanced circuits with specialized components'}
            </div>
          </div>
          
          {/* Back to Menu Button */}
          <div className="mb-2">
            <button
              onClick={() => onBackToMenu?.()}
              className={`w-full px-3 py-2 text-xs rounded font-medium transition-colors ${
                isDark 
                  ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
              }`}
            >
              🏠 Back to Menu
            </button>
          </div>
          
          <div>Players: {playerCount}</div>
        </div>
        <div className={`text-xs ${textColor} opacity-75 mt-2`}>
          {currentTemplate.description}
        </div>
      </div>

      {/* Scoreboard */}
      <div className={`absolute left-4 bottom-4 ${sidebarBg} p-3 rounded-lg shadow-lg pointer-events-auto`}>
        <div className={`text-sm ${textColor} font-bold mb-2 text-center`}>Scoreboard</div>
        <div className={`text-xs ${textColor} space-y-1`}>
          <div className="flex justify-between">
            <span>Score:</span>
            <span className="font-semibold text-blue-600">{score}</span>
          </div>
          <div className="flex justify-between">
            <span>Questions:</span>
            <span className="font-semibold">{questionsAnswered}</span>
          </div>
          <div className="flex justify-between">
            <span>Correct:</span>
            <span className="font-semibold text-green-600">{questionsCorrect}</span>
          </div>
          {questionsAnswered > 0 && (
            <div className="flex justify-between border-t pt-1 mt-1">
              <span>Accuracy:</span>
              <span className="font-semibold text-purple-600">
                {Math.round((questionsCorrect / questionsAnswered) * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={`absolute top-4 right-4 transform ${sidebarBg} p-4 rounded-lg shadow-lg pointer-events-auto`}>
        <h3 className={`text-sm font-bold ${textColor} mb-2`}>Components</h3>
        {/* <div className={`text-xs ${textColor} opacity-75 mb-2`}>
          Required: {currentTemplate.requiredComponents.map(comp => `${comp.count}×${comp.type}`).join(', ')}
        </div> */}
        <p className={`text-xs ${textColor} opacity-75 mb-3`}>
          {selectedFromParent ? 'Now click on a blank slot in the circuit' : 'Select a component, then click on a blank slot'}
        </p>
        <div className="flex flex-col gap-2">
          {components.map((component) => (
            <div
              key={component.id}
              onClick={() => handleComponentClick(component)}
              className={`cursor-pointer p-3 ${componentBg} ${componentHover} rounded-md transition-colors ${textColor} text-center select-none ${
                selectedFromParent === component.type ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="mb-1 flex justify-center">{component.symbol}</div>
              <div className="text-xs">{component.label}</div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 space-y-2">
          {selectedFromParent && (
            <button
              onClick={() => {
                onComponentSelected?.(null);
              }}
              className={`w-full px-3 py-2 text-xs ${isDark ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'} text-white rounded transition-colors`}
            >
              Cancel Selection
            </button>
          )}
          
          {hasPlacedComponents && (
            <button
              onClick={() => {
                onValidateCircuit?.();
              }}
              className={`w-full px-3 py-2 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors font-medium`}
            >
              Submit & Validate Circuit
            </button>
          )}
          
          {/* Dark Mode Toggle */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className={`w-full px-3 py-2 text-xs rounded transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          )}
        </div>
      </div>


    </div>
  );
};
