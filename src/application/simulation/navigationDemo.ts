import type { GridMap, GridPoint } from "../../domain/model/grid";
import {
  findPathAStar,
  findPathBfs,
  type SearchAlgorithm,
  type SearchResult,
} from "../../domain/navigation/search";
import type { EnterCostFn } from "../../domain/navigation/terrainCost";

export interface RouteOptions {
  /**
   * Costo de entrada por celda para el modo ponderado. Sólo lo usa A*.
   * BFS conserva su contrato unitario y lo ignora explícitamente.
   */
  readonly terrainCost?: EnterCostFn;
}

export function calculateRoute(
  map: GridMap,
  start: GridPoint,
  goal: GridPoint,
  algorithm: SearchAlgorithm,
  options: RouteOptions = {},
): SearchResult {
  return algorithm === "astar"
    ? findPathAStar(map, start, goal, options.terrainCost)
    : findPathBfs(map, start, goal);
}
