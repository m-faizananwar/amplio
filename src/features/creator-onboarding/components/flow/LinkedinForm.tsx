"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { buttonVariants, Button } from "@/components/ui/button";
import { FormAlert } from "@/features/auth/components/FormAlert";
import { LinkedinFields } from "@/features/profile-fields/components/LinkedinFields";
import { WizardActions } from "@/components/flow/WizardActions";
import { cn } from "@/lib/cn";
import { ONBOARDING_STEPS } from "../../constants";
import { type LinkedinInput, linkedinSchema } from "../../schemas";
import { readLinkedinProfile } from "../../server/actions";
import { CreatorPreview } from "./CreatorPreview";
import type { CreatorCardData } from "./step-defaults";

// Paste the public profile URL; we read it once to fill the card. If it can't
// be read, say so and let the creator type the card by hand — never a guess.
export function LinkedinForm({ linkedinUrl, alreadyRead, card }: { linkedinUrl: string; alreadyRead: boolean; card: CreatorCardData }) {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const form = useForm<LinkedinInput>({ resolver: zodResolver(linkedinSchema), defaultValues: { linkedinUrl } });
  const busy = form.formState.isSubmitting;

  async function onSubmit(values: LinkedinInput) {
    setError(null);
    setFailed(false);
    // any failure — couldn't read, timed out, no token, or the request itself
    // failing — leaves the hand-typed path open instead of a silent reset
    try {
      const result = await readLinkedinProfile(values);
      if (!result.ok) return setFailed(true);
      router.push(ONBOARDING_STEPS.card.path);
    } catch {
      setFailed(true);
    }
  }

  return (
    <>
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid content-start gap-4" data-area="fields" noValidate>
      <LinkedinFields control={form.control} />
      <p className="text-small text-ink-muted">{t("creator.linkedin.privacy")}</p>
      <FormAlert message={error} />
      {failed ? (
        <div role="status" className="rounded-card border border-attention/30 bg-attention-soft p-4">
          <p className="font-medium text-attention">{t("creator.linkedin.failedTitle")}</p>
          <p className="mt-1 text-small text-ink-muted">{t("creator.linkedin.failedBody")}</p>
          <Link href={ONBOARDING_STEPS.card.path} className={cn(buttonVariants({ variant: "secondary" }), "mt-3")}>{t("creator.linkedin.manual")}</Link>
        </div>
      ) : null}
      <WizardActions backLabel={t("common.back")}>
        <Button type="submit" size="lg" className="h-11" disabled={busy}>{busy ? t("creator.linkedin.importing") : t("creator.linkedin.import")}</Button>
      </WizardActions>
      {alreadyRead ? (
        <Link href={ONBOARDING_STEPS.card.path} className="text-center text-small text-ink-muted underline-offset-4 hover:text-ink hover:underline">{t("common.continue")}</Link>
      ) : null}
    </form>
    <div data-area="card"><CreatorPreview data={card} /></div>
    </>
  );
}
