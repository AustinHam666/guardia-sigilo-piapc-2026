import { describe, expect, it } from "vitest";
import { createGridMap, isWalkable, type GridPoint } from "../../src/domain/model/grid";
import { findPathAStar, findPathBfs } from "../../src/domain/navigation/search";
import { createTerrainCost, type EnterCostFn, type TerrainCell } from "../../src/domain/navigation/terrainCost";

// Anexo A: fixture BASE con costo de entrada 5 en (1,1), (2,1), (3,1).
const S: GridPoint = { x: 0, y: 1 };
const G: GridPoint = { x: 4, y: 1 };
const FREE = createGridMap(5, 3, []);
const SLOW_STRIP: TerrainCell[] = [
  { point: { x: 1, y: 1 }, cost: 5 },
  { point: { x: 2, y: 1 }, cost: 5 },
  { point: { x: 3, y: 1 }, cost: 5 },
];
const DIRECT: GridPoint[] = [S, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, G];

function pathCost(path: readonly GridPoint[], cost: EnterCostFn): number {
  return path.slice(1).reduce((sum, p) => sum + cost(p), 0);
}

function isCardinal(path: readonly GridPoint[]): boolean {
  return path.slice(1).every((p, i) => Math.abs(p.x - path[i]!.x) + Math.abs(p.y - path[i]!.y) === 1);
}

describe("Anexo A — terreno lento (dominio)", () => {
  const slow = createTerrainCost(SLOW_STRIP);

  it("A-AC1: la ruta directa cuesta 16 (=5+5+5+1) con 4 pasos", () => {
    expect(DIRECT.length - 1).toBe(4);
    expect(pathCost(DIRECT, slow)).toBe(16);
  });

  it("A-AC1: A* ponderado devuelve un rodeo válido de 6 pasos y costo 6", () => {
    const result = findPathAStar(FREE, S, G, slow);
    console.info("[anexoA] A* franja", JSON.stringify({
      status: result.status,
      path: result.path.map((p) => `(${p.x},${p.y})`).join("-"),
      steps: result.path.length - 1,
      totalCost: result.totalCost,
      expandedNodes: result.expandedNodes,
      maximumFrontier: result.maximumFrontier,
    }));
    expect(result.status).toBe("success");
    expect(result.path.length - 1).toBe(6);
    expect(result.totalCost).toBe(6);
    expect(pathCost(result.path, slow)).toBe(result.totalCost);
    expect(isCardinal(result.path)).toBe(true);
    expect(result.path.every((p) => isWalkable(FREE, p))).toBe(true);
    expect(result.path.slice(1, -1).some((p) => p.y === 1 && p.x >= 1 && p.x <= 3)).toBe(false);
    // Rodeo superior o inferior: no se exige uno en particular.
    expect([0, 2]).toContain(result.path[1]!.y === 1 ? result.path[2]!.y : result.path[1]!.y);
  });

  it("A-01: BFS conserva su semántica unitaria y no es oráculo del mínimo ponderado", () => {
    const bfs = findPathBfs(FREE, S, G);
    expect(bfs.totalCost).toBe(4);
    expect(bfs.path).toEqual(DIRECT);
    expect(pathCost(bfs.path, slow)).toBe(16);
  });

  it("A-AC2 / A-04: sin franja lenta (costo 1) vuelve a 4 pasos y costo 4", () => {
    const restored = createTerrainCost(SLOW_STRIP.map((c) => ({ ...c, cost: 1 })));
    const result = findPathAStar(FREE, S, G, restored);
    expect(result.path.length - 1).toBe(4);
    expect(result.totalCost).toBe(4);
    expect(findPathAStar(FREE, S, G).totalCost).toBe(4);
  });

  it("A-04: la función de costo copia los datos y no arrastra costos anteriores", () => {
    const cells = SLOW_STRIP.map((c) => ({ ...c }));
    const before = createTerrainCost(cells);
    cells.length = 0;
    expect(findPathAStar(FREE, S, G, before).totalCost).toBe(6);
    expect(findPathAStar(FREE, S, G, createTerrainCost(cells)).totalCost).toBe(4);
  });

  it("límite: inicio=meta con franja es éxito de costo 0; barrera sigue inaccesible", () => {
    expect(findPathAStar(FREE, S, S, slow).totalCost).toBe(0);
    const barrier = createGridMap(5, 3, [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }]);
    expect(findPathAStar(barrier, S, G, slow).status).toBe("unreachable");
  });

  it("límite: rechaza costos < 1 o no finitos (protege la admisibilidad de Manhattan)", () => {
    expect(() => createTerrainCost([{ point: S, cost: 0.5 }])).toThrow();
    expect(() => createTerrainCost([], Number.NaN)).toThrow();
    expect(() => findPathAStar(FREE, S, G, () => 0)).toThrow();
  });
});
