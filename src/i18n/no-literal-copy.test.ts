import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

// Every word a signed-in user reads comes from messages/, so French is never
// half a page. This fails on the two ways English slips past review: text
// written between JSX tags, and a string literal in a prop a person reads
// (placeholder, aria-label, title…). It is a scan, not a proof: a string built
// in a variable and passed down is not caught.

const ROOT = process.cwd();
// The two apps and everything they render. Public, auth and onboarding are
// scanned by their own builder's test when it lands; the demo landing plays a
// customer's English-only site on purpose.
const SCANNED = [
  "src/app/brand", "src/app/creator",
  "src/components/shell", "src/components/page", "src/components/trail",
  "src/features/assistant", "src/features/campaigns", "src/features/collaborations", "src/features/marketplace",
  "src/features/payouts", "src/features/tracking", "src/features/workspace",
];
const SKIPPED = ["src/features/tracking/components/demo"];
const READ_PROPS = new Set(["placeholder", "aria-label", "title", "alt", "label", "heading", "description"]);
// Names and formats, the same in every language.
const ALLOWED = new Set(["LinkedIn", "CSV", "https://", "€"]);
const HAS_WORD = /\p{L}{2,}/u;

function tsxFiles(dir: string): string[] {
  const abs = path.join(ROOT, dir);
  return readdirSync(abs).flatMap((name) => {
    const rel = path.join(dir, name);
    if (SKIPPED.includes(rel)) return [];
    if (statSync(path.join(ROOT, rel)).isDirectory()) return tsxFiles(rel);
    return rel.endsWith(".tsx") ? [rel] : [];
  });
}

function literalsIn(file: string): string[] {
  const source = ts.createSourceFile(file, readFileSync(path.join(ROOT, file), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found: string[] = [];
  const at = (node: ts.Node) => `${file}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1}`;
  const flag = (node: ts.Node, text: string) => {
    const trimmed = text.trim();
    if (HAS_WORD.test(trimmed) && !ALLOWED.has(trimmed)) found.push(`${at(node)} ${JSON.stringify(trimmed.slice(0, 60))}`);
  };
  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node)) flag(node, node.text);
    if (ts.isJsxAttribute(node) && READ_PROPS.has(node.name.getText()) && node.initializer && ts.isStringLiteral(node.initializer)) {
      flag(node, node.initializer.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

describe("app views", () => {
  it("render no copy that isn't in messages/", () => {
    const literals = SCANNED.flatMap(tsxFiles).flatMap(literalsIn);
    expect(literals).toEqual([]);
  });
});
