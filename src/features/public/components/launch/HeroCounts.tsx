"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { RollingNumber } from "@/components/ui/rolling-number";
import type { PublicTrail } from "../../constants";

const KEYS = ["posts", "links", "clicks", "signups"] as const;

// The trail's four real counts, rolling up hard from zero on load.
export function HeroCounts({ trail }: { trail: PublicTrail | null }) {
  const t = useTranslations("landing.hero");
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setShown(true), 250);
    return () => window.clearTimeout(id);
  }, []);
  if (!trail) return <p className="text-small text-ink-muted">{t("offline")}</p>;
  return (
    <div>
      <ol className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-lead">
        {KEYS.map((key, i) => (
          <li key={key} className="flex items-baseline gap-2">
            {i > 0 ? <span className="text-ink-muted" aria-hidden="true">→</span> : null}
            <span className={key === "signups" ? "font-semibold text-money" : "font-semibold"}>
              <RollingNumber value={shown ? trail[key] : 0} />
            </span>
            <span className="text-ink-muted">{t(`counts.${key}`, { count: trail[key] }).replace(/^[\d,]+\s/, "")}</span>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-caption text-ink-muted">{t("liveLabel")}</p>
    </div>
  );
}
