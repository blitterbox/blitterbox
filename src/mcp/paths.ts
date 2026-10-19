import fs from "node:fs";
import path from "node:path";

export const OUT_DIR = path.join(import.meta.dirname, "..", "..", "out");
export const SCENES_DIR = path.join(OUT_DIR, "scenes");
export const RENDERS_DIR = path.join(OUT_DIR, "renders");

export function ensureOutDirs(): void {
  fs.mkdirSync(SCENES_DIR, { recursive: true });
  fs.mkdirSync(RENDERS_DIR, { recursive: true });
}
