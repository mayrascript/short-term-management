#!/usr/bin/env bash

set -euo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

if [[ -x "$repo_root/scripts/check-firestore-guidelines.sh" ]]; then
  exec "$repo_root/scripts/check-firestore-guidelines.sh" "$@"
fi

echo "Repository script not found: $repo_root/scripts/check-firestore-guidelines.sh" >&2
exit 1
