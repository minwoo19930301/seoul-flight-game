// Three.js looks along -Z: positive Euler yaw turns left, while compass
// bearings increase to the right. Keep that conversion in one place.
export function yawToTarget(position, target) {
  return -Math.atan2(target.x - position.x, -(target.z - position.z));
}

export function compassHeading(yaw) {
  return ((-yaw * 180 / Math.PI) % 360 + 360) % 360;
}

function damp(current, target, rate, delta) {
  return target + (current - target) * Math.exp(-rate * delta);
}

export function updateAttitude(state, input, delta, lookRollVelocity, pointerLocked) {
  const pitchInput = Number(input.pitchUp) - Number(input.pitchDown);
  const bankInput = Number(input.bankRight) - Number(input.bankLeft);
  const yawInput = Number(input.yawRight) - Number(input.yawLeft);

  state.pitch += pitchInput * 0.82 * delta;
  // Keyboard banking steers, too: rotating around local Z alone never changes
  // the forward vector. Mouse movement already updates yaw in the view layer.
  state.yaw -= (bankInput * 0.62 + yawInput * 0.86) * delta;
  if (input.level) {
    state.pitch = damp(state.pitch, 0, 3.4, delta);
  } else if (!pointerLocked && !pitchInput) {
    state.pitch = damp(state.pitch, 0, 1.3, delta);
  }

  const targetRoll = input.level ? 0 : Math.max(-0.72, Math.min(0.72,
    -lookRollVelocity * 1.8 - bankInput * 0.34 - yawInput * 0.18));
  state.roll = damp(state.roll, targetRoll, input.level ? 4.2 : 3.2, delta);
  state.pitch = Math.max(-0.48, Math.min(0.58, state.pitch));
}

export const controlByCode = {
  KeyW: "pitchUp", ArrowUp: "pitchUp",
  KeyS: "pitchDown", ArrowDown: "pitchDown",
  KeyA: "bankLeft", ArrowLeft: "bankLeft",
  KeyD: "bankRight", ArrowRight: "bankRight",
  KeyQ: "yawLeft", KeyE: "yawRight",
  ShiftLeft: "boost", ShiftRight: "boost", Space: "level",
};

// Track each key/finger independently. Releasing W must not release ArrowUp
// (or a touchscreen pitch control) that is still held.
export class FlightInputs {
  constructor() {
    this.sources = new Map();
    this.state = Object.fromEntries([...new Set(Object.values(controlByCode))].map((key) => [key, false]));
  }

  set(control, source, active) {
    if (!(control in this.state)) return;
    if (!this.sources.has(control)) this.sources.set(control, new Set());
    const sources = this.sources.get(control);
    if (active) sources.add(source);
    else sources.delete(source);
    this.state[control] = sources.size > 0;
  }

  clear() {
    this.sources.clear();
    for (const control of Object.keys(this.state)) this.state[control] = false;
  }
}
