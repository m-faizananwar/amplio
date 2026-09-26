"use client";

import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ICP_DESCRIPTION_MAX_CHARS, ICP_TITLE_MAX_CHARS } from "@/features/brand-onboarding/constants";
import { FormField } from "../FormField";
import { type Icp, problemsOf, sameIcps } from "./icp-draft";
import s from "./icp.module.css";
import { useGrowFrom } from "./useGrowFrom";

type Props = { icps: Icp[]; start: number; origin: (index: number) => HTMLElement | null; onSave: (icps: Icp[]) => void; onClose: (index: number) => void };

// The detail of one ideal customer, grown out of its card: who they are,
// what they care about (with a live count), arrows to the other two without
// closing, Save and Cancel. A labelled modal dialog (native <dialog>: focus
// stays inside, Esc closes); closing with unsaved edits asks first.
export function IcpDialog({ icps, start, origin, onSave, onClose }: Props) {
  const t = useTranslations("settings.brand.idealCustomers");
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const titleInput = useRef<HTMLInputElement>(null);
  const [drafts, setDrafts] = useState<Icp[]>(icps);
  const [index, setIndex] = useState(start);
  const [confirming, setConfirming] = useState(false);
  const [tried, setTried] = useState(false);
  const { grow, fold } = useGrowFrom(panel);
  const dirty = !sameIcps(drafts, icps);
  const draft = drafts[index];
  const problems = tried ? problemsOf(draft) : {};

  useEffect(() => {
    dialog.current?.showModal();
    grow(origin(start));
    titleInput.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on open
  }, []);

  async function close() {
    dialog.current?.setAttribute("data-closing", "");
    await fold(origin(index));
    dialog.current?.close();
    onClose(index);
  }
  const requestClose = () => (dirty ? setConfirming(true) : void close());
  // a click on the dimmed page around the panel is a close request (Esc is the keyboard one)
  const onBackdrop = useEffectEvent((e: MouseEvent) => { if (!panel.current?.contains(e.target as Node)) requestClose(); });
  useEffect(() => {
    const el = dialog.current;
    const click = (e: MouseEvent) => onBackdrop(e);
    el?.addEventListener("click", click);
    return () => el?.removeEventListener("click", click);
  }, []);
  const edit = (patch: Partial<Icp>) => { setConfirming(false); setDrafts((d) => d.map((x, i) => (i === index ? { ...x, ...patch } : x))); };
  function save() {
    setTried(true);
    const bad = drafts.findIndex((d) => Object.keys(problemsOf(d)).length > 0);
    if (bad >= 0) return setIndex(bad);
    onSave(drafts);
    void close();
  }
  const errorText = (field: "title" | "description") => {
    const p = problems[field];
    if (!p) return undefined;
    const max = field === "title" ? ICP_TITLE_MAX_CHARS : ICP_DESCRIPTION_MAX_CHARS;
    return t(`errors.${field === "title" ? "name" : "details"}${p === "required" ? "Required" : "TooLong"}`, { max });
  };

  return (
    <dialog ref={dialog} className={s.dialog} aria-labelledby="icp-dialog-title" onCancel={(e) => { e.preventDefault(); requestClose(); }}>
      <div className={s.frame}>
        <div ref={panel} className={s.panel}>
          <div className={s.head}>
            <span className={s.disc} aria-hidden="true">{index + 1}</span>
            <h2 id="icp-dialog-title">{t("card.of", { n: index + 1, total: drafts.length })}</h2>
            <div className={s.nav}>
              <button type="button" className={s.round} onClick={() => setIndex(index - 1)} disabled={index === 0} aria-label={t("card.prev")}><ChevronLeft className="size-4" aria-hidden="true" /></button>
              <button type="button" className={s.round} onClick={() => setIndex(index + 1)} disabled={index === drafts.length - 1} aria-label={t("card.next")}><ChevronRight className="size-4" aria-hidden="true" /></button>
            </div>
          </div>
          <div className={s.body}>
            <FormField id="icp-dialog-title-field" label={t("name.label")} error={errorText("title")}>
              <Input ref={titleInput} id="icp-dialog-title-field" leadingIcon={<Users />} value={draft.title} placeholder={t("name.placeholder")} maxLength={ICP_TITLE_MAX_CHARS} aria-invalid={!!problems.title || undefined} onChange={(e) => edit({ title: e.target.value })} />
            </FormField>
            <FormField id="icp-dialog-details" label={t("details.label")} error={errorText("description")}>
              <Textarea id="icp-dialog-details" rows={7} value={draft.description} placeholder={t("details.placeholder")} aria-invalid={!!problems.description || undefined} aria-describedby="icp-dialog-count" onChange={(e) => edit({ description: e.target.value })} />
            </FormField>
            <p id="icp-dialog-count" className={s.count} data-over={draft.description.length > ICP_DESCRIPTION_MAX_CHARS ? "" : undefined} aria-live="polite">{t("card.count", { count: draft.description.length, max: ICP_DESCRIPTION_MAX_CHARS })}</p>
          </div>
          {confirming ? (
            <div className={s.confirm} role="alert">
              <span>{t("card.unsaved")}</span>
              <Button type="button" size="sm" variant="danger" onClick={() => void close()}>{t("card.discard")}</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setConfirming(false)}>{t("card.keep")}</Button>
            </div>
          ) : null}
          <div className={s.actions}>
            <Button type="button" variant="quiet" onClick={requestClose}>{t("card.cancel")}</Button>
            <Button type="button" onClick={save}>{t("card.save")}</Button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
