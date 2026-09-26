import type { AgentEvent } from "./events";

// A brand turn from question to confirm, and a creator turn, exactly as the
// stream sends them; the UI is built against these (and /dev/ui).
export const BRAND_RUN_FIXTURE: AgentEvent[] = [
  { type: "message", id: "m1", text: "I'll look for French B2B SaaS creators under €500 for your Q4 campaign, then book the three that fit best.", final: true },
  { type: "step", id: "s1", label: "Reading your campaigns", status: "running", tool: "listCampaigns" },
  { type: "step", id: "s1", label: "Reading your campaigns", status: "done", tool: "listCampaigns", output: "2 campaigns · Q4 launch is active" },
  { type: "step", id: "s2", label: "Searching creators", status: "running", tool: "searchCreators", input: "France · B2B, SaaS · ≤ €500 · fit for Q4 launch" },
  { type: "step", id: "s2", label: "Searching creators", status: "done", tool: "searchCreators", output: "7 match, 3 best by fit" },
  { type: "result", kind: "creators", title: "Best fit for Q4 launch", items: [
    { id: "c1", handle: "claire-martin", name: "Claire Martin", headline: "SaaS growth, weekly teardown", country: "FR", industries: ["SaaS", "B2B"], followers: 18_400, priceCents: 42_000, fitScore: 91, fitReason: "Writes for SaaS founders in France" },
    { id: "c2", handle: "hugo-lefevre", name: "Hugo Lefèvre", headline: "B2B sales notes", country: "FR", industries: ["B2B", "Sales"], followers: 9_200, priceCents: 28_000, fitScore: 84 },
    { id: "c3", handle: "ines-roux", name: "Inès Roux", headline: "Product-led growth", country: "FR", industries: ["SaaS"], followers: 12_700, priceCents: 35_000, fitScore: 80 },
  ] },
  { type: "confirm", id: "pa_123", title: "Book 3 creators for Q4 launch", facts: [
    { label: "Creators", value: "Claire Martin, Hugo Lefèvre, Inès Roux" },
    { label: "Held from your wallet", value: "€1,050.00", cents: 105_000 },
    { label: "Wallet after", value: "€4,460.00", cents: 446_000 },
  ], confirmLabel: "Book all three", cancelLabel: "Not now", expiresAt: "2026-09-26T18:10:00.000Z" },
  { type: "done", threadId: "t_1" },
];

export const CREATOR_RUN_FIXTURE: AgentEvent[] = [
  { type: "question", text: "Which kind of campaigns do you want? I'll skip anything outside it.", chips: ["SaaS only", "Anything B2B", "Paid over €300", "Due this month"] },
  { type: "step", id: "s1", label: "Reading open campaigns", status: "done", tool: "listOpportunities", output: "8 open · 3 above 80% fit" },
  { type: "result", kind: "opportunities", title: "Open campaigns that fit you", items: [
    { campaignId: "k1", campaign: "Zune creator brief", brand: "Zune", fitScore: 88, priceCents: 31_500, postDeadline: "2026-10-09" },
  ] },
  { type: "confirm", id: "pa_456", title: "Apply to Zune creator brief", facts: [{ label: "Your price", value: "€315.00", cents: 31_500 }, { label: "Post deadline", value: "9 Oct 2026" }], confirmLabel: "Apply", cancelLabel: "Not now", expiresAt: "2026-09-26T18:10:00.000Z" },
  { type: "done", threadId: "t_2" },
];
