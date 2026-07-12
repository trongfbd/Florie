import { slugify } from './slugify.util';

/**
 * Builds a slug from `source`, appending -2, -3, ... until `isTaken`
 * reports no conflict. `excludeId` lets an update skip its own row.
 */
export async function generateUniqueSlug(
  source: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = slugify(source);
  let candidate = base;
  let attempt = 1;

  while (await isTaken(candidate)) {
    attempt += 1;
    candidate = `${base}-${attempt}`;
  }

  return candidate;
}
