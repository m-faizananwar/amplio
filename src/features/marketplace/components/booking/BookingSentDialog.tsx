"use client";

import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ActionDialog } from "@/components/dialog/ActionDialog";
import { Button } from "@/components/ui/button";
import { BookingSent } from "./BookingSent";

type Props = { open: boolean; creatorName: string; acceptBy?: string | null; onClose: () => void };

// The booking dialog's last step: the invitation is out, what happens now, Done.
export function BookingSentDialog({ open, creatorName, acceptBy, onClose }: Props) {
  const t = useTranslations("brand.creators.booking");
  return (
    <ActionDialog open={open} onOpenChange={(next) => (next ? undefined : onClose())} icon={<CheckCircle2 />} tone="money" title={t("sent.title")} sub={t("sent.sub")} cancelLabel={t("cancel")} hideCancel
      action={<Button type="button" onClick={onClose}>{t("sent.done")}</Button>}>
      <BookingSent creatorName={creatorName} acceptBy={acceptBy} />
    </ActionDialog>
  );
}
