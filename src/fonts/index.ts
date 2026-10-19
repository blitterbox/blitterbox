/**
 * Loads the brand fonts (Bricolage Grotesque, JetBrains Mono) and blocks
 * rendering until they are actually ready, so no frame is ever captured with
 * a fallback font. Side-effecting on import; imported once by the Remotion
 * entry point (src/remotion/index.ts) before registerRoot.
 */
import { delayRender, continueRender, cancelRender } from "remotion";
import {
  loadFont as loadSansFont,
  fontFamily as sansFontFamily,
} from "@remotion/google-fonts/BricolageGrotesque";
import {
  loadFont as loadMonoFont,
  fontFamily as monoFontFamily,
} from "@remotion/google-fonts/JetBrainsMono";

export const SANS_FONT_FAMILY = sansFontFamily;
export const MONO_FONT_FAMILY = monoFontFamily;

// DESIGN.md: sans is used at 400, 600, 800; mono is used at 400 (code) and 500 (labels).
const sans = loadSansFont("normal", { weights: ["400", "600", "800"], subsets: ["latin"] });
const mono = loadMonoFont("normal", { weights: ["400", "500"], subsets: ["latin"] });

const fontCheckHandle = delayRender("Verifying brand fonts are loaded before rendering any frame");

Promise.all([sans.waitUntilDone(), mono.waitUntilDone()])
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
  });
