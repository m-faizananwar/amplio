# Pages — layout and why

One or two lines per page: the layout chosen for what the page shows, and why. Screens
at 1440 and 375 live in `docs/design/screens/`. Each builder appends their own pages.

## Creator

### Overview — `/creator`
A single column: **Needs you** (ruled rows, most urgent first, one button each), then
three numbers. People open the app to act; the list answers "what do I do now" before
any total, and each number leads to the rows it is made of.
**Merged (components round):** the ring widget sits beside Needs you: every collaboration by
state (needs you, waiting on the brand, live, done), each arc opening that filter. It
replaces nothing on screen but answers "where does everything stand" that the list alone
couldn't, so the page stays two blocks (what needs you + where things stand) above three numbers.

### My card — `/creator/card` (+ public `/c/[handle]`)
Two columns: the card exactly as brands see it on the left, "Your links" on the right
(deal link, referral link, the brands it brought in and what they have booked). The affiliate
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
One chart card, then the tracked links. The five figures (followers, posts, reach,
engagements, clicks) sit along the top of the card as a strip; picking one draws its line
below (clicks per day, or post by post) and "See the rows" opens what it is made of.
Followers is one reading, so it says so instead of drawing a flat line. Each link's count
opens its own clicks. A range switch re-queries the server.
**Merged (components round):** five stat cards, the posts table and the links were three
blocks saying "how am I doing"; the figures became the chart's picker and the posts became
its points and rows, so the page is one card that answers it plus the links you act on.

### Earnings — `/creator/earnings` (+ withdraw)
One balance card, then the ledger. The card leads with what's available and the one
action that moves it (Withdraw, disabled with the reason when nothing is available), a
ruled strip of the three figures around it (awaiting release, withdrawn, earned), and the
months as bars on a baseline; every figure opens the ledger rows that add up to it.
**Merged (components round):** a Withdraw row, four stat cards and a separate month chart
were three blocks about one balance; now it is one card, and the ledger is the detail. Withdrawing is a dialog:
amount or all of it, where it goes, one confirm, and the Stripe stub said plainly.

### Messages — `/creator/messages` (shared with the brand side)
Two panes on wide screens (threads, then the open thread); on a phone they are two screens.
Only real threads — one per accepted collaboration. The canned "support bot" thread that
answered "I can't answer questions in this version" is cut; the assistant is the place to ask.

### Settings — `/creator/settings`
Five sections with a sticky index on wide screens: your card, LinkedIn, pricing, getting
paid, account. Each section saves on its own, so a validation error in pricing never blocks
the card, and the fields are the onboarding ones (`src/features/profile-fields`), so editing
looks like creating.
**Merged (components round):** "You" (name) and "Card" (headline, country, industries) were
one thing — what brands see — split by the database, so they are one form that saves
through both actions; "Business details" and "Payouts" are one "Getting paid" section. 7 → 5.

## Brand

