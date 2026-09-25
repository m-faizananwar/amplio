"use client";

import { Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { MarketplaceContextDto, MatchingResultDto } from "../../schemas";
import { recordNaoFeedback } from "../../server/actions";
import { CreatorLedgerRow } from "../ledger/CreatorLedgerRow";

const TRADEOFF_PREFIX = /^Trade-off:\s*/i;

// The assistant's answer: what you asked, why these creators, the one real
// trade-off, then the same ranked rows as the list (fit opens in place,
// Invite on the row). Feedback is stored, not just toasted.
export function MatchingAnswer({ prompt, result, ctx }: { prompt: string; result: MatchingResultDto; ctx: MarketplaceContextDto }) {
  const t = useTranslations("brand.creators.match");
  const creatorIds = result.creators.map((c) => c.id);
  const tradeoff = result.tradeoff.replace(TRADEOFF_PREFIX, "");
  async function feedback(kind: "up" | "down" | "copy") {
    if (kind === "copy") await navigator.clipboard.writeText(`${result.rationale}\n\n${result.tradeoff}`).catch(() => undefined);
    const saved = await recordNaoFeedback({ prompt, kind, creatorIds });
    if (!saved.ok) return void toast.error(saved.error);
    toast.success(t(`feedback.${kind}`));
  }
  return (
    <div className="grid gap-4 animate-rise">
      <blockquote className="ml-auto max-w-[85%] rounded-card rounded-br-sm bg-ink px-4 py-2 text-body text-paper">{prompt}</blockquote>
      <section className="grid gap-3 rounded-card border border-rule bg-surface p-5">
        <p className="font-medium">{t("headline", { count: result.creators.length, company: ctx.company })}</p>
        <p className="text-body text-ink">{result.rationale}</p>
        <p className="text-body text-ink-muted"><span className="font-medium text-ink">{t("tradeoff")}</span> {tradeoff}</p>
        <div className="flex items-center gap-1 text-ink-muted">
          <Button variant="ghost" size="icon-xs" aria-label={t("copy")} onClick={() => feedback("copy")}><Copy aria-hidden="true" /></Button>
          <Button variant="ghost" size="icon-xs" aria-label={t("good")} onClick={() => feedback("up")}><ThumbsUp aria-hidden="true" /></Button>
          <Button variant="ghost" size="icon-xs" aria-label={t("bad")} onClick={() => feedback("down")}><ThumbsDown aria-hidden="true" /></Button>
          <span className="ml-auto text-caption">{result.source === "model" ? t("byModel") : t("byTemplate")}</span>
        </div>
      </section>
      {result.creators.length === 0 ? (
        <p className="rounded-card border border-dashed border-rule-strong bg-surface px-5 py-8 text-center text-body text-ink-muted">{t("noMatch")}</p>
      ) : (
        <ol className="list-stagger divide-y divide-rule overflow-hidden rounded-card border border-rule bg-surface">
          {result.creators.map((c) => <CreatorLedgerRow key={c.id} creator={c} />)}
        </ol>
      )}
    </div>
  );
}
