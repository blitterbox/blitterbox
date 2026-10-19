import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { tokens } from "../tokens/index";
import { validateScene } from "../scene/validate";
import { renderSceneStill, renderCompositionVideo } from "../render/index";
import { BRAND_SUMMARY } from "./brandSummary";
import { ensureOutDirs, SCENES_DIR, RENDERS_DIR } from "./paths";

const server = new McpServer({ name: "blitterbox", version: "0.1.0" });

function jsonResult(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] };
}

server.registerTool(
  "get_brand",
  {
    title: "Get brand",
    description:
      "Call this first, before composing any scene. Returns the resolved Blitterbox design tokens " +
      "(colors, face rule, isometric geometry, typography, motion timing) plus a short summary of the " +
      "DESIGN.md brand rules an agent must follow (one brand highlight per scene, 0.25-module grid, " +
      "text length limits, forbidden motion, voice).",
  },
  async () => jsonResult({ tokens, summary: BRAND_SUMMARY }),
);

server.registerTool(
  "compose_scene",
  {
    title: "Compose scene",
    description:
      "Validates a Blitterbox scene (the JSON shape documented in get_brand's summary and KICKOFF.md) " +
      "against every brand rule and returns every error found, not just the first. Fix every error " +
      "before calling render. On success, saves the scene to disk and returns a sceneId to pass to render.",
    inputSchema: z.record(z.string(), z.unknown()),
  },
  async (scene) => {
    const result = validateScene(scene);
    if (!result.ok) {
      return jsonResult({ ok: false, sceneId: null, errors: result.errors });
    }

    ensureOutDirs();
    const sceneId = crypto.randomUUID();
    fs.writeFileSync(path.join(SCENES_DIR, `${sceneId}.json`), JSON.stringify(result.scene, null, 2));

    return jsonResult({ ok: true, sceneId, errors: [] });
  },
);

server.registerTool(
  "render",
  {
    title: "Render",
    description:
      "Renders a scene previously saved by compose_scene. kind 'png' renders the SocialCard still " +
      "(the frame at the end of the animation); kind 'mp4' renders the Clip video. Returns the " +
      "absolute file path of the render.",
    inputSchema: { sceneId: z.string(), kind: z.enum(["png", "mp4"]) },
  },
  async ({ sceneId, kind }) => {
    const scenePath = path.join(SCENES_DIR, `${sceneId}.json`);
    if (!fs.existsSync(scenePath)) {
      throw new Error(`Unknown sceneId: "${sceneId}". Call compose_scene first.`);
    }
    const sceneJson = JSON.parse(fs.readFileSync(scenePath, "utf-8"));
    const result = validateScene(sceneJson);
    if (!result.ok) {
      throw new Error(`Saved scene "${sceneId}" is no longer valid: ${result.errors.join("; ")}`);
    }

    ensureOutDirs();
    const outputPath = path.join(RENDERS_DIR, `${sceneId}.${kind}`);

    if (kind === "png") {
      await renderSceneStill(result.scene!, outputPath);
    } else {
      await renderCompositionVideo("Clip", outputPath, { scene: result.scene! });
    }

    return jsonResult({ path: outputPath });
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
