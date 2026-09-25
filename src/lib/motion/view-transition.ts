// The View Transitions API, kept on a short leash. The route shell holds the
// old page, dims it after a 120ms grace and shows a progress bar; this only
// covers the navigations quicker than that grace. The snapshot is held until
// the new route commits, and if that hasn't happened by the time the shell
// would start dimming, the transition is skipped — no animation, the frame is
// released, and the shell's treatment takes over exactly when it would have.
// One animation per navigation, never two.

export const VIEW_TRANSITION_MAX_MS = 120;
const POLL_MS = 16;

export function crossfadeIfQuick(committed: () => boolean) {
  const start = document.startViewTransition?.bind(document);
  if (!start) return;
  const transition = start(async () => {
    const quick = await waitFor(committed);
    if (!quick) transition.skipTransition();
  });
  // A skipped transition rejects its promises; that is the expected outcome.
  transition.ready.catch(() => undefined);
  transition.finished.catch(() => undefined);
}

function waitFor(committed: () => boolean) {
  return new Promise<boolean>((resolve) => {
    const deadline = Date.now() + VIEW_TRANSITION_MAX_MS;
    const tick = () => {
      if (committed()) return resolve(true);
      if (Date.now() >= deadline) return resolve(false);
      window.setTimeout(tick, POLL_MS);
    };
    tick();
  });
}
