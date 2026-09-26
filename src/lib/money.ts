// Money is stored as integer cents everywhere. These are the only conversions.
const CENTS_PER_UNIT = 100;

export function toCents(amount: number): number {
  return Math.round(amount * CENTS_PER_UNIT);
}

export function formatCents(cents: number, currency = "USD", locale = "en-US"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    cents / CENTS_PER_UNIT,
  );
}

// The app's locales as Intl tags: English reads "€1,370", French "1 370 €".
export function intlTag(locale: string): string {
  return locale === "fr" ? "fr-FR" : "en-GB";
}

// Euros and cents in the reader's locale: English "€3,550.00", French "3 550,00 €".
export function formatEuros(cents: number, locale: string): string {
  return new Intl.NumberFormat(intlTag(locale), { style: "currency", currency: "EUR" }).format(cents / CENTS_PER_UNIT);
}

// Whole euros for marketing figures (prices per post, a paid total).
export function formatWholeEuros(cents: number, locale: string): string {
  return new Intl.NumberFormat(intlTag(locale), { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Math.round(cents / CENTS_PER_UNIT));
}

export function formatCount(n: number, locale: string): string {
  return n.toLocaleString(intlTag(locale));
}
