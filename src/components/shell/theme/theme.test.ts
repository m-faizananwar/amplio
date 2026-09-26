import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { choiceFromCookie, resolveTheme, THEME_BOOT_SCRIPT } from "./theme";

// Runs the boot script against a fake document and OS preference.
function boot(cookie: string, osDark: boolean) {
  const classes = new Set<string>();
  const listeners: Array<() => void> = [];
  const root = { classList: { toggle: (c: string, on: boolean) => (on ? classes.add(c) : classes.delete(c)) }, style: { colorScheme: "" } };
  const media = { matches: osDark, addEventListener: (_: string, fn: () => void) => listeners.push(fn) };
  runInNewContext(THEME_BOOT_SCRIPT, { document: { cookie, documentElement: root }, matchMedia: () => media });
  return { dark: classes.has("dark"), colorScheme: root.style.colorScheme, listening: listeners.length > 0 };
}

describe("theme choice", () => {
  it("is light with no cookie, whatever the OS says", () => {
    expect(choiceFromCookie("")).toBe("light");
    expect(resolveTheme(choiceFromCookie(""), true)).toBe("light");
  });
  it("reads an explicit pick and ignores stale values", () => {
    expect(choiceFromCookie("a=1; amplio-theme=dark")).toBe("dark");
    expect(choiceFromCookie("amplio-theme=system")).toBe("system");
    expect(choiceFromCookie("amplio-theme=sepia")).toBe("light");
  });
  it("asks the OS only for an explicit system pick", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
  });
});

describe("boot script", () => {
  it("paints light with no cookie on a dark OS, and doesn't listen to the OS", () => {
    expect(boot("", true)).toEqual({ dark: false, colorScheme: "light", listening: false });
  });
  it("paints dark when dark was picked", () => {
    expect(boot("amplio-theme=dark", false)).toMatchObject({ dark: true, colorScheme: "dark" });
  });
  it("follows the OS, and its changes, only when system was picked", () => {
    expect(boot("amplio-theme=system", true)).toEqual({ dark: true, colorScheme: "dark", listening: true });
  });
});
