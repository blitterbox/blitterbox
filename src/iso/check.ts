import { project, paintersOrder, boxFaces, boxCentroid } from "./index";
import { iso } from "../tokens/index";

// Origin projects to screen origin.
const origin = project({ x: 0, y: 0, z: 0 });
console.log("project(0,0,0):", origin, "(expect 0,0)");

// Moving +x should move screen-right (+screenX); +y should move screen-left (-screenX).
const px = project({ x: 1, y: 0, z: 0 });
const py = project({ x: 0, y: 1, z: 0 });
console.log("project(1,0,0):", px, "(expect +x, screen-right)");
console.log("project(0,1,0):", py, "(expect -x, screen-left)");
console.log("iso.module:", iso.module, "iso.angle:", iso.angle);

const faces = boxFaces([0, 0, 0], [1, 1, 1]);
console.log("box faces:", faces.map((f) => f.name));
console.log(
  "top face corners:",
  faces.find((f) => f.name === "top")!.points,
);

const centroid = boxCentroid([0, 0, 0], [1, 1, 1]);
console.log("box centroid:", centroid, "(expect 0.5,0.5,0.5)");

const order = paintersOrder([
  { x: 2, y: 0, z: 0 },
  { x: 0, y: 0, z: 0 },
  { x: 0, y: 0, z: 1 },
]);
console.log("paintersOrder:", order, "(expect [1,2,0] back to front)");

console.log("\nStep 2 OK.");
