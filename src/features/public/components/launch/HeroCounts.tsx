"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { RollingNumber } from "@/components/ui/rolling-number";
import { cn } from "@/lib/cn";
import type { PublicTrail } from "../../constants";

const KEYS = ["posts", "links", "clicks", "signups"] as const;

// The trail's four real counts as one ledger row: big mono numbers rolling
// up hard from zero, a hairline between each step, sign-ups in green.
export function HeroCounts({ trail }: { trail: PublicTrail | null }) {
  const t = useTranslations("landing.hero");
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setShown(true), 350);
    return () => window.clearTimeout(id);
  }, []);
  if (!trail) return <p className="text-small text-ink-muted">{t("offline")}</p>;
  return (
    <div>
      <ol className="grid grid-cols-2 border-y border-rule sm:grid-cols-4">
        {KEYS.map((key, i) => (
          <li key={key} className={cn("py-4 pr-4", i > 0 && "sm:border-l sm:border-rule sm:pl-4", i % 2 === 1 && "border-l border-rule pl-4", i > 1 && "border-t border-rule sm:border-t-0")}>
            <span className={cn("block text-h2 font-semibold leading-none tracking-[-0.03em]", key === "signups" && "text-money")}>
              <RollingNumber value={shown ? trail[key] : 0} />
            </span>
            <span className="mt-1.5 block text-small text-ink-muted">{t(`counts.${key}`, { count: trail[key] }).replace(/^[\d,  ]+/, "")}</span>
          </li>
        ))}
      </ol>
      <p className="mt-2 flex items-center gap-2 text-caption text-ink-muted">
        <span className="relative flex size-1.5"><span className="absolute inset-0 animate-ping rounded-full bg-money opacity-60 motion-reduce:hidden" /><span className="relative size-1.5 rounded-full bg-money" /></span>
        {t("liveLabel")}
      </p>
    </div>
  );
}
