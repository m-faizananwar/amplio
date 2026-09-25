"use client";

import { useOptimistic } from "react";
import type { CollaborationDetailDto, ViewerRole } from "../../schemas";
import { BrandActions } from "../actions/BrandActions";
import { CreatorActions } from "../actions/CreatorActions";
import { useCollaborationAction } from "../actions/useCollaborationAction";
import { CollaborationHeader } from "./CollaborationHeader";
import { DraftPreview } from "./DraftPreview";
import { EventTimeline } from "./EventTimeline";
import { MoneyNote } from "./MoneyNote";
import { OfferTerms } from "./OfferTerms";
import { TrackedLinkCard } from "./TrackedLinkCard";

type Props = { detail: CollaborationDetailDto; role: ViewerRole; csrfToken: string };

// The one screen where a status changes. The status is optimistic; the action
// panel follows the server's allowedEvents so it can never lie. Main column:
// what to do now, the draft, the link, the history. Side: the money and terms.
export function CollaborationDetail({ detail, role, csrfToken }: Props) {
  const { collaboration: c, events, brief, trackedUrl } = detail;
  const [status, setOptimisticStatus] = useOptimistic(c.status);
  const action = useCollaborationAction(setOptimisticStatus);
  const Actions = role === "creator" ? CreatorActions : BrandActions;
  return (
    <div className="animate-rise">
      <CollaborationHeader collaboration={c} status={status} role={role} brief={brief} />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid gap-4" aria-busy={action.isPending || undefined}>
          <Actions collaboration={c} csrfToken={csrfToken} action={action} />
          <DraftPreview collaboration={c} role={role} />
          <TrackedLinkCard collaboration={c} trackedUrl={trackedUrl} />
          <EventTimeline events={events} role={role} collaboration={c} />
        </div>
        <aside className="grid gap-4">
          {role === "creator" ? <MoneyNote collaboration={{ ...c, status }} /> : null}
          <OfferTerms collaboration={c} />
        </aside>
      </div>
    </div>
  );
}
