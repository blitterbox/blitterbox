import path from "node:path";
import { renderCompositionStill } from "../render/index";
import { durationToFrames } from "../tokens/duration";
import { motion } from "../tokens/index";
import { FPS } from "./constants";
import { LOGO_CLIP_DURATION_FRAMES } from "./LogoClip";

const frames: Record<string, number> = {
  base: durationToFrames(motion.logo.base, FPS),
  sides: durationToFrames(motion.logo.sides, FPS),
  locked: durationToFrames(motion.logo.locked, FPS),
  name: durationToFrames(motion.logo.name, FPS),
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
