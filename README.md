# naano-rebuild

Shipped under the name Amplio; naano.com is the reference product. The mark is the ink footer's oval-and-sprig (`src/components/brand`), the wordmark is Cormorant Garamond 500; `pnpm icons` re-renders the favicon PNGs.

A working rebuild of [naano](https://naano.com), the B2B LinkedIn creator marketplace: brands book vetted creators at a
fixed price per post, creators write in their own voice, and every post's clicks, sign-ups and purchases are attributed
back to the creator through a tracked link and a pixel. Next.js 16 (App Router), TypeScript, Tailwind v4, shadcn, Vercel Web Analytics + Speed Insights are mounted in the root layout (no custom events).
Drizzle + Postgres, deployed on Vercel.

**Live: https://naano-rebuild-opal.vercel.app** (auto-deployed from `main`; Postgres on Neon). Demo logins on `/login`:
**Explore as demo brand** (Zune) / **Explore as demo creator** — one click, no typing. Accounts `brand@demo.amplio` /
`creator@demo.amplio`, password `demo1234`, if you prefer the form. Smoke test: `/api/health`.

## How this was built

Claude Code sessions, one repo. One session mapped naano.com screen by screen (`docs/reference/`), wrote the brief for
each build step and evaluated every build; three builder sessions shipped in parallel on branches (the nav, assistant,
interaction, polish and app-motion streams), rebasing onto `main` as they landed. Every prompt and every final reply is
captured automatically by a `Stop`/`UserPromptSubmit` hook into `.agent-logs/` — one file per session (see
`CAPTURE-TEST.md`) — committed alongside the code it produced. Two earlier rounds of work were fanned out to parallel
subagents in git worktrees; their exact prompts and reports are in `docs/agent-streams.md`. The plan the build followed is `docs/plan.md`.

## Run

```bash
pnpm install
cp .env.example .env.local        # DATABASE_URL points at the docker postgres below
pnpm db:up                        # postgres 16 in docker
pnpm db:migrate && pnpm db:seed   # 14 tables, 300 creators, 3 brands, demo accounts, ~1,200 clicks
pnpm dev                          # http://localhost:3000
```

| Command            | What                                                              |
| ------------------ | ----------------------------------------------------------------- |
| `pnpm typecheck`   | `tsc --noEmit`                                                    |
| `pnpm lint`        | ESLint — the engineering rules in `eslint.config.mjs`             |
| `pnpm test`        | Vitest, 89 unit tests over the pure logic                         |
| `pnpm build`       | Production build                                                  |
| `pnpm db:up/down`  | Docker Postgres                                                   |
| `pnpm db:generate` | Drizzle migration from `src/db/schema/*`                          |
| `pnpm db:migrate`  | Apply migrations to `DATABASE_URL`                                |
| `pnpm db:seed`     | Reset and reseed (`scripts/seed/*`, fixed faker seed)             |
| `pnpm db:reset`    | down + up + migrate + seed                                        |
| `pnpm db:migrate:remote` / `db:seed:remote` | same, against the `DATABASE_URL` in a gitignored `.env.remote.local` |

CI (`.github/workflows/ci.yml`) runs typecheck + lint + test on every push. Smoke test after every deploy:
`GET /api/health` → `{ ok, db, dbEnv, ai, voice, commit }` (503 with `db: "not configured"` until a database URL is set; `dbEnv` names
the variable it used — `DATABASE_URL` or one of Vercel's Neon-prefixed names, see `.env.example`; `ai` is the provider that actually answered a tiny probe (cached 10 min) — `anthropic`, `gemini` or `template`; `aiResolved` is what the keys resolve to (order `ANTHROPIC_API_KEY` → `GEMINI_API_KEY` → template); every call falls through to the next provider on a billing/auth/quota error or a network failure and that provider is set aside for 10 minutes (`aiDemoted`), so a topped-up account comes back without a redeploy; `aiEnv` lists key-looking variable names,
`voice` is `vapi` or `web-speech`, `email` is `resend` or `on-screen`, depending on which optional keys are present).

**Without a database** every page still renders: the app shells show an honest "Database not configured" state on every
tab, the public pages fall back to static content, `/api/health` is the only thing that reports the reason. The
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
src/lib                      pure functions only, unit-tested (fit score, state machine, money, estimator…)
src/components/ui            shadcn output, not edited · src/components/{shell,page,motion}  shared composites
```

Domains: `auth`, `marketplace`, `campaigns`, `collaborations`, `tracking`, `payouts`, plus `workspace` (overviews,
settings, integrations, community, affiliate, notifications), `public` (marketing site), `brand-onboarding`,
`creator-onboarding`. Full rules: `CLAUDE.md` → "Engineering rules". The build was split across parallel agent streams;
their prompts and reports are in `docs/agent-streams.md`, the plan in `docs/plan.md`, the recon in `docs/reference/`.

**The collaboration state machine** (`src/lib/collaboration-status.ts`, tested exhaustively) is the spine: invited or
applied → accepted/declined → draft submitted ⇄ changes requested → approved → scheduled → live → paid. Every status
change goes through `transition()` (`src/features/collaborations/server/transition.ts`), which writes a
`collaboration_events` row and the money side effects: an invitation holds the fee from the brand's wallet, a decline
releases it, acceptance creates the tracked link, going live creates a pending payout, paying settles both.

**Attribution is real.** `/r/{code}` is one insert + one 302; the click id rides on a cookie and a `?nn=` param.
`/n.js` is a pixel with naano's API (`naano('track', 'signup', { email })`); `/api/pixel` stores the event against the
click. `/demo/landing` is a stand-in customer site with the pixel installed — every seeded tracked link lands there (with the
brand's own site key), so on the live site you can click a creator's link, sign up, and watch Results move. Every number on every dashboard is a
query over rows; the click log exports to CSV per creator.

## What's real vs stubbed

| Area | Status |
| --- | --- |
| Auth | Own users/sessions (bcrypt, httpOnly cookie, CSRF token on the session). Sign in, sign up, forgot and reset are one centred column (`src/features/auth/components/AuthColumn.tsx`); sign-up picks the role with a segmented control and shows the step rail (`src/components/flow/StepRail.tsx`) that onboarding continues. Two one-click demo accounts on sign-in. `/register?role=…` lands on that role. Forgot password is real end to end (single-use hashed token, 30 min); the link is emailed through Resend when `RESEND_API_KEY` is set and always shown on screen in a labelled box. No OAuth (no Google/LinkedIn buttons). Copy in `messages/{en,fr}/auth.json`. |
| Brand onboarding | Real, on one screen: reads the website server-side (title, description, headings) while its words sort into value-prop / ideal-customer trays, then the resolved LLM (Claude or Gemini) drafts the value prop + 3 ideal customers right under the field, editable, before anything is used (a template from the company name when the site can't be read, and the screen says so); creates the "{Company} creator brief" campaign; lands in the marketplace. Fields shared with Settings (`src/features/profile-fields`). |
| Creator onboarding | Real 4 steps on the step rail (LinkedIn → card → price → legal), fields shared with Settings. **LinkedIn import is real**: the Apify actor `harvestapi/linkedin-profile-scraper`, build `0.0.135` pinned in `src/features/creator-onboarding/server/linkedin-import.ts`, called server-side with `APIFY_TOKEN` (60 s timeout, ~$0.004 a profile); it stores public facts only — headline, followers, country, photo — on the creator row and reuses them for the same URL (no second paid read). Reach and engagement aren't on a public profile and are never filled in. A failed read (no token, timeout, not found) says "We couldn't read that profile — enter it by hand" and the card is typed by hand. Price recommendation from `src/lib/recommend-price.ts`. Legal details can wait for Settings. |
| Marketplace (brand) | Real: 300 creators ranked by `fitScore()` against the selected campaign, the "Top ranked creators" strip (40) over an "All creators" divider, filters incl. the activity window (last public post), sort/search/pagination in the URL, shortlist, profile modal (Overview / Audience / Content tabs, audience bars, reach chart, Professional profile accordion), "Your selection" and "Make an offer" dialogs creating funded invitations. |
| AI Matching (Nao) | Real ranking; rationale written by the resolved LLM (`claude-sonnet-5` or `gemini-2.5-flash`) when a key is set, otherwise a template built from the fit signals — the UI labels which. Rail: New research, Retry, Undo (previous result set), Stop (discards the run in flight), Apply request; thumbs/copy write a `nao_feedback` row. |
| Campaigns | Real: list, chooser, create-with-AI as a three-question chat (what you sell, the buyer, the goal → draft, with a history rail), start-from-link (URL stored, not fetched — says so), 4-step launch stepper with the pre-spend estimator (`src/lib/estimator.ts`, naano's Q2 2026 benchmarks), brief editor with naano's exact fields, detail tabs (collaborations, brief, shortlist, analytics from rows), delete. |
| Collaborations | Real on both sides: apply, accept/decline, draft, review modal (approve / request changes, capped rounds), schedule, publish with post URL, pay; optimistic UI with rollback; timeline from `collaboration_events`. |
| Messages | Real threads per accepted booking, both sides; NaanoBot is a static placeholder; reactions are visual. |
| Tracking | Real: redirect, pixel, collector, results (with "More metrics & attribution details": clicks by country/referrer, pixel visits/sign-ups/purchases/revenue), per-creator CSV, campaign analytics, creator analytics with an All time / 30 / 90 days period. Post reactions/comments are the creator's recent public-post averages (labelled); naano's own post-metrics import is not built. |
| Billing / earnings | Real ledger: top-ups ("No card — demo top-up"), bookings, payouts, withdrawals (bank transfers sit "In transit" as pending, Stripe settles instantly); wallet chip is a cache of the ledger. Settings › Payments stores the method, account holder and the IBAN's last 4 only. No Stripe Connect, no real bank rail, no invoice PDFs. |
| Settings, team, integrations, community, affiliate, tour | Real screens with real updates (profile incl. X handle, audience, payout details, delete account). Team invites and the Slack community need email/Slack and say so; the MCP endpoint is documented, not served. Affiliate: brands that sign up through a creator's `?ref=` link are attributed; rewards assume a 20% platform commission (naano doesn't publish it) × 25% share for 3 months. Community leaderboard toggles impressions/posts. |
| Assistant | naano's floating glass pill on every page (liquid-gooey for the pill/chevron/bubble morph, framer-motion springs for every open/close/pop, border-beam on the panel while thinking, thinking-orbs where the reply lands, metal-fx ring on the mic), typed messages go to `/api/assistant/chat`: signed in they run the same tools and confirm gate as voice, otherwise a short answer from the provider resolver (claude → gemini → keyless template) over a read-only context (your campaigns/wallet/pending actions, or opportunities/collaborations/earnings; the product, pricing and benchmark numbers when logged out). Conversation kept per tab. cobe globes (creator countries from the seed) on the landing, community and marketplace. |
| Motion (app) | anime.js 4 through one module (`src/lib/motion/anime.ts`: reveal, stagger, countUp, drawPath, enter/exit, timeline — every helper a no-op under `prefers-reduced-motion`): dashboard stat tiles count up, list rows stagger 30ms on load and filter change (marketplace, collaborations, campaigns, opportunities, ledger, click log), the collaboration timeline draws its connector and pops events, the live card flips stats on field changes, the onboarding analyze step runs a timeline, review-draft / add-budget / brief drawer enter and exit with anime, results charts and audience bars draw and fill with anime. Nothing over 800ms. |
| Voice | Real command layer on the floating pill (`src/features/voice`, `docs/voice.md`): Web Speech API by default, Vapi when both keys are set; intents parsed by Claude with structured output or a regex grammar; every tool runs the same server actions as the UI (session + CSRF); money and status changes ask "Confirm?" and wait for a yes. Navigation from a Vapi reply is spoken, not performed (the webhook has no page). |
| Book a call | Removed from the public site (it was naano's booking page). |
| EN / FR toggle | Visual only: FR re-renders the same English strings. Agency mode toggle: visual only. |
| Landing hero + footer | The landing is ours (`src/features/public/components/launch`): a WebGL hero (three.js + one point shader) drawing the trail — the mark's dots as posts, clicks travelling through an audience to the brand's site, sign-ups settling into a ledger column — driven by the demo workspace's real counts from `/api/public/trail` (60 s cache), loaded after first paint, paused off-screen, 60 fps and 0.75× dpr caps, a static SVG under reduced motion / no WebGL; five scroll scenes (the real click, sign-up and paid figures), how to start, pricing, FAQ, sign-up; calm public nav and footer. Two recorded passes and the critique in `docs/design/PAGES.md`. The previous ported effects (video hero, glass cards, ink and gaze footers, LED stage, splash) and their standalone pages are gone. |
| Public site | Landing, for-creators, pricing (with one real paid demo post as the worked example), FAQ, privacy, terms and a 404, in the calm system, copy in `messages/{en,fr}/{landing,public}.json`. No borrowed figures, logos, testimonials or team: /benchmarks, /case-study, /about, /for-agencies and /book-a-call were removed. Public numbers are the seeded demo workspace's, labelled "demo workspace data". `src/app/sitemap.ts` lists the routes. |

Not built: email delivery, Stripe Connect, LinkedIn's own metrics for sponsored posts,
X/YouTube channels, real FR locale, `/api/mcp`, `llms.txt`, blog, free tools and selection-tool pages, cookie banner.

Motion follows naano's own keyframes and easings (`src/app/globals.css`); every animation shows its end state under
`prefers-reduced-motion`.

## Environment

See `.env.example`. `DATABASE_URL` is required for the product to have rows; `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` are optional (AI briefs,
Nao rationale and brand-onboarding profile fall back to templates without it). Vercel sets `VERCEL_GIT_COMMIT_SHA`.
