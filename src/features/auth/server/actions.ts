"use server";

import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb, isDbConfigured } from "@/db";
import { brands, creators, users } from "@/db/schema";
import { DEMO_ACCOUNTS, ROLE_HOME, ROLE_ONBOARDING } from "../constants";
import { type ActionResult, type LoginInput, type RegisterInput, loginSchema, registerSchema, roleSchema } from "../schemas";
import { csrfOk } from "./csrf";
import { hashPassword, verifyPassword } from "./password";
import { createSession, destroySession, getViewer } from "./session";

const NOT_CONFIGURED = "The database is not configured on this deployment, so sign-in is unavailable. /api/health has the details.";
const PIXEL_KEY_BYTES = 16;
const SUFFIX_BYTES = 3;

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Random handle/slug suffix so two "Jane Doe"s don't collide.
function suffix() {
  return randomBytes(SUFFIX_BYTES).toString("hex");
}

export async function register(input: RegisterInput): Promise<ActionResult<{ redirectTo: string }>> {
  if (!isDbConfigured()) return { ok: false, error: NOT_CONFIGURED };
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const data = parsed.data;
  const db = getDb();

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, data.email));
  if (existing) return { ok: false, error: "An account with this email already exists. Sign in instead." };

  const [user] = await db
    .insert(users)
    .values({
      email: data.email,
      passwordHash: await hashPassword(data.password),
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
      heardAbout: data.heardAbout,
    })
    .returning({ id: users.id });

  // Profile rows start as placeholders; onboarding fills them in.
  if (data.role === "brand") {
    const domain = data.email.split("@")[1] ?? "";
    const company = domain.split(".")[0] || `${data.firstName}'s company`;
    const [referrer] = data.ref ? await db.select({ id: creators.id }).from(creators).where(eq(creators.handle, data.ref)) : [];
    await db.insert(brands).values({
      referredByCreatorId: referrer?.id ?? null,
      ownerUserId: user.id,
      slug: `${slugify(company)}-${suffix()}`,
      company: company.charAt(0).toUpperCase() + company.slice(1),
      website: domain ? `https://${domain}` : null,
      pixelSiteKey: `nn_${randomBytes(PIXEL_KEY_BYTES).toString("hex")}`,
    });
  } else {
    const handle = `${slugify(`${data.firstName}-${data.lastName}`)}-${suffix()}`;
    await db.insert(creators).values({
      userId: user.id,
      handle,
      linkedinUrl: "",
      headline: "",
      country: "FR",
      priceCents: 2000,
      // no picture until the creator chooses one: the silhouette shows the gap
      avatarUrl: "",
    });
  }

  await createSession(user.id);
  // New accounts go through onboarding first (the layouts enforce it too).
  return { ok: true, data: { redirectTo: ROLE_ONBOARDING[data.role] } };
}

export async function login(input: LoginInput): Promise<ActionResult<{ redirectTo: string }>> {
  if (!isDbConfigured()) return { ok: false, error: NOT_CONFIGURED };
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const [user] = await getDb().select().from(users).where(eq(users.email, parsed.data.email));
  const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
  if (!user || !valid) return { ok: false, error: "Email or password is incorrect." };

  await createSession(user.id);
  return { ok: true, data: { redirectTo: ROLE_HOME[user.role] } };
}

// One click, no typing: signs in as the seeded demo account for the role.
export async function demoLogin(roleInput: string): Promise<ActionResult<{ redirectTo: string }>> {
  if (!isDbConfigured()) return { ok: false, error: NOT_CONFIGURED };
  const role = roleSchema.safeParse(roleInput);
  if (!role.success) return { ok: false, error: "Unknown demo role" };

  const account = DEMO_ACCOUNTS[role.data];
  const [user] = await getDb()
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, account.email))
    .limit(1);
  if (!user) return { ok: false, error: "Demo accounts are not seeded on this database yet (run pnpm db:seed)." };

  await createSession(user.id);
  return { ok: true, data: { redirectTo: ROLE_HOME[role.data] } };
}

export async function logout(formData: FormData) {
  const viewer = await getViewer();
  if (viewer && !csrfOk(viewer, formData)) return;
  await destroySession();
  redirect("/login");
}
