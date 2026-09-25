import type { CollaborationDto } from "@/features/collaborations/schemas";
import { formatDate } from "@/lib/dates";
import { formatCents } from "@/lib/money";
import type { NeedsYouItem } from "@/lib/creator-next-step";

export type NeedsYouRow = { key: string; title: string; detail: string; href: string; cta: string };

const CURRENCY = "EUR";

function collaborationRow(c: CollaborationDto): NeedsYouRow {
  const href = `/creator/collaborations/${c.id}`;
  const fee = formatCents(c.feeCents, CURRENCY);
  const due = c.dueDate ? ` · due ${formatDate(c.dueDate)}` : "";
  const base = `${c.campaignName} · ${fee}${due}`;
  switch (c.status) {
    case "invited":
      return { key: c.id, title: `${c.brandCompany} invited you`, detail: `${base} · fee held`, href, cta: "Answer" };
    case "changes_requested":
      return { key: c.id, title: `${c.brandCompany} asked for changes`, detail: `Round ${c.revisionRound} of ${c.maxRevisionRounds} · ${base}`, href, cta: "Update draft" };
    case "scheduled":
      return { key: c.id, title: `Publish your post for ${c.brandCompany}`, detail: `Scheduled ${formatDate(c.scheduledAt)} · add the post URL once it's live`, href, cta: "Add post URL" };
    case "approved":
      return { key: c.id, title: `${c.brandCompany} approved your draft`, detail: `${base} · pick a publish date`, href, cta: "Schedule" };
    default:
      return { key: c.id, title: `Write the draft for ${c.brandCompany}`, detail: base, href, cta: "Write draft" };
  }
}

// Turns the ordered Needs-you items into display rows: one line, one button.
export function toNeedsYouRows(items: NeedsYouItem[], byId: Map<string, CollaborationDto>): NeedsYouRow[] {
  return items.flatMap((item): NeedsYouRow[] => {
    if (item.kind === "withdraw") {
      return [{ key: "withdraw", title: `${formatCents(item.availableCents, CURRENCY)} ready to withdraw`, detail: "Paid out from collaborations that went live", href: "/creator/earnings?withdraw=1", cta: "Withdraw" }];
    }
    if (item.kind === "setup") {
      return [{ key: "setup", title: "Finish your card", detail: "Brands can't book you until your card has a price and industries", href: "/creator/settings", cta: "Finish card" }];
    }
    const c = byId.get(item.id);
    return c ? [collaborationRow(c)] : [];
  });
}
