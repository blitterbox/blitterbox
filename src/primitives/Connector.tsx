import React from "react";
import { useCurrentFrame } from "remotion";
import { project, type Point3 } from "../iso/index";
import { iso, color } from "../tokens/index";

export interface ConnectorProps {
  from: [number, number, number];
  to: [number, number, number];
  appearAt?: number;
}

const ARROW_LENGTH = 6;
const ARROW_WIDTH = 4;

/** Axis-aligned waypoints from `from` to `to`: move x, then y, then z. */
function axisAlignedPath(from: Point3, to: Point3): Point3[] {
  const waypoints: Point3[] = [from];
  let cur = from;

  if (cur.x !== to.x) {
    cur = { ...cur, x: to.x };
    waypoints.push(cur);
  }
  if (cur.y !== to.y) {
    cur = { ...cur, y: to.y };
    waypoints.push(cur);
  }
  if (cur.z !== to.z) {
    cur = { ...cur, z: to.z };
    waypoints.push(cur);
  }

  return waypoints;
}

export function Connector({ from, to, appearAt }: ConnectorProps) {
  const frame = useCurrentFrame();
  if (appearAt !== undefined && frame < appearAt) return null;

  const fromPoint: Point3 = { x: from[0], y: from[1], z: from[2] };
  const toPoint: Point3 = { x: to[0], y: to[1], z: to[2] };
  const waypoints = axisAlignedPath(fromPoint, toPoint).map(project);

  if (waypoints.length < 2) return null;

  const last = waypoints[waypoints.length - 1]!;
  const secondToLast = waypoints[waypoints.length - 2]!;
  const dx = last.x - secondToLast.x;
  const dy = last.y - secondToLast.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  // Perpendicular unit vector for the arrowhead base.
  const px = -uy;
  const py = ux;

  const tipX = last.x;
  const tipY = last.y;
  const baseX = tipX - ux * ARROW_LENGTH;
  const baseY = tipY - uy * ARROW_LENGTH;
  const leftX = baseX + px * (ARROW_WIDTH / 2);
  const leftY = baseY + py * (ARROW_WIDTH / 2);
  const rightX = baseX - px * (ARROW_WIDTH / 2);
  const rightY = baseY - py * (ARROW_WIDTH / 2);

  return (
    <g>
      <polyline
        points={waypoints.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke={color.graphite}
        strokeWidth={iso.stroke.width}
        strokeLinejoin={iso.stroke.join as "round"}
      />
      <polygon
        points={`${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`}
        fill={color.graphite}
      />
    </g>
  );
}
