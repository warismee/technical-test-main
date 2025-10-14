// Mission and behavior-first validation wrapper for the gamey experience
// This file builds on the existing circuit templates while allowing
// behavioral “missions”. It preserves the public helpers used by Block.

import {
  circuitTemplates,
  validateCircuit as legacyValidateCircuit,
  generateUniqueChallenge as legacyGenerateUniqueChallenge,
  getTotalQuestionsForDifficulty as legacyGetTotalQuestionsForDifficulty,
} from "./circuitLogic";
import type { CircuitTemplate, ComponentPlacement } from "./circuitLogic";

// Mission schema (lightweight)
export type GoalKind =
  | "voltage-threshold" // Ensure a node reaches a target voltage
  | "make-led-bright" // Ensure LED turns on (proxy by heuristic)
  | "component-efficiency" // Reward using fewer components
  | "led-current-target" // Adjust resistor to reach target LED current
  | "rlc-resonance-target" // Adjust L and C (and optionally R) to hit target f0
  | "dtl-output-target"; // Adjust R1/R2 to achieve a HIGH or LOW on OUT

export interface Mission {
  id: string;
  difficulty: "easy" | "medium" | "hard";
  title: string;
  description: string;
  templateId: string; // binds to an existing CircuitTemplate by id
  allowedComponents?: { type: string; maxCount?: number }[];
  constraints?: { budget?: number; maxComponents?: number };
  goal:
    | {
        kind: "voltage-threshold";
        params: { node: string; minVoltage: number; supply?: number };
        successTolerance?: number;
      }
    | {
        kind: "make-led-bright";
        params: { ledNodeId?: string };
      }
    | {
        kind: "component-efficiency";
        params: { maxComponents: number };
      }
    | {
        kind: "led-current-target";
        params: { supply: number; vf?: number; targetCurrent_mA: number; tolerance_mA?: number };
      }
    | {
        kind: "rlc-resonance-target";
        params: { targetFrequencyHz: number; toleranceHz?: number };
      }
    | {
        kind: "dtl-output-target";
        params: {
          supply?: number; // default 5 V
          target: "HIGH" | "LOW"; // desired OUT logic level
          minHighV?: number; // default 4.0 V
          maxLowV?: number; // default 0.5 V
          vbeOn?: number; // default 0.7 V (heuristic only)
        };
      };
  scoring?: { accuracyWeight?: number; efficiencyWeight?: number; base?: number };
}

// A tiny set of missions mapped onto existing templates to keep UI working.
// You can expand this list as you add more behavioral goals.
const missionCatalog: Mission[] = [
  {
    id: "mission-divider-1",
    difficulty: "easy",
    title: "Set the Midpoint",
    description: "Create a divider that yields at least 2.0V at OUT from a 5V source.",
    templateId: "easy-7", // Voltage Divider template
    allowedComponents: [
      { type: "R", maxCount: 2 },
    ],
    constraints: { maxComponents: 3 },
    goal: {
      kind: "voltage-threshold",
      params: { node: "OUT", minVoltage: 2.0, supply: 5 },
      successTolerance: 0.05,
    },
    scoring: { base: 60, accuracyWeight: 0.4, efficiencyWeight: 0.6 },
  },
//   {
//     id: "mission-led-1",
//     difficulty: "easy",
//     title: "Light the LED",
//     description: "Make the LED turn on using a resistor for current limiting.",
//     templateId: "easy-8", // LED circuit template
//     allowedComponents: [
//       { type: "R", maxCount: 1 },
//       { type: "LED", maxCount: 1 },
//     ],
//     constraints: { maxComponents: 2 },
//     goal: {
//       kind: "make-led-bright",
//       params: { ledNodeId: "LED1" },
//     },
//     scoring: { base: 70, accuracyWeight: 0.3, efficiencyWeight: 0.7 },
//   },
  // EASY mission: Tune LED current with resistor to a target value
  {
    id: "mission-led-current-10mA",
    difficulty: "easy",
    title: "Tune LED to 10 mA",
    description: "Adjust the resistor so the LED current is about 10 mA (±2 mA) at 5V supply.",
    templateId: "easy-8",
    allowedComponents: [
      { type: "R", maxCount: 1 },
      { type: "LED", maxCount: 1 },
    ],
    constraints: { maxComponents: 2 },
    goal: {
      kind: "led-current-target",
      params: { supply: 5, vf: 2.0, targetCurrent_mA: 10, tolerance_mA: 2 },
    },
    scoring: { base: 75, accuracyWeight: 0.5, efficiencyWeight: 0.5 },
  },
  // MEDIUM mission: RLC series using template medium-2
  {
    id: "mission-rlc-series-1",
    difficulty: "medium",
    title: "Tune RLC Resonance",
    description: "Place R, L, C in series, then adjust L and C to reach the target resonance frequency.",
    templateId: "medium-2",
    allowedComponents: [
      { type: "R", maxCount: 1 },
      { type: "L", maxCount: 1 },
      { type: "C", maxCount: 1 },
    ],
    constraints: { maxComponents: 3 },
    goal: {
      kind: "rlc-resonance-target",
      params: { targetFrequencyHz: 1600, toleranceHz: 200 },
    },
    scoring: { base: 80, accuracyWeight: 0.4, efficiencyWeight: 0.6 },
  },
  // HARD mission: DTL logic gate using template hard-2
  {
    id: "mission-dtl-1",
    difficulty: "hard",
    title: "Assemble a DTL Gate",
    description: "Build the DTL logic stage and tune R1/R2 to get a HIGH at OUT.",
    templateId: "hard-2",
    allowedComponents: [
      { type: "D", maxCount: 3 },
      { type: "R", maxCount: 2 },
      { type: "Q", maxCount: 1 },
    ],
    constraints: { maxComponents: 6 },
    goal: {
      kind: "dtl-output-target",
      params: { target: "HIGH", supply: 5, minHighV: 4.0 },
    },
    scoring: { base: 90, accuracyWeight: 0.4, efficiencyWeight: 0.6 },
  },
];

