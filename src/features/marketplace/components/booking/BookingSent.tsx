import { useFormatter, useTranslations } from "next-intl";

type Props = { creatorName: string; acceptBy?: string | null };

// What happens now that the invitation is out; the dialog around it carries
// the title and the Done button.
export function BookingSent({ creatorName, acceptBy }: Props) {
  const t = useTranslations("brand.creators.booking.sent");
  const format = useFormatter();
  return (
    <p className="text-body text-ink-muted">
      {acceptBy ? t("bodyBy", { name: creatorName, date: format.dateTime(new Date(acceptBy), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) }) : t("body", { name: creatorName })}
    </p>
  );
}
