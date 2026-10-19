---
name: blitterbox
version: 1.0
source: Blitterbox Brand Standards v1.0 (October 2026)
tokens: ./tokens.json
colors:
  vellum: "#EFEDE6"      # paper, every background, 60%
  graphite: "#121212"    # ink, type, lines, 30%
  chartreuse: "#D4FF3A"  # highlight, 10%, one element per surface
  cream: "#F6F4EE"       # panels, scene grounds
  paper: "#FFFFFF"       # cube tops, cards
  pencil: "#5E5B54"      # secondary text
  shade: "#9BC21A"       # chartreuse in shadow
faces:
  top: paper
  front: chartreuse
  side: graphite
fonts:
  sans: Bricolage Grotesque  # 400, 600, 800 only
  mono: JetBrains Mono
iso:
  angle: 30
  stroke: 1.5
motion:
  drop: 120ms
  easing: [0.2, 0.9, 0.3, 1]
  logo: 1.2s
---

# Blitterbox design rules

Read this before composing any scene, graphic or clip. Exact values live in `tokens.json`; this file says how to use them.

## Overview

Blitterbox looks like a precise technical drawing: ruled paper, ink lines, labeled parts. It is precise, not fussy; crafted, not precious; dry, not cold. Where most AI tools use glowing gradients, "magic" and disposable output, Blitterbox uses paper and ink, labeled parts, and exact, reusable work.

## Color

- Vellum is the background of every surface, about 60%.
- Graphite is for type and lines, about 30%.
- Chartreuse is a highlighter: about 10%, and **one element per surface**. Never a whole page, except packaging and stickers.
- Text pairs allowed: graphite on vellum, graphite on chartreuse, chartreuse on graphite, pencil on vellum (secondary text only).
- **Never put chartreuse text on vellum** (contrast 1.0).

## Typography

| Style | Font | Weight | Size / line height | Tracking |
|---|---|---|---|---|
| Display | Bricolage Grotesque | 800 | 96 / 0.85 | −1.5% |
| H1 | Bricolage Grotesque | 800 | 56 / 0.95 | −1% |
| H2 | Bricolage Grotesque | 600 | 32 / 1.1 | −0.5% |
| Body | Bricolage Grotesque | 400 | 18 / 1.55 | 0 |
| Label | JetBrains Mono, uppercase | 500 | 12 | +1px |
| Code | JetBrains Mono | 400 | 14 / 1.8 | 0 |

- Headlines are sentence case.
- The wordmark is Bricolage Grotesque 800, all lowercase, −1.5% tracking. Never tighter.
- Labels and figure numbers use mono: `FIG. 02 / PRIMITIVES · 24 PARTS`.

## Illustration

**The face rule.** Every shape has three lit faces:

| Face | Color |
|---|---|
| Top | Paper #FFFFFF |
| Front | Chartreuse #D4FF3A |
| Side | Graphite #121212 |

- **True isometric.** 30° axes, no perspective, no rotation off the grid.
- **One line weight.** 1.5 px graphite at screen size; scale it with the drawing.
- **Neutral ground.** Platforms use vellum tones (`face.neutral`) so brand faces pop.
- **Labeled, not decorated.** Use callouts and figure numbers, never sparkles or glows.
- **One brand object per scene** carries chartreuse; everything else is neutral. This follows the one-highlight-per-surface rule.
- In a customer's kit, their palette replaces chartreuse and graphite. The rules stay the same.

## Motion

Built, not revealed. Things assemble block by block.

- **Blocks drop, they don't float.** Each falls one module in 120 ms with a firm ease-out and no bounce.
- **Stagger** consecutive blocks by 60 ms.
- **Callouts type in.** Labels appear in mono, character by character (30 ms per character), 80 ms after the object lands.
- **The logo assembles in 1.2 s:** base at 0.0 s, sides at 0.36 s, locked at 0.84 s, name at 1.2 s.
- **Never:** fades, wipes, glows, floats, bounce or overshoot.

## Logo

- Eight 1m blocks on a 30° isometric grid. Lockups: horizontal (primary), stacked, mark only.
- Keep one block width of clear space on every side.
- Minimum sizes: lockup 96 px wide, mark 24 px. Below 24 px, use the flat favicon.
- Never recolor the faces, rotate off the grid, stretch, add glows, shadows or gradients, tighten the wordmark, or place it on busy or mid-tone grounds.

## UI

- Primary button is chartreuse, once per screen. Square corners, 1 px graphite border, arrow on forward actions.
- Mono tags: `SPEC 001`, `NEW`, `PRO`, `OPEN SOURCE`.
- Spec cards and terminal blocks for technical content.

## Voice

A senior designer who ships.

- Label, don't hype. Say what it is and what it does.
- Short and exact. Numbers over adjectives.
- One dry wink per page, never at the user's expense.
- Write "6 colors mapped to 18 faces. Kit ready." Not "Magic happened!" or "Unleash the power of AI."

## Checklist before rendering

1. Background is vellum; chartreuse appears on one element only.
2. Every shape is true isometric with the face rule applied.
3. One 1.5 px graphite line weight throughout.
4. Motion uses drops and type-ins only; nothing fades, floats or bounces.
5. All text pairs are on the allowed list.

## Defaults not in the brand guide

Chosen to fit the guide; change them in `tokens.json` if they look wrong.

| Token | Value | Why |
|---|---|---|
| `iso.module` | 40 px per 1m | A workable base size for 1080 px frames |
| `motion.drop.easing` | cubic-bezier(0.2, 0.9, 0.3, 1) | Firm ease-out, no overshoot |
| `motion.drop.distance` | 1 module | Short, exact drop |
| `motion.drop.stagger` | 60 ms | Half a drop, so blocks read as a sequence |
| `motion.callout.perChar` / `delay` | 30 ms / 80 ms | Readable type-in after landing |
| `face.neutral.side` | #DCD9D0 | Vellum darkened for the shaded face |
| `iso.stroke.join` | round | Clean corners at 1.5 px |
