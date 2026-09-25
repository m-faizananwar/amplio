"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { StepRail } from "@/components/flow/StepRail";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { BrandProfileFields } from "@/features/profile-fields/components/BrandProfileFields";
import { WebsiteFields } from "@/features/profile-fields/components/WebsiteFields";
import { ICP_COUNT, WELCOME_PARAMS } from "../constants";
import { type OnboardingProfileDto, type ProfileInput, profileSchema, type WebsiteInput, websiteSchema } from "../schemas";
import { analyzeWebsite, completeOnboarding } from "../server/actions";
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

// Brand onboarding on one screen: paste the website, watch it being read,
// and the AI draft (value proposition + three ideal customers) appears right
// under it, editable, before anything is used. The rail moves from Website
// to Profile when the draft lands.
export function BrandSetup({ profile, hasDraft }: Props) {
  const t = useTranslations("onboarding");
  const tAuth = useTranslations("auth.signUp");
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "reading">("idle");
  const [readFailed, setReadFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const site = useForm<WebsiteInput>({ resolver: zodResolver(websiteSchema), defaultValues: { url: profile.website ?? "" } });
  const steps = tAuth.raw("stepsBrand") as string[];
  const current = hasDraft ? 2 : 1;

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

  const host = (() => {
    try {
      return new URL(site.getValues("url")).host;
    } catch {
      return site.getValues("url");
    }
  })();

  return (
    <>
      <StepRail steps={steps} current={current} label={t("rail.label")} stepOf={t("rail.stepOf", { current: current + 1, total: steps.length })} className="mb-10" />
      <h1 className="text-h2">{t("brand.title")}</h1>
      <p className="mt-2 text-ink-muted">{t("brand.sub")}</p>

      <form onSubmit={site.handleSubmit(read)} className="mt-8 grid gap-4" noValidate>
        <WebsiteFields control={site.control} />
        {phase === "idle" ? (
          <Button type="submit" size="lg" variant={hasDraft ? "secondary" : "primary"} className="h-11">{hasDraft ? t("brand.reanalyze") : t("brand.analyze")}</Button>
        ) : null}
      </form>

      {phase === "reading" ? (
        <div className="mt-8"><SortingWords words={wordsOf(profile)} labels={{ title: t("brand.sorting.title"), valueProp: t("brand.sorting.valueProp"), idealCustomers: t("brand.sorting.idealCustomers"), reading: t("brand.sorting.reading", { host }) }} /></div>
      ) : null}

      {hasDraft && phase === "idle" ? (
        <DraftForm profile={profile} readFailedUrl={readFailed ? profile.website ?? host : null} error={error} onFinish={finish} />
      ) : phase === "idle" ? <div className="mt-4"><FormAlert message={error} /></div> : null}
    </>
  );
}

type DraftProps = { profile: OnboardingProfileDto; readFailedUrl: string | null; error: string | null; onFinish: (values: ProfileInput) => Promise<void> };

// The AI draft, editable in place: value proposition and three ideal customers.
function DraftForm({ profile, readFailedUrl, error, onFinish }: DraftProps) {
  const t = useTranslations("onboarding.brand");
  const draft = useForm<ProfileInput>({ resolver: zodResolver(profileSchema), values: { valueProp: profile.valueProp, icps: icpsOf(profile) } });
  const busy = draft.formState.isSubmitting;
  return (
    <form onSubmit={draft.handleSubmit(onFinish)} className="mt-10 grid animate-rise gap-6 border-t border-rule pt-8" noValidate>
      <div>
        <h2 className="text-h3">{t("draftTitle")}</h2>
        <p className="mt-1.5 text-ink-muted">{t("draftSub")}</p>
        {readFailedUrl ? <p className="mt-3 rounded-control border border-attention/30 bg-attention-soft px-3 py-2 text-small text-attention">{t("readFailed", { url: readFailedUrl })}</p> : null}
      </div>
      <BrandProfileFields control={draft.control} />
      <FormAlert message={error} />
      <Button type="submit" size="lg" className="h-11" disabled={busy}>{busy ? t("finishing") : t("finish")}</Button>
      {profile.onboarded ? <p className="text-center text-small text-ink-muted">{t("alreadySetUp")}</p> : null}
    </form>
  );
}
