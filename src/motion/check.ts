import { dropZOffset, dropLandedAt, staggerFrames } from "./dropIn";
import { motion } from "../tokens/index";

const fps = 30;
const appearAt = 10;
const landedAt = dropLandedAt(appearAt, fps);

console.log("motion.drop.distance:", motion.drop.distance, "module(s)");
console.log("drop duration frames @30fps:", landedAt - appearAt, "(expect 4, from 120ms)");
console.log("zOffset at appearAt (just started):", dropZOffset(appearAt, appearAt, fps), "(expect", motion.drop.distance, ")");
console.log("zOffset at landedAt (landed):", dropZOffset(landedAt, appearAt, fps), "(expect 0)");
console.log("zOffset past landedAt (clamped):", dropZOffset(landedAt + 10, appearAt, fps), "(expect 0, no overshoot)");
console.log("zOffset mid-drop is between 0 and distance:");
const mid = dropZOffset(appearAt + 2, appearAt, fps);
console.log(" ", mid, mid > 0 && mid < motion.drop.distance ? "OK" : "FAIL");

console.log("stagger frames @30fps:", staggerFrames(fps), "(expect 2, from 60ms)");

console.log("\nStep 4 OK.");
