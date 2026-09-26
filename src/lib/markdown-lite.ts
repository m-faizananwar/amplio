// A small, safe Markdown subset for the agent's and the assistant's replies:
// paragraphs with line breaks, "- " / "* " / "•" lists, "1." lists, **bold**,
// *italic*, `code` and links to this app's own paths. Everything else is
// text (React escapes it; there is no HTML path). Replies stream in, so a
// marker still waiting for its closing half is dropped rather than shown.
export type Inline =
  | { type: "text"; text: string }
  | { type: "strong"; children: Inline[] }
  | { type: "em"; children: Inline[] }
  | { type: "code"; text: string }
  | { type: "link"; href: string; children: Inline[] };

export type Block = { kind: "p"; lines: string[] } | { kind: "ul"; items: string[] } | { kind: "ol"; start: number; items: string[] };

const BULLET = /^\s*[-*•]\s+/;
const NUMBERED = /^\s*(\d{1,3})[.)]\s+/;
// " * " between items, as models write a list on one line after a colon
const INLINE_ITEM = /\s\*\s+(?=\S)/;

// Only same-origin paths: "/brand/…", never "//host", a scheme or "..".
export const isSafeHref = (href: string) => href.startsWith("/") && !href.startsWith("//") && !href.includes("..") && !/[\s<>"']/.test(href);

// "Two need you: * **A** by Zune * **B** by Zune" → a lead line and items.
function explode(line: string): string[] {
  const trimmed = line.trim();
  const lead = trimmed.startsWith("* ");
  const colon = trimmed.search(/:\s+\*\s+\S/);
  if (!lead && colon < 0) return [line];
  const head = lead ? "" : trimmed.slice(0, colon + 1);
  const rest = lead ? trimmed.slice(2) : trimmed.slice(colon + 1).replace(/^\s+\*\s+/, "");
  const items = rest.split(INLINE_ITEM).map((s) => s.trim()).filter((s) => s && s !== "*");
  if (!lead && items.length < 2) return [line];
  return [...(head ? [head] : []), ...items.map((i) => `* ${i}`)];
}

export function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  const lines = text.replace(/\r\n?/g, "\n").split("\n").flatMap(explode);
  for (const raw of lines) {
    const last = blocks.at(-1);
    if (!raw.trim()) {
      if (last?.kind === "p" && last.lines.length) blocks.push({ kind: "p", lines: [] });
      continue;
    }
    const numbered = raw.match(NUMBERED);
    if (BULLET.test(raw)) {
      const item = raw.replace(BULLET, "").trim();
      if (!item) continue;
      if (last?.kind === "ul") last.items.push(item);
      else blocks.push({ kind: "ul", items: [item] });
    } else if (numbered) {
      const item = raw.replace(NUMBERED, "").trim();
      if (last?.kind === "ol") last.items.push(item);
      else blocks.push({ kind: "ol", start: Number(numbered[1]), items: [item] });
    } else if (last?.kind === "p") last.lines.push(raw.trim());
    else blocks.push({ kind: "p", lines: [raw.trim()] });
  }
  return blocks.filter((b) => (b.kind === "p" ? b.lines.length > 0 : b.items.length > 0));
}

const LINK = /^\[([^\]\n]+)\]\(([^)\s]+)\)/;

function pushText(out: Inline[], text: string) {
  if (!text) return;
  const last = out.at(-1);
  if (last?.type === "text") last.text += text;
  else out.push({ type: "text", text });
}

// An opening * or _ must touch a word; a closing one must follow one.
function closingEm(text: string, from: number, mark: string): number {
  for (let j = from; j < text.length; j++) {
    if (text[j] !== mark || text[j + 1] === mark || text[j - 1] === mark) continue;
    if (/\s/.test(text[j - 1] ?? " ")) continue;
    if (mark === "_" && /\w/.test(text[j + 1] ?? "")) continue;
    return j;
  }
  return -1;
}

// *italic* or _italic_ starting at i; returns where to carry on. An opening
// with no closing half is a reply still streaming if nothing but a word
// follows it: the marker is hidden then, shown otherwise.
function emphasis(text: string, i: number, out: Inline[]): number {
  const mark = text[i] as string;
  const end = closingEm(text, i + 1, mark);
  if (end >= 0) {
    out.push({ type: "em", children: parseInline(text.slice(i + 1, end)) });
    return end + 1;
  }
  if (!(mark === "*" && !text.slice(i + 1).includes(" "))) pushText(out, mark);
  return i + 1;
}

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i] as string;
    if (ch === "`") {
      const end = text.indexOf("`", i + 1);
      if (end < 0) { i += 1; continue; }
      out.push({ type: "code", text: text.slice(i + 1, end) });
      i = end + 1;
    } else if (text.startsWith("**", i)) {
      const end = text.indexOf("**", i + 2);
      if (end < 0) { i += 2; continue; }
      out.push({ type: "strong", children: parseInline(text.slice(i + 2, end)) });
      i = end + 2;
    } else if ((ch === "*" || ch === "_") && /\S/.test(text[i + 1] ?? "") && !(ch === "_" && /\w/.test(text[i - 1] ?? ""))) {
      i = emphasis(text, i, out);
    } else if (ch === "[" && LINK.test(text.slice(i))) {
      const [whole, label, href] = text.slice(i).match(LINK) as RegExpMatchArray;
      const children = parseInline(label as string);
      if (isSafeHref(href as string)) out.push({ type: "link", href: href as string, children });
      else out.push(...children);
      i += whole.length;
    } else {
      pushText(out, ch);
      i += 1;
    }
  }
  return out;
}

// The words alone, for a one-line caption or a spoken reply.
export function plainText(text: string): string {
  const flat = (nodes: Inline[]): string => nodes.map((n) => (n.type === "text" || n.type === "code" ? n.text : flat(n.children))).join("");
  return parseBlocks(text).map((b) => (b.kind === "p" ? b.lines.map((l) => flat(parseInline(l))).join(" ") : b.items.map((i) => flat(parseInline(i))).join(" · "))).join(" ");
}
