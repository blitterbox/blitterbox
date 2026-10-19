import React from "react";
import { z } from "zod";
import { SceneFrame, defaultFigureLabel } from "./SceneFrame";
import { SceneSchema } from "../scene/schema";

export const SocialCardPropsSchema = z.object({
  scene: SceneSchema,
  figureLabel: z.string().optional(),
});

export type SocialCardProps = z.infer<typeof SocialCardPropsSchema>;

/**
 * 1080x1080 still: the frame at the end of the animation. Render it by
 * requesting the scene's landed frame explicitly (see renderSceneStill in
 * src/render), not by relying on this component to pick it.
 */
export function SocialCard({ scene, figureLabel }: SocialCardProps) {
  return <SceneFrame scene={scene} figureLabel={figureLabel ?? defaultFigureLabel(scene)} />;
}
