import { NextResponse } from "next/server";
import { getLocale } from "next-intl/server";
import { chatRequestSchema } from "@/features/assistant/schemas";
import { answerChat } from "@/features/assistant/server/answer";
import { getViewer } from "@/features/auth/server/session";

export const dynamic = "force-dynamic";

// POST { message, pending?, history? } → { ok, text, navigate?, pending?, source }.
// A request with the session's csrf token acts as that user (tools mutate). One
// with no token is answered as logged out (public facts, no tools), even when a
// session cookie is present: a static public page may not have the token yet.
// A token that doesn't match is refused: that is a stale page or a forgery.
export async function POST(request: Request) {
  const sent = request.headers.get("x-csrf-token");
  const session = sent ? await getViewer().catch(() => null) : null;
  if (session && sent !== session.csrfToken) {
    return NextResponse.json({ ok: false, text: "This session is stale. Reload the page.", source: "tool" }, { status: 403 });
  }
  const parsed = chatRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, text: "Say a little more and I'll try again.", source: "template" }, { status: 400 });
  try {
    const locale = (await getLocale()) === "fr" ? "fr" : "en";
    return NextResponse.json(await answerChat(parsed.data, session, locale));
  } catch (error) {
    console.error("[assistant] chat route failed", { userId: session?.userId, error });
    return NextResponse.json({ ok: false, text: "Something went wrong on our side. Try again.", source: "template" }, { status: 500 });
  }
}
