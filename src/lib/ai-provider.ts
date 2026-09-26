// Which LLM the app talks to, decided from the environment once. Order:
// ANTHROPIC_API_KEY → GEMINI_API_KEY → template. Pure, so it can be tested
// with a fake env; /api/health reports the resolved name (never a value).
export type AiProviderName = "anthropic" | "gemini" | "template";
export type AiProvider = { name: AiProviderName; apiKey: string | null; envName: string | null };

export const AI_KEY_NAMES: ReadonlyArray<{ provider: Exclude<AiProviderName, "template">; envName: string }> = [
  { provider: "anthropic", envName: "ANTHROPIC_API_KEY" },
  { provider: "gemini", envName: "GEMINI_API_KEY" },
];

export function resolveAiProvider(env: Record<string, string | undefined>): AiProvider {
  for (const { provider, envName } of AI_KEY_NAMES) {
    const value = env[envName]?.trim();
    if (value) return { name: provider, apiKey: value, envName };
  }
  return { name: "template", apiKey: null, envName: null };
}

// Names (only) of env vars that look like an AI key, for /api/health's server log: shows a
// misspelt or prefixed variable without exposing anything.
export function aiKeyEnvNames(env: Record<string, string | undefined>): string[] {
  return Object.keys(env)
    .filter((k) => /ANTHROPIC|GEMINI|CLAUDE|GOOGLE_API/i.test(k))
    .map((k) => `${k}${env[k]?.trim() ? "" : " (empty)"}`)
    .sort();
}
