# Amplio — our own interface

8x changed the brief: keep the idea and the backend, rebuild the frontend with our own
layout and visual design. The first version's landing effects (video-scrub hero, frosted
cards, splash screen, animated footers, compressing nav, the auth-page media panel, the
metric stage, the globe) are removed, not restyled. The backend (Postgres, Drizzle, server actions, tracking, ledger, assistant) stays.

Deadline: resubmit by end of Saturday 26 September. Freeze: Saturday 19:00 UTC.

## The idea the design carries

Amplio's difference is that every number is a receipt: a click, a lead, a payout are rows
you can open. The interface is a **ledger**: calm paper, black ink, ruled lines, and
numbers that expand into the rows they are made of. One accent colour, used only for
money and verified attribution.

## System

**Type.** Geist for everything (next/font, self-hosted). Geist Mono for every number,
amount, ID, date and code, always tabular. Scale: 12 / 13 / 14 (body) / 16 / 20 / 24 /
32 / 48 / 64. Headings tight (-0.02em), weight 600; body 400. No serif, no display face.

**Colour.** Tokens only, light and dark.
- paper `#FAFAF7`, surface `#FFFFFF`, ink `#111111`, muted `#6B6B66`, rule `#E6E4DE`
- accent (money, attributed, verified) `#0F7B4A`
- attention (pending, needs you) `#B45309`, failure `#B42318`, info `#1D4ED8` (links only)
- dark: paper `#0E0E0D`, surface `#161615`, ink `#F2F1EC`, rule `#2A2926`, accent `#34C77B`
No gradients, no glass, no blur, no background video.

**Shape.** Hairline 1px rules. Radius 10 (cards), 8 (inputs, buttons), 999 (status chips).
Shadows only on floating layers (menus, dialogs, toasts). 8px spacing grid; content
max-width 1200; 12-column grid.

**Motion.** 150–220 ms, ease-out `cubic-bezier(.2,.8,.2,1)`, opacity and transform only.
Numbers roll when they change. Tab indicators slide. Lists stagger 20 ms for the first 12
rows. Pages fade up 8px on enter. Reduced motion: no movement, instant state.

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
- **The hero is alive.** A WebGL layer (three.js with a small shader) draws the trail: the
  mark's three dots become a living network — posts as sources, clicks as particles
  travelling along lines, sign-ups as dots that settle into a column of ledger rows. It is
  driven by the real demo-workspace counts and reacts to the cursor and to scroll.
- **Rhythm.** Scenes change on scroll with quick cuts (250–400 ms), numbers count up hard,
  text lands word by word, one idea per screen. No slow fades, no long empty scrolls.
- **Palette holds.** Paper, ink and the one green; the energy comes from motion, scale
  and contrast, not from new colours. Big type (up to 120px) is allowed here only.
- **Cost.** The WebGL layer loads after first paint, pauses off-screen, caps at 60fps and
  0.75 device pixel ratio, and falls back to a static drawing under reduced motion or
  without WebGL. The landing still has to load fast on a phone.
- **Two passes.** Build it, then watch it at normal speed at 1440 and 375 and critique
  the pace: where it drags, where it's boring, what a ten-year-old would skip. Then a second
  version that fixes each of those, sharper and more playful. Both passes are recorded.

## Signature pattern: the trail

Any metric (clicks, leads, CPL, earnings) is clickable and opens a drawer listing the
rows it came from, with timestamps and sources. On the landing page, the hero shows the
trail for real: post → tracked link → click → sign-up, with live counts from the database
(clearly labelled "demo workspace data").

## Components (one set, used everywhere)

Button (primary ink / secondary outline / ghost / danger with confirm step), Input,
Textarea, Select, Combobox, DatePicker, SegmentedControl, Tabs, Table (sortable, sticky
header, row hover, empty state), StatCard (label, rolling value, delta, sparkline, opens
the trail), StatusChip (collaboration states), Card, EmptyState (says what to do next),
Dialog, Drawer, Toast, Skeleton, Avatar (photo, initials only as fallback), CommandMenu (⌘K).
Onboarding and Settings use exactly the same fields.

## What each surface shows (relevant only)

- **Landing:** hero with the live trail, three-step how it works, what brands get, what
  creators get, pricing (only what is true), FAQ, sign-up call to action, footer.
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
