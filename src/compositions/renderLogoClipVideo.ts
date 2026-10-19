import path from "node:path";
import { renderCompositionVideo } from "../render/index";

const outputPath = path.join(import.meta.dirname, "..", "..", "out", "logoclip.mp4");

renderCompositionVideo("LogoClip", outputPath)
  .then(() => console.log("Rendered:", outputPath))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
