import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { type Inline, parseBlocks, parseInline } from "@/lib/markdown-lite";

const WORD_MS = 18;
const MAX_WORDS = 120;

type Props = {
  text: string;
  // each word fades in a beat after the last (.agent-message in micro.css)
  animate?: boolean;
  // one line of flow for captions: lists run on with " · "
  compact?: boolean;
  className?: string;
};

// A reply in the safe Markdown subset (src/lib/markdown-lite): paragraphs and
// line breaks, lists, bold, italic, code, in-app links. Text is only ever
// rendered as text. Re-rendering the growing text of a streaming reply is
// fine: keys are positional, so words already shown keep their spans.
export function Markdown({ text, animate = false, compact = false, className }: Props) {
  let n = 0;
  const words = (s: string): ReactNode =>
    animate ? s.split(/(\s+)/).map((w, i) => <span key={i} style={{ animationDelay: `${Math.min(n++, MAX_WORDS) * WORD_MS}ms` }}>{w}</span>) : s;
  const inline = (nodes: Inline[]): ReactNode[] =>
    nodes.map((node, i) => {
      switch (node.type) {
        case "text": return <Fragment key={i}>{words(node.text)}</Fragment>;
        case "strong": return <strong key={i} className="font-semibold">{inline(node.children)}</strong>;
        case "em": return <em key={i}>{inline(node.children)}</em>;
        case "code": return <code key={i} className="rounded-[6px] bg-well px-1 py-0.5 font-mono text-[0.9em]">{words(node.text)}</code>;
        case "link": return <Link key={i} href={node.href} className="text-info underline-offset-4 hover:underline">{inline(node.children)}</Link>;
      }
    });
  const line = (s: string) => inline(parseInline(s));
  const blocks = parseBlocks(text);

  if (compact) {
    return (
      <span className={className}>
        {blocks.map((b, i) => (
          <Fragment key={i}>
            {i ? " " : null}
            {b.kind === "p" ? b.lines.map((l, j) => <Fragment key={j}>{j ? " " : null}{line(l)}</Fragment>) : b.items.map((it, j) => <Fragment key={j}>{j ? " · " : null}{line(it)}</Fragment>)}
          </Fragment>
        ))}
      </span>
    );
  }
  const fade = animate ? "agent-message" : undefined;
  return (
    <div className={cn("grid gap-2", className)}>
      {blocks.map((b, i) => {
        if (b.kind === "p") return <p key={i} className={fade}>{b.lines.map((l, j) => <Fragment key={j}>{j ? <br /> : null}{line(l)}</Fragment>)}</p>;
        const items = b.items.map((it, j) => <li key={j}>{line(it)}</li>);
        return b.kind === "ul"
          ? <ul key={i} className={cn("grid list-disc gap-1 pl-5 marker:text-ink-muted", fade)}>{items}</ul>
          : <ol key={i} start={b.start} className={cn("grid list-decimal gap-1 pl-5 marker:text-ink-muted", fade)}>{items}</ol>;
      })}
    </div>
  );
}