// Simple helper to find a mission for a given template
export function getMissionForTemplate(template: CircuitTemplate): Mission | null {
  return missionCatalog.find((m) => m.templateId === template.id) || null;
}

export function getMissionByTemplateId(templateId: string): Mission | null {
  return missionCatalog.find((m) => m.templateId === templateId) || null;
}

// Get mission by its unique id
export function getMissionById(id: string): Mission | null {
  return missionCatalog.find((m) => m.id === id) || null;
}

// Get the circuit template associated with a mission id
export function getTemplateForMission(missionId: string): CircuitTemplate | null {
  const m = missionCatalog.find((x) => x.id === missionId);
  if (!m) return null;
  return circuitTemplates.find((t) => t.id === m.templateId) || null;
}

// Very lightweight, heuristic “simulation” stubs — fast and tolerant.
// These purposely avoid heavy physics and reward correct structure.
function simulateVoltageThreshold(
  placed: ComponentPlacement[],
  template: CircuitTemplate,
  params: { node: string; minVoltage: number; supply?: number },
  options?: { componentValues?: Record<string, number>; units?: 'ohm' | 'kOhm' }
) {
  // Heuristic: for the divider template (easy-7), if two resistors are present
  // at the intended nodes (R1 and R2) and OUT terminal exists, estimate ~2.5V.
  // Otherwise, degrade the estimate.
  const supply = params.supply ?? 5;
  const haveR1 = placed.some((p) => p.instanceId === "R1" && p.type === "R");
  const haveR2 = placed.some((p) => p.instanceId === "R2" && p.type === "R");
  const haveOUT = template.targetTopology.some((n) => n.id === params.node);

  let vout = 0.0;
  if (haveR1 && haveR2 && haveOUT) {
    // If values provided (e.g., from mission scene), use actual divider math
    const vals = options?.componentValues;
    if (vals && typeof vals['R1'] === 'number' && typeof vals['R2'] === 'number') {
      const unitScale = options?.units === 'kOhm' ? 1000 : 1; // convert to ohms if needed (ratio cancels, but keep consistent)
      const R1 = Math.max(1e-9, vals['R1'] * unitScale);
      const R2 = Math.max(1e-9, vals['R2'] * unitScale);
      vout = supply * (R2 / (R1 + R2));
    } else {
      // Fallback: assume roughly equal divider
      vout = supply * 0.5;
    }
  } else if ((haveR1 || haveR2) && haveOUT) {
    vout = supply * 0.25; // partial credit
  } else {
    vout = 0.0;
  }

  const ok = vout + (params.minVoltage * (params.minVoltage < 0 ? -1 : 0)) >= params.minVoltage;
  return { ok, voltage: vout };
}

