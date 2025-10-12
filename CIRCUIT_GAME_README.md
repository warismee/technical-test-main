# 3D Circuit Builder Game 🔌⚡

A React-based 3D circuit building game with drag-and-drop functionality, multiple difficulty levels, and multiplayer support.

## 🎮 Features

### Core Functionality
- **3D Background Scene**: Quantum cube with dynamic animations and bloom effects
- **2D Circuit UI Overlay**: Drag-and-drop interface for building circuits
- **Difficulty Levels**: Easy, Medium, Hard with different component sets
- **Theme Support**: Light/Dark mode with responsive styling
- **Multiplayer Ready**: Player count tracking and UI preparation

### Circuit Components by Difficulty

| Difficulty | Available Components |
|------------|---------------------|
| **Easy**   | Resistor (R), Inductor (L) |
| **Medium** | Resistor (R), Inductor (L), Capacitor (C) |
| **Hard**   | All above + Diode (D), Transistor (T) |

### Interactive Features
- **Drag & Drop**: Drag components from sidebar to circuit board
- **Connection Mode**: Click to connect components with wires
- **Visual Feedback**: Hover effects, drag hints, connection animations
- **Instance Tracking**: Unique IDs for each component (R1, R2, etc.)
- **Board Management**: Clear board, remove individual components

## 🚀 Usage

### Basic Implementation

```tsx
import { Block } from './src/block';

// Simple usage
<Block />

// Advanced usage with all props
<Block
  difficulty="hard"
  theme="dark"
  playerCount={2}
  autoRotate={true}
  playAnimations={true}
  cameraPosition={[15, 15, 15]}
/>
```

### Props Interface

```tsx
interface BlockProps {
  difficulty?: 'easy' | 'medium' | 'hard';  // Default: 'easy'
  theme?: 'light' | 'dark' | string;        // Default: 'light'
  playerCount?: number;                      // Default: 1
  title?: string;
  description?: string;
  modelPath?: string;                        // Custom 3D model path
  autoRotate?: boolean;                      // Default: true
  playAnimations?: boolean;                  // Default: true
  cameraPosition?: [number, number, number]; // Default: [10, 10, 10]
}
```

## 🎯 Game Mechanics

### Component Placement
1. **Drag** components from the left sidebar
2. **Drop** them anywhere on the circuit board
3. Components get unique instance IDs automatically

### Making Connections
1. Click the **"Connect Mode"** button
2. Click on two components to connect them with a wire
3. Visual wires appear between connected components
4. Exit connect mode to return to normal editing

### Circuit Management
- **Remove Components**: Click components when not in connect mode
- **Clear Board**: Use the clear button to reset everything
- **Visual Feedback**: Hover effects and status indicators guide users

## 🔧 Technical Architecture

### File Structure
```
src/
├── block.tsx                      # Main 3D component with overlay
├── CircuitUIOverlay.tsx          # Basic drag-and-drop UI
├── CircuitUIOverlayEnhanced.tsx  # Advanced UI with connections
├── circuitLogic.ts               # Game logic and validation
└── styles.css                    # Global styles
```

### Key Components

#### `Block` (Main Component)
- Manages 3D scene with Three.js/React Three Fiber
- Renders CircuitUIOverlay on top
- Handles theme and difficulty prop distribution

#### `CircuitUIOverlay` 
- Basic drag-and-drop functionality
- Component library sidebar
- Theme-aware styling
- Real-time component counting

#### `CircuitUIOverlayEnhanced`
- All basic features plus:
- Wire connection system with SVG rendering
- Interactive connection mode
- Advanced visual feedback
- Circuit state callbacks

#### `circuitLogic.ts`
- Circuit validation algorithms
- Challenge templates for different difficulties
- Random challenge generation
- Scoring system

## 🎨 Theming

### Built-in Themes
- **Light Theme**: Clean white backgrounds with blue accents
- **Dark Theme**: Dark gray backgrounds with contrasting colors

### Custom Themes
Pass any theme name to customize colors:
```tsx
<Block theme="cyberpunk" />
<Block theme="retro" />
```

## 🏗️ Future Development

### Planned Features
- [ ] **Circuit Validation**: Check if placed circuits match target designs
- [ ] **Challenge Mode**: Pre-designed puzzles to solve
- [ ] **Multiplayer Sync**: Real-time collaboration with Socket.IO
- [ ] **Animation System**: Component placement animations
- [ ] **Sound Effects**: Audio feedback for interactions
- [ ] **Progress Tracking**: Save/load circuit designs
- [ ] **Educational Content**: Component explanations and tutorials

### Extension Points

#### Custom Components
Add new component types by extending the component definitions:

```tsx
const customComponents = [
  { id: "LED", type: "LED", label: "LED", symbol: "💡", color: "#yellow" },
  { id: "SW", type: "SW", label: "Switch", symbol: "🔘", color: "#gray" }
];
```

#### Circuit Templates
Create custom learning challenges:

```tsx
const customTemplate: CircuitTemplate = {
  id: 'custom-1',
  difficulty: 'medium',
  name: 'RC Low-Pass Filter',
  description: 'Build a resistor-capacitor low-pass filter',
  requiredComponents: [
    { type: 'R', count: 1 },
    { type: 'C', count: 1 }
  ],
  // ... validation rules
};
```

## 🔌 Integration Examples

### With State Management
```tsx
const [circuitState, setCircuitState] = useState({
  components: [],
  connections: []
});

<Block
  difficulty="medium"
  theme="dark"
  onCircuitChange={(components, connections) => {
    setCircuitState({ components, connections });
  }}
/>
```

### With Learning Management Systems
```tsx
const handleLevelComplete = (score: number, time: number) => {
  // Send progress to LMS
  reportProgress({
    studentId: currentStudent.id,
    level: currentLevel,
    score,
    completionTime: time
  });
};
```

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to `http://localhost:5173`

4. **Test the Interface**
   - Drag components from sidebar to board
   - Toggle connection mode to wire components
   - Try different difficulty levels and themes

## 📦 Dependencies

- **React 18+**: UI framework
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers for R3F
- **Three.js**: 3D graphics library
- **TypeScript**: Type safety and development experience
- **Vite**: Fast build tool and dev server

---

**Ready to build some circuits!** 🎉⚡🔧

Start with basic drag-and-drop, then level up to connection mode and circuit validation. The modular architecture makes it easy to add new features as your game evolves.
