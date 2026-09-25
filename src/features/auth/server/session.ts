import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDb, isDbConfigured } from "@/db";
import { cachedRead, updateTags } from "@/db/cache";
import { tag } from "@/lib/cache-tags";
import { brands, creators, ledgerEntries, sessions, users } from "@/db/schema";
import { SESSION_COOKIE, SESSION_TTL_DAYS } from "../constants";
import type { Role } from "../schemas";

const DAY_MS = 86_400_000;
// Only the Vapi voice token (createHeadlessSession) is short-lived; browser
// sessions, demo logins included, get SESSION_TTL_DAYS.
const HOUR_MS = 3_600_000;
const TOKEN_BYTES = 32;
// The session row is read on every request of every page, so it is cached like
// any other read. Expiry is checked here against the cached timestamp, and
// logout drops the tag; the window only covers rows deleted behind our back
// (a reseed), which is why it is short.
const SESSION_TTL_S = 60;

export type Viewer = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  csrfToken: string;
  brand: { id: string; slug: string; company: string; walletCents: number; onboarded: boolean } | null;
  creator: { id: string; handle: string; avatarUrl: string; headline: string; availableCents: number; onboarded: boolean } | null;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(TOKEN_BYTES).toString("base64url");
  const csrfToken = randomBytes(TOKEN_BYTES).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * DAY_MS);
  await getDb().insert(sessions).values({ userId, tokenHash: hashToken(token), csrfToken, expiresAt });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

// A one-hour session without a cookie, for callers that cannot carry one (the
// Vapi voice webhook). It is a normal row: same csrf token, same expiry check.
export async function createHeadlessSession(userId: string) {
  const token = randomBytes(TOKEN_BYTES).toString("base64url");
  const csrfToken = randomBytes(TOKEN_BYTES).toString("base64url");
  const expiresAt = new Date(Date.now() + HOUR_MS);
  await getDb().insert(sessions).values({ userId, tokenHash: hashToken(token), csrfToken, expiresAt });
  return token;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token && isDbConfigured()) {
    const tokenHash = hashToken(token);
    await getDb().delete(sessions).where(eq(sessions.tokenHash, tokenHash));
    updateTags([tag.session(tokenHash)]);
  }
  cookieStore.delete(SESSION_COOKIE);
}

// null = no valid session. Throws only if the db is configured but unreachable.
export async function getViewer(): Promise<Viewer | null> {
  if (!isDbConfigured()) return null;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return viewerFromToken(token);
}

// The row behind one cookie. Cached per token hash: the value is just ids and
// an expiry, and logout revalidates the tag.
function sessionRow(tokenHash: string) {
  return cachedRead(
    async (hash: string) => {
      const [row] = await getDb()
        .select({ userId: sessions.userId, csrfToken: sessions.csrfToken, expiresAt: sessions.expiresAt })
        .from(sessions)
        .where(eq(sessions.tokenHash, hash));
      return row ? { userId: row.userId, csrfToken: row.csrfToken, expiresAt: row.expiresAt.toISOString() } : null;
    },
    ["session", tokenHash],
    { tags: [tag.session(tokenHash)], revalidate: SESSION_TTL_S },
  )(tokenHash);
}

// Who the user is: name, role, brand or creator profile, balance. Dirtied by
// profile edits, bookings and payouts (tag.viewer), not by the cookie.
function viewerProfile(userId: string) {
  return cachedRead(loadViewerProfile, ["viewer-profile", userId], { tags: [tag.viewer(userId)] })(userId);
}

async function loadViewerProfile(userId: string) {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return null;

  const [brand] = await db
    .select({ id: brands.id, slug: brands.slug, company: brands.company, walletCents: brands.walletCents, onboardingCompletedAt: brands.onboardingCompletedAt })
    .from(brands)
    .where(eq(brands.ownerUserId, user.id));
  const [creator] = await db
    .select({ id: creators.id, handle: creators.handle, avatarUrl: creators.avatarUrl, headline: creators.headline, onboardingCompletedAt: creators.onboardingCompletedAt })
    .from(creators)
    .where(eq(creators.userId, user.id));

  const availableCents = creator ? await creatorAvailableCents(creator.id) : 0;

  return {
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    brand: brand ? { id: brand.id, slug: brand.slug, company: brand.company, walletCents: brand.walletCents, onboarded: Boolean(brand.onboardingCompletedAt) } : null,
    creator: creator
      ? { id: creator.id, handle: creator.handle, avatarUrl: creator.avatarUrl, headline: creator.headline, availableCents, onboarded: Boolean(creator.onboardingCompletedAt) }
      : null,
  };
}

export async function viewerFromToken(token: string): Promise<Viewer | null> {
  if (!isDbConfigured()) return null;
  const session = await sessionRow(hashToken(token));
  if (!session || Date.parse(session.expiresAt) <= Date.now()) return null;
  const profile = await viewerProfile(session.userId);
  return profile ? { ...profile, csrfToken: session.csrfToken } : null;
}

// Completed payouts minus withdrawals: what the creator can withdraw now.
async function creatorAvailableCents(creatorId: string) {
  const [row] = await getDb()
    .select({ total: sql<number>`coalesce(sum(${ledgerEntries.amountCents}), 0)::int` })
    .from(ledgerEntries)
    .where(and(eq(ledgerEntries.creatorId, creatorId), eq(ledgerEntries.status, "completed")));
  return row?.total ?? 0;
}
