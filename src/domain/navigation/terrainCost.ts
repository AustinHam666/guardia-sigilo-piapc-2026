import { cellKey, type GridPoint } from "../model/grid";

/** Costo de ENTRAR en una celda. Debe ser finito y >= 1 para que Manhattan siga siendo admisible. */
export type EnterCostFn = (point: GridPoint) => number;

export interface TerrainCell {
  readonly point: GridPoint;
  readonly cost: number;
}

export const MINIMUM_ENTER_COST = 1;

export function unitEnterCost(): number {
  return 1;
}

export function assertValidEnterCost(cost: number): void {
  if (!Number.isFinite(cost) || cost < MINIMUM_ENTER_COST) {
    throw new Error(`Enter cost must be finite and >= ${MINIMUM_ENTER_COST}.`);
  }
}

/**
 * Construye una función de costo a partir de celdas explícitas. Las celdas no
 * listadas cuestan `defaultCost`. Copia los datos: cambios posteriores del arreglo
 * de entrada no alteran una función ya creada (A-04).
 */
export function createTerrainCost(
  cells: readonly TerrainCell[],
  defaultCost = MINIMUM_ENTER_COST,
): EnterCostFn {
  assertValidEnterCost(defaultCost);
  const costs = new Map<string, number>();
  for (const cell of cells) {
    assertValidEnterCost(cell.cost);
    costs.set(cellKey(cell.point), cell.cost);
  }
  return (point) => costs.get(cellKey(point)) ?? defaultCost;
}
