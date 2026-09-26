# Amplio

Amplio is a B2B marketplace where brands pay LinkedIn creators for posts. A brand sees creators ranked against its
campaign brief, with the reasons shown, and books one at a fixed price per post: the fee is held from its wallet until
the creator answers. The creator writes the post in their own voice and the brand approves the draft before it goes
out. Every click on the post's tracked link, and every sign-up or purchase the brand's pixel ties to that click, traces
back to the creator who brought it. Money moves through a wallet and a ledger, creators withdraw their payouts, and an
agent mode can do the same work from a conversation, asking before anything changes.

**Live: https://amplio-mvp.vercel.app** (auto-deployed from `main`; Postgres on Neon). Health check: `/api/health`.

Demo logins on `/login`: **Open the demo brand** (Zune) / **Open the demo creator** — one click, no typing. Accounts
`brand@demo.amplio` / `creator@demo.amplio`, password `demo1234`, if you prefer the form. Demo accounts can switch
Brand ↔ Creator in the top bar.

The mark is three dots joined by one line (`src/components/brand`), the wordmark is Geist 600;
`node scripts/icons.mjs` re-renders the favicon PNGs.

## Stack

- Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind v4, shadcn
- Drizzle + Postgres 16 (Docker locally, Neon in production)
- Own auth (bcrypt, httpOnly session cookie, CSRF token)
- next-intl for English and French
- Anthropic SDK and `@google/genai` for the AI features, each with a keyless template fallback
- Vapi or the browser's Web Speech API for voice; Resend for the one email; Apify for the LinkedIn profile import
- Vitest; ESLint carries the engineering rules
- Vercel hosting, with Web Analytics + Speed Insights mounted in the root layout (no custom events)

## Run

```bash
pnpm install
cp .env.example .env.local        # DATABASE_URL points at the docker postgres below
pnpm db:up                        # postgres 16 in docker
pnpm db:migrate && pnpm db:seed   # 21 tables, 300 creators, 3 brands, demo accounts, ~1,200 clicks
pnpm dev                          # http://localhost:3000
```

`docker compose` runs one service, `db`: a `postgres:16-alpine` container named `amplio`, database `amplio`, data in
the `amplio` volume, on port 5432. The local URL is `postgresql://postgres:postgres@localhost:5432/amplio`.

| Command            | What                                                              |
| ------------------ | ----------------------------------------------------------------- |
| `pnpm typecheck`   | `tsc --noEmit`                                                    |
| `pnpm lint`        | ESLint — the engineering rules in `eslint.config.mjs`             |
| `pnpm test`        | Vitest, 164 tests in 44 files                                     |
| `pnpm build`       | Production build                                                  |
| `pnpm db:up/down`  | Docker Postgres                                                   |
| `pnpm db:generate` | Drizzle migration from `src/db/schema/*`                          |
| `pnpm db:migrate`  | Apply migrations to `DATABASE_URL`                                |
| `pnpm db:seed`     | Reset and reseed (`scripts/seed/*`, fixed faker seed)             |
| `pnpm db:reset`    | down + up + migrate + seed                                        |
| `pnpm db:migrate:remote` / `db:seed:remote` | same, against the `DATABASE_URL` in a gitignored `.env.remote.local` |

CI (`.github/workflows/ci.yml`) runs typecheck + lint + test on every push.

### Environment

See `.env.example`; every variable is explained there.

