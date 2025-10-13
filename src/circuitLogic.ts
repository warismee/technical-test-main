// Example: Circuit validation logic for future implementation
// Place this in a new file: src/circuitLogic.ts

export interface CircuitNode {
  id: string;
  type: 'component' | 'junction' | 'terminal';
  connections: string[];
  position: { x: number; y: number };
}

export interface CircuitTemplate {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  name: string;
  description: string;
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
      { id: 'A', type: 'terminal', connections: ['S1'], position: { x: 50, y: 200 } },
      { id: 'S1', type: 'component', connections: ['A', 'R1'], position: { x: 120, y: 200 } },
      { id: 'R1', type: 'component', connections: ['S1', 'J1'], position: { x: 200, y: 200 } },
      { id: 'J1', type: 'junction', connections: ['R1', 'C1', 'R2'], position: { x: 280, y: 200 } },
      { id: 'C1', type: 'component', connections: ['J1', 'B'], position: { x: 360, y: 150 } },
      { id: 'R2', type: 'component', connections: ['J1', 'B'], position: { x: 360, y: 250 } },
      { id: 'B', type: 'terminal', connections: ['C1', 'R2'], position: { x: 450, y: 200 } }
    ],
    validationRules: {
      componentCount: {S:1,R:2,C:1}
    }
  },
  {
    id: 'medium-5',
    difficulty: 'medium',
    name: 'Resistor Network',
    description: 'Complex resistor network with junction nodes',
    requiredComponents: [
      { type: 'R', count: 4 }
    ],
    targetTopology: [
      { id: 'A', type: 'terminal', connections: ['R1'], position: { x: 100, y: 200 } },
      { id: 'R1', type: 'component', connections: ['A', 'J1'], position: { x: 180, y: 200 } },
      { id: 'J1', type: 'junction', connections: ['R1', 'R2', 'R3'], position: { x: 260, y: 200 } },
      { id: 'R2', type: 'component', connections: ['J1', 'J2'], position: { x: 340, y: 150 } },
      { id: 'R3', type: 'component', connections: ['J1', 'J2'], position: { x: 340, y: 250 } },
      { id: 'J2', type: 'junction', connections: ['R2', 'R3', 'R4'], position: { x: 420, y: 200 } },
      { id: 'R4', type: 'component', connections: ['J2', 'B'], position: { x: 500, y: 200 } },
      { id: 'B', type: 'terminal', connections: ['R4'], position: { x: 580, y: 200 } }
    ],
    validationRules: {
      componentCount: {R:4}
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
      { id: 'A', type: 'terminal', connections: ['R1', 'R2'], position: { x: 200, y: 100 } },
      { id: 'R1', type: 'component', connections: ['A', 'C'], position: { x: 100, y: 150 } },
      { id: 'R2', type: 'component', connections: ['A', 'D'], position: { x: 300, y: 150 } },
      { id: 'C', type: 'terminal', connections: ['R1', 'R3'], position: { x: 100, y: 250 } },
      { id: 'D', type: 'terminal', connections: ['R2', 'R4'], position: { x: 300, y: 250 } },
      { id: 'R3', type: 'component', connections: ['C', 'B'], position: { x: 150, y: 300 } },
      { id: 'R4', type: 'component', connections: ['D', 'B'], position: { x: 250, y: 300 } },
      { id: 'B', type: 'terminal', connections: ['R3', 'R4'], position: { x: 200, y: 350 } }
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
    requiredComponents: [
      { type: 'R', count: 2 },
      { type: 'Q', count: 1 },
      { type: 'LED', count: 1 }
    ],
    targetTopology: [
      { id: 'VCC', type: 'terminal', connections: ['R1'], position: { x: 200, y: 100 } },
      { id: 'R1', type: 'component', connections: ['VCC', 'LED1'], position: { x: 200, y: 150 } },
      { id: 'LED1', type: 'component', connections: ['R1', 'Q1_C'], position: { x: 200, y: 200 } },
      { id: 'Q1_C', type: 'junction', connections: ['LED1', 'Q1'], position: { x: 200, y: 250 } },
      { id: 'Q1', type: 'component', connections: ['Q1_C', 'GND', 'R2'], position: { x: 250, y: 300 } },
      { id: 'R2', type: 'component', connections: ['Q1', 'IN'], position: { x: 150, y: 300 } },
      { id: 'IN', type: 'terminal', connections: ['R2'], position: { x: 100, y: 300 } },
      { id: 'GND', type: 'terminal', connections: ['Q1'], position: { x: 250, y: 400 } }
    ],
    validationRules: {
      componentCount: {R:2,Q:1,LED:1}
    }
  },
  {
    id: 'medium-9',
    difficulty: 'medium',
    name: 'Loaded Voltage Divider',
    description: 'Voltage divider with loading effect',
    requiredComponents: [
      { type: 'R', count: 3 }
    ],
    targetTopology: [
      { id: 'A', type: 'terminal', connections: ['R1'], position: { x: 100, y: 150 } },
      { id: 'R1', type: 'component', connections: ['A', 'J1'], position: { x: 200, y: 150 } },
      { id: 'J1', type: 'junction', connections: ['R1', 'R2', 'R3'], position: { x: 300, y: 200 } },
      { id: 'R2', type: 'component', connections: ['J1', 'B'], position: { x: 300, y: 300 } },
      { id: 'R3', type: 'component', connections: ['J1', 'OUT'], position: { x: 400, y: 200 } },
      { id: 'OUT', type: 'terminal', connections: ['R3'], position: { x: 500, y: 200 } },
      { id: 'B', type: 'terminal', connections: ['R2'], position: { x: 300, y: 400 } }
    ],
    validationRules: {
      componentCount: {R:3}
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
      componentCount: {R:1,C:1}
    }
  },
  // HARD CIRCUITS (10 total)
  {
    id: 'hard-1',
    difficulty: 'hard',
    name: 'Complex Mixed Circuit',
    description: 'Build a circuit with series and parallel combinations',
    requiredComponents: [
      { type: 'R', count: 2 },
      { type: 'C', count: 1 },
      { type: 'L', count: 1 }
    ],
    targetTopology: [
      { id: 'A', type: 'terminal', connections: ['R1'], position: { x: 100, y: 200 } },
      { id: 'R1', type: 'component', connections: ['A', 'J1'], position: { x: 200, y: 200 } },
      { id: 'J1', type: 'junction', connections: ['R1', 'R2', 'L1'], position: { x: 300, y: 200 } },
      { id: 'R2', type: 'component', connections: ['J1', 'J2'], position: { x: 400, y: 150 } },
      { id: 'L1', type: 'component', connections: ['J1', 'J2'], position: { x: 400, y: 250 } },
      { id: 'J2', type: 'junction', connections: ['R2', 'L1', 'C1'], position: { x: 500, y: 200 } },
      { id: 'C1', type: 'component', connections: ['J2', 'B'], position: { x: 600, y: 200 } },
      { id: 'B', type: 'terminal', connections: ['C1'], position: { x: 700, y: 200 } }
    ],
    validationRules: {
      componentCount: {R:2,C:1,L:1}
    }
  },
  {
    id: 'hard-2',
    difficulty: 'hard',
    name: 'Complex Series-Parallel',
    description: 'Advanced circuit with 5+ components in series-parallel configuration',
    requiredComponents: [
      { type: 'R', count: 3 },
      { type: 'L', count: 1 },
      { type: 'C', count: 2 }
    ],
    targetTopology: [
      { id: 'A', type: 'terminal', connections: ['R1'], position: { x: 50, y: 200 } },
      { id: 'R1', type: 'component', connections: ['A', 'J1'], position: { x: 150, y: 200 } },
      { id: 'J1', type: 'junction', connections: ['R1', 'R2', 'L1'], position: { x: 250, y: 200 } },
      { id: 'R2', type: 'component', connections: ['J1', 'J2'], position: { x: 350, y: 150 } },
      { id: 'L1', type: 'component', connections: ['J1', 'J2'], position: { x: 350, y: 250 } },
      { id: 'J2', type: 'junction', connections: ['R2', 'L1', 'C1'], position: { x: 450, y: 200 } },
      { id: 'C1', type: 'component', connections: ['J2', 'J3'], position: { x: 550, y: 200 } },
      { id: 'J3', type: 'junction', connections: ['C1', 'R3', 'C2'], position: { x: 650, y: 200 } },
      { id: 'R3', type: 'component', connections: ['J3', 'B'], position: { x: 750, y: 150 } },
      { id: 'C2', type: 'component', connections: ['J3', 'B'], position: { x: 750, y: 250 } },
      { id: 'B', type: 'terminal', connections: ['R3', 'C2'], position: { x: 850, y: 200 } }
    ],
    validationRules: {
      componentCount: {R:3,L:1,C:2}
    }
  },
  {
    id: 'hard-3',
    difficulty: 'hard',
    name: 'RLC Switched Branches',
    description: 'RLC circuit with multiple switched branches',
    requiredComponents: [
      { type: 'R', count: 2 },
      { type: 'L', count: 1 },
      { type: 'C', count: 1 },
      { type: 'S', count: 2 }
    ],
    targetTopology: [
      { id: 'A', type: 'terminal', connections: ['J1'], position: { x: 100, y: 200 } },
      { id: 'J1', type: 'junction', connections: ['A', 'S1', 'S2'], position: { x: 200, y: 200 } },
      { id: 'S1', type: 'component', connections: ['J1', 'R1'], position: { x: 250, y: 150 } },
      { id: 'S2', type: 'component', connections: ['J1', 'L1'], position: { x: 250, y: 250 } },
      { id: 'R1', type: 'component', connections: ['S1', 'J2'], position: { x: 350, y: 150 } },
      { id: 'L1', type: 'component', connections: ['S2', 'J2'], position: { x: 350, y: 250 } },
      { id: 'J2', type: 'junction', connections: ['R1', 'L1', 'R2'], position: { x: 450, y: 200 } },
      { id: 'R2', type: 'component', connections: ['J2', 'C1'], position: { x: 550, y: 200 } },
      { id: 'C1', type: 'component', connections: ['R2', 'B'], position: { x: 650, y: 200 } },
      { id: 'B', type: 'terminal', connections: ['C1'], position: { x: 750, y: 200 } }
    ],
    validationRules: {
      componentCount: { R: 2, L: 1, C: 1, S: 2 }
    }
  },
  {
    id: 'hard-4',
    difficulty: 'hard',
    name: 'Transistor Amplifier',
    description: 'Advanced transistor amplifier circuit',
    requiredComponents: [
      { type: 'R', count: 4 },
      { type: 'C', count: 2 },
      { type: 'Q', count: 1 }
    ],
    targetTopology: [
      { id: 'VCC', type: 'terminal', connections: ['R1', 'R2'], position: { x: 300, y: 50 } },
      { id: 'R1', type: 'component', connections: ['VCC', 'Q1_B'], position: { x: 200, y: 100 } },
      { id: 'R2', type: 'component', connections: ['VCC', 'Q1_C'], position: { x: 400, y: 100 } },
      { id: 'Q1_B', type: 'junction', connections: ['R1', 'C1', 'R3'], position: { x: 200, y: 200 } },
      { id: 'Q1_C', type: 'junction', connections: ['R2', 'Q1', 'C2'], position: { x: 400, y: 200 } },
      { id: 'Q1', type: 'component', connections: ['Q1_B', 'Q1_C', 'R4'], position: { x: 300, y: 250 } },
      { id: 'C1', type: 'component', connections: ['Q1_B', 'IN'], position: { x: 100, y: 200 } },
      { id: 'C2', type: 'component', connections: ['Q1_C', 'OUT'], position: { x: 500, y: 200 } },
      { id: 'R3', type: 'component', connections: ['Q1_B', 'GND'], position: { x: 200, y: 350 } },
      { id: 'R4', type: 'component', connections: ['Q1', 'GND'], position: { x: 300, y: 350 } },
      { id: 'IN', type: 'terminal', connections: ['C1'], position: { x: 50, y: 200 } },
      { id: 'OUT', type: 'terminal', connections: ['C2'], position: { x: 550, y: 200 } },
      { id: 'GND', type: 'terminal', connections: ['R3', 'R4'], position: { x: 250, y: 400 } }
    ],
    validationRules: {
      componentCount: { R: 4, C: 2, Q: 1 }
    }
  },
  {
    id: 'hard-5',
    difficulty: 'hard',
    name: 'Multi-Stage Voltage Divider',
    description: 'Multi-stage voltage divider with multiple loads',
    requiredComponents: [
      { type: 'R', count: 6 }
    ],
    targetTopology: [
      { id: 'VIN', type: 'terminal', connections: ['R1'], position: { x: 100, y: 100 } },
      { id: 'R1', type: 'component', connections: ['VIN', 'J1'], position: { x: 200, y: 100 } },
      { id: 'J1', type: 'junction', connections: ['R1', 'R2', 'R4'], position: { x: 300, y: 150 } },
      { id: 'R2', type: 'component', connections: ['J1', 'J2'], position: { x: 300, y: 200 } },
      { id: 'R4', type: 'component', connections: ['J1', 'OUT1'], position: { x: 400, y: 150 } },
      { id: 'J2', type: 'junction', connections: ['R2', 'R3', 'R5'], position: { x: 300, y: 300 } },
      { id: 'R3', type: 'component', connections: ['J2', 'GND'], position: { x: 300, y: 400 } },
      { id: 'R5', type: 'component', connections: ['J2', 'J3'], position: { x: 400, y: 300 } },
      { id: 'J3', type: 'junction', connections: ['R5', 'R6'], position: { x: 500, y: 300 } },
      { id: 'R6', type: 'component', connections: ['J3', 'OUT2'], position: { x: 500, y: 350 } },
      { id: 'OUT1', type: 'terminal', connections: ['R4'], position: { x: 450, y: 150 } },
      { id: 'OUT2', type: 'terminal', connections: ['R6'], position: { x: 500, y: 400 } },
      { id: 'GND', type: 'terminal', connections: ['R3'], position: { x: 300, y: 450 } }
    ],
    validationRules: {
      componentCount: { R: 6 }
    }
  },
  {
    id: 'hard-6',
    difficulty: 'hard',
    name: 'Bridge Rectifier',
    description: 'Full-wave bridge rectifier circuit',
    requiredComponents: [
      { type: 'D', count: 4 },
      { type: 'C', count: 1 },
      { type: 'R', count: 1 }
    ],
    targetTopology: [
      { id: 'AC1', type: 'terminal', connections: ['D1', 'D3'], position: { x: 100, y: 200 } },
      { id: 'AC2', type: 'terminal', connections: ['D2', 'D4'], position: { x: 100, y: 300 } },
      { id: 'D1', type: 'component', connections: ['AC1', 'PLUS'], position: { x: 200, y: 150 } },
      { id: 'D2', type: 'component', connections: ['AC2', 'PLUS'], position: { x: 200, y: 250 } },
      { id: 'D3', type: 'component', connections: ['AC1', 'MINUS'], position: { x: 300, y: 150 } },
      { id: 'D4', type: 'component', connections: ['AC2', 'MINUS'], position: { x: 300, y: 250 } },
      { id: 'PLUS', type: 'junction', connections: ['D1', 'D2', 'R1', 'C1'], position: { x: 400, y: 200 } },
      { id: 'MINUS', type: 'junction', connections: ['D3', 'D4', 'R1', 'C1'], position: { x: 400, y: 300 } },
      { id: 'R1', type: 'component', connections: ['PLUS', 'MINUS'], position: { x: 500, y: 200 } },
      { id: 'C1', type: 'component', connections: ['PLUS', 'MINUS'], position: { x: 500, y: 300 } }
    ],
    validationRules: {
      componentCount: { D: 4, R: 1, C: 1 }
    }
  },
  {
    id: 'hard-7',
    difficulty: 'hard',
    name: 'RC Timing Circuit',
    description: 'RC timing circuit with LED indicator',
    requiredComponents: [
      { type: 'R', count: 2 },
      { type: 'C', count: 1 },
      { type: 'S', count: 1 },
      { type: 'LED', count: 1 },
      { type: 'Q', count: 1 }
    ],
    targetTopology: [
      { id: 'VCC', type: 'terminal', connections: ['S1', 'R1'], position: { x: 100, y: 100 } },
      { id: 'S1', type: 'component', connections: ['VCC', 'J1'], position: { x: 150, y: 150 } },
      { id: 'R1', type: 'component', connections: ['VCC', 'LED1'], position: { x: 200, y: 100 } },
      { id: 'J1', type: 'junction', connections: ['S1', 'R2', 'C1'], position: { x: 200, y: 200 } },
      { id: 'R2', type: 'component', connections: ['J1', 'Q1_B'], position: { x: 300, y: 200 } },
      { id: 'C1', type: 'component', connections: ['J1', 'GND'], position: { x: 200, y: 300 } },
      { id: 'Q1_B', type: 'junction', connections: ['R2', 'Q1'], position: { x: 400, y: 200 } },
      { id: 'Q1', type: 'component', connections: ['Q1_B', 'LED1', 'GND'], position: { x: 400, y: 250 } },
      { id: 'LED1', type: 'component', connections: ['R1', 'Q1'], position: { x: 300, y: 100 } },
      { id: 'GND', type: 'terminal', connections: ['C1', 'Q1'], position: { x: 300, y: 350 } }
    ],
    validationRules: {
      componentCount: { R: 2, C: 1, S: 1, LED: 1, Q: 1 }
    }
  },
  {
    id: 'hard-8',
    difficulty: 'hard',
    name: 'Oscillator Circuit',
    description: 'RC oscillator circuit with feedback',
    requiredComponents: [
      { type: 'R', count: 3 },
      { type: 'C', count: 2 },
      { type: 'OP', count: 1 }
    ],
    targetTopology: [
      { id: 'VCC', type: 'terminal', connections: ['OP1'], position: { x: 300, y: 50 } },
      { id: 'OP1', type: 'component', connections: ['VCC', 'R1', 'R2', 'J1'], position: { x: 300, y: 150 } },
      { id: 'R1', type: 'component', connections: ['OP1', 'C1'], position: { x: 200, y: 200 } },
      { id: 'C1', type: 'component', connections: ['R1', 'J2'], position: { x: 150, y: 250 } },
      { id: 'J2', type: 'junction', connections: ['C1', 'R2', 'C2'], position: { x: 200, y: 300 } },
      { id: 'R2', type: 'component', connections: ['J2', 'OP1'], position: { x: 250, y: 250 } },
      { id: 'C2', type: 'component', connections: ['J2', 'J3'], position: { x: 300, y: 350 } },
      { id: 'J3', type: 'junction', connections: ['C2', 'R3'], position: { x: 400, y: 350 } },
      { id: 'J1', type: 'junction', connections: ['OP1', 'OUT'], position: { x: 400, y: 150 } },
      { id: 'R3', type: 'component', connections: ['J3', 'J1'], position: { x: 450, y: 250 } },
      { id: 'OUT', type: 'terminal', connections: ['J1'], position: { x: 500, y: 150 } },
      { id: 'GND', type: 'terminal', connections: ['OP1'], position: { x: 300, y: 400 } }
    ],
    validationRules: {
      componentCount: { R: 3, C: 1, OP: 1 }
    }
  },
  {
    id: 'hard-9',
    difficulty: 'hard',
    name: 'IC with External Passives',
    description: 'Integrated circuit with external passive components',
    requiredComponents: [
      { type: 'IC', count: 1 },
      { type: 'R', count: 3 },
      { type: 'C', count: 2 }
    ],
    targetTopology: [
      { id: 'VCC', type: 'terminal', connections: ['IC1_VCC', 'R1'], position: { x: 300, y: 50 } },
      { id: 'IC1_VCC', type: 'junction', connections: ['VCC', 'IC1'], position: { x: 300, y: 100 } },
      { id: 'IC1', type: 'component', connections: ['IC1_VCC', 'IC1_IN', 'IC1_OUT', 'IC1_GND'], position: { x: 300, y: 200 } },
      { id: 'R1', type: 'component', connections: ['VCC', 'IC1_IN'], position: { x: 200, y: 100 } },
      { id: 'IC1_IN', type: 'junction', connections: ['R1', 'IC1', 'C1'], position: { x: 150, y: 200 } },
      { id: 'C1', type: 'component', connections: ['IC1_IN', 'IN'], position: { x: 100, y: 200 } },
      { id: 'IC1_OUT', type: 'junction', connections: ['IC1', 'R2', 'C2'], position: { x: 450, y: 200 } },
      { id: 'R2', type: 'component', connections: ['IC1_OUT', 'R3'], position: { x: 500, y: 150 } },
      { id: 'C2', type: 'component', connections: ['IC1_OUT', 'OUT'], position: { x: 500, y: 250 } },
      { id: 'R3', type: 'component', connections: ['R2', 'IC1_GND'], position: { x: 550, y: 200 } },
      { id: 'IC1_GND', type: 'junction', connections: ['R3', 'IC1', 'GND'], position: { x: 300, y: 300 } },
      { id: 'IN', type: 'terminal', connections: ['C1'], position: { x: 50, y: 200 } },
      { id: 'OUT', type: 'terminal', connections: ['C2'], position: { x: 550, y: 250 } },
      { id: 'GND', type: 'terminal', connections: ['IC1_GND'], position: { x: 300, y: 350 } }
    ],
    validationRules: {
      componentCount: { IC: 1, R: 3, C: 2 }
    }
  },
  {
    id: 'hard-10',
    difficulty: 'hard',
    name: 'Logic Gate Circuit',
    description: 'Simple logic gate circuit using diodes and transistors',
    requiredComponents: [
      { type: 'D', count: 2 },
      { type: 'R', count: 3 },
      { type: 'Q', count: 1 },
      { type: 'LED', count: 1 }
    ],
    targetTopology: [
      { id: 'A', type: 'terminal', connections: ['D1'], position: { x: 100, y: 150 } },
      { id: 'B', type: 'terminal', connections: ['D2'], position: { x: 100, y: 250 } },
      { id: 'D1', type: 'component', connections: ['A', 'J1'], position: { x: 200, y: 150 } },
      { id: 'D2', type: 'component', connections: ['B', 'J1'], position: { x: 200, y: 250 } },
      { id: 'J1', type: 'junction', connections: ['D1', 'D2', 'R1'], position: { x: 300, y: 200 } },
      { id: 'R1', type: 'component', connections: ['J1', 'Q1_B'], position: { x: 400, y: 200 } },
      { id: 'Q1_B', type: 'junction', connections: ['R1', 'Q1', 'R2'], position: { x: 500, y: 200 } },
      { id: 'Q1', type: 'component', connections: ['Q1_B', 'R3', 'GND'], position: { x: 500, y: 300 } },
      { id: 'R2', type: 'component', connections: ['Q1_B', 'GND'], position: { x: 450, y: 250 } },
      { id: 'R3', type: 'component', connections: ['Q1', 'VCC'], position: { x: 600, y: 200 } },
      { id: 'VCC', type: 'terminal', connections: ['R3', 'LED1'], position: { x: 700, y: 100 } },
      { id: 'LED1', type: 'component', connections: ['VCC', 'Q1'], position: { x: 600, y: 150 } },
      { id: 'GND', type: 'terminal', connections: ['Q1', 'R2'], position: { x: 500, y: 400 } }
    ],
    validationRules: {
      componentCount: { D: 2, Q: 1, R: 3, LED: 1 }
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

  // Check if template uses requiredPlacements (specific positioning) or componentCount (flexible positioning)
  const useRequiredPlacements = template.validationRules.requiredPlacements && template.validationRules.requiredPlacements.length > 0;

  if (useRequiredPlacements) {
    // Validate specific component placements at exact positions
    template.validationRules.requiredPlacements!.forEach(requirement => {
      const placedComponent = placedComponents.find(comp => comp.instanceId === requirement.nodeId);
      
      if (!placedComponent) {
        errors.push(`Missing ${requirement.expectedType} component at position ${requirement.nodeId}`);
      } else if (placedComponent.type !== requirement.expectedType) {
        errors.push(`Wrong component type at ${requirement.nodeId}: expected ${requirement.expectedType}, found ${placedComponent.type}`);
      } else {
        // Check if component is placed at the correct position (with some tolerance)
        const tolerance = 10; // Allow 10 pixel tolerance
        const xMatch = Math.abs(placedComponent.x - requirement.position.x) <= tolerance;
        const yMatch = Math.abs(placedComponent.y - requirement.position.y) <= tolerance;
        
        if (xMatch && yMatch) {
          score += 100 / template.validationRules.requiredPlacements!.length; // Distribute points evenly
        } else {
          errors.push(`Component ${requirement.expectedType} at ${requirement.nodeId} is not positioned correctly`);
        }
      }
    });
  } else {
    // Use flexible component count validation
    const componentCounts = placedComponents.reduce((acc, comp) => {
      acc[comp.type] = (acc[comp.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Check against componentCount rules if they exist
    if (template.validationRules.componentCount) {
      Object.entries(template.validationRules.componentCount).forEach(([componentType, requiredCount]) => {
        const actual = componentCounts[componentType] || 0;
        if (actual < requiredCount) {
          errors.push(`Missing ${requiredCount - actual} ${componentType} component(s)`);
        } else if (actual === requiredCount) {
          score += 100 / Object.keys(template.validationRules.componentCount!).length; // Distribute points evenly
        } else if (actual > requiredCount) {
          errors.push(`Too many ${componentType} components: expected ${requiredCount}, found ${actual}`);
        }
      });
    } else {
      // Fallback to requiredComponents if no validation rules exist
      template.requiredComponents.forEach(req => {
        const actual = componentCounts[req.type] || 0;
        if (actual < req.count) {
          errors.push(`Missing ${req.count - actual} ${req.type} component(s)`);
        } else if (actual === req.count) {
          score += 100 / template.requiredComponents.length; // Distribute points evenly
        } else if (actual > req.count) {
          errors.push(`Too many ${req.type} components: expected ${req.count}, found ${actual}`);
        }
      });
    }
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
  return ['A', 'B', 'VCC', 'GND', 'IN', 'OUT', 'VIN', 'AC1', 'AC2', 'PLUS', 'MINUS'].includes(nodeId);
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
