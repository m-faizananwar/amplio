import { describe, expect, it } from "vitest";
import { amountsFrom, checkMoney, parseEuros } from "./money-check";

describe("money in the agent's words", () => {
  it("reads euro amounts in English and French formats", () => {
    expect(parseEuros("€65")).toBe(65);
    expect(parseEuros("€1,050.00")).toBe(1050);
    expect(parseEuros("65,00 €")).toBe(65);
    expect(parseEuros("4 685,00 €")).toBe(4685);
  });

  it("collects every …Cents field from tool output", () => {
    expect([...amountsFrom({ creators: [{ priceCents: 6500 }, { priceCents: 14_500 }], walletCents: 551_000 })]).toEqual([65, 145, 5510]);
  });

  it("drops a sentence with an amount no tool returned (the invented €150)", () => {
    const allowed = amountsFrom({ facts: [{ cents: 6500 }, { cents: 13_000 }] });
    const out = checkMoney("I booked Marco and Coby. Their fees of €150.00 each are now held. They have until Friday to answer.", allowed);
    expect(out.text).toBe("I booked Marco and Coby. They have until Friday to answer.");
    expect(out.dropped).toBe(1);
  });

  it("keeps sentences whose amounts match the tools", () => {
    const allowed = amountsFrom({ totalCents: 13_000, priceCents: 6500 });
    expect(checkMoney("€130.00 is held: €65 each.", allowed).text).toBe("€130.00 is held: €65 each.");
  });
});