| Variable | Needed? | What it does |
| --- | --- | --- |
| `DATABASE_URL` | for rows | Postgres. Without it the app still renders (see below). |
| `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` | optional | LLM for briefs, onboarding drafts, the matching write-up, voice intents, the assistant and agent mode. Template fallback without them. |
| `RESEND_API_KEY` | optional | Sends the password-reset email. The link is always shown on screen too. |
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY`, `VAPI_PRIVATE_KEY` | optional | Vapi voice calls. Without both, voice uses the Web Speech API. |
| `VAPI_SERVER_SECRET` | optional | The secret Vapi sends on every webhook call. Derived from `VAPI_PRIVATE_KEY` if unset. |
| `APIFY_TOKEN` | optional | LinkedIn profile import in creator onboarding. Without it the card is typed by hand. |
| `NEXT_PUBLIC_FF_AGENT_MODE` | optional | `1` turns agent mode on. Off otherwise. |
| `AGENT_SIGNING_SECRET` | optional | Signs the agent's pending confirmations. Derived from a server-only value if unset. |

Vercel sets `VERCEL_GIT_COMMIT_SHA` and `VERCEL_DEPLOYMENT_ID`.

### Health check

`GET /api/health` → `{ ok, db, ai, voice, email, commit }`. It returns 503 with `db: "not configured"` until a database
URL is set. `ai` is the provider that actually answered a tiny probe (cached 10 min): `anthropic`, `gemini` or
`template`. The keys resolve in the order `ANTHROPIC_API_KEY` → `GEMINI_API_KEY` → template. Every call falls through to
the next provider on a billing, auth or quota error or a network failure, and that provider is set aside for 10 minutes,
so a topped-up account comes back without a redeploy. `voice` is `vapi` or `web-speech`, `email` is `resend` or
`on-screen`. The response is public, so it names no env variables and carries no error text: when something is off, the
server log has the details (which database variable was used, key-looking variable names, demoted providers).

**Without a database** every page still renders: the app shells show an honest "Database not configured" state on every
tab, the public pages fall back to static content, and `/api/health` is the only thing that reports the reason. The
deploy never 500s because of a missing env var: the AI keys are optional everywhere they are used.

## Architecture

```
src/app                      routes only; page.tsx calls a query and renders a view (< 100 lines)
src/features/<domain>/
  components/                views
  server/queries.ts          reads  (plain DTOs, never drizzle rows)
  server/actions.ts          writes (server actions, zod-validated, { ok, data } | { ok:false, error })
  schemas.ts                 zod: single source of truth for form, action and DTO
  constants.ts
