import { getTranslations } from "next-intl/server";
import { PRE_SCRIPT } from "../hero/entrance-script";
import { PublicHeader } from "./PublicHeader";

// The public site's header, for every public route (the auth pages keep their
// own). The inline script runs before first paint: on the landing it holds the
// hero at its entrance's first frame (hero/entrance-script.ts).
export async function PublicNav() {
  const t = await getTranslations("landing.nav");
  const keys = ["home", "main", "forCreators", "pricing", "signIn", "startFree", "menu", "closeMenu"] as const;
  const labels = Object.fromEntries(keys.map((k) => [k, t(k)])) as Record<(typeof keys)[number], string>;
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: PRE_SCRIPT }} />
      <PublicHeader labels={labels} />
    </>
  );
}
