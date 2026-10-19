import type { Scene, SceneObject } from "./schema";
import { project, depthKey, boxFaces, boxCentroid, type Point2, type Point3 } from "../iso/index";
import { dropLandedAt, staggerFrames } from "../motion/dropIn";
import { durationToFrames } from "../tokens/duration";
import { motion, iso, color } from "../tokens/index";

export interface RenderObject {
  id: string;
  object: SceneObject;
  appearAt: number;
}

export interface CalloutLayout {
  text: string;
  anchorLandedAt: number;
  anchorPoint: Point2;
  labelPoint: Point2;
}

export interface SceneLayout {
  backgroundColor: string;
  fit: { tx: number; ty: number; scale: number };
  ordered: RenderObject[];
  callouts: CalloutLayout[];
  /** Last frame at which anything is still animating: every block landed, every callout fully typed. */
  totalFrames: number;
}

function platformSize3(object: Extract<SceneObject, { type: "platform" }>): [number, number, number] {
  return [object.size[0], object.size[1], object.height ?? 0.25];
}

function centroidOf(object: SceneObject): Point3 {
  if (object.type === "block") return boxCentroid(object.at, object.size);
  if (object.type === "platform") return boxCentroid(object.at, platformSize3(object));
  return {
    x: (object.from[0] + object.to[0]) / 2,
    y: (object.from[1] + object.to[1]) / 2,
    z: (object.from[2] + object.to[2]) / 2,
  };
}

/** Top-of-object anchor for a callout's leader line: the top face's center, not the object's middle. */
function topAnchorOf(object: SceneObject): Point3 {
  if (object.type === "block") {
    const [x, y, z] = object.at;
    const [w, d, h] = object.size;
    return { x: x + w / 2, y: y + d / 2, z: z + h };
  }
  if (object.type === "platform") {
    const [x, y, z] = object.at;
    const [w, d] = object.size;
    return { x: x + w / 2, y: y + d / 2, z: z + (object.height ?? 0.25) };
  }
  // Connector: anchor at whichever endpoint sits higher.
  return object.from[2] >= object.to[2]
    ? { x: object.from[0], y: object.from[1], z: object.from[2] }
    : { x: object.to[0], y: object.to[1], z: object.to[2] };
}

function cornersOf(object: SceneObject): Point3[] {
  if (object.type === "block") return boxFaces(object.at, object.size).flatMap((f) => f.points);
  if (object.type === "platform") return boxFaces(object.at, platformSize3(object)).flatMap((f) => f.points);
  return [
    { x: object.from[0], y: object.from[1], z: object.from[2] },
    { x: object.to[0], y: object.to[1], z: object.to[2] },
  ];
}

/**
 * Lays out a scene: per-object drop-in timing (blocks stagger in array order,
 * platforms are always present, connectors appear once every block has
 * landed), back-to-front paint order, auto-fit-to-canvas transform with one
 * module of clear space, and callout anchor/label screen points.
 */
export function computeSceneLayout(scene: Scene, fps: number, canvasSize: number): SceneLayout {
  const appearAtById = new Map<string, number>();
  let blockIndex = 0;
  for (const object of scene.objects) {
    if (object.type === "block") {
      appearAtById.set(object.id, blockIndex * staggerFrames(fps));
      blockIndex += 1;
    } else if (object.type === "platform") {
      appearAtById.set(object.id, 0);
    }
  }
  const lastBlockLanded = Math.max(
    0,
    ...scene.objects
      .filter((o): o is Extract<SceneObject, { type: "block" }> => o.type === "block")
      .map((o) => dropLandedAt(appearAtById.get(o.id)!, fps)),
  );
  for (const object of scene.objects) {
    if (object.type === "connector") appearAtById.set(object.id, lastBlockLanded);
  }

  const ordered: RenderObject[] = [...scene.objects]
    .sort((a, b) => depthKey(centroidOf(a)) - depthKey(centroidOf(b)))
    .map((object) => ({ id: object.id, object, appearAt: appearAtById.get(object.id)! }));

  const margin = iso.module;
  const allPoints = scene.objects.flatMap(cornersOf).map(project);
  const minX = Math.min(...allPoints.map((p) => p.x));
  const maxX = Math.max(...allPoints.map((p) => p.x));
  const minY = Math.min(...allPoints.map((p) => p.y));
  const maxY = Math.max(...allPoints.map((p) => p.y));
  const contentWidth = maxX - minX || 1;
  const contentHeight = maxY - minY || 1;
  const available = canvasSize - margin * 2;
  const scale = Math.min(available / contentWidth, available / contentHeight);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const tx = canvasSize / 2 - centerX * scale;
  const ty = canvasSize / 2 - centerY * scale;

  function applyFit(p: Point2): Point2 {
    return { x: tx + p.x * scale, y: ty + p.y * scale };
  }

  const objectById = new Map(scene.objects.map((o) => [o.id, o]));
  function landedAtFor(id: string): number {
    const object = objectById.get(id);
    if (!object) return 0;
    if (object.type === "block") return dropLandedAt(appearAtById.get(id)!, fps);
    return appearAtById.get(id) ?? 0;
  }

  const calloutDelayFrames = durationToFrames(motion.callout.delay, fps);
  const perCharFrames = Math.max(1, durationToFrames(motion.callout.perChar, fps));

  const callouts: CalloutLayout[] = scene.callouts.map((c) => {
    const object = objectById.get(c.anchor);
    const anchorRaw = object ? project(topAnchorOf(object)) : { x: 0, y: 0 };
    const labelRaw = { x: anchorRaw.x + iso.module * 1.5, y: anchorRaw.y - iso.module * 1.5 };
    const anchorLandedAt = landedAtFor(c.anchor);
    return {
      text: c.text,
      anchorLandedAt,
      anchorPoint: applyFit(anchorRaw),
      labelPoint: applyFit(labelRaw),
    };
  });

  const calloutFinishFrames = callouts.map(
    (c) => c.anchorLandedAt + calloutDelayFrames + perCharFrames * c.text.length,
  );
  const totalFrames = Math.max(lastBlockLanded, 0, ...calloutFinishFrames);

  return {
    backgroundColor: color[scene.background],
    fit: { tx, ty, scale },
    ordered,
    callouts,
    totalFrames,
  };
}
