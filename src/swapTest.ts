/**
 * Proves tokens drive every render: copies tokens.json, changes
 * color.chartreuse, re-renders the tower PNG, then restores the original
 * file. If this script's swapped render looks different (and the restored
 * tokens.json is unchanged), the token pipeline works end to end.
 */
import fs from "node:fs";
import path from "node:path";
import { renderSceneStill } from "./render/index";
import { validateScene } from "./scene/validate";

const ROOT = path.join(import.meta.dirname, "..");
const TOKENS_PATH = path.join(ROOT, "tokens.json");
const BACKUP_PATH = path.join(ROOT, "tokens.json.swap-test-backup");
const SWAP_COLOR = "#3A7BFF";

async function main() {
  const original = fs.readFileSync(TOKENS_PATH, "utf-8");
  fs.writeFileSync(BACKUP_PATH, original);

  try {
    const tokens = JSON.parse(original);
    tokens.color.chartreuse.$value = SWAP_COLOR;
    fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2) + "\n");

    const towerPath = path.join(ROOT, "examples", "tower.json");
    const tower = JSON.parse(fs.readFileSync(towerPath, "utf-8"));
    const result = validateScene(tower);
    if (!result.ok) throw new Error(result.errors.join("; "));

    const outPath = path.join(ROOT, "out", "swap-test.png");
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    await renderSceneStill(result.scene!, outPath);
    console.log("Rendered with chartreuse swapped to", SWAP_COLOR, "->", outPath);
  } finally {
    fs.writeFileSync(TOKENS_PATH, fs.readFileSync(BACKUP_PATH, "utf-8"));
    fs.rmSync(BACKUP_PATH);
    console.log("Restored tokens.json");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