function simulateLedBrightness(
  placed: ComponentPlacement[],
  template: CircuitTemplate,
  params: { ledNodeId?: string }
) {
  // Heuristic: LED considered lit if LED is placed and at least one resistor in series path
  // exists in the template’s chain between terminals. We can approximate by checking
  // for LED at the expected node and at least one resistor placed anywhere in template.
  const ledOk = placed.some((p) => (params.ledNodeId ? p.instanceId === params.ledNodeId : /LED/i.test(p.instanceId)) && p.type === "LED");
  const anyRes = placed.some((p) => p.type === "R");
  const ok = ledOk && anyRes;
  const brightness = ok ? 1.0 : ledOk ? 0.3 : 0.0; // proxy brightness 0..1
  return { ok, brightness };
}

function simulateLedCurrentTarget(
  placed: ComponentPlacement[],
  template: CircuitTemplate,
  params: { supply: number; vf?: number; targetCurrent_mA: number; tolerance_mA?: number },
  options?: { componentValues?: Record<string, number>; units?: 'ohm' | 'kOhm' }
) {
  // Expect one LED and one resistor in series (template easy-8). Compute I = (Vs - Vf) / R
  const hasLED = placed.some((p) => p.type === 'LED');
  const hasR = placed.some((p) => p.type === 'R');
  if (!hasLED || !hasR) {
    return { ok: false, current_mA: 0 };
  }
  const vals = options?.componentValues ?? {};
  // Use R1 value if present, else try any 'R' key, default 1 kΩ
  const rawR = typeof vals['R1'] === 'number' ? vals['R1'] : (typeof vals['R'] === 'number' ? vals['R'] : 1);
  const unitScale = options?.units === 'kOhm' ? 1000 : 1;
  const R_ohm = Math.max(1e-3, rawR * unitScale);
  const Vs = params.supply ?? 5;
  const Vf = params.vf ?? 2.0;
  const I_mA = Math.max(0, ((Vs - Vf) / R_ohm) * 1000);
  const tol = params.tolerance_mA ?? 2;
  const ok = Math.abs(I_mA - params.targetCurrent_mA) <= tol;
  return { ok, current_mA: I_mA };
}

function simulateRlcResonanceTarget(
  placed: ComponentPlacement[],
  template: CircuitTemplate,
  params: { targetFrequencyHz: number; toleranceHz?: number },
  options?: { componentValues?: Record<string, number> }
) {
  // Require R, L, C placed anywhere in the template
  const haveR = placed.some((p) => p.type === 'R');
  const haveL = placed.some((p) => p.type === 'L');
  const haveC = placed.some((p) => p.type === 'C');
  if (!haveR || !haveL || !haveC) {
    return { ok: false, freqHz: 0 };
  }
  const vals = options?.componentValues ?? {};
  // Expect UI to provide L in mH and C in µF. Accept L1/C1 keys too.
  const L_mH = typeof vals['L'] === 'number' ? vals['L'] : (typeof vals['L1'] === 'number' ? vals['L1'] : undefined);
  const C_uF = typeof vals['C'] === 'number' ? vals['C'] : (typeof vals['C1'] === 'number' ? vals['C1'] : undefined);
  if (L_mH == null || C_uF == null) {
    return { ok: false, freqHz: 0 };
  }
  const L_H = Math.max(1e-12, L_mH * 1e-3);
  const C_F = Math.max(1e-12, C_uF * 1e-6);
  const f0 = 1 / (2 * Math.PI * Math.sqrt(L_H * C_F));
  const tol = params.toleranceHz ?? Math.max(1, params.targetFrequencyHz * 0.1);
  const ok = Math.abs(f0 - params.targetFrequencyHz) <= tol;
  return { ok, freqHz: f0 };
}

