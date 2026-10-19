import React from "react";
import { AbsoluteFill } from "remotion";
import { Scene } from "../scene/Scene";
import type { Scene as SceneT } from "../scene/schema";
import { color, iso, typography } from "../tokens/index";
import { ANTIALIAS_TEXT_STYLE } from "../tokens/textStyle";
import { CANVAS_SIZE } from "./constants";

// One module of clear space, reused as the outer inset for the title and figure label.
const MARGIN = iso.module;

export function defaultFigureLabel(scene: SceneT): string {
  return `FIG. 01 / SCENE · ${scene.objects.length} OBJECTS`;
}

export interface SceneFrameProps {
  scene: SceneT;
  figureLabel: string;
}

/** Shared layout for SocialCard and Clip: background, scene, title top-left, figure label bottom-left. */
export function SceneFrame({ scene, figureLabel }: SceneFrameProps) {
  return (
    <AbsoluteFill style={{ backgroundColor: color[scene.background] }}>
      <Scene scene={scene} size={CANVAS_SIZE} />
      <div
        style={{
          position: "absolute",
          top: MARGIN,
          left: MARGIN,
          right: MARGIN,
          fontFamily: typography.h1.fontFamily.join(", "),
          fontWeight: typography.h1.fontWeight,
          fontSize: typography.h1.fontSize,
          lineHeight: typography.h1.lineHeight,
          letterSpacing: typography.h1.letterSpacing,
          color: color.graphite,
          ...ANTIALIAS_TEXT_STYLE,
        }}
      >
        {scene.title}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: MARGIN,
          left: MARGIN,
          fontFamily: typography.label.fontFamily.join(", "),
          fontWeight: typography.label.fontWeight,
          fontSize: typography.label.fontSize,
          lineHeight: typography.label.lineHeight,
          letterSpacing: typography.label.letterSpacing,
          textTransform: "uppercase",
          color: color.graphite,
          ...ANTIALIAS_TEXT_STYLE,
        }}
      >
        {figureLabel}
      </div>
    </AbsoluteFill>
  );
}
