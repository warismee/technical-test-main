import * as React from "react";
import { CircuitTemplate } from "./circuitLogic";
import type { Mission } from "./missionEngine";
import { getMissionForTemplate } from "./missionEngine";
import { MdHome, MdLightMode, MdDarkMode, MdCheck } from "react-icons/md";

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
  // Mission integration (optional)
  mission?: Mission; // if provided, derives allowed, constraints, title/description automatically
  allowedComponentTypes?: string[]; // optional simple filter
  allowedComponents?: { type: string; maxCount?: number }[]; // richer mission spec
  missionTitle?: string;
  missionDescription?: string;
  constraints?: { budget?: number; maxComponents?: number };
  // Live mission component values (e.g., resistor values), used to show predicted metrics in overlay
  missionValues?: Record<string, number>;
  missionUnits?: 'ohm' | 'kOhm';
  // Optional component property controls
  componentControls?: Array<{
    id: string;
    label: string;
    unit?: string;
    value: number;
    min: number;
    max: number;
    step?: number;
  }>;
  onComponentControlChange?: (id: string, value: number) => void;
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
  return allComponents;
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
  mission,
  allowedComponentTypes,
  allowedComponents,
  missionTitle,
  missionDescription,
  constraints,
  missionValues,
  missionUnits,
  componentControls,
  onComponentControlChange,
}) => {
  const difficulty = currentTemplate.difficulty;

  // Determine symbol color based on dark mode
  const symbolColor = isDarkMode ? "#ffffff" : "#333333";
  let components = getComponentsFromTemplate(currentTemplate, symbolColor);
  // Derive mission-driven props when a mission object is provided
  const missionToShow = mission ?? getMissionForTemplate(currentTemplate as any) ?? undefined;
  const derivedAllowedComponents = mission?.allowedComponents ?? allowedComponents;
  const filterTypes = derivedAllowedComponents?.map((c) => c.type) ?? allowedComponentTypes;
  if (filterTypes && filterTypes.length > 0) {
    const allowedSet = new Set(filterTypes);
    components = components.filter((c) => allowedSet.has(c.type));
  }

  const derivedConstraints = mission?.constraints ?? constraints;
  const derivedMissionTitle = mission?.title ?? missionTitle;
  const derivedMissionDescription = mission?.description ?? missionDescription;

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
              <span className="flex items-center justify-center gap-1">
                <MdHome size={14} /> Back to Menu
              </span>
            </button>
          </div>
          
          <div>Players: {playerCount}</div>
        </div>
        {derivedMissionTitle && (
          <div className={`text-xs ${textColor} font-semibold mt-2`}>{derivedMissionTitle}</div>
        )}
        {derivedMissionDescription && (
          <div className={`text-xs ${textColor} opacity-75 mt-1`}>
            {derivedMissionDescription}
          </div>
        )}
        {/* Mission goal status: show target and predicted values for certain mission kinds */}
    {missionToShow && (
          <div className={`mt-2 text-xs ${textColor}`}>
      {missionToShow.goal.kind === 'voltage-threshold' && (
              <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded p-2`}>
                <div className="font-medium mb-1">Goal: Voltage Threshold</div>
        <div>Target: V({missionToShow.goal.params.node}) ≥ {missionToShow.goal.params.minVoltage.toFixed(2)} V{missionToShow.goal.params.supply ? ` (supply ${missionToShow.goal.params.supply} V)` : ''}</div>
                {(() => {
                  const vals = missionValues || {};
                  const R1 = typeof vals['R1'] === 'number' ? vals['R1'] : undefined;
                  const R2 = typeof vals['R2'] === 'number' ? vals['R2'] : undefined;
                  if (R1 != null && R2 != null) {
                    const scale = missionUnits === 'kOhm' ? 1000 : 1;
          const supply = missionToShow.goal.params.supply ?? 5;
                    const vout = supply * ((R2 * scale) / ((R1 * scale) + (R2 * scale)));
          const pass = vout >= missionToShow.goal.params.minVoltage;
                    return (
                      <div className="mt-1">Predicted: <span className={pass ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{vout.toFixed(2)} V</span></div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
      {missionToShow.goal.kind === 'led-current-target' && (
              <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded p-2`}>
                <div className="font-medium mb-1">Goal: LED Current Target</div>
        <div>Target: {missionToShow.goal.params.targetCurrent_mA} mA ± {(missionToShow.goal.params.tolerance_mA ?? 2)} mA</div>
        <div>Supply: {missionToShow.goal.params.supply} V, Vf≈{missionToShow.goal.params.vf ?? 2.0} V</div>
                {(() => {
                  const vals = missionValues || {};
                  const R1 = typeof vals['R1'] === 'number' ? vals['R1'] : undefined;
                  if (R1 != null) {
                    const scale = missionUnits === 'kOhm' ? 1000 : 1;
                    const R = Math.max(1e-3, R1 * scale);
          const Vs = missionToShow.goal.params.supply;
          const Vf = missionToShow.goal.params.vf ?? 2.0;
                    const I_mA = Math.max(0, ((Vs - Vf) / R) * 1000);
          const target = missionToShow.goal.params.targetCurrent_mA;
          const tol = missionToShow.goal.params.tolerance_mA ?? 2;
                    const pass = Math.abs(I_mA - target) <= tol;
                    return (
                      <div className="mt-1">Predicted: <span className={pass ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{I_mA.toFixed(1)} mA</span></div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
      {missionToShow.goal.kind === 'dtl-output-target' && (
              <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded p-2`}>
                <div className="font-medium mb-1">Goal: DTL Output</div>
                <div>
          Target: {missionToShow.goal.params.target} at OUT {' '}
          {missionToShow.goal.params.target === 'HIGH'
          ? `(≥ ${(missionToShow.goal.params.minHighV ?? 4.0).toFixed(2)} V)`
          : `(≤ ${(missionToShow.goal.params.maxLowV ?? 0.5).toFixed(2)} V)`}
                </div>
                {(() => {
                  const vals = missionValues || {};
                  const R1v = typeof vals['R1'] === 'number' ? vals['R1'] : undefined;
                  const R2v = typeof vals['R2'] === 'number' ? vals['R2'] : undefined;
                  if (R1v != null && R2v != null) {
                    const scale = missionUnits === 'kOhm' ? 1000 : 1;
          const supply = (missionToShow.goal.params as any).supply ?? 5;
          const vbeOn = (missionToShow.goal.params as any).vbeOn ?? 0.7;
                    const R1 = Math.max(1e-3, R1v * scale);
                    const R2 = Math.max(1e-3, R2v * scale);
                    // Simple heuristic: inputs HIGH; base sees R1 to VCC and Rbe to GND
                    const Rbe = 50000; // 50 kΩ effective base-emitter resistance
                    const Vb = supply * (Rbe / (R1 + Rbe));
                    const slope = 0.5;
                    const k = Math.min(1, Math.max(0, (Vb - vbeOn) / slope));
                    const RceOn = 100;
                    const RceOff = 1e9;
                    const RceEff = 1 / ((k / RceOn) + ((1 - k) / RceOff));
                    const outV = supply * (RceEff / (R2 + RceEff));
          const minHigh = (missionToShow.goal.params as any).minHighV ?? 0.8 * supply;
          const maxLow = (missionToShow.goal.params as any).maxLowV ?? 0.5;
          const pass = (missionToShow.goal.params as any).target === 'HIGH' ? outV >= minHigh : outV <= maxLow;
                    return (
                      <div className="mt-1">Predicted OUT: <span className={pass ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{outV.toFixed(2)} V</span></div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </div>
        )}
        {derivedConstraints?.maxComponents != null && (
          <div className={`text-xs ${textColor} opacity-75 mt-1`}>Max components: {derivedConstraints.maxComponents}</div>
        )}
        {derivedConstraints?.budget != null && (
          <div className={`text-xs ${textColor} opacity-75`}>Budget: {derivedConstraints.budget}</div>
        )}
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

      <div className={`absolute bottom-4 right-4 transform ${sidebarBg} p-4 rounded-lg shadow-lg pointer-events-auto`}>
        <h3 className={`text-sm font-bold ${textColor} mb-2`}>Components</h3>
    {derivedAllowedComponents && (
          <div className={`text-xs ${textColor} opacity-75 mb-2`}>
      Allowed: {derivedAllowedComponents.map(a => `${a.type}${a.maxCount ? `×${a.maxCount}` : ''}`).join(', ')}
          </div>
        )}
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
              <span className="flex items-center justify-center gap-1">
                <MdCheck size={14} /> Submit & Validate Circuit
              </span>
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
              <span className="flex items-center justify-center gap-1">
                {isDarkMode ? <MdLightMode size={14} /> : <MdDarkMode size={14} />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
          )}
        </div>
      </div>

      {componentControls && componentControls.length > 0 && (
        <div className={`absolute right-4 top-24 ${sidebarBg} p-3 rounded-lg shadow-lg pointer-events-auto w-64`}>
          <div className={`text-sm ${textColor} font-bold mb-2`}>Component Properties</div>
          <div className="space-y-2">
            {componentControls.map(ctrl => (
              <div key={ctrl.id} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{ctrl.label}</span>
                  <span className="opacity-70">{ctrl.value}{ctrl.unit ? ` ${ctrl.unit}` : ''}</span>
                </div>
                <input
                  className={`w-full ${isDark ? 'accent-yellow-400' : 'accent-blue-600'}`}
                  type="range"
                  min={ctrl.min}
                  max={ctrl.max}
                  step={ctrl.step ?? 1}
                  value={ctrl.value}
                  onChange={(e) => onComponentControlChange?.(ctrl.id, parseFloat(e.target.value))}
                />
                <input
                  className={`mt-1 w-full px-2 py-1 rounded border ${isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  type="number"
                  min={ctrl.min}
                  max={ctrl.max}
                  step={ctrl.step ?? 1}
                  value={ctrl.value}
                  onChange={(e) => onComponentControlChange?.(ctrl.id, parseFloat(e.target.value))}
                />
              </div>
            ))}
          </div>
        </div>
      )}


    </div>
  );
};
