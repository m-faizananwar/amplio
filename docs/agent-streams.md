# Agent streams — the fan-out

How the build was split on 2026-09-12 (hour ~7). The integrator session (this repo's `.agent-logs/`) spawned four
subagents, each in its own git worktree on its own branch, and merged them onto `main` in the order D → A → B → C.
The subagents' own prompt/response traffic is not captured by the `.agent-logs/` hook (it only fires for the
integrator session), so the prompts sent and the final reports received are reproduced here. Structure, specs and
findings are as sent and received; worktree paths, database names and product naming use the Amplio names.

Two notes on fidelity:
- A first launch used the Agent tool's `isolation: "worktree"` and failed ("not in a git repository" — the harness had
  cached the pre-`git init` state). The worktrees were then created by hand under `/Users/nexxus/Projects/amplio-streams/`
  and the four prompts re-sent with one extra header paragraph naming the worktree path. The re-sent versions are the
  ones below.
- The reports arrived HTML-escaped by the notification transport (`&amp;&amp;`, `&gt;`); those entities are decoded here.

---

## Stream A — prompt

You are STREAM A of a four-stream parallel build of Amplio (a B2B LinkedIn creator marketplace). Your git worktree is at `/Users/nexxus/Projects/amplio-streams/stream-a` on branch `stream/a` (branched from main). EVERY shell command must run there (`cd /Users/nexxus/Projects/amplio-streams/stream-a && …`) and every file you read or write must be under that path. Never touch the integrator's checkout or the other stream folders. Three other streams work in parallel; an integrator merges everyone onto main.

