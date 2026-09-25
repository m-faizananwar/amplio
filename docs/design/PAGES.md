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

## Real vs stubbed

| Where | What | Status |
|---|---|---|
| LinkedIn profile read (`readLinkedinProfile`) | audience figures derived from the URL | stub, labelled in Settings › LinkedIn ("simulated from the URL") — the fork is replacing it with a real import |
| Stripe payout method (Settings › Payouts) | no Stripe Connect; the ledger records the withdrawal | allowed stub, labelled in the section |
| Creator card figures (My card, `/c/[handle]`) | followers, views, engagement, audience mix come from the (simulated) profile read | labelled under the card; seeded creators carry a "demo creator" note on the public page |
| Affiliate "invite creators" tab, community Slack button | "not part of this build" | cut with their pages |
