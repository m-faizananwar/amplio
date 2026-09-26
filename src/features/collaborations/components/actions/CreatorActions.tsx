"use client";

import { CalendarDays, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { nextStatus } from "@/lib/collaboration-status";
import type { CollaborationDto } from "../../schemas";
import { decideInvitation, publishPost, schedulePost, submitDraft } from "../../server/actions";
import { useDetailFormat } from "../detail/useDetailFormat";
import { ActionPanel, WaitingNote } from "./ActionPanel";
import { decideFacts, publishFacts, scheduleFacts } from "./action-facts";
import { DecidePanel } from "./DecideDialog";
import { FormDialogPanel } from "./FormDialogPanel";
import { DraftForm } from "./DraftForm";
import { PublishForm } from "./PublishForm";
import { ScheduleForm } from "./ScheduleForm";
import type { useCollaborationAction } from "./useCollaborationAction";

type Props = { collaboration: CollaborationDto; csrfToken: string; action: ReturnType<typeof useCollaborationAction> };

type PanelProps = { c: CollaborationDto; run: Props["action"]["run"]; isPending: boolean; base: { collaborationId: string; csrfToken: string } };

// First draft, or a resubmission with the brand's note above it.
function DraftPanel({ c, run, isPending, base }: PanelProps) {
  const t = useTranslations("collaboration.detail.creator");
  const v = { brand: c.brandCompany, round: c.revisionRound, max: c.maxRevisionRounds };
  const resubmit = c.status === "changes_requested";
  return (
    <ActionPanel title={resubmit ? t("resubmit.title", v) : t("draft.title")} description={resubmit ? t("resubmit.description", v) : t("draft.description", v)}>
      {resubmit && c.reviewNote ? (
        <blockquote className="mb-4 rounded-control border-l-2 border-attention bg-paper px-3 py-2 text-small">
          <span className="block text-caption text-ink-muted">{t("resubmit.noteLabel", v)}</span>{c.reviewNote}
        </blockquote>
      ) : null}
      <DraftForm initialText={c.draftText ?? ""} submitLabel={resubmit ? t("resubmit.submit") : t("draft.submit")} pendingLabel={t("draft.pending")} disabled={isPending}
        onSubmit={(values) => run("draft_submitted", () => submitDraft({ ...base, ...values }), t("toasts.draftSent", v))} />
    </ActionPanel>
  );
}

// Exactly the moves the state machine allows the creator, keyed on
// allowedEvents so a stale page can never show a button the server refuses.
// Each step opens a dialog with the facts it rests on.
export function CreatorActions({ collaboration: c, csrfToken, action }: Props) {
  const t = useTranslations("collaboration.detail.creator");
  const tf = useTranslations("collaboration.detail.facts");
  const tc = useTranslations("collaboration.detail");
  const fmt = useDetailFormat();
  const { run, isPending } = action;
  const can = (event: string) => c.allowedEvents.includes(event as CollaborationDto["allowedEvents"][number]);
  const base = { collaborationId: c.id, csrfToken };
  const v = { brand: c.brandCompany, amount: fmt.money(c.feeCents), round: c.revisionRound, max: c.maxRevisionRounds };

  if (can("accept") && can("decline")) {
    return (
      <DecidePanel facts={decideFacts(c, { role: "creator", t: tf, fmt })} disabled={isPending}
        labels={{ title: t("decide.title"), description: t("decide.description", v), open: t("decide.open"), accept: t("decide.accept"), decline: t("decide.decline"), declineArmed: t("decide.declineConfirm.title"), warning: t("decide.declineConfirm.body", v), cancel: tc("cancel") }}
        onDecide={(decision) => run(nextStatus(c.status, decision, "creator"), () => decideInvitation({ ...base, decision }), decision === "accept" ? t("toasts.accepted", v) : t("toasts.declined", v))} />
    );
  }
  if (can("submit_draft")) return <DraftPanel c={c} run={run} isPending={isPending} base={base} />;
  if (can("schedule")) {
    return (
      <FormDialogPanel title={t("schedule.title")} description={t("schedule.description")} openLabel={t("schedule.open")} submitLabel={t("schedule.submit")} cancelLabel={tc("cancel")}
        icon={<CalendarDays />} facts={scheduleFacts(c, tf, fmt)} disabled={isPending} formId="schedule-form"
        form={(done) => <ScheduleForm id="schedule-form" onDone={done} onSubmit={(values) => run("scheduled", () => schedulePost({ ...base, ...values }), t("toasts.scheduled", { date: fmt.date(values.scheduledAt) }))} />} />
    );
  }
  if (can("publish")) {
    return (
      <FormDialogPanel title={t("publish.title")} description={t("publish.description")} openLabel={t("publish.open")} submitLabel={t("publish.submit")} cancelLabel={tc("cancel")}
        icon={<Send />} facts={publishFacts(c, tf, fmt)} disabled={isPending} formId="publish-form"
        form={(done) => <PublishForm id="publish-form" onDone={done} onSubmit={(values) => run("live", () => publishPost({ ...base, ...values }), t("toasts.published", v))} />} />
    );
  }
  const waiting = ["applied", "draft_submitted", "live", "paid", "declined"].includes(c.status) ? t(`waiting.${c.status}`, v) : null;
  return waiting ? <WaitingNote text={waiting} /> : null;
}
