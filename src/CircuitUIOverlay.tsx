import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { SchematicResistor, SchematicCapacitor, SchematicInductor } from "./CircuitSchematic2D";

interface CircuitUIOverlayProps {
  difficulty: "easy" | "medium" | "hard";
  theme: string;
  playerCount: number;
}

interface Component {
  id: string;
  type: string;
  label: string;
  symbol: React.ReactNode;
}

interface BoardItem extends Component {
  x: number;
  y: number;
  instanceId: string;
}

// Component to render the appropriate schematic component
const SchematicComponent = ({ type, label, position, onDrag }: {
  type: string;
  label: string;
  position: [number, number, number];
  onDrag?: (position: [number, number, number]) => void;
}) => {
  switch (type) {
    case 'R':
      return <SchematicResistor position={position} onDrag={onDrag} type="resistor" label={label} />;
    case 'C':
      return <SchematicCapacitor position={position} onDrag={onDrag} type="capacitor" label={label} />;
    case 'L':
      return <SchematicInductor position={position} onDrag={onDrag} type="inductor" label={label} />;
    default:
      return <SchematicResistor position={position} onDrag={onDrag} type="resistor" label={label} />;
  }
};

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

const getComponentsByDifficulty = (difficulty: string): Component[] => {
  const baseComponents = [
    { id: "R", type: "R", label: "Resistor", symbol: <ResistorSymbol /> },
    { id: "L", type: "L", label: "Inductor", symbol: <InductorSymbol /> },
    { id: "C", type: "C", label: "Capacitor", symbol: <CapacitorSymbol /> },
  ];

  switch (difficulty) {
    case "easy":
      return baseComponents.slice(0, 2);
    case "medium":
      return baseComponents;
    case "hard":
      return [
        ...baseComponents,
        { id: "D", type: "D", label: "Diode", symbol: (
          <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
            <line x1="2" y1="10" x2="16" y2="10" stroke="#333333" strokeWidth="2" />
            <polygon points="16,6 16,14 24,10" fill="#333333" />
            <line x1="24" y1="6" x2="24" y2="14" stroke="#333333" strokeWidth="2" />
            <line x1="24" y1="10" x2="38" y2="10" stroke="#333333" strokeWidth="2" />
            <circle cx="2" cy="10" r="1.5" fill="#333333" />
            <circle cx="38" cy="10" r="1.5" fill="#333333" />
          </svg>
        ) },
        { id: "T", type: "T", label: "Transistor", symbol: (
          <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
            <line x1="2" y1="10" x2="12" y2="10" stroke="#333333" strokeWidth="2" />
            <line x1="12" y1="6" x2="12" y2="14" stroke="#333333" strokeWidth="3" />
            <line x1="12" y1="8" x2="20" y2="4" stroke="#333333" strokeWidth="2" />
            <line x1="12" y1="12" x2="20" y2="16" stroke="#333333" strokeWidth="2" />
            <line x1="20" y1="4" x2="20" y2="2" stroke="#333333" strokeWidth="2" />
            <line x1="20" y1="16" x2="20" y2="18" stroke="#333333" strokeWidth="2" />
            <polygon points="18,15 20,16 19,17" fill="#333333" />
            <circle cx="2" cy="10" r="1.5" fill="#333333" />
            <circle cx="20" cy="2" r="1.5" fill="#333333" />
            <circle cx="20" cy="18" r="1.5" fill="#333333" />
          </svg>
        ) },
      ];
    default:
      return baseComponents;
  }
};

