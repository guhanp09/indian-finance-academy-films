// 3Blue1Brown-style vector write-on.
//
// The stroke is traced along its own arc length rather than faded in, which is
// what makes a diagram read as *constructed* instead of *revealed*. Removal is
// the same trace played backwards, so an object leaves the way it arrived.
import React from 'react';
import { evolvePath } from '@remotion/paths';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

/** Organic, clean vector trace — smooth in, smooth out, no overshoot. */
export const WRITE_EASE = Easing.bezier(0.25, 0.1, 0.25, 1);

/**
 * Progress of a write-on that begins at `startFrame` and runs `durationInFrames`.
 * `direction: 'out'` runs the same curve backwards, so the tail of a stroke
 * retracts first and the object un-draws from its end.
 */
export const useWriteProgress = (
  startFrame: number,
  durationInFrames: number,
  direction: 'in' | 'out' = 'in',
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  void fps;                                   // progress is frame-based by design
  const p = interpolate(frame, [startFrame, startFrame + durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: WRITE_EASE,
  });
  return direction === 'out' ? 1 - p : p;
};

export type WriteOnProps = {
  /** Raw SVG path data. */
  d: string;
  /** Frame the trace begins. */
  startFrame?: number;
  /** Length of the trace, in frames. */
  durationInFrames?: number;
  color?: string;
  strokeWidth?: number;
  direction?: 'in' | 'out';
  /** Supply progress directly instead of deriving it from the frame. */
  progress?: number;
  strokeLinecap?: 'butt' | 'round' | 'square';
  strokeLinejoin?: 'miter' | 'round' | 'bevel';
  opacity?: number;
  dashed?: string;
};

/**
 * A single traced path. `fill="none"` throughout the drawing phase, which is
 * the signature of the look — the shape exists as a line before it exists as
 * an area.
 */
export const WriteOn: React.FC<WriteOnProps> = ({
  d, startFrame = 0, durationInFrames = 20, color = '#F3F0E8', strokeWidth = 3,
  direction = 'in', progress, strokeLinecap = 'round', strokeLinejoin = 'round',
  opacity = 1, dashed,
}) => {
  const auto = useWriteProgress(startFrame, durationInFrames, direction);
  const p = Math.max(0, Math.min(1, progress ?? auto));
  if (p <= 0.0005) return null;
  const evolved = evolvePath(p, d);
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      opacity={opacity}
      strokeDasharray={dashed ?? evolved.strokeDasharray}
      strokeDashoffset={dashed ? undefined : evolved.strokeDashoffset}
    />
  );
};

/** Convenience wrapper that carries its own absolutely-positioned SVG layer. */
export const WriteLayer: React.FC<{ children: React.ReactNode; opacity?: number }> =
  ({ children, opacity = 1 }) => (
    <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity }} width={1} height={1}>
      {children}
    </svg>
  );

/** A circle as a path, so dots can be traced like everything else. */
export const circlePath = (cx: number, cy: number, r: number) =>
  `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;

/** A rounded-rect path, for note-shaped objects that need to be written on. */
export const rectPath = (x: number, y: number, w: number, h: number) =>
  `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;

/** Ring-segment arc path, used by the sector charts. */
export const arcPath = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const rad = (a: number) => ((a - 90) * Math.PI) / 180;
  const x0 = cx + r * Math.cos(rad(a0)), y0 = cy + r * Math.sin(rad(a0));
  const x1 = cx + r * Math.cos(rad(a1)), y1 = cy + r * Math.sin(rad(a1));
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
};
