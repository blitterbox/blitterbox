# Blitterbox v1: kickoff for Claude Code

Read `DESIGN.md` and `tokens.json` in this folder before writing any code. They are the source of truth. Every color, size, line weight and timing in the code must come from `tokens.json`; never hardcode a brand value.

## Goal

Build v1 of Blitterbox: an MCP server that lets any AI agent make on-brand isometric visuals. v1 makes two things: a square social graphic (PNG) and a short clip (MP4), both from the same tokens.

**Done when:** I change one color in `tokens.json`, re-render, and both outputs update and stay on brand, with no code changes.

## Stack

- TypeScript, Node 20+, pnpm
- Remotion for rendering (local only; `@remotion/renderer` for `renderStill` and `renderMedia`)
- `@modelcontextprotocol/sdk` for the MCP server, stdio transport
- `zod` for input schemas
- No other dependencies without asking me first

## Repo layout

```
blitterbox/
  tokens.json            (exists, do not restructure)
  DESIGN.md              (exists)
  src/
    tokens/              load tokens.json, resolve {references}, export typed values
    iso/                 projection math and face shading
    primitives/          Block, Platform, Connector
    motion/              dropIn preset, typeIn callout
    scene/               scene schema (zod), validator, <Scene> renderer
    compositions/        SocialCard (1080x1080), Clip (1080x1080, 30 fps)
    mcp/                 server + tools
  examples/              sample scene JSON files
  out/                   render output (gitignored)
```

## Step 1: tokens loader

- Load `tokens.json`, resolve `{path.to.token}` references recursively, and export typed objects: `color`, `face`, `iso`, `motion`, `typography`.
- Parse durations ("120ms") to frames at the composition's fps.
- Throw a clear error on an unresolved reference.

## Step 2: isometric math

- True isometric, 30° axes, no perspective. Units are modules (1 module = `iso.module` px).
- Projection for a point (x, y, z):
  - `screenX = (x - y) * cos(30°) * module`
  - `screenY = (x + y) * sin(30°) * module - z * module`
- Three visible faces per box: **top**, **front** (the face toward screen left, normal +y), **side** (the face toward screen right, normal +x).
- Draw back to front (painter's order by x + y + z) so overlaps are correct.
- All edges use one stroke: `iso.stroke.width` (scaled with module size), `iso.stroke.color`, round joins.

## Step 3: primitives (React components, SVG only)

| Component | Props | Notes |
|---|---|---|
| `Block` | `at=[x,y,z]`, `size=[w,d,h]`, `faces="brand"or"neutral"` | Faces read `face.brand` or `face.neutral` |
| `Platform` | `at`, `size=[w,d]`, `height` (default 0.25) | Always neutral faces; it's the ground |
| `Connector` | `from=[x,y,z]`, `to=[x,y,z]` | Graphite line along iso axes only (L-shaped if needed), small arrowhead |

Every primitive takes an optional `appearAt` frame used by the motion presets.

## Step 4: motion

- `dropIn`: the object falls `motion.drop.distance` modules over `motion.drop.duration` with the `motion.drop.easing` cubic-bezier. No overshoot, no opacity change. Before its start frame it is not drawn at all.
- Stagger consecutive objects by `motion.drop.stagger`.
- `typeIn` callout: mono label (`typography.label`) appears character by character at `motion.callout.perChar`, starting `motion.callout.delay` after its anchor object lands. A short graphite leader line connects label to object.
- Hard rule: implement nothing from `motion.forbidden` (fade, wipe, glow, float, bounce, overshoot).

## Step 5: scene schema and validator

A scene is JSON an agent can write:

```json
{
  "format": "square",
  "durationSec": 4,
  "background": "vellum",
  "title": "6 colors mapped to 18 faces.",
  "objects": [
    { "id": "ground", "type": "platform", "at": [0,0,0], "size": [6,4] },
    { "id": "tower", "type": "block", "at": [1,1,0.25], "size": [2,2,2.4], "faces": "brand" },
    { "id": "box2", "type": "block", "at": [4,1,0.25], "size": [1,1,1], "faces": "neutral" },
    { "id": "link", "type": "connector", "from": [3,2,1], "to": [4,2,1] }
  ],
  "callouts": [ { "text": "FIG. 01 / TOWER · 2×2×2.4M", "anchor": "tower" } ]
}
```

The validator returns a list of errors, not just pass/fail. Enforce from DESIGN.md:

1. Exactly one object with `faces: "brand"` (one highlight per surface).
2. Positions and sizes on a 0.25-module grid; nothing rotated.
3. Background is vellum or cream only.
4. Title and callout text are under 60 characters; no emoji.
5. Every callout anchor exists.

## Step 6: compositions

- `SocialCard`: 1080x1080 still. Vellum background, the scene centered and auto-fit with 1 module of clear space, title in `typography.h1` at top left, a mono figure label at bottom left. This is the frame at the end of the animation.
- `Clip`: 1080x1080 at 30 fps, same layout, objects drop in, callouts type in, holds on the final frame.
- `LogoClip`: the logo assembling per `motion.logo` (base 0 s, sides 0.36 s, locked 0.84 s, name 1.2 s). Eight 1-module brand blocks; check the construction against the logo pages of the Brand Standards PDF if you have it, otherwise ask me for a screenshot.

## Step 7: MCP server

Three tools, stdio transport, clear descriptions written for an agent:

| Tool | Input | Output |
|---|---|---|
| `get_brand` | none | Resolved tokens plus a short summary of the DESIGN.md rules |
| `compose_scene` | scene JSON | `{ ok, sceneId, errors[] }`; saves valid scenes to `out/scenes/` |
| `render` | `sceneId`, `kind: "png"or"mp4"` | Absolute file path of the render |

Tool descriptions must tell the agent: call `get_brand` first, fix every error `compose_scene` returns before rendering, and keep one brand object per scene.

## Step 8: prove it

1. Add `examples/tower.json` (the scene above) and render both PNG and MP4.
2. Render `LogoClip` to MP4.
3. Add a script `pnpm swap-test` that copies `tokens.json`, sets `color.chartreuse` to `#3A7BFF`, re-renders the tower PNG to `out/swap-test.png`, and restores the original file.
4. Add `README.md`: install, how to register the MCP server in Claude Code, and one example agent prompt.

## Out of scope for v1

Do not build: brand import, a review tool, plan_video, an asset library, more styles, a hosted renderer, a UI or editor, audio. If something seems necessary, stop and ask me.

## Working style

- Work step by step; run and check each step before the next.
- After Steps 3, 6 and 8, render a PNG and show me.
- Commit after each step with a short message.
