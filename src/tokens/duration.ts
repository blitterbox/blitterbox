const DURATION_PATTERN = /^([\d.]+)(ms|s)$/;

/** Parses a token duration string ("120ms", "1.2s") to milliseconds. */
export function parseDurationMs(duration: string): number {
  const match = duration.match(DURATION_PATTERN);
  if (!match) {
    throw new Error(`Invalid duration token: "${duration}" (expected e.g. "120ms" or "1.2s")`);
  }
  const [, amount, unit] = match;
  const value = Number(amount);
  return unit === "s" ? value * 1000 : value;
}

/** Converts a token duration string to a frame count at the given fps. */
export function durationToFrames(duration: string, fps: number): number {
  return Math.round((parseDurationMs(duration) / 1000) * fps);
}
