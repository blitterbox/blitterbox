import fs from "node:fs";
import path from "node:path";
import { renderSceneStill, renderCompositionVideo } from "../render/index";
import { validateScene } from "../scene/validate";

const towerPath = path.join(import.meta.dirname, "..", "..", "examples", "tower.json");
const tower = JSON.parse(fs.readFileSync(towerPath, "utf-8"));
const result = validateScene(tower);
if (!result.ok) throw new Error(result.errors.join("; "));
const scene = result.scene!;

const outDir = path.join(import.meta.dirname, "..", "..", "out");
fs.mkdirSync(outDir, { recursive: true });

async function main() {
  const pngPath = path.join(outDir, "tower.png");
  await renderSceneStill(scene, pngPath);
  console.log("Rendered:", pngPath);

  const mp4Path = path.join(outDir, "tower.mp4");
  await renderCompositionVideo("Clip", mp4Path, { scene });
  console.log("Rendered:", mp4Path);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
