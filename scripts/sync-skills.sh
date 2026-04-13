#!/usr/bin/env bash
# Deprecated: this script now delegates to the Vercel skills CLI.
#
# Source of truth: ./skills/ + skills-lock.json
# Targets (generated): .claude/skills/ (Claude Code) and .agents/skills/
#   (shared by Codex, Cursor, Antigravity).
#
# Usage:
#   bash scripts/sync-skills.sh          → materialize targets from lockfile
#   bash scripts/sync-skills.sh --check  → fail if targets drift from lockfile
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ "${1:-}" = "--check" ]; then
  exec node scripts/check-skills.mjs
fi

exec pnpm exec skills experimental_install -y
