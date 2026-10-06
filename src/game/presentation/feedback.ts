import type { AlertStatus } from "../../domain/behavior/alert";

export interface ConeStyle {
  readonly color: number;
  readonly alpha: number;
}

const STATUS_COLORS: Readonly<Record<AlertStatus, number>> = {
  calma: 0x6b8afd,
  sospecha: 0xe5b454,
  alerta: 0xe16969,
};

/** Pure presentation mapping: cone colour follows alert status, opacity reacts to visibility. */
export function coneStyle(status: AlertStatus, playerVisible: boolean): ConeStyle {
  return { color: STATUS_COLORS[status], alpha: playerVisible ? 0.32 : 0.16 };
}

export const ALERT_IMPACT = {
  shakeDurationMs: 350,
  shakeIntensity: 0.012,
  flashDurationMs: 250,
} as const;

export const ESCAPE_FEEDBACK = {
  flashDurationMs: 300,
  labelDurationMs: 900,
} as const;

export function alertMeterLabel(level: number, status: AlertStatus): string {
  const filled = Math.round(Math.min(1, Math.max(0, level)) * 10);
  return `alerta [${"#".repeat(filled)}${".".repeat(10 - filled)}] ${status.toUpperCase()}`;
}
