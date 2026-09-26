"use client";

import { Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCall } from "../callContext";
import { CallTimer } from "./CallTimer";

// Beside the rail's Agentic mode item: a phone to start a call, or, while one is on,
// a green live dot with the call's time (a dot alone when the rail is folded).
// Both are the call window's origin: it grows out of here and folds back in.
export function RailCallControl({ folded }: { folded: boolean }) {
  const call = useCall();
  const t = useTranslations("shell.nav");
  const tc = useTranslations("agent.call");
  if (!call) return null;
  const live = call.status === "live" || call.status === "connecting";
  if (live) {
    return folded
      ? <span data-call-origin role="status" aria-label={tc("live")} className="call-live-dot pointer-events-none absolute top-2 left-8" />
      : (
        <span data-call-origin role="status" aria-label={tc("live")} className="pointer-events-none absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center gap-1.5 text-caption text-money">
          <span className="call-live-dot" aria-hidden="true" />
          <CallTimer startedAt={call.startedAt} />
        </span>
      );
  }
  if (folded) return null;
  return (
    <button type="button" data-call-origin onClick={call.start} aria-label={t("callAgent")} data-tip={t("callAgent")} className="absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 place-items-center rounded-full text-ink-muted outline-none transition-colors duration-(--duration-fast) hover:bg-surface hover:text-ink focus-visible:ring-2 focus-visible:ring-money">
      <Phone className="size-3.5" aria-hidden="true" />
    </button>
  );
}
