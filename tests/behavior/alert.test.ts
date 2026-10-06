import { describe, expect, it } from "vitest";
import { initialAlertState, updateAlert, type AlertState } from "../../src/domain/behavior/alert";

const seen = (deltaMs: number, distance = 200) => ({ visible: true, distance, range: 220, deltaMs });
const hidden = (deltaMs: number) => ({ visible: false, distance: 500, range: 220, deltaMs });

function run(state: AlertState, inputs: ReturnType<typeof seen>[]) {
  const events: string[] = [];
  for (const input of inputs) {
    const update = updateAlert(state, input);
    state = update.state;
    events.push(...update.events);
  }
  return { state, events };
}

describe("alert meter", () => {
  it("rises while the player is visible and falls when hidden", () => {
    const up = run(initialAlertState(), [seen(500)]);
    expect(up.state.level).toBeGreaterThan(0);
    const down = run(up.state, [hidden(500)]);
    expect(down.state.level).toBeLessThan(up.state.level);
  });

  it("rises faster when the player is closer", () => {
    const far = updateAlert(initialAlertState(), seen(200, 210)).state.level;
    const near = updateAlert(initialAlertState(), seen(200, 20)).state.level;
    expect(near).toBeGreaterThan(far);
  });

  it("goes calma -> sospecha -> alerta and emits alerta-iniciada exactly once", () => {
    const result = run(initialAlertState(), Array.from({ length: 40 }, () => seen(100, 50)));
    expect(result.state.status).toBe("alerta");
    expect(result.events.filter((e) => e === "alerta-iniciada")).toHaveLength(1);
    expect(result.events.filter((e) => e === "estado-cambiado")).toHaveLength(2);
  });

  it("uses hysteresis: alerta only leaves after dropping to the exit threshold", () => {
    const alerted = run(initialAlertState(), Array.from({ length: 40 }, () => seen(100, 50))).state;
    expect(updateAlert(alerted, hidden(500)).state.status).toBe("alerta");
    expect(run(alerted, [hidden(2000)]).state.status).toBe("sospecha");
  });

  it("emits escape when vision is lost after a near miss", () => {
    let state = initialAlertState();
    while (state.level < 0.8) {
      state = updateAlert(state, seen(50, 50)).state;
    }
    expect(state.status).toBe("sospecha");
    expect(updateAlert(state, hidden(16)).events).toContain("escape");
  });

  it("edge case: no escape for a short exposure or after full alert", () => {
    const brief = updateAlert(initialAlertState(), seen(100));
    expect(updateAlert(brief.state, hidden(16)).events).not.toContain("escape");
    const alerted = run(initialAlertState(), Array.from({ length: 40 }, () => seen(100, 50))).state;
    expect(updateAlert(alerted, hidden(16)).events).not.toContain("escape");
  });

  it("rejects invalid input", () => {
    expect(() => updateAlert(initialAlertState(), { visible: true, distance: 1, range: 0, deltaMs: 1 })).toThrow();
  });
});
