import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { LOGO_BLOCKS } from "./logoBlocks";
import { dropOffset } from "../motion/dropIn";
import { durationToFrames } from "../tokens/duration";
import { motion, color, typography } from "../tokens/index";
import { FPS } from "./constants";

// From brand/logo: all marks share this viewBox.
const VIEWBOX = "40 66 104 142";
const VIEWBOX_WIDTH = 104;
const VIEWBOX_HEIGHT = 142;
// One block-row's worth of offset in the logo artwork's own coordinate units
// (adjacent rows are 26 units apart in brand/logo/*.svg) — the logo's equivalent
// of motion.drop.distance for scene blocks, which are in module units instead.
const DROP_DISTANCE = 26;
// Render the mark at this width on the 1080 canvas.
const MARK_WIDTH = 360;
// Display size for the wordmark; typography.wordmark itself is relative (1em).
const WORDMARK_FONT_SIZE = 72;
// Hold on the finished lockup for a beat after the wordmark lands.
const HOLD_SECONDS = 1;
// brand/logo/mark-reversed.svg: on a graphite ground, the side face lightens
// and the stroke switches to vellum so the mark stays visible. Top and front
// are unchanged between the two variants.
const REVERSED_SIDE_FILL = "#2E2E2E";

const WAVE_START_TOKENS = [motion.logo.base, motion.logo.sides, motion.logo.locked] as const;

export const LOGO_CLIP_DURATION_FRAMES = durationToFrames(motion.logo.name, FPS) + FPS * HOLD_SECONDS;

export function LogoClip() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const waveStartFrames = WAVE_START_TOKENS.map((t) => durationToFrames(t, fps));
  const blockDurationFrames = durationToFrames(motion.drop.duration, fps);

  // Each block's appearAt: its wave's start, plus one full drop duration per
  // block already in that wave (blocks within a wave drop in sequence, not
  // simultaneously) — this exactly lines up the last block of the final wave
  // landing with motion.logo.name.
  const waveCounts = [0, 0, 0];
  const timedBlocks = LOGO_BLOCKS.map((block) => {
    const indexInWave = waveCounts[block.wave]!;
    waveCounts[block.wave] = indexInWave + 1;
    const appearAt = waveStartFrames[block.wave]! + indexInWave * blockDurationFrames;
    return { block, appearAt };
  });

  const nameFrame = durationToFrames(motion.logo.name, fps);
  const scale = MARK_WIDTH / VIEWBOX_WIDTH;
  // At 1.2s the wordmark lands and the lockup switches to chartreuse-on-graphite
  // (brand PDF, Voice and Motion); static outputs like SocialCard stay graphite-on-vellum.
  const nameRevealed = frame >= nameFrame;
  const strokeColor = nameRevealed ? color.vellum : color.graphite;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: nameRevealed ? color.graphite : color.vellum,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 48 }}>
        <svg viewBox={VIEWBOX} width={VIEWBOX_WIDTH * scale} height={VIEWBOX_HEIGHT * scale}>
          <g stroke={strokeColor} strokeWidth={2} strokeLinejoin="round">
            {timedBlocks.map(({ block, appearAt }, i) => {
              if (frame < appearAt) return null;
              const offset = dropOffset(frame, appearAt, fps, DROP_DISTANCE);
              return (
                <g key={i} transform={`translate(0, ${-offset})`}>
                  <polygon points={block.top.points} fill={block.top.fill} />
                  <polygon points={block.front.points} fill={block.front.fill} />
                  <polygon
                    points={block.side.points}
                    fill={nameRevealed ? REVERSED_SIDE_FILL : block.side.fill}
                  />
                </g>
              );
            })}
          </g>
        </svg>
        {nameRevealed && (
          <div
            style={{
              fontFamily: typography.wordmark.fontFamily.join(", "),
              fontWeight: typography.wordmark.fontWeight,
              fontSize: WORDMARK_FONT_SIZE,
              letterSpacing: typography.wordmark.letterSpacing,
              color: color.chartreuse,
              textTransform: "lowercase",
            }}
          >
            blitterbox
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}
