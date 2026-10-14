import { describe, expect, it } from "vitest";
import { createGridMap, isWalkable, type GridPoint } from "../../src/domain/model/grid";
import { findPathAStar, findPathBfs } from "../../src/domain/navigation/search";

// Fixture común de la práctica de navegación (BASE-02/04): 5x3, cuatro vecinos, costo 1.
const S: GridPoint = { x: 0, y: 1 };
const G: GridPoint = { x: 4, y: 1 };
const FREE = createGridMap(5, 3, []);
const BARRIER = createGridMap(5, 3, [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }]);

function isCardinal(path: readonly GridPoint[]): boolean {
  return path.slice(1).every((p, i) => {
    const prev = path[i]!;
    return Math.abs(p.x - prev.x) + Math.abs(p.y - prev.y) === 1;
  });
}

describe.each([
  ["BFS", findPathBfs],
  ["A*", findPathAStar],
] as const)("fixture común — %s", (_name, findPath) => {
  it("BASE-AC2: mapa libre da ruta cardinal de 4 pasos y costo 4", () => {
    const result = findPath(FREE, S, G);
    console.info(`[fixture] ${_name} libre`, JSON.stringify({
      status: result.status,
      path: result.path.map((p) => `(${p.x},${p.y})`).join("-"),
      steps: result.path.length - 1,
      totalCost: result.totalCost,
      expandedNodes: result.expandedNodes,
      maximumFrontier: result.maximumFrontier,
    }));
    expect(result.status).toBe("success");
    expect(result.path[0]).toEqual(S);
    expect(result.path.at(-1)).toEqual(G);
    expect(result.path.length - 1).toBe(4);
    expect(result.totalCost).toBe(4);
    expect(isCardinal(result.path)).toBe(true);
    expect(result.path.every((p) => isWalkable(FREE, p))).toBe(true);
  });

  it("BASE-AC3: inicio igual a meta es éxito con costo 0", () => {
    const result = findPath(FREE, S, S);
    expect(result.status).toBe("success");
    expect(result.path).toEqual([S]);
    expect(result.totalCost).toBe(0);
  });

  it("BASE-AC3: barrera completa en x=2 es inaccesible (meta libre)", () => {
    expect(isWalkable(BARRIER, G)).toBe(true);
    const result = findPath(BARRIER, S, G);
    expect(result.status).toBe("unreachable");
    expect(result.path).toEqual([]);
    expect(result.totalCost).toBeNull();
  });

  it("BASE-AC3: extremos fuera del mapa son inválidos y distintos de inaccesible", () => {
    const badStart = findPath(FREE, { x: -1, y: 1 }, G);
    const badGoal = findPath(FREE, S, { x: 5, y: 1 });
    expect(badStart.status).toBe("invalid-start");
    expect(badGoal.status).toBe("invalid-goal");
    expect(badStart.expandedNodes).toBe(0);
    expect(badGoal.expandedNodes).toBe(0);
  });
});
