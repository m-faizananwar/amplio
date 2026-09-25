"use client";

import { ArrowUp, Square } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { type FormEvent, useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TrailLoader } from "@/components/graphics/TrailLoader";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { MATCHING_PROMPT_MAX_LENGTH } from "../../constants";
import type { MarketplaceContextDto, MatchingResultDto } from "../../schemas";
import { runMatching } from "../../server/actions";
import { CampaignSelector } from "../filters/CampaignSelector";
import { MarketplaceProvider } from "../MarketplaceProvider";
import { MatchingAnswer } from "./MatchingAnswer";

const ROWS_SKELETON = 4;

// Describe who you want; the assistant ranks the marketplace against the
// campaign brief and says why, with one trade-off. The answer lands as the
// same rows as the ranked list, so everything you can do there works here.
export function MatchingView({ ctx }: { ctx: MarketplaceContextDto }) {
  const t = useTranslations("brand.creators.match");
  const campaign = ctx.selectedCampaign?.name ?? ctx.company;
  const [prompt, setPrompt] = useState(() => t("defaultPrompt", { campaign }));
  const [asked, setAsked] = useState<string | null>(null);
  const [result, setResult] = useState<MatchingResultDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const runId = useRef(0);

  async function run(text = prompt) {
    if (!ctx.selectedCampaign || !text.trim()) return;
    const id = ++runId.current;
    setPending(true);
    setError(null);
    setAsked(text);
    const response = await runMatching({ campaignId: ctx.selectedCampaign.id, prompt: text });
    if (id !== runId.current) return; // stopped or superseded
    setPending(false);
    if (!response.ok) return void (setError(response.error), setResult(null));
    setResult(response.data);
  }
  const submit = (e: FormEvent) => { e.preventDefault(); if (!pending) void run(); };
  const stop = () => { runId.current += 1; setPending(false); };

  if (!ctx.selectedCampaign) {
    return <EmptyState title={t("noCampaign.title")} body={t("noCampaign.body")} action={<Link href="/brand/campaigns/new" className={buttonVariants()}>{t("noCampaign.action")}</Link>} />;
  }
  const suggestions = [
    ctx.icpTitles[0] ? t("suggestions.icp", { icp: ctx.icpTitles[0] }) : null,
    ctx.targetIndustries[0] ? t("suggestions.industry", { industry: ctx.targetIndustries[0] }) : null,
    t("suggestions.balanced", { company: ctx.company }),
  ].filter((s): s is string => Boolean(s));

  return (
    <MarketplaceProvider ctx={ctx}>
      <div className="grid gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xl text-body text-ink-muted">{t("intro")}</p>
          <CampaignSelector campaigns={ctx.campaigns} selected={ctx.selectedCampaign} />
        </div>
        <form onSubmit={submit} className="relative rounded-card border border-rule bg-surface p-3 focus-within:border-ink">
          <label htmlFor="match-prompt" className="sr-only">{t("promptLabel")}</label>
          <Textarea id="match-prompt" value={prompt} maxLength={MATCHING_PROMPT_MAX_LENGTH} rows={3} onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) submit(e); }}
            className="min-h-20 resize-none border-0 bg-transparent p-0 pr-12 focus-visible:ring-0" />
          {pending
            ? <Button type="button" size="icon-sm" variant="secondary" aria-label={t("stop")} onClick={stop} className="absolute right-3 bottom-3"><Square className="size-3.5" aria-hidden="true" /></Button>
            : <Button type="submit" size="icon-sm" aria-label={t("send")} disabled={!prompt.trim()} className="absolute right-3 bottom-3"><ArrowUp aria-hidden="true" /></Button>}
        </form>
        {!asked ? (
          <ul className="flex flex-wrap gap-2">
            {suggestions.map((s) => <li key={s}><Button variant="secondary" size="sm" onClick={() => { setPrompt(s); void run(s); }}>{s}</Button></li>)}
          </ul>
        ) : null}
        {error ? <p role="alert" className="rounded-control border border-failure/30 bg-failure-soft px-3 py-2 text-small text-failure">{error}</p> : null}
        {pending ? (
          <div className="grid gap-2" aria-busy="true" aria-live="polite">
            <p className="flex items-center gap-2 text-small text-ink-muted"><TrailLoader label={t("ranking")} />{t("ranking")}</p>
            {Array.from({ length: ROWS_SKELETON }, (_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : asked && result ? <MatchingAnswer prompt={asked} result={result} ctx={ctx} /> : null}
      </div>
    </MarketplaceProvider>
  );
}