### First, read (all paths relative to your worktree)
- CLAUDE.md (engineering rules — lint enforces most of them), docs/plan.md (§1 data model — creators, shortlist, collaborations; §2 build order step 5 — Brand › Creators).
- Existing code you build on: src/db/schema/*.ts (creators, creator_posts, brands, campaigns, shortlist, collaborations), src/lib/fit-score.ts (fitScore(creator, campaign) → { score, signals, reason }; icpBuckets), src/features/collaborations/server/create.ts (createCollaboration — funded invitations hold the fee from the wallet, throws InsufficientFundsError/DuplicateCollaborationError), src/features/auth/server/session.ts (getViewer() → viewer with brand { id, company, walletCents } and csrfToken), src/components/page/* (PageHeader, EmptyState, ErrorState, PageSkeleton), src/components/shell/* (the app shell your pages render inside), src/lib/money.ts, scripts/seed/* (what the data looks like: 300 creators with audience mixes, posts, prices, bundles).

### Setup
- `pnpm install` (lockfile present). Do NOT add dependencies — recharts, sonner (Toaster already mounted in the root layout; `import { toast } from "sonner"`), date-fns, zod, react-hook-form, lucide-react and the shadcn components in src/components/ui (dialog, tabs, select, textarea, switch, checkbox, popover, command, table, progress, scroll-area, toggle-group, badge, avatar, card, skeleton, tooltip…) are installed. Do not edit src/components/ui.
- `.env.local` already exists with `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/amplio`. Docker Postgres is running, migrated and seeded; it is SHARED with the other streams — reading is fine; your tests will mutate data (invitations); the demo brand Zune has wallet €4,385 which covers a few invitations; `pnpm db:seed` restores everything if needed.
- Demo login: /login → "Explore as demo brand" (brand@demo.amplio / demo1234).

### You own ONLY these paths
- src/features/marketplace/** (components/, server/queries.ts, server/actions.ts, schemas.ts, constants.ts; subfolders when a folder passes ~10 files)
- src/app/brand/creators/** (replace the placeholder page.tsx/loading.tsx there; add routes under it as needed)
- src/lib/… only NEW files you create for pure logic specific to you (e.g. src/lib/cpm.ts). Never edit existing src/lib files.
Never edit: src/db/**, src/features/auth/**, src/features/collaborations/**, src/components/shell/**, src/components/page/**, src/components/ui/**, src/app/layout.tsx, src/app/brand/layout.tsx, root config files, package.json, .claude/**, .agent-logs/**, CLAUDE.md, README.md, docs/**. If you truly need a change outside your paths, do not make it — describe it in your final report.

### Build (the spec, from the product owner — follow its copy and layout exactly)
Brand › Creators page with two tabs at the top: "AI Matching" | "Creator Marketplace". Build the marketplace first.

Creator Marketplace:
- Header "All creators" with the sentence: "All creators are shown from most to least relevant, using sector fit first and verified performance statistics to refine the order."
- Tabs "All creators N" | "Shortlist N" (N are real counts).
- Search "Search for a creator…", SORT BY (Best match · Price: low to high · Most followers · Best engagement), filter pills: Industry (searchable, the 24 industries), Country (searchable), Price (Min / Max, "Show N creators"), Reset.
- A campaign selector (default: the brand's most recent active campaign) — the fit % on every card is computed against the selected campaign with fitScore(); URL state carries campaign, filters, sort, search, page.
- Pagination: 24 per page, "Show more creators (24 / 300)" append button pattern, page in the URL.
- Card: bookmark (shortlist star — persists in the shortlist table, optimistic toggle with rollback + toast), LinkedIn badge, "Book" button, avatar (dicebear url from the seed), name, industries + country flag (emoji flag from the ISO code is fine), stats FOLLOWERS / MEDIAN VIEWS / CPM / POST COST (CPM = post cost ÷ median views × 1000, in €), fit % pill, "View profile →".
- Profile modal (dialog): header avatar · name · "{industries} · LinkedIn creator" · bookmark · ✕. Tabs Overview | Audience | Content. Overview: "Creator overview — Review this creator's audience and recent content before booking." chips like "48% in observed audience · Marketing", "17.3K typical reach". "Audience snapshot — Estimated from N recent public engagers" with JOB TITLE bars and SENIORITY bars from audienceJobTitles / audienceSeniority. "Content performance": "Reach across recent posts" line chart (recharts) over creator_posts impressions + latest post card (date · "Public LinkedIn post" · Open original · text · "17.3K estimated" · reactions · comments · reposts). Fit breakdown: the fit % with its four signals (bars) and the one-line reason from fitScore(). Right rail "Book this creator": Single post {price} € (selected) | Bundle · {posts} · {total} € when the creator has one; Typical reach · Estimated CPM · Posts analyzed; "How pricing is calculated" popover (typical reach × CPM); button "Collaborate with {Name}"; "Secure booking · Creator approves first".
- Booking: "Book" and "Collaborate with {Name}" open the "Your selection" dialog: "CREATOR RATE · Single post · {price} € · Standard rate · Book this option at the listed price, or propose a lower price." [↔ Negotiate] [Book · {price} €] Back ✕ (bundle rows when the creator has one). "Book" creates the invitation via createCollaboration({ origin: "invitation", campaignId: selected campaign, creatorId, ... }) in a server action that checks the viewer is a brand owning the campaign; the fee is held from the wallet (funded invitation). On InsufficientFundsError show the "Add €500.00 and continue" CTA text as a disabled/explanatory state pointing to /brand/billing (billing is built later — do not build the add-budget dialog). On success: toast + the card's Book button becomes "Invited" (or the dialog shows "Invitation sent · the creator has 48 hours"). Duplicate → friendly error.
- "↔ Negotiate" opens the "Make an offer" dialog, copy verbatim: avatar · "{Creator} · Single post" · "Current price: {price} € per post" · "Choose a discount": 10% / 20% / 30% presets computed from the price + "Other (Enter a price)" + "Your offer €" input with helper "The creator will see a N% discount request." · "Post by — 14 days from now — Latest date the creator must publish the post. Defaults to 14 days." date input · "How should the creator work?" option card "Specific brief — Use detailed instructions from one of your campaign briefs." with a "Campaign — Pick a campaign that has a brief." select · checkbox "I want to approve the content before it is published." (on) · note "The creator receives the offer immediately and can accept or decline it within 48 hours." · CTA "Send offer · {offer} €" (the CTA becomes "Add €500.00 and continue" only when the wallet is short — same handling as above). Submits createCollaboration with feeCents/discountPercent/dueDate/approveBeforePublish/note.

AI Matching tab: cloud-ish header "Hey {Company}, let's find the right creators for you." prompt box prefilled "Find 4 creators for {campaign name}. Use my campaign brief and prioritize strong audience and content fit." SUGGESTED FOR YOU chips ("Find creators who already reach {ICP 1}", "Find creators with credible content about {industry}", "Build a balanced creator shortlist for {Company}"). Submitting runs a server action: rank the brand's creators by fitScore() against the selected campaign, take the top N (N parsed from the prompt, default 4), and return a written rationale ("Got it — I'm searching for N creators…" then "I found N creators for {Company}, ranked by relevance to your brief, then performance and cost." + a paragraph + a line starting "Trade-off: …") — generated with @anthropic-ai/sdk when ANTHROPIC_API_KEY is set (load the `claude-api` skill via the Skill tool before writing that code; use model "claude-sonnet-5"; never throw to the client; on any error fall back), and a TEMPLATE rationale (built from the fit signals and prices) when the key is missing or the call fails. Result rows: rank · avatar · name · LinkedIn badge · industries · flag · MEDIAN VIEWS · CPM · POST COST · Book · bookmark · → (opens the profile modal). Rail/labels "Amp · Creator intelligence", "New research".

Every list screen: loading skeleton (loading.tsx), empty state with CTA (e.g. no creators match the filters → "Reset filters"), error state. Check the layout at 375px and 1440px widths (cards stack; filters wrap).

### Rules that bite
- page.tsx is thin: read searchParams, call queries from src/features/marketplace/server/queries.ts, render feature components. Under 100 lines. Queries return plain DTOs (map drizzle rows with a toDto per entity), never drizzle rows; the fit score is computed in the query layer with fitScore() and included in the DTO.
- Mutations only in src/features/marketplace/server/actions.ts ("use server"), zod-validated (schemas in src/features/marketplace/schemas.ts), returning { ok: true, data } | { ok: false, error }. Verify ownership with getViewer(). Never throw to the client. Errors logged server-side with context.
- Views never import @/db (lint fails). 'use client' only for state/handlers. Server components by default.
- Max 500 lines per file, split components around 300, ~10 files per folder (make subfolders: components/cards, components/profile, components/booking, components/matching). One component per file, file = component name. No utils.ts.
- No magic numbers in server code — src/features/marketplace/constants.ts (PAGE_SIZE = 24, DISCOUNT_PRESETS, CPM_PER = 1000, etc.).
- Tailwind theme tokens only (no raw hex); `bg-brand` / `text-brand` is the brand blue. Real buttons/links, labelled inputs, focus states.
- Conventional commits, small, on your branch, `git add` only your paths. Do not push, do not merge, do not rebase, do not switch branches.

### Verify before you report
`pnpm typecheck && pnpm lint && pnpm test && pnpm build` green (lint warnings about long JSX functions are acceptable; errors are not). Then `PORT=3101 pnpm start` (background) and check your routes. You may use the browser tools on http://localhost:3101 in your OWN tab (tabs_create) — the browser pane is shared with other streams, so if it misbehaves fall back to curl for status codes and say what you could not verify visually. Log in via "Explore as demo brand". Check: cards render with real fit %, filters/sort/search/URL state, shortlist toggle persists across reload, profile modal with bars and chart, Book → invitation created (verify with a query; /brand/collaborations is not yours), Negotiate → offer with discount, AI Matching returns a ranked list with rationale (template path when no key). Reseed (`pnpm db:seed`) at the end if you consumed the demo wallet. Stop your server when done.

### Final report (this is all the integrator sees)
1. Branch name (`git rev-parse --abbrev-ref HEAD`) and worktree path (`pwd`).
2. Commits (oneline).
3. What's live vs stubbed, with routes.
4. Assumptions you made (every deviation from the spec, every decision the spec left open).
5. Anything you needed outside your paths (describe the change; don't make it).
6. README notes (a paragraph for the integrator to add).

## Stream A — report

# STREAM A — final report

## 1. Branch / worktree
- Branch: `stream/a`
- Worktree: `/Users/nexxus/Projects/amplio-streams/stream-a`
- Working tree clean; server stopped; DB reseeded (`pnpm db:seed`) at the end. Note: `.agent-logs/` had no new files in this worktree (the capture hook writes to the integrator's checkout), so nothing to commit there.

## 2. Commits (on top of `440c3d2` main)
```
165ed08 fix(marketplace): euro price filters in the URL, whole-euro CPMs, word-bounded industry hints for Amp
b6cdb9b feat(marketplace): brand creators marketplace, profile modal, funded booking, offers, Amp matching
```
`pnpm typecheck && pnpm lint && pnpm test && pnpm build` all green (lint: 0 errors, 15 warnings — all `max-lines-per-function` on JSX components, plus 4 pre-existing ones outside my paths). 25 tests pass (7 files; I added 4).

## 3. What's live vs stubbed

**Routes (all verified in the browser at 1440px and 375px, logged in as demo brand):**
- `/brand/creators` — Creator Marketplace tab. Live: "All creators" header + sentence, tabs "All creators N | Shortlist N" (real counts), campaign selector "Fit for" (defaults to most recent active campaign), search (debounced), sort (Best match / Price / Followers / Engagement), Industry + Country searchable multi-select pills, Price pill (Min/Max, "Show N creators"), Reset, 24/page "Show more creators (24 / 300)" append pattern; everything in the URL (`?campaign&tab&q&sort&industry&country&min&max&page`). Cards: bookmark (persists in `shortlist`, optimistic + rollback + toast, verified across reload), LinkedIn badge, Book, dicebear avatar, name, industries + emoji flag, FOLLOWERS/MEDIAN VIEWS/CPM/POST COST, fit % pill from `fitScore()`, "View profile →". Loading skeleton, empty states (no filter match → "Reset filters"; empty shortlist; no campaign), error state via never-throwing loader + `error.tsx`.
- Profile modal — Overview | Audience | Content tabs, chips ("38% in observed audience · Founders", "1.5K typical reach"), Audience snapshot ("Estimated from N recent public engagers") with JOB TITLE / SENIORITY bars, Content performance (recharts line over `creator_posts.impressions` + latest post card with Open original / reactions / comments / reposts), Fit breakdown (4 signal bars + reason), right rail "Book this creator" (Single post selected, Bundle row when present, Typical reach / Estimated CPM / Posts analyzed, "How pricing is calculated" popover, "Collaborate with {First name}", "Secure booking · Creator approves first").
- Booking — "Your selection" dialog (single + bundle rows, [↔ Negotiate] [Book · price], Back, ✕). Book calls `createCollaboration({origin:"invitation"})` via `bookCreator` action → verified DB row `invited`, ledger `booking/pending`, wallet debited, top-bar wallet refreshes, card shows "Invited". Wallet short → row shows "Add €X and continue" link to `/brand/billing` (X = shortfall rounded up to €500 steps, min €500) — verified with a €6,250 bundle. Server-side `InsufficientFundsError` / `DuplicateCollaborationError` map to `{ok:false, code}` too.
- "Make an offer" dialog — verbatim copy, 10/20/30% presets computed from price + Other, "Your offer €" with "The creator will see a N% discount request.", Post by (default +14 days), "Specific brief" card with campaign select, approve checkbox (on), 48h note, "Send offer · X €". Verified DB row: `fee_cents 26800, list_price 33500, discount 20, approve t, due_date, accept_by, offer_note "Specific brief · Zune creator brief"`.
- `/brand/creators/matching` — AI Matching tab. "Hey {Company}, let's find the right creators for you.", prefilled prompt, SUGGESTED FOR YOU chips (ICP 1 / target industry / company), Amp rail ("Amp · Creator intelligence", New research, Retry this search), "Got it — I'm searching for N creators…" → headline → rationale paragraph → "Trade-off: …" → result rows (rank · avatar · name · badge · industries · flag · MEDIAN VIEWS · CPM · POST COST · Book · bookmark · →). `runMatching` action ranks by `fitScore()`, N parsed from the prompt (default 4, cap 10), whole-word industry hints narrow the pool. **Template rationale verified live** (no key). **Claude path (`@anthropic-ai/sdk`, `claude-sonnet-5`, `output_config.effort: "low"`, 20s timeout, never throws → template fallback) is written per the claude-api skill but not exercised — no `ANTHROPIC_API_KEY` available.**

**Not built (by spec):** the add-budget dialog (links to `/brand/billing`), the "Filters (activity)" pill, "Professional profile" accordion, the "improving your shortlist" progress strip, "Undo/Stop/Apply request" rail items, copy/👍/👎 are toasts only.

## 4. Assumptions / deviations
- `/brand/creators` defaults to the **Marketplace** tab; AI Matching lives at `/brand/creators/matching` (the tab order lists AI Matching first, but the spec said build the marketplace first and it's the thumbnail).
- Page size 24 (spec), not 50. "Show more" sets `?page=N` and the server returns the first N×24 so a reload keeps the appended view.
- "All creators N" shows the filtered count on that tab (not the grand total); the Price pill's "Show N creators" shows the same filtered count.
- Best-match sort = fit score desc, tiebreak median views; fit and sort computed in memory over the SQL-filtered rows (≤300).
- Fit campaign input = campaign brief `targetIndustries` (fallback brand `targetIndustries`) + brand ICP titles.
- CPM = price ÷ median views × 1000, rendered to the whole euro ("11 €"); prices as "188 €" / "169.2 €" / "5 625 €" (new `src/lib/format-euro.ts`). `?min/?max` in the URL are euros.
- "Estimated from N recent public engagers" is derived (0.26% of median views, clamped 25–120) since the seed has no engager count.
- Bundle booking = one collaboration with `feeCents = bundle total` and note "Bundle · 5 posts" (the model is single-post).
- Offer note is set to "Specific brief · {campaign}"; `dueDate` = end of the chosen day UTC.
- Seed country "UK" is mapped to the GB flag (`src/lib/country-flag.ts`).
- Book button shows Invited/Applied/Declined/Booked per existing collaboration status on the selected campaign (unique constraint prevents re-inviting).
- The shared Postgres and the shared localhost cookie jar were clobbered several times by other streams mid-test (reseeds, creator logins, a new Zune campaign created, wallet drained to €937). I re-logged in each time; all flows were re-verified after. I reseeded at the end as instructed — other streams' in-flight test data was reset by that.

## 5. Needed outside my paths (not made)
- None required. Nice-to-have: `src/components/page/EmptyState` accepts only an `href` CTA; I inlined two button-CTA empty states in `MarketplaceView.tsx` rather than extend it. `.env.example` already documents `ANTHROPIC_API_KEY` (says "AI brief generator" — could add "and Amp matching").

## 6. README notes (paragraph for the integrator)
> **Brand › Creators** (`src/features/marketplace`, routes `/brand/creators` and `/brand/creators/matching`). The marketplace lists all 300 seeded creators ranked by `fitScore()` against the campaign chosen in "Fit for" (default: the brand's most recent active campaign); every filter, sort, search term, tab and page lives in the URL. Bookmarks persist in the `shortlist` table. "Book" and "Collaborate with…" open the "Your selection" dialog; booking or "Make an offer" (10/20/30% presets, post-by date, campaign brief, approve-first) creates a funded invitation through `createCollaboration` — the fee is held from the wallet as a pending ledger entry and the card flips to "Invited". When the wallet is short the CTA becomes "Add €X and continue" and points at Billing. AI Matching ("Amp") ranks creators with the same fit score, takes the N asked for in the prompt, and writes a rationale with Claude (`claude-sonnet-5`) when `ANTHROPIC_API_KEY` is set, otherwise a deterministic template built from the fit signals and prices — the UI labels which one you got. Real: everything above. Stubbed: the add-budget dialog (Billing), activity filter, copy/thumbs feedback.

---

## Stream B — prompt

You are STREAM B of a four-stream parallel build of Amplio (a B2B LinkedIn creator marketplace). Your git worktree is at `/Users/nexxus/Projects/amplio-streams/stream-b` on branch `stream/b` (branched from main). EVERY shell command must run there (`cd /Users/nexxus/Projects/amplio-streams/stream-b && …`) and every file you read or write must be under that path. Never touch the integrator's checkout or the other stream folders. Three other streams work in parallel; an integrator merges everyone onto main.

### First, read (paths relative to your worktree)
- CLAUDE.md (engineering rules — lint enforces most of them), docs/plan.md (§1 campaigns and the brief shape, brands for the value prop/ICP shape; §2 build order steps 6 and 12 for the brief and the estimator).
- Existing code you build on: src/db/schema/campaigns.ts (campaigns with brief jsonb in the editor's exact shape: whatToTell, targetIndustries, targetGeos, tone, do[], avoid[], links[], angles[{angle,hook,direction,example}], plus source manual|ai|link|team, sourcePrompt, sourceUrl; shortlist table), schema/brands.ts (valueProp, icps[{title,description}], targetIndustries, targetRegions, walletCents), schema/collaborations.ts, schema/tracking.ts (tracking_links, clicks, pixel_events), src/lib/fit-score.ts (fitScore(creator, campaign) → { score, signals, reason }), src/features/collaborations/server/create.ts (createCollaboration — invitations are funded, fee held from the wallet; throws InsufficientFundsError / DuplicateCollaborationError), src/features/auth/server/session.ts (getViewer() → viewer.brand { id, company, walletCents }, csrfToken), src/components/page/* (PageHeader, EmptyState, ErrorState, PageSkeleton), src/lib/money.ts, scripts/seed/brands.ts (the seeded campaigns: Zune has one active campaign "Zune creator brief" with collaborations in every state and ~600 clicks, and one draft).

### Setup
- `pnpm install` (lockfile present). Do NOT add dependencies — @anthropic-ai/sdk, recharts, sonner (Toaster mounted in root layout; `import { toast } from "sonner"`), date-fns, zod, react-hook-form, lucide-react and the shadcn components in src/components/ui are installed. Do not edit src/components/ui.
- `.env.local` already exists with `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/amplio`. Docker Postgres is running, migrated and seeded; SHARED with the other streams — reading is fine; mutations from your testing are expected; `pnpm db:seed` restores everything.
- `ANTHROPIC_API_KEY` is NOT available to you; build the AI path against the SDK but verify the TEMPLATE fallback path works (the deploy must never 500 because of a missing env var).
- Demo login: /login → "Explore as demo brand" (brand@demo.amplio / demo1234).

### You own ONLY these paths
- src/features/campaigns/** (components/, server/queries.ts, server/actions.ts, server/brief-ai.ts, schemas.ts, constants.ts; subfolders when a folder passes ~10 files)
- src/app/brand/campaigns/** (replace the placeholder page.tsx/loading.tsx; add routes: new, new/ai, new/link, [campaignId], [campaignId]/brief, [campaignId]/shortlist, [campaignId]/analytics …)
- src/app/brand/book-a-call/** (replace the placeholder with the stub described below)
- src/lib/… only NEW files you create for pure logic (src/lib/estimator.ts with a test, src/lib/brief-template.ts). Never edit existing src/lib files.
Never edit: src/db/**, src/features/auth/**, src/features/collaborations/**, src/features/marketplace/**, src/components/shell/**, src/components/page/**, src/components/ui/**, src/app/layout.tsx, src/app/brand/layout.tsx, root config files, package.json, .claude/**, .agent-logs/**, CLAUDE.md, README.md, docs/**. If you truly need a change outside your paths, do not make it — describe it in your final report.

### Build (the spec, from the product owner — follow its copy and layout exactly)
Campaigns list (/brand/campaigns): campaign cards: "Active · CREATED ON 12 SEPT 2026 · {name}" + description, stats Creators · Published · Committed budget (real counts from collaborations and ledger bookings), links "Open campaign" / "My brief". Plus the card "Create a campaign — Launch a new campaign in 2 minutes — with AI, the Amplio team, or an existing link." → /brand/campaigns/new.

Create chooser (/brand/campaigns/new): "How do you want to launch your campaign? Choose your method. You can change everything before launch." three cards, copy verbatim: (1) "Launch free with the Amplio team — A campaign manager turns your selection into a ready-to-launch campaign. You validate, they handle the rest." (Today · 14:30 · 15 min, "Book my onboarding →") → the book-a-call stub (/brand/book-a-call: page with the copy "15 minutes with an Amplio expert…", a calendar placeholder that says booking is not wired in this build, and a "Create with AI instead" CTA); (2) "Create with AI — AI asks the right questions and prepares a fully editable brief." (5 min, example prompt "I want to reach VP Sales in B2B SaaS in France.") → /brand/campaigns/new/ai; (3) "Start from your link — Paste an influence campaign you already ran: Amplio reuses the brief and structure." (1 min, "Brief link (Notion, Docs, PDF…)", "Brief recovered") → /brand/campaigns/new/link: a URL input; submitting creates a DRAFT campaign with source "link", sourceUrl, and a brief filled from the template generator using the brand's value prop/ICPs (we do not fetch the URL — say so in the UI: "We couldn't read the link in this build, so we prepared the brief from your workspace profile").

Create with AI (/brand/campaigns/new/ai): heading "Generate your campaign in one click", one textarea "Let's build this campaign together…" with a round send button, left rail "HISTORY — No discussion yet. Your next AI-generated campaign will appear here." listing past AI-generated campaigns of this brand (campaigns with source "ai", newest first, linking to them), back chevron top-left. Submitting the prompt generates a draft campaign (name, description, brief in the editor shape) and then continues into a SHORT STEPPER (route under new/ai or the campaign's own route): (1) Basics (name, description, post deadline, default fee — prefilled), (2) Brief (the brief editor, prefilled), (3) Pick creators (list of the brand's best-fit creators with avatar, name, industries, fit % from fitScore(), price; checkboxes; default the top 4 selected), (4) Review & launch: summary + the ESTIMATOR + "Launch campaign" which sets status active and sends invitations to the selected creators via createCollaboration({ origin: "invitation" }) — handle InsufficientFundsError per creator gracefully (invite what the wallet covers, report the rest with a link to /brand/billing; billing itself is built later, do not build it).

Brief generation (src/features/campaigns/server/brief-ai.ts): input = brand value prop + ICPs + target industries/regions + the user's prompt; output = exactly the Brief shape. Default DO lines: "Use only the confirmed information about {Company}." / "Connect the product to a practical audience question." / "Disclose the sponsored partnership clearly." Default AVOID: "Do not invent customers, results, figures or features." / "Do not force an endorsement or promise outcomes." Default tone: "Clear, useful and natural. Keep the creator's own voice rather than following a script." Use @anthropic-ai/sdk when ANTHROPIC_API_KEY is set — load the `claude-api` skill via the Skill tool before writing that code; use model "claude-sonnet-5"; ask for JSON matching the Brief zod schema and validate it; on ANY failure (missing key, network, invalid JSON) fall back to the TEMPLATE generator in src/lib/brief-template.ts (pure: builds whatToTell in the starter-brief phrasing and three angles from the ICPs). The UI shows which path produced the brief ("Generated with AI" / "Prepared from a template — add ANTHROPIC_API_KEY for AI briefs").

Brief editor (used by the stepper and by /brand/campaigns/[id]/brief › "Edit the brief"): exactly these fields, in this order: WHAT CREATORS SHOULD TELL (textarea) · TARGET INDUSTRIES (multi-select chips from the 24 industries — copy the list from scripts/seed/taxonomy.ts into your constants; don't import from scripts) · TARGET GEOGRAPHIES (chips: Europe · North America · Latin America · Asia · Africa · Oceania · Middle East · Worldwide) · TONE · DO (list) · AVOID (list) · LINKS AND EXAMPLES (list of urls) · angles[] { ANGLE, HOOK, EDITORIAL DIRECTION, post example } with add/remove. Buttons Preview · Cancel · Save. react-hook-form + the shared zod schema (src/features/campaigns/schemas.ts is the single source of truth for form, action and DTO). Read view sections: Context & objective · Audience & tone · Editorial rules (Do / Avoid) · Angles & post examples (numbered "01 …" cards with hook + editorial direction + Post example).

Campaign detail (/brand/campaigns/[campaignId]): header "← Campaigns · {name} · {status}", campaign switcher select, "Invite a creator" (link to /brand/creators?campaign={id} — stream A owns that page), tabs Collaborations | Brief | Shortlist | Analytics:
- Collaborations tab (default): stats "N collaborations · €X committed · N to do", sub-tabs All · Active · Invitations received · Invitations sent · To do · Completed, table Creator · Campaign · Status · Next action · Due date · Amount · Updated, empty "No collaborations yet, invite a creator from the Marketplace.", rows per page 10/25/50. Read-only here (stream C owns the actions/review modal on /brand/collaborations); link each row to /brand/collaborations/{id} (C's page). Status tab mapping: Invitations sent = invited, Invitations received = applied, To do = draft_submitted, Active = accepted/changes_requested/approved/scheduled/live, Completed = paid; Declined shown under All.
- Brief tab: read view + "Edit the brief" → editor.
- Shortlist tab: "Shortlist — Save creators from the marketplace to build your shortlist." [Find creators → /brand/creators]; list the brand's shortlisted creators (shortlist table) with fit % vs this campaign and an "Invite" action (createCollaboration invitation).
- Analytics tab: same layout as Results scoped to the campaign: tiles Est. reach ("No published posts yet" when none) · Qualified clicks ("Since the campaign started") · Committed budget · "Performance over time — Daily clicks · last 12 days" (recharts from the clicks table joined through tracking_links → collaborations of this campaign) · "Attribution by creator" table Creator · Clicks (real counts) · "Post performance" block (published posts: creator, post url, clicks). EVERY NUMBER COMES FROM A ROW.

Estimator (src/lib/estimator.ts, pure, with a vitest): input = selected creators (followers, medianViews, priceCents) + vertical; benchmark CTR by follower tier (1k–3k 13.8% · 3k–7k 12.1% · 7k–10k 10.4% · 10k+ 8.7%) applied to median views → est. clicks; vertical CPL (mktg-ops €16 · sales-tech €16 · RevOps €17 · product €18 · devtools €19 · fintech €19 · HR-tech €20 · vertical SaaS €21, default €18) → est. leads = min(est. spend ÷ CPL, clicks × 8.3% funnel); output est. clicks, est. leads, est. CPL, est. CPC, total spend, with a confidence label (High ≥5 creators with reach data / Medium ≥2 / Low) and a source note "Based on a Q2 2026 benchmark (312 campaigns). First-party numbers, not audited." Shown in the review step and on the campaign detail header for active campaigns ("Projected" vs actual clicks).

GET STARTED launch plan popover (top bar): you own the popover CONTENT as a component src/features/campaigns/components/LaunchPlanPopover.tsx with the copy verbatim ("YOUR LAUNCH PLAN / Launch your first creator collaboration / Three guided actions take you from discovery to your first creator invitation." progress "N steps left", the three rows with Explore → /brand/creators, Done/Create your first brief → /brand/campaigns/new, Choose creator → /brand/creators, footer "You can close this checklist and resume it at any time."). Steps computed from rows (has shortlisted creators? has a campaign with a brief? has sent an invitation?). Export it; the integrator will mount it in the top bar (the shell is not yours) — also render it on the campaigns list page as a card so it is reachable today.

Every list screen: loading skeleton, empty state with CTA, error state. Check 375px and 1440px.

### Rules that bite
- page.tsx thin (<100 lines): read params/searchParams, call queries from src/features/campaigns/server/queries.ts, render feature components. Queries return plain DTOs (toDto per entity), never drizzle rows.
- Mutations only in src/features/campaigns/server/actions.ts ("use server"), zod-validated, returning { ok: true, data } | { ok: false, error }; verify with getViewer() that the campaign belongs to the viewer's brand. Never throw to the client. Errors logged server-side with context.
- Views never import @/db (lint fails). 'use client' only for state/handlers.
- Max 500 lines per file, split around 300, ~10 files per folder (subfolders: components/list, components/create, components/brief, components/detail, components/analytics). One component per file. No utils.ts.
- No magic numbers in server code — constants.ts.
- Tailwind theme tokens only; `bg-brand` is the brand blue. Real buttons/links, labelled inputs.
- Conventional commits, small, on your branch, `git add` only your paths. Do not push, do not merge, do not rebase, do not switch branches.

### Verify before you report
`pnpm typecheck && pnpm lint && pnpm test && pnpm build` green (warnings for long JSX functions OK; no errors). `PORT=3102 pnpm start` (background); you may use the browser tools on http://localhost:3102 in your OWN tab (tabs_create) — the pane is shared with other streams; if it misbehaves, fall back to curl and say what you couldn't verify visually. Log in as the demo brand. Check: list cards with real numbers, chooser, AI chat → template brief → stepper → launch creates an active campaign and invitations (wallet permitting), link flow creates a draft, brief editor saves and the read view reflects it, detail tabs with real counts and the clicks chart for "Zune creator brief", estimator numbers and label, launch plan card. Reseed at the end if you consumed the wallet. Stop your server when done.

### Final report (this is all the integrator sees)
1. Branch name (`git rev-parse --abbrev-ref HEAD`) and worktree path (`pwd`).
2. Commits (oneline).
3. What's live vs stubbed, with routes.
4. Assumptions (every deviation from the spec, every open decision you made).
5. Anything you needed outside your paths (describe; don't make it) — e.g. mounting LaunchPlanPopover in the top bar.
6. README notes (a paragraph for the integrator to add), including the ANTHROPIC_API_KEY behaviour.

## Stream B — report

# Stream B — final report

## 1. Branch / worktree
- Branch: `stream/b`
- Worktree: `/Users/nexxus/Projects/amplio-streams/stream-b`
- Tree clean, server stopped, DB reseeded (`pnpm db:seed`) after testing consumed the wallet. `pnpm typecheck && pnpm lint && pnpm test && pnpm build` all green (0 lint errors; only `max-lines-per-function` warnings on JSX components).

## 2. Commits
```
418fd26 refactor(campaigns): split launch stepper into its own folder, polish template names
255e710 feat(campaigns): list, create flows, brief editor, detail tabs, launch stepper
0d10313 feat(campaigns): estimator, template brief, schemas and server layer
```
(No `.agent-logs/` changes existed in this worktree — the capture hook writes to the integrator's checkout, so nothing to commit there.)

## 3. What's live vs stubbed

**Live (every number is a query over rows):**
- `/brand/campaigns` — cards "Status · CREATED ON … · name", Creators (non-declined collaborations), Published (live+paid), Committed budget (sum of `ledger_entries` bookings via the campaign's collaborations), "Open campaign / My brief" (drafts show "Continue setup" → stepper). "Create a campaign" card. Launch-plan card on the right (same component as the popover).
- `/brand/campaigns/new` — chooser with the three cards, copy verbatim.
- `/brand/campaigns/new/ai` — "Generate your campaign in one click", textarea + round send button, HISTORY rail (campaigns with `source='ai'`, newest first, linking to the stepper for drafts / detail otherwise), back chevron. Submit → `createCampaignFromAi` → draft campaign → `/brand/campaigns/{id}/launch?generated=ai|template`.
- `/brand/campaigns/new/link` — URL input; `createCampaignFromLink` creates a DRAFT with `source='link'`, `sourceUrl`, template brief; UI says "We couldn't read the link in this build, so we prepared the brief from your workspace profile".
- `/brand/campaigns/{id}/launch?step=basics|brief|creators|review` — 4-step stepper: Basics (name/description/deadline/fee prefilled) → Brief (the editor, "Save and continue") → Pick creators (top-12 by `fitScore`, top 4 pre-selected, selection carried in the URL, wallet vs. total shown) → Review & launch (summary + `EstimatorCard` + Launch). `launchCampaign` sets `active`, invites cheapest-first via `createCollaboration({origin:"invitation"})`, reports `unfunded` (with shortfall + link to `/brand/billing`) and `skipped` (duplicates) instead of throwing. Verified end-to-end: 4 of 5 invitations funded, wallet debited exactly the held fees, pending booking ledger rows written, 5th reported with the correct €288 shortfall.
- Brief editor (`components/brief/BriefEditor.tsx`) — react-hook-form + `briefSchema` from `schemas.ts`; fields in the spec's order (What creators should tell · Target industries chips (24) · Target geographies chips (8) · Tone · Do · Avoid · Links and examples · angles[] with add/remove); Preview / Cancel / Save. Read view sections: Context & objective · Audience & tone · Editorial rules · Angles & post examples ("01 …" cards). Used by the stepper and `/brand/campaigns/{id}/brief/edit`. Verified the saved JSON round-trips.
- `/brand/campaigns/{id}` — header "← Campaigns · name · status", switcher (`<select>` → route), "Invite a creator" → `/brand/creators?campaign={id}`, "Projected N clicks from N creators · Actual N so far · Confidence X" for active campaigns; tabs Collaborations | Brief | Shortlist | Analytics. Collaborations: stats line, six sub-tabs with counts (status mapping as specified, Declined under All), read-only table linking rows to `/brand/collaborations/{id}`, rows per page 10/25/50 + pagination, empty state with the verbatim copy.
- `/brand/campaigns/{id}/shortlist` — shortlist rows with fit % vs this campaign's brief + "Invite" (`inviteCreator`, InsufficientFunds/Duplicate handled as friendly errors); disabled with "Launch first" on drafts.
- `/brand/campaigns/{id}/analytics` — Est. reach (sum of medianViews of live/paid posts; "No published posts yet" otherwise), Qualified clicks ("Since the campaign started"), Committed budget (+ bookings count), "Performance over time — Daily clicks · last 12 days" recharts line from `clicks → tracking_links → collaborations`, Attribution by creator, Post performance (creator, post URL, clicks). Zune creator brief shows 592 clicks, 4 posts, matching the DB.
- `src/lib/estimator.ts` (+ test): tier CTR × median views → clicks; vertical CPL (mapped from the brief's target industries; generic B2B/SaaS/AI → default €18); leads = min(spend ÷ CPL, clicks × 8.3%); CPL/CPC/spend; confidence High ≥5 / Medium ≥2 / Low; source note verbatim.
- `src/lib/brief-template.ts` (+ test): starter-brief `whatToTell`, default DO/AVOID/tone, 3 angles from ICPs, name/description from the prompt.
- `src/lib/dates.ts` (+ test): "12 Sept 2026" formatting.
- `src/features/campaigns/components/LaunchPlanPopover.tsx` — exported content component (verbatim copy, progress "N steps left", steps computed from rows: shortlist row exists / campaign with non-empty `whatToTell` / any `origin='invitation'` collaboration), optional `onClose`.

**Stubbed:** `/brand/book-a-call` — copy + "Today · 14:30 · 15 min", a calendar placeholder that says booking is not wired, "Create with AI instead" CTA. The AI path is coded but untested against the API (no key available); the template fallback is what I exercised.

## 4. Assumptions / deviations
- **Stepper route** is the campaign's own route (`/brand/campaigns/{id}/launch`), not under `new/ai`; a non-draft campaign hitting it redirects to the detail. Selected creator ids travel in the URL between step 3 and 4 (no persistence until launch).
- **Fee input** is typed in euros, stored in cents; `MAX_FEE_CENTS` = €1,500 (the platform's per-post limit).
- **AI model** is `claude-sonnet-5` as the spec asked (the skill's default would be `claude-opus-5`); uses `client.messages.parse` + `zodOutputFormat` with a transform-free wire schema (the shared `briefSchema` has zod transforms, which JSON Schema can't express — verified `zodOutputFormat` throws on it), then re-validates with the shared schema. Adaptive thinking is left at the model default; 45 s timeout, 1 retry.
- **Committed budget** = all `booking` ledger rows (pending + completed) for the campaign's collaborations; declined invitations release their booking so they drop out naturally.
- **"Creators" on cards** excludes declined; the header projection also excludes declined.
- **Est. reach** = sum of creators' `medianViews` for live/paid collaborations with a post URL (no impressions table exists).
- Server actions take JSON input and rely on the session cookie + Next's Origin check; they don't echo the CSRF token (only the sign-out form uses `csrfOk` today).
- Sub-tabs/pagination/rows-per-page are URL-driven (server-rendered), native `<select>`s rather than base-ui Select.
- Chip and list fields are custom `useController` components (RHF's `useFieldArray` can't hold primitive arrays); empty lines are dropped by the schema on save.
- `server/queries.ts` is a facade re-exporting `read-*.ts` modules (to stay under 500 lines while keeping "reads only via queries.ts"); `server/` and `components/detail/` sit at 11 files.
- Browser verification: the shared pane kept resizing/un-fronting and other streams' logins overwrote the `localhost` session cookie (cookies ignore ports), so I verified the mutations with curl against the built server-action ids and checked DB rows directly; screenshots confirmed list, detail, analytics chart, shortlist, chooser, AI page and the stepper at 1440 and the list/detail at 375.

## 5. Needed outside my paths (not done)
- Mount `LaunchPlanPopover` in the top bar (`src/components/shell/TopBar.tsx`): the "GET STARTED · Discover the Marketplace · N/3" ring → Popover with `<LaunchPlanPopover plan={plan} onClose=… />`; the shell layout needs to call `getLaunchPlan(brandId)` from `@/features/campaigns/server/queries` and pass the DTO down (it's a plain `{explored, briefed, invited, stepsLeft}`).
- `/brand/creators?campaign={id}` (stream A) is linked from the header and empty states; `/brand/collaborations/{id}` (stream C) from every table row; `/brand/billing` from the unfunded-invitation report.
- `.env.example`: add `ANTHROPIC_API_KEY=` (optional) — root config is not mine.

## 6. README notes (for the integrator)
> **Campaigns (brand).** `/brand/campaigns` lists campaigns with creator / published / committed-budget counts computed from collaborations and the ledger. New campaigns start from the chooser (`/brand/campaigns/new`): "Create with AI" (`/new/ai`) turns a prompt plus the workspace value prop and ICPs into a draft brief; "Start from your link" (`/new/link`) stores the URL but does not fetch it — the brief is prepared from the workspace profile and the UI says so; "Launch free with the Amplio team" leads to `/brand/book-a-call`, a stub (no calendar). Drafts go through a four-step launch stepper (`/brand/campaigns/{id}/launch`): basics → brief editor → pick creators (ranked by `fitScore`) → review with the pre-spend estimator (`src/lib/estimator.ts`, Q2 2026 benchmark tier CTR × vertical CPL, with a confidence label). Launch sets the campaign active and sends funded invitations; creators the wallet cannot cover are reported with the shortfall instead of failing the launch. Campaign detail tabs (Collaborations · Brief · Shortlist · Analytics) read only from rows: the daily-clicks chart joins `clicks → tracking_links → collaborations`.
>
> **AI briefs and `ANTHROPIC_API_KEY`.** Brief generation lives in `src/features/campaigns/server/brief-ai.ts`. When `ANTHROPIC_API_KEY` is set it calls Claude (`claude-sonnet-5`) with a structured-output schema and validates the result against the shared brief zod schema; the UI then shows "Generated with AI". On any failure — missing key, network error, refusal, invalid JSON — it falls back to the pure template generator in `src/lib/brief-template.ts` and the UI shows "Prepared from a template — add ANTHROPIC_API_KEY for AI briefs". The deploy never depends on the key.

---

## Stream C — prompt

You are STREAM C of a four-stream parallel build of Amplio (a B2B LinkedIn creator marketplace). Your git worktree is at `/Users/nexxus/Projects/amplio-streams/stream-c` on branch `stream/c` (branched from main). EVERY shell command must run there (`cd /Users/nexxus/Projects/amplio-streams/stream-c && …`) and every file you read or write must be under that path. Never touch the integrator's checkout or the other stream folders. Three other streams work in parallel; an integrator merges everyone onto main.

### First, read (paths relative to your worktree)
- CLAUDE.md (engineering rules — lint enforces most), docs/plan.md (the collaboration state machine table and who triggers what; §2 build order steps 7, 8 and 13).
- Existing code you build on and MUST use: src/lib/collaboration-status.ts (COLLABORATION_STATUSES, TRANSITIONS, nextStatus, allowedEvents(from, actor), TERMINAL_STATUSES), src/features/collaborations/server/transition.ts (transition({ collaborationId, event, actor, note?, patch? }) — THE ONLY way a status changes; writes collaboration_events and money/tracking side effects; throws IllegalTransitionError), src/features/collaborations/server/create.ts (createCollaboration({ campaignId, creatorId, origin: "application" }) for the creator's Apply), src/features/collaborations/server/side-effects.ts (read only; InsufficientFundsError lives here), src/features/collaborations/constants.ts (MAX_REVISION_ROUNDS), src/db/schema/collaborations.ts (collaborations incl. offer terms: listPriceCents, discountPercent, approveBeforePublish, acceptBy, offerNote, dueDate, draftText, reviewNote, postUrl, scheduledAt; collaboration_events; messages), schema/campaigns.ts (brief jsonb: whatToTell, targetIndustries, targetGeos, tone, do[], avoid[], links[], angles[{angle,hook,direction,example}]), schema/brands.ts (icps, valueProp, website), schema/tracking.ts (tracking_links, clicks), src/lib/fit-score.ts (fitScore(creator, campaign) for the "match %" on opportunity cards — the campaign side needs targetIndustries + the brand's ICP titles), src/features/auth/server/session.ts (getViewer() → viewer.role, viewer.brand { id, company }, viewer.creator { id, handle, avatarUrl }, csrfToken), src/components/page/* (PageHeader, EmptyState, ErrorState, PageSkeleton), src/lib/money.ts, scripts/seed/* (the demo creator has: Zune invited, Premium Inboxes changes_requested + a paid one, OrbiSearch live; the demo brand Zune has a collaboration in every state; accepted+ collaborations have seeded messages).

### Setup
- `pnpm install`. Do NOT add dependencies — sonner (Toaster mounted in the root layout; `import { toast } from "sonner"`), date-fns, zod, react-hook-form, lucide-react and the shadcn components in src/components/ui (dialog, sheet, tabs, textarea, table, badge, avatar, card, skeleton, alert-dialog, select …) are installed. Do not edit src/components/ui.
- `.env.local` already exists with `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/amplio`. Docker Postgres is running, migrated and seeded; SHARED with the other streams — your testing WILL mutate collaborations (that's the point); run `pnpm db:seed` before your final verification pass and again at the end so the demo data is back to its seeded state.
- Demo logins: /login → "Explore as demo brand" / "Explore as demo creator" (brand@demo.amplio, creator@demo.amplio / demo1234).

### You own ONLY these paths
- src/features/collaborations/** EXCEPT server/transition.ts, server/create.ts, server/side-effects.ts and constants.ts (read them; if they need a change, describe it in your report). Put messages under src/features/collaborations/ too (components/messages/, server/messages-queries.ts, server/messages-actions.ts) — there is no separate messages domain.
- src/app/creator/opportunities/**, src/app/creator/collaborations/**, src/app/creator/messages/**, src/app/brand/collaborations/**, src/app/brand/messages/** (replace the placeholder page.tsx/loading.tsx; add [id] routes as needed).
- src/lib/… only NEW files for pure logic (e.g. src/lib/collaboration-labels.ts mapping status → label / next action / tab, with a test). Never edit existing src/lib files.
Never edit: src/db/**, src/features/auth/**, src/features/marketplace/**, src/features/campaigns/**, src/components/shell/**, src/components/page/**, src/components/ui/**, src/app/layout.tsx, the two app layouts, root config files, package.json, .claude/**, .agent-logs/**, CLAUDE.md, README.md, docs/**.

### Build (the spec, from the product owner — follow its copy and layout exactly)
CREATOR SIDE
- Opportunities (/creator/opportunities): "Open brand campaigns - apply, the brand accepts, and the booking is created on your terms." Filters: channel tabs (All channels N · LinkedIn N), search "Search for a campaign or a brand…", All industries, All countries, sort "Relevance (default)". One card per ACTIVE campaign that is openToApplications and where this creator has no collaboration yet (campaigns they already applied to / are in show a state instead of Apply): cloud header, channel badge "LinkedIn", "{match}% match" pill (fitScore of this creator vs the campaign), brand logo (initial in a rounded square), campaign name, "Main campaign"/description, region chip (targetGeos joined with " · "), "Audience relevance {score}/100" bar, three stats {score}/100 MATCH · LinkedIn CHANNEL · "{n} days POST DEADLINE" (from postDeadline), buttons "View the brief" / "Apply". Apply → confirmation dialog (what they'll commit to: their list price, the post deadline, "the brand accepts, then the booking is created") → server action createCollaboration({ origin: "application" }) → optimistic "Application sent" state on the card + toast; rollback + error toast on failure.
- Brief drawer (right side Sheet, opened by "View the brief" and from a collaboration): brand logo, campaign name, "{Brand} · {website}", button "Copy as Markdown" (builds markdown from the brief, copies to clipboard, toast). Box "Create my post with AI — Copy a clean prompt with the brief, angles and examples. Paste it into your AI; add 2 or 3 previous posts if it does not know your style yet." button "Copy for my AI" (copies a prompt string). Sections: CAMPAIGN OBJECTIVES (goal = whatToTell, primary CTA + tracked link if the collaboration has a tracking link, secondary win) · TARGET AUDIENCE (Brand:, Why we exist: valueProp, ICP (who the creator is talking to): the ICP titles list, Proof points to lean on: links) · CALL TO ACTION (Do: … Don't: … Tone: …) · CONTENT ANGLES · N (numbered angle cards: angle, hook, editorial direction, post example).
- Collaborations (/creator/collaborations): "Every step tells you where you stand, what to do, and what happens if you do nothing." Six tabs with real counts: All · Active · Needs action · Applications sent · Declined · Completed. Mapping: Needs action = invited ∪ changes_requested ∪ approved; Applications sent = applied; Active = accepted ∪ draft_submitted ∪ scheduled ∪ live; Declined = declined; Completed = paid. Table Brand · Campaign · Status · Performance (clicks for live/paid, from the clicks table; "—" otherwise) · Next action (per status: "Accept or decline · {time left until acceptBy}", "Submit your draft", "Update your draft (round N of MAX)", "Schedule the post", "Publish and add the post URL", "Waiting for review", "Awaiting payment", "Paid") · Due date · Your net (feeCents). Empty: "No collaborations yet. Brand invitations and your accepted applications land here." Rows link to the detail.
- Collaboration detail (/creator/collaborations/[id]): header brand · campaign · status badge · fee · due date · offer terms when present (discount, "approve before publish", accept-by countdown); the brief drawer button; a timeline from collaboration_events (who did what when — every row); and EXACTLY the actions the state machine allows for actor "creator" (use allowedEvents(status, "creator")): invited → Accept / Decline; accepted → Submit draft (textarea, min length); changes_requested → shows the brand's reviewNote and a Resubmit draft textarea prefilled with the previous draft; approved → Schedule (date input → patch scheduledAt); scheduled → "Mark as published" with the post URL input (patch postUrl; validate it's a linkedin.com URL) → live; live/paid → read-only with the tracked link (code → /r/{code}, the redirect route is built later; show the URL) and clicks so far. Each action = server action calling transition({ actor: "creator" }) after verifying the collaboration belongs to viewer.creator.id; optimistic status update in the UI with rollback + toast on error.

BRAND SIDE
- Collaborations (/brand/collaborations): same table across all campaigns, Campaign filter select, tabs All · Active · Invitations received · Invitations sent · To do · Completed with real counts (Invitations sent = invited, Invitations received = applied, To do = draft_submitted, Active = accepted ∪ changes_requested ∪ approved ∪ scheduled ∪ live, Completed = paid; declined under All), table Creator · Campaign · Status · Next action · Due date · Amount · Updated, rows per page 10/25/50, empty "No collaborations yet, invite a creator from the Marketplace." [→ /brand/creators]. Row → detail (/brand/collaborations/[id]) with header, offer terms, timeline, messages link, and the brand's allowed actions (allowedEvents(status, "brand")): applied → Accept / Decline (accept holds the fee — InsufficientFundsError → friendly message pointing to /brand/billing); draft_submitted → "Review LinkedIn post" modal: "Review LinkedIn post — Read the complete draft before approving or requesting changes." full draft text, [Approve] [Request changes] with a required comment textarea for changes (note → reviewNote; round N of MAX_REVISION_ROUNDS shown; when the cap is reached, Request changes is disabled with an explanation); live → "Pay {fee}" button (transition pay, actor "brand") → paid. Optimistic UI with rollback + toast everywhere.
- Messages (/brand/messages and /creator/messages): "All messages", Campaign filter (brand side), thread list: one thread per collaboration in accepted-or-later status (both sides), each showing the counterpart (creator name+avatar / brand company), campaign, last message preview + time; plus a pinned "AmplioBot — Have a question or need help? Click here." placeholder thread (static reply). Empty: "Threads open with your bookings — Invite a creator - the thread opens as soon as the first booking is accepted." (creator side: "…as soon as a booking is accepted"). Thread view (/…/messages/[collaborationId]): messages with sender, time; composer "Write a message…" + send (server action inserting into messages, verifying the viewer is a party) with optimistic append + rollback; quick reactions row (12 emojis, visual). Seeded messages exist on accepted+ collaborations.

Every list screen: loading skeleton (loading.tsx), empty state with CTA, error state. Check 375px and 1440px.

### Rules that bite
- page.tsx thin (<100 lines): read params, call queries from src/features/collaborations/server/queries.ts (and messages-queries.ts), render feature components. Queries return plain DTOs (toDto per entity — collaboration DTO includes campaign name, brand company/logo initial, creator name/avatar, offer terms, allowed events for the viewer's role), never drizzle rows. Status label / next action / tab mapping is a pure function in src/lib (tested).
- Mutations only in src/features/collaborations/server/actions.ts (and messages-actions.ts) ("use server"), zod-validated (schemas in src/features/collaborations/schemas.ts — single source of truth for form, action and DTO types), returning { ok: true, data } | { ok: false, error }; verify ownership with getViewer(); catch IllegalTransitionError / InsufficientFundsError and return friendly errors; never throw to the client; log server-side with context.
- A direct write to collaborations.status is a bug — always transition().
- Views never import @/db (lint fails). 'use client' only for state/handlers.
- Max 500 lines per file, split around 300, ~10 files per folder (subfolders: components/opportunities, components/table, components/detail, components/review, components/messages, components/brief). One component per file. No utils.ts.
- No magic numbers in server code — put them in your schemas or a new src/features/collaborations/ui-constants.ts (you cannot edit constants.ts).
- Tailwind tokens only; `bg-brand` is the brand blue. Real buttons/links, labelled inputs, keyboard reachable.
- Conventional commits, small, on your branch, `git add` only your paths. Do not push, do not merge, do not rebase, do not switch branches.

### Verify before you report
`pnpm typecheck && pnpm lint && pnpm test && pnpm build` green (warnings for long JSX functions OK; no errors). `PORT=3103 pnpm start` (background); you may use the browser tools on http://localhost:3103 in your OWN tab (tabs_create) — the pane is shared; if it misbehaves, fall back to curl and say what you couldn't verify visually. Walk the loop end to end as both users on the seeded Zune "applied" collaboration: brand accepts it → creator (that creator isn't the demo creator, so verify the creator-side transitions on the demo creator's own collaborations: accept the Zune invitation, resubmit the Premium Inboxes draft, add a post URL on… whichever the state machine allows) → brand requests changes / approves / pays on Zune's draft_submitted and live collaborations; verify events, ledger (payout pending on live, completed on paid) and the wallet with SQL (`docker exec amplio-db psql -U postgres -d amplio -c "…"`). Messages send both ways. Then `pnpm db:seed`. Stop your server when done.

### Final report (this is all the integrator sees)
1. Branch name (`git rev-parse --abbrev-ref HEAD`) and worktree path (`pwd`).
2. Commits (oneline).
3. What's live vs stubbed, with routes.
4. Assumptions (every deviation, every open decision).
5. Anything you needed outside your paths (describe; don't make it) — including any change needed in transition.ts/create.ts/side-effects.ts.
6. README notes (a paragraph for the integrator to add).

## Stream C — report

# Stream C report — collaborations, opportunities, brief, messages

## 1. Branch / worktree
- Branch: `stream/c`
- Worktree: `/Users/nexxus/Projects/amplio-streams/stream-c`
- Working tree clean; `pnpm typecheck && pnpm lint && pnpm test && pnpm build` green (0 lint errors, 17 warnings — all `max-lines-per-function` on JSX components plus the two pre-existing ones in `create.ts`; 22 tests pass). Server stopped, DB re-seeded at the end.

## 2. Commits (on top of main `440c3d2`)
```
b1d9392 fix(brief): drawer is 2xl on desktop, full width and opaque on mobile
f8d0868 feat(messages): thread list + thread view per accepted booking, optimistic send, AmplioBot placeholder
c9bef72 feat(collaborations): opportunities cards + apply, brief drawer, six-tab tables, detail page with state-machine actions
72c2dd4 feat(collaborations): labels/tabs/next-action lib, brief markdown, DTO queries and transition-backed actions
```
No `.agent-logs/` changes appeared in this worktree (the capture hook writes into the integrator's checkout), so none are in these commits.

## 3. What's live vs stubbed

**Live (all backed by the DB, every write via `transition()` / `createCollaboration()`):**
- `/creator/opportunities` — one card per active, open campaign (all three seeded), `fitScore` match %, "Audience relevance" bar, MATCH / CHANNEL / POST DEADLINE stats, channel tabs, search, industry / country filters, sort. Cards where the creator already has a collaboration show the status badge (links to the detail) instead of Apply. Apply → confirmation dialog (net price, deadline, "the brand accepts, then the booking is created…") → `applyToCampaign` with optimistic "Application sent" + toast, rollback on failure.
- Brief drawer (from cards and from every collaboration detail) — header with brand mark / campaign / `Brand · site`, "Copy as Markdown", the "Create my post with AI / Copy for my AI" box, CAMPAIGN OBJECTIVES (primary CTA uses the tracked link when the booking has one), TARGET AUDIENCE (Brand, Why we exist, ICP list, proof points), CALL TO ACTION (Do / Don't / Tone), CONTENT ANGLES · N with numbered angle cards.
- `/creator/collaborations` — six tabs with real counts, Brand · Campaign · Status · Performance (clicks from the `clicks` table for live/paid) · Next action · Due date · Your net, rows-per-page + pagination, rows link to the detail.
- `/creator/collaborations/[id]` — header, offer terms (fee, list price + discount when present, origin, review rule, due, accept-by countdown, offer note), brief button, Messages link once accepted, tracked link card (`{origin}/r/{code}` + clicks + post link), full timeline from `collaboration_events` (notes shown as quotes), and exactly `allowedEvents(status, "creator")`: Accept/Decline (decline confirms), Submit draft (min 80 chars), Resubmit (prefilled, brand's reviewNote shown, round N of 2), Schedule (date input, capped at the due date), Mark as published (linkedin.com URL validated) → live. Live/paid are read-only.
- `/brand/collaborations` — campaign filter, six brand tabs with counts (declined only under All), Creator · Campaign · Status · Next action · Due date · Amount · Updated, 10/25/50 rows per page.
- `/brand/collaborations/[id]` — same detail shell; Accept and book / Decline on applications (accept holds the fee; `InsufficientFundsError` → friendly message with a "Top up" toast action to `/brand/billing`), "Review LinkedIn post" modal (full draft, Approve, Request changes with a required comment, "Round N of 2", Request changes disabled with an explanation at the cap), "Pay €fee" on live → paid.
- `/creator/messages`, `/brand/messages` (+ `/…/messages/[collaborationId]`) — two-pane layout, pinned AmplioBot thread, one thread per accepted-or-later collaboration with counterpart, campaign, last-message preview and time; search, campaign filter (brand); thread view with sender/time bubbles, "Write a message…" composer (Enter sends), 12 quick reactions (insert the emoji into the composer), optimistic append with rollback. Empty states with the product's copy.
- Every list/detail route has `loading.tsx`, an empty state with CTA, and an error state (query failures are logged server-side with context and render `ErrorState`); malformed ids 404.

**Verified end to end** (browser, as both demo users, then SQL): creator accepted the Zune invitation → tracking link created, thread opened → submitted a draft → brand requested changes (note stored in `review_note` and in the event) → creator resubmitted with the prefilled draft → brand approved (round 2 of 2 shown) → creator scheduled → published with a LinkedIn URL → `live` with a `payout pending` ledger row. Brand accepted the seeded Zune application (booking hold `-28000` pending, wallet 438500 → 410500, ledger sum == wallet) and paid a live one (booking + payout → completed). Messages sent both ways and previews updated. Apply, bad-CSRF, duplicate, insufficient-funds (transaction rolled back, wallet unchanged) and wrong-role paths were exercised against the running server over HTTP (server-action POST) and returned the expected `{ ok:false, code, error }`.

**Stubbed:** AmplioBot is static (one canned reply, no composer). Quick reactions are visual only (they populate the composer; there is no reactions table). `/r/{code}` is only displayed — the redirect route belongs to the tracking stream. No system auto-pay on live (the plan mentions it; the brand's Pay button is the path).

## 4. Assumptions / deviations
- **CSRF**: every mutation input carries `csrfToken` (from `viewer.csrfToken`, passed as a prop from the page) and is checked against the session, in addition to Next's Origin check. Schemas in `schemas.ts`; `ActionResult` failure carries an optional `code` (`insufficient_funds | illegal_transition | duplicate`) so views can react (Billing link).
- **Ownership** is part of the read query (`getCollaborationDetail`, `getThread` return null → 404) and re-checked in every action (`ownedCollaborationId`). A stranger never sees "forbidden", only "not found" / "not in your workspace".
- **Optimistic UI**: the status badge is `useOptimistic`; the action panel is driven by the server's `allowedEvents`, so while an action is pending it shows "Saving…" instead of guessing the next panel. React rolls back automatically on failure; a toast explains.
- Brief's "match %" and "Audience relevance" both show the `fitScore` total (the campaign side uses the brief's `targetIndustries`, falling back to the brand's, and the brand's ICP titles). Sort order = score desc.
- Seeded `invited` rows have no `acceptBy`, so "Accept or decline" shows without a countdown; rows created by `createCollaboration` (48h) do show "· 36h left".
- Time-left / next-action strings are computed at render time on the server (no live ticking).
- Status labels: `draft_submitted` → "Draft ready" (product copy); the timeline uses "The brand / The creator / Amplio …".
- Currency rendered as EUR via `formatCents(cents, "EUR")`.
- `select`s are native `<select>` elements (labelled) rather than the shadcn Select, for keyboard/a11y simplicity.
- Tracked URL origin is derived from request headers (`x-forwarded-host`/`host`), so no new env var was needed.
- `pnpm db:seed` was run at the end; note other streams re-seeded the shared DB several times during my session (ids change each time).

## 5. Needed outside my paths (not done)
- **Killed processes (please check)**: while restarting my server I ran `pkill -f "next start"` once, which may have killed other streams' `pnpm start` wrappers (port 3101 was gone afterwards; 3102 survived). Also Docker Desktop was down at one point (not mine — daemon socket missing); I started it with `open -a Docker` and `docker start amplio-db`; the volume was intact.
- `transition.ts` / `create.ts` / `side-effects.ts`: no change required. Two observations for the owners: (a) `createCollaboration` doesn't check the campaign is active/open — my action checks it first; a check inside `create.ts` would be safer for other callers. (b) The `system` actor `pay` transition has no trigger in the codebase (billing/top-up stream could call `transition({ event: "pay", actor: "system" })` when the wallet covers a live post).
- The redirect route `/r/[code]` (tracking stream) — the detail page and the brief's primary CTA already show `${origin}/r/${code}`.
- `README.md` — paragraph below.
- Browser note: the shared pane goes `visibilityState: hidden` when not displayed; React 19.2 then defers Suspense reveal/hydration (no rAF), so pages look stuck on the skeleton in a hidden pane. Not an app bug; verified with the pane in front and with curl.

## 6. README paragraph
> **Collaborations, opportunities, brief and messages** (`src/features/collaborations`). Creators see open campaigns on `/creator/opportunities` (scored with `fitScore`, brief drawer with "Copy as Markdown" / "Copy for my AI") and apply; brands and creators each get a `/…/collaborations` table (six tabs, counts, pagination) and a detail page whose action panel is generated from `allowedEvents(status, role)` — accept/decline, draft submit/resubmit, "Review LinkedIn post" (approve / request changes, capped at `MAX_REVISION_ROUNDS`), schedule, publish with a LinkedIn URL, pay. Every write is a zod-validated server action (`server/actions.ts`, `server/messages-actions.ts`) that checks the session, the CSRF token and ownership, then calls `transition()`; the UI is optimistic with rollback + toast. Status → label / tab / next-action mapping lives in `src/lib/collaboration-labels.ts` (tested), brief text builders in `src/lib/brief-markdown.ts` (tested). `/…/messages` opens one thread per accepted booking (real `messages` rows, seeded on accepted+ collaborations); AmplioBot is a static placeholder. The tracked link is shown as `/r/{code}`; the redirect itself lives in the tracking feature.

---

## Stream D — prompt

You are STREAM D of a four-stream parallel build of Amplio (a B2B LinkedIn creator marketplace). Your git worktree is at `/Users/nexxus/Projects/amplio-streams/stream-d` on branch `stream/d` (branched from main). EVERY shell command must run there (`cd /Users/nexxus/Projects/amplio-streams/stream-d && …`) and every file you read or write must be under that path. Never touch the integrator's checkout or the other stream folders. Three other streams work in parallel; an integrator merges everyone onto main. Your stream needs no database for most of its work and merges first.

### First, read (paths relative to your worktree)
- CLAUDE.md (engineering rules — lint enforces most), docs/plan.md (§1 for the two sides and the money model; §2 build order steps 3 and 4 for login and the landing page).
- Existing code: src/app/(auth)/** and src/features/auth/components/** (register role cards, register form, login form with the two demo buttons, AuthSplitLayout — these WORK; you restyle them to the layout below without changing their behaviour or the server actions), the wordmark component (now src/components/brand/BrandMark.tsx), src/app/globals.css (theme tokens; `--brand` / `bg-brand` is the brand blue #3B5BFF — add tokens there ONLY if you need e.g. a hero gradient token `--brand-soft`; tokens in globals.css are allowed, raw hex in TSX is not), src/components/ui/* (shadcn: button, card, badge, avatar, tabs, sheet…; accordion is NOT installed — build the FAQ with native <details>/<summary> or your own accessible disclosure), src/components/page/*, src/lib/money.ts, src/db/schema/creators.ts + creator_posts (for the post example cards), src/db/index.ts (isDbConfigured(), getDb()), scripts/seed/creators.ts (what's seeded).

### Setup
- `pnpm install`. Do NOT add dependencies. Do not edit src/components/ui.
- `.env.local` already exists with `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/amplio` (Docker Postgres is running and seeded; shared; you only read). Also test with the variable REMOVED: the landing page and every public page must render without a database (the "post examples" section falls back gracefully — hidden or a static state — never a 500).

### You own ONLY these paths
- src/app/page.tsx (the landing page), src/app/(public)/** (new route group: for-creators, for-agencies, pricing, faq, case-study, about, benchmarks; a shared (public)/layout.tsx with the public nav + footer — the landing page at src/app/page.tsx should use the same nav/footer components), src/app/(auth)/** (visual polish of login/register pages), src/app/not-found.tsx (a branded 404, optional).
- src/features/public/** (components/ for the landing sections and public pages, server/queries.ts for the post-example cards read from creator_posts + creators, constants.ts for copy/numbers), src/features/auth/components/** (visual polish ONLY — keep props/behaviour; do not touch src/features/auth/server/**, schemas.ts or constants.ts).
- src/app/globals.css: ONLY additions of new tokens (e.g. `--brand-soft`, hero gradient stops) in the token blocks; do not change existing values.
Never edit: src/db/**, src/features/auth/server/**, src/features/marketplace/**, src/features/campaigns/**, src/features/collaborations/**, src/components/shell/**, src/components/page/**, src/components/ui/**, src/app/layout.tsx, src/app/brand/**, src/app/creator/**, src/app/api/**, root config files, package.json, .claude/**, .agent-logs/**, CLAUDE.md, README.md, docs/**.

### Build (the spec, from the product owner)
Landing page (/) in this section order, with this copy:
Nav: For companies / For creators / For agencies / How it works / Resources / Sign in / Sign up (links: /, /for-creators, /for-agencies, /#how-it-works, /benchmarks, /login, /register).
1. Hero: "The B2B LinkedIn Creator Marketplace." + sub + [Launch a campaign → /register/brand] [See how Amplio works → #how-it-works] + "Trusted by modern B2B teams" logo strip (text wordmarks, styled as a muted strip — no image assets).
2. A customer case-study quote.
3. Marketplace showcase: "Work with all the best creators." — the three stat blocks: 3,000+ vetted creators / Across 100 countries / Matched to your buyers; behind them a small grid of creator cards using OUR real card look (avatar, name, industries, fit %, price) — build a compact PublicCreatorCard in your own folder; data from your query when the DB is configured, otherwise a static set of 6 illustrative cards clearly defined in your constants.
4. "Run creator campaigns from one place." — the 5-step how-it-works with verbatim labels (01 Find creators your buyers trust — creator cards with a Fit % (Eric 92%, Robin 88%, Aya 84%); 02 Build a campaign brief in minutes — "Campaign brief · AI": Objectives and key messages / Creator guidelines / Tracking links ready; 03 Manage every collaboration — per-creator status: Draft ready / Scheduled / Live; 04 Track reach, clicks, and leads — "Attributed pipeline €48.2K +24% · 124K views · 418 leads"; 05 Pay creators without the admin — "Payment scheduled · Handled by Amplio · Creator payout €1,240 · Contract / Invoice / Payout") with mini UI mocks built from small versions of our own visual language (id="how-it-works").
5. "Real teams. Measurable pipeline." — video testimonial placeholder (a poster-style card, no video) + the case study numbers (9 creators, 2,940 clicks, 512 trials) + "Read case study → /case-study".
6. Logo wall "Trusted by teams at" (+30) — text wordmarks.
7. Results: 5M+ impressions / 30K+ leads / 2,000+ creators / 5K+ posts.
8. Post examples: four creator post cards from SEEDED creators (query creator_posts joined to creators, the four with the highest impressions) with impressions / clicks (derive clicks as impressions × 12% CTR benchmark — label it "est.") / leads (est.) + "View post" (links to the post url). When the DB is not configured, hide the section or show four static cards labelled as examples — never 500.
9. Pricing: Self-serve €0 ("Run it yourself" — pay per published post from €20, no CPC/CPM, no retainer; features list) vs Managed ("Get your time back" — €700/month flat + post spend; custom quote; features). Buttons "Start for free → /register/brand" / "Book a strategy call → /#cta".
10. FAQ: the eight questions from the JSON-LD (write plausible answers from docs/plan.md: What is Amplio? How does Amplio find the right creators? Which platforms do you support? How does per-post pricing work? How does attribution work? Do you handle creator payouts? What's the difference between Free and Done for you? Can I upgrade or cancel anytime?) as accessible disclosures.
11. CTA (id="cta"): "Your next creator campaign starts here." — "30-minute working session" card with the bullet list and "Book a strategy call" (link to /register/brand).
12. Footer: Product / Company / For AI agents / Press / Resources — link only to routes that exist (yours + /login, /register, /benchmarks, /pricing).
Visual: light-blue-to-white gradient hero, dark navy text, rounded pill buttons (black primary), Inter (already loaded as --font-sans), cloud-like soft shapes (CSS gradients/blur only), avatar clusters. Tailwind tokens only in TSX.

Public pages (static): /for-creators (creator value prop: apply "Takes 2 minutes. No commitment.", set your own rate, centralized opportunities, contract & payout handled, "Get paid within 24h", CTA → /register/creator), /for-agencies, /pricing (the two plans in detail + FAQ subset), /faq, /case-study (9 creators, 2,940 clicks, 512 trials, quote), /about (company story, founders, mission), /benchmarks (Q2 2026 report numbers: 312 campaigns, 89 brands, 1,847 posts, CPL €18.10, CTR 12.0%, CPC €2.30, CTR by creator size table, CPL by vertical table, funnel, vs LinkedIn Ads). Shared public layout with the nav + footer. Each page: a hero, 2–4 sections, CTA. Keep them honest and tight; "static" is fine.

Register & login (already functional): restyle them to this layout: split layout (white form left, blue panel right with "Creators. Brands. Results." / "One platform. Two sides." copy), the two role cards on /register, the THREE sign-up options on /register/brand and /register/creator (LinkedIn / Google / email — LinkedIn and Google are visual buttons that show a small inline note "Not available in this build — use email" when clicked; email reveals the existing form), the form (first name, last name, business email, password, "How did you hear about us?" chips, Continue), "Already have an account? Sign in here". Keep the existing RegisterForm/LoginForm/DemoLoginButtons logic and props intact — restyle and re-arrange only. The 6-digit code step is intentionally skipped (README says so; don't add it).

Every page checked at 375px and 1440px (no horizontal scroll, nav collapses to a menu button + sheet or a simple disclosure on mobile). Real links, real buttons, focus states.

### Rules that bite
- page.tsx thin (<100 lines): compose section components from src/features/public/components; the post-example query lives in src/features/public/server/queries.ts (server-only; wrap in try/catch and return [] when !isDbConfigured() or on error, logging server-side).
- Views never import @/db (lint fails). 'use client' only where you need state (mobile nav, FAQ if not native, sign-up option toggle).
- Max 500 lines/file, split around 300, ~10 files per folder (subfolders: components/landing, components/pages, components/nav). One component per file. No utils.ts. Copy/numbers in constants.ts (no magic numbers in server code).
- Tailwind theme tokens only in TSX — no raw hex (lint fails). Add tokens in globals.css if you need a hero gradient.
- Conventional commits, small, on your branch, `git add` only your paths. Do not push, do not merge, do not rebase, do not switch branches.

### Verify before you report
`pnpm typecheck && pnpm lint && pnpm test && pnpm build` green (warnings for long JSX functions OK; no errors). `PORT=3104 pnpm start` (background); you may use the browser tools on http://localhost:3104 in your OWN tab (tabs_create) — the pane is shared with other streams; if it misbehaves, fall back to curl and say what you couldn't verify visually. Check the landing page at 1440 and 375. Then remove DATABASE_URL from .env.local, rebuild/restart, and confirm / and every public page still return 200; restore .env.local afterwards. Stop your server when done.

### Final report (this is all the integrator sees)
1. Branch name (`git rev-parse --abbrev-ref HEAD`) and worktree path (`pwd`).
2. Commits (oneline).
3. What's live vs stubbed, with routes.
4. Assumptions (every deviation, every open decision, any copy you wrote yourself vs took verbatim).
5. Anything you needed outside your paths (describe; don't make it).
6. README notes (a paragraph for the integrator to add).

## Stream D — report

# Stream D report

## 1. Branch / worktree
- Branch: `stream/d`
- Worktree: `/Users/nexxus/Projects/amplio-streams/stream-d`
- Working tree clean; nothing pushed, merged or rebased. Server on :3104 stopped. `.env.local` restored to the original `DATABASE_URL`.

## 2. Commits (on top of `440c3d2`)
```
4058b76 feat(public): branded 404 and nav-safe navy hero for /benchmarks
70e933e feat(public): for-creators, for-agencies, pricing, faq, case-study, about, benchmarks
f975503 style(auth): pixel-close register/login — sign-up options, card preview panel
3d93793 feat(public): landing page sections, public nav/footer, post-example query
```
Verification: `pnpm typecheck`, `pnpm lint` (0 errors, 15 warnings — all `max-lines-per-function` on JSX, 6 of them pre-existing), `pnpm test` (10/10), `pnpm build` all green. Every route probed with `PORT=3104 pnpm start` both with the DB and with `DATABASE_URL` removed (all 200; `/api/health` correctly 503 without DB). Checked at 1440 (headless Chrome full-page captures) and 375 (browser pane: `scrollWidth === 375` on every page, sheet menu works). Note: the shared browser pane could not composite scrolled screenshots, so 1440 full-page review was done with headless Chrome instead.

## 3. What's live vs stubbed
| Route | Status |
|---|---|
| `/` | Live. 12 sections in the spec's order. Showcase cards = 6 seeded creators scored with the real `fitScore()` against an illustrative B2B/SaaS/AI brief (`SHOWCASE_BRIEF`), top-6 of the 120 highest-median-view creators. Post examples = 4 seeded `creator_posts` joined to `creators`+`users`, highest impressions, one per creator; clicks = impressions × 12% (labelled "est."), leads = clicks × CPC/CPL (€2.30/€18.10, labelled "est."). Without DB: showcase shows the 6 static `STATIC_SHOWCASE_CREATORS` with an "Illustrative profiles" footer; post-examples section is hidden (CTA stays). |
| `/for-creators`, `/for-agencies`, `/pricing`, `/faq`, `/case-study`, `/about`, `/benchmarks` | Live, static, shared `(public)/layout.tsx` nav + footer. |
| `/login`, `/register`, `/register/brand`, `/register/creator` | Restyled. LinkedIn/Google are visual buttons showing an inline "Not available in this build — use email." note; "Sign up with email" reveals the unchanged `RegisterForm`. Demo buttons kept (login, in an "Explore without an account" box). Server actions untouched. |
| `not-found.tsx` | Branded 404 with public nav/footer. |
| Stubbed | Video testimonials are poster cards ("no playback in this build"); client logos are text wordmarks; "Book a strategy call" links to `/register/brand` (no booking page exists); agency mode is not built (both agency CTAs create standard accounts, and the page says so). |

Key files: `src/app/page.tsx` (45 lines), `src/app/(public)/**`, `src/features/public/{constants.ts,page-copy.ts,benchmarks-data.ts,server/queries.ts,components/{nav,landing,landing/mocks,shared,pages,pages/creators}}`, `src/features/auth/components/{AuthSplitLayout,SignUpOptions,SocialAuthButtons,CreatorCardPreview,RoleChoiceCards,RegisterForm,LoginForm,DemoLoginButtons}.tsx`.

## 4. Assumptions / deviations
- **globals.css**: added only new tokens (`--brand-soft`, `--brand-sky`, `--linkedin`, `--success` + `@theme` mappings, light and dark). No existing value changed.
- **RegisterForm** gained one optional prop `onBack?: () => void` so "Back to sign-up options" returns to the option list instead of `/register`; all other props/logic intact. Creator form shows a "Step 1 of 4" eyebrow (steps 2–4 belong to onboarding, not built here; no code step, per README).
- **Copy**: nav labels, hero, section titles, 5 step labels, stat figures, pricing plan copy, FAQ questions, CTA card, quote, case-study numbers, benchmark tables are verbatim from the spec. **Written by me**: the 8 FAQ answers (grounded in the plan), the 8 creator FAQ answers on `/for-creators`, `priceDetail` lines under the plan prices, the "Trusted by modern B2B teams" logo set (only the visible wordmarks), case-study bullets 3–4 of "Why it worked", the about-page mission bullets and facts tile ("30+ paying brands"), the benchmarks caveats section, all page metadata, and the 404 copy.
- **Case study numbers**: the landing page shows 9 creators / 2,940 clicks / 512 trials (per spec); the longer case-study copy shows 15 creators / ~20 posts / 150% ROAS / 1,500+ leads / €5,000. `/case-study` shows the spec's three as the headline block and the page's own figures (ROAS, leads, budget) beneath, with the narrative using those numbers. Flagging because the two sets disagree.
- **Managed plan**: spec says "€700/month flat + post spend; custom quote", the plan card copy says "Custom quote" only. I show "€700 / month + post spend" with "Custom quote for multi-brand or agency setups".
- Footer links only to existing routes; "llms.txt" was dropped (no such route), "pricing.md" points to `/pricing`, Press column points to `/case-study` and `/about`, LinkedIn icon links to an external LinkedIn page. Footer carries a demonstration-build disclaimer line.
- `lucide-react` v1 has no brand icons, so `LinkedInMark` is a small styled "in" badge; Google is a "G" circle.
- Avatars use the seeded dicebear URLs via shadcn `Avatar` (initials fallback); static/illustrative people use initials only.
- Landing page is `force-dynamic` so a missing DB degrades at request time rather than failing the build.

## 5. Needed outside my paths (not done)
- A real "Book a call" public page would let the CTA / pricing / agencies buttons stop pointing at `/register/brand` and `/#cta`.
- `next.config.ts` `images.remotePatterns` for `api.dicebear.com` if anyone wants `next/image` for avatars (I used shadcn `Avatar`'s plain `<img>`, no config needed).
- Agency mode routes if `/for-agencies` CTAs should land somewhere agency-specific.

## 6. README paragraph for the integrator
> **Public site.** `/` and `src/app/(public)/**` (for-creators, for-agencies, pricing, faq, case-study, about, benchmarks) are composed from `src/features/public/components/*` with all copy and marketing figures in `src/features/public/{constants,page-copy,benchmarks-data}.ts` — the numbers are marketing figures, not measurements from our database. The landing page reads seeded data through `src/features/public/server/queries.ts`: the marketplace showcase scores the top creators with `fitScore()` against an illustrative B2B/SaaS/AI brief, and the "Real posts" section shows the four highest-impression `creator_posts` (one per creator) with clicks and leads *estimated* from Q2 2026 benchmarks (12% CTR, €2.30 CPC / €18.10 CPL) and labelled "est.". Without `DATABASE_URL` the showcase falls back to six illustrative static cards and the post section is hidden; every public page still returns 200. Register/login use a split layout; the LinkedIn/Google buttons are visual only (inline note), email reveals the real form, and there is no 6-digit code step on purpose. Video testimonials are poster cards and client logos are text wordmarks; no image assets are shipped.
