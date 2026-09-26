"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { WebsiteFields } from "@/features/profile-fields/components/WebsiteFields";
import { ICP_COUNT, WELCOME_PARAMS } from "../constants";
import { type OnboardingProfileDto, type ProfileInput, profileSchema, type WebsiteInput, websiteSchema } from "../schemas";
import { analyzeWebsite, completeOnboarding } from "../server/actions";
import { BrandPreview } from "./BrandPreview";
import { DraftForm } from "./DraftForm";
import { SortingWords } from "./SortingWords";

const SORTING_MIN_MS = 2_400;
const FALLBACK_WORDS = ["product", "customers", "teams", "pricing", "growth", "sales", "B2B", "platform", "pipeline", "leads"];

type Props = { profile: OnboardingProfileDto; hasDraft: boolean };

// the sorting animation runs long enough to read, however fast the site answers
async function atLeast<T>(task: Promise<T>, ms: number): Promise<T> {
  const [result] = await Promise.all([task, new Promise((r) => window.setTimeout(r, ms))]);
  return result;
}

function icpsOf(profile: OnboardingProfileDto) {
  const icps = profile.icps.slice(0, ICP_COUNT).map((i) => ({ title: i.title, description: i.description }));
  while (icps.length < ICP_COUNT) icps.push({ title: "", description: "" });
  return icps;
}

function wordsOf(profile: OnboardingProfileDto) {
  const s = profile.websiteSummary;
  const text = [s?.title, s?.description, ...(s?.headings ?? [])].filter(Boolean).join(" ");
  const words = text.split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 3).slice(0, 18);
  return words.length >= 6 ? words : FALLBACK_WORDS;
}

// Brand onboarding on one screen, as the wizard card: paste the website,
// watch it being read, and the AI draft (value proposition + three ideal
// customers) appears under it, editable, before anything is used. Beside it,
// the brand's profile card fills in live and turns over to the facts once
// the draft lands. The rail (in the page) moves to Profile at the same time.
export function BrandSetup({ profile, hasDraft }: Props) {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "reading">("idle");
  const [readFailed, setReadFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const site = useForm<WebsiteInput>({ resolver: zodResolver(websiteSchema), defaultValues: { url: profile.website ?? "" } });
  const draft = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), values: { valueProp: profile.valueProp, icps: icpsOf(profile) } });
  const url = useWatch({ control: site.control, name: "url" });
  const [valueProp, icps] = useWatch({ control: draft.control, name: ["valueProp", "icps"] });

  async function read(values: WebsiteInput) {
    setError(null);
    setPhase("reading");
    const result = await atLeast(analyzeWebsite(values), SORTING_MIN_MS);
    setPhase("idle");
    if (!result.ok) return setError(result.error);
    setReadFailed(!result.data.read);
    router.refresh();
  }

  async function finish(values: ProfileInput) {
    setError(null);
    const result = await completeOnboarding(values);
    if (!result.ok) return setError(result.error);
    const params = new URLSearchParams({ [WELCOME_PARAMS.campaign]: result.data.campaignId, [WELCOME_PARAMS.step]: WELCOME_PARAMS.stepValue });
    router.push(`/brand/creators/matching?${params.toString()}`);
  }

  const host = hostOf(url ?? "");
  const reading = phase === "reading";
  const status = reading ? t("brand.sorting.reading", { host }) : !hasDraft ? t("preview.brand.statusEmpty") : profile.onboarded ? t("preview.brand.statusReady") : t("preview.brand.status");

  return (
    <>
      <div data-area="fields" className="grid content-start gap-8">
        <form onSubmit={site.handleSubmit(read)} className="grid gap-4" noValidate>
          <WebsiteFields control={site.control} />
          {reading ? null : (
            <Button type="submit" size="lg" variant={hasDraft ? "secondary" : "primary"} className="h-11">{hasDraft ? t("brand.reanalyze") : t("brand.analyze")}</Button>
          )}
        </form>
        {reading ? <SortingWords words={wordsOf(profile)} labels={{ title: t("brand.sorting.title"), valueProp: t("brand.sorting.valueProp"), idealCustomers: t("brand.sorting.idealCustomers"), reading: t("brand.sorting.reading", { host }) }} /> : null}
        {hasDraft && !reading ? (
          <DraftForm form={draft} readFailedUrl={readFailed ? profile.website ?? host : null} error={error} alreadySetUp={profile.onboarded} onFinish={finish} />
        ) : !reading ? <FormAlert message={error} /> : null}
      </div>
      <div data-area="card">
        <BrandPreview company={profile.company} website={url ?? ""} valueProp={hasDraft ? valueProp ?? "" : ""} icps={hasDraft ? icps ?? [] : []} status={status} showBack={hasDraft && !reading} />
      </div>
    </>
  );
}

function hostOf(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
