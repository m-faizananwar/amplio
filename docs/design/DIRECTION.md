# Amplio — our own interface

8x changed the brief: keep the idea and the backend, rebuild the frontend with our own
layout and visual design. Nothing in the new interface copies another site. The ported
pieces from other templates (scroll-scrub hero, glass card, splash, gaze footer, ink
footer, compressing glass nav, OceanPulse auth panel, LED stage, globe) are removed, not
restyled. The backend (Postgres, Drizzle, server actions, tracking, ledger, assistant) stays.

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
