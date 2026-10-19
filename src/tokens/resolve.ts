/**
 * DTCG-style token resolver: walks a raw tokens.json tree, resolving
 * `{path.to.token}` reference strings against the same tree, and strips
 * `$`-prefixed metadata ($type, $description, $extensions) from the output.
 */

const REFERENCE_PATTERN = /^\{([a-zA-Z0-9_.-]+)\}$/;

function getNodeAtPath(root: unknown, path: string): unknown {
  const parts = path.split(".");
  let cur: unknown = root;
  for (const part of parts) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

export function resolveTokens(raw: unknown): Record<string, unknown> {
  const cache = new Map<string, unknown>();

  function resolvePath(path: string, visiting: Set<string>): unknown {
    if (cache.has(path)) return cache.get(path);
    if (visiting.has(path)) {
      throw new Error(
        `Unresolved reference: circular reference while resolving "{${path}}"`,
      );
    }

    const node = getNodeAtPath(raw, path);
    if (
      node === undefined ||
      typeof node !== "object" ||
      node === null ||
      !("$value" in node)
    ) {
      throw new Error(
        `Unresolved reference: "{${path}}" does not point to a token with a $value`,
      );
    }

    const nextVisiting = new Set(visiting);
    nextVisiting.add(path);
    const resolved = resolveValue((node as { $value: unknown }).$value, nextVisiting);
    cache.set(path, resolved);
    return resolved;
  }

  function resolveValue(value: unknown, visiting: Set<string>): unknown {
    if (typeof value === "string") {
      const match = value.match(REFERENCE_PATTERN);
      if (match) return resolvePath(match[1]!, visiting);
      return value;
    }
    if (Array.isArray(value)) {
      return value.map((item) => resolveValue(item, visiting));
    }
    if (value !== null && typeof value === "object") {
      const out: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        if (key.startsWith("$")) continue;
        out[key] = resolveValue(val, visiting);
      }
      return out;
    }
    return value;
  }

  function buildGroup(node: unknown, path: string): unknown {
    if (node !== null && typeof node === "object" && "$value" in node) {
      return resolvePath(path, new Set());
    }
    if (node !== null && typeof node === "object") {
      const out: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(node)) {
        if (key.startsWith("$")) continue;
        out[key] = buildGroup(val, path ? `${path}.${key}` : key);
      }
      return out;
    }
    return node;
  }

  return buildGroup(raw, "") as Record<string, unknown>;
}
