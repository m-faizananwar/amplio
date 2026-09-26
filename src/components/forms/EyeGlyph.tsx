import s from "./password.module.css";

// An eye whose upper lid folds shut: the lower lid stays, the upper lid flips
// onto it and the pupil shrinks when `open` is false; lashes show when shut.
export function EyeGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M2.5 12c2.4 3.6 5.6 5.4 9.5 5.4s7.1-1.8 9.5-5.4" />
      <path className={s.lid} d="M2.5 12c2.4-3.6 5.6-5.4 9.5-5.4s7.1 1.8 9.5 5.4" />
      <circle className={s.pupil} cx="12" cy="12" r="2.8" />
      <path className={s.lashes} d="M6.2 16.2 5 18M12 17.4V19.6M17.8 16.2 19 18" />
    </svg>
  );
}
