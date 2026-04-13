#!/usr/bin/env bash
# Claude Code PostToolUse hook for Edit | Write.
# Reads the tool payload from stdin, extracts the file_path, and delegates
# the "must have a matching test" rule to scripts/check-tests.mjs.
#
# Exit 0: allow. Exit 2: block and send feedback to Claude.

set -euo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$ROOT"

# Read the JSON payload Claude Code sends on stdin.
PAYLOAD="$(cat)"

# Extract file_path without depending on jq (it may not be installed).
FILE_PATH="$(
  node -e '
    let data = "";
    process.stdin.on("data", c => (data += c));
    process.stdin.on("end", () => {
      try {
        const j = JSON.parse(data);
        const p =
          (j.tool_input && (j.tool_input.file_path || j.tool_input.filePath)) ||
          "";
        process.stdout.write(p);
      } catch {
        process.stdout.write("");
      }
    });
  ' <<<"$PAYLOAD"
)"

# No file path → nothing to check (tool was something else, or payload shape changed).
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Run the shared checker against just this file.
if node "$ROOT/scripts/check-tests.mjs" --quiet "$FILE_PATH"; then
  exit 0
fi

# check-tests.mjs already printed the actionable error on stderr.
# Exit 2 signals Claude to read the stderr feedback and act.
exit 2
