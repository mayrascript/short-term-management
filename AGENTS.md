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

Skills live in `skills/` (source of truth) and are mirrored into `.claude/skills/` (Claude Code) and `.agents/skills/` (shared by Codex, Cursor, Antigravity) by `pnpm skills:install`. See the **Skills — CLI y sincronización** section below for details.

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

<!-- BEGIN:skills-cli -->
# Skills — CLI y sincronización (enforced)

**Regla:** los skills (nuevos y viejos) se instalan y sincronizan **exclusivamente** con el [Vercel skills CLI](https://skills.sh/) (`npx skills` / `pnpm exec skills`). No copies archivos a mano entre `.claude/skills/` y `.agents/skills/`.

**Layout:**

| Ruta                 | Rol                                               | Tracked |
|----------------------|---------------------------------------------------|---------|
| `skills/<name>/`     | Fuente de verdad — edita aquí                     | ✅      |
| `.claude/skills/`    | Copia para Claude Code (generada)                 | ✅      |
| `.agents/skills/`    | Copia compartida por Codex, Cursor, Antigravity   | ✅      |
| `skills-lock.json`   | Manifiesto determinista (versiones + hashes)      | ✅      |

Todas las copias se comprometen al repo para que el clone funcione sin instalación.

**Añadir un skill nuevo (local o externo):**

```bash
# Local (carpeta nueva en skills/<name>/SKILL.md con frontmatter name+description):
pnpm skills:add ./skills/<name> -a claude-code -a codex -a cursor -a antigravity

# Externo (GitHub / GitLab / skills.sh):
pnpm skills:add vercel-labs/agent-skills --skill <name> -a claude-code -a codex -a cursor -a antigravity
```

**Regenerar copias tras editar `skills/`:**

```bash
pnpm skills:install   # regenera .claude/skills/ y .agents/skills/ + actualiza lockfile
```

**Verificar drift (manual):**

```bash
pnpm skills:check     # equivale a node scripts/check-skills.mjs
```

**Enforcement:** `.husky/pre-commit` corre `check-skills.mjs` y bloquea el commit si:
1. Hay una carpeta en `skills/` sin entrada en `skills-lock.json`.
2. El lockfile tiene entradas que no existen en `skills/`.
3. `.claude/skills/<name>/` o `.agents/skills/<name>/` faltan.
4. Algún archivo difiere entre la fuente y sus copias.

El mensaje de error siempre sugiere `pnpm skills:install` como fix.

**Agentes soportados por el CLI (decidimos instalar a estos 4):**
`claude-code`, `codex`, `cursor`, `antigravity`. Codex, Cursor y Antigravity comparten físicamente `.agents/skills/`.
<!-- END:skills-cli -->
