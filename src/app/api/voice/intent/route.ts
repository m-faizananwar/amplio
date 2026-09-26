import { NextResponse } from "next/server";
import { getLocale } from "next-intl/server";
import { getViewer } from "@/features/auth/server/session";
import { voiceRequestSchema } from "@/features/voice/schemas";
import { handleTranscript } from "@/features/voice/server/handle-transcript";

export const dynamic = "force-dynamic";

// POST { transcript, pending? } → { ok, speech, navigate?, pending?, intent, source }.
// Same session cookie and csrf token as every form in the app.
export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ ok: false, speech: "Sign in first." }, { status: 401 });
  if (request.headers.get("x-csrf-token") !== viewer.csrfToken) {
    return NextResponse.json({ ok: false, speech: "This session is stale. Reload the page." }, { status: 403 });
  }
  const parsed = voiceRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, speech: "I didn't catch that." }, { status: 400 });
  try {
    const locale = (await getLocale()) === "fr" ? "fr" : "en";
    return NextResponse.json(await handleTranscript({ ...parsed.data, viewer, locale }));
  } catch (error) {
    console.error("[voice] intent route failed", { userId: viewer.userId, error });
    return NextResponse.json({ ok: false, speech: "Something went wrong on our side. Try again." }, { status: 500 });
  }
}
