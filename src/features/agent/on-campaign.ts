// Splits a booking into who can still be invited and who is already on the
// campaign, and says so plainly. Pure.
export type Pick = { id: string; name: string };

export function splitOnCampaign<T extends Pick>(picks: T[], onCampaign: Set<string>): { bookable: T[]; already: T[] } {
  return { bookable: picks.filter((p) => !onCampaign.has(p.id)), already: picks.filter((p) => onCampaign.has(p.id)) };
}

export function alreadyLine(already: Pick[], campaign: string, locale: "en" | "fr"): string {
  const names = already.map((p) => p.name).join(", ");
  if (locale === "fr") return `${names} ${already.length > 1 ? "font déjà" : "fait déjà"} partie de ${campaign}.`;
  return `${names} ${already.length > 1 ? "are" : "is"} already on ${campaign}.`;
}
