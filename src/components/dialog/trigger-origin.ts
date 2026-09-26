// Where a dialog should grow from: the control the person last pressed or
// activated from the keyboard. One capture listener for the whole app keeps
// that element's centre; a dialog reads it when it opens. Pure DOM.
let last: { x: number; y: number } | null = null;
let listening = false;

function remember(target: EventTarget | null) {
  if (!(target instanceof Element)) return;
  const el = target.closest("button, a, [role=button]") ?? target;
  const r = el.getBoundingClientRect();
  last = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export function listenForTriggers() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("pointerdown", (e) => remember(e.target), { capture: true, passive: true });
  window.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") remember(e.target); }, { capture: true });
}

// Offset of the last trigger from the viewport centre (where dialogs sit),
// or none when the dialog opened without one (a deep link, a timer).
export function triggerOffset(): { x: number; y: number } | null {
  if (!last || typeof window === "undefined") return null;
  return { x: last.x - window.innerWidth / 2, y: last.y - window.innerHeight / 2 };
}
