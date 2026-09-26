import { NextResponse } from "next/server";
import { getViewer } from "@/features/auth/server/session";

export const dynamic = "force-dynamic";

// GET → { csrfToken } for the signed-in session, else { csrfToken: null }.
// The public pages are static, so their assistant asks for the token here the
// first time it sends. Same-origin only: no CORS headers, so another site can
// trigger this request but never read the answer.
export async function GET() {
  const viewer = await getViewer().catch(() => null);
  return NextResponse.json({ csrfToken: viewer?.csrfToken ?? null }, { headers: { "cache-control": "no-store, private" } });
}
