import React from "react";
import { useVideoConfig } from "remotion";
import type { Scene as SceneT } from "./schema";
import { computeSceneLayout } from "./layout";
import { Block, Platform, Connector } from "../primitives/index";
import { TypeInCallout } from "../motion/index";

export interface SceneProps {
  scene: SceneT;
  /** Square canvas size in px. */
  size: number;
}

/** Renders a validated scene: background, back-to-front objects, and callouts. */
export function Scene({ scene, size }: SceneProps) {
  const { fps } = useVideoConfig();
  const layout = computeSceneLayout(scene, fps, size);
  const { fit } = layout;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x={0} y={0} width={size} height={size} fill={layout.backgroundColor} />
      <g transform={`translate(${fit.tx}, ${fit.ty}) scale(${fit.scale})`}>
        {layout.ordered.map(({ id, object, appearAt }) => {
          if (object.type === "block") {
            return (
              <Block key={id} at={object.at} size={object.size} faces={object.faces} appearAt={appearAt} />
            );
          }
          if (object.type === "platform") {
            return (
              <Platform
                key={id}
                at={object.at}
                size={object.size}
                height={object.height}
                appearAt={appearAt}
              />
            );
          }
          return <Connector key={id} from={object.from} to={object.to} appearAt={appearAt} />;
        })}
      </g>
      {layout.callouts.map((c, i) => (
        <TypeInCallout
          key={`${c.text}-${i}`}
          text={c.text}
          anchorLandedAt={c.anchorLandedAt}
          anchorPoint={c.anchorPoint}
          labelPoint={c.labelPoint}
        />
      ))}
    </svg>
  );
}
