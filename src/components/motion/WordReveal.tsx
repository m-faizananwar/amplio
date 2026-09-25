import { type CSSProperties, Fragment } from "react";

// Past this many words the rest arrive together: a long title shouldn't take
// longer than a short one to settle.
const CAP = 8;

// A heading that lands word by word. The words are real output (no DOM
// splitting after hydration), hidden from assistive tech — the heading carries
// the plain text as its accessible name. Static under reduced motion (CSS).
export function WordReveal({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <span data-word-reveal aria-hidden="true">
      {words.map((word, i) => (
        <Fragment key={`${i}-${word}`}>
          <span className="word-in" style={{ "--w": Math.min(i, CAP) } as CSSProperties}>{word}</span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
