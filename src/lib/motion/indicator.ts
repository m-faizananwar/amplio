// Where a sliding indicator (sidebar capsule, tab underline) should sit: the
// item's box, measured in the track's own coordinates. Pure DOM maths — the
// component owns the observers, this owns the numbers.

export const ACTIVE_ITEM_SELECTOR = '[aria-current="page"], [aria-selected="true"], [data-active="true"], [data-selected="true"]';
export const NAV_ITEM_SELECTOR = 'a[href], [role="tab"], button[data-tab]';

export type IndicatorBox = { x: number; y: number; width: number; height: number };

const NO_SCALE = 1;

// Client rects are what the screen shows, so a scroll pop or a route enter
// scaling an ancestor would freeze a shrunken capsule in place once it ended.
// The track's own rect against its layout width gives that scale back.
function scaleOf(track: HTMLElement) {
  const width = track.getBoundingClientRect().width;
  return track.offsetWidth > 0 && width > 0 ? width / track.offsetWidth : NO_SCALE;
}

export function boxWithin(track: HTMLElement, item: Element): IndicatorBox {
  const t = track.getBoundingClientRect();
  const i = item.getBoundingClientRect();
  const scale = scaleOf(track);
  return {
    x: (i.left - t.left) / scale + track.scrollLeft,
    y: (i.top - t.top) / scale + track.scrollTop,
    width: i.width / scale,
    height: i.height / scale,
  };
}

// Writes the box onto the track as custom properties; CSS owns the look and the
// spring. A track with no active item hides its indicator instead of parking it.
export function measureInto(track: HTMLElement, item: Element | null, preview: boolean) {
  if (!item) {
    track.dataset.ready = "false";
    return;
  }
  const box = boxWithin(track, item);
  track.style.setProperty("--ind-x", `${box.x}px`);
  track.style.setProperty("--ind-y", `${box.y}px`);
  track.style.setProperty("--ind-w", `${box.width}px`);
  track.style.setProperty("--ind-h", `${box.height}px`);
  track.dataset.ready = "true";
  track.dataset.preview = preview ? "true" : "false";
}

// Keeps one track's indicator on the active item: re-measures when the
// selection, the items or their boxes change, and previews the move while a
// pointer rests on another item. Returns the teardown.
export function trackIndicator(track: HTMLElement, preview: boolean) {
  const place = (target: Element | null, isPreview: boolean) => measureInto(track, target, isPreview);
  const settle = () => place(track.querySelector(ACTIVE_ITEM_SELECTOR), false);
  settle();
  // The first placement must not slide in from the corner.
  const frame = window.requestAnimationFrame(() => { track.dataset.anim = "true"; });

  const ro = new ResizeObserver(settle);
  // The track's own box doesn't change when a label reflows (a webfont swapping
  // in, a count pill gaining a digit), so every item is watched too.
  const watch = () => {
    ro.disconnect();
    ro.observe(track);
    track.querySelectorAll(NAV_ITEM_SELECTOR).forEach((item) => ro.observe(item));
  };
  watch();
  const mo = new MutationObserver(() => { watch(); settle(); });
  mo.observe(track, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-current", "aria-selected", "data-active", "data-selected", "class"] });
  document.fonts?.ready.then(settle).catch(() => { /* no font loading api here */ });

  const onOver = (event: PointerEvent) => {
    if (!preview || event.pointerType === "touch") return;
    const item = (event.target as Element | null)?.closest(NAV_ITEM_SELECTOR);
    if (item && track.contains(item)) place(item, !item.matches(ACTIVE_ITEM_SELECTOR));
  };
  track.addEventListener("pointerover", onOver);
  track.addEventListener("pointerleave", settle);

  return () => {
    window.cancelAnimationFrame(frame);
    mo.disconnect();
    ro.disconnect();
    track.removeEventListener("pointerover", onOver);
    track.removeEventListener("pointerleave", settle);
  };
}
