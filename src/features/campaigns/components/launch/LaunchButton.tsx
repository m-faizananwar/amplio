"use client";

import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import type { LaunchResultDto } from "../../schemas";
import { launchCampaign } from "../../server/actions";

const CENTS = 100;

// Launch: the campaign goes active and each selected creator gets a funded
// invitation. If the wallet runs short part-way, the rest are listed with
// the shortfall instead of silently dropped.
export function LaunchButton({ campaignId, creatorIds }: { campaignId: string; creatorIds: string[] }) {
  const t = useTranslations("brand.campaigns.launch.launch");
  const format = useFormatter();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LaunchResultDto | null>(null);
  const euros = (c: number) => format.number(c / CENTS, { style: "currency", currency: "EUR" });
  function launch() {
    setError(null);
    startTransition(async () => {
      const outcome = await launchCampaign({ campaignId, creatorIds });
      if (!outcome.ok) return void setError(outcome.error);
      const { invited, unfunded, skipped } = outcome.data;
      toast.success(t("toast", { count: invited.length }));
      if (unfunded.length === 0 && skipped.length === 0) return void router.push(`/brand/campaigns/${campaignId}?filter=waiting`);
      setResult(outcome.data);
    });
  }
  if (result) {
    return (
      <div className="grid gap-3 rounded-card border border-rule bg-surface p-5 text-small">
        <p className="font-medium">{t("done", { count: result.invited.length })}</p>
        {result.unfunded.length > 0 ? (
          <div>
            <p>{t("unfunded")}</p>
            <ul className="mt-1 list-disc pl-5 text-ink-muted">{result.unfunded.map((u) => <li key={u.creatorId}>{t("shortBy", { name: u.name, amount: euros(u.shortfallCents) })}</li>)}</ul>
            <Link href="/brand/billing" className={buttonVariants({ variant: "secondary", size: "sm", className: "mt-2" })}>{t("topUp")}</Link>
          </div>
        ) : null}
        {result.skipped.length > 0 ? <ul className="list-disc pl-5 text-ink-muted">{result.skipped.map((s) => <li key={s.creatorId}>{t(`skipped.${s.reason}`, { name: s.name })}</li>)}</ul> : null}
        <Link href={`/brand/campaigns/${campaignId}`} className={buttonVariants({ className: "justify-self-start" })}>{t("open")}</Link>
      </div>
    );
  }
  return (
    <div className="grid gap-2">
      <Button type="button" size="lg" onClick={launch} disabled={pending}>{pending ? t("launching") : creatorIds.length === 0 ? t("withoutInvites") : t("launchAndInvite", { count: creatorIds.length })}</Button>
      {error ? <p role="alert" className="rounded-control border border-failure/30 bg-failure-soft px-3 py-2 text-small text-failure">{error}</p> : null}
    </div>
  );
}
