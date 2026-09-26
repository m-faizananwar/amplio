import { AccountPill } from "./AccountPill";
import { MobileNav } from "./MobileNav";
import { NotificationsButton } from "./topbar/NotificationsButton";
import { RoleSwitch } from "./topbar/RoleSwitch";
import { ShellCommandMenu } from "./topbar/ShellCommandMenu";
import { WalletChip } from "./topbar/WalletChip";
import type { ShellViewer } from "./viewer";

// Search (⌘K) on the left where the eye starts; on the right the workspace
// switch (demo accounts), the wallet, the bell, and the account pill (which holds language and theme).
export function TopBar({ viewer }: { viewer: ShellViewer }) {
  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-surface">
      <div className="mx-auto flex h-16 max-w-content items-center gap-2 px-4 lg:px-8">
        <MobileNav role={viewer.role} setup={viewer.setup && !viewer.setup.finished ? { done: viewer.setup.done, total: viewer.setup.total } : null} />
        <div className="min-w-0 flex-1"><ShellCommandMenu role={viewer.role} /></div>
        {viewer.demo ? <div className="hidden md:block"><RoleSwitch role={viewer.role} /></div> : null}
        <WalletChip role={viewer.role} walletCents={viewer.walletCents} />
        <NotificationsButton notifications={viewer.notifications} role={viewer.role} />
        {/* from lg up the pill lives at the foot of the sidebar */}
        <div className="lg:hidden"><AccountPill viewer={viewer} /></div>
      </div>
    </header>
  );
}
