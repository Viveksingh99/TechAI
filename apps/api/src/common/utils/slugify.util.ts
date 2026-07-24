/**
 * Converts a title/name into a URL-safe slug, e.g. "Hello, World!" ->
 * "hello-world". Appends a short random suffix when `unique` is true, to
 * reduce the chance of collisions before a DB uniqueness check runs.
 */
export function slugify(input: string, unique = false): string {
  const base = input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!unique) {
    return base;
  }

  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}