export const CircuitUIOverlay: React.FC<CircuitUIOverlayProps> = ({
  difficulty,
  theme,
  playerCount,
}) => {
  const [boardItems, setBoardItems] = React.useState<BoardItem[]>([]);
  const [selectedComponent, setSelectedComponent] = React.useState<Component | null>(null);
  const [instanceCounter, setInstanceCounter] = React.useState(1);

  const components = getComponentsByDifficulty(difficulty);

  // Handle ESC key to cancel selection
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedComponent) {
        setSelectedComponent(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponent]);

  const isDark = theme === "dark";
  const sidebarBg = isDark ? "bg-gray-800/90" : "bg-white/90";
  const componentBg = isDark ? "bg-gray-700" : "bg-blue-100";
  const componentHover = isDark ? "hover:bg-gray-600" : "hover:bg-blue-200";
  const textColor = isDark ? "text-white" : "text-gray-800";
  const borderColor = isDark ? "border-gray-600" : "border-gray-400";

  const handleComponentClick = (component: Component) => {
    if (selectedComponent?.id === component.id) {
      setSelectedComponent(null); // Deselect if clicking the same component
    } else {
      setSelectedComponent(component);
    }
  };

  const handleBoardClick = (e: React.MouseEvent) => {
    if (!selectedComponent) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    // Account for the offset of the clickable area
    const x = e.clientX - rect.left + 250; // Add left offset
    const y = e.clientY - rect.top + 20; // Add top offset

    const newItem: BoardItem = {
      ...selectedComponent,
      x,
      y,
      instanceId: `${selectedComponent.type}${instanceCounter}`,
    };

    setBoardItems([...boardItems, newItem]);
    setInstanceCounter(instanceCounter + 1);
    setSelectedComponent(null); // Clear selection after adding
  };

  const removeItem = (instanceId: string) => {
    setBoardItems(boardItems.filter(item => item.instanceId !== instanceId));
  };

  const clearBoard = () => {
    setBoardItems([]);
    setInstanceCounter(1);
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className={`absolute top-4 right-4 ${sidebarBg} p-3 rounded-lg shadow-lg pointer-events-auto`}>
        <div className={`text-sm ${textColor} font-medium`}>
          <div>Difficulty: <span className="capitalize">{difficulty}</span></div>
          <div>Players: {playerCount}</div>
          <div>Components: {boardItems.length}</div>
        </div>
      </div>

      <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${sidebarBg} p-4 rounded-lg shadow-lg pointer-events-auto`}>
        <h3 className={`text-sm font-bold ${textColor} mb-2`}>Components</h3>
        <p className={`text-xs ${textColor} opacity-75 mb-3`}>
          {selectedComponent ? 'Click on the circuit to place' : 'Click to select, then click on circuit'}
        </p>
        <div className="flex flex-col gap-2">
          {components.map((component) => (
            <div
              key={component.id}
              onClick={() => handleComponentClick(component)}
              className={`cursor-pointer p-3 ${componentBg} ${componentHover} rounded-md transition-colors ${textColor} text-center select-none ${
                selectedComponent?.id === component.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="mb-1 flex justify-center">{component.symbol}</div>
              <div className="text-xs">{component.label}</div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 space-y-2">
          {selectedComponent && (
            <button
              onClick={() => setSelectedComponent(null)}
              className={`w-full px-3 py-2 text-xs ${isDark ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'} text-white rounded transition-colors`}
            >
              Cancel Selection
            </button>
          )}
          <button
            onClick={clearBoard}
            className={`w-full px-3 py-2 text-xs ${isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white rounded transition-colors`}
          >
            Clear Board
          </button>
        </div>
      </div>

      <div
        className={`absolute inset-0 border-2 border-dashed ${borderColor} ${selectedComponent ? 'border-blue-500 bg-blue-50/10' : 'border-transparent'} transition-colors pointer-events-none`}
      >
        {/* Clickable area that excludes the sidebars */}
        <div
          className={`absolute inset-0 ${selectedComponent ? 'pointer-events-auto' : 'pointer-events-none'}`}
          style={{
            left: '250px', // Leave space for left sidebar
            right: '200px', // Leave space for right sidebar
            top: '20px',
            bottom: '80px' // Leave space for bottom notification
          }}
          onClick={handleBoardClick}
        />
        {boardItems.map((item) => (
          <div
            key={item.instanceId}
            className="absolute pointer-events-auto"
            style={{
              left: item.x,
              top: item.y,
              transform: "translate(-50%, -50%)",
              width: "120px",
              height: "80px",
            }}
          >
            <Canvas
              orthographic
              camera={{ position: [0, 0, 5], zoom: 50 }}
              style={{ background: 'transparent' }}
            >
              <ambientLight intensity={0.8} />
              <directionalLight position={[10, 10, 5]} intensity={0.5} />
              <SchematicComponent
                type={item.type}
                label={item.instanceId}
                position={[0, 0, 0]}
                onDrag={() => {}} // We'll handle dragging differently for placed components
              />
            </Canvas>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeItem(item.instanceId);
              }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
              title={`Click to remove ${item.instanceId}`}
            >
              ×
            </button>
          </div>
        ))}

        {selectedComponent && (
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${textColor} text-center pointer-events-none`}>
            <div className="text-lg opacity-50">Click to place {selectedComponent.label}</div>
          </div>
        )}
      </div>

      {boardItems.length >= 2 && (
        <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 ${sidebarBg} p-3 rounded-lg shadow-lg pointer-events-auto`}>
          <div className={`text-sm ${textColor}`}>
            🧪 Circuit Analysis: <span className="text-yellow-500">Ready to validate</span>
          </div>
        </div>
      )}
    </div>
  );
};
