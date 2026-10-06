import { describe, expect, it } from "vitest";
import { ALERT_IMPACT, alertMeterLabel, coneStyle } from "../../src/game/presentation/feedback";

describe("feedback presentation", () => {
  it("colours the cone by alert status and raises opacity when the player is seen", () => {
    expect(coneStyle("calma", false).color).not.toBe(coneStyle("sospecha", false).color);
    expect(coneStyle("sospecha", false).color).not.toBe(coneStyle("alerta", false).color);
    expect(coneStyle("calma", true).alpha).toBeGreaterThan(coneStyle("calma", false).alpha);
  });

  it("keeps the alert impact under one second", () => {
    expect(ALERT_IMPACT.shakeDurationMs).toBeLessThan(1000);
    expect(ALERT_IMPACT.flashDurationMs).toBeLessThan(1000);
  });

  it("renders a clamped meter", () => {
    expect(alertMeterLabel(0.5, "sospecha")).toBe("alerta [#####.....] SOSPECHA");
    expect(alertMeterLabel(2, "alerta")).toBe("alerta [##########] ALERTA");
  });
});
