const SRC = "/media/hero-plate.mp4";
const PHONE_MAX_PX = 768;
const MIN_CORES = 4;
const IDLE_TIMEOUT_MS = 2500;
const FALLBACK_DELAY_MS = 1200;

type Connection = { saveData?: boolean };

// Phones, Save-Data and small CPUs keep the poster: the clip is ambience, not content.
export function posterOnly() {
  const conn = (navigator as Navigator & { connection?: Connection }).connection;
  return window.innerWidth < PHONE_MAX_PX || conn?.saveData === true || (navigator.hardwareConcurrency ?? MIN_CORES) < MIN_CORES;
}

function onIdle(fn: () => void) {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(fn, { timeout: IDLE_TIMEOUT_MS });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(fn, FALLBACK_DELAY_MS);
  return () => window.clearTimeout(id);
}

// The clip's src attaches on idle after first paint (the poster underneath is
// the LCP); it plays only while on screen and the tab is visible, and reduced
// motion holds it on frame 1, following the preference live.
export function runPlate(v: HTMLVideoElement): () => void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const state = { attached: false, inView: true };
  const play = () => {
    if (state.attached && state.inView && !reduced.matches && !document.hidden) void v.play().catch(() => undefined);
  };
  const attach = () => {
    if (state.attached || reduced.matches) return;
    state.attached = true;
    v.src = SRC;
    play();
  };
  const onMotion = () => {
    if (!reduced.matches) { if (state.attached) play(); else attach(); return; }
    v.pause();
    if (state.attached) v.currentTime = 0;
  };
  const onVisibility = () => { if (document.hidden) v.pause(); else play(); };
  const io = new IntersectionObserver(([e]) => { state.inView = e.isIntersecting; if (state.inView) play(); else v.pause(); });
  io.observe(v);
  const cancelIdle = onIdle(attach);
  reduced.addEventListener("change", onMotion);
  document.addEventListener("visibilitychange", onVisibility);
  return () => {
    cancelIdle();
    io.disconnect();
    reduced.removeEventListener("change", onMotion);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
