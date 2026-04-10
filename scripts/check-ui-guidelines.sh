#!/usr/bin/env bash

set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
catalog_file="$repo_root/.codex/skills/ui-guidelines/references/component-catalog.md"
patterns_file="$repo_root/.codex/skills/ui-guidelines/references/view-patterns.md"

is_ui_file() {
  case "$1" in
    src/app/*|src/components/*)
      [[ "$1" == *.ts || "$1" == *.tsx || "$1" == *.js || "$1" == *.jsx ]]
      ;;
    *)
      return 1
      ;;
  esac
}

files=()

if [[ $# -gt 0 ]]; then
  for arg in "$@"; do
    if is_ui_file "$arg"; then
      files+=("$arg")
    fi
  done
else
  while IFS= read -r file; do
    if is_ui_file "$file"; then
      files+=("$file")
    fi
  done < <(git -C "$repo_root" diff --name-only --cached --diff-filter=ACMR)
fi

if [[ ${#files[@]} -eq 0 ]]; then
  echo "UI guidelines check: no changed UI files to inspect."
  exit 0
fi

warn_count=0
error_count=0
component_update_required=0
pattern_update_required=0

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

  if rg -n 'style=\{\{' "$abs" >/dev/null 2>&1; then
    warn "$rel uses inline styles. Legacy is tolerated, but new or repeated patterns should be normalized into documented classes/components."
  fi

  if rg -n 'console\.error\(' "$abs" >/dev/null 2>&1; then
    if ! rg -n 'error|setError|errorMessage|ErrorState|retry|No se pudo|Server Error|success|set.*Message|formMessage|editMessage|categoryMessage' "$abs" >/dev/null 2>&1; then
      error "$rel logs errors but does not show an obvious UI-facing error or feedback state."
    fi
  fi

  if rg -n 'apiRequest<|apiRequest\(' "$abs" >/dev/null 2>&1; then
    if ! rg -n 'loading|setLoading|Loading|empty|No .* found|No .* yet|error|setError|success|set.*Message|formMessage|editMessage|categoryMessage' "$abs" >/dev/null 2>&1; then
      error "$rel performs data fetching or mutation without clear evidence of required UI states."
    fi
  fi

  if [[ "$rel" == src/app/*/page.tsx || "$rel" == src/app/\(dashboard\)/*/page.tsx ]]; then
    if rg -n 'apiRequest<|apiRequest\(' "$abs" >/dev/null 2>&1; then
      for state in loading empty error success; do
        case "$state" in
          loading)
            if ! rg -n 'loading|setLoading|Loading' "$abs" >/dev/null 2>&1; then
              error "$rel is a view with data flow but does not show evidence of a loading state."
            fi
            ;;
          empty)
            if ! rg -n 'No .* found|No .* yet|empty|No tasks|No content|No reservations|No expenses' "$abs" >/dev/null 2>&1; then
              error "$rel is a view with data flow but does not show evidence of an empty state."
            fi
            ;;
          error)
            if ! rg -n 'error|setError|No se pudo|Server Error|ErrorState|retry' "$abs" >/dev/null 2>&1; then
              error "$rel is a view with data flow but does not show evidence of an error state."
            fi
            ;;
          success)
            if ! rg -n 'success|correctamente|set.*Message|formMessage|editMessage|categoryMessage|toast' "$abs" >/dev/null 2>&1; then
              warn "$rel does not show obvious success feedback. CRUD views should define success feedback explicitly."
            fi
            ;;
        esac
      done
    fi
  fi

  if [[ "$rel" == src/components/* && "$rel" == *.tsx ]]; then
    component_name="$(basename "$rel" .tsx)"
    if ! rg -n "^## Component: .*${component_name}|Path: \`$rel\`" "$catalog_file" >/dev/null 2>&1; then
      error "$rel looks like a reusable component but is missing from component-catalog.md."
      component_update_required=1
    fi
  fi

  if [[ "$rel" == src/app/*/page.tsx || "$rel" == src/app/\(dashboard\)/*/page.tsx ]]; then
    if rg -n 'apiRequest<|apiRequest\(' "$abs" >/dev/null 2>&1; then
      if ! rg -n 'CRUD|finance|tasks|social|form \+ table|form \+ cards|inline edit \+ list' "$patterns_file" >/dev/null 2>&1; then
        error "View patterns documentation is missing CRUD guidance."
        pattern_update_required=1
      fi
    fi
  fi
done

if [[ $component_update_required -eq 1 ]]; then
  error "A new reusable component was detected without an update to the skill catalog."
fi

if [[ $pattern_update_required -eq 1 ]]; then
  error "A view pattern update is required in the skill references."
fi

if [[ $error_count -gt 0 ]]; then
  echo "UI guidelines check failed with $error_count error(s) and $warn_count warning(s)." >&2
  exit 1
fi

echo "UI guidelines check passed with $warn_count warning(s)."
