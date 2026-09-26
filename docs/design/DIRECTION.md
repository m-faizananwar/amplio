# Amplio — our own interface

8x changed the brief: keep the idea and the backend, rebuild the frontend with our own
layout and visual design. The first version's landing effects (video-scrub hero, frosted
cards, splash screen, animated footers, compressing nav, the auth-page media panel, the
metric stage, the globe) are removed, not restyled. On 26 September the landing's first
screen and the public header came back as glass, built new from a measured spec (see "The
landing is the launch"); nothing of the first version's code returned with them. The backend (Postgres, Drizzle, server actions, tracking, ledger, assistant) stays.

Deadline: resubmit by end of Saturday 26 September. Freeze: Saturday 19:00 UTC.

## The idea the design carries

Amplio's difference is that every number is a receipt: a click, a lead, a payout are rows
you can open. The interface is a **ledger**: calm paper, black ink, ruled lines, and
numbers that expand into the rows they are made of. One accent colour, used only for
money and verified attribution.

## System

**Type.** Geist for everything (next/font, self-hosted). Geist Mono for every number,
amount, ID, date and code, always tabular. Scale: 12 / 13 / 14 (body) / 16 / 20 / 24 /
32 / 48 / 64. Headings tight (-0.02em), weight 600; body 400. No serif. One exception:
the landing's glass hero and the public header are set in Inter (variable, self-hosted
through next/font as a 22 KB en/fr subset) at the comp's own weights — 200, 360, 400,
425, 470, 500, 520, 570 — and nowhere else.

**Colour.** Tokens only, light and dark.
- paper `#FAFAF7`, surface `#FFFFFF`, ink `#111111`, muted `#6B6B66`, rule `#E6E4DE`
- accent (money, attributed, verified) `#0F7B4A`
- attention (pending, needs you) `#B45309`, failure `#B42318`, info `#1D4ED8` (links only)
- dark: paper `#0E0E0D`, surface `#161615`, ink `#F2F1EC`, rule `#2A2926`, accent `#34C77B`
In the app and on every page below the landing's first screen: no gradients, no glass,
no blur, no background video. The one exception is the landing's first screen and the
public header (below): a pale glass plate behind the hero, glass on the nav pill, the
panel and the pills, and the header frosting once you scroll.

**Shape.** Hairline 1px rules. Radius 10 (cards), 8 (inputs, buttons), 999 (status chips).
Shadows only on floating layers (menus, dialogs, toasts). 8px spacing grid; content
max-width 1200; 12-column grid.

**Motion.** 150–220 ms, ease-out `cubic-bezier(.2,.8,.2,1)`, opacity and transform only.
Numbers roll when they change. Tab indicators slide. Lists stagger 20 ms for the first 12
rows. Pages fade up 8px on enter. Reduced motion: no movement, instant state.
The public site keeps the earlier interaction language instead (restored from before
a2e204b, scoped to the public pages): sections below the hero pop on a spring (700 ms,
`cubic-bezier(.34,1.56,.64,1)`, children 80 ms apart, headings word by word) and replay
when they come back; cards lift 3px and invert to ink; buttons lift 2px and invert; arrows
nudge 2px; the nav's capsule springs between items.

**Mark.** A new logo: three dots joined by one line (post → click → lead), drawn in ink.
Wordmark "Amplio" in Geist 600.

## The landing is the launch

The app is calm; the landing is the one place that performs. It should feel like a product
launch: fast, energetic, clever enough that someone who doesn't know what a CPL is still
scrolls to the end.

- **The one thing to say.** Amplio turns a LinkedIn post into money you can trace: every
  click and every sign-up comes back as a row, to the post and the creator that caused it.
  Every section serves that sentence; nothing explains architecture.
- **The story, as scenes.** A post goes out → it travels through a creator's audience →
  clicks light up → sign-ups land → each one snaps into a ledger row with a name on it →
  the brand sees the bill and the proof side by side. Then: how to start, what it costs,
  questions, sign up.
- **The first screen is glass.** A full-viewport hero on a pale plate — a crystal sphere
  cut by a thin glass blade on a blue-white studio backdrop, a slow 10 s clip — with the
  line "Every click / comes back." in light Inter, a glass panel reading out the demo
  workspace's live posts, links, clicks and sign-ups, the two numbers that matter in a
  stats row, and the way into the demo. It is measured off a 1280×960 comp (one design
  unit = one comp pixel) with three tiers keyed to the frame's shape, and its entrance is a
  one-off WAAPI timeline (masked rise, lift, glass settle, accents) that ends on the real
  counts. (This replaced the WebGL trail hero of 21–26 September; its job — the live
  numbers — is now the panel's and the stats row's.)
- **Rhythm.** Below the hero, scenes pop on the spring as they arrive, numbers count up
  hard, text lands word by word, one idea per screen. No slow fades, no long empty scrolls.
- **Palette holds.** Paper, ink and the one green; the energy comes from motion, scale
  and contrast, not from new colours. The hero's plate brings its own pale blue-white, and
  its foreground keeps to ink tones and the same green. Big type is allowed here only.
