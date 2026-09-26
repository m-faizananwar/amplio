# Plan — recon before code (2026-09-12)

## 1. Data model

All tables: `id, created_at, updated_at`; money in integer cents (EUR).

- **users** (email, password_hash, role `brand|creator`, first/last name) · **sessions** (token_hash, expires_at)
- **brands** (owner user, company, website, value_prop, icps[3], target_industries[], target_regions[], wallet_cents, pixel_site_key)
- **creators** (user, linkedin_url, headline, bio, country, industries ≤3, followers, price_cents, bundles[], median_views,
  engagement_rate, posts_per_month, audience_job_titles{}, audience_seniority{})
- **campaigns** (brand, name, status `draft|active|completed`, open_to_applications, post_deadline, default_fee_cents,
  brief jsonb in the editor's exact shape: what_to_tell, target_industries, target_geos, tone, do[], avoid[], links[],
  angles[{angle, hook, direction, example}])
- **collaborations** (campaign, creator, origin `invitation|application`, status, fee_cents, due_date, revision_round,
  draft_text, post_url, scheduled_at, published_at, paid_at) — unique (campaign, creator)
- **collaboration_events** (collaboration, from, to, actor `brand|creator|system`, note) — written by every `transition()`
- **tracking_links** (collaboration, code unique+indexed, destination) · **clicks** (tracking_link, ts, ip_hash, ua, referrer)
- **pixel_events** (brand via site_key, type `visit|signup|purchase`, value_cents, click nullable, ts)
- **ledger** (brand or creator, type `topup|booking|payout|withdrawal`, amount_cents, collaboration nullable, status) —
  wallet balance, earnings, invoices are all views over it
- **shortlist** (brand, creator) · **messages** (collaboration, sender, body)

Relations: brand 1‑n campaigns 1‑n collaborations n‑1 creators; collaboration 1‑1 tracking_link 1‑n clicks; ledger rows
point at collaborations. `fitScore(creator, campaign)` is computed, never stored: audience overlap (job titles vs ICP),
category match (industries), engagement quality, posting consistency — each a signal with a one‑line reason.

### Collaboration state machine (only what the first build needs)

| from | to | who |
| --- | --- | --- |
| — | `invited` | brand ("Invite a creator" / "Collaborate with X") |
| — | `applied` | creator ("Apply" on an open campaign) |
| `invited` | `accepted` / `declined` | creator |
| `applied` | `accepted` / `declined` | brand |
| `accepted` | `draft_submitted` | creator ("Draft ready") |
| `draft_submitted` | `approved` | brand ("Review LinkedIn post" → approve) |
| `draft_submitted` | `changes_requested` | brand (same modal: "or requesting changes"; bounded by revision rounds) |
| `changes_requested` | `draft_submitted` | creator (round + 1) |
| `approved` | `scheduled` | creator (sets publish date) |
| `scheduled` | `live` | creator (submits post URL — no LinkedIn API, so self‑reported) |
| `live` | `paid` | system when the wallet covers the fee ("Payment scheduled · Handled by Amplio"); brand "Pay" if it was short |

`declined` and `paid` are terminal. Tab mapping — brand: Invitations sent = `invited`, Invitations received = `applied`,
To do = `draft_submitted`, Completed = `paid`; creator: Needs action = `invited ∪ changes_requested ∪ approved`,
Applications sent = `applied`. Not modelled in the first build: withdraw/cancel after acceptance, disputes, refunds.

## 2. Build order (sorted by what a first-time visitor clicks first)

1. Docker Postgres, schema, seed — demo brand mid‑campaign with a collaboration in every state, ~40 creators with
   audience snapshots, click history. Every screen shows real rows from hour 2; empty states are the bug here.
2. Own auth + both app shells with every sidebar tab routed (thin, but real loading/empty/error states) — a visitor
   clicks every tab; nothing may 404.
3. Login page with "Enter as demo brand / demo creator" — visitors won't sign up.
4. Landing page, one pass — it's the first paint; hero, how‑it‑works, results, pricing, FAQ.
5. Brand › Creators: cards (fit %, CPM, median views, filters/sort) + profile modal (audience snapshot, Book) + shortlist —
   the product's thumbnail.
6. Brand › Campaigns: create with AI brief (template fallback) → brief editor → invite creator ⇒ `invited`.
7. Creator › Opportunities + brief drawer + Apply; Collaborations with the six tabs; collaboration detail = state‑machine actions.
8. Brand › Collaborations + review‑draft modal (approve / request changes) + pay ⇒ ledger. Creator: schedule → live.
   The loop closes here; everything after is leverage.
9. Tracking link per collaboration, `/r/[code]` (one insert, one 302), Results (clicks by creator), creator Analytics
   from the same table — numbers move when a visitor clicks.
10. Billing (top‑up, ledger table) + Earnings (from ledger, withdraw) — money shows up on both sides.
11. Creator onboarding with the live card + `recommendPrice` + bundles; brand onboarding (site → value prop → ICPs →
    starter brief). Showy and cheap, but after the loop.
12. Attribution layer: click log + CSV export per creator · `/n.js` pixel on a demo landing page
    · fit % broken into signals + reason · pre‑spend estimator from tier CTR × vertical CPL with a confidence label.
13. Thin tabs filled: Messages (real thread per accepted collab), Community (leaderboard from seed), Affiliate (link +
    zeros), Settings, Integrations (static), notifications.
14. Amp matching chat over the fit‑scored top‑N, with fallback — last.

Deliberately out: Stripe, email + 6‑digit codes, LinkedIn/Apify import, X/YouTube, FR, agency mode, MCP endpoint,
calendar booking, invoice PDFs, team invites, cookie banner, the floating AI pill (static decoration at most).

## 3. The trap

A new account is empty. Designing screen by screen from that state yields a product made of empty states, and the reflex
is to fill the dashboards with hardcoded numbers — which reproduces the common weakness of tools in this space
(attribution nobody can audit) instead of beating it. Two halves: (a) the loop is two‑sided, so every brand action needs a creator counterpart
screen — brand‑only progress is "100% of a landing page"; (b) any number on a dashboard must come from a row a visitor
can create by clicking a tracking link. Seed + state machine + one click table are the product; the AI brief and the
marketplace gloss are the paint.
