import type { Point3 } from "./project";

export type FaceName = "top" | "front" | "side";

export interface BoxFace {
  name: FaceName;
  /** Corners in 3D module space, in perimeter order (planar quad). */
  points: [Point3, Point3, Point3, Point3];
}

/**
 * The three visible faces of an axis-aligned box: top, front (normal +y,
 * toward screen left), and side (normal +x, toward screen right).
 * `at` is the box's minimum corner [x, y, z]; `size` is [w, d, h].
 */
export function boxFaces(at: Point3Tuple, size: Point3Tuple): BoxFace[] {
  const [x, y, z] = at;
  const [w, d, h] = size;
  const x0 = x;
  const x1 = x + w;
  const y0 = y;
  const y1 = y + d;
  const z0 = z;
  const z1 = z + h;

  const p = (px: number, py: number, pz: number): Point3 => ({ x: px, y: py, z: pz });

  return [
    {
      name: "top",
      points: [p(x0, y0, z1), p(x1, y0, z1), p(x1, y1, z1), p(x0, y1, z1)],
    },
    {
      name: "front",
      points: [p(x0, y1, z0), p(x1, y1, z0), p(x1, y1, z1), p(x0, y1, z1)],
    },
    {
      name: "side",
      points: [p(x1, y0, z0), p(x1, y1, z0), p(x1, y1, z1), p(x1, y0, z1)],
    },
  ];
}

export type Point3Tuple = [number, number, number];

/** Centroid of a box, used as its depth-sort anchor. */
export function boxCentroid(at: Point3Tuple, size: Point3Tuple): Point3 {
  const [x, y, z] = at;
  const [w, d, h] = size;
  return { x: x + w / 2, y: y + d / 2, z: z + h / 2 };
}
