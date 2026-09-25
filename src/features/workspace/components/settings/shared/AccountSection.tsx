"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { deleteAccount } from "../../../server/actions";
import { SettingsSection } from "./SettingsSection";

type Props = { role: "creator" | "brand"; email: string; handle?: string; isDemo: boolean };

// Read-only identity and the one destructive action, two clicks to confirm.
export function AccountSection({ role, email, handle, isDemo }: Props) {
  const t = useTranslations(`settings.${role}.account`);
  async function remove() {
    const result = await deleteAccount();
    // On success the action redirects; we only get here when it refused.
    if (result && !result.ok) toast.error(t("delete.errors.failed"));
  }
  return (
    <SettingsSection id="account" title={t("title")} description={t("description")} tone="danger">
      <dl className="grid gap-3 text-small sm:grid-cols-2">
        <div><dt className="text-ink-muted">{t("email.label")}</dt><dd className="num mt-0.5 text-ink">{email}</dd></div>
        {handle ? <div><dt className="text-ink-muted">{t("handle.label")}</dt><dd className="num mt-0.5 text-ink">@{handle}</dd></div> : null}
      </dl>
      <p className="mt-2 text-caption text-ink-muted">{t("readOnly")}</p>
      <div className="mt-5 grid gap-2 border-t border-rule pt-4">
        <p className="text-small text-ink-muted">{isDemo ? t("delete.demoDisabled") : t("delete.description")}</p>
        <ConfirmButton className="justify-self-start" confirmLabel={t("delete.confirm.title")} onConfirm={remove} disabled={isDemo}>{t("delete.button")}</ConfirmButton>
      </div>
    </SettingsSection>
  );
}
