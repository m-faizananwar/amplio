# Pages — layout and why

One or two lines per page: the layout chosen for what the page shows, and why. Screens
at 1440 and 375 live in `docs/design/screens/`. Each builder appends their own pages.

## Creator

### Overview — `/creator`
A single column: **Needs you** (ruled rows, most urgent first, one button each), then
three numbers. People open the app to act; the list answers "what do I do now" before
any total, and each number leads to the rows it is made of.

### My card — `/creator/card` (+ public `/c/[handle]`)
Two columns: the card exactly as brands see it on the left, "Your links" on the right
(deal link, referral link, what referrals earned, the brands introduced). The affiliate
program was a separate page saying the same thing twice; one place for your links is enough.
The public page is the same card in one column with the single action a brand came for,
and seeded creators are labelled as demo data.

### Opportunities —  (+ brief drawer, apply)
A ranked ledger, not a card grid: open campaigns are compared on the same few facts (fit,
deadline, what they pay), so one row each, best fit first. The fit percentage opens its
four weighted signals in place (DECISIONS: a number you can question); the brief is a
drawer so the list stays put; applying is one confirm showing the price and deadline.

### Settings — `/creator/settings`
Stacked sections with a sticky index on wide screens, one form per schema. Each section
saves on its own, so a validation error in pricing never blocks the card, and the fields
are the onboarding ones (`src/features/profile-fields`), so editing looks like creating.

## Real vs stubbed

| Where | What | Status |
|---|---|---|
| LinkedIn profile read (`readLinkedinProfile`) | audience figures derived from the URL | stub, labelled in Settings › LinkedIn ("simulated from the URL") — the fork is replacing it with a real import |
| Stripe payout method (Settings › Payouts) | no Stripe Connect; the ledger records the withdrawal | allowed stub, labelled in the section |
| Creator card figures (My card, `/c/[handle]`) | followers, views, engagement, audience mix come from the (simulated) profile read | labelled under the card; seeded creators carry a "demo creator" note on the public page |
| Affiliate "invite creators" tab, community Slack button | "not part of this build" | cut with their pages |
