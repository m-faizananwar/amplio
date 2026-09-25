"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { nextStatus } from "@/lib/collaboration-status";
import type { CollaborationDto } from "../../schemas";
import { decideApplication, payCollaboration, reviewDraft } from "../../server/actions";
import { useDetailFormat } from "../detail/useDetailFormat";
import { ReviewDraftDialog } from "../review/ReviewDraftDialog";
import { ActionPanel, WaitingNote } from "./ActionPanel";
import { DecisionButtons } from "./DecisionButtons";
import type { useCollaborationAction } from "./useCollaborationAction";

type Props = { collaboration: CollaborationDto; csrfToken: string; action: ReturnType<typeof useCollaborationAction> };

// The brand's allowed moves: accept/decline an application, review a draft,
// release the fee on a live post. Anything else is the creator's turn.
export function BrandActions({ collaboration: c, csrfToken, action }: Props) {
  const t = useTranslations("collaboration.detail.brand");
  const fmt = useDetailFormat();
  const { run, isPending } = action;
  const [reviewing, setReviewing] = useState(false);
  const can = (event: string) => c.allowedEvents.includes(event as CollaborationDto["allowedEvents"][number]);
  const base = { collaborationId: c.id, csrfToken };
  const v = { creator: c.creatorName, amount: fmt.money(c.feeCents), max: c.maxRevisionRounds };

  if (can("accept") && can("decline")) {
    return (
      <ActionPanel title={t("decide.title")} description={t("decide.description", v)}>
        <DecisionButtons acceptLabel={t("decide.accept")} declineLabel={t("decide.decline")} declineConfirm={t("decide.declineConfirm.title")} declineWarning={t("decide.declineConfirm.body", v)} disabled={isPending}
          onDecide={(decision) => run(nextStatus(c.status, decision, "brand"), () => decideApplication({ ...base, decision }), decision === "accept" ? t("toasts.accepted", v) : t("toasts.declined"))} />
      </ActionPanel>
    );
  }
  if (can("approve") || can("request_changes")) {
    return (
      <ActionPanel title={t("review.title")} description={t("review.description")}>
        <Button type="button" disabled={isPending} onClick={() => setReviewing(true)}>{t("review.open")}</Button>
        <ReviewDraftDialog collaboration={c} open={reviewing} onOpenChange={setReviewing} disabled={isPending}
          onSubmit={(values) => run(nextStatus(c.status, values.decision, "brand"), () => reviewDraft({ ...base, ...values }), values.decision === "approve" ? t("toasts.approved", v) : t("toasts.changesRequested"))} />
      </ActionPanel>
    );
  }
  if (can("pay")) {
    return (
      <ActionPanel title={t("pay.title")} description={t("pay.description", v)}>
        {/* Money leaves the brand on this click and can't come back: two clicks, like a delete. */}
        <ConfirmButton variant="primary" disabled={isPending} confirmLabel={t("pay.confirm", v)} onConfirm={async () => { await run("paid", () => payCollaboration(base), t("toasts.paid", v)); }}>{t("pay.action", v)}</ConfirmButton>
      </ActionPanel>
    );
  }
  const waiting = ["invited", "accepted", "changes_requested", "approved", "scheduled", "paid", "declined"].includes(c.status) ? t(`waiting.${c.status}`, v) : null;
  return waiting ? <WaitingNote text={waiting} /> : null;
}
