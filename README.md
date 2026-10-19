# Blitterbox

An MCP server that lets any AI agent make on-brand isometric visuals: a square social graphic (PNG) and a short clip (MP4), both driven by `tokens.json`.

## Install

```
pnpm install
```

Requires Node 20+ and pnpm. Brand source files (tokens, design rules, logo assets) live in `tokens.json`, `DESIGN.md`, and `brand/`.

## Register the MCP server in Claude Code

Once published, install it and register the `blitterbox` bin as the server:

```
claude mcp add blitterbox -- npx blitterbox
```

Or add it directly to your Claude Code MCP config:

```json
{
  "mcpServers": {
    "blitterbox": {
      "command": "npx",
      "args": ["blitterbox"]
    }
  }
}
```

Working on this repo before it's published: run `npm run build` once, then point at the local checkout instead (`npx tsx /absolute/path/to/blitterbox/src/mcp/server.ts`, or `node /absolute/path/to/blitterbox/dist/mcp/server.js`).

Renders and composed scenes land in `./out/` relative to wherever the server is run from.

The server exposes three tools over stdio:

| Tool | Input | Output |
|---|---|---|
| `get_brand` | none | Resolved design tokens plus a summary of the brand rules |
| `compose_scene` | scene JSON | `{ ok, sceneId, errors[] }`; valid scenes are saved to `out/scenes/` |
| `render` | `{ sceneId, kind: "png" \| "mp4" }` | Absolute file path of the render |

## Example agent prompt

> Call `get_brand` to see the Blitterbox tokens and rules. Then build a scene showing a 2x2x2 brand tower next to a 1x1 neutral block on a 6x4 platform, with a callout labeling the tower. Call `compose_scene`, fix any errors it returns, then call `render` with `kind: "png"` to get the social graphic.

## Scripts

- `pnpm check:tokens` / `check:iso` / `check:motion` / `check:scene` — unit-style checks for each layer
- `pnpm render:tower` — renders `examples/tower.json` to PNG and MP4
- `pnpm render:logo-clip` — renders the LogoClip to MP4
- `pnpm swap-test` — proves the token pipeline: swaps `color.chartreuse`, re-renders, restores `tokens.json`
- `pnpm mcp:server` — runs the MCP server directly from source (stdio)
- `pnpm mcp:check` — exercises all three MCP tools end to end, against source
- `pnpm build` — compiles `src/` to `dist/` (what gets published)
- `pnpm check:dist` — builds, then exercises all three MCP tools against the compiled `dist/mcp/server.js`

## Repo layout

See `KICKOFF.md` for the full build spec. Source is organized as `src/tokens`, `src/iso`, `src/primitives`, `src/motion`, `src/scene`, `src/compositions`, `src/mcp`, `src/render`, `src/fonts`. `scripts/` holds build tooling (not published); `dist/` is the compiled, published output.
