import { describe, expect, it } from "vitest";
import { budgetCheck, budgetFrom, isBudgetAsPriceCap, parseBudget, saysPerCreator } from "./budget";

describe("reading a stated budget", () => {
  it("reads monthly and total budgets in both languages", () => {
    expect(parseBudget("our budget is €2k a month")).toEqual({ cents: 200_000, period: "month" });
    expect(parseBudget("budget €2,000 per month")).toEqual({ cents: 200_000, period: "month" });
    expect(parseBudget("notre budget est de 2 000 € par mois")).toEqual({ cents: 200_000, period: "month" });
    expect(parseBudget("total budget 1500 euros")).toEqual({ cents: 150_000, period: "total" });
  });

  it("a price with no budget word is not a budget", () => {
    expect(parseBudget("French creators under €500")).toBeNull();
  });

  it("the message wins over saved notes", () => {
    expect(budgetFrom("book them, budget €900 total", ["budget €2k a month"])).toEqual({ cents: 90_000, period: "total" });
    expect(budgetFrom("book 3 creators", ["only French creators", "budget €2k a month"])).toEqual({ cents: 200_000, period: "month" });
  });
});

describe("a budget is not a per-creator price", () => {
  const monthly = { cents: 200_000, period: "month" as const };

  it("a price cap equal to the monthly budget is the budget misread", () => {
    expect(isBudgetAsPriceCap(2000, monthly, "find me 3 French SaaS creators")).toBe(true);
  });

  it("unless the user says it is per creator or per post", () => {
    expect(saysPerCreator("up to €2000 per creator")).toBe(true);
    expect(isBudgetAsPriceCap(2000, monthly, "creators at €2000 per post max")).toBe(false);
  });

  it("a real price cap stays a price cap", () => {
    expect(isBudgetAsPriceCap(500, monthly, "French creators under €500")).toBe(false);
  });

  it("the budget split across creators isn't a price cap either", () => {
    expect(isBudgetAsPriceCap(2500, { cents: 500_000, period: "total" }, "find me 2 SaaS creators in Germany and book them, budget €5,000 total")).toBe(true);
  });
});

describe("keeping a booking within the budget", () => {
  const monthly = { cents: 200_000, period: "month" as const };

  it("says how much of this month's budget the booking uses", () => {
    expect(budgetCheck({ budget: monthly, spentCents: 50_000, totalCents: 74_000, locale: "en" })).toEqual({ ok: true, fact: { label: "Budget", value: "€1,240.00 of your €2,000.00 this month", cents: 124_000 } });
  });

  it("refuses what would go over, counting what was already booked this month", () => {
    expect(budgetCheck({ budget: monthly, spentCents: 150_000, totalCents: 74_000, locale: "en" })).toEqual({ ok: false, leftCents: 50_000, error: "The fees total €740.00, and €500.00 is left of your €2,000.00 this month (€1,500.00 already booked this month)." });
  });

  it("a total budget ignores earlier months' bookings", () => {
    const out = budgetCheck({ budget: { cents: 90_000, period: "total" }, spentCents: 500_000, totalCents: 74_000, locale: "fr" });
    expect(out.ok && out.fact.value.replace(/[\u202f\u00a0]/g, " ")).toBe("740,00 € de votre budget de 900,00 €");
  });
});
