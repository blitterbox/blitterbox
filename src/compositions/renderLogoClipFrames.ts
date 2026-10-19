import path from "node:path";
import { renderCompositionStill } from "../render/index";
import { computeLogoTimings, LOGO_CLIP_DURATION_FRAMES } from "./LogoClip";
import { FPS } from "./constants";

const { nameFrame, waveSettledFrame } = computeLogoTimings(FPS);

// Settled end of each phase (all of that phase's blocks landed), not the phase's start.
const frames: Record<string, number> = {
  base: waveSettledFrame(0), // 3 blocks down
  sides: waveSettledFrame(1), // 5 blocks down
  locked: waveSettledFrame(2), // all 8 blocks down
  name: nameFrame, // wordmark lands
  final: LOGO_CLIP_DURATION_FRAMES - 1,
};

async function main() {
  for (const [label, frame] of Object.entries(frames)) {
    const outputPath = path.join(import.meta.dirname, "..", "..", "out", `logoclip-${label}.png`);
    await renderCompositionStill("LogoClip", outputPath, {}, frame);
    console.log("Rendered:", label, "frame", frame, "->", outputPath);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
