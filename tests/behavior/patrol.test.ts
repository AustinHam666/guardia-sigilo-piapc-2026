import { describe, expect, it } from "vitest";
import { beginPause, initialPatrolState, nextPatrolIndex, tickPause } from "../../src/domain/behavior/patrol";

const config = { pauseMs: 1000, lookSweepRadians: Math.PI / 4 };

describe("patrol with pauses", () => {
  it("cycles patrol points", () => {
    expect(nextPatrolIndex(0, 3)).toBe(1);
    expect(nextPatrolIndex(2, 3)).toBe(0);
  });

  it("sweeps the gaze during a pause and keeps the guard paused", () => {
    const paused = beginPause(initialPatrolState({ x: 1, y: 0 }), { x: 1, y: 0 });
    const quarter = tickPause(paused, 250, 3, config);
    expect(quarter.pauseFinished).toBe(false);
    expect(quarter.state.phase).toBe("paused");
    expect(Math.atan2(quarter.facing.y, quarter.facing.x)).toBeCloseTo(Math.PI / 4);
    const threeQuarters = tickPause(quarter.state, 500, 3, config);
    expect(Math.atan2(threeQuarters.facing.y, threeQuarters.facing.x)).toBeCloseTo(-Math.PI / 4);
  });

  it("ends the pause facing the arrival direction and advances to the next point", () => {
    const paused = beginPause(initialPatrolState({ x: 0, y: 1 }), { x: 0, y: 1 });
    const done = tickPause(paused, 1000, 3, config);
    expect(done.pauseFinished).toBe(true);
    expect(done.state.phase).toBe("moving");
    expect(done.state.pointIndex).toBe(1);
    expect(done.facing).toEqual({ x: 0, y: 1 });
  });

  it("edge case: a single huge delta finishes the pause exactly once", () => {
    const paused = beginPause(initialPatrolState({ x: 1, y: 0 }), { x: 1, y: 0 });
    const done = tickPause(paused, 10_000, 1, config);
    expect(done.state.pointIndex).toBe(0);
    const again = tickPause(done.state, 10_000, 1, config);
    expect(again.pauseFinished).toBe(false);
  });

  it("rejects invalid configuration", () => {
    const paused = beginPause(initialPatrolState({ x: 1, y: 0 }), { x: 1, y: 0 });
    expect(() => tickPause(paused, 10, 3, { pauseMs: 0, lookSweepRadians: 1 })).toThrow();
    expect(() => nextPatrolIndex(0, 0)).toThrow();
  });
});
