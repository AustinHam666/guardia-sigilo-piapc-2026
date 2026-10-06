export type AlertStatus = "calma" | "sospecha" | "alerta";
export type AlertEvent = "alerta-iniciada" | "escape" | "estado-cambiado";

export interface AlertConfig {
  readonly riseBasePerSecond: number;
  readonly riseProximityPerSecond: number;
  readonly decayPerSecond: number;
  readonly suspicionThreshold: number;
  readonly calmThreshold: number;
  readonly alertExitThreshold: number;
  readonly escapeThreshold: number;
}

export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  riseBasePerSecond: 0.5,
  riseProximityPerSecond: 1.2,
  decayPerSecond: 0.3,
  suspicionThreshold: 0.3,
  calmThreshold: 0.15,
  alertExitThreshold: 0.5,
  escapeThreshold: 0.75,
};

export interface AlertState {
  readonly level: number;
  readonly status: AlertStatus;
  readonly wasVisible: boolean;
  readonly peakWhileVisible: number;
}

export interface AlertInput {
  readonly visible: boolean;
  readonly distance: number;
  readonly range: number;
  readonly deltaMs: number;
}

export interface AlertUpdate {
  readonly state: AlertState;
  readonly events: readonly AlertEvent[];
}

export function initialAlertState(): AlertState {
  return { level: 0, status: "calma", wasVisible: false, peakWhileVisible: 0 };
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function nextStatus(current: AlertStatus, level: number, config: AlertConfig): AlertStatus {
  if (level >= 1) {
    return "alerta";
  }
  if (current === "alerta") {
    return level <= config.alertExitThreshold ? "sospecha" : "alerta";
  }
  if (level >= config.suspicionThreshold) {
    return "sospecha";
  }
  if (current === "sospecha" && level > config.calmThreshold) {
    return "sospecha";
  }
  return "calma";
}

export function updateAlert(
  state: AlertState,
  input: AlertInput,
  config: AlertConfig = DEFAULT_ALERT_CONFIG,
): AlertUpdate {
  if (!Number.isFinite(input.deltaMs) || input.deltaMs < 0) {
    throw new Error("Delta must be finite and non-negative.");
  }
  if (!Number.isFinite(input.range) || input.range <= 0 || !Number.isFinite(input.distance)) {
    throw new Error("Alert distance and range must be finite; range must be positive.");
  }

  const seconds = input.deltaMs / 1000;
  const proximity = clamp01(1 - input.distance / input.range);
  const level = input.visible
    ? clamp01(state.level + (config.riseBasePerSecond + config.riseProximityPerSecond * proximity) * seconds)
    : clamp01(state.level - config.decayPerSecond * seconds);
  const status = nextStatus(state.status, level, config);
  const events: AlertEvent[] = [];

  if (status !== state.status) {
    events.push("estado-cambiado");
  }
  if (status === "alerta" && state.status !== "alerta") {
    events.push("alerta-iniciada");
  }

  const peakWhileVisible = input.visible
    ? Math.max(state.wasVisible ? state.peakWhileVisible : 0, level)
    : state.peakWhileVisible;
  if (
    state.wasVisible
    && !input.visible
    && status !== "alerta"
    && state.status !== "alerta"
    && peakWhileVisible >= config.escapeThreshold
  ) {
    events.push("escape");
  }

  return {
    state: { level, status, wasVisible: input.visible, peakWhileVisible },
    events,
  };
}
