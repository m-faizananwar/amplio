import { describe, expect, it } from "vitest";
import { resolveDatabaseUrl } from "./database-url";

describe("resolveDatabaseUrl", () => {
  it("prefers the plain name, then a prefixed and alternate names, in order", () => {
    expect(resolveDatabaseUrl({ DATABASE_URL: "a", neon_DATABASE_URL: "b" })).toEqual({ name: "DATABASE_URL", url: "a" });
    expect(resolveDatabaseUrl({ neon_DATABASE_URL: "b", POSTGRES_URL: "c" })).toEqual({ name: "neon_DATABASE_URL", url: "b" });
    expect(resolveDatabaseUrl({ POSTGRES_URL: "c", neon_POSTGRES_URL: "d" })).toEqual({ name: "POSTGRES_URL", url: "c" });
    expect(resolveDatabaseUrl({ neon_POSTGRES_URL: "d" })).toEqual({ name: "neon_POSTGRES_URL", url: "d" });
  });
  it("accepts any prefix and picks the same one every time when several are set", () => {
    expect(resolveDatabaseUrl({ zeta_DATABASE_URL: "z", alpha_DATABASE_URL: "a" })).toEqual({ name: "alpha_DATABASE_URL", url: "a" });
  });
  it("ignores look-alikes that only share part of the name", () => {
    expect(resolveDatabaseUrl({ neon_DATABASE_URL_UNPOOLED: "u", _DATABASE_URL: "x", MY_DATABASE_URLS: "y" })).toBeNull();
  });
  it("treats empty strings as unset and returns null when nothing is set", () => {
    expect(resolveDatabaseUrl({ DATABASE_URL: "" })).toBeNull();
    expect(resolveDatabaseUrl({})).toBeNull();
  });
});
