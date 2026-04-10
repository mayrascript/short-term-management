#!/usr/bin/env bash

set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
source_dir="$repo_root/docs/diagramas"
output_dir="$source_dir/svg"

if [[ ! -d "$source_dir" ]]; then
  echo "Diagram source directory not found: $source_dir" >&2
  exit 1
fi

mkdir -p "$output_dir"

diagram_files=()
while IFS= read -r file; do
  diagram_files+=("$file")
done < <(find "$source_dir" -maxdepth 1 -type f -name '*.mmd' | sort)

if [[ ${#diagram_files[@]} -eq 0 ]]; then
  echo "No Mermaid source files found in $source_dir" >&2
  exit 0
fi

echo "Checking Mermaid diagrams..."

for diagram in "${diagram_files[@]}"; do
  base_name="$(basename "$diagram" .mmd)"
  output_file="$output_dir/$base_name.svg"

  echo "  - Rendering $base_name.mmd"
  npx -y @mermaid-js/mermaid-cli -i "$diagram" -o "$output_file"
done

git -C "$repo_root" add "$output_dir"/*.svg

echo "Mermaid diagrams validated and SVG outputs staged."
