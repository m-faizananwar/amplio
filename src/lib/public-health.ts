// What /api/health shows to anyone: categories and presence only. Env var
// names, provider error text and probe details stay in the server log.
export type PublicHealthInput = {
  db: { ok: boolean; reason?: string };
  ai: { provider: string };
  env: Record<string, string | undefined>;
};

export type PublicHealth = { ok: boolean; db: string; ai: string; voice: "vapi" | "web-speech"; email: "resend" | "on-screen"; commit: string };

export function publicHealth({ db, ai, env }: PublicHealthInput): PublicHealth {
  return {
    ok: db.ok,
    db: db.ok ? "ok" : (db.reason ?? "unreachable"),
    // the provider that actually answered a probe (cached 10 min)
    ai: ai.provider,
    voice: env.NEXT_PUBLIC_VAPI_PUBLIC_KEY && env.VAPI_PRIVATE_KEY ? "vapi" : "web-speech",
    email: env.RESEND_API_KEY ? "resend" : "on-screen",
    commit: env.VERCEL_GIT_COMMIT_SHA ?? env.GITHUB_SHA ?? "local",
  };
}
