// Postbuild step: tsc (moduleResolution "Bundler", matching how tsx/webpack
// resolve things in dev) emits relative import/export specifiers with no
// file extension. Plain Node's ESM loader requires one. This rewrites only
// the compiled dist/ output — source stays untouched, so dev (tsx) and
// @remotion/bundler's webpack bundling of raw TSX source are unaffected.
import fs from "node:fs";
import path from "node:path";

const DIST_DIR = path.join(import.meta.dirname, "..", "dist");

// Covers `... from "..."` (import and export), bare `import "..."`
// (side-effect), and dynamic `import("...")`.
const SPECIFIER_PATTERNS = [
  /(\bfrom\s*['"])(\.\.?\/[^'"]+)(['"])/g,
  /(\bimport\s*['"])(\.\.?\/[^'"]+)(['"])/g,
  /(\bimport\(\s*['"])(\.\.?\/[^'"]+)(['"]\s*\))/g,
];
// Plain Node ESM (unlike tsx/esbuild and webpack) requires a `with { type:
// "json" }` import attribute on JSON imports.
const JSON_IMPORT_PATTERN = /(import\s+\w+\s+from\s*['"][^'"]+\.json)(['"])(\s*;)/g;

function needsExtension(specifier) {
  return !/\.(js|json|mjs|cjs)$/.test(specifier);
}

function fixSpecifiers(content) {
  const addJs = (_match, pre, specifier, post) =>
    needsExtension(specifier) ? `${pre}${specifier}.js${post}` : `${pre}${specifier}${post}`;
  let fixed = content;
  for (const pattern of SPECIFIER_PATTERNS) {
    fixed = fixed.replace(pattern, addJs);
  }
  return fixed.replace(
    JSON_IMPORT_PATTERN,
    (_match, pre, quote, semi) => `${pre}${quote} with { type: "json" }${semi}`,
  );
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name.endsWith(".js")) {
      const original = fs.readFileSync(fullPath, "utf-8");
      const fixed = fixSpecifiers(original);
      if (fixed !== original) fs.writeFileSync(fullPath, fixed);
    }
  }
}

walk(DIST_DIR);
console.log("Fixed relative import/export specifiers in dist/ for Node ESM.");
