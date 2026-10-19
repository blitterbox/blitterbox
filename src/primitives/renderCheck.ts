import path from "node:path";
import { renderCompositionStill } from "../render/index";

const outputPath = path.join(import.meta.dirname, "..", "..", "out", "primitives-check.png");

renderCompositionStill("PrimitivesCheck", outputPath)
  .then(() => console.log("Rendered:", outputPath))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
