// A reply that is one of the last question's chips (tapped, typed or said)
// reaches the model with what that chip means, ids included, so "Launch it"
// acts on the campaign it was offered for. The user's words are stored as
// they were. Pure.
const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

export function withChipHint(text: string, hints: Record<string, string> | null): string {
  if (!hints) return text;
  const said = norm(text);
  const hit = Object.entries(hints).find(([label]) => norm(label) === said);
  return hit ? `${text}\n(This is the suggestion you offered. What it means: ${hit[1]})` : text;
}
