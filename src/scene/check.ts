import fs from "node:fs";
import path from "node:path";
import { validateScene } from "./validate";

const towerPath = path.join(import.meta.dirname, "..", "..", "examples", "tower.json");
const tower = JSON.parse(fs.readFileSync(towerPath, "utf-8"));

const good = validateScene(tower);
console.log("tower.json valid:", good.ok, good.errors);

const twoBrand = {
  ...tower,
  objects: tower.objects.map((o: Record<string, unknown>) =>
    o.id === "box2" ? { ...o, faces: "brand" } : o,
  ),
};
console.log("two brand objects errors:", validateScene(twoBrand).errors);

const offGrid = {
  ...tower,
  objects: tower.objects.map((o: Record<string, unknown>) =>
    o.id === "tower" ? { ...o, at: [1.1, 1, 0.25] } : o,
  ),
};
console.log("off-grid errors:", validateScene(offGrid).errors);

const badBackground = { ...tower, background: "chartreuse" };
console.log("bad background errors:", validateScene(badBackground).errors);

const longTitle = { ...tower, title: "x".repeat(61) };
console.log("long title errors:", validateScene(longTitle).errors);

const emojiTitle = { ...tower, title: "Nice blocks 🎉" };
console.log("emoji title errors:", validateScene(emojiTitle).errors);

const badAnchor = { ...tower, callouts: [{ text: "FIG. 02", anchor: "nope" }] };
console.log("bad anchor errors:", validateScene(badAnchor).errors);

console.log("\nStep 5 OK.");
