# Project notes for Claude Code

## Agent capture — do not touch

- `.claude/settings.json` wires `UserPromptSubmit` and `Stop` hooks to
  `.claude/hooks/capture.sh`, which appends every prompt and final response to
  `.agent-logs/<date>_<time>_<session-id>.md`. It fires automatically.
- Never edit, tidy, summarise or delete anything in `.agent-logs/`. Never add
  `.agent-logs/` to `.gitignore`.
- Commit the `.agent-logs/` changes together with the code they produced, as you
  go — one commit per unit of work, never one log dump at the end.

## Engineering rules

Lint enforces what it can (`eslint.config.mjs`); the rest is convention and is
reviewed by hand. If a rule blocks shipping inside the window, break it and say
so in the commit message.

### Structure

- Feature-first folders: `src/features/<domain>/{components,server,schemas.ts,constants.ts}`.
  Domains: `auth`, `marketplace`, `campaigns`, `collaborations`, `tracking`, `payouts`.
- Layers: `app` (routes) → `features/*/components` (views) → `features/*/server`
  (queries + actions) → `db`. Don't skip layers. Views never import from `@/db`
  (lint: `no-restricted-imports`, `import/no-restricted-paths`).
- `page.tsx` is thin: call a query, render a feature component. Under 100 lines,
  no business logic (lint: `max-lines` 100 on `app/**/page.tsx`).
- `src/lib` is pure functions only (fit score, money, dates). No io, no db, no
  framework imports (lint: `no-restricted-imports`, `import/no-restricted-paths`).
- `src/components/ui` = shadcn output only, never edited. Shared composites live
  in `src/components`.
- Max 500 lines per file (lint: `max-lines`); split components around 300. Max
  ~10 files per folder — after that make a subfolder.
- One component per file, file name = component name. Hooks are `useX.ts`. No
  `utils.ts` / `helpers.ts`: name files by what they do.

### Boundaries

- Server components by default. `'use client'` only if the file needs state,
  effects or handlers.
- Anything touching the service role key starts with `import 'server-only'`.
- Data crosses boundaries as plain DTOs, not drizzle rows. One `toDto` per entity.
- Mutations only via server actions in `features/*/server/actions.ts`, zod
  validated, returning `{ ok: true, data }` or `{ ok: false, error }`. Never
  throw to the client.
- Reads only via `features/*/server/queries.ts`. No queries inside components.
- Collaboration status only changes through `transition()`. A direct status
  write is a bug.
- Zod schemas in `features/*/schemas.ts` are the single source of truth for the
  form, the action and the DTO type.

### Clean code

- Strict TS, no `any` (lint: `@typescript-eslint/no-explicit-any`). Non-null
  assertions need a comment saying why (lint warns on each one).
- Functions do one thing. Over 40 lines, split it (lint warns:
  `max-lines-per-function`). Over 3 params, use an options object (lint:
  `max-params`). Max nesting 3, early returns (lint: `max-depth`).
- No magic numbers; `constants.ts` per feature (lint: `no-magic-numbers` in
  `features/*/server` and `src/lib`).
- Comments say why, not what. No commented-out code.
- `import/no-cycle` is on.

### Views

- Every list / dashboard screen has a loading skeleton, an empty state with a
  CTA, and an error state. No exceptions.
- Tailwind theme tokens only, no raw hex (lint: `no-restricted-syntax` on hex
  literals in `.tsx`).
- Forms = react-hook-form + the shared zod schema. Optimistic UI on accept /
  approve / pay, with rollback.
- Real buttons and links, labelled inputs, focus states, keyboard reachable. No
  div buttons (lint: `jsx-a11y/no-static-element-interactions`,
  `click-events-have-key-events`, `label-has-associated-control`,
  `anchor-is-valid`, `interactive-supports-focus`).
- Check 375px and 1440px before committing a screen.
- No mock data in components; seeds only.

### Data

- Every table: `id`, `created_at`, `updated_at`. Money in integer cents.
  `timestamptz` in UTC.
- Migrations only via drizzle-kit; never hand-edit one.
- Index every FK and every hot-path `where` column (e.g. `tracking_links.code`).
- Redirect handler = one insert + one 302, nothing else.

### Process

- Conventional commits, small, message says why. `.agent-logs/` in every commit.
- Typecheck + lint + test green before push.
- Deploy after every feature and check it on the live URL, not localhost.
  `/api/health` first.
- New env var = `.env.example` updated in the same commit.
- Half-done work goes behind `NEXT_PUBLIC_FF_*` flags, not commented-out routes.
- Errors are logged server-side with context; the user gets a friendly message.
  No stack traces in the browser.
- Keep the README current: how to run, architecture, what's real vs stubbed.

### Tests

- Unit tests for pure logic: `fitScore`, `transition`, money, attribution matching.
- One integration test for redirect → click → lead.
- No snapshot tests. Don't test framework glue.

### Definition of done

CI green, deployed, checked on the live URL, committed with the log, README and
`.env.example` updated. If any of that is missing, say which and why.

### Not lintable (reviewed by hand)

Layer-skipping between `app` and `server` (page.tsx is allowed to call a
query), `'use client'` discipline, `server-only` on service-role code, DTO vs
drizzle-row leakage, direct collaboration status writes, comments-say-why,
commented-out code, loading/empty/error states, optimistic UI, 375/1440 checks,
mock data, and everything under Data, Process and Tests.
