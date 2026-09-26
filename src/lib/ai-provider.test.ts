import { describe, expect, it } from "vitest";
import { aiKeyEnvNames, resolveAiProvider } from "./ai-provider";

describe("resolveAiProvider", () => {
  it("picks anthropic first, then gemini, then the template", () => {
    expect(resolveAiProvider({ ANTHROPIC_API_KEY: "a", GEMINI_API_KEY: "g" }).name).toBe("anthropic");
    expect(resolveAiProvider({ GEMINI_API_KEY: "g" })).toEqual({ name: "gemini", apiKey: "g", envName: "GEMINI_API_KEY" });
    expect(resolveAiProvider({})).toEqual({ name: "template", apiKey: null, envName: null });
  });
  it("treats blank or whitespace-only keys as unset", () => {
    expect(resolveAiProvider({ ANTHROPIC_API_KEY: "  ", GEMINI_API_KEY: " g \n" })).toEqual({ name: "gemini", apiKey: "g", envName: "GEMINI_API_KEY" });
  });
  it("lists key-looking env names without values", () => {
    expect(aiKeyEnvNames({ ANTHROPIC_API_KEY: "", neon_GEMINI_API_KEY: "x", DATABASE_URL: "d" })).toEqual(["ANTHROPIC_API_KEY (empty)", "neon_GEMINI_API_KEY"]);
  });
});