- **Cost.** The poster (18 KB AVIF, preloaded) is the LCP; the clip (404 KB) attaches on
  idle after first paint and never on phones, Save-Data, fewer than 4 cores or reduced
  motion. The landing still has to load fast on a phone: Lighthouse mobile ≥ 90, desktop
  ≥ 95, and if the clip ever costs more than that, the poster alone wins.
- **Two passes.** Build it, then watch it at normal speed at 1440 and 375 and critique
  the pace: where it drags, where it's boring, what a ten-year-old would skip. Then a second
  version that fixes each of those, sharper and more playful. Both passes are recorded.

## Graphics and motion: make it ours, make it move

The ledger is the frame; inside it the product should feel alive and made by hand. Every
graphic is our own SVG, built from one motif: **the trail** — dots joined by a line, the
same shape as the mark. Things draw themselves, dots travel, lines connect.

**Motion kit (shared, in src/components/motion):** DrawOnPath (stroke draws in), Odometer
(digits roll per column), Sparkline (line draws, last point pulses), TrailLoader (the mark's
three dots pulse in sequence — the only loader in the app), StatusGlyph (one glyph per
collaboration state that morphs into the next), Stamp (a ledger row prints in with a
"PAID" / "APPROVED" stamp), Burst (a small spray of dots for a success moment).

**Where it shows up:**
- **Empty states** each get a small animated scene: no campaigns → a blank brief with a
  line writing itself; no collaborations → two dots reaching for each other and joining;
  no clicks yet → a tracked link sending out ripples; no messages → three dots typing.
- **Collaboration states:** invited (envelope) → accepted (two dots join) → draft (pen
  line) → approved (check draws) → live (pulse) → paid (coin drops into the ledger).
- **Money moments:** top-up → coins stack into the wallet; payout → the ledger row prints
  with a stamp; approving a draft → the check draws and the row slides to its new group.
- **Numbers and charts:** counters roll, sparklines and chart lines draw on enter, points
  pop, a crosshair follows the pointer; opening the trail drawer draws a line from the
  metric to its first row.
- **Fit score:** the four signal bars fill one after another, then a ring closes around
  the percentage.
- **Creator cards:** the avatar sits in an orbit of audience dots (density = audience
  size); on hover, the top audience titles float out as chips.
- **Onboarding:** the step rail is a trail — dots light up and the line fills as you go;
  the creator card assembles itself as fields are filled; website analysis shows the
  site's words being sorted into value-prop and ICP chips.
- **Assistant and call mode:** the mark's three dots are the voice visualizer — they
  stretch and bounce with the mic level and settle when it thinks.
- **404:** the trail snaps and the dots fall.

**Rules.** Hand-drawn SVG only — no stock illustrations, no icon-pack art as decoration.
currentColor + tokens so every graphic works in dark mode. Animate transform, opacity and
stroke-dashoffset only; 150–600 ms for UI, longer only for ambient loops that pause
off-screen. Under reduced motion every graphic shows its final frame. One component per
graphic, under 500 lines, lazy-loaded when heavy.

## Signature pattern: the trail

Any metric (clicks, leads, CPL, earnings) is clickable and opens a drawer listing the
rows it came from, with timestamps and sources. On the landing page, the hero's glass
panel and stats row show the trail's counts for real — posts, tracked links, clicks,
sign-ups, live from the database — and the first scene below acts the trail out, all
clearly labelled "demo workspace data".

## Components (one set, used everywhere)

Button (primary ink / secondary outline / ghost / danger with confirm step), Input,
Textarea, Select, Combobox, DatePicker, SegmentedControl, Tabs, Table (sortable, sticky
header, row hover, empty state), StatCard (label, rolling value, delta, sparkline, opens
the trail), StatusChip (collaboration states), Card, EmptyState (says what to do next),
Dialog, Drawer, Toast, Skeleton, Avatar (photo, initials only as fallback), CommandMenu (⌘K).
Onboarding and Settings use exactly the same fields.

## What each surface shows (relevant only)

- **Landing:** the glass hero with the live counts, the story in five scenes, how to
  start, pricing (only what is true), FAQ, sign-up call to action, footer.
- **Removed pages:** /benchmarks, /case-study, /about, /for-agencies, /book-a-call — their
  figures, testimonials, customer logos and team belong to naano, not us.
- **Auth + onboarding:** our own layout (not two-pane): one centred column, role chosen
  with a segmented control, progress as a step rail on top.
- **App:** left rail + top bar (role switch, wallet, ⌘K, notifications). Brand: Overview,
  Creators, Campaigns, Collaborations, Results, Messages, Billing. Creator: Overview, My
  card, Opportunities, Collaborations, Analytics, Earnings, Messages. Settings for both.
  Setup cards only appear while setup is unfinished.
- **Assistant + call mode:** same functions, restyled in this system.

## Honesty

No figure, testimonial, logo or compliance claim we cannot back with our own data. Seeded
data is labelled as demo data wherever it is shown publicly. Stubs (Stripe, LinkedIn
import) say so in the UI.

## Copy

All user-facing text goes through the i18n layer (next-intl), English and French.
Drafted by a writing-focused agent, not written inline by the builder.

## Rules

No file over 500 lines. Small conventional commits, `.agent-logs` riding along. Check
every page in a real browser at 1440 and 375 with empty, loading, error and populated
states before calling it done. Compare against this document, not against another site.
