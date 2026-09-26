// A drafted or template text marks what the writer still has to fill in as
// [bracketed examples]. Text that still has one is not ready to save. Pure.
const BRACKETED = /\[[^[\]\n]{1,80}\]/;

export function hasBracketedExample(text: string | null | undefined): boolean {
  return Boolean(text) && BRACKETED.test(text as string);
}
