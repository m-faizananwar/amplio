// Where the Postgres URL comes from. A platform integration may write its
// variables with a project prefix (<prefix>_DATABASE_URL, …), so the app
// accepts the plain name first and the prefixed/alternate names after it:
// DATABASE_URL, <prefix>_DATABASE_URL, POSTGRES_URL, <prefix>_POSTGRES_URL.
// Pure: takes the env object explicitly, so it is safe from the proxy, the db
// client and drizzle-kit alike.
const PREFERENCE = ["DATABASE_URL", "POSTGRES_URL"] as const;

export type DatabaseUrlName = string;

// Prefixed candidates for one base name, sorted so the pick is stable when
// more than one prefix is set.
function prefixed(env: Record<string, string | undefined>, base: string): string[] {
  const suffix = `_${base}`;
  return Object.keys(env).filter((name) => name.endsWith(suffix) && name.length > suffix.length).sort();
}

export function resolveDatabaseUrl(env: Record<string, string | undefined>): { name: DatabaseUrlName; url: string } | null {
  for (const base of PREFERENCE) {
    for (const name of [base, ...prefixed(env, base)]) {
      const url = env[name];
      if (url) return { name, url };
    }
  }
  return null;
}
