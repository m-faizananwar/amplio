import "server-only";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { ledgerEntries } from "@/db/schema";
import { EARNINGS_MONTHS } from "../constants";
import type { LedgerRowDto } from "../schemas";
import { cachedRead } from "@/db/cache";
import { tag } from "@/lib/cache-tags";

export type EarningsSummary = {
  totalEarnedCents: number;
  paidCollaborations: number;
  averageCents: number;
  awaitingReleaseCents: number;
  awaitingReleaseCount: number;
  withdrawnCents: number;
  // Bank withdrawals sit "in transit" (pending) until they settle; Stripe is instant.
  inTransitCents: number;
  availableCents: number;
};
export type MonthPoint = { month: string; label: string; cents: number };
export type BillingSummary = { balanceCents: number; topupsCents: number; committedCents: number; entries: number };

export function toLedgerDto(row: typeof ledgerEntries.$inferSelect): LedgerRowDto {
  return {
    id: row.id,
    date: row.createdAt.toISOString(),
    type: row.type,
    status: row.status,
    amountCents: row.amountCents,
    reference: row.reference,
    description: row.description,
  };
}

async function loadEarningsSummary(creatorId: string): Promise<EarningsSummary> {
  const db = getDb();
  const [paid] = await db
    .select({ cents: sql<number>`coalesce(sum(${ledgerEntries.amountCents}), 0)::int`, n: count() })
    .from(ledgerEntries)
    .where(and(eq(ledgerEntries.creatorId, creatorId), eq(ledgerEntries.type, "payout"), eq(ledgerEntries.status, "completed")));
  const [pending] = await db
    .select({ cents: sql<number>`coalesce(sum(${ledgerEntries.amountCents}), 0)::int`, n: count() })
    .from(ledgerEntries)
    .where(and(eq(ledgerEntries.creatorId, creatorId), eq(ledgerEntries.type, "payout"), eq(ledgerEntries.status, "pending")));
  const [withdrawn] = await db
    .select({
      cents: sql<number>`coalesce(-sum(${ledgerEntries.amountCents}), 0)::int`,
      inTransit: sql<number>`coalesce(-sum(${ledgerEntries.amountCents}) filter (where ${ledgerEntries.status} = 'pending'), 0)::int`,
    })
    .from(ledgerEntries)
    .where(and(eq(ledgerEntries.creatorId, creatorId), eq(ledgerEntries.type, "withdrawal")));
  const totalEarnedCents = paid?.cents ?? 0;
  const paidCollaborations = paid?.n ?? 0;
  return {
    totalEarnedCents,
    paidCollaborations,
    averageCents: paidCollaborations > 0 ? Math.round(totalEarnedCents / paidCollaborations) : 0,
    awaitingReleaseCents: pending?.cents ?? 0,
    awaitingReleaseCount: pending?.n ?? 0,
    withdrawnCents: withdrawn?.cents ?? 0,
    inTransitCents: withdrawn?.inTransit ?? 0,
    availableCents: totalEarnedCents - (withdrawn?.cents ?? 0),
  };
}

async function loadEarningsByMonth(creatorId: string): Promise<MonthPoint[]> {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCMonth(start.getUTCMonth() - (EARNINGS_MONTHS - 1));
  const rows = await getDb()
    .select({ month: sql<string>`to_char(${ledgerEntries.createdAt} at time zone 'UTC', 'YYYY-MM')`, cents: sql<number>`sum(${ledgerEntries.amountCents})::int` })
    .from(ledgerEntries)
    .where(and(eq(ledgerEntries.creatorId, creatorId), eq(ledgerEntries.type, "payout"), eq(ledgerEntries.status, "completed"), gte(ledgerEntries.createdAt, start)))
    .groupBy(sql`1`);
  const byMonth = new Map(rows.map((r) => [r.month, r.cents]));
  return Array.from({ length: EARNINGS_MONTHS }, (_, i) => {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
    const month = d.toISOString().slice(0, "YYYY-MM".length);
    return { month, label: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }), cents: byMonth.get(month) ?? 0 };
  });
}

async function loadCreatorLedger(creatorId: string): Promise<LedgerRowDto[]> {
  const rows = await getDb().select().from(ledgerEntries).where(eq(ledgerEntries.creatorId, creatorId)).orderBy(desc(ledgerEntries.createdAt));
  return rows.map(toLedgerDto);
}

async function loadBillingSummary(brandId: string): Promise<BillingSummary> {
  const [row] = await getDb()
    .select({
      balance: sql<number>`coalesce(sum(${ledgerEntries.amountCents}), 0)::int`,
      topups: sql<number>`coalesce(sum(${ledgerEntries.amountCents}) filter (where ${ledgerEntries.type} = 'topup'), 0)::int`,
      committed: sql<number>`coalesce(-sum(${ledgerEntries.amountCents}) filter (where ${ledgerEntries.type} = 'booking'), 0)::int`,
      n: count(),
    })
    .from(ledgerEntries)
    .where(eq(ledgerEntries.brandId, brandId));
  return { balanceCents: row?.balance ?? 0, topupsCents: row?.topups ?? 0, committedCents: row?.committed ?? 0, entries: row?.n ?? 0 };
}

async function loadBrandLedger(brandId: string): Promise<LedgerRowDto[]> {
  const rows = await getDb().select().from(ledgerEntries).where(eq(ledgerEntries.brandId, brandId)).orderBy(desc(ledgerEntries.createdAt));
  return rows.map(toLedgerDto);
}

// Cached per owner: the ledger only moves through a payout or a top-up, and
// both revalidate these tags.
export function getEarningsSummary(creatorId: string) {
  return cachedRead(loadEarningsSummary, ["earnings-summary"], { tags: [tag.creatorEarnings(creatorId)] })(creatorId);
}

export function getEarningsByMonth(creatorId: string) {
  return cachedRead(loadEarningsByMonth, ["earnings-by-month"], { tags: [tag.creatorEarnings(creatorId)] })(creatorId);
}

export function getCreatorLedger(creatorId: string) {
  return cachedRead(loadCreatorLedger, ["creator-ledger"], { tags: [tag.creatorEarnings(creatorId)] })(creatorId);
}

export function getBillingSummary(brandId: string) {
  return cachedRead(loadBillingSummary, ["billing-summary"], { tags: [tag.brandBilling(brandId)] })(brandId);
}

export function getBrandLedger(brandId: string) {
  return cachedRead(loadBrandLedger, ["brand-ledger"], { tags: [tag.brandBilling(brandId)] })(brandId);
}
