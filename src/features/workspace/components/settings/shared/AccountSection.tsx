"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { ActionDialog } from "@/components/dialog/ActionDialog";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { deleteAccount } from "../../../server/actions";
import { SettingsSection } from "./SettingsSection";

type Props = { role: "creator" | "brand"; email: string; handle?: string; isDemo: boolean };

// Read-only identity and the one destructive action: a dialog says what goes,
// and the delete itself arms first and needs a second click.
export function AccountSection({ role, email, handle, isDemo }: Props) {
  const t = useTranslations(`settings.${role}.account`);
  const [open, setOpen] = useState(false);
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
        <Button type="button" variant="danger" icon={<Trash2 />} className="justify-self-start" onClick={() => setOpen(true)} disabled={isDemo}>{t("delete.button")}</Button>
        <ActionDialog open={open} onOpenChange={setOpen} icon={<Trash2 />} tone="danger" title={t("delete.confirm.title")} sub={t("delete.confirm.body")} cancelLabel={t("delete.confirm.cancel")}
          facts={[{ label: t("email.label"), value: email, mono: true }, ...(handle ? [{ label: t("handle.label"), value: `@${handle}`, mono: true }] : []), { label: t("delete.confirm.whatGoes"), value: t("delete.confirm.whatGoesValue") }]}
          action={<ConfirmButton confirmLabel={t("delete.confirm.armed")} onConfirm={remove}>{t("delete.confirm.confirm")}</ConfirmButton>} />
      </div>
    </SettingsSection>
  );
}
