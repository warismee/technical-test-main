import React, { useState } from "react";
import CircuitSchematic2DScene from "./CircuitSchematic2DScene";
import { getMissionForTemplate, type Mission } from "./missionEngine";

// Minimal shape needed by the mission scene; avoids circuitLogic types
interface MinimalNode {
  id: string;
  type: 'component' | 'junction' | 'terminal';
  connections: string[];
  position: { x: number; y: number };
  fixedRotation?: number;
}

interface MinimalTemplate {
  id: string;
  targetTopology: MinimalNode[];
  disableAutoRotation?: boolean;
}

interface MissionSchematic2DSceneProps {
  // Accept a richer CircuitTemplate at runtime; only fields we use are required
  template: MinimalTemplate & { [k: string]: any };
  mission?: Mission; // Prefer explicit mission when multiple map to same template
  selectedComponentFromUI?: string | null;
  onComponentPlaced?: (nodeId: string, componentType: string) => void;
  placedComponents?: { [nodeId: string]: string };
  onComponentRemoved?: (nodeId: string) => void;
  isDarkMode?: boolean;
  onResistorValuesChange?: (values: { [nodeId: string]: number }) => void;
}

// Thin wrapper that shows mission meta on top of the existing 2D scene
// Dedicated scene for mission-divider-1 (Voltage Divider)
export default function MissionSchematic2DScene({
  template, // accepted but not required; this scene uses its own mission layout
  mission: missionProp,
  selectedComponentFromUI,
  onComponentPlaced,
  placedComponents = {},
  onComponentRemoved,
  isDarkMode = false,
  onResistorValuesChange,
}: MissionSchematic2DSceneProps) {
  // Divider fallback (used only if no template provided)
  const DEFAULT_TEMPLATE: MinimalTemplate = {
    id: "easy-7",
    targetTopology: [
      { id: "A", type: "terminal", connections: ["R1"], position: { x: 100, y: 200 } },
      { id: "R1", type: "component", connections: ["A", "J1"], position: { x: 200, y: 200 } },
      { id: "J1", type: "junction", connections: ["R1", "R2", "OUT"], position: { x: 300, y: 200 } },
      { id: "R2", type: "component", connections: ["J1", "B"], position: { x: 300, y: 300 } },
      { id: "OUT", type: "terminal", connections: ["J1"], position: { x: 400, y: 200 } },
      { id: "B", type: "terminal", connections: ["R2"], position: { x: 300, y: 400 } },
    ],
    disableAutoRotation: false,
  };
  const TPL = (template && template.targetTopology ? template : DEFAULT_TEMPLATE) as MinimalTemplate & { [k: string]: any };
  const mission = missionProp ?? getMissionForTemplate(template as any);
  const ALLOWED = mission?.allowedComponents ?? template?.requiredComponents?.map((r: any) => ({ type: r.type, maxCount: r.count })) ?? [];
  const MAX_COMPONENTS = mission?.constraints?.maxComponents ?? undefined;
  const MISSION_TITLE = mission?.title ?? (template as any)?.name ?? "Mission";
  const MISSION_DESC = mission?.description ?? (template as any)?.description ?? "";
  const [resistorValues, setResistorValues] = useState<{ [nodeId: string]: number }>({});

  const supplyVoltage = mission?.goal?.kind === 'voltage-threshold'
    ? (mission.goal.params as any).supply ?? 5
    : mission?.goal?.kind === 'led-current-target'
    ? (mission.goal.params as any).supply ?? 5
    : 5;
  const hasR1 = placedComponents['R1'] === 'R';
  const hasR2 = placedComponents['R2'] === 'R';
  // Store values in kilo-ohms (kΩ). Ratios are unitless, so Vout math is unchanged.
  const R1 = resistorValues['R1'] ?? 1; // kΩ
  const R2 = resistorValues['R2'] ?? 1; // kΩ
  const predictedVout = mission?.goal?.kind === 'voltage-threshold' && hasR1 && hasR2 ? (supplyVoltage * (R2 / (R1 + R2))) : null;

  const clampKiloOhms = (val: number) => {
    if (Number.isNaN(val) || !Number.isFinite(val)) return 1; // default 1 kΩ
    // Allow 0.001 kΩ (1 Ω) up to 1000 kΩ (1 MΩ)
    const clamped = Math.min(1000, Math.max(0.001, val));
    // Round to 3 decimals for stable input representation
    return Math.round(clamped * 1000) / 1000;
  };

  const setResValue = (nodeId: string, val: number) => {
    setResistorValues((prev) => {
      const next = { ...prev, [nodeId]: clampKiloOhms(val) };
      onResistorValuesChange?.(next);
      return next;
    });
  };

  const ensureDefaultResValue = (nodeId: string) => {
    setResistorValues((prev) => {
      if (prev[nodeId]) return prev;
      const next = { ...prev, [nodeId]: 1 };
      onResistorValuesChange?.(next);
      return next;
    }); // 1 kΩ
  };

  return (
    <div className="w-full h-full relative">
      <CircuitSchematic2DScene
        template={TPL as any}
        selectedComponentFromUI={selectedComponentFromUI}
        onComponentPlaced={(nodeId, type) => {
          // Enforce mission allowed components if provided
          if (ALLOWED && ALLOWED.length > 0 && type) {
            const allowedSet = new Set(ALLOWED.map((a: any) => a.type));
            if (!allowedSet.has(type)) return;
          }
          onComponentPlaced?.(nodeId, type);
          if (nodeId === 'R1' || nodeId === 'R2') ensureDefaultResValue(nodeId);
        }}
        placedComponents={placedComponents}
        onComponentRemoved={onComponentRemoved}
        isDarkMode={isDarkMode}
      />

      {/* Mission header (from mission/template) */}
      <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-md shadow ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      }`}>
        <div className="text-sm font-semibold text-center">{MISSION_TITLE}</div>
        <div className="text-xs opacity-80 text-center">{MISSION_DESC}</div>
      </div>

      {/* Allowed components (from mission) */}
      {/* <div className={`absolute top-4 right-4 px-3 py-2 rounded-md shadow ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      }`}>
        <div className="text-xs font-semibold mb-1">Allowed Components</div>
        <ul className="text-xs space-y-0.5">
          {ALLOWED.map((c: { type: string; maxCount?: number }) => (
            <li key={c.type} className="opacity-80">
              {c.type}
              {typeof c.maxCount === "number" ? ` × ${c.maxCount}` : ""}
            </li>
          ))}
        </ul>
        {typeof MAX_COMPONENTS === 'number' && (
          <div className="text-[11px] mt-1 opacity-70">Max total: {MAX_COMPONENTS}</div>
        )}
      </div> */}

  {/* Resistor value controls and predicted Vout (values in kΩ) — shown for voltage-threshold missions */}
      {/* {mission?.goal?.kind === 'voltage-threshold' && (
        <div className={`absolute right-4 top-28 px-3 py-2 rounded-md shadow ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}>
          <div className="text-xs font-semibold mb-1">Resistor Values (kΩ)</div>
          <div className="space-y-2">
            {hasR1 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="w-8">R1</span>
                <button className={`px-2 py-0.5 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`} onClick={() => setResValue('R1', (resistorValues['R1'] ?? 1) - 0.1)}>-0.1</button>
                <input
                  className={`w-24 px-2 py-1 rounded border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  type="number"
                  step={0.1}
                  min={0.001}
                  max={1000}
                  value={resistorValues['R1'] ?? 1}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setResValue('R1', parseFloat(e.target.value))}
                />
                <button className={`px-2 py-0.5 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`} onClick={() => setResValue('R1', (resistorValues['R1'] ?? 1) + 0.1)}>+0.1</button>
              </div>
            )}
            {hasR2 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="w-8">R2</span>
                <button className={`px-2 py-0.5 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`} onClick={() => setResValue('R2', (resistorValues['R2'] ?? 1) - 0.1)}>-0.1</button>
                <input
                  className={`w-24 px-2 py-1 rounded border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  type="number"
                  step={0.1}
                  min={0.001}
                  max={1000}
                  value={resistorValues['R2'] ?? 1}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setResValue('R2', parseFloat(e.target.value))}
                />
                <button className={`px-2 py-0.5 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`} onClick={() => setResValue('R2', (resistorValues['R2'] ?? 1) + 0.1)}>+0.1</button>
              </div>
            )}
          </div>
          <div className="mt-2 text-xs">
            <div className="opacity-70">Supply: {supplyVoltage}V</div>
            <div>
              Predicted Vout: {predictedVout !== null ? (
                <span className={`font-semibold ${predictedVout >= ((mission.goal.params as any).minVoltage ?? 0) ? 'text-green-600' : 'text-red-600'}`}>{predictedVout.toFixed(2)} V</span>
              ) : (
                <span className="opacity-60">—</span>
              )}
            </div>
          </div>
        </div>
      )} */}

      {/* LED current tuning controls (values in kΩ) — shown for led-current-target missions */}
      {/* {mission?.goal?.kind === 'led-current-target' && (
        <div className={`absolute right-4 top-28 px-3 py-2 rounded-md shadow ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}>
          <div className="text-xs font-semibold mb-1">LED Current Target</div>
          <div className="text-[11px] opacity-70 mb-2">Supply: {(mission.goal.params as any).supply ?? 5}V, Vf≈{(mission.goal.params as any).vf ?? 2.0}V</div>
          <div className="space-y-2">
            {hasR1 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="w-8">R1</span>
                <button className={`px-2 py-0.5 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`} onClick={() => setResValue('R1', (resistorValues['R1'] ?? 1) - 0.1)}>-0.1</button>
                <input
                  className={`w-24 px-2 py-1 rounded border ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                  type="number"
                  step={0.1}
                  min={0.001}
                  max={1000}
                  value={resistorValues['R1'] ?? 1}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setResValue('R1', parseFloat(e.target.value))}
                />
                <button className={`px-2 py-0.5 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`} onClick={() => setResValue('R1', (resistorValues['R1'] ?? 1) + 0.1)}>+0.1</button>
              </div>
            )}
          </div>
          <div className="mt-2 text-xs">
            {(() => {
              const Vs = (mission.goal.params as any).supply ?? 5;
              const Vf = (mission.goal.params as any).vf ?? 2.0;
              const Rk = resistorValues['R1'] ?? 1;
              const I_mA = Math.max(0, ((Vs - Vf) / (Rk * 1000)) * 1000);
              const target = (mission.goal.params as any).targetCurrent_mA ?? 10;
              const tol = (mission.goal.params as any).tolerance_mA ?? 2;
              const ok = Math.abs(I_mA - target) <= tol;
              return (
                <div>
                  Predicted I: <span className={ok ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{I_mA.toFixed(1)} mA</span>
                </div>
              );
            })()}
          </div>
        </div>
      )} */}
    </div>
  );
}
