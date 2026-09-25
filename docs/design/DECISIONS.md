# Product decisions — what we changed, cut and made easier

8x asked to see how we take a product as a reference and make our own decisions. This
is the list. Each one names what the reference does, what Amplio does instead, and why.
The walkthrough follows this page.

## The one change everything else follows

**Every number is a receipt.** The reference's weakest point is attribution: brands are
shown estimated reach and asked to trust it. Amplio makes every metric (clicks, leads,
cost per lead, earnings, spend) open the rows it is made of — timestamp, creator, post,
referrer, device. If a number can't be traced to rows, it isn't shown.

## Changed

| Reference | Amplio | Why |
|---|---|---|
| Overview = a dashboard of totals | Overview = **Needs you**: the few things waiting on this person (a draft to review, an invitation, a payout), then three numbers | People open the app to act, not to read totals |
| Collaborations shown by status (8 states, 6 tabs) | Each row shows **the next action and who owns it** ("Draft ready — you review", "Waiting for Josiah's draft") | The status name tells you nothing; the next action does |
| Fit score as a percentage | Fit score **with its four signals and a one-line reason**, opened in place | A number you can't question is a number you can't trust |
| Booking a creator = sending a request | Booking = a **funded invitation**: the fee is held from the wallet and shown as held until the creator accepts | Both sides see the money is real before anyone writes a word |
| Two-pane sign-up with marketing copy | One column, role picked first, progress rail on top | Fewer things to read before you're in |
| Five-step "how it works" | Three steps: brief → approve → trace | The other two were the same step twice |

## Cut

| Cut | Why |
|---|---|
| Benchmarks page, case study, customer logos, testimonials, "about" team | They were the reference's data and people, not ours. We show only what our own database can back |
| Agency mode switch | It was visual only; a switch that does nothing is worse than no switch |
| MCP / "connect your AI" integration pages | The endpoint isn't served; documenting it as a feature was a claim we couldn't keep |
| Creator community leaderboard | Ranking creators against each other doesn't help anyone get or finish a deal |
| Guided tour | Replaced by empty states that say what to do next, where you already are |
| Book-a-call pages | No calendar behind them |
| Cinematic landing effects (video scrub, glass, splash) | They slowed the first paint and said nothing about the product |
| Start a campaign from your link | The link was never read: the brief came from the workspace profile, so the path promised something it didn't do |
| Team invite panel | It took an email and sent nothing. There are no seats behind it |
| The support-bot thread in Messages | A canned conversation that answered every question with "I can't answer that yet". The assistant does that job, from real data |
| "Continue with Google / LinkedIn" on sign-up | There is no OAuth behind them |

## Stopped pretending

Claims the reference made that we couldn't back, so we took them out rather than fake them.

| Was | Now | Why |
|---|---|---|
| "Has 48 hours to accept" on every invitation | "Asked to answer by {date}" | Nothing expires an invitation; the date is a request, not a rule |
| A 2-second "thinking" pause after the matching answer had already arrived | The answer shows when it's ready | The delay was theatre |
| Thumbs up/down on a match "to improve your results" | Thumbs say "noted" | The feedback is stored but doesn't steer the ranking, so it doesn't claim to |
| "A human replies within a business day" | Removed | No one is on the other end |
| Launch estimate from the reference's published benchmarks | Estimate from our own live posts, with the sample size; "not enough data yet" below 3 posts / 30 clicks | A number from someone else's customers isn't a forecast for yours |
| Logged-out assistant quoting benchmark figures | Answers from a checked list of product facts | Every figure it says has to exist in our data |

## Merged

- Creator **affiliate program** folded into **My card**: one place for "your links" (deal link + referral link).
- Brand **Invite creators** becomes an action on the Creators page, not a separate tab.

## Made easier to use

- **⌘K** from anywhere: jump to a creator, a campaign, a collaboration, or run an action.
- **The assistant** does what the buttons do (by text or voice) and asks before anything that moves money or changes a collaboration.
- **Empty states** always say the next step and have the button for it.
- **One set of fields**: onboarding and settings use the same components, so editing looks like creating.
- **English and French** throughout.

## Kept on purpose

The marketplace idea, the approval-before-publish rule, the tracked link + pixel, and the
wallet/ledger. They are the product; the interface around them is what we rebuilt.

## Honest stubs

Stripe (the ledger stands in), LinkedIn profile import (simulated from the URL). The UI
says so where they appear.
