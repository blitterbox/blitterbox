import rawTokens from "../../tokens.json";
import { resolveTokens } from "./resolve";
import type {
  ColorTokens,
  FaceTokens,
  IsoTokens,
  MotionTokens,
  TypographyTokens,
} from "./types";

const resolved = resolveTokens(rawTokens);

export const color = resolved.color as ColorTokens;
export const face = resolved.face as FaceTokens;
export const iso = resolved.iso as IsoTokens;
export const motion = resolved.motion as MotionTokens;
export const typography = resolved.typography as TypographyTokens;

// Other resolved groups (role, contrast, font, logo, ui) for anything that
// wants raw access without re-resolving.
export const tokens = resolved;

export { durationToFrames, parseDurationMs } from "./duration";
export type * from "./types";
