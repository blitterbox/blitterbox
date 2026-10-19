/**
 * Loads the brand fonts (Bricolage Grotesque, JetBrains Mono) from locally
 * bundled woff2 files (public/fonts/, sourced from @fontsource) and blocks
 * rendering until they are actually ready, so no frame is ever captured with
 * a fallback font, and no network access is required at render time.
 * Side-effecting on import; imported once by the Remotion entry point
 * (src/remotion/index.ts) before registerRoot.
 */
import { delayRender, continueRender, cancelRender, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";

export const SANS_FONT_FAMILY = "Bricolage Grotesque";
export const MONO_FONT_FAMILY = "JetBrains Mono";

// DESIGN.md: sans is used at 400, 600, 800; mono is used at 400 (code) and 500 (labels).
const FONTS_TO_LOAD = [
  { family: SANS_FONT_FAMILY, weight: "400", file: "bricolage-grotesque-latin-400-normal.woff2" },
  { family: SANS_FONT_FAMILY, weight: "600", file: "bricolage-grotesque-latin-600-normal.woff2" },
  { family: SANS_FONT_FAMILY, weight: "800", file: "bricolage-grotesque-latin-800-normal.woff2" },
  { family: MONO_FONT_FAMILY, weight: "400", file: "jetbrains-mono-latin-400-normal.woff2" },
  { family: MONO_FONT_FAMILY, weight: "500", file: "jetbrains-mono-latin-500-normal.woff2" },
] as const;

/**
 * Blocks any fetch() to a different origin than the page itself while active.
 * Font files are served from the same local bundle origin (public/fonts/ via
 * staticFile), so this both enforces and proves that font loading never
 * needs network access, without requiring OS-level network changes. Returns
 * a function that restores the original fetch.
 */
function blockCrossOriginFetch(): () => void {
  if (typeof window === "undefined" || typeof window.fetch !== "function") {
    return () => {};
  }
  const originalFetch = window.fetch.bind(window);
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const rawUrl = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const resolved = new URL(rawUrl, window.location.href);
    if (resolved.origin !== window.location.origin) {
      return Promise.reject(
        new Error(`Blocked cross-origin fetch (renders must not need network access): ${resolved.href}`),
      );
    }
    return originalFetch(input, init);
  }) as typeof window.fetch;
  return () => {
    window.fetch = originalFetch;
  };
}

const fontCheckHandle = delayRender("Verifying brand fonts are loaded before rendering any frame");
const restoreFetch = blockCrossOriginFetch();

Promise.all(
  FONTS_TO_LOAD.map(({ family, weight, file }) =>
    loadFont({ family, weight, style: "normal", url: staticFile(`fonts/${file}`), format: "woff2" }),
  ),
)
  .then(() => {
    if (typeof document !== "undefined" && document.fonts) {
      const sansReady = document.fonts.check(`16px "${SANS_FONT_FAMILY}"`);
      const monoReady = document.fonts.check(`16px "${MONO_FONT_FAMILY}"`);
      if (!sansReady || !monoReady) {
        const missing = [!sansReady && SANS_FONT_FAMILY, !monoReady && MONO_FONT_FAMILY]
          .filter(Boolean)
          .join(", ");
        throw new Error(`Font failed to load before render: ${missing}`);
      }
    }
    continueRender(fontCheckHandle);
  })
  .catch((err) => {
    cancelRender(err);
  })
  .finally(() => {
    restoreFetch();
  });
