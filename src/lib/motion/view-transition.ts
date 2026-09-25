// The View Transitions API, kept on a short leash: the snapshot is held only
// until the new route commits, and at most VIEW_TRANSITION_MAX_MS. A route
// that needs longer than that belongs to the route shell's stale-and-skeleton
// treatment, not to a frozen picture of the page it is leaving.

export const VIEW_TRANSITION_MAX_MS = 240;
const POLL_MS = 16;

export function startViewTransitionNav(navigate: () => void, committed: () => boolean) {
  const start = document.startViewTransition?.bind(document);
  if (!start) {
    navigate();
    return;
  }
  start(() => {
    navigate();
    return waitFor(committed);
  });
}

function waitFor(committed: () => boolean) {
  return new Promise<void>((resolve) => {
    const deadline = Date.now() + VIEW_TRANSITION_MAX_MS;
    const tick = () => {
      if (committed() || Date.now() >= deadline) {
        resolve();
        return;
      }
      window.setTimeout(tick, POLL_MS);
    };
    tick();
  });
}
