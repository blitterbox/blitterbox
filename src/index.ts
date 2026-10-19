/**
 * Library entry point (no side effects — the MCP server itself is a
 * separate `bin` entry, see src/mcp/server.ts). Re-exports the pieces
 * useful for programmatic use: tokens, scene schema/validation, rendering.
 */
export * from "./tokens/index";
export * from "./scene/schema";
export { validateScene } from "./scene/validate";
export type { ValidationResult } from "./scene/validate";
export { renderSceneStill, renderCompositionStill, renderCompositionVideo } from "./render/index";
