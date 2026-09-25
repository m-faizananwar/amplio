import type { ReactNode } from "react";
import type { CampaignOption, ThreadDto, ViewerRole } from "../../schemas";
import { ThreadList } from "./ThreadList";

type Props = { threads: ThreadDto[]; role: ViewerRole; activeId: string | null; campaigns?: CampaignOption[]; children: ReactNode };

// Two panes on wide screens; on a phone the list and the thread are two
// screens (the list hides once a thread is open).
export function MessagesLayout({ threads, role, activeId, campaigns = [], children }: Props) {
  return (
    <div className="grid h-[calc(100dvh-10rem)] min-h-[28rem] overflow-hidden rounded-card border border-rule bg-surface lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className={`min-h-0 border-rule lg:border-r ${activeId ? "hidden lg:block" : ""}`}>
        <ThreadList threads={threads} role={role} activeId={activeId} campaigns={campaigns} />
      </aside>
      <section className={`min-h-0 flex-col ${activeId ? "flex" : "hidden lg:flex"}`}>{children}</section>
    </div>
  );
}
