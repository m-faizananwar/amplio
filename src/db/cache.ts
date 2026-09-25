import "server-only";
import { revalidateTag, unstable_cache, updateTag } from "next/cache";

// Every /brand and /creator page is rendered per request (it reads the session
// cookie), so before this the shell and the page each re-queried neon on every
// sidebar click. The reads themselves don't depend on the cookie — only on the
// ids it resolves to — so they go in the data cache, keyed by owner and tagged
// so a mutation can drop exactly what it dirtied (src/lib/cache-tags.ts).
//
// `unstable_cache` rather than `"use cache"`: the latter needs the
// cacheComponents flag, which changes rendering semantics app-wide. This is the
// incremental half of the same idea and stays a one-line swap later.

// Ceiling, not a refresh interval: a tagged mutation drops the entry at once.
// The window only bounds writes we don't see (a reseed, direct SQL).
const DEFAULT_TTL_S = 300;

type CacheOptions = { tags: string[]; revalidate?: number };

/**
 * Wraps a read so identical calls share one result until a tag is revalidated.
 * `keyParts` names the read; the loader's arguments join the key automatically.
 */
export function cachedRead<A extends unknown[], R>(
  loader: (...args: A) => Promise<R>,
  keyParts: string[],
  options: CacheOptions,
): (...args: A) => Promise<R> {
  return unstable_cache(loader, keyParts, { tags: options.tags, revalidate: options.revalidate ?? DEFAULT_TTL_S });
}

/**
 * Drops every listed tag immediately, so the render that follows the action
 * reads the write back. Server actions only — next 16 refuses `updateTag`
 * anywhere else.
 */
export function updateTags(tags: string[]) {
  for (const value of tags) {
    try {
      updateTag(value);
    } catch {
      // The voice route calls the same actions from a route handler, where
      // next refuses `updateTag`. Expiring the tag is the same outcome, one
      // render later.
      revalidateTag(value, { expire: 0 });
    }
  }
}

/**
 * The same, from a route handler or a webhook, where `updateTag` throws.
 * `expire: 0` means no stale window: the next read goes to the database.
 */
export function expireTags(tags: string[]) {
  for (const value of tags) revalidateTag(value, { expire: 0 });
}
