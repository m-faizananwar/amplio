// Where a creator's profile figures came from, as far as the data can tell:
// seeded demo creators are demo data; otherwise the LinkedIn read is the only
// thing that writes followers (the card step never asks for them), so any
// followers mean the figures were imported, and none mean the creator filled
// the card by hand. Pure.
export type ProfileSource = "demo" | "imported" | "manual";

export function profileSource({ seeded, followers }: { seeded: boolean; followers: number }): ProfileSource {
  if (seeded) return "demo";
  return followers > 0 ? "imported" : "manual";
}
