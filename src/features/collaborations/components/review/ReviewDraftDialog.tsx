"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, FileText, PenLine } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { type UseFormRegisterReturn, useForm } from "react-hook-form";
import { ActionDialog } from "@/components/dialog/ActionDialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { type CollaborationDto, type ReviewFormInput, reviewFormSchema } from "../../schemas";
import { useDetailFormat } from "../detail/useDetailFormat";

type Props = { collaboration: CollaborationDto; open: boolean; onOpenChange: (open: boolean) => void; disabled: boolean; onSubmit: (values: ReviewFormInput) => Promise<boolean> };

const NOTE_ROWS = 4;

type ActionsProps = { changing: boolean; setChanging: (v: boolean) => void; capReached: boolean; busy: boolean; disabled: boolean; submit: (d: ReviewFormInput["decision"]) => void };

function ReviewActions({ changing, setChanging, capReached, busy, disabled, submit }: ActionsProps) {
  const t = useTranslations("collaboration.detail.brand.review");
  if (changing) {
    return (
      <>
        <Button type="button" variant="quiet" disabled={busy} onClick={() => setChanging(false)}>{t("back")}</Button>
        <Button type="button" icon={<PenLine />} disabled={disabled || busy} onClick={() => submit("request_changes")}>{busy ? t("sending") : t("sendChanges")}</Button>
      </>
    );
  }
  return (
    <>
      <Button type="button" variant="quiet" disabled={disabled || capReached} onClick={() => setChanging(true)}>{t("requestChanges")}</Button>
      <Button type="button" icon={<Check />} disabled={disabled || busy} onClick={() => submit("approve")}>{busy ? t("approving") : t("approve")}</Button>
    </>
  );
}

type BodyProps = { draft: string | null; changing: boolean; capReached: boolean; max: number; error?: string; register: UseFormRegisterReturn<"note"> };

// The draft itself, then the note field while changes are being written (or
// the line saying the revision rounds are used up).
function ReviewBody({ draft, changing, capReached, max, error, register }: BodyProps) {
  const t = useTranslations("collaboration.detail.brand.review");
  return (
    <>
    <article className="max-h-80 overflow-y-auto whitespace-pre-line rounded-control border border-rule bg-surface p-4 text-body leading-relaxed">{draft ?? t("noDraft")}</article>
    {changing ? (
      <div className="grid gap-1.5">
        <label htmlFor="reviewNote" className="text-small font-medium">{t("noteLabel")}</label>
        <Textarea id="reviewNote" rows={NOTE_ROWS} autoFocus aria-invalid={Boolean(error)} placeholder={t("notePlaceholder")} {...register} />
        {error ? <p role="alert" className="text-caption text-failure">{error}</p> : null}
      </div>
    ) : capReached ? <p className="rounded-control bg-tint px-3 py-2 text-caption text-ink-muted">{t("capReached", { max })}</p> : null}
    </>
  );
}

// The full draft with who, which campaign, which round and the fee beside
// it; approve it or send it back with a required note. Requesting changes
// stops once the revision rounds are used up.
export function ReviewDraftDialog({ collaboration: c, open, onOpenChange, disabled, onSubmit }: Props) {
  const t = useTranslations("collaboration.detail.brand.review");
  const fmt = useDetailFormat();
  const [changing, setChanging] = useState(false);
  const form = useForm<ReviewFormInput>({ resolver: zodResolver(reviewFormSchema), defaultValues: { decision: "approve", note: "" } });
  const { errors, isSubmitting } = form.formState;
  const capReached = c.revisionRound >= c.maxRevisionRounds;

  async function submit(decision: ReviewFormInput["decision"]) {
    form.setValue("decision", decision);
    await form.handleSubmit(async (values) => {
      if (await onSubmit(values)) {
        onOpenChange(false);
        setChanging(false);
        form.reset();
      }
    })();
  }

  return (
    <ActionDialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      icon={<FileText />}
      tone="attention"
      title={t("dialogTitle")}
      sub={t("dialogDescription")}
      facts={[
        { label: t("facts.creator"), value: c.creatorName },
        { label: t("facts.campaign"), value: c.campaignName },
        { label: t("facts.round"), value: t("round", { round: Math.min(c.revisionRound + 1, c.maxRevisionRounds), max: c.maxRevisionRounds }), mono: true },
        { label: t("facts.fee"), value: fmt.money(c.feeCents), mono: true, tone: "money" },
      ]}
      action={<ReviewActions changing={changing} setChanging={setChanging} capReached={capReached} busy={isSubmitting} disabled={disabled} submit={submit} />}
      cancelLabel={t("cancel")}
    >
      <ReviewBody draft={c.draftText} changing={changing} capReached={capReached} max={c.maxRevisionRounds} error={errors.note?.message} register={form.register("note")} />
    </ActionDialog>
  );
}
