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

### Opportunities — `/creator/opportunities` (+ brief drawer, apply)
A ranked ledger, not a card grid: open campaigns are compared on the same few facts (fit,
deadline, what they pay), so one row each, best fit first. The fit percentage opens its
four weighted signals in place (DECISIONS: a number you can question); the brief is a
drawer so the list stays put; applying is one confirm showing the price and deadline.

### Collaborations — `/creator/collaborations`
A ruled list, one row per collaboration, led by the **next step and who owns it** instead
of a status name; the default view is Needs you, then Waiting on brand, Live, Done, All
(the filter lives in the URL so the Overview can link to Live). The whole row opens the
collaboration, where the action is.

### Collaboration — `/creator/collaborations/[id]` (shared with the brand side)
Two columns: what to do now (or one line saying what the other side does next), the draft,
the tracked link and the history on the left; where the money is and the offer terms on
the right. The page is the one place a status changes, so the action sits first.

### Analytics — `/creator/analytics`
Five numbers in a row, each opening the rows it is made of (followers → the profile read;
posts, reach, engagements → the posts; clicks → every click), then the tracked links (each
link's count opens its own clicks) and the posts. A range switch re-queries the server.

### Earnings — `/creator/earnings` (+ withdraw)
The one action (Withdraw, disabled with the reason when nothing is available) above four
money numbers — available, awaiting release, withdrawn, earned — each opening the ledger
rows that add up to it, then the months and the ledger itself. Withdrawing is a dialog:
amount or all of it, where it goes, one confirm, and the Stripe stub said plainly.

### Messages — `/creator/messages` (shared with the brand side)
Two panes on wide screens (threads, then the open thread); on a phone they are two screens.
Only real threads — one per accepted collaboration. The canned "support bot" thread that
answered "I can't answer questions in this version" is cut; the assistant is the place to ask.

### Settings — `/creator/settings`
Stacked sections with a sticky index on wide screens, one form per schema. Each section
saves on its own, so a validation error in pricing never blocks the card, and the fields
are the onboarding ones (`src/features/profile-fields`), so editing looks like creating.

## Brand

### Overview — `/brand`
One column: **Needs you** first — drafts to review, applicants to answer, live posts to pay,
and a short wallet on top because it blocks every new invitation — each a ruled row with the
next step in words and the button for it. Then three numbers (clicks, attributed sign-ups,
committed spend), each opening the rows it is made of. The setup card shows only while
setup is unfinished. People open the app to act; totals come second.

### Collaborations — `/brand/collaborations`
The same ruled list as the creator side, from the brand's chair: creator, **next step and
whose move it is**, due date, fee. Default view Needs you, then Waiting on creators, Done,
All (a live post counts as Needs you — releasing the payment is the brand's move); a
campaign filter appears once there is more than one campaign. Status names are chips, not
the headline.

### Results — `/brand/results`
The proof page, top to bottom in the order a skeptic asks: four numbers that each open their
rows (estimated reach, qualified clicks, attributed sign-ups, committed spend), the pixel's
status in one line, clicks over time, attribution per creator (each row exports its own
clicks), live posts, and the raw click log with the CSV of every click. The old "more
metrics" accordion is gone: the click log already carries referrer, device and country.

### Billing — `/brand/billing`
Four amounts in the order money moves — available, **held for invitations nobody has
answered yet**, committed to accepted work, paid to creators — then the ledger, filterable
by bookings and top-ups. Held funds stay visible until the creator accepts (a decline returns
them). The top-up is presets plus a custom amount and says plainly that no card is charged.

### Messages — `/brand/messages`
Two panes on wide screens (threads, open conversation), two screens on a phone. One
thread per collaboration, opened when a booking is accepted — no separate inbox objects
to manage. The components are shared with the creator side (the motion stream restyled
them); the brand page adds its header and a campaign filter.

## Public

Recordings for the landing live in `docs/design/recordings/` (a frame every
~300 ms while scrolling like a person: a flick, a pause to read). The landing
gets two passes: v1, an honest critique after watching it, then v2 answering
each point.

### Landing — `/`

**Why this layout.** The landing is the one place that performs
(DIRECTION.md, "The landing is the launch"). It has one sentence to carry —
every click and sign-up comes back as a row, to the post and the creator
behind it — so the page is that sentence told as scenes, one idea per
screen, then the four calm blocks a buyer needs before signing up (how to
start, what it costs, questions, sign up). The hero's live drawing uses the
mark's own shape and the demo workspace's real counts, so the first thing a
visitor sees is the product's claim being acted out with real numbers,
labelled as demo data.

#### v1 critique (recordings: `landing-v1-1440.mp4`, `landing-v1-375.mp4`)

Watched at 1440 and 375. What drags, what's boring, what a ten-year-old
would skip:

1. **The hero drawing reads as a wireframe, not a story.** Straight lines
   fan from three dots into a grey diamond. It looks like a network diagram
   from a slide deck; nothing says "a post, then clicks, then sign-ups".
   The particles are tiny and sparse — you have to look for them.
2. **The ledger column is missing.** Only one green dot shows at the far
   right. The row bars don't render at all (the planes face away from the
   flipped orthographic camera, so they're culled), and sign-ups arrive so
   rarely that the column never fills. The payoff of the hero is invisible.
3. **The real numbers are whispered.** "4 posts → 9 tracked links → 640
   clicks → 8 sign-ups" is the most honest, interesting thing on the page
   and it sits at body size at the bottom, half under the assistant pill.
4. **Six scenes at 88% of the screen each is a long, repetitive walk.**
   Text left / small visual right, alternating, six times. Most of each
   screen is empty paper; the visuals are 400px wide in a 1440 window. By
   scene 3 the pattern is obvious and the thumb speeds up.
5. **Empty frames while scrolling.** Headlines only start to land when the
   scene is half in view, so a normal flick shows blank screens and
   half-cut words ("It reaches the right…") for a beat. That's dead air.
6. **"It reaches the right people" is the scene a ten-year-old skips.**
   Rings of dots around a dot, abstract, no payoff. It's the same idea as
   "a post goes out" and should be one beat.
7. **The click rows say nothing.** Four identical "click · linkedin.com"
   rows; a real ledger row has something to read.
8. **Scene 5 (every row has a name) is small.** A short list in a card —
   the moment the story is about (a sign-up gets a name) is the least
   dramatic visual.
9. **The bill and the proof sit side by side but don't touch.** The ink
   beat is the strongest screen, but nothing connects the money to the
   result — the trail motif is missing exactly where it matters most.
10. **Phones: the drawing collides with the text.** At 375 the network
    lands on top of the counts line in the hero; scenes keep their tall
    minimum height, so there are screen-high gaps of paper between them.
11. **Small details.** "Free" is set in the mono number face; the
    assistant pill covers the hero's last line at 1440; scenes don't tell
    you where you are in the story.

What works and stays: the headline at full size landing word by word, the
count-up on 640 clicks and 8 sign-ups, the ink "bill next to the proof"
beat, the calm closing blocks, the honest pricing and FAQ.

#### v2 — each point answered (recordings: `landing-v2-1440.mp4`, `landing-v2-375.mp4`)

1. **Wireframe → story.** Paths are curves (post → person → site) at 7%
   ink instead of straight 9% lines; the mark's own line joins the three
   post dots so the logo is visibly where it starts; small captions pin
   "posts", "your site" and "sign-ups → rows" to the drawing. Particles are
   bigger (8/13px) and faster; a sign-up turns green a third of the way in
   and the site node flashes green when one lands.
2. **The ledger column shows.** Rows render (double-sided, never
   frustum-culled) and the column prints its real rows — one per demo
   sign-up, 8 today — in the first seconds, then keeps flashing as more
   arrive at the real share.
3. **The numbers are the loudest thing after the headline.** The four
   counts are a ledger row: 32px mono numbers, hairlines between, sign-ups
   in green, a live dot next to "demo workspace data", above the assistant
   pill at 1440×900. The headline fits two lines (112px), so the whole row
   is above the fold.
4. **Five beats, not six, and shorter.** "It reaches the right people" is
   folded into "a post goes out" (the audience rings now light up around
   the post card). Scenes are ~72% of the screen on desktop and content
   height on phones; the page is 7,090px at 1440 (was 8,517).
5. **No dead air.** Headlines start landing when 15% of the scene is in
   view (was 50%), scenes switch on at 20%, so a normal flick never shows a
   blank screen.
6. **You always know where you are.** A rail of five dots on one line —
   the mark's trail again — sits on the left edge on wide screens; the line
   fills as you go and the current beat is green.
7. **Rows say something.** Click rows carry the click's own number
   (#640, #639…), the tracked link and the source; ledger rows carry the
   creator's initial and name, and the paid row slams a PAID stamp.
8. **The bill is joined to the proof.** A green trail draws across the
   divider from the money to the result, dot by dot.
9. **Phones.** The drawing has its own band under the text (no overlap),
   the click rows drop the link column, visuals fill the width.
10. **Small details.** "Free" is no longer set in the number face; the
    bill line says how many posts it paid for; tapping the drawing sends a
    burst of clicks (and the hint says so).

**Still open (next pass, not blocking):** the audience rings in scene 1 are
decorative rather than data; the scenes' visuals don't yet react to the
cursor the way the hero does; FR copy runs ~15% longer and should be
checked for widows at 375.

### For creators — `/for-creators`
A creator's path in the order they live it: four ruled steps with the trail
running through their numbers (the last dot green — paid), then the card
brands will see, drawn from a real demo creator and labelled as demo data,
then how the money moves with the Stripe stub said plainly, then one way in.
No logo strip and no earnings claims: we can't back them.

### Pricing — `/pricing`
There are two prices, so the page is two plans side by side and nothing
else competing. Under them, one worked example from the demo workspace — a
single paid post, its fee, the clicks on its link, the sign-ups they became
— because "pay per post" only means something next to what one post
returns. Then the four things you never pay for, and the stub note.

### FAQ — `/faq`
Brands and creators ask different things, so a tab splits the two lists
instead of interleaving twelve questions. Each question is a ruled row that
opens in place (native details), one answer at a time, then a short
"still weighing it up?" block with the one next step.

### Privacy and Terms — `/privacy`, `/terms`
Documents, not pages: sections at reading width, a sticky "on this page"
index on wide screens, the date at the top. The copy states what this build
actually stores and that money doesn't move.

## Auth

### Sign in, sign up, forgot, reset — `/login`, `/register[/brand|/creator]`, `/forgot-password`, `/reset-password/[token]`
One centred column (DIRECTION.md), no second pane: the lockup home, the
form, quiet legal links. Sign-in puts the two demo accounts first, in their
own box, because they are the fastest honest way to see the product; email
and password follow. Sign-up picks the role with a segmented control instead
of a choice page, and the step rail above it shows the whole path for that
role (brand: account → website → profile; creator: account → LinkedIn →
card → price → legal) — onboarding carries on the same rail. The fake
"continue with Google/LinkedIn" buttons are gone: there is no OAuth here.
Forgot-password always shows the reset link on screen, labelled by whether
it was also emailed. Validation messages are translated; server messages
(wrong password, email taken) are the server's own English for now.

## Brand

### Settings — `/brand/settings`
Same shape as the creator's: an index and one form per schema — Company (name, website),
Ideal customers (the onboarding value proposition and three customers, saved through
onboarding's own action), Audience (industries and regions onboarding doesn't ask), Account.
The Team section is cut: it validated an email and then said no invitation was sent.

## Assistant and call mode (every surface)
A calm pill at the bottom — type or talk — with the conversation above it and a corner
button when hidden. The mark's three dots are its state: still, bouncing while it listens,
pulsing while it thinks. Call mode is a full page on paper with the mark as the voice
visualiser (each dot grows with the live mic level), the transcript, mute, end, or type.
Same brain: tools go through the confirm gate, so anything that moves money or changes a
collaboration is described and waits for "yes".

## Real vs stubbed

| Where | What | Status |
|---|---|---|
| LinkedIn profile read (`readLinkedinProfile`) | audience figures derived from the URL | stub, labelled in Settings › LinkedIn ("simulated from the URL") — the fork is replacing it with a real import |
| Stripe payout method (Settings › Payouts, Earnings › Withdraw) | no Stripe Connect; the ledger records the withdrawal | allowed stub, labelled in both places |
| Creator card figures (My card, `/c/[handle]`) | followers, views, engagement, audience mix come from the (simulated) profile read | labelled under the card; seeded creators carry a "demo creator" note on the public page |
| Affiliate "invite creators" tab, community Slack button | "not part of this build" | cut with their pages |
| Brand settings › Team (`TeamAccessPanel`) | accepted an email, sent nothing ("email isn't connected") | cut from Settings; still used by `/brand/invite` (builder's, being folded into Creators) |
| Messages "support bot" thread | a fake conversation with a canned reply | cut; `/…/messages/support-bot` now 404s |
| Brand wallet top-up (Billing) | no Stripe; the credit is a ledger row | stub, the dialog says "no card is charged" |
| Launch estimator (Campaigns) | rates from Amplio's own live posts, clicks and attributed sign-ups | real; below 3 live posts / 30 clicks it says "not enough data yet" |
