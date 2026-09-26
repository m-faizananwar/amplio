import { Fragment, type ReactNode } from "react";
import { blocksOf, runsOf } from "./messageBlocks";

const WORD_MS = 18;
const MAX_WORDS = 120;

// A reply as paragraphs and lists with bold names; every word fades in a
// beat after the one before it (.agent-message in micro.css), across blocks.
export function MessageText({ text }: { text: string }) {
  let n = 0;
  const words = (line: string): ReactNode[] =>
    runsOf(line).map((run, r) => {
      const spans = run.text.split(/(\s+)/).map((w, i) => <span key={i} style={{ animationDelay: `${Math.min(n++, MAX_WORDS) * WORD_MS}ms` }}>{w}</span>);
      return run.bold ? <strong key={r} className="font-semibold">{spans}</strong> : <Fragment key={r}>{spans}</Fragment>;
    });
  return (
    <>
      {blocksOf(text).map((block, b) =>
        block.kind === "p"
          ? <p key={b} className="agent-message">{words(block.text)}</p>
          : <ul key={b} className="agent-message grid list-disc gap-1 pl-5 marker:text-ink-muted">{block.items.map((item, i) => <li key={i}>{words(item)}</li>)}</ul>,
      )}
    </>
  );
}
