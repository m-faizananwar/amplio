import "server-only";
import { getCampaign } from "@/features/campaigns/server/read-campaigns";
import { listBrandCollaborations, listCreatorCollaborations } from "@/features/collaborations/server/queries";
import { obj, type ReadTool, str, type ToolContext } from "./types";

// Opens a page for the user (the call widget and the chat follow a `navigate`
// event). Only this role's own pages, and a campaign or collaboration only if
// it is theirs; the path is built here, never taken from the model.
const PAGES = {
  brand: { overview: "", creators: "/creators", matching: "/creators/matching", campaigns: "/campaigns", collaborations: "/collaborations", results: "/results", messages: "/messages", billing: "/billing", settings: "/settings" },
  creator: { overview: "", card: "/card", opportunities: "/opportunities", collaborations: "/collaborations", analytics: "/analytics", earnings: "/earnings", messages: "/messages", settings: "/settings" },
} as const;

// A campaign's own pages: its overview, the launch flow (invites creators,
// holds their fees: the page asks before anything moves), the brief editor,
// and its results.
const SECTIONS: Record<string, string> = { overview: "", launch: "/launch", brief: "/brief/edit", results: "/analytics", analytics: "/analytics" };
export function campaignPath(campaignId: string, section: unknown): string {
  return `/brand/campaigns/${campaignId}${SECTIONS[typeof section === "string" ? section : "overview"] ?? ""}`;
}

async function detailPath(ctx: ToolContext, role: "brand" | "creator", a: Record<string, unknown>): Promise<string | null> {
  if (typeof a.collaborationId === "string") {
    const rows = role === "brand" ? await listBrandCollaborations(ctx.viewer.brand?.id ?? "") : await listCreatorCollaborations(ctx.viewer.creator?.id ?? "");
    return rows.some((c) => c.id === a.collaborationId) ? `/${role}/collaborations/${a.collaborationId}` : null;
  }
  if (role === "brand" && typeof a.campaignId === "string") {
    return (await getCampaign(ctx.viewer.brand?.id ?? "", a.campaignId)) ? campaignPath(a.campaignId, a.section) : null;
  }
  return null;
}

export const openPageTool = (role: "brand" | "creator"): ReadTool => ({
  name: "openPage", role, kind: "read", label: "Opening the page",
  description: `Open a page on the user's screen. page is one of: ${Object.keys(PAGES[role]).join(", ")}. Or pass a collaborationId${role === "brand" ? " or campaignId" : ""} from a tool result to open that one. Use it when the user asks to see or open something.`,
  parameters: obj({ page: str("A page name"), collaborationId: str("Open this collaboration"), ...(role === "brand" ? { campaignId: str("Open this campaign"), section: str("For a campaign: overview, launch (the launch flow), brief (edit the brief) or results") } : {}) }),
  async run(ctx, a) {
    const pages: Record<string, string> = PAGES[role];
    const detail = await detailPath(ctx, role, a);
    const page = typeof a.page === "string" ? a.page.toLowerCase() : "";
    const href = detail ?? (page in pages ? `/${role}${pages[page]}` : null);
    if (!href) return { summary: "no such page", data: { error: "Not a page this account can open." } };
    return { summary: href.replace(`/${role}`, "") || "/", data: { opened: true }, navigate: href };
  },
});
