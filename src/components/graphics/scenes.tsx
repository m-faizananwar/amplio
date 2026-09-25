import { DrawOnPath } from "./DrawOnPath";

// Small hand-drawn scenes for empty states, one motif: the trail. Each is an
// SVG on currentColor that draws once (and loops only where noted, pausing
// under reduced motion). All live in the ledger palette via text-* classes.
const BOX = "h-16 w-28 text-ink-muted";

// No campaigns / opportunities: a blank brief, its lines writing themselves.
export function BlankBriefScene() {
  return (
    <svg viewBox="0 0 112 64" className={BOX} strokeWidth="1.5" aria-hidden="true">
      <rect x="30" y="6" width="52" height="52" rx="4" fill="none" stroke="currentColor" opacity="0.5" />
      <DrawOnPath d="M38 18h30" delay={120} />
      <DrawOnPath d="M38 26h36" delay={320} />
      <DrawOnPath d="M38 34h24" delay={520} />
      <DrawOnPath d="M38 42h32" delay={720} />
    </svg>
  );
}

// No collaborations: two dots reaching for each other and joining.
export function JoiningDotsScene() {
  return (
    <svg viewBox="0 0 112 64" className={BOX} aria-hidden="true">
      <circle cx="30" cy="32" r="5" fill="currentColor" className="g-reach-left" />
      <circle cx="82" cy="32" r="5" fill="currentColor" className="g-reach-right" />
      <DrawOnPath d="M36 32h40" strokeWidth="1.5" delay={500} duration={500} />
    </svg>
  );
}

// No clicks yet: a tracked link sending out ripples (loops, pauses off-motion).
export function LinkRipplesScene() {
  return (
    <svg viewBox="0 0 112 64" className={BOX} aria-hidden="true">
      <circle cx="56" cy="32" r="4" fill="currentColor" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx="56" cy="32" r="18" fill="none" stroke="currentColor" strokeWidth="1.2" className="g-ripple" style={{ animationDelay: `${i * 600}ms` }} />
      ))}
    </svg>
  );
}

// No messages: three dots typing (loops, pauses under reduced motion).
export function TypingScene() {
  return (
    <svg viewBox="0 0 112 64" className={BOX} aria-hidden="true">
      <rect x="28" y="16" width="56" height="30" rx="15" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      {[44, 56, 68].map((cx, i) => <circle key={cx} cx={cx} cy="31" r="3" fill="currentColor" className="g-type" style={{ animationDelay: `${i * 150}ms` }} />)}
    </svg>
  );
}
