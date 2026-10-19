import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { motion as motionTokens, typography, color } from "../tokens/index";
import { durationToFrames } from "../tokens/duration";
import type { Point2 } from "../iso/index";

export interface TypeInCalloutProps {
  text: string;
  /** Frame the anchor object landed; typing starts `motion.callout.delay` after this. */
  anchorLandedAt: number;
  /** Screen point on the anchor object, where the leader line starts. */
  anchorPoint: Point2;
  /** Screen point where the label text sits, where the leader line ends. */
  labelPoint: Point2;
}

/** Mono label that types in character by character, with a graphite leader line. */
export function TypeInCallout({ text, anchorLandedAt, anchorPoint, labelPoint }: TypeInCalloutProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delayFrames = durationToFrames(motionTokens.callout.delay, fps);
  const perCharFrames = Math.max(1, durationToFrames(motionTokens.callout.perChar, fps));
  const startFrame = anchorLandedAt + delayFrames;

  if (frame < startFrame) return null;

  const visibleChars = Math.min(text.length, Math.floor((frame - startFrame) / perCharFrames) + 1);
  const visibleText = text.slice(0, visibleChars).toUpperCase();
  const style = typography.label;

  return (
    <g>
      <line
        x1={anchorPoint.x}
        y1={anchorPoint.y}
        x2={labelPoint.x}
        y2={labelPoint.y}
        stroke={color.graphite}
        strokeWidth={1}
      />
      <text
        x={labelPoint.x}
        y={labelPoint.y}
        fill={color.graphite}
        fontFamily={style.fontFamily.join(", ")}
        fontWeight={style.fontWeight}
        fontSize={style.fontSize}
        letterSpacing={style.letterSpacing}
      >
        {visibleText}
      </text>
    </g>
  );
}
