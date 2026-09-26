"use client";

import { Copy } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BRAND } from "@/config/brand";
import type { PixelStatus } from "../../server/queries";
import { pixelSnippet } from "./pixel-snippet";

// The pixel is what turns a click into an attributed sign-up. One line of
// status; the snippet and the demo landing page live behind the button.
// `inline` drops the card frame so it can sit in the chart card's footer.
export function PixelStatusCard({ pixel, origin, inline = false }: { pixel: PixelStatus; origin: string; inline?: boolean }) {
  const t = useTranslations("brand.results.pixel");
  const snippet = pixelSnippet(origin, pixel.siteKey);
  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      toast.success(t("copied"));
    } catch {
      toast.error(t("copyFailed"));
    }
  }
  return (
    <section aria-labelledby="pixel-title" className={inline ? "flex flex-wrap items-center gap-4" : "flex flex-wrap items-center gap-4 rounded-card border border-rule bg-surface p-5 shadow-lift"}>
      <span className={`size-2.5 rounded-full ${pixel.active ? "bg-money" : "bg-rule-strong"}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <h2 id="pixel-title" className={inline ? "text-body font-medium" : "text-lead"}>{t("title")}</h2>
        <p className="text-small text-ink-muted">{pixel.active ? t("active", { count: pixel.events }) : t("inactive")}</p>
      </div>
      <Dialog>
        <DialogTrigger render={<Button variant={pixel.active ? "secondary" : "primary"} size="sm" />}>{pixel.active ? t("view") : t("install")}</DialogTrigger>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("dialog.title")}</DialogTitle>
            <DialogDescription>{t("dialog.body", { global: BRAND.pixelGlobal })}</DialogDescription>
          </DialogHeader>
          <pre className="num overflow-x-auto rounded-control border border-rule bg-paper p-3 text-caption">{snippet}</pre>
          <pre className="num overflow-x-auto rounded-control border border-rule bg-paper p-3 text-caption">{`${BRAND.pixelGlobal}('track', 'signup', { email });\n${BRAND.pixelGlobal}('track', 'purchase', { value: 49, order_id });`}</pre>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" onClick={copy}><Copy aria-hidden="true" />{t("dialog.copy")}</Button>
            <Link href={`/demo/landing?site=${pixel.siteKey}`} className={buttonVariants({ variant: "secondary" })} target="_blank">{t("dialog.demo")}</Link>
          </div>
          <p className="text-caption text-ink-muted">{t("dialog.siteKey")} <code className="num rounded-[4px] bg-tint px-1">{pixel.siteKey}</code></p>
        </DialogContent>
      </Dialog>
    </section>
  );
}
