export type Pt = [number, number];
export const S: {
  tipHalf: number; baseHalf: number; notchY: number; webR: number;
  rowStart: Pt; rowTilt: number; steps: number[]; sagittas: number[]; lobeFillet: number;
  wristY: number; wristRad: number; wristUln: number; foreHalfEnd: number; foreRamp: number;
  thenarPeak: Pt; fingerRadAt43: number; bendFrom: number; bendTo: number;
  nail: { halfW: number; closedY: number; openY: number }; creaseLen: number;
};
export const WRIST_C: Pt;
export const PAD: Pt;
export const LOBES: { c: Pt; r: number; chord: number; sag: number }[];
export const ULNAR_EXTREME: number;
export function contour(o?: { forearm?: number; bend?: number; press?: number }): Pt[];
export function bendAt(pts: Pt[], deg: number): Pt[];
export function nailPath(): string;
export function creasePaths(): string[];
export function place(o: { tip: { x: number; y: number }; from: { x: number; y: number };
  fw: number; hand: 'right' | 'left'; bend: number }): { theta: number; mirror: number; forearm: number };
export function toPath(pts: Pt[]): string;
