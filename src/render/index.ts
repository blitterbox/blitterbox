import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, renderMedia, selectComposition } from "@remotion/renderer";

const ENTRY_POINT = path.join(import.meta.dirname, "..", "remotion", "index.ts");

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
): Promise<void> {
  const serveUrl = await getBundleLocation();
  const composition = await selectComposition({ serveUrl, id: compositionId, inputProps });
  await renderStill({ composition, serveUrl, output: outputPath, inputProps });
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
