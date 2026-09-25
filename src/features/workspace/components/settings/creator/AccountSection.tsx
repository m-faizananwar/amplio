"use client";

import { toast } from "sonner";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { deleteAccount } from "../../../server/actions";
import { SettingsSection } from "./SettingsSection";

type Props = { email: string; handle?: string; isDemo: boolean; removes: string };

// Read-only identity and the one destructive action, two clicks to confirm.
export function AccountSection({ email, handle, isDemo, removes }: Props) {
  async function remove() {
    const result = await deleteAccount();
    // On success the action redirects; we only get here when it refused.
    if (result && !result.ok) toast.error(result.error);
  }
  return (
    <SettingsSection id="account" title="Account" tone="danger">
      <dl className="grid gap-3 text-small sm:grid-cols-2">
        <div><dt className="text-ink-muted">Signed in as</dt><dd className="num mt-0.5 text-ink">{email}</dd></div>
        {handle ? <div><dt className="text-ink-muted">Card handle</dt><dd className="num mt-0.5 text-ink">@{handle}</dd></div> : null}
      </dl>
      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-rule pt-4">
        <ConfirmButton confirmLabel="Click again to delete for good" onConfirm={remove} disabled={isDemo}>Delete account</ConfirmButton>
        <p className="text-caption text-ink-muted">{isDemo ? "The demo account can't be deleted, so everyone can keep exploring it." : removes}</p>
      </div>
    </SettingsSection>
  );
}
