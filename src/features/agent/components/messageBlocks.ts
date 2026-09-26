// The agent's replies carry a little Markdown: "- " lists, one item per
// line, and **bold** for names. This splits a reply into paragraphs and
// lists, and a line into plain and bold runs. Nothing else is interpreted.
export type Block = { kind: "p"; text: string } | { kind: "ul"; items: string[] };
export type Run = { bold: boolean; text: string };

const ITEM = /^\s*[-•*]\s+/;

export function blocksOf(text: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    const last = blocks.at(-1);
    if (!line) {
      if (last?.kind === "p") blocks.push({ kind: "p", text: "" });
      continue;
    }
    if (ITEM.test(line)) {
      const item = line.replace(ITEM, "");
      if (last?.kind === "ul") last.items.push(item);
      else blocks.push({ kind: "ul", items: [item] });
    } else if (last?.kind === "p" && last.text) last.text = `${last.text} ${line}`;
    else if (last?.kind === "p") last.text = line;
    else blocks.push({ kind: "p", text: line });
  }
  return blocks.filter((b) => (b.kind === "p" ? b.text : b.items.length));
}

export function runsOf(line: string): Run[] {
  return line.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((part) => (part.startsWith("**") && part.endsWith("**") && part.length > 4 ? { bold: true, text: part.slice(2, -2) } : { bold: false, text: part }));
}
