#!/usr/bin/env bash

set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
collections_doc="$repo_root/.codex/skills/firestore-guidelines/references/current-collections.md"
modeling_doc="$repo_root/.codex/skills/firestore-guidelines/references/modeling-conventions.md"
index_doc="$repo_root/.codex/skills/firestore-guidelines/references/index-policy.md"
rules_doc="$repo_root/.codex/skills/firestore-guidelines/references/rules-policy.md"

is_firestore_file() {
  case "$1" in
    src/app/api/*|src/lib/*|firestore.rules|firestore.indexes.json)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

files=()
if [[ $# -gt 0 ]]; then
  for arg in "$@"; do
    if is_firestore_file "$arg"; then
      files+=("$arg")
    fi
  done
else
  while IFS= read -r file; do
    if is_firestore_file "$file"; then
      files+=("$file")
    fi
  done < <(git -C "$repo_root" diff --name-only --cached --diff-filter=ACMR)
fi

if [[ ${#files[@]} -eq 0 ]]; then
  echo "Firestore guidelines check: no changed Firestore-related files to inspect."
  exit 0
fi

warn_count=0
error_count=0
collections_seen=()

warn() {
  echo "WARN: $1"
  warn_count=$((warn_count + 1))
}

error() {
  echo "ERROR: $1" >&2
  error_count=$((error_count + 1))
}

for rel in "${files[@]}"; do
  abs="$repo_root/$rel"
  [[ -f "$abs" ]] || continue

  while IFS= read -r collection; do
    [[ -n "$collection" ]] || continue
    existing_collections="${collections_seen[*]-}"
    if [[ " $existing_collections " != *" $collection "* ]]; then
      collections_seen+=("$collection")
    fi
  done < <(rg -o 'db\.collection\("([^"]+)"\)' -r '$1' "$abs" 2>/dev/null || true)

  if rg -n '\bisDeleted\b|\bdeletedAt\b' "$abs" >/dev/null 2>&1; then
    if ! rg -n 'Soft-delete|soft-delete|isDeleted|deletedAt' "$modeling_doc" "$collections_doc" >/dev/null 2>&1; then
      error "$rel uses soft-delete fields but the Firestore skill docs do not document the pattern."
    fi
  fi

  if [[ "$rel" == firestore.rules ]]; then
    if ! rg -n 'Current baseline|permissive|rules' "$rules_doc" >/dev/null 2>&1; then
      error "Rules policy documentation is missing baseline guidance."
    fi
  fi

  if [[ "$rel" == firestore.indexes.json ]]; then
    if ! rg -n 'Query-to-index rule|Current baseline|expenses' "$index_doc" >/dev/null 2>&1; then
      error "Index policy documentation is missing required guidance."
    fi
  fi

  if [[ "$rel" == src/lib/types.ts ]]; then
    for required in Reservation Post Task ExpenseCategory Expense; do
      if ! rg -n "export interface ${required}" "$abs" >/dev/null 2>&1; then
        warn "Expected baseline interface ${required} was not found in src/lib/types.ts."
      fi
    done
  fi
done

for collection in "${collections_seen[@]}"; do
  if ! rg -n "^## Collection: ${collection}$" "$collections_doc" >/dev/null 2>&1; then
    error "Collection '${collection}' appears in code but is missing from current-collections.md."
  fi
done

if (( ${#collections_seen[@]} > 0 )); then
  if ! rg -n 'Collection naming|_id|createdAt|updatedAt|Timestamp' "$modeling_doc" >/dev/null 2>&1; then
    error "Modeling conventions documentation is incomplete."
  fi
fi

if (( ${#collections_seen[@]} > 0 )); then
  if [[ ! -f "$repo_root/firestore.rules" ]]; then
    error "Firestore-related changes require firestore.rules to exist."
  fi
  if [[ ! -f "$repo_root/firestore.indexes.json" ]]; then
    error "Firestore-related changes require firestore.indexes.json to exist."
  fi
fi

if [[ $error_count -gt 0 ]]; then
  echo "Firestore guidelines check failed with $error_count error(s) and $warn_count warning(s)." >&2
  exit 1
fi

echo "Firestore guidelines check passed with $warn_count warning(s)."
