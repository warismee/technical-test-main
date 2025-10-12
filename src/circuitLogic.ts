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
    seriesConnections?: string[][];
    parallelConnections?: string[][];
    requiredPath?: string[];
  };
}

// Example circuit templates
export const circuitTemplates: CircuitTemplate[] = [
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
      seriesConnections: [['A', 'R1', 'L1', 'B']],
      requiredPath: ['A', 'B']
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
      seriesConnections: [['A', 'R1', 'C1', 'B']],
      requiredPath: ['A', 'B']
    }
  },
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
      parallelConnections: [['R1', 'C1']],
      requiredPath: ['A', 'B']
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
      seriesConnections: [['A', 'R1', 'L1', 'C1', 'B']],
      requiredPath: ['A', 'B']
    }
  },
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
      seriesConnections: [['A', 'R1', 'J1'], ['J2', 'C1', 'B']],
      parallelConnections: [['R2', 'L1']],
      requiredPath: ['A', 'B']
    }
  }
];

// Validation function
export function validateCircuit(
  placedComponents: Array<{ instanceId: string; type: string; x: number; y: number }>,
  connections: Array<{ from: string; to: string }>,
  template: CircuitTemplate
): { isValid: boolean; errors: string[]; score: number } {
  const errors: string[] = [];
  let score = 0;

  // Check required components
  const componentCounts = placedComponents.reduce((acc, comp) => {
    acc[comp.type] = (acc[comp.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  template.requiredComponents.forEach(req => {
    const actual = componentCounts[req.type] || 0;
    if (actual < req.count) {
      errors.push(`Missing ${req.count - actual} ${req.type} component(s)`);
    } else if (actual === req.count) {
      score += 20; // Points for correct component count
    }
  });

  // Add more validation logic here...
  // - Check topology
  // - Validate connections
  // - Calculate score based on efficiency

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.min(100, score)
  };
}

// Random challenge generator
export function generateRandomChallenge(difficulty: 'easy' | 'medium' | 'hard'): CircuitTemplate {
  const templatesForDifficulty = circuitTemplates.filter(t => t.difficulty === difficulty);
  const randomIndex = Math.floor(Math.random() * templatesForDifficulty.length);
  return templatesForDifficulty[randomIndex];
}
