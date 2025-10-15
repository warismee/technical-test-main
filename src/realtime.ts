import { useCallback, useEffect, useMemo } from 'react';
import { useCollabSpace, getUserId, generateNewUserId } from '@mexty/realtime';

// Shape of the collaborative document we keep in Yjs via useCollabSpace
export interface RealtimeState {
  // Persisted global game score (aggregate for this room)
  sharedScore: number;
  // Persisted global questions stats (aggregate for this room)
  sharedQuestionsAnswered: number;
  sharedQuestionsCorrect: number;
  // Current active mission shared across players
  missionId: string | null;
  // Placed components: nodeId -> component type
  placed: Record<string, string>;
  // Mission component adjustable values (e.g. resistor values)
  missionValues: Record<string, number>;
  // Hint usage metadata shared across room
  hintMeta: {
    count: number;
    lastPenaltyPercent: number;
    lastAt: number;
  };
  // Track per-user presence & personal stats
  presence: Record<string, {
    name: string;
    color: string;
    lastActive: number;
    personalScore: number; // each user local score reported to others
  }>;
  // Optionally track how many missions completed globally
  missionsCompleted: number;
  // Shared validation/summary dialog payload (null when closed)
  questionSummary: {
    isValid: boolean;
    score: number;
    errors: string[];
    totalScore: number;
    questionsCorrect: number;
    questionsAnswered: number;
    at: number;
    by: string;
  } | null;
}

export interface PeerPresence {
  id: string;
  name: string;
  color: string;
  lastActive: number;
  personalScore: number;
}

const randomColor = () => '#' + Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0');
const randomName = () => 'User-' + Math.random().toString(36).slice(2,6);

export interface UseRealtimeOptions {
  roomId: string;
  initialScore?: number;
}

/**
 * useRealtimeGame
 * Wraps useCollabSpace to provide:
 * 1. Shared aggregate score (sharedScore)
 * 2. Per-user presence with color/name/lastActive/personalScore
 * 3. Helper methods for updating scores & presence
 */
