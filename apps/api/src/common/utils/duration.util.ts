const UNIT_TO_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

/**
 * Parses short duration strings such as `15m`, `7d`, `30s` into milliseconds.
 * Mirrors the subset of the `ms`/`jsonwebtoken` duration syntax we rely on.
 */
export function parseDurationToMs(duration: string): number {
  const match = /^(\d+)\s*(ms|s|m|h|d)$/.exec(duration.trim());

  if (!match) {
    throw new Error(
      `Invalid duration string: "${duration}". Expected formats like "15m", "7d".`,
    );
  }

  const value = Number(match[1]);
  const unit = match[2];

  return value * UNIT_TO_MS[unit];
}
