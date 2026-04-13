#!/usr/bin/env bash
# Deprecated: delegates to the Vercel skills CLI via the `skills:*` scripts.
#
# Source of truth: ./skills/ + skills-lock.json
# Targets (committed copies): .claude/skills/ (Claude Code) and
#   .agents/skills/ (shared by Codex, Cursor, Antigravity).
#
# Usage:
#   bash scripts/sync-skills.sh          → regenerate target copies from ./skills/
#   bash scripts/sync-skills.sh --check  → fail if targets drift from ./skills/
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ "${1:-}" = "--check" ]; then
  exec pnpm skills:check
fi

exec pnpm skills:install
