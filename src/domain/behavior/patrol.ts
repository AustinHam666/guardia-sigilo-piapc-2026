import { assertFiniteVector, normalized, type Vector2 } from "../model/vector";

export type PatrolPhase = "moving" | "paused";

export interface PatrolConfig {
  readonly pauseMs: number;
  readonly lookSweepRadians: number;
}

export interface PatrolState {
  readonly pointIndex: number;
  readonly phase: PatrolPhase;
  readonly pausedForMs: number;
  readonly arrivalFacing: Vector2;
}

export interface PatrolPauseResult {
  readonly state: PatrolState;
  readonly facing: Vector2;
  readonly pauseFinished: boolean;
}

function assertConfig(config: PatrolConfig): void {
  if (!Number.isFinite(config.pauseMs) || config.pauseMs <= 0) {
    throw new Error("Patrol pause must be positive and finite.");
  }
  if (!Number.isFinite(config.lookSweepRadians) || config.lookSweepRadians < 0) {
    throw new Error("Look sweep must be finite and non-negative.");
  }
}

export function initialPatrolState(facing: Vector2): PatrolState {
  assertFiniteVector(facing);
  return { pointIndex: 0, phase: "moving", pausedForMs: 0, arrivalFacing: { ...facing } };
}

export function nextPatrolIndex(index: number, pointCount: number): number {
  if (!Number.isInteger(pointCount) || pointCount <= 0) {
    throw new Error("Patrol needs at least one point.");
  }
  return (index + 1) % pointCount;
}

export function beginPause(state: PatrolState, arrivalFacing: Vector2): PatrolState {
  assertFiniteVector(arrivalFacing);
  return { ...state, phase: "paused", pausedForMs: 0, arrivalFacing: { ...arrivalFacing } };
}

/**
 * Advances a patrol pause. While paused the guard sweeps its gaze left and right
 * around the arrival direction (one full sine cycle) and ends facing it again.
 */
export function tickPause(
  state: PatrolState,
  deltaMs: number,
  pointCount: number,
  config: PatrolConfig,
): PatrolPauseResult {
  assertConfig(config);
  if (!Number.isFinite(deltaMs) || deltaMs < 0) {
    throw new Error("Delta must be finite and non-negative.");
  }
  if (state.phase !== "paused") {
    return { state, facing: state.arrivalFacing, pauseFinished: false };
  }

  const elapsed = state.pausedForMs + deltaMs;
  if (elapsed >= config.pauseMs) {
    return {
      state: {
        ...state,
        phase: "moving",
        pausedForMs: 0,
        pointIndex: nextPatrolIndex(state.pointIndex, pointCount),
      },
      facing: state.arrivalFacing,
      pauseFinished: true,
    };
  }

  const base = normalized(state.arrivalFacing) ?? { x: 1, y: 0 };
  const angle = Math.atan2(base.y, base.x)
    + config.lookSweepRadians * Math.sin((2 * Math.PI * elapsed) / config.pauseMs);
  return {
    state: { ...state, pausedForMs: elapsed },
    facing: { x: Math.cos(angle), y: Math.sin(angle) },
    pauseFinished: false,
  };
}
