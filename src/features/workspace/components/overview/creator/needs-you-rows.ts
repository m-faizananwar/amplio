import type { CollaborationDto } from "@/features/collaborations/schemas";
import type { CollaborationStatus } from "@/lib/collaboration-status";
import type { NeedsYouItem } from "@/lib/next-step";

// glyph: the StatusGlyph drawn beside the row (money waiting shows the coin,
// an unfinished card the pen).
export type NeedsYouRow = { key: string; glyph: CollaborationStatus; title: string; detail: string; href: string; cta: string };

// next-intl's translator for creator.overview.needsYou, and the viewer's
// money and date formatters (passed in so this stays a plain function).
type T = (key: string, values?: Record<string, string | number>) => string;
type Fmt = { money: (cents: number) => string; date: (iso: string) => string };

function collaborationRow(c: CollaborationDto, t: T, fmt: Fmt): NeedsYouRow {
  const href = `/creator/collaborations/${c.id}`;
  const v = { brand: c.brandCompany, campaign: c.campaignName, amount: fmt.money(c.feeCents) };
  const row = (kind: string, detailKey: string, extra: Record<string, string | number> = {}) => ({
    key: c.id, glyph: c.status, href, title: t(`${kind}.title`, v), detail: t(`${kind}.${detailKey}`, { ...v, ...extra }), cta: t(`${kind}.action`),
  });
  switch (c.status) {
    case "invited":
      return c.acceptBy ? row("invitation", "detail", { date: fmt.date(c.acceptBy) }) : row("invitation", "detailNoDate");
    case "changes_requested":
      return row("changesRequested", "detail", { round: c.revisionRound, max: c.maxRevisionRounds });
    case "scheduled":
      return row("publish", "detail", { date: c.scheduledAt ? fmt.date(c.scheduledAt) : "—" });
    case "approved":
      return row("schedule", "detail");
    default:
      return c.dueDate ? row("draft", "detail", { date: fmt.date(c.dueDate) }) : row("draft", "detailNoDate");
  }
}

// Turns the ordered Needs-you items into display rows: one line, one button.
type Options = { byId: Map<string, CollaborationDto>; t: T; fmt: Fmt; setup: "detailPrice" | "detailIndustries" | "detailBoth" };

export function toNeedsYouRows(items: NeedsYouItem[], { byId, t, fmt, setup }: Options): NeedsYouRow[] {
  return items.flatMap((item): NeedsYouRow[] => {
    if (item.kind === "withdraw") {
      return [{ key: "withdraw", glyph: "paid", title: t("withdraw.title", { amount: fmt.money(item.availableCents) }), detail: t("withdraw.detail"), href: "/creator/earnings?withdraw=1", cta: t("withdraw.action") }];
    }
    if (item.kind === "setup") {
      return [{ key: "setup", glyph: "draft_submitted", title: t("setup.title"), detail: t(`setup.${setup}`), href: "/creator/settings#pricing", cta: t("setup.action") }];
    }
    const c = byId.get(item.id);
    return c ? [collaborationRow(c, t, fmt)] : [];
  });
}
