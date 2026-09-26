"use client";

import { Camera, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";
import { Silhouette } from "@/components/Silhouette";
import { cn } from "@/lib/cn";
import { toPicture } from "./picture-file";
import s from "./picture-field.module.css";

type Props = {
  kind: "photo" | "logo";
  initial: string | null;
  save: (input: { dataUrl: string | null }) => Promise<{ ok: boolean }>;
  // told the moment a picture is picked or removed, before it's saved
  onPreview?: (dataUrl: string | null) => void;
};

// A profile photo or a brand logo, shared by onboarding and Settings. The
// round disc is the button; the chip under it says Choose / Change, with a
// small remove once there is a picture. The browser crops and encodes the
// file (picture-file.ts); the save is optimistic and rolls back on failure.
export function PictureField({ kind, initial, save, onPreview }: Props) {
  const t = useTranslations("settings.picture");
  const input = useRef<HTMLInputElement>(null);
  const errorId = useId();
  const [picture, setPicture] = useState<string | null>(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [popKey, setPopKey] = useState(0);

  async function apply(next: string | null) {
    const before = picture;
    setPicture(next);
    onPreview?.(next);
    setPopKey((k) => k + 1);
    setBusy(true);
    const result = await save({ dataUrl: next });
    setBusy(false);
    if (result.ok) return;
    setPicture(before);
    onPreview?.(before);
    setError(t("errors.saveFailed"));
  }

  async function pick(file: File | undefined) {
    setError(null);
    if (!file) return;
    const result = await toPicture(file);
    if (!result.ok) return setError(t(`errors.${result.reason}`));
    await apply(result.dataUrl);
  }

  const label = kind === "photo" ? t("photoLabel") : t("logoLabel");
  return (
    <div className={s.field}>
      <button type="button" className={cn(s.disc, busy && s.busy)} onClick={() => input.current?.click()} aria-label={picture ? `${label}: ${t("change")}` : label} aria-describedby={error ? errorId : undefined}>
        {picture ? (
          // eslint-disable-next-line @next/next/no-img-element -- a data URL drawn in the browser; next/image has nothing to optimise
          <img key={popKey} src={picture} alt="" className={s.pop} />
        ) : (
          <span key={popKey} className={cn("block size-full", popKey > 0 && s.pop)}><Silhouette kind={kind === "photo" ? "person" : "logo"} /></span>
        )}
      </button>
      <div className={s.row}>
        <button type="button" className={s.chip} onClick={() => input.current?.click()} disabled={busy}>
          <Camera className="size-3.5" aria-hidden="true" />{picture ? t("change") : kind === "photo" ? t("choosePhoto") : t("chooseLogo")}
        </button>
        {picture ? (
          <button type="button" className={s.remove} onClick={() => apply(null)} disabled={busy} aria-label={kind === "photo" ? t("removePhoto") : t("removeLogo")}>
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {error ? <p id={errorId} role="alert" className={s.error}>{error}</p> : null}
      <input ref={input} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ""; }} />
    </div>
  );
}
