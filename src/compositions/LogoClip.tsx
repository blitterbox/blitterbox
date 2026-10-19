import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { LOGO_BLOCKS, type LogoBlock } from "./logoBlocks";
import { dropOffset } from "../motion/dropIn";
import { durationToFrames } from "../tokens/duration";
import { motion, color, typography } from "../tokens/index";
import { ANTIALIAS_TEXT_STYLE } from "../tokens/textStyle";
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

export interface TimedLogoBlock {
  block: LogoBlock;
  appearAt: number;
  landedAt: number;
}

export interface LogoTimings {
  timedBlocks: TimedLogoBlock[];
  nameFrame: number;
  /** Frame at which every block of the given wave (0, 1, or 2) has landed. */
  waveSettledFrame: (wave: number) => number;
}

/**
 * Each block's appearAt: its wave's start, plus one full drop duration per
 * block already in that wave (blocks within a wave drop in sequence, not
 * simultaneously). The final wave is anchored backward from motion.logo.name
 * instead (one frame of settle time before the wordmark), since rounding
 * `motion.drop.duration` to whole frames can otherwise drift the last block's
 * landing past the name frame, making the "locked" and "name" keyframes
 * indistinguishable.
 */
export function computeLogoTimings(fps: number): LogoTimings {
  const waveStartFrames = WAVE_START_TOKENS.map((t) => durationToFrames(t, fps));
  const blockDurationFrames = durationToFrames(motion.drop.duration, fps);
  const nameFrame = durationToFrames(motion.logo.name, fps);
  const lastWave = WAVE_START_TOKENS.length - 1;

  const blocksByWave: (typeof LOGO_BLOCKS)[] = [];
  for (const block of LOGO_BLOCKS) {
    (blocksByWave[block.wave] ??= []).push(block);
  }

  const timedBlocks: TimedLogoBlock[] = [];
  blocksByWave.forEach((blocks, wave) => {
    if (wave === lastWave) {
      const settleFrame = nameFrame - 1;
      blocks.forEach((block, index) => {
        const stepsFromEnd = blocks.length - 1 - index;
        const landedAt = settleFrame - stepsFromEnd * blockDurationFrames;
        timedBlocks.push({ block, appearAt: landedAt - blockDurationFrames, landedAt });
      });
    } else {
      blocks.forEach((block, index) => {
        const appearAt = waveStartFrames[wave]! + index * blockDurationFrames;
        timedBlocks.push({ block, appearAt, landedAt: appearAt + blockDurationFrames });
      });
    }
  });

  const waveSettledFrame = (wave: number) =>
    Math.max(...timedBlocks.filter((b) => b.block.wave <= wave).map((b) => b.landedAt));

  return { timedBlocks, nameFrame, waveSettledFrame };
}

export function LogoClip() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { timedBlocks, nameFrame } = computeLogoTimings(fps);

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
        <svg
          viewBox={VIEWBOX}
          width={VIEWBOX_WIDTH * scale}
          height={VIEWBOX_HEIGHT * scale}
          style={{ overflow: "visible" }}
        >
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
              ...ANTIALIAS_TEXT_STYLE,
            }}
          >
            blitterbox
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}
