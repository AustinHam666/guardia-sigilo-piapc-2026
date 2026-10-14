import { describe, expect, it } from "vitest";
import { createGridMap, type GridPoint } from "../../src/domain/model/grid";
import { createTerrainCost } from "../../src/domain/navigation/terrainCost";
import { calculateRoute } from "../../src/application/simulation/navigationDemo";
import { LAB_MAP, PATROL_POINTS } from "../../src/application/simulation/labLevel";

const S: GridPoint = { x: 0, y: 1 };
const G: GridPoint = { x: 4, y: 1 };
const FREE = createGridMap(5, 3, []);
const SLOW = createTerrainCost([
  { point: { x: 1, y: 1 }, cost: 5 },
  { point: { x: 2, y: 1 }, cost: 5 },
  { point: { x: 3, y: 1 }, cost: 5 },
]);

describe("A-AC3 — consumidor calculateRoute (application/simulation)", () => {
  it("usa el modo ponderado configurado y obtiene costo 6 con la franja", () => {
    const result = calculateRoute(FREE, S, G, "astar", { terrainCost: SLOW });
    expect(result.status).toBe("success");
    expect(result.algorithm).toBe("astar");
    expect(result.totalCost).toBe(6);
    expect(result.path.length - 1).toBe(6);
  });

  it("sin configuración conserva el modo unitario existente (4 pasos, costo 4)", () => {
    const result = calculateRoute(FREE, S, G, "astar");
    expect(result.totalCost).toBe(4);
    expect(result.path.length - 1).toBe(4);
  });

  it("BFS ignora la configuración ponderada y mantiene su contrato unitario", () => {
    const result = calculateRoute(FREE, S, G, "bfs", { terrainCost: SLOW });
    expect(result.algorithm).toBe("bfs");
    expect(result.totalCost).toBe(4);
  });

  it("regresión: las llamadas actuales del juego (sin opciones) no cambian", () => {
    PATROL_POINTS.forEach((from, i) => {
      const to = PATROL_POINTS[(i + 1) % PATROL_POINTS.length]!;
      const astar = calculateRoute(LAB_MAP, from, to, "astar");
      const bfs = calculateRoute(LAB_MAP, from, to, "bfs");
      expect(astar.status).toBe("success");
      expect(astar.totalCost).toBe(bfs.totalCost);
      expect(astar.totalCost).toBe(astar.path.length - 1);
    });
  });
});
