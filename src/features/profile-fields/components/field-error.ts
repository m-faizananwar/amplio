import type { FieldError } from "react-hook-form";

// Zod speaks English; the form speaks the viewer's language. Map an issue
// code to the translated message for that field (falls back to `fallback`).
export function fieldError(error: FieldError | undefined, map: Partial<Record<string, string>>, fallback?: string) {
  if (!error) return undefined;
  const type = String(error.type);
  return map[type] ?? (type === "invalid_string" || type === "invalid_format" ? map.invalid_format ?? map.invalid_string : undefined) ?? fallback ?? error.message;
}