export function useRealtimeGame({ roomId, initialScore = 0 }: UseRealtimeOptions) {
  // SDK persist / reuse user id across sessions; fall back if absent
  let uid = getUserId();
  if (!uid) {
    uid = generateNewUserId();
  }

  const initialState: RealtimeState = {
    sharedScore: initialScore,
  sharedQuestionsAnswered: 0,
  sharedQuestionsCorrect: 0,
  missionId: null,
  placed: {},
  missionValues: {},
  hintMeta: { count: 0, lastPenaltyPercent: 0, lastAt: 0 },
    missionsCompleted: 0,
  questionSummary: null,
    presence: {
      [uid]: {
        name: randomName(),
        color: randomColor(),
        lastActive: Date.now(),
        personalScore: 0,
      }
    }
  };

  const { state, update, isConnected, connectionStatus, userId } = useCollabSpace<RealtimeState>(roomId, initialState, {});

  // Ensure our presence entry exists (first connect or document created by someone else)
  useEffect(() => {
    if (!state.presence[userId]) {
      update(prev => ({
        presence: {
          ...prev.presence,
          [userId]: {
            name: randomName(),
            color: randomColor(),
            lastActive: Date.now(),
            personalScore: 0,
          }
        }
      }));
    }
  }, [state.presence, userId, update]);

  // Heartbeat to update our lastActive timestamp
  useEffect(() => {
    const interval = setInterval(() => {
      update(prev => ({
        presence: {
          ...prev.presence,
          [userId]: {
            ...(prev.presence[userId] || { name: randomName(), color: randomColor(), personalScore: 0 }),
            lastActive: Date.now(),
          }
        }
      }));
    }, 15000);
    return () => clearInterval(interval);
  }, [userId, update]);

  const adjustSharedScore = useCallback((delta: number) => {
    update(prev => ({
      sharedScore: prev.sharedScore + delta,
      presence: { ...prev.presence }
    }));
  }, [update]);

  const incrementSharedQuestionsAnswered = useCallback(() => {
    update(prev => ({
      sharedQuestionsAnswered: prev.sharedQuestionsAnswered + 1
    }));
  }, [update]);

  const incrementSharedQuestionsCorrect = useCallback(() => {
    update(prev => ({
      sharedQuestionsCorrect: prev.sharedQuestionsCorrect + 1
    }));
  }, [update]);

  const setPersonalScore = useCallback((newScore: number) => {
    update(prev => ({
      presence: {
        ...prev.presence,
        [userId]: {
          ...(prev.presence[userId] || { name: randomName(), color: randomColor(), lastActive: Date.now(), personalScore: 0 }),
          personalScore: newScore,
          lastActive: Date.now(),
        }
      }
    }));
  }, [userId, update]);

  const incrementMissionsCompleted = useCallback(() => {
    update(prev => ({
      missionsCompleted: prev.missionsCompleted + 1,
      presence: { ...prev.presence }
    }));
  }, [update]);

  // Set or change the active mission id
  const setMissionId = useCallback((id: string | null) => {
    update(() => ({ missionId: id }));
  }, [update]);

  // Overwrite all placements (used on full reset)
  const setPlaced = useCallback((placed: Record<string, string>) => {
    update(() => ({ placed }));
  }, [update]);

  // Patch a single placement
  const patchPlaced = useCallback((nodeId: string, componentType: string | null) => {
    update(prev => {
      const next = { ...prev.placed };
      if (componentType) next[nodeId] = componentType; else delete next[nodeId];
      return { placed: next } as Partial<RealtimeState>;
    });
  }, [update]);

  // Replace mission values wholesale
  const setMissionValues = useCallback((vals: Record<string, number>) => {
    update(() => ({ missionValues: vals }));
  }, [update]);

  // Patch a single mission value
  const patchMissionValue = useCallback((key: string, value: number) => {
    update(prev => ({ missionValues: { ...prev.missionValues, [key]: value } }));
  }, [update]);

  // Apply a hint penalty (percent in 0..1). Adjust sharedScore and record metadata.
  const applyHintPenalty = useCallback((penaltyPercent: number) => {
    if (penaltyPercent <= 0 || penaltyPercent >= 1) return;
    update(prev => {
      // Idempotency: only allow one hint usage per room
      if (prev.hintMeta && prev.hintMeta.count >= 1) {
        return {} as Partial<RealtimeState>;
      }
      const deduction = Math.round(prev.sharedScore * penaltyPercent);
      return {
        sharedScore: Math.max(0, prev.sharedScore - deduction),
        hintMeta: {
          count: prev.hintMeta.count + 1,
          lastPenaltyPercent: penaltyPercent,
          lastAt: Date.now(),
        }
      } as Partial<RealtimeState>;
    });
  }, [update]);

  // Reset hint usage (per-mission reset)
  const resetHintMeta = useCallback(() => {
    update(() => ({
      hintMeta: { count: 0, lastPenaltyPercent: 0, lastAt: 0 }
    }));
  }, [update]);

  const updatePresence = useCallback((patch: Partial<PeerPresence>) => {
    update(prev => ({
      presence: {
        ...prev.presence,
        [userId]: {
          ...(prev.presence[userId] || { name: randomName(), color: randomColor(), lastActive: Date.now(), personalScore: 0 }),
          ...patch,
          lastActive: Date.now(),
        }
      }
    }));
  }, [userId, update]);

  // Publish a shared question summary (opens modal for all)
  const publishQuestionSummary = useCallback((payload: {
    isValid: boolean;
    score: number;
    errors: string[];
    totalScore: number;
    questionsCorrect: number;
    questionsAnswered: number;
  }) => {
    update(() => ({
      questionSummary: {
        ...payload,
        at: Date.now(),
        by: userId,
      }
    }));
  }, [update, userId]);

  // Clear shared question summary (closes modal for all)
  const clearQuestionSummary = useCallback(() => {
    update(() => ({ questionSummary: null }));
  }, [update]);

  const peers: PeerPresence[] = useMemo(() => Object.entries(state.presence).map(([id, p]) => ({
    id,
    name: p.name,
    color: p.color,
    lastActive: p.lastActive,
    personalScore: p.personalScore,
  })), [state.presence]);

  return {
    isConnected,
    connectionStatus,
    userId,
    peers,
    sharedScore: state.sharedScore,
  sharedQuestionsAnswered: state.sharedQuestionsAnswered,
  sharedQuestionsCorrect: state.sharedQuestionsCorrect,
  missionId: state.missionId,
  placed: state.placed,
  missionValues: state.missionValues,
  hintMeta: state.hintMeta,
  questionSummary: state.questionSummary,
    missionsCompleted: state.missionsCompleted,
    adjustSharedScore,
    incrementSharedQuestionsAnswered,
    incrementSharedQuestionsCorrect,
    setPersonalScore,
    incrementMissionsCompleted,
    updatePresence,
  setMissionId,
  setPlaced,
  patchPlaced,
  setMissionValues,
  patchMissionValue,
  applyHintPenalty,
  resetHintMeta,
  publishQuestionSummary,
  clearQuestionSummary,
  };
}
