import { AccountMenu } from "./AccountMenu";
import { MobileNav } from "./MobileNav";
import { LocaleToggle } from "./topbar/LocaleToggle";
import { NotificationsButton } from "./topbar/NotificationsButton";
import { RoleSwitch } from "./topbar/RoleSwitch";
import { ShellCommandMenu } from "./topbar/ShellCommandMenu";
import { WalletChip } from "./topbar/WalletChip";
import type { ShellViewer } from "./viewer";

// Search (⌘K) on the left where the eye starts; on the right the workspace
// switch (demo accounts), the wallet, language, the bell, the account.
export function TopBar({ viewer }: { viewer: ShellViewer }) {
  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper/95">
      <div className="mx-auto flex h-14 max-w-content items-center gap-2 px-4 lg:px-8">
        <MobileNav role={viewer.role} />
        <div className="min-w-0 flex-1"><ShellCommandMenu role={viewer.role} /></div>
        {viewer.demo ? <div className="hidden md:block"><RoleSwitch role={viewer.role} /></div> : null}
        <WalletChip role={viewer.role} walletCents={viewer.walletCents} />
        <div className="hidden sm:block"><LocaleToggle /></div>
        <NotificationsButton notifications={viewer.notifications} role={viewer.role} />
        <AccountMenu viewer={viewer} />
      </div>
    </header>
  );
}
