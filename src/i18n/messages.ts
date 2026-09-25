import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_LOCALE, type Locale } from "./config";

type Messages = { [key: string]: string | Messages };

const ROOT = path.join(process.cwd(), "messages");
const loaded = new Map<Locale, Promise<Messages>>();

// Every file in messages/<locale>/ is a namespace named after the file, so a
// builder adds `messages/en/brand.json` and `useTranslations("brand")` works —
// no registry to update. A dotted name nests: `creator.earnings.json` lands
// under creator.earnings, so a namespace can be split to keep every file
// under 500 lines.
async function readLocale(locale: Locale): Promise<Messages> {
  const dir = path.join(ROOT, locale);
  const files = (await readdir(dir).catch(() => [])).filter((f) => f.endsWith(".json")).sort();
  const entries = await Promise.all(
    files.map(async (file) => [file.replace(/\.json$/, "").split("."), JSON.parse(await readFile(path.join(dir, file), "utf8")) as Messages] as const),
  );
  let out: Messages = {};
  for (const [keys, content] of entries) {
    const nested = keys.reduceRight<Messages>((inner, key) => ({ [key]: inner }), content);
    out = withFallback(out, nested);
  }
  return out;
}

// A key missing in French falls back to the English one instead of throwing:
// a half-translated screen is better than a broken one while copy lands.
function withFallback(base: Messages, over: Messages): Messages {
  const out: Messages = { ...base };
  for (const [key, value] of Object.entries(over)) {
    const under = out[key];
    // Arrays (legal sections, FAQ items) are whole values: merging one into
    // the English array index by index would turn it into an object.
    const nested = isNamespace(value) && isNamespace(under);
    out[key] = nested ? withFallback(under, value) : value;
  }
  return out;
}

// Production reads once per instance. Dev re-reads on every request so a new
// key shows up without restarting the server.
const CACHE = process.env.NODE_ENV === "production";

function isNamespace(value: unknown): value is Messages {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function loadMessages(locale: Locale): Promise<Messages> {
  let pending = CACHE ? loaded.get(locale) : undefined;
  if (!pending) {
    pending = locale === DEFAULT_LOCALE
      ? readLocale(locale)
      : Promise.all([readLocale(DEFAULT_LOCALE), readLocale(locale)]).then(([base, own]) => withFallback(base, own));
    loaded.set(locale, pending);
  }
  return pending;
}
