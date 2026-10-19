import { interpolate, Easing } from "remotion";
import { motion } from "../tokens/index";
import { durationToFrames } from "../tokens/duration";

const dropEasing = Easing.bezier(
  motion.drop.easing[0],
  motion.drop.easing[1],
  motion.drop.easing[2],
  motion.drop.easing[3],
);

/**
 * Offset (in whatever unit `distance` is) above the resting position for the
 * drop-in motion at the given frame. 0 once landed. Unit-agnostic so it can
 * drive a z-offset in modules (scene primitives) or a pixel offset (logo art).
 */
export function dropOffset(frame: number, appearAt: number, fps: number, distance: number): number {
  const durationFrames = durationToFrames(motion.drop.duration, fps);
  if (durationFrames <= 0) return 0;
  return interpolate(frame, [appearAt, appearAt + durationFrames], [distance, 0], {
    easing: dropEasing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/**
 * Z-offset (in modules, above the object's resting position) for the drop-in
 * motion at the given frame. 0 once landed; before `appearAt` the caller
 * should not draw the object at all (see primitives' `appearAt` gate).
 */
export function dropZOffset(frame: number, appearAt: number, fps: number): number {
  return dropOffset(frame, appearAt, fps, motion.drop.distance);
}

/** Frame at which an object that started dropping at `appearAt` has landed. */
export function dropLandedAt(appearAt: number, fps: number): number {
  return appearAt + durationToFrames(motion.drop.duration, fps);
}

/** Frame gap between consecutive staggered drops. */
export function staggerFrames(fps: number): number {
  return durationToFrames(motion.drop.stagger, fps);
}