### Overview — `/brand`
One column: **Needs you** first — drafts to review, applicants to answer, live posts to pay,
and a short wallet on top because it blocks every new invitation — each a ruled row with the
next step in words and the button for it, the state drawn on the creator's avatar
(envelope, pen, pulse…) so the kind of work reads before the words. Then three numbers (clicks, attributed sign-ups,
committed spend), each opening the rows it is made of. The setup card shows only while
setup is unfinished. People open the app to act; totals come second.
**Merged (components round):** the two stacked sections became one screen: Needs you beside the
ring widget (every collaboration by whose move it is — needs you, waiting on creators, done —
the same grouping and counts as the list and the Collaborations tabs, each arc opening that tab),
the three numbers under both. The ring answers "how is it all going" without a second list.

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
**Merged (components round):** six blocks became three — the four numbers, one chart card with
the pixel status in its footer (the pixel is what makes the chart's sign-ups possible), and the
per-creator table. The live-posts list and the click log were cut as sections: the reach and
clicks numbers already open exactly those rows, with the CSV.

### Billing — `/brand/billing`
Four amounts in the order money moves — available, **held for invitations nobody has
answered yet**, committed to accepted work, paid to creators — then the ledger, filterable
by bookings and top-ups. Held funds stay visible until the creator accepts (a decline returns
them). The top-up is presets plus a custom amount and says plainly that no card is charged.
**Merged (components round):** four amount cards became one balance card — available large with
the money Top up beside it, then held · committed · paid as one strip in the order money moves —
then the ledger. Four equal cards made the spendable balance look like one number among four.

### Creators — `/brand/creators` (+ describe-who-you-want mode)
A ranked ledger, not a card grid: best fit for the selected campaign first, one row per
creator with the same facts side by side (fit, followers, median views, price) so they can
be compared. The fit score opens its four signals and a one-line reason in place, worded in
the reader's language (DECISIONS: a number you can question). Invite is on the row and in
the profile — a funded invitation, fee held until the creator answers — so there is no
separate Invite page. The profile is a wide drawer over the list, so the next creator is one
click away. The second mode lets the assistant rank the same list from a sentence and say
why, with one trade-off; its answer lands as the same rows.
**Merged (components round):** the list tabs and campaign picker, the search + sort row, the
filter row and the table were four stacked blocks. They are one card now: which list and for
which campaign in its head, then search · filter chips · sort on one line, then the rows.

### Campaigns — `/brand/campaigns` (+ detail, brief, new, launch)
The list is a ledger of campaigns — name, state, creators, published, committed, and the
next step (a draft says "Finish setup"). A campaign's page opens the same way on every tab:
back, name and state, the next step, and the projection from Amplio's own data next to what
actually happened; its Collaborations tab is the brand list scoped to it (next step and
owner per row), then Brief (read as a creator reads it), Shortlist, Analytics. A new
campaign is three questions and an editable brief — the "start from a link" path is cut,
the link was never read. Launch is four URL-addressed steps ending on the numbers: who gets
a funded invitation, what that holds from the wallet, and what to expect, with "not enough
data yet" where Amplio's sample is too small. Delete is a two-click button that says held
fees come back.

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
behind it — so the first screen says it in one line and puts the demo
workspace's real counts right beside it (the glass hero, v3 below), then
the page tells it as scenes, one idea per screen, then the four calm blocks
a buyer needs before signing up (how to start, what it costs, questions,
sign up). Every number on it is the demo workspace's, labelled as such.

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

#### v3 — the glass hero (26 Sep; screens in `screens/hero/`, entrance in `recordings/hero/`)

A new first screen and a new public header, built to a measured spec rather
than designed by eye, replacing the WebGL trail hero (v1/v2 above).

- **Units.** Everything is `calc(N * var(--u))`, one pixel of a 1280×960
  comp (`hero/frame.module.css`); the plate stretches to the viewport, the
  foreground keeps its measured size. `.sx` spans carry the comp's optical
  width-tracking. Type is Inter at the comp's weights (200 for the numbers,
  360 for the headline, 470 eyebrow and tagline, 520 wordmark, 570 nav).
- **Three tiers keyed to frame shape.** Wide frames place every element
  absolutely off the comp; compact frames (≤ 87/80 aspect, < 900 wide or
  < 640 tall) turn the same wrappers into a flex column, with a two-column
  hero block when landscape; phones (≤ 640, portrait) add `--t`, a floored
  unit for reading type and controls, put each number above its label and
  give the panel and the demo pill the full width.
- **Plate.** An 18 KB AVIF poster (preloaded, fetchpriority high) is the
  LCP; the 10 s clip (1280w H.264, 404 KB, faststart, silent) attaches on
  idle after first paint, fades in over its own first frame, plays only on
  screen with the tab visible, and never on phones, Save-Data, fewer than 4
  cores or reduced motion (held on frame 1, following the preference live).
- **The numbers.** The panel reads posts, links, clicks and sign-ups; its
  track is sign-ups over clicks, floored at 12% so it shows; the stats row
  carries clicks and sign-ups at 100u. All from `getPublicTrail` (the query
  behind `/api/public/trail`, cached 60 s), rendered on the server into the
  static page, labelled "demo workspace data". The stats row's x positions
  follow the real digit count so the rhythm holds (`stat-layout.ts`).
