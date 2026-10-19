import React from "react";
import { Composition } from "remotion";
import { PrimitivesCheck } from "../primitives/PrimitivesCheck";
import { SocialCard, SocialCardPropsSchema } from "../compositions/SocialCard";
import { Clip, ClipPropsSchema } from "../compositions/Clip";
import { LogoClip, LOGO_CLIP_DURATION_FRAMES } from "../compositions/LogoClip";
import { FPS, CANVAS_SIZE } from "../compositions/constants";
import { computeSceneLayout } from "../scene/layout";
import { validateScene } from "../scene/validate";
import type { Scene } from "../scene/schema";

// Studio/dev preview default only (kept inline, not imported, so the compile
// graph — and therefore dist/'s output layout — stays scoped to src/). The
// real example lives in examples/tower.json; actual renders always pass an
// explicit scene via inputProps regardless of this default.
const DEFAULT_SCENE_JSON = {
  format: "square",
  durationSec: 4,
  background: "vellum",
  title: "6 colors mapped to 18 faces.",
  objects: [
    { id: "ground", type: "platform", at: [0, 0, 0], size: [6, 4] },
    { id: "tower", type: "block", at: [1, 1, 0.25], size: [2, 2, 2.5], faces: "brand" },
    { id: "box2", type: "block", at: [4, 1, 0.25], size: [1, 1, 1], faces: "neutral" },
    { id: "link", type: "connector", from: [3, 2, 1], to: [4, 2, 1] },
  ],
  callouts: [{ text: "FIG. 01 / TOWER · 2×2×2.5M", anchor: "tower" }],
};

const towerSceneResult = validateScene(DEFAULT_SCENE_JSON);
if (!towerSceneResult.ok) {
  throw new Error(`Default preview scene is invalid: ${towerSceneResult.errors.join("; ")}`);
}
const towerScene = towerSceneResult.scene!;

// Duration must cover both the scene's requested length and the time every
// block takes to land and every callout to finish typing, whichever is longer.
function sceneDurationInFrames(scene: Scene): number {
  const layout = computeSceneLayout(scene, FPS, CANVAS_SIZE);
  return Math.max(Math.round(scene.durationSec * FPS), layout.totalFrames + 1);
}

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="PrimitivesCheck"
        component={PrimitivesCheck}
        width={800}
        height={600}
        fps={FPS}
        durationInFrames={1}
      />
      <Composition
        schema={SocialCardPropsSchema}
        id="SocialCard"
        component={SocialCard}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        fps={FPS}
        durationInFrames={sceneDurationInFrames(towerScene)}
        defaultProps={{ scene: towerScene }}
        calculateMetadata={async ({ props }) => ({
          durationInFrames: sceneDurationInFrames(props.scene),
        })}
      />
      <Composition
        schema={ClipPropsSchema}
        id="Clip"
        component={Clip}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        fps={FPS}
        durationInFrames={sceneDurationInFrames(towerScene)}
        defaultProps={{ scene: towerScene }}
        calculateMetadata={async ({ props }) => ({
          durationInFrames: sceneDurationInFrames(props.scene),
        })}
      />
      <Composition
        id="LogoClip"
        component={LogoClip}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        fps={FPS}
        durationInFrames={LOGO_CLIP_DURATION_FRAMES}
      />
    </>
  );
}
