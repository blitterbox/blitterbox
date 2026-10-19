import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { boxFaces, project, type Point3Tuple } from "../iso/index";
import { face, iso } from "../tokens/index";
import { dropZOffset } from "../motion/dropIn";

export interface BlockProps {
  at: Point3Tuple;
  size: Point3Tuple;
  faces: "brand" | "neutral";
  /** Frame at which this block appears; before it, nothing is drawn. */
  appearAt?: number;
}

function pointsAttr(poly: { x: number; y: number }[]): string {
  return poly.map((p) => `${p.x},${p.y}`).join(" ");
}

export function Block({ at, size, faces: facesKind, appearAt }: BlockProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (appearAt !== undefined && frame < appearAt) return null;

  const zOffset = appearAt !== undefined ? dropZOffset(frame, appearAt, fps) : 0;
  const effectiveAt: Point3Tuple = [at[0], at[1], at[2] + zOffset];

  const faceColors = face[facesKind];
  const boxFaceGeometry = boxFaces(effectiveAt, size);

  return (
    <g>
      {boxFaceGeometry.map((f) => (
        <polygon
          key={f.name}
          points={pointsAttr(f.points.map(project))}
          fill={faceColors[f.name]}
          stroke={iso.stroke.color}
          strokeWidth={iso.stroke.width}
          strokeLinejoin={iso.stroke.join as "round"}
        />
      ))}
    </g>
  );
}
