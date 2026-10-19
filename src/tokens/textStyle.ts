import type { CSSProperties } from "react";

/**
 * Forces grayscale antialiasing instead of Chromium's default subpixel AA,
 * which otherwise bakes RGB color fringing into small text at render time.
 */
export const ANTIALIAS_TEXT_STYLE: CSSProperties = {
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
};
