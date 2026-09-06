import assert from "node:assert/strict";
import test from "node:test";
import { compassHeading, FlightInputs, formatMetres, updateAttitude, yawToTarget } from "../flight-model.mjs";

test("HUD metre labels do not imply fractional DEM accuracy or overflow with decimals", () => {
  assert.equal(formatMetres(355.6802834888125), "356m");
  assert.equal(formatMetres(652.6421823892934), "653m");
  assert.equal(formatMetres(NaN), "—");
  assert.equal(formatMetres(Infinity), "—");
});

test("targets use the same yaw convention as Three.js forward -Z", () => {
  const origin = { x: 0, z: 0 };
  for (const [target, heading] of [
    [{ x: 0, z: -10 }, 0], [{ x: 10, z: 0 }, 90],
    [{ x: 0, z: 10 }, 180], [{ x: -10, z: 0 }, 270],
  ]) {
    const yaw = yawToTarget(origin, target);
    assert.equal(compassHeading(yaw), heading);
    // Actual rotated forward vector; it must point toward the target.
    assert.ok(-Math.sin(yaw) * target.x - Math.cos(yaw) * target.z > 9.99);
  }
});

test("both banking and rudder turn in their named direction at 20/60/120 Hz", () => {
  for (const hz of [20, 60, 120]) {
    for (const [control, direction] of [["bankRight", 1], ["yawRight", 1], ["bankLeft", -1], ["yawLeft", -1]]) {
      const controls = new FlightInputs();
      controls.set(control, "test", true);
      const state = { yaw: 0, pitch: 0, roll: 0 };
      for (let i = 0; i < hz; i++) updateAttitude(state, controls.state, 1 / hz, 0, false);
      assert.ok(Math.sign(-state.yaw) === direction, `${control} at ${hz} Hz`);
      assert.ok(Math.sign(-state.roll) === direction, `${control} bank appearance`);
      assert.ok(Math.abs(state.yaw) > 0.6);
    }
  }
});

test("neutral and LEVEL stabilize at a genuinely level attitude", () => {
  const controls = new FlightInputs();
  const neutral = { yaw: 0, pitch: 0, roll: 0 };
  updateAttitude(neutral, controls.state, 1, 0, false);
  assert.equal(neutral.pitch, 0, "unattended flight should not descend");
  controls.set("level", "test", true);
  const banked = { yaw: 0.4, pitch: -0.4, roll: 0.5 };
  for (let i = 0; i < 180; i++) updateAttitude(banked, controls.state, 1 / 60, 0, true);
  assert.ok(Math.abs(banked.pitch) < 0.001);
  assert.ok(Math.abs(banked.roll) < 0.001);
  assert.equal(banked.yaw, 0.4);
});

test("independent keys and fingers do not release each other's inputs", () => {
  const controls = new FlightInputs();
  controls.set("pitchUp", "KeyW", true);
  controls.set("pitchUp", "ArrowUp", true);
  controls.set("pitchUp", "finger:1", true);
  controls.set("pitchUp", "KeyW", false);
  controls.set("pitchUp", "finger:1", false);
  assert.equal(controls.state.pitchUp, true);
  controls.set("pitchUp", "ArrowUp", false);
  assert.equal(controls.state.pitchUp, false);
  controls.set("boost", "ShiftRight", true);
  controls.clear();
  assert.ok(Object.values(controls.state).every((value) => !value));
});
