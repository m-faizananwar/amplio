// The cache vocabulary, in one place: every cached read declares the tags it
// belongs to, every mutation declares the tags it dirties. Pure strings, so the
// mapping is unit-testable without a database or a request.
//
// Scope: a tag names an owner (a brand, a creator, a campaign, a signed-in
// user) and a surface. Never a route — routes move, ownership does not.

export type CacheScope = {
  brandId?: string | null;
  creatorId?: string | null;
  campaignId?: string | null;
  /** Signed-in users whose shell (wallet, notifications, launch plan) changed. */
  userIds?: Array<string | null | undefined>;
};

export const tag = {
  /** Everything the app shell renders for one signed-in user. */
  viewer: (userId: string) => `viewer:${userId}`,
  /** The session row behind one cookie; cleared on logout. */
  session: (tokenHash: string) => `session:${tokenHash}`,

  brandOverview: (brandId: string) => `brand:${brandId}:overview`,
  brandCampaigns: (brandId: string) => `brand:${brandId}:campaigns`,
  brandCollaborations: (brandId: string) => `brand:${brandId}:collaborations`,
  brandResults: (brandId: string) => `brand:${brandId}:results`,
  brandBilling: (brandId: string) => `brand:${brandId}:billing`,
  brandMessages: (brandId: string) => `brand:${brandId}:messages`,
  brandShortlist: (brandId: string) => `brand:${brandId}:shortlist`,
  brandSettings: (brandId: string) => `brand:${brandId}:settings`,

  creatorOverview: (creatorId: string) => `creator:${creatorId}:overview`,
  creatorCollaborations: (creatorId: string) => `creator:${creatorId}:collaborations`,
  creatorOpportunities: (creatorId: string) => `creator:${creatorId}:opportunities`,
  creatorEarnings: (creatorId: string) => `creator:${creatorId}:earnings`,
  creatorMessages: (creatorId: string) => `creator:${creatorId}:messages`,
  creatorAnalytics: (creatorId: string) => `creator:${creatorId}:analytics`,
  creatorCard: (creatorId: string) => `creator:${creatorId}:card`,

  campaign: (campaignId: string) => `campaign:${campaignId}`,
  /** The marketplace list everyone browses: one creator's card changes it. */
  creatorDirectory: () => "creators:directory",
} as const;

export type MutationKind =
  | "booking"
  | "collaboration-status"
  | "message"
  | "shortlist"
  | "campaign"
  | "top-up"
  | "withdraw"
  | "brand-profile"
  | "creator-profile"
  | "tracking";

type Builder = (scope: CacheScope) => Array<string | null>;

// `id ? keys.map(...) : []` once, instead of a null check per row below.
function withId(id: string | null | undefined, keys: Array<(id: string) => string>) {
  return id ? keys.map((key) => key(id)) : [];
}

function viewers(scope: CacheScope) {
  return (scope.userIds ?? []).flatMap((id) => (id ? [tag.viewer(id)] : []));
}

// One row per mutation: what it writes, and therefore what must be re-read.
// A booking moves money (wallet → held), so billing and the shell go with it.
const MUTATIONS: Record<MutationKind, Builder> = {
  booking: (s) => [
    ...withId(s.brandId, [tag.brandCollaborations, tag.brandOverview, tag.brandBilling, tag.brandCampaigns]),
    ...withId(s.creatorId, [tag.creatorCollaborations, tag.creatorOpportunities, tag.creatorOverview]),
    ...withId(s.campaignId, [tag.campaign]),
    ...viewers(s),
  ],
  "collaboration-status": (s) => [
    ...withId(s.brandId, [tag.brandCollaborations, tag.brandOverview, tag.brandBilling, tag.brandResults, tag.brandCampaigns]),
    ...withId(s.creatorId, [tag.creatorCollaborations, tag.creatorOpportunities, tag.creatorOverview, tag.creatorEarnings, tag.creatorAnalytics]),
    ...withId(s.campaignId, [tag.campaign]),
    ...viewers(s),
  ],
  message: (s) => [
    ...withId(s.brandId, [tag.brandMessages, tag.brandOverview]),
    ...withId(s.creatorId, [tag.creatorMessages, tag.creatorOverview]),
    ...viewers(s),
  ],
  shortlist: (s) => [...withId(s.brandId, [tag.brandShortlist]), ...withId(s.campaignId, [tag.campaign])],
  campaign: (s) => [...withId(s.brandId, [tag.brandCampaigns, tag.brandOverview, tag.brandCollaborations]), ...withId(s.campaignId, [tag.campaign]), ...viewers(s)],
  "top-up": (s) => [...withId(s.brandId, [tag.brandBilling, tag.brandOverview]), ...viewers(s)],
  withdraw: (s) => [...withId(s.creatorId, [tag.creatorEarnings, tag.creatorOverview]), ...viewers(s)],
  "brand-profile": (s) => [...withId(s.brandId, [tag.brandSettings, tag.brandOverview, tag.brandCampaigns]), ...viewers(s)],
  "creator-profile": (s) => [
    ...withId(s.creatorId, [tag.creatorOverview, tag.creatorCard, tag.creatorEarnings]),
    tag.creatorDirectory(),
    ...viewers(s),
  ],
  // A click or a pixel event: attribution numbers only, no shell, no money.
  tracking: (s) => [
    ...withId(s.brandId, [tag.brandResults, tag.brandOverview]),
    ...withId(s.creatorId, [tag.creatorAnalytics]),
    ...withId(s.campaignId, [tag.campaign]),
  ],
};

/** The tags one mutation dirties. Deduped and sorted so tests can compare. */
export function tagsForMutation(kind: MutationKind, scope: CacheScope): string[] {
  return [...new Set(MUTATIONS[kind](scope).filter((value): value is string => Boolean(value)))].sort();
}
