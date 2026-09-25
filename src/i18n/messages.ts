import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_LOCALE, type Locale } from "./config";

type Messages = { [key: string]: string | Messages };

const ROOT = path.join(process.cwd(), "messages");
const loaded = new Map<Locale, Promise<Messages>>();

// Every file in messages/<locale>/ is a namespace named after the file, so a
// builder adds `messages/en/brand.json` and `useTranslations("brand")` works —
// no registry to update. Read once per locale per server instance.
async function readLocale(locale: Locale): Promise<Messages> {
  const dir = path.join(ROOT, locale);
  const files = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith(".json"));
  const entries = await Promise.all(
    files.map(async (file) => [file.replace(/\.json$/, ""), JSON.parse(await readFile(path.join(dir, file), "utf8")) as Messages] as const),
  );
  return Object.fromEntries(entries);
}

// A key missing in French falls back to the English one instead of throwing:
// a half-translated screen is better than a broken one while copy lands.
function withFallback(base: Messages, over: Messages): Messages {
  const out: Messages = { ...base };
  for (const [key, value] of Object.entries(over)) {
    const under = out[key];
    out[key] = typeof value === "object" && typeof under === "object" ? withFallback(under, value) : value;
  }
  return out;
}

export function loadMessages(locale: Locale): Promise<Messages> {
  let pending = loaded.get(locale);
  if (!pending) {
    pending = locale === DEFAULT_LOCALE
      ? readLocale(locale)
      : Promise.all([readLocale(DEFAULT_LOCALE), readLocale(locale)]).then(([base, own]) => withFallback(base, own));
    loaded.set(locale, pending);
  }
  return pending;
}
