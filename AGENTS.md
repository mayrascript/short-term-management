<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:test-discipline -->
# Tests-with-every-feature (enforced)

Every change to a feature file in `src/` must ship with a matching test file in the same change. This is **enforced twice**:

1. **Claude Code `PostToolUse` hook** (`.claude/settings.json` → `.claude/hooks/require-tests.sh`): blocks the agent with exit code 2 if it edits a feature file without a matching test.
2. **Git `pre-commit` hook** (`.husky/pre-commit`): blocks any commit whose staged changes violate the rule, then runs `vitest --run --changed` so the tests actually pass.

Both hooks call the same checker: `scripts/check-tests.mjs`.

The source→test convention, escape hatches, and framework patterns live in the skills:

- **`test-discipline`** — the rule, the convention table, the workflow.
- **`vitest-unit-testing`** — components, route handlers, lib utilities.
- **`firestore-rules-testing`** — rules against the emulator (`pnpm test:rules`).
- **`playwright-e2e-testing`** — critical user flows (`pnpm test:e2e`).

Skills live in both `.claude/skills/` (Claude Code) and `.codex/skills/` (Codex CLI) — kept in sync by `scripts/sync-skills.sh`.

**Grandfathering:** pre-existing source files without tests are listed in `.testignore`. Editing those files does not require adding a test immediately, but **new files do**. As you add coverage for a grandfathered file, remove its entry from `.testignore`.

**Bypass:** only humans can bypass, and only for true emergencies:
```
git commit --no-verify
```
If you do this, open a follow-up immediately to add the missing test. Claude cannot pass `--no-verify`, which is intentional.

Commands:
- `pnpm test` — unit + component suite.
- `pnpm test:rules` — Firestore rules (needs Java + emulator).
- `pnpm test:e2e` — Playwright (run `pnpm exec playwright install chromium` once).
- `pnpm test:all` — everything.
- `pnpm check-tests` — run the staged-files check manually.
<!-- END:test-discipline -->
