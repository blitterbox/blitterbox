import React from "react";
import { Block } from "./Block";

export interface PlatformProps {
  at: [number, number, number];
  size: [number, number];
  /** Height in modules. Defaults to 0.25. */
  height?: number;
  appearAt?: number;
}

/** The ground. Always neutral faces, so brand faces pop. */
export function Platform({ at, size, height = 0.25, appearAt }: PlatformProps) {
  return (
    <Block at={at} size={[size[0], size[1], height]} faces="neutral" appearAt={appearAt} animate={false} />
  );
}
