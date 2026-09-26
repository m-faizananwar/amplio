# Product decisions — what we changed, cut and made easier

These are the product decisions behind Amplio. Each one names the usual way
creator-marketplace tools do it, what Amplio does instead, and why. The walkthrough
follows this page.

## The one change everything else follows

**Every number is a receipt.** Attribution is where most creator-marketplace tools are
weakest: brands are shown estimated reach and asked to trust it. Amplio makes every
metric (clicks, leads, cost per lead, earnings, spend) open the rows it is made of —
timestamp, creator, post, referrer, device. If a number can't be traced to rows, it isn't shown.

## Changed

| The usual way | Amplio | Why |
|---|---|---|
| Most tools open on a dashboard of totals | Overview = **Needs you**: the few things waiting on this person (a draft to review, an invitation, a payout), then three numbers | People open the app to act, not to read totals |
| Collaborations are filed by status name, with a tab per state | Each row shows **the next action and who owns it** ("Draft ready — you review", "Waiting for Josiah's draft") | The status name tells you nothing; the next action does |
| Fit is a bare percentage | Fit score **with its four signals and a one-line reason**, opened in place | A number you can't question is a number you can't trust |
| Booking a creator means sending a request | Booking = a **funded invitation**: the fee is held from the wallet and shown as held until the creator accepts | Both sides see the money is real before anyone writes a word |
| Sign-up is two panes, one of them marketing copy | One column, role picked first, progress rail on top | Fewer things to read before you're in |
| A five-step "how it works" | Three steps: brief → approve → trace | In the usual five, two are the same step twice |

## Cut

| Cut | Why |
|---|---|
| Benchmarks page, case study, customer logos, testimonials, "about" team | We have no benchmarks, customers or team to show yet, and we don't invent them. We show only what our own database can back |
| Agency mode switch | It was visual only; a switch that does nothing is worse than no switch |
| MCP / "connect your AI" integration pages | The endpoint isn't served; documenting it as a feature was a claim we couldn't keep |
| Creator community leaderboard | Ranking creators against each other doesn't help anyone get or finish a deal |
| Guided tour | Replaced by empty states that say what to do next, where you already are |
| Book-a-call pages | No calendar behind them |
| Cinematic landing effects (video scrub, splash, glass cards everywhere) | They slowed the first paint and said nothing about the product. Glass and a background clip came back on 26 September in one place only — the landing's first screen and the public header — built to a measured spec with its costs held: the poster is the LCP, the clip never loads on phones, Save-Data, small CPUs or reduced motion, and Lighthouse mobile stays ≥ 90 ("Brought back" below) |
| Start a campaign from your link | The link was never read: the brief came from the workspace profile, so the path promised something it didn't do |
| Team invite panel | It took an email and sent nothing. There are no seats behind it |
| The support-bot thread in Messages | A canned conversation that answered every question with "I can't answer that yet". The assistant does that job, from real data |
| "Continue with Google / LinkedIn" on sign-up | There is no OAuth behind them |

## Brought back

| What | Why it came back | What keeps it honest |
|---|---|---|
| A glass first screen: a pale plate (a glass sphere cut by a glass blade, a slow 10 s clip), a glass panel, glass pills | The first screen now says the product's line in one sentence and puts the demo workspace's own counts beside it; the WebGL drawing acted the same counts out and cost phones the most | The numbers are the database's (`getPublicTrail`, the source of `/api/public/trail`), labelled "demo workspace data"; the poster (18 KB) is the LCP and the clip attaches on idle, desktop only; three.js is gone from the bundle |
| The compressing header with a sliding capsule | One header for every public page that says where you are and gets out of the way | It's the same markup transparent or frosted; the burger menu is a real button with aria-expanded, Escape and focus return |
| The first version's interaction language on the public pages (spring pops, cards and buttons that invert, arrow nudge) | a2e204b removed it everywhere because it fought the app's primitives; on the public pages it never did, and they felt flat without it | Scoped to the public site (the last section of `src/styles/interaction.css`); the app keeps the ledger motion; reduced motion shows final states |

## Stopped pretending

Claims we couldn't back, so we took them out rather than fake them.

| Was | Now | Why |
|---|---|---|
| "Has 48 hours to accept" on every invitation | "Asked to answer by {date}" | Nothing expires an invitation; the date is a request, not a rule |
| A 2-second "thinking" pause after the matching answer had already arrived | The answer shows when it's ready | The delay was theatre |
| Thumbs up/down on a match "to improve your results" | Thumbs say "noted" | The feedback is stored but doesn't steer the ranking, so it doesn't claim to |
| "A human replies within a business day" | Removed | No one is on the other end |
| Launch estimate from published industry benchmarks | Estimate from our own live posts, with the sample size; "not enough data yet" below 3 posts / 30 clicks | A number from someone else's customers isn't a forecast for yours |
| Logged-out assistant quoting benchmark figures | Answers from a checked list of product facts | Every figure it says has to exist in our data |
| A coin that splits into "the creator's share and the fee" | The brand pays the creator's price, the creator is paid in full, the fee reads €0 | That's what the ledger does; there is no cut in this build |
| Borrowed figures, customer logos, testimonials and team on the public pages | Public numbers from the seeded demo workspace, labelled as such; the pages that carried the rest are gone | None of it was ours |
| A LinkedIn "import" that made up followers, views and engagement from the URL | A real read of the public profile; reach and engagement aren't on it, so they stay blank | A number we didn't read isn't one we show |

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
wallet/ledger. They are the product; the interface around them is where the decisions above apply.

## Honest stubs

Stripe (the ledger stands in). The UI says so where it appears. The LinkedIn profile
import is real now (Apify, pinned actor); a profile it can't read is entered by hand.

