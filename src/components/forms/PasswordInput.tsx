"use client";

import { LockKeyhole } from "lucide-react";
import { useTranslations } from "next-intl";
import { type KeyboardEvent, useState } from "react";
import { Input, type InputProps } from "@/components/ui/input";
import { EyeGlyph } from "./EyeGlyph";
import s from "./password.module.css";

// A password field with a show/hide eye inside it and a Caps Lock chip that
// slides in under it while caps is on and the field has focus. Everything
// else (ref, register, aria) passes through to the Input.
export function PasswordInput({ id, onKeyDown, onKeyUp, onBlur, "aria-describedby": describedBy, ...props }: Omit<InputProps, "type" | "leadingIcon">) {
  const t = useTranslations("auth.password");
  const [shown, setShown] = useState(false);
  const [caps, setCaps] = useState(false);
  const readCaps = (e: KeyboardEvent<HTMLInputElement>) => setCaps(e.getModifierState("CapsLock"));
  const capsId = id ? `${id}-caps` : undefined;
  return (
    <div>
      <div className={s.wrap}>
        <Input
          id={id}
          type={shown ? "text" : "password"}
          leadingIcon={<LockKeyhole />}
          aria-describedby={caps && capsId ? [describedBy, capsId].filter(Boolean).join(" ") : describedBy}
          onKeyDown={(e) => { readCaps(e); onKeyDown?.(e); }}
          onKeyUp={(e) => { readCaps(e); onKeyUp?.(e); }}
          onBlur={(e) => { setCaps(false); onBlur?.(e); }}
          {...props}
        />
        <button
          type="button"
          className={s.eye}
          data-open={shown}
          aria-controls={id}
          aria-label={shown ? t("hide") : t("show")}
          onClick={() => setShown((v) => !v)}
        >
          <EyeGlyph />
        </button>
      </div>
      <div className={s.caps} data-on={caps} aria-hidden={!caps}>
        <span>
          <span id={capsId} className={s.chip} role="status"><span className={s.key} aria-hidden="true">⇪</span>{t("capsLock")}</span>
        </span>
      </div>
    </div>
  );
}
