import { color, face, iso, motion, typography, durationToFrames } from "./index";
import { resolveTokens } from "./resolve";

console.log("color.chartreuse:", color.chartreuse);
console.log("face.brand.front:", face.brand.front, "(expect same as color.chartreuse)");
console.log("iso.stroke.color:", iso.stroke.color, "(expect same as color.graphite)");
console.log("motion.drop.duration:", motion.drop.duration);
console.log("motion.drop.duration @30fps:", durationToFrames(motion.drop.duration, 30), "frames");
console.log("motion.logo.locked @30fps:", durationToFrames(motion.logo.locked, 30), "frames");
console.log("typography.h1.fontFamily:", typography.h1.fontFamily);

// Unresolved-reference error path.
try {
  resolveTokens({ bad: { $value: "{does.not.exist}" } });
  throw new Error("expected resolveTokens to throw on an unresolved reference");
} catch (err) {
  console.log("unresolved reference correctly throws:", (err as Error).message);
}

console.log("\nStep 1 OK.");
