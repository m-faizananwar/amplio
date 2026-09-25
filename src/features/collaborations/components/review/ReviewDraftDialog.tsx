"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { type CollaborationDto, type ReviewFormInput, reviewFormSchema } from "../../schemas";

type Props = { collaboration: CollaborationDto; open: boolean; onOpenChange: (open: boolean) => void; disabled: boolean; onSubmit: (values: ReviewFormInput) => Promise<boolean> };

const NOTE_ROWS = 4;

type FooterProps = { changing: boolean; setChanging: (v: boolean) => void; capReached: boolean; busy: boolean; disabled: boolean; submit: (d: ReviewFormInput["decision"]) => void };

function ReviewFooter({ changing, setChanging, capReached, busy, disabled, submit }: FooterProps) {
  const t = useTranslations("collaboration.detail.brand.review");
  return (
    <DialogFooter>
      {changing ? (
        <>
          <Button type="button" variant="secondary" disabled={busy} onClick={() => setChanging(false)}>{t("back")}</Button>
          <Button type="button" disabled={disabled || busy} onClick={() => submit("request_changes")}>{busy ? t("sending") : t("sendChanges")}</Button>
        </>
      ) : (
        <>
          <Button type="button" variant="secondary" disabled={disabled || capReached} onClick={() => setChanging(true)}>{t("requestChanges")}</Button>
          <Button type="button" disabled={disabled || busy} onClick={() => submit("approve")}>{busy ? t("approving") : t("approve")}</Button>
        </>
      )}
    </DialogFooter>
  );
}

// The full draft, then approve it or send it back with a required note.
// Requesting changes stops once the revision rounds are used up.
export function ReviewDraftDialog({ collaboration: c, open, onOpenChange, disabled, onSubmit }: Props) {
  const t = useTranslations("collaboration.detail.brand.review");
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>
        <p className="flex justify-between gap-3 text-caption text-ink-muted">
          <span>{c.creatorName} · {c.campaignName}</span>
          <span className="num">{t("round", { round: Math.min(c.revisionRound + 1, c.maxRevisionRounds), max: c.maxRevisionRounds })}</span>
        </p>
        <article className="max-h-80 overflow-y-auto whitespace-pre-line rounded-control border border-rule bg-paper p-4 text-body leading-relaxed">{c.draftText ?? t("noDraft")}</article>
        {changing ? (
          <div className="grid gap-1.5">
            <label htmlFor="reviewNote" className="text-small font-medium">{t("noteLabel")}</label>
            <Textarea id="reviewNote" rows={NOTE_ROWS} autoFocus aria-invalid={Boolean(errors.note)} placeholder={t("notePlaceholder")} {...form.register("note")} />
            {errors.note ? <p role="alert" className="text-caption text-failure">{errors.note.message}</p> : null}
          </div>
        ) : capReached ? <p className="rounded-control bg-tint px-3 py-2 text-caption text-ink-muted">{t("capReached", { max: c.maxRevisionRounds })}</p> : null}
        <ReviewFooter changing={changing} setChanging={setChanging} capReached={capReached} busy={isSubmitting} disabled={disabled} submit={submit} />
      </DialogContent>
    </Dialog>
  );
}
