// Example: Circuit validation logic for future implementation
// Place this in a new file: src/circuitLogic.ts

export interface CircuitNode {
  id: string;
  type: 'component' | 'junction' | 'terminal';
  connections: string[];
  position: { x: number; y: number };
  // Optional: lock a node's rendered rotation (radians). Overrides auto-rotation.
  fixedRotation?: number;
}

export interface CircuitTemplate {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  name: string;
  description: string;
  // Optional routing preference for wire rendering
  routing?: 'straight' | 'L';
  // Optional: disable auto-rotation of components (keep symbols unrotated)
  disableAutoRotation?: boolean;
  requiredComponents: { type: string; count: number }[];
  targetTopology: CircuitNode[];
  validationRules: {
    componentCount?: Record<string, number>;
    requiredPlacements?: Array<{ nodeId: string; expectedType: string; position: { x: number; y: number } }>;
  };
}



export interface ComponentPlacement {
  instanceId: string;
  type: string;
  x: number;
  y: number;
}

// Example circuit templates
export const circuitTemplates: CircuitTemplate[] = [
  // EASY CIRCUITS (10 total)
  {
    id: 'easy-1',
    difficulty: 'easy',
    name: 'Simple Series Circuit',
    description: 'Connect a resistor and inductor in series',
    requiredComponents: [
      { type: 'R', count: 1 },
      { type: 'L', count: 1 }
    ],
    targetTopology: [
      { id: 'A', type: 'terminal', connections: ['R1'], position: { x: 100, y: 200 } },
      { id: 'R1', type: 'component', connections: ['A', 'L1'], position: { x: 200, y: 200 } },
      { id: 'L1', type: 'component', connections: ['R1', 'B'], position: { x: 300, y: 200 } },
      { id: 'B', type: 'terminal', connections: ['L1'], position: { x: 400, y: 200 } }
    ],
    validationRules: {
      componentCount: {R:1,L:1}
    }
  },
  {
    id: 'easy-2',
    difficulty: 'easy',
    name: 'Basic RC Circuit',
    description: 'Connect a resistor and capacitor in series',
    requiredComponents: [
      { type: 'R', count: 1 },
      { type: 'C', count: 1 }
    ],
    targetTopology: [
      { id: 'A', type: 'terminal', connections: ['R1'], position: { x: 100, y: 200 } },
      { id: 'R1', type: 'component', connections: ['A', 'C1'], position: { x: 200, y: 200 } },
      { id: 'C1', type: 'component', connections: ['R1', 'B'], position: { x: 300, y: 200 } },
      { id: 'B', type: 'terminal', connections: ['C1'], position: { x: 400, y: 200 } }
    ],
    validationRules: {
      requiredPlacements: [
        { nodeId: 'R1', expectedType: 'R', position: { x: 200, y: 200 } },
        { nodeId: 'C1', expectedType: 'C', position: { x: 300, y: 200 } }
      ]
    }
  },
  {
    id: 'easy-3',
    difficulty: 'easy',
    name: 'Two Resistor Series',
    description: 'Connect two resistors in series',
    requiredComponents: [
      { type: 'R', count: 2 }
    ],
    targetTopology: [
      { id: 'A', type: 'terminal', connections: ['R1'], position: { x: 100, y: 200 } },
      { id: 'R1', type: 'component', connections: ['A', 'R2'], position: { x: 200, y: 200 } },
      { id: 'R2', type: 'component', connections: ['R1', 'B'], position: { x: 300, y: 200 } },
      { id: 'B', type: 'terminal', connections: ['R2'], position: { x: 400, y: 200 } }
    ],
    validationRules: {
      componentCount: {R:2}
    }
  },
  {
    id: 'easy-4',
    difficulty: 'easy',
    name: 'Parallel Capacitors',
    description: 'Connect two capacitors in parallel',
    requiredComponents: [
      { type: 'C', count: 2 }
    ],
    targetTopology: [
      { id: 'A', type: 'terminal', connections: ['C1', 'C2'], position: { x: 100, y: 200 } },
      { id: 'C1', type: 'component', connections: ['A', 'B'], position: { x: 200, y: 150 } },
      { id: 'C2', type: 'component', connections: ['A', 'B'], position: { x: 200, y: 250 } },
      { id: 'B', type: 'terminal', connections: ['C1', 'C2'], position: { x: 300, y: 200 } }
    ],
    validationRules: {
      componentCount: {C:2}
    }
  },
  {
    id: 'easy-5',
    difficulty: 'easy',
    name: 'RC with Switch',
    description: 'Series RC circuit with a switch',
    requiredComponents: [
      { type: 'R', count: 1 },
      { type: 'C', count: 1 },
      { type: 'S', count: 1 }
    ],
    targetTopology: [
      { id: 'A', type: 'terminal', connections: ['S1'], position: { x: 50, y: 200 } },
      { id: 'S1', type: 'component', connections: ['A', 'R1'], position: { x: 150, y: 200 } },
      { id: 'R1', type: 'component', connections: ['S1', 'C1'], position: { x: 250, y: 200 } },
      { id: 'C1', type: 'component', connections: ['R1', 'B'], position: { x: 350, y: 200 } },
      { id: 'B', type: 'terminal', connections: ['C1'], position: { x: 450, y: 200 } }
    ],
    validationRules: {
      requiredPlacements: [
        { nodeId: 'S1', expectedType: 'S', position: { x: 150, y: 200 } },
        { nodeId: 'R1', expectedType: 'R', position: { x: 250, y: 200 } },
        { nodeId: 'C1', expectedType: 'C', position: { x: 350, y: 200 } }
      ]
    }
  },
  {
    id: 'easy-6',
    difficulty: 'easy',
    name: 'Basic RL Series',
    description: 'Connect a resistor and inductor in series',
    requiredComponents: [
      { type: 'R', count: 1 },
      { type: 'L', count: 1 }
    ],
    targetTopology: [
      { id: 'A', type: 'terminal', connections: ['R1'], position: { x: 100, y: 200 } },
      { id: 'R1', type: 'component', connections: ['A', 'L1'], position: { x: 200, y: 200 } },
      { id: 'L1', type: 'component', connections: ['R1', 'B'], position: { x: 300, y: 200 } },
      { id: 'B', type: 'terminal', connections: ['L1'], position: { x: 400, y: 200 } }
    ],
    validationRules: {
      componentCount: {R:1,L:1}
    }
  },
  {
    id: 'easy-7',
    difficulty: 'easy',
    name: 'Voltage Divider',
    description: 'Create a voltage divider with two resistors',
    requiredComponents: [
      { type: 'R', count: 2 }
    ],
    targetTopology: [
      { id: 'A', type: 'terminal', connections: ['R1'], position: { x: 100, y: 200 } },
      { id: 'R1', type: 'component', connections: ['A', 'J1'], position: { x: 200, y: 200 } },
      { id: 'J1', type: 'junction', connections: ['R1', 'R2', 'OUT'], position: { x: 300, y: 200 } },
      { id: 'R2', type: 'component', connections: ['J1', 'B'], position: { x: 300, y: 300 } },
      { id: 'OUT', type: 'terminal', connections: ['J1'], position: { x: 400, y: 200 } },
      { id: 'B', type: 'terminal', connections: ['R2'], position: { x: 300, y: 400 } }
    ],
    validationRules: {
      componentCount: {R:2}
    }
  },
  {
    id: 'easy-8',
    difficulty: 'easy',
    name: 'LED Circuit',
    description: 'Simple LED circuit with current limiting resistor',
    requiredComponents: [
      { type: 'R', count: 1 },
      { type: 'LED', count: 1 }
    ],
    targetTopology: [
      { id: 'A', type: 'terminal', connections: ['R1'], position: { x: 100, y: 200 } },
      { id: 'R1', type: 'component', connections: ['A', 'LED1'], position: { x: 200, y: 200 } },
      { id: 'LED1', type: 'component', connections: ['R1', 'B'], position: { x: 300, y: 200 } },
      { id: 'B', type: 'terminal', connections: ['LED1'], position: { x: 400, y: 200 } }
    ],
    validationRules: {
      componentCount: {R:1,LED:1}
    }
  },
  {
    id: 'easy-9',
    difficulty: 'easy',
    name: 'Three Resistor Parallel',
    description: 'Connect three resistors in parallel',
    requiredComponents: [
      { type: 'R', count: 3 }
    ],
    targetTopology: [
      { id: 'A', type: 'terminal', connections: ['R1', 'R2', 'R3'], position: { x: 100, y: 200 } },
      { id: 'R1', type: 'component', connections: ['A', 'B'], position: { x: 200, y: 150 } },
      { id: 'R2', type: 'component', connections: ['A', 'B'], position: { x: 200, y: 200 } },
      { id: 'R3', type: 'component', connections: ['A', 'B'], position: { x: 200, y: 250 } },
      { id: 'B', type: 'terminal', connections: ['R1', 'R2', 'R3'], position: { x: 300, y: 200 } }
    ],
    validationRules: {
      componentCount: {R:3}
    }
  },
  {
    id: 'easy-10',
    difficulty: 'easy',
    name: 'Capacitor Charging Circuit',
    description: 'Simple capacitor charging circuit with resistor',
    requiredComponents: [
      { type: 'R', count: 1 },
      { type: 'C', count: 1 }
    ],
    targetTopology: [
      { id: 'A', type: 'terminal', connections: ['R1'], position: { x: 100, y: 200 } },
      { id: 'R1', type: 'component', connections: ['A', 'C1'], position: { x: 200, y: 200 } },
      { id: 'C1', type: 'component', connections: ['R1', 'B'], position: { x: 300, y: 200 } },
      { id: 'B', type: 'terminal', connections: ['C1'], position: { x: 400, y: 200 } }
    ],
    validationRules: {
        requiredPlacements: [
        { nodeId: 'R1', expectedType: 'R', position: { x: 200, y: 200 } },
        { nodeId: 'C1', expectedType: 'C', position: { x: 300, y: 200 } }
      ]
    }
  },
  // MEDIUM CIRCUITS (10 total)
  {
    id: 'medium-1',
    difficulty: 'medium',
    name: 'RC Parallel Circuit',
    description: 'Connect resistor and capacitor in parallel',
    requiredComponents: [
      { type: 'R', count: 1 },
      { type: 'C', count: 1 }
    ],
    targetTopology: [
      { id: 'A', type: 'terminal', connections: ['R1', 'C1'], position: { x: 100, y: 200 } },
      { id: 'R1', type: 'component', connections: ['A', 'B'], position: { x: 200, y: 150 } },
      { id: 'C1', type: 'component', connections: ['A', 'B'], position: { x: 200, y: 250 } },
      { id: 'B', type: 'terminal', connections: ['R1', 'C1'], position: { x: 300, y: 200 } }
    ],
    validationRules: {
      componentCount: {R:1,C:1}
    }
  },
  {
    id: 'medium-2',
    difficulty: 'medium',
    name: 'RLC Series Circuit',
    description: 'Connect resistor, inductor, and capacitor in series',
    requiredComponents: [
      { type: 'R', count: 1 },
      { type: 'L', count: 1 },
      { type: 'C', count: 1 }
    ],
    targetTopology: [
      { id: 'A', type: 'terminal', connections: ['R1'], position: { x: 50, y: 200 } },
      { id: 'R1', type: 'component', connections: ['A', 'L1'], position: { x: 150, y: 200 } },
      { id: 'L1', type: 'component', connections: ['R1', 'C1'], position: { x: 250, y: 200 } },
      { id: 'C1', type: 'component', connections: ['L1', 'B'], position: { x: 350, y: 200 } },
      { id: 'B', type: 'terminal', connections: ['C1'], position: { x: 450, y: 200 } }
    ],
    validationRules: {
      componentCount: {R:1,L:1,C:1}
    }
  },
  {
    id: 'medium-3',
    difficulty: 'medium',
    name: 'RLC Parallel Circuit',
    description: 'Connect resistor, inductor, and capacitor in parallel',
    requiredComponents: [
      { type: 'R', count: 1 },
      { type: 'L', count: 1 },
      { type: 'C', count: 1 }
    ],
    targetTopology: [
      { id: 'A', type: 'terminal', connections: ['R1', 'L1', 'C1'], position: { x: 100, y: 200 } },
      { id: 'R1', type: 'component', connections: ['A', 'B'], position: { x: 200, y: 150 } },
      { id: 'L1', type: 'component', connections: ['A', 'B'], position: { x: 200, y: 200 } },
      { id: 'C1', type: 'component', connections: ['A', 'B'], position: { x: 200, y: 250 } },
      { id: 'B', type: 'terminal', connections: ['R1', 'L1', 'C1'], position: { x: 300, y: 200 } }
    ],
    validationRules: {
      componentCount: {R:1,L:1,C:1}
    }
  },
  {
    id: 'medium-4',
    difficulty: 'medium',
    name: 'RC with Switch and Load',
    description: 'RC series circuit with switch and load resistor',
    requiredComponents: [
      { type: 'R', count: 2 },
      { type: 'C', count: 1 },
      { type: 'S', count: 1 }
    ],
    targetTopology: [
      { id: 'A', type: 'terminal', connections: ['S1'], position: { x: 30, y: 200 } },
      { id: 'S1', type: 'component', connections: ['A', 'R1'], position: { x: 100, y: 200 } },
      { id: 'R1', type: 'component', connections: ['S1', 'C1', 'R2'], position: { x: 200, y: 200 } },
      { id: 'C1', type: 'component', connections: ['R1', 'GND'], position: { x: 320, y: 150 } },
      { id: 'R2', type: 'component', connections: ['R1', 'GND'], position: { x: 320, y: 250 } },
      { id: 'GND', type: 'terminal', connections: ['C1', 'R2'], position: { x: 400, y: 200 } }
    ],
    validationRules: {
      componentCount: { S: 1, R: 2, C: 1 },
      requiredPlacements: [
        { nodeId: 'S1', expectedType: 'S', position: { x: 100, y: 200 } },
        { nodeId: 'R1', expectedType: 'R', position: { x: 200, y: 200 } }
      ]
    }
  },
  {
    id: 'medium-6',
    difficulty: 'medium',
    name: 'Wheatstone Bridge',
    description: 'Basic Wheatstone bridge circuit',
    requiredComponents: [
      { type: 'R', count: 4 }
    ],
    targetTopology: [
  // Diamond layout: left (A), right (B), top (C), bottom (D)
  // Corners as junctions to allow VIN/VOUT terminals
  { id: 'A', type: 'junction', connections: ['R1', 'R2', 'VOUT-'], position: { x: 150, y: 200 } },
  { id: 'B', type: 'junction', connections: ['R3', 'R4', 'VOUT+'], position: { x: 350, y: 200 } },
  { id: 'C', type: 'junction', connections: ['R1', 'R3', 'VIN+'], position: { x: 250, y: 100 } },
  { id: 'D', type: 'junction', connections: ['R2', 'R4', 'VIN-'], position: { x: 250, y: 300 } },
  // Edge resistors positioned at midpoints of diamond edges (45° orientation)
  { id: 'R1', type: 'component', connections: ['A', 'C'], position: { x: 200, y: 150 } },
  { id: 'R2', type: 'component', connections: ['A', 'D'], position: { x: 200, y: 250 } },
  { id: 'R3', type: 'component', connections: ['C', 'B'], position: { x: 300, y: 150 } },
  { id: 'R4', type: 'component', connections: ['D', 'B'], position: { x: 300, y: 250 } },
  // Terminals for VIN at top/bottom and VOUT inside diamond near center line
  { id: 'VIN+', type: 'terminal', connections: ['C'], position: { x: 250, y: 60 } },
  { id: 'VIN-', type: 'terminal', connections: ['D'], position: { x: 250, y: 340 } },
  { id: 'VOUT-', type: 'terminal', connections: ['A'], position: { x: 220, y: 200 } },
  { id: 'VOUT+', type: 'terminal', connections: ['B'], position: { x: 280, y: 200 } }
    ],
    validationRules: {
      componentCount: {R:4}
    }
  },
  {
    id: 'medium-7',
    difficulty: 'medium',
    name: 'Mixed Series-Parallel',
    description: 'Mixed series-parallel circuit with 3 components',
    requiredComponents: [
      { type: 'R', count: 2 },
      { type: 'L', count: 1 }
    ],
    targetTopology: [
      { id: 'A', type: 'terminal', connections: ['R1'], position: { x: 100, y: 200 } },
      { id: 'R1', type: 'component', connections: ['A', 'R2', 'L1'], position: { x: 200, y: 200 } },
      { id: 'R2', type: 'component', connections: ['R1', 'B'], position: { x: 400, y: 150 } },
      { id: 'L1', type: 'component', connections: ['R1', 'B'], position: { x: 400, y: 250 } },
      { id: 'B', type: 'terminal', connections: ['R2', 'L1'], position: { x: 500, y: 200 } }
    ],
    validationRules: {
      componentCount: {R:2, L:1}
    }
  },
  {
    id: 'medium-8',
    difficulty: 'medium',
    name: 'Transistor Switch',
    description: 'Simple transistor switch circuit',
  routing: 'straight',
    requiredComponents: [
    { type: 'R', count: 1 },
      { type: 'Q', count: 1 },
      { type: 'LED', count: 1 }
    ],
    targetTopology: [
  // Top chain: VCC -> LED1 -> Q1_C (collector junction) above the transistor
  { id: 'VCC', type: 'terminal', connections: ['LED1'], position: { x: 332, y: 100 } },
  { id: 'LED1', type: 'component', connections: ['VCC', 'Q1_C'], position: { x: 332, y: 160 } },
  { id: 'Q1_C', type: 'junction', connections: ['LED1', 'Q1'], position: { x: 332, y: 220 } },
  // Transistor centered; base fed from left via R1; emitter goes to GND
  { id: 'Q1', type: 'component', connections: ['Q1_C', 'GND', 'R1'], position: { x: 320, y: 300 } },
  // Left chain: IN -> R1 -> Q1 (base)
  { id: 'IN', type: 'terminal', connections: ['R1'], position: { x: 100, y: 300 } },
  { id: 'R1', type: 'component', connections: ['IN', 'Q1'], position: { x: 200, y: 300 } },
  // Ground below transistor (emitter)
  { id: 'GND', type: 'terminal', connections: ['Q1'], position: { x: 332, y: 450 } }
    ],
    validationRules: {
    componentCount: {R:1,Q:1,LED:1},
    requiredPlacements: [
      { nodeId: 'R1', expectedType: 'R', position: { x: 200, y: 300 } },
      { nodeId: 'Q1', expectedType: 'Q', position: { x: 320, y: 300 } },
      { nodeId: 'LED1', expectedType: 'LED', position: { x: 332, y: 160 } }
    ]
    }
  },
  {
    id: 'medium-10',
    difficulty: 'medium',
    name: 'RC Low-Pass Filter',
    description: 'Simple low-pass filter using RC components',
    requiredComponents: [
      { type: 'R', count: 1 },
      { type: 'C', count: 1 }
    ],
    targetTopology: [
      { id: 'IN', type: 'terminal', connections: ['R1'], position: { x: 100, y: 200 } },
      { id: 'R1', type: 'component', connections: ['IN', 'J1'], position: { x: 200, y: 200 } },
      { id: 'J1', type: 'junction', connections: ['R1', 'C1', 'OUT'], position: { x: 300, y: 200 } },
      { id: 'C1', type: 'component', connections: ['J1', 'GND'], position: { x: 300, y: 300 } },
      { id: 'OUT', type: 'terminal', connections: ['J1'], position: { x: 400, y: 200 } },
      { id: 'GND', type: 'terminal', connections: ['C1'], position: { x: 300, y: 400 } }
    ],
    validationRules: {
          componentCount: {R:1,C:1},
          requiredPlacements: [
            { nodeId: 'R1', expectedType: 'R', position: { x: 200, y: 200 } },
            { nodeId: 'C1', expectedType: 'C', position: { x: 300, y: 300 } }
          ]
    }
  },
//Hard
  {
    id: 'hard-8',
    difficulty: 'hard',
    name: 'Oscillator Circuit',
    description: 'RC oscillator circuit with feedback',
    requiredComponents: [
      { type: 'R', count: 3 },
  { type: 'C', count: 3 },
      { type: 'OP', count: 1 }
    ],
  targetTopology: [
    // Power terminals
//   { id: 'VCC', type: 'terminal', connections: ['J_VP'], position: { x: 480, y: 50 } },
  { id: 'GND', type: 'terminal', connections: ['J_VM', 'R3','R1','R2'], position: { x: 440, y: 330 } },

  // Amplifier (Op-Amp)
  { id: 'OP1', type: 'component', connections: [], position: { x: 480, y: 200 }, fixedRotation: 0 },

  // Output node (front)
  { id: 'J_OUT', type: 'junction', connections: ['OP1', 'OUT'], position: { x: 540, y: 200 } },
  { id: 'OUT', type: 'terminal', connections: ['J_OUT'], position: { x: 600, y: 200 } },

  // Back power pins (vertical)
  { id: 'J_VP', type: 'junction', connections: ['J1'], position: { x: 440, y: 192 } },
  { id: 'J_VM', type: 'junction', connections: ['GND'], position: { x: 440, y: 208 } },

    // Feedback path
    { id: 'IN-', type: 'junction', connections: ['C3','J_OUT'], position: { x: 50, y: 50 } },

    // 3-stage RC phase-lead network (left side)
  { id: 'C1', type: 'component', connections: ['J1','J2'], position: { x: 330, y: 192 }, fixedRotation: 0 },
    { id: 'R1', type: 'component', connections: ['J1','GND'], position: { x: 380, y: 280 }, fixedRotation: 1.5708 },

    { id: 'C2', type: 'component', connections: ['J2','J3'], position: { x: 200, y: 192 }, fixedRotation: 0 },
    { id: 'R2', type: 'component', connections: ['J3','GND'], position: { x: 250, y: 280 }, fixedRotation: 1.5708 },

    { id: 'C3', type: 'component', connections: ['J3','IN-',], position: { x: 90, y: 192 }, fixedRotation: 0 },
    { id: 'R3', type: 'component', connections: ['GND'], position: { x: 150, y: 280 }, fixedRotation: 1.5708 },

    // Junctions connecting RC stages
    { id: 'J1', type: 'junction', connections: ['C1', 'R1','J_VP'], position: { x: 380, y: 192 } },
    { id: 'J2', type: 'junction', connections: ['C1', 'C2', 'R2'], position: { x: 250, y: 192 } },
    { id: 'J3', type: 'junction', connections: ['C3', 'R3'], position: { x: 150, y: 192 } }
  ],
    validationRules: {
  componentCount: { R: 3, C: 3, OP: 1 },
  requiredPlacements: [
    { nodeId: 'OP1', expectedType: 'OP', position: { x: 480, y: 200 } },
    { nodeId: 'R1', expectedType: 'R', position: { x: 380, y: 280 } },
    { nodeId: 'R2', expectedType: 'R', position: { x: 250, y: 280 } },
    { nodeId: 'R3', expectedType: 'R', position: { x: 150, y: 280 } },
    { nodeId: 'C1', expectedType: 'C', position: { x: 330, y: 192 } },
    { nodeId: 'C2', expectedType: 'C', position: { x: 200, y: 192 } },
    { nodeId: 'C3', expectedType: 'C', position: { x: 90, y: 192 } }
  ]
    }
  },
  {
    id: 'hard-10',
    difficulty: 'hard',
    name: 'Logic Gate Circuit',
    description: 'DTL (Diode-Transistor Logic) circuit',
  disableAutoRotation: true,
    requiredComponents: [
      { type: 'D', count: 3 },
      { type: 'R', count: 2 },
      { type: 'Q', count: 1 }
    ],
    targetTopology: [
      // Inputs via diodes into base node (wired-AND)
    { id: 'A', type: 'terminal', connections: ['D1'], position: { x: 100, y: 300 } },
    { id: 'B', type: 'terminal', connections: ['D2'], position: { x: 100, y: 340 } },
    { id: 'C', type: 'terminal', connections: ['D3'], position: { x: 100, y: 380 } },
    { id: 'D1', type: 'component', connections: ['A', 'J_IN'], position: { x: 200, y: 300 } },
    { id: 'D2', type: 'component', connections: ['B', 'J_IN'], position: { x: 200, y: 340 } },
  { id: 'D3', type: 'component', connections: ['C', 'J_IN'], position: { x: 200, y: 380 } },
  { id: 'J_IN', type: 'junction', connections: ['D1', 'D2', 'D3', 'R1', 'Q1'], position: { x: 300, y: 300 } },

      // Bias and collector resistors from VCC
      { id: 'VCC', type: 'terminal', connections: ['R1', 'R2'], position: { x: 350, y: 60 } },
  { id: 'R1', type: 'component', connections: ['VCC', 'J_IN'], position: { x: 300, y: 140 }, fixedRotation: 1.5707963267948966 },
  { id: 'R2', type: 'component', connections: ['VCC', 'J_COL'], position: { x: 400, y: 140 }, fixedRotation: 1.5707963267948966 },

      // Transistor and output
  { id: 'Q1', type: 'component', connections: ['J_COL', 'GND', 'J_IN'], position: { x: 350, y: 300 } },
      { id: 'J_COL', type: 'junction', connections: ['R2', 'Q1', 'OUT'], position: { x: 400, y: 220 } },
      { id: 'OUT', type: 'terminal', connections: ['J_COL'], position: { x: 480, y: 220 } },
      { id: 'GND', type: 'terminal', connections: ['Q1'], position: { x: 360, y: 400 } }
    ],
    validationRules: {
      componentCount: { D: 3, Q: 1, R: 2 },
      requiredPlacements: [
        // Diodes feeding base junction
        { nodeId: 'D1', expectedType: 'D', position: { x: 200, y: 300 } },
        { nodeId: 'D2', expectedType: 'D', position: { x: 200, y: 340 } },
        { nodeId: 'D3', expectedType: 'D', position: { x: 200, y: 380 } },
        // Bias and collector resistors from VCC
        { nodeId: 'R1', expectedType: 'R', position: { x: 300, y: 140 } },
        { nodeId: 'R2', expectedType: 'R', position: { x: 400, y: 140 } },
        // Transistor location
        { nodeId: 'Q1', expectedType: 'Q', position: { x: 350, y: 300 } }
      ]
    }
  }
];







