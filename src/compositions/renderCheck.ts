import fs from "node:fs";
import path from "node:path";
import { renderSceneStill } from "../render/index";
import { validateScene } from "../scene/validate";

const towerPath = path.join(import.meta.dirname, "..", "..", "examples", "tower.json");
const tower = JSON.parse(fs.readFileSync(towerPath, "utf-8"));
const result = validateScene(tower);
if (!result.ok) throw new Error(result.errors.join("; "));

const outputPath = path.join(import.meta.dirname, "..", "..", "out", "social-card-check.png");

renderSceneStill(result.scene!, outputPath)
  .then(() => console.log("Rendered:", outputPath))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
