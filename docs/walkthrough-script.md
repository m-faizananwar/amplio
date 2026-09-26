# Walkthrough — Amplio, redesigned (under 5 minutes, camera on)

One take at 1440 wide, English, light theme. Two tabs ready: https://amplio-mvp.vercel.app
(signed out) and the repo on GitHub open at `docs/design/DECISIONS.md`. Talk like you're
showing a colleague what you decided and why. One decision per scene.

**Don't click Review, Decide or Release on camera** — the reviewers use the same demo
accounts, and those buttons change their data. Open things, read them, move on.

## 0:00 – 0:25 · the one idea
"Amplio is a marketplace where B2B brands pay LinkedIn creators for posts. I used naano as
the reference product, not the blueprint. What I thought was wrong with it: brands are
shown estimated reach and asked to trust it. So the one idea behind every screen here is
that **every number is a receipt** — a click, a sign-up, a payout is a row you can open."

## 0:25 – 1:10 · landing
Let the entrance finish (about two seconds), then scroll at reading speed.
"The first screen says the one line — every click comes back — and puts the demo
workspace's real posts, links, clicks and sign-ups beside it, labelled as demo data; the
two big numbers count up to the database's values. The page tells one story as you scroll: a post goes out,
clicks fly into the tracked link, sign-ups drop into a ledger with names on the rows, and
the bill locks next to the proof." At the pricing block: "the coin goes whole to the
creator and the fee reads €0 — because that's what the ledger does, so that's what the
page says." Point at the round button bottom-right: "the assistant waits in the corner on
public pages, so it never sits on the content" (on a phone it steps aside while the hero is
at the top). Then: "What I cut from the reference —
their benchmark figures, customer logos, testimonials — none of that was ours."

## 1:10 – 1:35 · sign-up, honestly
Open Sign up → flip the Brand / Creator switch → back. Sign in → **Open the demo brand**.
"One column, role first, and the steps ahead on one line. Brand onboarding reads your
website and an AI drafts your value proposition and ideal customers on the same screen,
editable. For creators the LinkedIn import is a real read of the public profile — if it
can't read it, it says so and you type it in. It never invents a number."

## 1:35 – 2:35 · brand side: what changed
- **Overview:** "The reference opens on a dashboard of totals. People open the app to
  act, so the first thing is *Needs you* — Esmeralda's draft to review, Ethyl's
  application to decide, Althea's and Tom's payments to release — then the numbers."
- Click **Show rows** under *Clicks on tracked links*: the drawer lists every click. "This
  is the receipt." Close it.
- **Collaborations:** "Every row says the next step and who owns it, instead of a status name."
- **Creators:** open a fit score. "A percentage you can't question is one you can't trust —
  it opens its four signals and a reason."
- **Campaigns → a campaign's launch:** "The estimate is built from our own live posts, with
  the sample size shown. With too little data it says so."
- **Billing:** "Available, held until the creator answers, committed, paid — and the ledger
  with a reference on every line." (Releasing a payment is two clicks: it arms, then asks.)

## 2:35 – 3:15 · creator side
Top bar: switch **Brand → Creator** (demo accounts only). Overview: "*Needs you* again —
changes Premium Inboxes asked for, a draft to write for Zune, money to withdraw." Open
**Earnings**: "each amount has *See the rows*." **My card**: "the card brands see, and the
deal and referral links live here now — I merged the affiliate page in."

## 3:15 – 3:45 · stopped pretending
GitHub tab → `DECISIONS.md` → *Stopped pretending*.
"Some cuts weren't design, they were honesty: a '48 hours to accept' nothing enforced, a
two-second 'thinking' pause after the answer had arrived, thumbs that claimed to improve
results, 'a human replies within a business day' with nobody there, and an estimate built
from someone else's benchmarks. The fee shows €0 because we take none. Card top-ups and
bank payouts are the stubs left, and the product says so where they appear."

## 3:45 – 4:20 · the assistant and how it was built
Back in the app, open the assistant, ask "what needs me today?" — it answers from the
workspace. "Same actions as the buttons, and it asks before anything that moves money or
changes a collaboration." Then the repo: `.agent-logs/`. "I ran this as one orchestrating
Claude session and three builders in parallel. I set the direction and the decisions,
they built, and every change was checked on the live site. Every prompt is in these logs."

## 4:20 – 4:40 · close
"The idea and the backend are the same — a real Postgres database, real tracking, a real
LinkedIn import. The interface and the product decisions are ours."

## Before you hit record
- Private window, 1440 wide, English, light theme. `/api/health` is 200.
- Walk the demo brand and creator once off camera, read-only, so the names are fresh.
- Loom: mic on, camera on. Aim for 4:30, never past 4:55.
