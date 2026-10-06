import { describe, expect, it } from "vitest";
import { LAB_MAP, PATROL_POINTS } from "../../src/application/simulation/labLevel";
import { calculateRoute } from "../../src/application/simulation/navigationDemo";

describe("patrol points in the lab level", () => {
  it("every consecutive patrol leg is reachable with A*", () => {
    PATROL_POINTS.forEach((from, index) => {
      const to = PATROL_POINTS[(index + 1) % PATROL_POINTS.length]!;
      expect(calculateRoute(LAB_MAP, from, to, "astar").status).toBe("success");
    });
  });
});
