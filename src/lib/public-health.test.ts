import { describe, expect, it } from "vitest";
import { publicHealth } from "./public-health";

describe("publicHealth", () => {
  it("shows categories and presence, never env var names or error text", () => {
    const env = { neon_DATABASE_URL: "postgres://secret", ANTHROPIC_API_KEY: "k", NEXT_PUBLIC_VAPI_PUBLIC_KEY: "p", VAPI_PRIVATE_KEY: "v", VERCEL_GIT_COMMIT_SHA: "abc" };
    const body = publicHealth({ db: { ok: true }, ai: { provider: "gemini" }, env });
    expect(body).toEqual({ ok: true, db: "ok", ai: "gemini", voice: "vapi", email: "on-screen", commit: "abc" });
    expect(JSON.stringify(body)).not.toMatch(/DATABASE_URL|API_KEY|postgres/);
  });
  it("reports the failure category when the database is down", () => {
    expect(publicHealth({ db: { ok: false, reason: "not configured" }, ai: { provider: "template" }, env: {} })).toMatchObject({ ok: false, db: "not configured", commit: "local", voice: "web-speech" });
  });
});
