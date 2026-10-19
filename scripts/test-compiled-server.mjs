// Throwaway local check: exercise the COMPILED dist/mcp/server.js (not tsx)
// directly, to catch dist-specific issues before the full pack/install proof.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(here, "..", "dist", "mcp", "server.js");
const towerPath = path.join(here, "..", "examples", "tower.json");
const tower = JSON.parse(fs.readFileSync(towerPath, "utf-8"));

function text(result) {
  const first = result.content[0];
  return first?.text ? JSON.parse(first.text) : first;
}

async function main() {
  const transport = new StdioClientTransport({ command: process.execPath, args: [serverPath] });
  const client = new Client({ name: "blitterbox-dist-check", version: "0.0.1" });
  await client.connect(transport);

  const tools = await client.listTools();
  console.log("tools:", tools.tools.map((t) => t.name));

  const brand = await client.callTool({ name: "get_brand", arguments: {} });
  console.log("get_brand ok:", !!text(brand).tokens);

  const compose = await client.callTool({ name: "compose_scene", arguments: tower });
  const composeData = text(compose);
  console.log("compose_scene:", composeData);
  if (!composeData.ok) throw new Error("compose_scene failed");

  const render = await client.callTool({ name: "render", arguments: { sceneId: composeData.sceneId, kind: "png" } });
  console.log("render raw:", JSON.stringify(render, null, 2));

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
