"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { AccountPillMenu } from "./AccountPillMenu";
import type { ShellViewer } from "./viewer";

const OPEN_WIDTH = 268;
const HEADER = 52;

// The account pill (DIRECTION.md, "Sidebar and top bar"). Closed: avatar,
// name, company or handle, chevron. Open: the same white surface grows down
// and to 268px, pinned to its right edge so it grows inward, and becomes the
// menu. Its closed box is reserved, so the bar never reflows. Esc, an outside
// click and choosing a row close it; focus goes back to the pill.
// place="rail": at the foot of the sidebar, under Settings; it anchors to
// the bottom-left and grows upward into the menu instead.
export function AccountPill({ viewer, place = "bar" }: { viewer: ShellViewer; place?: "bar" | "rail" }) {
  const t = useTranslations("shell.topBar.account");
  const [open, setOpen] = useState(false);
  const [closedWidth, setClosedWidth] = useState<number | null>(null);
  const [menuHeight, setMenuHeight] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const name = `${viewer.firstName} ${viewer.lastName}`.trim();

  // measure the closed pill once it has laid out, and the menu's height
  useLayoutEffect(() => {
    if (!open && header.current) setClosedWidth(header.current.scrollWidth);
    if (menu.current) setMenuHeight(menu.current.scrollHeight);
  }, [open, name, viewer.workspace]);

  useEffect(() => {
    if (!open) return;
    const close = (refocus: boolean) => {
      setOpen(false);
      if (refocus) header.current?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) close(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") return close(true);
      if (event.key === "ArrowDown" || event.key === "ArrowUp") moveFocus(menu.current, event);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    menu.current?.querySelector<HTMLElement>("a, button")?.focus();
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const rail = place === "rail";
  const width = open ? `min(${OPEN_WIDTH}px, calc(100vw - 32px))` : rail ? undefined : closedWidth ? `${closedWidth}px` : undefined;
  return (
    <div ref={root} className="account-pill-slot" data-place={place} style={{ width: rail ? undefined : closedWidth ?? undefined }}>
      <div className="account-pill" data-place={place} data-open={open || undefined} style={{ width, height: open ? HEADER + menuHeight : HEADER }}>
        <button
          ref={header}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? t("close") : t("open")}
          onClick={() => setOpen((v) => !v)}
          className="account-pill-header"
        >
          <span className="account-pill-avatar">
            {viewer.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- remote avatars from the import; next/image needs each host whitelisted
              <img src={viewer.avatarUrl} alt="" />
            ) : (
              <svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="15.5" r="6.5" /><path d="M8.5 33.5c1.6-6 6.2-9.5 11.5-9.5s9.9 3.5 11.5 9.5" /></svg>
            )}
          </span>
          <span className="account-pill-text">
            <span className="account-pill-name">{name}</span>
            <span className="account-pill-org">{viewer.workspace}</span>
          </span>
          <span className="account-pill-chevron"><ChevronDown aria-hidden="true" /></span>
        </button>
        <AccountPillMenu ref={menu} id={panelId} viewer={viewer} open={open} onChoose={() => setOpen(false)} />
      </div>
    </div>
  );
}

// Up / Down move between the rows, like a menu.
function moveFocus(container: HTMLElement | null, event: KeyboardEvent) {
  const items = Array.from(container?.querySelectorAll<HTMLElement>("[data-pill-row]") ?? []);
  if (items.length === 0) return;
  const at = items.indexOf(document.activeElement as HTMLElement);
  const step = event.key === "ArrowDown" ? 1 : items.length - 1;
  items[(at + step) % items.length]?.focus();
  event.preventDefault();
}
