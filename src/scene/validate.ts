import { SceneSchema, type Scene } from "./schema";

export interface ValidationResult {
  ok: boolean;
  scene?: Scene;
  errors: string[];
}

const GRID = 0.25;
const MAX_TEXT_LENGTH = 60;
// eslint-disable-next-line no-misleading-character-class
const EMOJI_PATTERN = /\p{Extended_Pictographic}/u;

function isGridAligned(n: number): boolean {
  const scaled = n / GRID;
  return Math.abs(scaled - Math.round(scaled)) < 1e-6;
}

function checkGridAligned(label: string, values: number[], errors: string[]): void {
  for (const v of values) {
    if (!isGridAligned(v)) {
      errors.push(`${label}: ${v} is not on the 0.25-module grid`);
    }
  }
}

function checkText(label: string, text: string, errors: string[]): void {
  if (text.length >= MAX_TEXT_LENGTH) {
    errors.push(`${label}: "${text}" is ${text.length} characters, must be under ${MAX_TEXT_LENGTH}`);
  }
  if (EMOJI_PATTERN.test(text)) {
    errors.push(`${label}: "${text}" contains an emoji, which is not allowed`);
  }
}

/** Validates a scene against the Blitterbox brand rules. Returns every error found, not just the first. */
export function validateScene(input: unknown): ValidationResult {
  const parsed = SceneSchema.safeParse(input);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => {
      const path = issue.path.join(".") || "(root)";
      return `${path}: ${issue.message}`;
    });
    return { ok: false, errors };
  }

  const scene = parsed.data;
  const errors: string[] = [];

  // Rule 1: exactly one object with faces: "brand".
  const brandObjects = scene.objects.filter((o) => o.type === "block" && o.faces === "brand");
  if (brandObjects.length === 0) {
    errors.push('Scene needs exactly one object with faces: "brand" (found 0)');
  } else if (brandObjects.length > 1) {
    errors.push(
      `Scene needs exactly one object with faces: "brand" (found ${brandObjects.length}: ${brandObjects
        .map((o) => o.id)
        .join(", ")})`,
    );
  }

  // Rule 2: positions and sizes on a 0.25-module grid; nothing rotated (no rotation field exists in the schema).
  for (const obj of scene.objects) {
    if (obj.type === "block" || obj.type === "platform") {
      checkGridAligned(`objects.${obj.id}.at`, obj.at, errors);
      checkGridAligned(`objects.${obj.id}.size`, obj.size, errors);
      if (obj.type === "platform" && obj.height !== undefined) {
        checkGridAligned(`objects.${obj.id}.height`, [obj.height], errors);
      }
    } else {
      checkGridAligned(`objects.${obj.id}.from`, obj.from, errors);
      checkGridAligned(`objects.${obj.id}.to`, obj.to, errors);
    }
  }

  // Rule 3: background is vellum or cream only (already enforced by the schema's enum).

  // Rule 4: title and callout text are under 60 characters; no emoji.
  checkText("title", scene.title, errors);
  for (const callout of scene.callouts) {
    checkText(`callouts[anchor=${callout.anchor}].text`, callout.text, errors);
  }

  // Rule 5: every callout anchor exists.
  const objectIds = new Set(scene.objects.map((o) => o.id));
  for (const callout of scene.callouts) {
    if (!objectIds.has(callout.anchor)) {
      errors.push(`callouts: anchor "${callout.anchor}" does not match any object id`);
    }
  }

  return { ok: errors.length === 0, scene, errors };
}