- **Entrance.** Two inline scripts (`hero/entrance-script.ts`): one before
  first paint sets `html.pre` on the landing only (WAAPI present, motion
  allowed; self-heals after 4 s), one after the hero runs the timeline —
  masked rise for the headline and numbers, lift for the small type, glass
  settle for the pills, panel, play and burger, accents for the badge, dot,
  track and slash; phones run at .86 — while the numbers count to their real
  value in an overlay (`data-count`), then removes the class and cancels
  itself. It starts before hydration and never rewrites the server's text.
  Lines carry padding under their box so no descender shows under the mask
  at frame 0. Reduced motion or no JS: the hero renders finished.
- **Header.** The same component on every public route (`nav/PublicHeader`):
  transparent over the plate, frosted past 40px (pill 52u, CTA 56u, 500 ms
  expo), frosted from the start on the other pages (dark theme frosts in
  the page's paper). The capsule parks on the current page's item and
  springs to whichever item the pointer or focus is on. Portrait frames get
  a glass burger: aria-expanded and data-open together; closes on a link,
  outside click, Escape (focus back to the burger), a route change and a
  turn to landscape. The language and theme switches moved to the footer.
  The 404 keeps its own page: a header in the root not-found made every
  route, app included, load Inter and the header's chunk.
- **Found while checking.** The public pages are prerendered per locale
  behind the proxy's rewrite, so `usePathname()` said `/en` for `/`: the
  header now strips the locale before it compares (01c8cce). On compact
  frames the assistant's corner button sat on Open the demo; it steps aside
  while the hero is at the top.

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

### Motion on the public pages
Every scene on the landing acts out its sentence in hand-made SVG on the
trail motif — the share arrow seeding the audience, clicks flying into
the link, sign-ups dropping into named ledger rows, the bill and the proof
locking together — so someone who doesn't read the copy still watches the
story to the end. The same kit carries the other pages: the creator card
assembling itself on /for-creators, the coin on /pricing (whole to the
creator, fee €0 — the true state of this build, not a split we don't
take), the drawn cross-outs, a line drawing per FAQ answer, a quiet trail
on legal pages and beside the auth form. Everything waits until it's on
screen (`src/features/public/components/stage/Stage.tsx`), loops pause
off-screen, and reduced motion shows the final frame.
Around those drawings, the public pages speak the site's earlier
interaction language again (restored from before a2e204b, public pages
only, in the last section of `src/styles/interaction.css`): every section
below the hero pops on a spring (700 ms, `cubic-bezier(.34,1.56,.64,1)`,
children 80 ms apart, a grid's cards one by one) with its heading landing
word by word, and replays whenever it comes back into view, up or down;
cards lift 3px and invert to ink; buttons lift 2px and invert; arrows nudge
2px. Reduced motion shows every final state.

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
Every field has an example in it (Ada, Lovelace, you@company.com, Create a
password…), with the help line kept under the password. Password fields
(PasswordInput, `src/components/forms`) carry an eye inside the field whose
upper lid folds shut while the password is hidden and opens when it's shown
(200 ms), and a keycap chip, "Caps Lock is on", that slides in under the
field while caps is on and the field has focus. The two demo buttons stack:
the pill labels don't fit two to a row.

## Brand

### Settings — `/brand/settings`
Same shape as the creator's: an index and three sections — Company (name, website), Who you
sell to (the value proposition, three ideal customers, and their industries and regions),
Account.
**Merged (components round):** "Ideal customers" and "Audience" both described the buyer,
split only because onboarding saves one and settings the other; one form now saves through
onboarding's action then the audience action. 4 → 3.
The Team section is cut: it validated an email and then said no invitation was sent.

## Assistant and call mode (every surface)
A calm pill at the bottom — type or talk — with the conversation above it and a corner
button when hidden. The mark's three dots are its state: still, bouncing while it listens,
pulsing while it thinks. Call mode is a full page on paper with the mark as the voice
visualiser (each dot grows with the live mic level), the transcript, mute, end, or type.
Same brain: tools go through the confirm gate, so anything that moves money or changes a
collaboration is described and waits for "yes".

## Onboarding

**Setup lives inside the app** (26 Sep, screens `screens/onboarding/setup-*`):
`/brand/setup` and `/creator/setup?step=…` render inside the shell, so the rail
and top bar stay and the rest of the app is usable before setup is done. The
left pane names the setup and the step ("Set up your profile · 3 of 5"), then
lists the steps as tabs on a dark ink rail (number disc, title, a check and
"Done"); the current step opens in place as its card, growing out of its tab
(header scales up, fields unroll on the spring, 450 ms). The right pane is the
live preview card. Phones get a step strip above the card and the preview
under the fields. Finished steps stay open to edit; LinkedIn and invoicing can
be skipped. While setup is unfinished the rail shows a Setup item with a
done/total badge and both Overviews open with a setup card (progress ring,
next step and why, Continue setup, a check per step); the visit after the last
step shows "You're set up" once with a small burst, then it's gone. The old
`/onboarding/*` links redirect to the same step. With AGENT_MODE on, the last
step offers the agent (brand: finding creators, creator: finding campaigns).
The panels below describe the forms each step renders.

Both onboardings are the **wizard card** (components spec, "Onboarding"; screens in
`screens/onboarding/wizard-*`): the rail on top, then an aside — an UPPERCASE
eyebrow, the title, one line — above the step's fields on the left, and on the
right a large preview card that is the thing being made (`src/components/flow/`:
WizardShell, PreviewCard, WizardActions, WizardSkeleton). Phones stack the card
above the fields. The card has a tinted band, the name at 28px (placeholder style
until there is one), a 6px track that fills with an accent gradient as the
fields complete, the step's own content and a stats strip. It tilts toward the
pointer (fine pointers only) and turns over (rotateY 180°, 320 ms) to the entered
facts as rows when a step adds details; a button turns it back. On phones it
stays on its shorter front and turns on tap. Forward and back are blob buttons
side by side. Loading is the wizard's outline; each form keeps its alert, the
brand page its error state. The fields are the shared ones Settings uses
(`src/features/profile-fields`), untouched, so they carry the new primitives'
icons and focus states exactly as Settings does.

The wizard is set in Plus Jakarta Sans (400–800, next/font, scoped to the
wizard). Step one of both roles opens with a **picture**: a round 112px disc
that is the button, a Choose / Change chip under it and a small remove, a
drawn silhouette in the accent tint while empty (a person, or an image
placeholder for a logo). The browser crops the file to a square around its
middle, draws it at 256px and encodes WebP (JPEG where it can't), about
20 KB, refusing files over 20 MB or that won't decode; the server checks it
again (WebP/JPEG data URL, ≤ 300 KB) and saves it to `creators.avatar_url` or
`brand_logos`. The preview card shows the pick at once; the save is
optimistic with rollback. The same field sits in Settings > Profile, and
every avatar falls back to the silhouette (brands to their trail mark).

### Brand — `/onboarding/brand/website` (`/profile` redirects here)
One screen: paste the website, and while the site is read its words drop into two
trays — value proposition and ideal customers — then the AI draft appears under
the field, editable, before anything is used; the rail moves from Website to
Profile when it lands. The preview card is the brand's profile as creators see
it in every brief: the company, the value proposition and the ideal customers,
filling in live as the draft is edited, and it turns over to the same facts
row by row once the draft lands. If the site can't be read, the draft says it
starts from the company name.
The three ideal customers are summary cards (number, who they are on two
lines, what they care about on three, Edit), one column on phones. A card
opens a dialog that grows out of its own box into a centred 640px panel on
the spring while the page dims, and folds back on close: "Customer 2 of 3",
the two fields full width with a live count, arrows to the other two, Save
and Cancel. A native modal dialog: focus stays in, Esc and the dimmed page
close it, focus returns to the card, and unsaved edits ask before they go.

### Creator — `/onboarding/creator/{linkedin,card,price,professional}`
The same rail sign-up started (Account → LinkedIn → Card → Price → Legal), one
step per screen because each is a different decision. The preview card is the
creator's card as brands see it (photo, name, headline, industries; followers,
country, price). LinkedIn is read for real (Apify) and fills it; when it can't
be read the screen says so and the card is typed by hand, with nothing guessed.
On the card step each value flies from its field into the card as you type. On
price and legal the card turns over to the facts, the price and the legal
details among them, live. The legal step can wait for Settings ("Do this
later").

## Graphics and motion kit (`src/components/graphics`)
One motif, the trail, drawn by hand in SVG on currentColor: DrawOnPath (a stroke draws in),
TrailLoader (the only loader: the mark's dots pulse), StatusGlyph (a glyph per collaboration
state — envelope, arrow, joined dots, pen, revise, check, calendar, pulse, coin, cross — that
redraws when the state changes), Stamp (a paid ledger row prints in), Burst (a spray of dots
when something clears: a Needs-you item that moved on since the last visit), CoinTrail (a
withdrawal: a line draws out of the Available balance and a coin runs off its end), BrandMark
(a brand without a logo gets its own trail, 3–4 dots seeded by the name, so no letters and no
stock art), AssembleOnce (My card builds itself block by block the first time it is seen in a
tab), the copy ripple on "Copy link", and empty-state scenes (a brief writing itself, two dots
joining, a link rippling, three dots typing, a radar sweeping a field of dots for "no
opportunities", an empty ledger with a pen waiting for "no earnings"). Transform, opacity and
dashoffset only; final frame under reduced motion; ambient loops pause off screen (Loop).
Numbers roll through the primitives' RollingNumber. Why the trail everywhere: the product is
a chain of links (brief → post → click → sign-up → payout), and one drawn motif keeps every
screen reading as the same product without decoration that means nothing.

## The loop, end to end (QA, localhost, fresh accounts)

Screens `docs/design/screens/loop-01…39-*.jpg` (captured in dark mode — the
app follows the system theme). Every step in the new UI, two accounts
created for the run, local database only:

1. Brand signs up → one-screen onboarding reads hubspot.com, AI draft →
   Creators (01–05).
2. Creator signs up → LinkedIn read for real (Apify) fills the card, the
   creator edits the headline, sets €450, fills legal details (06–12).
3. Brand finds the creator, the invite asks for funds → demo top-up €500 →
   funded invitation, €450 held in Billing (13–16).
4. Creator accepts → writes the draft → brand requests changes (round 1 of
   2) → creator resubmits → brand approves (17–25).
5. Creator schedules, adds the post URL, marks it published (26–28).
6. A fresh browser opens the tracked link (302 with the click id + cookie)
   and signs up on /demo/landing (29–30).
7. Brand Results: 1 click and 1 sign-up attributed to the creator, the rows
   drawers list them, the CSV exports (31–33).
8. Brand releases €450 → PAID in both ledgers → creator withdraws via the
   labelled Stripe stub (34–39).

Found on the way: the LinkedIn step promised views and engagement the
import doesn't read (fixed, 00dee46); releasing a payment moves money on
one click with no confirm step, and Results shows "Estimated reach 0" for a
creator whose views are unknown (both reported to the brand side).

## Lighthouse (live, amplio-mvp.vercel.app, Lighthouse 12, 2026-09-26)

After the static public pages (f25f7c3). Performance / Accessibility / Best practices / SEO,
then FCP · LCP · TBT · CLS.

| Page | Desktop | Mobile |
|---|---|---|
| `/` | 99 / 100 / 100 / 100 — 0.3 s · 0.5 s · 0 ms · 0 | 64 → **95–99** / 100 / 100 / 100 — 1.2 s · 1.7–2.5 s · 0–20 ms · 0 |
| `/for-creators` | 99 / 100 / 100 / 100 — 0.5 s · 0.6 s · 0 ms · 0 | 87 → 100 / 100 / 100 / 100 — 1.1 s · 1.4 s · 0 ms · 0 |
| `/pricing` | 100 / 100 / 100 / 100 — 0.3 s · 0.5 s · 0 ms · 0 | 96 / 100 / 100 / 100 — 1.1 s · 2.6 s · 80 ms · 0 |
| `/login` | 100 / 100 / 100 / 100 — 0.3 s · 0.3 s · 0 ms · 0 | 94 / 100 / 100 / 100 — 1.1 s · 3.1 s · 40 ms · 0 |

The landing's mobile score was held down by three.js: ~500 KB evaluated on a
throttled phone was 1.3 s of main thread (TBT 1,840 ms) even though it loads
after first paint. Since 02a323b phones, low-power devices and Save-Data never
download it — the hero's drawing animates its clicks in plain SVG — and desktop
keeps the WebGL layer. Mobile numbers vary a few points run to run (two runs
shown for `/`); the "→" rows are before / after that change.

## Lighthouse, glass hero (local production build, Lighthouse 12, 2026-09-26)

`pnpm build && pnpm start` on localhost against the local database, simulated
throttling, two mobile runs per page; "main before" is 18c5070 built and run the
same way on the same machine. Performance, with FCP · LCP; Accessibility is 100
and CLS 0 on every run of both builds; Best practices is 96 on both, for the
`/_vercel/*` scripts that 404 off Vercel.

| Page | Mobile, glass hero | Mobile, main before | Desktop (both) |
|---|---|---|---|
| `/` | 99 · 90 — 1.5 s · 2.1–3.5 s (poster is the LCP) | 94 · 90 — 1.5 s · 3.1–3.5 s | 100 |
| `/for-creators` | 91 · 90 — 1.5 s · 3.4–3.5 s | 92 · 91 — 1.4 s · 3.4–3.5 s | 100 |
| `/pricing` | 91 · 90 — 1.5 s · 3.4–3.5 s | 94 · 92 — 1.4 s · 3.1–3.4 s | 100 |
| `/faq` | 90 · 90 — 1.5 s · 3.5 s | 92 · 91 — 1.4 s · 3.4–3.5 s | 100 |
| `/privacy`, `/terms` | 90 · 90 — 1.5 s · 3.5 s | 91–92 — 1.4 s · 3.4–3.5 s | 100 |
| `/login` (no public header) | 97 · 94 | 97 · 92 | 100 |

Local runs are harsher than the live ones above: on localhost every request has
finished before first paint, so Lighthouse's simulation counts all of them.
What it cost and what we took back: the header brings Inter and its stylesheet
to every public page, about 0.1 s of simulated FCP (1–2 points). Inter is a
22 KB subset instead of Google's 48 KB file, the unused Cormorant (23 KB, on
every page) is gone, the hero's stylesheets are folded so public pages load 7
stylesheets as before, and the 404 doesn't carry the header (it cost every
route 100 KB). The clip is never loaded on a phone, so it isn't in the mobile
numbers; on desktop it attaches after first paint and desktop stays at 100 —
so poster-only was not needed.

## Real vs stubbed

| Where | What | Status |
|---|---|---|
| LinkedIn profile read (`readLinkedinProfile`) | headline, followers, country and photo read from the public profile (Apify) | real; median views and engagement aren't on a public profile, so they show "—" until there is post data |
| Stripe payout method (Settings › Payouts, Earnings › Withdraw) | no Stripe Connect; the ledger records the withdrawal | allowed stub, labelled in both places |
| Creator card figures (My card, `/c/[handle]`) | followers from the real profile read; views, engagement and audience mix are seeded for demo creators | seeded creators carry a "demo creator" note on the public page; new creators show "—" where there is no data |
| Affiliate "invite creators" tab, community Slack button | "not part of this build" | cut with their pages |
| Brand settings › Team (`TeamAccessPanel`) | accepted an email, sent nothing ("email isn't connected") | cut from Settings; still used by `/brand/invite` (builder's, being folded into Creators) |
| Messages "support bot" thread | a fake conversation with a canned reply | cut; `/…/messages/support-bot` now 404s |
| Brand wallet top-up (Billing) | no Stripe; the credit is a ledger row | stub, the dialog says "no card is charged" |
| Launch estimator (Campaigns) | rates from Amplio's own live posts, clicks and attributed sign-ups | real; below 3 live posts / 30 clicks it says "not enough data yet" |
