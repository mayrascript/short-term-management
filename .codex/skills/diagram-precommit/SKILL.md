---
name: diagram-precommit
description: Validate Mermaid diagrams before commit, regenerate SVG artifacts from docs/diagramas/*.mmd, and keep the rendered outputs staged for the commit.
---

# Diagram Pre-commit

Use this skill when working with versioned Mermaid diagrams in this repository and you need to verify that rendered SVG artifacts are current before committing.

## Purpose

This repository treats:

- `docs/diagramas/*.mmd` as the source of truth
- `docs/diagramas/svg/*.svg` as versioned rendered artifacts

The goal of this skill is to make sure every Mermaid source diagram:

1. compiles successfully
2. has an up-to-date SVG render
3. is staged correctly before the commit completes

## Scope

This skill applies only to:

- `docs/diagramas/*.mmd`

It must ignore:

- `docs/diagramas/README.md`
- anything inside `docs/diagramas/svg/`
- legacy diagrams outside `docs/diagramas/`

## Repository Workflow

Use the repository script:

```bash
./scripts/check-diagrams.sh
```

Or via package script:

```bash
npm run diagrams:check
```

The script is responsible for:

- discovering Mermaid source files
- creating `docs/diagramas/svg/` if missing
- rendering each `.mmd` to `.svg`
- failing on Mermaid syntax/render errors
- staging generated SVG files with Git

## Pre-commit Contract

The local Git hook `.git/hooks/pre-commit` must run the diagram check before allowing a commit to proceed.

Expected behavior:

- if Mermaid compilation fails, abort the commit
- if rendering succeeds, refresh SVG outputs
- automatically `git add` rendered SVG files

## Operational Guidance

- Treat `.mmd` as editable source; do not hand-edit generated `.svg` files.
- When diagram content changes, rerun the script before commit if you want to preview results early.
- If a commit fails due to Mermaid syntax, fix the `.mmd` source rather than bypassing the hook.
- Do not render diagrams to temporary output as the primary workflow; repository output belongs in `docs/diagramas/svg/`.
