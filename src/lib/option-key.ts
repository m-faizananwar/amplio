// Stored option values (industries, regions) are English labels that the
// seed and the fit score match on, so they never change; the UI translates
// them through a message key made from the value. Pure.
export function optionKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
