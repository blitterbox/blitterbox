import { z } from "zod";

const Vec3 = z.tuple([z.number(), z.number(), z.number()]);
const Vec2 = z.tuple([z.number(), z.number()]);

export const BlockObjectSchema = z.object({
  id: z.string(),
  type: z.literal("block"),
  at: Vec3,
  size: Vec3,
  faces: z.enum(["brand", "neutral"]),
});

export const PlatformObjectSchema = z.object({
  id: z.string(),
  type: z.literal("platform"),
  at: Vec3,
  size: Vec2,
  height: z.number().optional(),
});

export const ConnectorObjectSchema = z.object({
  id: z.string(),
  type: z.literal("connector"),
  from: Vec3,
  to: Vec3,
});

export const SceneObjectSchema = z.discriminatedUnion("type", [
  BlockObjectSchema,
  PlatformObjectSchema,
  ConnectorObjectSchema,
]);

export const CalloutSchema = z.object({
  text: z.string(),
  anchor: z.string(),
});

export const SceneSchema = z.object({
  format: z.literal("square"),
  durationSec: z.number().positive(),
  background: z.enum(["vellum", "cream"]),
  title: z.string(),
  objects: z.array(SceneObjectSchema).min(1),
  callouts: z.array(CalloutSchema).default([]),
});

export type Scene = z.infer<typeof SceneSchema>;
export type SceneObject = z.infer<typeof SceneObjectSchema>;
export type BlockObject = z.infer<typeof BlockObjectSchema>;
export type PlatformObject = z.infer<typeof PlatformObjectSchema>;
export type ConnectorObject = z.infer<typeof ConnectorObjectSchema>;
export type Callout = z.infer<typeof CalloutSchema>;
