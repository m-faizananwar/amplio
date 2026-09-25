import { CheckCircle2 } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

type Props = { creatorName: string; acceptBy?: string | null; onClose: () => void };

export function BookingSent({ creatorName, acceptBy, onClose }: Props) {
  const t = useTranslations("brand.creators.booking.sent");
  const format = useFormatter();
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center animate-pop-in">
      <CheckCircle2 className="size-9 text-money" aria-hidden="true" />
      <p className="text-lead font-semibold">{t("title")}</p>
      <p className="max-w-sm text-body text-ink-muted">
        {acceptBy ? t("bodyBy", { name: creatorName, date: format.dateTime(new Date(acceptBy), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) }) : t("body", { name: creatorName })}
      </p>
      <Button type="button" onClick={onClose} className="mt-2">{t("done")}</Button>
    </div>
  );
}
