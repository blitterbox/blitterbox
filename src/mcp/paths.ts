import fs from "node:fs";
import path from "node:path";

// Relative to the caller's cwd, not this module's own location: once
// installed as a dependency, this file lives under node_modules/blitterbox/,
// and output must land in the user's project, not inside node_modules.
export const OUT_DIR = path.join(process.cwd(), "out");
export const SCENES_DIR = path.join(OUT_DIR, "scenes");
export const RENDERS_DIR = path.join(OUT_DIR, "renders");

export function ensureOutDirs(): void {
  fs.mkdirSync(SCENES_DIR, { recursive: true });
  fs.mkdirSync(RENDERS_DIR, { recursive: true });
}
