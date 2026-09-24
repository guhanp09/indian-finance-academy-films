// The odometer's carry chain, kept as a pure function so QA can assert on the
// film's own arithmetic rather than a copy of it.
//
// A wheel above the lowest one only turns while the wheel *directly* beneath it
// is sitting on a 9 and about to carry — which is how a mechanical drum behaves,
// and the only gate that leaves every wheel on a whole digit at rest. Gating on
// the whole remainder instead parked the thousands wheel of ₹39,950 two thirds
// of the way to 4, because 950/1000 is close to a carry even though the hundreds
// wheel is nowhere near one.

export const GATE = 0.985;

/** Continuous position of wheel `k` (0 = the freely spinning lowest digit). */
export const wheelPos = (units: number, k: number): number => {
  if (k === 0) return units;
  const below = units / Math.pow(10, k - 1);
  const onNine = ((Math.floor(below) % 10) + 10) % 10 === 9;
  const fr = below - Math.floor(below);
  const carry = onNine && fr > GATE ? (fr - GATE) / (1 - GATE) : 0;
  return Math.floor(units / Math.pow(10, k)) + carry;
};

/** Every wheel a value would occupy at rest, given the counter's step. */
export const restingWheels = (value: number, step: number): number[] => {
  const units = value / step;
  const n = Math.max(1, Math.ceil(Math.log10(Math.max(units, 1) + 1)));
  return Array.from({ length: n }, (_, k) => wheelPos(units, k));
};