src/db                       drizzle client + schema; only features/*/server imports it (lint-enforced)
src/lib                      pure functions only, unit-tested (fit score, state machine, money, estimator, cache tags, next step…)
src/components/ui            shadcn output, not edited
src/components/{shell,page,motion,graphics,flow,…}   shared composites
```

Domains: `auth`, `marketplace`, `campaigns`, `collaborations`, `tracking`, `payouts`, plus `workspace` (overviews,
settings, affiliate, notifications), `public` (marketing site), `brand-onboarding`, `creator-onboarding`,
`profile-fields` (fields shared by onboarding and Settings), `assistant`, `voice`, `agent` and `ai` (the provider
resolver). Full rules: `CLAUDE.md` → "Engineering rules".

**The collaboration state machine** (`src/lib/collaboration-status.ts`, tested exhaustively) is the spine: invited or
applied → accepted/declined → draft submitted ⇄ changes requested → approved → scheduled → live → paid. Every status
change goes through `transition()` (`src/features/collaborations/server/transition.ts`), which writes a
`collaboration_events` row and the money side effects: an invitation holds the fee from the brand's wallet, a decline
releases it, acceptance creates the tracked link, going live creates a pending payout, paying settles both.

**Attribution is real.** `/r/{code}` is one insert + one 302; the click id rides on a cookie and a `?nn=` param.
`/n.js` is the pixel (`amplio('track', 'signup', { email })`); `/api/pixel` stores the event against the click.
`/demo/landing` is a stand-in customer site with the pixel installed. Every seeded tracked link lands there (with the
brand's own site key), so on the live site you can click a creator's link, sign up, and watch Results move. Every
number on every dashboard is a query over rows; the click log exports to CSV per creator.

**Agent mode** (`src/features/agent`, behind `NEXT_PUBLIC_FF_AGENT_MODE=1`) adds an Agent page for each role
(`/brand/agent`, `/creator/agent`), a sidebar item and a ⌘K entry. `/api/agent` streams the turn as server-sent events:
a Gemini function-calling loop (up to 8 tool steps, 45 s per turn) over role-scoped tools. Read tools run freely (brand
profile, campaigns, creator search with fit scores, collaborations, wallet; for creators: card, opportunities,
collaborations, earnings). Tools that move money or a collaboration (book, approve, request changes, pay, top up,
apply, accept, decline, submit a draft, send a message) only prepare the action; the user confirms it in the app
through `/api/agent/confirm`, and it runs the same server actions as the UI. Amounts in the reply are checked against
tool output. Threads and "remember this" notes are stored (`agent_threads`, `agent_messages`, `agent_notes`, migration
`drizzle/0007_red_sir_ram.sql`); where that migration hasn't run, the agent works without memory. Without a Gemini key
`/api/agent` answers through the existing assistant.

**Calling the agent.** With agent mode on, a Vapi call runs the same agent. `/api/voice/session` mints the call's thread
and a one-hour session token. Vapi's model only relays what the caller says to the `command` tool at `/api/voice/vapi`,
which checks the shared secret and the token on every request, runs a voice turn (short, speakable, no ids) and returns
the words to say. Steps, cards, confirm cards and `navigate` events land in the thread's feed (`agent_events`,
migration `0008`), which the call widget polls at `/api/agent/threads/{id}/events?after=`. A spoken yes or no answers
only the card pending in that thread, through the same `/api/agent/confirm` a tap uses. The Vapi assistant is created
from code, one per host.

**The call widget** (`src/features/agent/components/call`) is mounted once in the app shell, so a call survives every
route change. It starts from the phone beside the sidebar's Agent item, ⌘K "Call the agent", or the Call button on the
agent page. On desktop it is a 340 × 460 window, dragged by its header (or moved with the arrow keys; Enter snaps) to the
nearest corner, remembered per browser, and folds to a 64px bubble. On phones it is a bottom sheet that pulls down to a
bar. It shows the mark's dots on the voice level, the timer, a two-line caption, the latest steps, result chips and the
confirm card (tap, or say yes), and ends on a summary with "Continue in chat". The sidebar shows a live dot and the time.
When Vapi can't start (no keys, an older session route, a failed start), the call falls back to the browser's own speech
recognition and voice, one turn at a time against `/api/agent`. A blocked microphone gets its own state with chat offered.

## What's real vs stubbed

| Area | Status |
| --- | --- |
| Auth | Own users/sessions (bcrypt, httpOnly cookie, CSRF token on the session). Sign in, sign up, forgot and reset are one centred column (`src/features/auth/components/AuthColumn.tsx`); sign-up picks the role with a segmented control and shows the step rail (`src/components/flow/StepRail.tsx`) that onboarding continues. Two one-click demo accounts on sign-in. `/register?role=…` lands on that role. Forgot password is real end to end (single-use hashed token, 30 min); the link is emailed through Resend when `RESEND_API_KEY` is set and always shown on screen in a labelled box. No OAuth (no Google/LinkedIn buttons). Copy in `messages/{en,fr}/auth.json`. |
| Brand onboarding | Real, inside the app shell at `/brand/setup` (steps on an ink rail, Setup in the sidebar and a setup card on Overview until done; the app is usable before), on one screen as the wizard card, opening with the brand's logo (picked, cropped and encoded in the browser, saved to `brand_logos` — **migration `drizzle/0006_goofy_skrulls.sql` is applied locally; production needs `pnpm db:migrate:remote`, until then logos can't be saved there and nothing else is affected**) and the three ideal customers as cards that open a detail dialog (the brand's profile previewed beside the fields, live, turning over to the facts when the draft lands; `src/components/flow`): reads the website server-side (title, description, headings) while its words sort into value-prop / ideal-customer trays, then the resolved LLM (Claude or Gemini) drafts the value prop + 3 ideal customers right under the field, editable, before anything is used (a template from the company name when the site can't be read, and the screen says so); creates the "{Company} creator brief" campaign; lands in the marketplace. Fields shared with Settings (`src/features/profile-fields`). |
| Creator onboarding | Real 4 steps inside the app shell at `/creator/setup?step=…` (LinkedIn → card → price → legal on an ink rail, Setup in the sidebar and a setup card on Overview until done; LinkedIn and invoicing skippable), each a wizard card, opening with the creator's photo (browser-encoded, saved to `creators.avatar_url`; an upload beats the LinkedIn photo): the creator's card previewed beside the fields (values fly into it; it turns over to the facts on price and legal), fields shared with Settings. **LinkedIn import is real**: the Apify actor `harvestapi/linkedin-profile-scraper`, build `0.0.135` pinned in `src/features/creator-onboarding/server/linkedin-import.ts`, called server-side with `APIFY_TOKEN` (60 s timeout, ~$0.004 a profile); it stores public facts only — headline, followers, country, photo — on the creator row and reuses them for the same URL (no second paid read). Reach and engagement aren't on a public profile and are never filled in. A failed read (no token, timeout, not found) says "We couldn't read that profile — enter it by hand" and the card is typed by hand. Price recommendation from `src/lib/recommend-price.ts`. Legal details can wait for Settings. |
| Creators (brand) | Real: every creator ranked by `fitScore()` against the selected campaign as a ledger (fit, followers, median views, price side by side), filters incl. activity window, sort/search/pagination in the URL, shortlist. The fit score opens its four signals and a one-line reason in place, worded from structured facts in EN/FR; engagement is judged against the median of creators the same size **on Amplio** (`marketplace/server/engagement-baseline.ts`), not a published benchmark. Invite is on the row and in the profile drawer: a funded invitation (fee held until the creator answers — "asked to answer by", nothing expires automatically) or an offer below the listed price. |
| Describe who you want | Real ranking from a sentence; the write-up and trade-off come from the resolved LLM (in the reader's language) when a key is set, otherwise a template built from the fit signals — the UI labels which. The answer lands as the same ledger rows. Thumbs/copy write a `nao_feedback` row and say "noted" — feedback doesn't steer ranking. |
| Campaigns | Real: ledger list, a detail page per campaign (header with the projection from Amplio's own data beside actual clicks; tabs Collaborations — next step and owner per row — Brief, Shortlist, Analytics), brief editor, delete (two clicks; held fees come back). New campaign = three questions → an editable brief drafted by the LLM or the template. 4-step launch ending on the estimator: `src/lib/estimator.ts` derives clicks-per-view and sign-ups-per-click from Amplio's own live posts (`campaigns/server/read-rates.ts`) and shows the sample; below 3 live posts / 30 clicks it says "not enough data yet". |
| Collaborations | Real on both sides: apply, accept/decline, draft, review modal (approve / request changes, capped rounds), schedule, publish with post URL, pay; optimistic UI with rollback; timeline from `collaboration_events`. |
| Messages | Real threads per accepted booking, both sides, optimistic send; quick reactions drop an emoji into the message. |
| Tracking | Real: redirect, pixel, collector. Results: four numbers that each open the rows they're made of (estimated reach → live posts, clicks → click rows, attributed sign-ups → pixel events tied to a click, committed → ledger), pixel status, clicks over time, per-creator attribution with per-row CSV, live posts, the raw click log + CSV. Campaign analytics and creator analytics from the same rows. Post reactions/comments are the creator's recent public-post averages (labelled); LinkedIn's own sponsored-post metrics are not imported. |
| Wallet / payouts | Real ledger. Brand Billing shows where the money is — available, held for invitations nobody has answered, committed to accepted work, paid — then the ledger (paid bookings print a stamp). Top-ups are a demo with no card (the dialog says so). Creator side: payouts, withdrawals (bank = pending "in transit", Stripe settles instantly). No Stripe Connect, no real bank rail, no invoice PDFs. |
| Settings, affiliate | Real screens with real updates (profile incl. X handle, audience, payout details, delete account). Affiliate: brands that sign up through a creator's `?ref=` link are recorded, with the paid collaborations they've run since; no reward is computed, because the platform takes no fee in this build. No community leaderboard, team invites or guided tour. |
| Assistant | A floating pill on the app and public pages (a static shell at first paint; the interactive widget loads when the page is idle); typed messages go to `/api/assistant/chat`: signed in they run the same tools and confirm gate as voice, otherwise a short answer from the provider resolver (claude → gemini → keyless template) over a read-only context (your campaigns/wallet/pending actions, or opportunities/collaborations/earnings; when logged out, a checked list of product facts in `src/features/assistant/facts.ts` — no prices, customers or figures we can't back). Conversation kept per tab. |
| Agent mode | Real, off by default (see Architecture). Needs `NEXT_PUBLIC_FF_AGENT_MODE=1` and, for its own tool loop, `GEMINI_API_KEY`. Every change waits for the user's confirmation in the app. |
| Voice | Real command layer on the floating pill (`src/features/voice`, `docs/voice.md`): Web Speech API by default, Vapi when both keys are set; intents parsed by Claude with structured output or a regex grammar; every tool runs the same server actions as the UI (session + CSRF); money and status changes ask "Confirm?" and wait for a yes. With agent mode on, a Vapi call runs the agent instead (see Architecture) and the screen follows it through the thread feed. |
| Motion (app) | One kit, all on `/dev/ui`: `src/components/graphics` (a glyph per collaboration state that redraws when the state moves, the fit ring, the audience orbit, the PAID stamp, a burst on success, the trail loader, four empty-state scenes) and `src/components/motion` (charts and sparklines that draw in, numbers that roll per digit, sections that rise in on scroll, the page kept on screen while the next loads). Transitions 150–220 ms; drawings (charts, glyphs, the ring) take up to about 0.9 s; opacity / transform / stroke only; under `prefers-reduced-motion` everything shows its last frame. |
| EN / FR | Real: next-intl, one set of URLs. The app reads the `NEXT_LOCALE` cookie; the public and auth pages live under `app/[locale]` and are prerendered in both languages, with `src/proxy.ts` rewriting `/pricing` to `/en/pricing` or `/fr/pricing` from the cookie, then Accept-Language. Messages: every namespace in `messages/{en,fr}/*.json` (a dotted file name nests, so a namespace can be split). Server-worded strings (notifications, fit reasons, skip reasons) are returned as facts and worded in the view. |
| Landing hero + public nav + footer | The first screen is the glass hero (`src/features/public/components/hero`), built to a measured 1280 × 960 comp in design units with three tiers keyed to frame shape: a pale glass plate (poster = LCP, 18 KB AVIF; a 10 s silent clip attached on idle, desktop only — never on phones, Save-Data, <4 cores or reduced motion), "Every click / comes back." in Inter, a glass panel and a stats row with the demo workspace's real posts, links, clicks and sign-ups (`getPublicTrail`, the source of `/api/public/trail`, 60 s cache, labelled "demo workspace data"), and Open the demo; a one-off WAAPI entrance from two inline scripts that ends on the real counts. The public header (`nav/PublicHeader`) is the same glass on every public page: a centred pill whose capsule slides to the hovered item, transparent over the hero and frosted after 40px (frosted from the start elsewhere), a burger dropdown on portrait frames. Below the hero: five scroll scenes (the real click, sign-up and paid figures), how to start, pricing, FAQ, sign-up — popping on a spring as they arrive, cards and buttons inverting on hover; language and theme switches in the footer. |
| Public site | Landing, for-creators, pricing (with one real paid demo post as the worked example), FAQ, privacy, terms and a 404, copy in `messages/{en,fr}/{landing,public}.json`. Public numbers are the seeded demo workspace's, labelled "demo workspace data". `src/app/sitemap.ts` lists the routes. |

Not built: Stripe Connect, email beyond the password reset, LinkedIn's own metrics for sponsored posts, X/YouTube
channels, an MCP endpoint, `llms.txt`, blog, free tools, cookie banner.

Motion tokens (150 / 180 / 220 ms, one ease-out curve) live in `src/app/globals.css`; every animation shows its end
state under `prefers-reduced-motion`.

## Tests

`pnpm test` runs 164 Vitest tests in 44 files. They cover the pure logic: `fitScore`, the collaboration state machine,
money, the estimator, price recommendation, the database URL resolution, the voice grammar, the
agent's filters, money check, event stream and confirmation gate, schemas, and a check that no view ships literal copy
outside the message files. No snapshot tests.

## Design

- [`docs/design/DIRECTION.md`](docs/design/DIRECTION.md) — the design system and the one idea behind it.
- [`docs/design/DECISIONS.md`](docs/design/DECISIONS.md) — what was changed, cut and merged, and why.
- [`docs/design/PAGES.md`](docs/design/PAGES.md) — why each page is laid out the way it is, the landing's recorded
  passes, the QA runs and the Lighthouse tables.
- [`docs/design/screens/`](docs/design/screens/) — screens at 1440 and 375, including the full loop (brand signs up →
  books a creator → draft, changes, approval → published → a tracked click and a sign-up attributed → paid → withdrawn)
  as `loop-01…39-*.jpg`, the hero at 1440 / 1024 / 768 portrait / 375 in `screens/hero/`, and agent mode in
  `screens/agent/`. Landing recordings are in [`docs/design/recordings/`](docs/design/recordings/).
- Lighthouse on the live site: desktop 99–100 on `/`, `/for-creators`, `/pricing`, `/login`; mobile 95–100 on `/` and
  `/for-creators`, 96 on `/pricing`, 94 on `/login`; accessibility, best practices and SEO 100 everywhere. The table is
  in [`PAGES.md`](docs/design/PAGES.md#lighthouse-live-amplio-mvpvercelapp-lighthouse-12-2026-09-26).
- A walkthrough script: [`docs/walkthrough-script.md`](docs/walkthrough-script.md).

## How it was built

Several Claude Code sessions worked in parallel on this one repo:

- A planning and prompting session wrote the plan, wrote the prompt for each build step, reviewed every result and
  merged the work onto `main`.
- Builder sessions each took a separate stream (navigation, assistant, interaction, polish, app motion) on its own
  branch and git worktree, rebasing onto `main` as they landed.
- A QA pass ran the whole loop end to end on fresh accounts and captured every step (`loop-01…39-*.jpg`); the run
  and the live Lighthouse numbers are recorded in `docs/design/PAGES.md`.

Every prompt and every final response of each session is captured automatically by a `UserPromptSubmit`/`Stop` hook
into [`.agent-logs/`](.agent-logs/), one file per session (see `CAPTURE-TEST.md`), and committed with the code it
produced. That folder is the record of how Amplio was built. Two earlier rounds were fanned out to parallel subagents
in their own worktrees; their exact prompts and reports are in [`docs/agent-streams.md`](docs/agent-streams.md). The
plan the build followed is [`docs/plan.md`](docs/plan.md).
