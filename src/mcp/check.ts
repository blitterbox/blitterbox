import path from "node:path";
import fs from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const serverPath = path.join(import.meta.dirname, "server.ts");
const towerPath = path.join(import.meta.dirname, "..", "..", "examples", "tower.json");
const tower = JSON.parse(fs.readFileSync(towerPath, "utf-8"));

function text(result: { content: Array<{ type: string; text?: string }> }): unknown {
  const first = result.content[0];
  return first?.text ? JSON.parse(first.text) : first;
}

async function main() {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.join(import.meta.dirname, "..", "..", "node_modules", "tsx", "dist", "cli.mjs"), serverPath],
  });
  const client = new Client({ name: "blitterbox-check", version: "0.0.1" });
  await client.connect(transport);

  const tools = await client.listTools();
  console.log(
    "tools:",
    tools.tools.map((t) => t.name),
  );

  const brand = await client.callTool({ name: "get_brand", arguments: {} });
  const brandData = text(brand as any) as { tokens: unknown; summary: string };
  console.log("get_brand: tokens.color.chartreuse =", (brandData.tokens as any).color.chartreuse);
  console.log("get_brand: summary starts with:", brandData.summary.slice(0, 40));

  const badCompose = await client.callTool({
    name: "compose_scene",
    arguments: { ...tower, background: "chartreuse" },
  });
  console.log("compose_scene (bad):", text(badCompose as any));

  const goodCompose = await client.callTool({ name: "compose_scene", arguments: tower });
  const composeData = text(goodCompose as any) as { ok: boolean; sceneId: string; errors: string[] };
  console.log("compose_scene (good):", composeData);

  const render = await client.callTool({
    name: "render",
    arguments: { sceneId: composeData.sceneId, kind: "png" },
  });
  console.log("render png:", text(render as any));

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
