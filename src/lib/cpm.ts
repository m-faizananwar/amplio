// CPM: what one thousand views cost at the creator's post price, so brands can
// compare creators of different sizes on one number.
const VIEWS_PER_CPM = 1000;

// Returns cents per 1,000 views, or null when there is no reach to divide by.
export function cpmCents(priceCents: number, medianViews: number): number | null {
  if (medianViews <= 0) return null;
  return Math.round((priceCents / medianViews) * VIEWS_PER_CPM);
}

// Reverse of cpmCents: the price a given reach and CPM imply ("How pricing is calculated").
export function priceFromCpmCents(cpm: number, medianViews: number): number {
  return Math.round((cpm * medianViews) / VIEWS_PER_CPM);
}
