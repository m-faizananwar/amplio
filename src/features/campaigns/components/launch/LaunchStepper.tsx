import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BriefEditor } from "../brief/BriefEditor";
import type { BrandProfile, CampaignDto, LaunchStepData } from "../../schemas";
import { BasicsForm } from "./BasicsForm";
import { type GeneratedWith, GeneratedWithBanner } from "./GeneratedWithBanner";
import { PickCreatorsForm } from "./PickCreatorsForm";
import { ReviewStep } from "./ReviewStep";
import { StepNav } from "./StepNav";

type Props = { campaign: CampaignDto; brand: BrandProfile; data: LaunchStepData; generatedWith?: GeneratedWith };

// Four steps from draft to live: basics, the brief, who to invite, then the
// numbers and launch. Each step is its own URL, so back and refresh work.
export async function LaunchStepper({ campaign, brand, data, generatedWith }: Props) {
  const t = await getTranslations("brand.campaigns.launch");
  const base = `/brand/campaigns/${campaign.id}/launch`;
  return (
    <div className="grid gap-6">
      <div>
        <Link href="/brand/campaigns" className="inline-flex items-center gap-1 text-small text-ink-muted hover:text-ink"><ChevronLeft className="size-4" aria-hidden="true" />{t("back")}</Link>
        <h1 className="mt-2 text-h3">{campaign.name}</h1>
        <div className="mt-4"><StepNav campaignId={campaign.id} active={data.step} /></div>
      </div>
      {generatedWith ? <GeneratedWithBanner generatedWith={generatedWith} /> : null}
      <div>
        <h2 className="text-h4">{t(`steps.${data.step}`)}</h2>
        <p className="mt-1 text-small text-ink-muted">{t(`stepHints.${data.step}`)}</p>
      </div>
      {data.step === "basics" ? <BasicsForm campaign={campaign} nextHref={`${base}?step=brief`} cancelHref={`/brand/campaigns/${campaign.id}`} /> : null}
      {data.step === "brief" ? <BriefEditor campaignId={campaign.id} initial={campaign.brief} cancelHref={`${base}?step=basics`} afterSaveHref={`${base}?step=creators`} saveLabel={t("saveContinue")} /> : null}
      {data.step === "creators" ? <PickCreatorsForm campaignId={campaign.id} creators={data.creators} walletCents={brand.walletCents} backHref={`${base}?step=brief`} /> : null}
      {data.step === "review" ? <ReviewStep campaign={campaign} creators={data.creators} estimate={data.estimate} walletCents={brand.walletCents} /> : null}
    </div>
  );
}
