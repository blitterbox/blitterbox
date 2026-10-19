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
import towerSceneJson from "../../examples/tower.json";

const towerSceneResult = validateScene(towerSceneJson);
if (!towerSceneResult.ok) {
  throw new Error(`examples/tower.json is invalid: ${towerSceneResult.errors.join("; ")}`);
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
