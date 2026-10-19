import React from "react";
import { AbsoluteFill } from "remotion";
import { Block, Platform, Connector } from "./index";
import { color } from "../tokens/index";

/**
 * Ad-hoc harness to visually prove Block, Platform, and Connector render
 * correctly. Not one of the v1 deliverable compositions (see Step 6).
 */
export function PrimitivesCheck() {
  return (
    <AbsoluteFill style={{ backgroundColor: color.vellum }}>
      <svg viewBox="0 0 400 300" width="100%" height="100%">
        <g transform="translate(200, 150)">
          <Platform at={[0, 0, 0]} size={[6, 4]} />
          <Block at={[1, 1, 0.25]} size={[2, 2, 2.4]} faces="brand" />
          <Block at={[4, 1, 0.25]} size={[1, 1, 1]} faces="neutral" />
          <Connector from={[3, 2, 1]} to={[4, 2, 1]} />
        </g>
      </svg>
    </AbsoluteFill>
  );
}