// Very lightweight DTL stage heuristic
// Model: VCC -> R2 -> OUT -> Q1 collector. Base bias: VCC -> R1 -> J_IN -> Q1 base.
// If base is forward biased (Vb > ~VbeOn), transistor conducts, pulling OUT low through collector path.
// Else transistor is off and OUT is pulled up by R2 toward VCC.
function simulateDtlOutputTarget(
  placed: ComponentPlacement[],
  template: CircuitTemplate,
  params: { supply?: number; target: 'HIGH' | 'LOW'; minHighV?: number; maxLowV?: number; vbeOn?: number },
  options?: { componentValues?: Record<string, number>; units?: 'ohm' | 'kOhm' }
) {
  const supply = params.supply ?? 5;
  const vbeOn = params.vbeOn ?? 0.7;

  // Check presence of required parts
  const haveR1 = placed.some((p) => p.instanceId === 'R1' && p.type === 'R');
  const haveR2 = placed.some((p) => p.instanceId === 'R2' && p.type === 'R');
  const haveQ1 = placed.some((p) => p.instanceId === 'Q1' && p.type === 'Q');
  const haveDiodes = ['D1','D2','D3'].every(id => placed.some(p => p.instanceId === id && p.type === 'D'));
  if (!haveR1 || !haveR2 || !haveQ1 || !haveDiodes) {
    return { ok: false, outV: 0, reason: 'missing-components' };
  }

  const vals = options?.componentValues ?? {};
  const unitScale = options?.units === 'kOhm' ? 1000 : 1;
  const R1 = Math.max(1e-3, (typeof vals['R1'] === 'number' ? vals['R1'] : 100) * unitScale); // bias
  const R2 = Math.max(1e-3, (typeof vals['R2'] === 'number' ? vals['R2'] : 100) * unitScale); // pull-up

  // Heuristic base divider: Vb ≈ VCC * (R_sink / (R1 + R_sink)).
  // Assume inputs HIGH so diodes are off; model base-emitter path as a finite sink (Rbe) to GND so R1 tuning matters.
  const Rbe = 50000; // 50 kΩ effective base-emitter resistance when near conduction
  const Vb = supply * (Rbe / (R1 + Rbe));
  // Continuous conduction factor so R1 affects OUT smoothly
  const slope = 0.5; // V window for transition
  const k = Math.min(1, Math.max(0, (Vb - vbeOn) / slope));
  const RceOn = 100; // ohms when saturated
  const RceOff = 1e9; // effectively open when off
  const RceEff = 1 / ((k / RceOn) + ((1 - k) / RceOff)); // harmonic mix of on/off
  const outV = supply * (RceEff / (R2 + RceEff));

  const minHigh = params.minHighV ?? 0.8 * supply; // default ~80% of Vcc
  const maxLow = params.maxLowV ?? 0.5; // 0.5 V default
  const ok = params.target === 'HIGH' ? outV >= minHigh : outV <= maxLow;
  return { ok, outV, baseOn: k > 0.5 };
}

