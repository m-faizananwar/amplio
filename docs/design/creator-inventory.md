# Creator side + Settings — inventory

What each creator page and each settings panel reads, what it lets you do, and which states
it has, taken from the code on `main` at `cd2cd40`. This is the checklist for the redesign:
the new pages keep **the same data and the same actions** (frontend only) and are laid out
per `DIRECTION.md` / `DECISIONS.md`. Copy for everything below is drafted separately into
next-intl message files (`messages/{en,fr}/creator.json`, `settings.json`).

Legend: **Q** = read (query, `features/*/server/*queries.ts`), **A** = server action
(`features/*/server/actions.ts`), **S** = states the page must render.

---

## 1. Overview — `/creator` → becomes **Needs you**

Today: 4 public-LinkedIn tiles (reach, posts, engagements, followers), card block + launch
guide, recommended opportunities, active collaborations, `?tour=1` overlay.

New layout (DECISIONS: "Overview = Needs you"):

1. **Needs you** — a short list, most urgent first, each row = one thing + its button:
   | Item | Source (existing data) | Button → |
   |---|---|---|
   | Invitation to answer | `listCreatorCollaborations` rows with `status = invited` (fee, brand, campaign, due date) | open collaboration (accept/decline there) |
   | Changes requested | rows with `status = changes_requested` (+ `reviewNote`, round `n` of `max`) | open collaboration → draft form |
   | Draft to write | rows with `status = accepted` | open collaboration → draft form |
   | Post to schedule | rows with `status = approved` | open collaboration → schedule |
   | Post to publish | rows with `status = scheduled` (+ scheduled date) | open collaboration → publish (URL) |
   | Money to withdraw | `getEarningsSummary.availableCents > 0` | Earnings → Withdraw dialog |
   | Setup unfinished | card has no price or no industries (`getPublicCard`) | Settings → profile / pricing |
2. **Three numbers** (StatCard, each opens the trail drawer):
   - Earned to date — `getEarningsSummary` (paid) → trail = ledger rows (`getCreatorLedger`, type `payout`)
   - Clicks on your links — sum of `getTrackedLinkPerformance().clicks` → trail = click rows (**needs a row query**, see Open questions)
   - Live posts — rows with `status in (live, paid)` → trail = those collaborations with post URL + published date
3. Nothing else. Recommended opportunities and active collaborations are reachable one click
   away (Opportunities, Collaborations); the LinkedIn vanity tiles move to Analytics.

**Q** `getCreatorOverview` (reach/posts/engagements/followers/recommended/active),
`listCreatorCollaborations`, `getEarningsSummary`, `getPublicCard`, `getTrackedLinkPerformance`.
**A** none on the page itself (actions live on the detail page and in the Withdraw dialog).
**S** populated · all-clear ("Nothing needs you right now" + next useful step: browse
opportunities) · new creator (setup unfinished row first) · loading · error.

Cut: `TourOverlay` + `?tour=1` (see §9). `WORKSPACE_AFTER_ONBOARDING` must point to `/creator`.

---

## 2. My card — `/creator/card` (+ public `/c/[handle]`)

Today: `WorkspaceCard` (front/back), Deal-link dialog, "Open card", explainer section with
affiliate share %. Affiliate program lives separately at `/creator/affiliate`.

New: the card + **one "Your links" section** (DECISIONS "Merged"):
- **Deal link** `/{origin}/c/{handle}` — copy, open, "add to LinkedIn" hint (DealLinkDialog today).
- **Referral link** `/{origin}/register/brand?ref={handle}` — copy; beneath it the affiliate
  numbers from `getAffiliateSummary`: rewards earned (cents), brands introduced, brands
  rewarding, earning now (inside the 3-month window), and the `IntroducedBrands` list.
  Terms line: `AFFILIATE_SHARE_PERCENT`% of the platform commission for `AFFILIATE_MONTHS`
  months from the brand's first paid campaign.
- Edit → Settings (profile/pricing fields).

**Q** `getPublicCard(handle)`: handle, name, headline, bio, industries, country, avatarUrl,
followers, medianViews, priceCents, bundle {posts,totalCents}, engagementRate,
audienceJobTitles, audienceSeniority, postsAnalyzed, reactionsPerPost, commentsPerPost,
publishedCollaborations. `getAffiliateSummary(creatorId)`: rewardsCents, brandsIntroduced,
brandsRewarding, earningNow, brands[].
**A** none (copy-to-clipboard is client-only).
**S** populated · card incomplete (no price / no industries → say what's missing, link to
Settings) · no referrals yet (empty state: "share your referral link") · copy success/fail toast.

Public `/c/[handle]`: same `getPublicCard`; 404 via `notFound()`; CTA "Book {first name}"
→ `/register/brand` (keep `?ref`/creator preselect behaviour). Public page, demo data
labelled if the handle is a seeded demo creator.

Honesty: the affiliate footnote currently says the platform commission is assumed —
decision: we state our own take rate and the footnote says it plainly.

---

## 3. Opportunities — `/creator/opportunities` (+ brief drawer, apply)

