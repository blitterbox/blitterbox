import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, renderMedia, selectComposition } from "@remotion/renderer";
import { computeSceneLayout } from "../scene/layout";
import type { Scene } from "../scene/schema";
import { FPS, CANVAS_SIZE } from "../compositions/constants";

// This file runs either as raw TS (via tsx, in dev) or as compiled JS (from
// dist/, once published); pick the matching extension for the sibling
// Remotion entry point so @remotion/bundler is given a file that exists.
const SELF_IS_COMPILED = import.meta.url.endsWith(".js");
const ENTRY_POINT = path.join(
  import.meta.dirname,
  "..",
  "remotion",
  SELF_IS_COMPILED ? "index.js" : "index.ts",
);

let bundleLocationPromise: Promise<string> | null = null;

function getBundleLocation(): Promise<string> {
  if (!bundleLocationPromise) {
    bundleLocationPromise = bundle({ entryPoint: ENTRY_POINT });
  }
  return bundleLocationPromise;
}

export async function renderCompositionStill(
  compositionId: string,
  outputPath: string,
  inputProps: Record<string, unknown> = {},
  frame?: number,
): Promise<void> {
  const serveUrl = await getBundleLocation();
  const composition = await selectComposition({ serveUrl, id: compositionId, inputProps });
  await renderStill({ composition, serveUrl, output: outputPath, inputProps, frame });
}

/** Renders the SocialCard still at the scene's landed frame: every block down, every callout fully typed. */
export async function renderSceneStill(scene: Scene, outputPath: string): Promise<void> {
  const landedFrame = computeSceneLayout(scene, FPS, CANVAS_SIZE).totalFrames;
  await renderCompositionStill("SocialCard", outputPath, { scene }, landedFrame);
}

export async function renderCompositionVideo(
  compositionId: string,
  outputPath: string,
  inputProps: Record<string, unknown> = {},
): Promise<void> {
  const serveUrl = await getBundleLocation();
  const composition = await selectComposition({ serveUrl, id: compositionId, inputProps });
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation: outputPath,
    inputProps,
  });
}
