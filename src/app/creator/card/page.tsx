import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ErrorState } from "@/components/page/ErrorState";
import { getViewer } from "@/features/auth/server/session";
import { CardIncomplete } from "@/features/workspace/components/card/CardIncomplete";
import { CreatorCardView } from "@/features/workspace/components/card/CreatorCardView";
import { LinksSection } from "@/features/workspace/components/card/LinksSection";
import { buttonVariants } from "@/components/ui/button";
import { getAffiliateSummary } from "@/features/workspace/server/affiliate-queries";
import { getPublicCard } from "@/features/workspace/server/card-queries";

import { BRAND } from "@/config/brand";
export const metadata: Metadata = { title: `My card · ${BRAND.wordmark}` };

export default async function CreatorCardPage() {
  const viewer = await getViewer();
  if (!viewer?.creator) redirect("/login");
  const { handle, id } = viewer.creator;
  let data;
  try {
    data = await Promise.all([getPublicCard(handle), getAffiliateSummary(id), headers(), getTranslations("creator.card")]);
  } catch (error) {
    console.error("[card] my card failed", { creatorId: id, error });
    return <ErrorState body="We could not load your card. Try again in a moment." retryHref="/creator/card" />;
  }
  const [card, affiliate, h, t] = data;
  if (!card) redirect("/login");
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host") ?? "localhost:3000"}`;
  return (
    <div className="grid gap-6 animate-rise">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-h2">{t("title")}</h1>
          <p className="mt-1 text-ink-muted">{t("description")}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/creator/settings#card" className={buttonVariants({ variant: "secondary" })}>{t("actions.edit")}</Link>
          <Link href={`/c/${card.handle}`} target="_blank" className={buttonVariants({ variant: "ghost" })}>{t("actions.openPublic")}</Link>
        </div>
      </header>
      <CardIncomplete missingPrice={card.priceCents <= 0} missingIndustries={card.industries.length === 0} />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="grid gap-2">
          <CreatorCardView card={card} />
          <p className="text-caption text-ink-muted">{t("stubNote")}</p>
        </div>
        <LinksSection dealUrl={`${origin}/c/${card.handle}`} referralUrl={`${origin}/register/brand?ref=${card.handle}`} affiliate={affiliate} />
      </div>
    </div>
  );
}
