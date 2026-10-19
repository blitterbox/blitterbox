import { iso } from "../tokens/index";

const ANGLE_RAD = (iso.angle * Math.PI) / 180;
const COS_ANGLE = Math.cos(ANGLE_RAD);
const SIN_ANGLE = Math.sin(ANGLE_RAD);

export interface Point3 {
  x: number;
  y: number;
  z: number;
}

export interface Point2 {
  x: number;
  y: number;
}

/**
 * True isometric projection, 30 degree axes, no perspective.
 * Units are modules (1 module = iso.module px).
 */
export function project(point: Point3): Point2 {
  const { x, y, z } = point;
  return {
    x: (x - y) * COS_ANGLE * iso.module,
    y: (x + y) * SIN_ANGLE * iso.module - z * iso.module,
  };
}

/** Depth key for painter's-algorithm ordering: x + y + z, ascending = back to front. */
export function depthKey(point: Point3): number {
  return point.x + point.y + point.z;
}

/** Indices into `points`, back to front, by depthKey ascending. */
export function paintersOrder(points: Point3[]): number[] {
  return points
    .map((_, index) => index)
    .sort((a, b) => depthKey(points[a]!) - depthKey(points[b]!));
}
