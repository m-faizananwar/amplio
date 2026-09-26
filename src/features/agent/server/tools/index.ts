import "server-only";
import { BRAND_READS } from "./brand-read";
import { BRAND_WRITES } from "./brand-write";
import { CREATOR_TOOLS } from "./creator";
import { rememberTool } from "./remember";
import type { AgentTool } from "./types";

// The registry. A role only ever sees (and can only ever run) its own tools:
// the model gets these declarations, and every call is looked up here again.
const ALL: AgentTool[] = [...BRAND_READS, ...BRAND_WRITES, rememberTool("brand"), ...CREATOR_TOOLS, rememberTool("creator")];

export function toolsFor(role: "brand" | "creator"): AgentTool[] {
  return ALL.filter((t) => t.role === role);
}

export function findTool(role: "brand" | "creator", name: string): AgentTool | null {
  return toolsFor(role).find((t) => t.name === name) ?? null;
}

export function declarationsFor(role: "brand" | "creator") {
  return toolsFor(role).map((t) => ({ name: t.name, description: t.description, parameters: t.parameters }));
}
