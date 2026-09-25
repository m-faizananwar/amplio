import type { OpportunityDto } from "../../schemas";
import { ALL, type OpportunityFilterState } from "./OpportunityFilters";

// Client-side filtering and sorting (the list is small: one row per open campaign).
export function filterOpportunities(list: OpportunityDto[], f: OpportunityFilterState): OpportunityDto[] {
  const q = f.query.trim().toLowerCase();
  const filtered = list.filter((o) => {
    if (q && !`${o.brandCompany} ${o.campaignName}`.toLowerCase().includes(q)) return false;
    if (f.industry !== ALL && !o.industries.includes(f.industry)) return false;
    if (f.region !== ALL && !o.regions.includes(f.region)) return false;
    return true;
  });
  const by: Record<OpportunityFilterState["sort"], (a: OpportunityDto, b: OpportunityDto) => number> = {
    relevance: (a, b) => b.matchScore - a.matchScore,
    deadline: (a, b) => (a.daysToDeadline ?? Infinity) - (b.daysToDeadline ?? Infinity),
    brand: (a, b) => a.brandCompany.localeCompare(b.brandCompany),
  };
  return [...filtered].sort(by[f.sort]);
}

export function distinctValues(list: OpportunityDto[], pick: (o: OpportunityDto) => string[]): string[] {
  return [...new Set(list.flatMap(pick))].sort((a, b) => a.localeCompare(b));
}