**Q** `listOpportunities(creatorId)` → `OpportunityDto[]`: campaignId, campaignName,
description, brandCompany, brandInitial, brandWebsite, industries, regions, postDeadline,
daysToDeadline, matchScore, matchReason, listPriceCents, existingCollaborationId,
existingStatus, brief (`BriefDto`).
**A** `applyToCampaign({ campaignId, csrfToken })` → creates `applied` collaboration
(via ApplyDialog confirm). Brief drawer: copy brief as Markdown / "copy for AI" (client).
Filters (client): industry, region, deadline, fit (`filterOpportunities.ts`).
**S** populated (cards sorted by fit, with the fit reason visible, per DECISIONS "fit score
with its signals") · filtered-empty (reset filters) · none open (empty state) · already
applied/invited (card shows status + link to the collaboration instead of Apply) ·
applying (pending) · apply error toast · loading · error.

---

## 4. Collaborations — `/creator/collaborations` and `/creator/collaborations/[id]`

List today: 6 tabs (all/active/needs_action/applications_sent/declined/completed), table
with brand, campaign, status chip, performance (clicks), next action, due date, "your net".

New list (DECISIONS "next action and who owns it"): **every row = next action + owner**,
default filter **Needs you**; secondary filters: Waiting on brand · Live · Done (paid /
declined). Owner per status (from `TRANSITIONS`):

| Status | Next action (creator view) | Owner |
|---|---|---|
| invited | Accept or decline the invitation | you |
| applied | Waiting for {brand} to answer | brand |
| accepted | Write the draft | you |
| draft_submitted | {brand} is reviewing your draft | brand |
| changes_requested | Update your draft (round n of max) | you |
| approved | Schedule the post | you |
| scheduled | Publish and add the post URL | you |
| live | Waiting for {brand} to release payment | brand |
| paid | Paid — {amount} | done |
| declined | Closed | done |

**Q** `listCreatorCollaborations(creatorId)` → `CollaborationDto[]` (id, status,
brandCompany, brandInitial, campaignName, clicks, dueDate, feeCents, updatedAt,
allowedEvents, draftText, reviewNote, revisionRound, maxRevisionRounds, …).
`getCollaborationDetail({ id, role: "creator", ownerId })` → collaboration, events
(timeline), brief, trackedUrl.
**A** (detail page, keyed on `allowedEvents`, optimistic status):
- `decideInvitation({ collaborationId, csrfToken, decision: accept|decline })` — decline has a
  confirm ("the brand gets its fee back, closes for good")
- `submitDraft({ …, text })` — first draft and resubmission after changes
- `schedulePost({ …, date })`
- `publishPost({ …, postUrl })`
- (brief drawer: copy as Markdown / for AI)
**S** list: populated · tab-empty (e.g. nothing needs you) · no collaborations (empty →
Opportunities) · loading · error. Detail: each status above · saving (pending) · action
error toast with rollback · not found (404) · load error.

---

## 5. Analytics — `/creator/analytics`

**Q** `getPublicSnapshot(creatorId, range)` (followers, posts, reach, engagements,
postsWithReach), `getPublicPosts(creatorId, range)` (id, url, body, impressions, reactions,
comments, reposts, postedAt), `getTrackedLinkPerformance(creatorId)` (collaborationId,
brand, campaign, status, code, clicks, publishedAt). Range: `all | 30 | 90` via `?range=`.
**A** none.
New: **every metric opens the trail drawer** — followers (profile source + import date),
posts/reach/engagements → the post rows, clicks → the click rows per tracked link.
**S** populated · no public posts imported yet · no tracked links yet (link goes live when a
collaboration is published) · loading · error.
Honesty: LinkedIn public data is imported/simulated from the profile URL — label it
("imported from your public profile", stub per DECISIONS).

---

## 6. Earnings — `/creator/earnings` (+ withdraw)

**Q** `getEarningsSummary(creatorId)` (availableCents, awaitingReleaseCents,
awaitingReleaseCount, in-transit, totals), `getEarningsByMonth(creatorId)` (chart),
`getCreatorLedger(creatorId)` → `LedgerRowDto[]` (id, date, type topup|booking|payout|
withdrawal, status pending|completed, amountCents, reference, description).
**A** `withdrawEarnings({ amountCents ≥ €10, method: stripe|bank })`.
New: available / awaiting release / withdrawn as three StatCards opening their ledger rows;
ledger table (sortable, Geist Mono amounts); Withdraw dialog (amount, method, confirm).
**S** populated · nothing earned yet · nothing available (withdraw disabled with reason) ·
withdrawal pending (in transit) · withdraw error · loading · error.
Honest stub: Stripe payout method is not connected ("Status: Not connected") — the ledger
stands in for a processor; say so in the dialog.

---

## 7. Messages — `/creator/messages`, `/creator/messages/[collaborationId]`

**Q** `listThreads(scope)` (ThreadDto: collaboration, other party, last message, unread),
`getThread(scope, id)` (messages, collaboration summary). Bot thread `BOT_THREAD_ID`
(the assistant's intro thread).
**A** `sendMessage({ collaborationId, body, csrfToken })` (optimistic bubble), quick reactions.
Threads exist only from `accepted` onwards (`THREAD_STATUSES`).
**S** no threads (explain when a thread opens) · list + no thread selected · thread ·
sending/pending · send error · not found · loading · error. 375: list and thread are two
screens.

---

## 8. Settings — both roles

Rule: **the same fields onboarding uses** (asked the fork for the new onboarding field
components; build on theirs, don't fork them).

### Creator — `/creator/settings`
| Section | Fields | Schema / action today |
|---|---|---|
| LinkedIn | linkedinUrl | onboarding `linkedinSchema` / `readLinkedinProfile` (import is simulated — label it) |
| Card | headline, country, industries (≤3) | onboarding `cardSchema` / `saveCreatorCard` |
| Pricing | priceCents (€20–€1,500), bundles (posts, total) ≤ N | onboarding `priceSchema` / `savePricing` |
| Business | legalCountry, registeredBusiness, legalName, legalAddress, 2 acknowledgements | onboarding `professionalSchema` / `saveProfessionalInfo` |
| Payouts (settings-only) | method stripe/bank, accountHolder, IBAN | `payoutDetailsSchema` / `updatePayoutDetails` |
| Account (settings-only) | email, handle (read-only); delete account (confirm; demo protected) | `deleteAccount` |

Today's `CreatorProfileForm` also has first/last name and `xHandle` — keep name (needed for
the card), drop X handle unless onboarding keeps it (nothing reads it besides the form).

### Brand — `/brand/settings`
| Section | Fields | Schema / action today |
|---|---|---|
| Company | website (+ re-read with AI), company, valueProp | onboarding `websiteSchema` + `profileSchema` / `analyzeWebsite`, `updateBrandProfile` |
| Ideal customers | 3 ICP cards (title, description) | onboarding `icpSchema` / (new: save via `completeOnboarding`-equivalent or `updateBrandProfile`) |
| Audience | targetIndustries, targetRegions | `brandAudienceSchema` / `updateBrandAudience` |
| Team (settings-only) | owner, invite colleague (email) | `TeamAccessPanel` (check: is the invite real? see Real vs stubbed) |
| Account (settings-only) | delete account (confirm; demo protected) | `deleteAccount` |

Cut from brand settings: the "Integrations" tab (links to `/brand/integrations` = MCP page,
cut per DECISIONS) — the pixel + site key stay on Results.

**S** (both) populated · saving · saved toast · field errors (zod messages, translated) ·
server error · demo account (delete disabled with reason).

---

## 9. Cut — routes and every link to them

| Route | Links to remove |
|---|---|
| `/creator/community` | `components/shell/nav.ts` (CREATOR_NAV), `features/voice/constants.ts` (voice routes) |
| `/creator/integrations` | `nav.ts` (CREATOR_ACCOUNT_NAV), voice constants |
| `/creator/tour` | `nav.ts` (CREATOR_ACCOUNT_NAV), voice constants, `WORKSPACE_AFTER_ONBOARDING` (`/creator?tour=1`), `TourOverlay` |
| `/creator/affiliate` | `nav.ts` (CREATOR_NAV), voice constants — folded into My card; redirect `/creator/affiliate` → `/creator/card#links` |

Also delete what only they use: `Leaderboard`, `getLeaderboard`, `LEADERBOARD_SIZE`,
`CountryGlobe` (if nothing else imports it), `TourOverlay`, the creator integrations
components. Cut routes must 404 (or redirect, for affiliate) with no link left.

---

## 10. Assistant + call mode (restyle later, keep every function)

`AssistantPill` / `AssistantWidget` / `ChatPanel` / call overlay (`CallOverlayHost`,
`/creator/call`, `/brand/call`), voice (`features/voice`, web-speech), agent-mode toggle.
Rule stays: it asks before anything that moves money or changes a collaboration. Voice
route map (`features/voice/constants.ts`) must drop the cut routes.

---

## Real vs stubbed (creator + settings scope, first pass)

| Where | What | Plan |
|---|---|---|
| LinkedIn import (`lib/linkedin-profile.ts`, `LinkedinStep`) | profile + posts simulated from the URL | allowed stub per DECISIONS — label in UI |
| Payout method Stripe (`PayoutMethodRadio`) | "Not connected" | allowed stub (ledger stands in) — label |
| `/creator/affiliate` "Invite creators" tab | "not part of this build" | cut (merged into My card) |
| `/creator/community` Slack button | disabled, "not part of this build" | cut with the page |
| Affiliate footnote | says the platform commission is assumed | state our own take rate |
| `CreatorProfileForm` | grep hit — check copy for "simulated" wording | review when redesigning Settings |
| Team invite (`TeamAccessPanel`) | to verify: does it write a row / send email? | verify, then real / cut / label |

## Open questions

- **Trail rows for clicks** — no row-level click query exists for creators (only the
  aggregate `getTrackedLinkPerformance`). Needs `listCreatorClicks(creatorId, range)`
  (clicks ⨝ tracking_links ⨝ collaborations: time, campaign, brand, referrer, device).
  Ask the builder whether a shared trail query is coming for the brand side first.
- **Settings fields** — waiting on the fork's onboarding field components.
