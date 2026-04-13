#!/usr/bin/env bash
# Mirror the testing skills between .claude/skills/ and .codex/skills/.
# Runs with two modes:
#   bash scripts/sync-skills.sh          -> copy .claude → .codex
#   bash scripts/sync-skills.sh --check  -> verify both trees are identical; exit 1 if not
#
# Only the skills we own are touched:
SKILLS=(
  "test-discipline"
  "vitest-unit-testing"
  "firestore-rules-testing"
  "playwright-e2e-testing"
)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/.claude/skills"
DST="$ROOT/.codex/skills"

mkdir -p "$DST"

if [ "${1:-}" = "--check" ]; then
  fail=0
  for s in "${SKILLS[@]}"; do
    if ! diff -r "$SRC/$s" "$DST/$s" > /dev/null 2>&1; then
      echo "drift: $s differs between .claude/skills/ and .codex/skills/"
      fail=1
    fi
  done
  if [ $fail -eq 0 ]; then
    echo "sync-skills: OK"
  fi
  exit $fail
fi

for s in "${SKILLS[@]}"; do
  rm -rf "$DST/$s"
  cp -R "$SRC/$s" "$DST/$s"
  echo "synced: $s"
done
