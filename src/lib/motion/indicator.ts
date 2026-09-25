// Where a sliding indicator (sidebar capsule, tab underline) should sit: the
// item's box, measured in the track's own coordinates. Pure DOM maths — the
// component owns the observers, this owns the numbers.

export const ACTIVE_ITEM_SELECTOR = '[aria-current="page"], [aria-selected="true"], [data-active="true"], [data-selected="true"]';
export const NAV_ITEM_SELECTOR = 'a[href], [role="tab"], button[data-tab]';

export type IndicatorBox = { x: number; y: number; width: number; height: number };

export function boxWithin(track: Element, item: Element): IndicatorBox {
  const t = track.getBoundingClientRect();
  const i = item.getBoundingClientRect();
  return { x: i.left - t.left + track.scrollLeft, y: i.top - t.top + track.scrollTop, width: i.width, height: i.height };
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