// Behavior-first validator that falls back to legacy rules where no mission exists.
export function validateCircuit(
  placedComponents: ComponentPlacement[],
  connections: Array<{ from: string; to: string }>,
  template: CircuitTemplate,
  options?: { componentValues?: Record<string, number>; units?: 'ohm' | 'kOhm' }
): { isValid: boolean; errors: string[]; score: number } {
  const mission = getMissionForTemplate(template);

  if (!mission) {
    // No behavior goal defined — use legacy validator as-is
    return legacyValidateCircuit(placedComponents, connections, template);
  }

  // Run a minimal simulation based on mission kind
  let pass = false;
  let telemetry: any = {};
  let hints: string[] = [];

  // Pre-check: enforce allowed components and constraints for clearer, mission-first feedback
  if (mission.allowedComponents && mission.allowedComponents.length > 0) {
    const allowedTypes = new Set(mission.allowedComponents.map((a) => a.type));
    const disallowed = placedComponents
      .filter((p) => !allowedTypes.has(p.type))
      .map((p) => p.type);
    if (disallowed.length > 0) {
      const allowedSummary = mission.allowedComponents
        .map((a) => `${a.type}${a.maxCount ? `×${a.maxCount}` : ''}`)
        .join(', ');
      return {
        isValid: false,
        errors: [
          `Disallowed component(s): ${Array.from(new Set(disallowed)).join(', ')}.`,
          `Allowed components: ${allowedSummary}.`,
        ],
        score: 0,
      };
    }

    // Per-type max enforcement
    const typeCounts = placedComponents.reduce<Record<string, number>>((acc, p) => {
      acc[p.type] = (acc[p.type] ?? 0) + 1;
      return acc;
    }, {});
    for (const a of mission.allowedComponents) {
      if (typeof a.maxCount === 'number') {
        const used = typeCounts[a.type] ?? 0;
        if (used > a.maxCount) {
          return {
            isValid: false,
            errors: [`Too many ${a.type} components: ${used}/${a.maxCount} (max).`],
            score: 0,
          };
        }
      }
    }
  }

  // Total max components constraint
  if (mission.constraints?.maxComponents != null) {
    const total = placedComponents.length;
    if (total > mission.constraints.maxComponents) {
      return {
        isValid: false,
        errors: [`Too many components placed: ${total}/${mission.constraints.maxComponents} (max).`],
        score: 0,
      };
    }
  }

  switch (mission.goal.kind) {
    case "voltage-threshold": {
      const sim = simulateVoltageThreshold(placedComponents, template, mission.goal.params, options);
      telemetry = sim;
      pass = sim.ok;
      if (!sim.ok) {
        const supply = mission.goal.params.supply ?? 5;
        const haveR1 = placedComponents.some((p) => p.instanceId === "R1" && p.type === "R");
        const haveR2 = placedComponents.some((p) => p.instanceId === "R2" && p.type === "R");
        const targetLine = `Target: V(${mission.goal.params.node}) ≥ ${mission.goal.params.minVoltage.toFixed(2)} V (supply ${supply} V).`;
        if (!haveR1 && !haveR2) {
          hints.push("Add two resistors R1 and R2 to form a divider from A to B; connect OUT at the midpoint.");
          hints.push(targetLine);
        } else if ((haveR1 && !haveR2) || (!haveR1 && haveR2)) {
          const missing = haveR1 ? "R2" : "R1";
          hints.push(`Only one resistor placed; add ${missing} to complete the divider.`);
          hints.push("Tip: Increase the R2/R1 ratio to raise V(OUT). Adjust values in the right panel.");
          hints.push(targetLine);
        } else {
          hints.push("Adjust the resistor ratio to raise V(OUT). Increase R2 or decrease R1.");
          hints.push(targetLine);
        }
      }
      break;
    }
    case "make-led-bright": {
      const sim = simulateLedBrightness(placedComponents, template, mission.goal.params);
      telemetry = sim;
      pass = sim.ok;
      if (!sim.ok) {
        const hasLED = placedComponents.some((p) => p.type === "LED");
        const hasR = placedComponents.some((p) => p.type === "R");
        if (!hasLED && !hasR) {
          hints.push("Place an LED and a series resistor to limit current.");
        } else if (!hasLED) {
          hints.push("Place an LED in the circuit (e.g., at LED1).");
        } else if (!hasR) {
          hints.push("Add a resistor in series with the LED to allow safe current.");
        } else {
          hints.push("Ensure the LED and resistor are in series between the terminals.");
        }
      }
      break;
    }
    case "led-current-target": {
      const sim = simulateLedCurrentTarget(placedComponents, template, mission.goal.params, options);
      telemetry = sim;
      pass = sim.ok;
      if (!sim.ok) {
        const hasLED = placedComponents.some((p) => p.type === 'LED');
        const hasR = placedComponents.some((p) => p.type === 'R');
        if (!hasLED && !hasR) {
          hints.push("Place an LED and a resistor in series between the terminals.");
        } else if (!hasLED) {
          hints.push("Place the LED (e.g., at LED1) in series with the resistor.");
        } else if (!hasR) {
          hints.push("Add a resistor to set the LED current.");
        } else {
          const target = mission.goal.params.targetCurrent_mA;
          const tol = mission.goal.params.tolerance_mA ?? 2;
          hints.push(`Adjust R1 to get ~${target} mA (±${tol} mA). Try decreasing R1 if current is too low, or increasing it if too high.`);
        }
      }
      break;
    }
    case "component-efficiency": {
      const count = placedComponents.length;
      const meetsCount = count <= mission.goal.params.maxComponents;
      // Also require meeting the template's requiredComponents counts for clarity
      const reqCounts: Record<string, number> = template.requiredComponents.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] ?? 0) + r.count;
        return acc;
      }, {} as Record<string, number>);
      const placedCounts = placedComponents.reduce<Record<string, number>>((acc, p) => {
        acc[p.type] = (acc[p.type] ?? 0) + 1;
        return acc;
      }, {});
      const missing: string[] = [];
      for (const [t, needed] of Object.entries(reqCounts)) {
        const have = placedCounts[t] ?? 0;
        if (have < needed) missing.push(`${needed - have}×${t}`);
      }
      pass = meetsCount && missing.length === 0;
      if (!meetsCount) hints.push(`Use no more than ${mission.goal.params.maxComponents} components.`);
      if (missing.length > 0) hints.push(`Missing required components: ${missing.join(', ')}.`);
      telemetry = { count, missing };
      break;
    }
    case "rlc-resonance-target": {
      const sim = simulateRlcResonanceTarget(placedComponents, template, mission.goal.params, options);
      telemetry = sim;
      pass = sim.ok;
      if (!sim.ok) {
        const haveR = placedComponents.some((p) => p.type === 'R');
        const haveL = placedComponents.some((p) => p.type === 'L');
        const haveC = placedComponents.some((p) => p.type === 'C');
        if (!haveR || !haveL || !haveC) {
          const missing: string[] = [];
          if (!haveR) missing.push('R');
          if (!haveL) missing.push('L');
          if (!haveC) missing.push('C');
          hints.push(`Place required components: ${missing.join(', ')}.`);
        } else {
          const target = mission.goal.params.targetFrequencyHz;
          const tol = mission.goal.params.toleranceHz ?? Math.max(1, target * 0.1);
          hints.push(`Adjust L (mH) or C (µF) to reach ~${Math.round(target)} Hz (±${Math.round(tol)} Hz). Increase C or L to lower f₀; decrease them to raise f₀.`);
        }
      }
      break;
    }
    case "dtl-output-target": {
      const sim = simulateDtlOutputTarget(placedComponents, template, mission.goal.params, options);
      telemetry = sim;
      pass = sim.ok;
      if (!sim.ok) {
        // Provide actionable hints
        const haveR1 = placedComponents.some((p) => p.instanceId === 'R1' && p.type === 'R');
        const haveR2 = placedComponents.some((p) => p.instanceId === 'R2' && p.type === 'R');
        const haveQ1 = placedComponents.some((p) => p.instanceId === 'Q1' && p.type === 'Q');
        const haveDiodes = ['D1','D2','D3'].every(id => placedComponents.some(p => p.instanceId === id && p.type === 'D'));
        if (!haveDiodes) hints.push('Place three diodes D1, D2, D3 feeding the base junction J_IN.');
        if (!haveR1) hints.push('Add R1 from VCC to J_IN to bias the transistor base.');
        if (!haveR2) hints.push('Add R2 from VCC to the collector/output node to pull OUT up.');
        if (!haveQ1) hints.push('Place the transistor Q1 with C at J_COL, E to GND, and B to J_IN.');
        if (haveR1 && haveR2 && haveQ1 && haveDiodes) {
          if (mission.goal.params.target === 'HIGH') {
            hints.push('Aim for OUT to be near VCC. Increase R1 (weaker base bias) or increase R2 to raise OUT.');
          } else {
            hints.push('Aim for OUT to be near 0V. Decrease R1 (stronger base bias) or decrease R2 to pull OUT down more when Q1 conducts.');
          }
        }
      }
      break;
    }
  }

  if (pass) {
    // Score: base + small bonus for using fewer components than template expects
    const expected = template.requiredComponents.reduce((acc, r) => acc + r.count, 0);
    const used = placedComponents.length;
    const efficiencyBonus = Math.max(0, expected - used) * 5; // light bonus per saved part
    const base = mission.scoring?.base ?? 60;
    const score = Math.min(100, Math.round(base + efficiencyBonus));
    return { isValid: true, errors: [], score };
  }

  // Behavior-first errors only for mission mode to keep feedback relevant
  return { isValid: false, errors: hints, score: 0 };
}

// Re-export helpers so callers can switch imports to this file without wider changes
export { circuitTemplates };

export function generateUniqueChallenge(
  difficulty: "easy" | "medium" | "hard",
  excludeIds: string[] = []
): CircuitTemplate | null {
  return legacyGenerateUniqueChallenge(difficulty, excludeIds);
}

export function getTotalQuestionsForDifficulty(
  difficulty: "easy" | "medium" | "hard"
): number {
  return legacyGetTotalQuestionsForDifficulty(difficulty);
}

// Mission-first iteration helpers
export function generateUniqueMission(
  difficulty: "easy" | "medium" | "hard",
  excludeIds: string[] = []
): Mission | null {
  const pool = missionCatalog.filter((m) => m.difficulty === difficulty);
  for (const m of pool) {
    if (!excludeIds.includes(m.id)) return m;
  }
  return null; // no more missions for this difficulty
}

export function getTotalMissionsForDifficulty(
  difficulty: "easy" | "medium" | "hard"
): number {
  return missionCatalog.filter((m) => m.difficulty === difficulty).length;
}
