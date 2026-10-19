import React from "react";
import { z } from "zod";
import { SceneFrame, defaultFigureLabel } from "./SceneFrame";
import { SceneSchema } from "../scene/schema";

export const ClipPropsSchema = z.object({
  scene: SceneSchema,
  figureLabel: z.string().optional(),
});

export type ClipProps = z.infer<typeof ClipPropsSchema>;

/** 1080x1080 @ 30fps: objects drop in, callouts type in, holds on the final frame. */
export function Clip({ scene, figureLabel }: ClipProps) {
  return <SceneFrame scene={scene} figureLabel={figureLabel ?? defaultFigureLabel(scene)} />;
}
