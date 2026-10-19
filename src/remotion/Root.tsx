import React from "react";
import { Composition } from "remotion";
import { PrimitivesCheck } from "../primitives/PrimitivesCheck";

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="PrimitivesCheck"
        component={PrimitivesCheck}
        width={800}
        height={600}
        fps={30}
        durationInFrames={1}
      />
    </>
  );
}