// Enhanced validation function
export function validateCircuit(
  placedComponents: ComponentPlacement[],
  connections: Array<{ from: string; to: string }>,
  template: CircuitTemplate
): { isValid: boolean; errors: string[]; score: number } {
  const errors: string[] = [];
  let score = 0;

  // Determine which validation paths are present
  const hasRequiredPlacements = !!(template.validationRules.requiredPlacements && template.validationRules.requiredPlacements.length > 0);
  const hasComponentCount = !!template.validationRules.componentCount && Object.keys(template.validationRules.componentCount!).length > 0;

  // Scoring weights: if both exist, split 50/50. If only one exists, give it 100.
  const activePaths = (hasRequiredPlacements ? 1 : 0) + (hasComponentCount ? 1 : 0);
  const placementMaxScore = hasRequiredPlacements ? (activePaths === 2 ? 50 : 100) : 0;
  const countMaxScore = hasComponentCount ? (activePaths === 2 ? 50 : 100) : 0;

  // 1) Validate specific placements (with tolerance)
  if (hasRequiredPlacements) {
    const placements = template.validationRules.requiredPlacements!;
    const perItem = placements.length > 0 ? placementMaxScore / placements.length : 0;
    placements.forEach(requirement => {
      const placedComponent = placedComponents.find(comp => comp.instanceId === requirement.nodeId);
      if (!placedComponent) {
        errors.push(`Missing ${requirement.expectedType} at ${requirement.nodeId}`);
        return;
      }
      if (placedComponent.type !== requirement.expectedType) {
        errors.push(`Wrong type at ${requirement.nodeId}: expected ${requirement.expectedType}, found ${placedComponent.type}`);
        return;
      }
      // Check position within tolerance
      const tolerance = 10;
      const xMatch = Math.abs(placedComponent.x - requirement.position.x) <= tolerance;
      const yMatch = Math.abs(placedComponent.y - requirement.position.y) <= tolerance;
      if (xMatch && yMatch) {
        score += perItem;
      } else {
        errors.push(`Incorrect position for ${requirement.nodeId}`);
      }
    });
  }

  // 2) Validate component counts (flexible positions)
  if (hasComponentCount) {
    const countsRules = template.validationRules.componentCount!;
    const keys = Object.keys(countsRules);
    const perType = keys.length > 0 ? countMaxScore / keys.length : 0;
    const componentCounts = placedComponents.reduce((acc, comp) => {
      acc[comp.type] = (acc[comp.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    keys.forEach(componentType => {
      const requiredCount = countsRules[componentType];
      const actual = componentCounts[componentType] || 0;
      if (actual < requiredCount) {
        errors.push(`Missing ${requiredCount - actual} ${componentType} component(s)`);
      } else if (actual === requiredCount) {
        score += perType;
      } else if (actual > requiredCount) {
        errors.push(`Too many ${componentType} components: expected ${requiredCount}, found ${actual}`);
      }
    });
  }

  // 3) Fallback to requiredComponents if neither specific rules exist
  if (!hasRequiredPlacements && !hasComponentCount) {
    const componentCounts = placedComponents.reduce((acc, comp) => {
      acc[comp.type] = (acc[comp.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    template.requiredComponents.forEach(req => {
      const actual = componentCounts[req.type] || 0;
      if (actual < req.count) {
        errors.push(`Missing ${req.count - actual} ${req.type} component(s)`);
      } else if (actual === req.count) {
        score += 100 / template.requiredComponents.length;
      } else if (actual > req.count) {
        errors.push(`Too many ${req.type} components: expected ${req.count}, found ${actual}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.min(100, Math.round(score))
  };
}

// Helper function to validate connections
function validateConnections(
  placedComponents: ComponentPlacement[],
  connections: Array<{ from: string; to: string }>,
  template: CircuitTemplate
): { errors: string[]; score: number } {
  const errors: string[] = [];
  let score = 0;

  // Create a map of component instance IDs for quick lookup
  const componentMap = new Map(placedComponents.map(comp => [comp.instanceId, comp]));

  // Validate that all connections are between valid components
  connections.forEach(conn => {
    if (!componentMap.has(conn.from) && !isTerminal(conn.from)) {
      errors.push(`Invalid connection source: ${conn.from}`);
    }
    if (!componentMap.has(conn.to) && !isTerminal(conn.to)) {
      errors.push(`Invalid connection target: ${conn.to}`);
    }
  });

  // Check for proper connections based on component types
  placedComponents.forEach(comp => {
    const componentConnections = connections.filter(
      conn => conn.from === comp.instanceId || conn.to === comp.instanceId
    );

    // Validate transistor connections (should have base, collector, emitter)
    if (comp.type === 'Q') {
      const requiredConnections = ['B', 'C', 'E']; // Base, Collector, Emitter
      if (componentConnections.length < 2) {
        errors.push(`Transistor ${comp.instanceId} needs at least 2 connections`);
      } else {
        score += 10; // Points for proper transistor connection
      }
    }
    
    // Validate diode connections (should have 2 connections - anode and cathode)
    if (comp.type === 'D') {
      if (componentConnections.length !== 2) {
        errors.push(`Diode ${comp.instanceId} must have exactly 2 connections`);
      } else {
        score += 5; // Points for proper diode connection
      }
    }

    // Validate LED connections and orientation
    if (comp.type === 'LED') {
      if (componentConnections.length !== 2) {
        errors.push(`LED ${comp.instanceId} must have exactly 2 connections`);
      } else {
        score += 5; // Points for proper LED connection
      }
    }
  });

  return { errors, score };
}

// Helper function to validate circuit rules
function validateCircuitRules(
  placedComponents: ComponentPlacement[],
  connections: Array<{ from: string; to: string }>,
  template: CircuitTemplate
): { errors: string[]; score: number } {
  const errors: string[] = [];
  let score = 0;

  // Validate component count only
  const componentCount = template.validationRules.componentCount;
  const actualCount: { [key: string]: number } = {};
  
  // Count components that are placed
  placedComponents.forEach(component => {
    const componentType = component.type;
    actualCount[componentType] = (actualCount[componentType] || 0) + 1;
  });

  // Check if actual count matches required count
  if (componentCount) {
    for (const [componentType, requiredCount] of Object.entries(componentCount)) {
      const actual = actualCount[componentType] || 0;
      if (actual === requiredCount) {
        score += 20; // Points for correct component count
      } else {
        errors.push(`Expected ${requiredCount} ${componentType} components, found ${actual}`);
      }
    }
  }

  return { errors, score };
}

// Helper functions for path validation
function isTerminal(nodeId: string): boolean {
  return ['A', 'B', 'C', 'VCC', 'GND', 'IN', 'OUT', 'VIN', 'AC1', 'AC2', 'PLUS', 'MINUS'].includes(nodeId);
}

function validateSeriesPath(connections: Array<{ from: string; to: string }>, path: string[]): boolean {
  // Implementation for series path validation
  for (let i = 0; i < path.length - 1; i++) {
    const hasConnection = connections.some(conn => 
      (conn.from === path[i] && conn.to === path[i + 1]) ||
      (conn.from === path[i + 1] && conn.to === path[i])
    );
    if (!hasConnection) return false;
  }
  return true;
}

function validateParallelGroup(connections: Array<{ from: string; to: string }>, group: string[]): boolean {
  // Implementation for parallel group validation
  // This is a simplified check - in reality, you'd need to analyze the circuit topology
  return group.length > 1; // Placeholder implementation
}

function validatePath(connections: Array<{ from: string; to: string }>, path: string[]): boolean {
  // Implementation for general path validation
  return validateSeriesPath(connections, path);
}

// Generate unique challenge avoiding already shown ones
export function generateUniqueChallenge(
  difficulty: 'easy' | 'medium' | 'hard', 
  excludeIds: string[] = []
): CircuitTemplate | null {
  const templatesForDifficulty = circuitTemplates.filter(
    t => t.difficulty === difficulty && !excludeIds.includes(t.id)
  );
  
  // If all questions have been shown, return null to indicate game completion
  if (templatesForDifficulty.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * templatesForDifficulty.length);
  return templatesForDifficulty[randomIndex];
}

// Get total number of questions for a difficulty level
export function getTotalQuestionsForDifficulty(difficulty: 'easy' | 'medium' | 'hard'): number {
  return circuitTemplates.filter(t => t.difficulty === difficulty).length;
}



// Utility function to get component pin configuration
export function getComponentPins(componentType: string): string[] {
  switch (componentType) {
    case 'Q': // Transistor
      return ['B', 'C', 'E']; // Base, Collector, Emitter
    case 'D': // Diode
      return ['A', 'K']; // Anode, Cathode
    case 'LED': // LED
      return ['A', 'K']; // Anode, Cathode
    case 'IC': // Integrated Circuit
      return ['VCC', 'GND', 'IN', 'OUT']; // Basic IC pins
    case 'OP': // Op-Amp
      return ['V+', 'V-', 'IN+', 'IN-', 'OUT']; // Op-amp pins
    case 'R': // Resistor
    case 'C': // Capacitor
    case 'L': // Inductor
    case 'S': // Switch
      return ['1', '2']; // Two-terminal components
    default:
      return ['1', '2'];
  }
}

// Utility function to validate component polarity (for polarized components)
export function validateComponentPolarity(
  component: ComponentPlacement,
  connections: Array<{ from: string; to: string }>,
  voltageMap: Map<string, number>
): { isCorrect: boolean; warning?: string } {
  
  if (!['LED', 'D', 'C'].includes(component.type)) {
    return { isCorrect: true };
  }

  const componentConnections = connections.filter(
    conn => conn.from === component.instanceId || conn.to === component.instanceId
  );

  if (componentConnections.length < 2) {
    return { isCorrect: false, warning: `${component.type} needs proper connections` };
  }

  // For LEDs and Diodes, check that anode is at higher potential than cathode
  if (component.type === 'LED' || component.type === 'D') {
    // This would require voltage analysis - placeholder for now
    return { 
      isCorrect: true, 
      warning: `Check ${component.type} polarity - anode should be positive relative to cathode` 
    };
  }

  // For electrolytic capacitors, check polarity
  if (component.type === 'C') {
    return { 
      isCorrect: true, 
      warning: `Check capacitor polarity if electrolytic` 
    };
  }

  return { isCorrect: true };
}

// Function to provide hints for component placement
export function getPlacementHints(template: CircuitTemplate): string[] {
  const hints: string[] = [];

  // Add component placement hints
  template.requiredComponents.forEach(req => {
    if (req.count === 1) {
      hints.push(`Place 1 ${req.type} component`);
    } else {
      hints.push(`Place ${req.count} ${req.type} components`);
    }
  });

  // Add general instruction
  hints.push(`Select components from the right panel and click on the circuit nodes to place them`);

  return hints;
}
