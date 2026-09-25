import type { CollaborationDto } from "@/features/collaborations/schemas";
import type { EarningsSummary } from "@/features/payouts/server/queries";
import { needsYou } from "@/lib/creator-next-step";
import { formatCents } from "@/lib/money";
import { CreatorNumbers } from "./CreatorNumbers";
import { NeedsYouList } from "./NeedsYouList";
import { toNeedsYouRows } from "./needs-you-rows";

type Props = {
  firstName: string;
  collaborations: CollaborationDto[];
  earnings: EarningsSummary;
  clicks: number;
  setupIncomplete: boolean;
};

const LIVE = new Set(["live", "paid"]);

// Overview = Needs you, then three numbers. Nothing else: everything else is
// one click away in the rail.
export function CreatorOverview({ firstName, collaborations, earnings, clicks, setupIncomplete }: Props) {
  const items = needsYou(collaborations, { availableCents: earnings.availableCents, setupIncomplete });
  const rows = toNeedsYouRows(items, new Map(collaborations.map((c) => [c.id, c])));
  const live = collaborations.filter((c) => LIVE.has(c.status)).length;
  const title = rows.length === 0 ? `You're all caught up, ${firstName}` : `${rows.length} ${rows.length === 1 ? "thing needs" : "things need"} you, ${firstName}`;
  return (
    <div className="grid gap-8 animate-rise">
      <header>
        <h1 className="text-h2">{title}</h1>
        <p className="mt-1 text-ink-muted">Most urgent first. Everything else is in the rail.</p>
      </header>
      <NeedsYouList rows={rows} />
      <CreatorNumbers
        numbers={[
          { key: "earned", label: "Earned to date", value: formatCents(earnings.totalEarnedCents, "EUR"), note: `${earnings.paidCollaborations} paid ${earnings.paidCollaborations === 1 ? "collaboration" : "collaborations"}`, href: "/creator/earnings" },
          { key: "clicks", label: "Clicks on your links", value: clicks.toLocaleString("en-US"), note: "Every click is a row", href: "/creator/analytics" },
          { key: "live", label: "Live posts", value: String(live), note: "Published with a tracked link", href: "/creator/collaborations?filter=live" },
        ]}
      />
    </div>
  );
}
