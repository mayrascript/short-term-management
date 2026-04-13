---
name: test-discipline
description: "Every new or modified feature file must ship with a matching test in the same change. Defines the source→test convention, the escape hatches, and which specialist skill to follow for each test type."
user_invocable: false
---

# Test Discipline

**Rule:** When you add or modify a feature file in `src/`, add or update the matching test **in the same change**. No exceptions unless the file falls under an escape hatch below. The project enforces this rule twice — by a Claude Code `PostToolUse` hook and by a git `pre-commit` hook — so skipping the test will simply surface as a blocked tool call or a blocked commit.

## Source → Test convention

The convention is mechanical: the test sits next to its source with a `.test` infix.

| Source pattern | Test path | How to write it |
|---|---|---|
| `src/components/**/foo.tsx` | `src/components/**/foo.test.tsx` | `vitest-unit-testing` skill |
| `src/app/**/page.tsx` | `src/app/**/page.test.tsx` | `vitest-unit-testing` skill (RSC section) |
| `src/app/api/**/route.ts` | `src/app/api/**/route.test.ts` | `vitest-unit-testing` skill (Route handlers section) |
| `src/lib/**/foo.ts` | `src/lib/**/foo.test.ts` | `vitest-unit-testing` skill |
| `src/hooks/useFoo.ts` | `src/hooks/useFoo.test.ts` | `vitest-unit-testing` skill |
| Changes to `firestore.rules` | append cases to `firestore.rules.test.ts` | `firestore-rules-testing` skill |
| New user-facing flow / critical CRUD | `e2e/<flow>.spec.ts` | `playwright-e2e-testing` skill |

**Both unit AND e2e** are required when you ship a new user-facing feature: a unit test for the pieces, an e2e test for the happy path.

## What to test

Every test should at minimum cover:
1. The default render / happy-path call.
2. One branch — a non-default prop, a failure mode, an edge-case input.
3. The contract the consumer depends on (e.g. for an API route: status codes, response shape).

Don't chase 100% coverage line-by-line. Do cover every exported symbol.

## Escape hatches (no test required)

These are filtered out by `scripts/check-tests.mjs` so the hook won't fire, but the principle is: if the file has no testable behavior, it's exempt.

- Next.js structural shells: `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`
- Pure type files: `*.d.ts`, files exporting only `type`/`interface`
- Styles: `*.css`, `*.scss`, `globals.css`
- Config: `*.config.ts`, `next-env.d.ts`, `vitest.setup.ts`
- Generated code, `public/`, `node_modules/`
- Legacy trees `frontend/` and `backend/` (scheduled for deletion)
- Paths listed in `.testignore` (grandfathered pre-existing code; remove from the list as you add tests)

If you think your file should be exempt and it isn't in the list above, do NOT silently add it to `.testignore`. Either write the test, or surface the question.

## Workflow

When touching a feature file:

1. **Before editing**, identify the expected test path (use the convention table).
2. **Write the test first** if you can — it's cheaper to keep the feedback loop tight.
3. If editing an existing feature file, open its test file in the same turn.
4. Run `pnpm test` (unit) or the appropriate script before declaring done:
   - `pnpm test` — Vitest unit/component suite
   - `pnpm test:rules` — Firestore rules against the emulator
   - `pnpm test:e2e` — Playwright e2e
5. If the `PostToolUse` hook blocks you with "Feature file edited without matching test", **don't revert the edit and don't stash it** — write the test.

## Skill routing

- React component, lib function, hook, or route handler → **`vitest-unit-testing`**
- `firestore.rules` change → **`firestore-rules-testing`**
- New user-facing flow / critical path → **`playwright-e2e-testing`**

## Do NOT

- Do NOT bypass the hook with `git commit --no-verify` unless you are a human fixing a true emergency (and you should immediately open a follow-up to add the test).
- Do NOT add entries to `.testignore` to make the hook pass. That file grandfathers legacy code; new code is not legacy.
- Do NOT write "placeholder" tests (`expect(true).toBe(true)`). The hook only checks file existence — you'd pass it but defeat the purpose. Write a real assertion against actual behavior.
